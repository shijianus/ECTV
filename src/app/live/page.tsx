'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Suspense, useEffect, useMemo, useState } from 'react';

import BottomNav from '@/components/ectv/BottomNav';
import EmptyState from '@/components/ectv/EmptyState';
import Footer from '@/components/ectv/Footer';
import TopNav from '@/components/ectv/TopNav';
import { fetchJson, toPlayableUrl } from '@/components/ectv/ectv-api';

const PlayerView = dynamic(() => import('@/components/ectv/PlayerView'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-card rounded-2xl border border-edge/40 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-brand-500/30 border-t-brand-400 animate-spin" />
        <p className="text-xs text-dim">播放器載入中…</p>
      </div>
    </div>
  ),
});

interface LiveSourceDto {
  key: string;
  name: string;
  disabled?: boolean;
}

interface LiveChannel {
  id: string;
  tvgId: string;
  name: string;
  logo: string;
  group: string;
  url: string;
}

function groupOf(c: LiveChannel) {
  return c.group?.trim() || '未分組';
}

function LiveView() {
  const [sources, setSources] = useState<LiveSourceDto[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [sourcesError, setSourcesError] = useState('');
  const [sourceKey, setSourceKey] = useState('');

  const [channels, setChannels] = useState<LiveChannel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [channelsError, setChannelsError] = useState('');
  const [channelId, setChannelId] = useState('');
  const [query, setQuery] = useState('');

  /* 取直播源列表 */
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchJson<{ success: boolean; data: LiveSourceDto[] }>('/api/live/sources');
        const list = (data.data ?? []).filter((s) => !s.disabled && s.key);
        setSources(list);
        if (list.length > 0) setSourceKey(list[0].key);
      } catch (e) {
        setSourcesError(e instanceof Error ? e.message : '載入失敗');
      } finally {
        setSourcesLoading(false);
      }
    })();
  }, []);

  /* 取頻道列表 */
  useEffect(() => {
    if (!sourceKey) return;
    setChannelsLoading(true);
    setChannelsError('');
    setChannels([]);
    setChannelId('');
    (async () => {
      try {
        const data = await fetchJson<{ success: boolean; data: LiveChannel[] }>(
          `/api/live/channels?source=${encodeURIComponent(sourceKey)}`
        );
        const list = (data.data ?? []).filter((c) => c.url);
        setChannels(list);
        if (list.length > 0) setChannelId(list[0].id || list[0].name);
      } catch (e) {
        setChannelsError(e instanceof Error ? e.message : '載入失敗');
      } finally {
        setChannelsLoading(false);
      }
    })();
  }, [sourceKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return channels;
    return channels.filter((c) => c.name.toLowerCase().includes(q));
  }, [channels, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, LiveChannel[]>();
    for (const c of filtered) {
      const g = groupOf(c);
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(c);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const current = channels.find((c) => (c.id || c.name) === channelId) ?? null;
  const playable = current ? toPlayableUrl(current.url, 'live') : null;

  return (
    <div className="min-h-screen bg-abyss bg-abyss-glow text-mist pb-24 md:pb-0">
      <TopNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-28">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">電視直播</h1>
          <p className="text-sm text-fog mt-1">選擇頻道即時換台</p>
        </div>

        {sourcesLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 rounded-full border-2 border-brand-500/30 border-t-brand-400 animate-spin" />
          </div>
        ) : sourcesError ? (
          <div className="flex flex-col items-center py-20 text-center">
            <p className="text-fog mb-4">載入失敗：{sourcesError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full bg-brand-gradient text-abyss text-sm font-bold hover:brightness-110 transition"
            >
              重新載入
            </button>
          </div>
        ) : sources.length === 0 ? (
          <EmptyState
            title="暫無直播源"
            hint="還沒有配置任何電視直播源。直播功能即將上線，敬請期待。"
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 右側：播放器（手機上置頂） */}
            <div className="flex-1 min-w-0 order-1">
              {/* 直播源切換 */}
              {sources.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {sources.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setSourceKey(s.key)}
                      className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                        s.key === sourceKey
                          ? 'border-brand-500/60 bg-brand-500/15 text-mist font-medium'
                          : 'border-edge/60 bg-surface/60 text-fog hover:border-brand-500/40 hover:text-mist'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}

              {playable && current ? (
                <>
                  <PlayerView
                    url={playable.url}
                    title={current.name}
                    isM3u8={playable.isM3u8}
                  />
                  <div className="flex items-center gap-3 mt-4">
                    {current.logo ? (
                      <Image
                        src={current.logo}
                        alt={current.name}
                        width={40}
                        height={40}
                        className="rounded-lg bg-card object-contain"
                        unoptimized
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-card border border-edge/50 flex items-center justify-center text-brand-400 font-bold">
                        {current.name.slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold">{current.name}</p>
                      <p className="text-xs text-dim flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        正在直播
                        {groupOf(current) !== '未分組' && ` · ${groupOf(current)}`}
                      </p>
                    </div>
                  </div>
                </>
              ) : channelsLoading ? (
                <div className="w-full aspect-video bg-card rounded-2xl border border-edge/40 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-2 border-brand-500/30 border-t-brand-400 animate-spin" />
                </div>
              ) : (
                <div className="w-full aspect-video bg-card rounded-2xl border border-edge/40 flex items-center justify-center">
                  <p className="text-sm text-dim">
                    {channelsError ? `頻道載入失敗：${channelsError}` : '暫無可播放頻道'}
                  </p>
                </div>
              )}
            </div>

            {/* 左側：頻道列表 */}
            <aside className="w-full lg:w-80 shrink-0 order-2">
              <div className="rounded-2xl border border-edge/60 bg-surface/60 overflow-hidden lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] flex flex-col">
                <div className="p-3 border-b border-edge/50">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="搜尋頻道…"
                    className="w-full rounded-xl bg-abyss border border-edge/60 px-4 py-2.5 text-base text-mist placeholder:text-dim outline-none focus:border-brand-500 transition"
                  />
                </div>
                <div className="overflow-y-auto p-2 grow">
                  {channelsLoading ? (
                    <div className="space-y-2 p-2">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-11 rounded-xl bg-card animate-pulse" />
                      ))}
                    </div>
                  ) : grouped.length === 0 ? (
                    <p className="text-sm text-dim text-center py-10">
                      {query ? '沒有符合的頻道' : '這個直播源暫無頻道'}
                    </p>
                  ) : (
                    grouped.map(([g, list]) => (
                      <div key={g} className="mb-1">
                        <p className="px-3 pt-2 pb-1 text-[11px] font-medium text-dim uppercase tracking-wider">
                          {g} · {list.length}
                        </p>
                        {list.map((c) => {
                          const cid = c.id || c.name;
                          const active = cid === channelId;
                          return (
                            <button
                              key={cid}
                              onClick={() => setChannelId(cid)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                                active
                                  ? 'bg-brand-500/15 border border-brand-500/50'
                                  : 'border border-transparent hover:bg-white/[0.04]'
                              }`}
                            >
                              {c.logo ? (
                                <Image
                                  src={c.logo}
                                  alt=""
                                  width={28}
                                  height={28}
                                  className="rounded-md bg-card object-contain shrink-0"
                                  unoptimized
                                />
                              ) : (
                                <span className="w-7 h-7 rounded-md bg-card border border-edge/50 flex items-center justify-center text-[11px] text-brand-400 font-bold shrink-0">
                                  {c.name.slice(0, 1)}
                                </span>
                              )}
                              <span
                                className={`text-sm truncate flex-1 ${active ? 'text-mist font-medium' : 'text-fog'}`}
                              >
                                {c.name}
                              </span>
                              {active && (
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

export default function LivePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-abyss flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-brand-500/30 border-t-brand-400 animate-spin" />
        </div>
      }
    >
      <LiveView />
    </Suspense>
  );
}
