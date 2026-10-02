'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';

import BottomNav from '@/components/ectv/BottomNav';
import EmptyState from '@/components/ectv/EmptyState';
import Footer from '@/components/ectv/Footer';
import TopNav from '@/components/ectv/TopNav';
import {
  detailHref,
  fetchJson,
  splitKey,
  type FavoriteDto,
  type PlayRecordDto,
} from '@/components/ectv/ectv-api';

type Tab = 'favorites' | 'history';

function progressOf(r: PlayRecordDto): number {
  if (!r.total_time || r.total_time <= 0) return 0;
  return Math.min(100, Math.max(0, (r.play_time / r.total_time) * 100));
}

function fmtTime(sec: number): string {
  if (!sec || sec <= 0) return '00:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return `${h > 0 ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[2/3] rounded-2xl bg-card border border-edge/50" />
          <div className="mt-2 h-4 rounded bg-card w-3/4" />
        </div>
      ))}
    </div>
  );
}

function WatchlistView() {
  const [tab, setTab] = useState<Tab>('favorites');
  const [favs, setFavs] = useState<{ key: string; fav: FavoriteDto }[] | null>(null);
  const [hist, setHist] = useState<{ key: string; rec: PlayRecordDto }[] | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [f, h] = await Promise.all([
          fetchJson<Record<string, FavoriteDto>>('/api/favorites'),
          fetchJson<Record<string, PlayRecordDto>>('/api/playrecords'),
        ]);
        if (cancelled) return;
        setFavs(
          Object.entries(f)
            .map(([key, fav]) => ({ key, fav }))
            .sort((a, b) => b.fav.save_time - a.fav.save_time)
        );
        setHist(
          Object.entries(h)
            .map(([key, rec]) => ({ key, rec }))
            .sort((a, b) => b.rec.save_time - a.rec.save_time)
        );
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : '載入失敗');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const removeFav = useCallback(async (key: string) => {
    setFavs((prev) => (prev ? prev.filter((x) => x.key !== key) : prev));
    try {
      await fetchJson(`/api/favorites?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
    } catch {
      /* 本地已移除 */
    }
  }, []);

  const removeRec = useCallback(async (key: string) => {
    setHist((prev) => (prev ? prev.filter((x) => x.key !== key) : prev));
    try {
      await fetchJson(`/api/playrecords?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
    } catch {
      /* 本地已移除 */
    }
  }, []);

  const clearHist = useCallback(async () => {
    if (!confirm('確定要清空全部觀看記錄嗎？')) return;
    setHist([]);
    try {
      await fetchJson('/api/playrecords', { method: 'DELETE' });
    } catch {
      /* 本地已清空 */
    }
  }, []);

  const loading = favs === null || hist === null;

  return (
    <div className="min-h-screen bg-abyss text-mist">
      <TopNav />

      <main className="pt-24 pb-24 md:pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-[1400px]">
          <h1 className="text-2xl sm:text-3xl font-bold text-mist">我的片單</h1>
          <p className="text-sm text-dim mt-1">收藏與觀看歷史，只屬於你</p>

          {/* Tabs */}
          <div className="mt-6 inline-flex bg-surface/70 border border-edge rounded-full p-1">
            {(
              [
                { id: 'favorites', label: `收藏${favs ? ` · ${favs.length}` : ''}` },
                { id: 'history', label: `歷史${hist ? ` · ${hist.length}` : ''}` },
              ] as { id: Tab; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`text-sm font-semibold px-6 py-2 rounded-full transition-all ${
                  tab === t.id
                    ? 'bg-brand-gradient text-white shadow-[0_4px_16px_rgba(46,124,246,0.45)]'
                    : 'text-fog hover:text-mist'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-8">
            {err && (
              <div className="text-center py-16">
                <p className="text-lg font-bold text-mist">載入失敗</p>
                <p className="text-sm text-fog mt-2">{err}</p>
              </div>
            )}

            {!err && loading && <SkeletonGrid />}

            {/* 收藏 Tab */}
            {!err && !loading && tab === 'favorites' && (
              <>
                {favs!.length === 0 ? (
                  <EmptyState
                    title="還沒有收藏"
                    hint="在影片詳情頁點「收藏」，喜歡的影片就會出現在這裡。"
                  />
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {favs!.map(({ key, fav }) => {
                      const { source, id } = splitKey(key);
                      return (
                        <div key={key} className="group relative">
                          <Link
                            href={detailHref(id, source, fav.title)}
                            className="block"
                            title={fav.title}
                          >
                            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-card border border-edge/50 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-brand-500/50 group-hover:shadow-[0_16px_44px_rgba(46,124,246,0.35)]">
                              {fav.cover ? (
                                <Image
                                  src={fav.cover}
                                  alt={fav.title}
                                  fill
                                  sizes="(max-width: 640px) 40vw, 15vw"
                                  className="object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="absolute inset-0 bg-abyss-glow flex items-center justify-center p-3">
                                  <span className="text-dim text-xs text-center line-clamp-2">{fav.title}</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-abyss/85 via-transparent to-transparent" />
                              <div className="absolute bottom-0 inset-x-0 p-2.5">
                                <p className="text-sm text-mist font-medium truncate">{fav.title}</p>
                                <p className="text-[11px] text-dim mt-0.5 truncate">
                                  {fav.source_name}
                                  {fav.total_episodes > 1 ? ` · 共${fav.total_episodes}集` : ''}
                                </p>
                              </div>
                            </div>
                          </Link>
                          <button
                            onClick={() => removeFav(key)}
                            aria-label={`取消收藏 ${fav.title}`}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-abyss/70 backdrop-blur border border-mist/15 text-fog flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-mist hover:border-red-400/60 transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* 歷史 Tab */}
            {!err && !loading && tab === 'history' && (
              <>
                {hist!.length === 0 ? (
                  <EmptyState
                    title="還沒有觀看記錄"
                    hint="看過的影片會自動記錄在這裡，隨時斷點續播。"
                  />
                ) : (
                  <>
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={clearHist}
                        className="text-xs text-dim hover:text-red-300 border border-edge hover:border-red-400/50 rounded-full px-4 py-1.5 transition-colors"
                      >
                        清空全部記錄
                      </button>
                    </div>
                    <div className="space-y-3">
                      {hist!.map(({ key, rec }) => {
                        const pct = progressOf(rec);
                        return (
                          <div
                            key={key}
                            className="group flex gap-4 bg-card/60 border border-edge/60 rounded-2xl p-3 hover:border-brand-500/40 transition-all"
                          >
                            <Link
                              href={`/play?id=${encodeURIComponent(key)}&source=${encodeURIComponent(rec.source_name)}`}
                              className="relative w-36 sm:w-48 aspect-video rounded-xl overflow-hidden bg-deep shrink-0"
                            >
                              {rec.cover ? (
                                <Image src={rec.cover} alt={rec.title} fill sizes="200px" className="object-cover" loading="lazy" />
                              ) : (
                                <div className="absolute inset-0 bg-abyss-glow" />
                              )}
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="w-10 h-10 rounded-full bg-abyss/60 backdrop-blur border border-mist/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <svg className="w-4 h-4 fill-mist translate-x-[1px]" viewBox="0 0 20 20">
                                    <path d="M6 4l12 6-12 6V4z" />
                                  </svg>
                                </span>
                              </span>
                            </Link>
                            <div className="flex-1 min-w-0 py-1">
                              <Link href={`/play?id=${encodeURIComponent(key)}&source=${encodeURIComponent(rec.source_name)}`}>
                                <p className="text-sm sm:text-base text-mist font-semibold truncate hover:text-brand-300 transition-colors">
                                  {rec.title}
                                </p>
                              </Link>
                              <p className="text-xs text-dim mt-1">
                                {rec.total_episodes > 1 ? `第 ${rec.index} 集 / 共 ${rec.total_episodes} 集 · ` : ''}
                                看到 {fmtTime(rec.play_time)}
                                {rec.total_time > 0 ? ` / ${fmtTime(rec.total_time)}` : ''}
                              </p>
                              <div className="mt-2.5 h-1 rounded-full bg-edge/70 overflow-hidden max-w-xs">
                                <div
                                  className="h-full rounded-full bg-brand-gradient shadow-[0_0_8px_rgba(46,124,246,0.8)]"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => removeRec(key)}
                              aria-label={`刪除記錄 ${rec.title}`}
                              className="self-start w-8 h-8 rounded-full text-dim hover:text-red-300 hover:bg-red-400/10 flex items-center justify-center transition-all shrink-0"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.9 12.1A2 2 0 0116.1 21H7.9a2 2 0 01-2-1.9L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

export default function WatchlistPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-abyss" />}>
      <WatchlistView />
    </Suspense>
  );
}
