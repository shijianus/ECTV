'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import BottomNav from '@/components/ectv/BottomNav';
import EmptyState from '@/components/ectv/EmptyState';
import EpisodeGrid from '@/components/ectv/EpisodeGrid';
import Footer from '@/components/ectv/Footer';
import PosterCard from '@/components/ectv/PosterCard';
import TopNav from '@/components/ectv/TopNav';
import {
  detailHref,
  fetchJson,
  makeKey,
  playHref,
  resolveDetail,
  type DetailData,
  type DoubanDetail,
  type PlayRecordDto,
  type SearchResultItem,
} from '@/components/ectv/ectv-api';

/* ---------- 播放線路 ---------- */

function SourceList({
  candidates,
  currentSource,
  title,
}: {
  candidates: SearchResultItem[];
  currentSource: string;
  title: string;
}) {
  if (candidates.length === 0) return null;
  return (
    <div className="space-y-2">
      {candidates.map((c) => {
        const active = c.source === currentSource;
        return (
          <Link
            key={c.source}
            href={detailHref(c.id, c.source, title)}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border text-left transition-all ${
              active
                ? 'bg-brand-500/10 border-brand-500/50 shadow-[0_0_16px_rgba(46,124,246,0.2)]'
                : 'bg-surface/50 border-edge/70 hover:border-brand-500/40'
            }`}
          >
            <span className="flex items-center gap-3">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-brand-400 shadow-[0_0_8px_rgba(46,124,246,0.9)]' : 'bg-dim'}`}
              />
              <span className={`text-sm font-medium ${active ? 'text-mist' : 'text-fog'}`}>
                {c.source_name}
              </span>
              {active && (
                <span className="text-[10px] text-brand-300 bg-brand-500/15 px-1.5 py-0.5 rounded">
                  當前
                </span>
              )}
            </span>
            <span className="text-xs text-dim">{c.year || c.type_name}</span>
          </Link>
        );
      })}
    </div>
  );
}

/* ---------- 詳情主體 ---------- */

function DetailView() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get('id') ?? '';
  const source = params.get('source') ?? '';
  const titleParam = params.get('title') ?? '';

  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [candidates, setCandidates] = useState<SearchResultItem[]>([]);
  const [autoResolved, setAutoResolved] = useState(false);
  const [douban, setDouban] = useState<DoubanDetail | null>(null);
  const [descOpen, setDescOpen] = useState(false);
  const [faved, setFaved] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const [record, setRecord] = useState<PlayRecordDto | null>(null);
  const [loadingLines, setLoadingLines] = useState(false);
  const [recommend, setRecommend] = useState<{ id: string; title: string; poster: string; rate: string; year: string }[]>([]);

  const key = useMemo(
    () => (detail ? makeKey(detail.source, detail.id) : ''),
    [detail]
  );

  // 取詳情（含 douban 降級自動匹配線路）
  useEffect(() => {
    if (!id || !source) {
      setStatus('error');
      setError('缺少影片參數');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    (async () => {
      try {
        const r = await resolveDetail(id, source, titleParam || undefined);
        if (cancelled) return;
        setDetail(r.detail);
        setCandidates(r.candidates);
        setAutoResolved(r.autoResolved);
        setStatus('done');
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '載入失敗');
          setStatus('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, source, titleParam]);

  // 豆瓣元數據補強＋收藏狀態＋播放記錄＋同類推薦
  useEffect(() => {
    if (!detail) return;
    let cancelled = false;
    (async () => {
      // 豆瓣詳情
      if (detail.douban_id) {
        try {
          const d = await fetchJson<DoubanDetail>(`/api/douban/detail?id=${detail.douban_id}`);
          if (!cancelled) setDouban(d);
        } catch {
          /* 忽略：用 CMS 自帶簡介兜底 */
        }
      }
      // 收藏狀態
      try {
        const fav = await fetchJson<unknown>(`/api/favorites?key=${encodeURIComponent(key)}`);
        if (!cancelled) setFaved(!!fav);
      } catch {
        /* 未登入時忽略 */
      }
      // 播放記錄（斷點續播）
      try {
        const recs = await fetchJson<Record<string, PlayRecordDto>>('/api/playrecords');
        if (!cancelled) setRecord(recs[key] ?? null);
      } catch {
        /* 忽略 */
      }
      // 同類推薦：按類型取豆瓣熱門
      try {
        const isTv = (detail.type_name || '').includes('劇') || (detail.type_name || '').includes('綜') || detail.episodes.length > 1;
        const data = await fetchJson<{ list: { id: string; title: string; poster: string; rate: string; year: string }[] }>(
          `/api/douban?type=${isTv ? 'tv' : 'movie'}&tag=熱門&pageSize=12`
        );
        if (!cancelled) {
          setRecommend((data.list ?? []).filter((x) => x.title !== detail.title).slice(0, 12));
        }
      } catch {
        /* 忽略 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [detail, key]);

  const toggleFav = useCallback(async () => {
    if (!detail || favBusy) return;
    setFavBusy(true);
    try {
      if (faved) {
        await fetchJson(`/api/favorites?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
        setFaved(false);
      } else {
        await fetchJson('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key,
            favorite: {
              source_name: detail.source_name,
              total_episodes: detail.episodes.length,
              title: detail.title,
              year: detail.year,
              cover: detail.poster,
              save_time: Date.now(),
              search_title: detail.title,
            },
          }),
        });
        setFaved(true);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : '操作失敗');
    } finally {
      setFavBusy(false);
    }
  }, [detail, faved, favBusy, key]);

  const switchLines = useCallback(async () => {
    if (!detail || loadingLines) return;
    setLoadingLines(true);
    try {
      const data = await fetchJson<{ results: SearchResultItem[] }>(
        `/api/search?q=${encodeURIComponent(detail.title)}`
      );
      const seen = new Set<string>();
      setCandidates(
        (data.results ?? []).filter((r) => {
          if (seen.has(r.source)) return false;
          seen.add(r.source);
          return true;
        })
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : '搜尋線路失敗');
    } finally {
      setLoadingLines(false);
    }
  }, [detail, loadingLines]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-abyss text-mist">
        <TopNav />
        <div className="pt-24 px-4 sm:px-6 max-w-[1100px] mx-auto animate-pulse">
          <div className="h-[320px] rounded-3xl bg-card border border-edge/50" />
          <div className="flex gap-6 mt-8">
            <div className="w-40 aspect-[2/3] rounded-2xl bg-card shrink-0" />
            <div className="flex-1 space-y-3 pt-2">
              <div className="h-8 rounded bg-card w-1/2" />
              <div className="h-4 rounded bg-card w-1/3" />
              <div className="h-4 rounded bg-card w-2/3" />
              <div className="h-4 rounded bg-card w-1/2" />
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (status === 'error' || !detail) {
    return (
      <div className="min-h-screen bg-abyss text-mist">
        <TopNav />
        <div className="pt-24">
          <EmptyState title="載入詳情失敗" hint={error || '請稍後重試'} />
          <div className="text-center">
            <button
              onClick={() => router.back()}
              className="text-sm text-brand-300 border border-brand-500/40 rounded-full px-6 py-2 hover:bg-brand-500/10 transition-colors"
            >
              ← 返回
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const totalEps = detail.episodes.length;
  const resumeEp = record && record.index >= 1 && record.index <= totalEps ? record.index : 1;
  const rating = douban?.rating?.value ? douban.rating.value.toFixed(1) : '';
  const desc = (douban?.intro || detail.desc || '').trim();
  const genres = douban?.genres ?? [];
  const directors = (douban?.directors ?? []).map((d) => d.name);
  const actors = (douban?.actors ?? []).map((d) => d.name).slice(0, 8);

  return (
    <div className="min-h-screen bg-abyss text-mist">
      <TopNav />

      {/* 頂部背景：海報模糊＋漸層 */}
      <div className="relative">
        <div className="absolute inset-0 h-[380px] sm:h-[440px] overflow-hidden">
          {detail.poster && (
            <Image
              src={detail.poster}
              alt=""
              fill
              className="object-cover blur-2xl scale-110 opacity-40"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-abyss/40 via-abyss/70 to-abyss" />
          <div className="absolute inset-0 bg-abyss-glow opacity-60" />
        </div>

        <main className="relative pt-24 pb-24 md:pb-16 px-4 sm:px-6">
          <div className="mx-auto max-w-[1100px]">
            <button
              onClick={() => router.back()}
              className="mb-6 inline-flex items-center gap-2 text-sm text-fog hover:text-mist bg-surface/60 border border-edge rounded-full px-4 py-1.5 backdrop-blur transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>

            {/* 資訊區 */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              <div className="relative w-36 sm:w-52 shrink-0 mx-auto sm:mx-0">
                <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-card border border-edge/60 shadow-[0_20px_60px_rgba(3,8,20,0.7)]">
                  {detail.poster ? (
                    <Image src={detail.poster} alt={detail.title} fill className="object-cover" priority />
                  ) : (
                    <div className="absolute inset-0 bg-abyss-glow flex items-center justify-center p-4">
                      <span className="text-dim text-sm text-center">{detail.title}</span>
                    </div>
                  )}
                </div>
                {rating && (
                  <span className="absolute -top-2 -right-2 text-sm font-bold text-amber-300 bg-abyss/85 backdrop-blur px-2 py-1 rounded-lg border border-mist/15 shadow-lg">
                    ★ {rating}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h1 className="text-2xl sm:text-4xl font-bold text-mist leading-tight">{detail.title}</h1>

                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                  {detail.year && (
                    <span className="text-fog bg-surface/70 border border-edge px-2.5 py-1 rounded-full">{detail.year}</span>
                  )}
                  {detail.type_name && (
                    <span className="text-fog bg-surface/70 border border-edge px-2.5 py-1 rounded-full">{detail.type_name}</span>
                  )}
                  {totalEps > 1 && (
                    <span className="text-fog bg-surface/70 border border-edge px-2.5 py-1 rounded-full">共 {totalEps} 集</span>
                  )}
                  <span className="text-accent-400 bg-accent-400/10 border border-accent-400/25 px-2.5 py-1 rounded-full">
                    {detail.source_name}
                  </span>
                  {genres.map((g) => (
                    <span key={g} className="text-fog bg-surface/70 border border-edge px-2.5 py-1 rounded-full">{g}</span>
                  ))}
                </div>

                {(directors.length > 0 || actors.length > 0) && (
                  <p className="mt-3 text-xs text-dim leading-relaxed">
                    {directors.length > 0 && <>導演：{directors.join(' / ')}　</>}
                    {actors.length > 0 && <>主演：{actors.join(' / ')}</>}
                  </p>
                )}

                {desc && (
                  <div className="mt-3">
                    <p className={`text-sm text-fog leading-relaxed ${descOpen ? '' : 'line-clamp-3'}`}>{desc}</p>
                    {desc.length > 120 && (
                      <button onClick={() => setDescOpen((v) => !v)} className="mt-1 text-xs text-brand-300 hover:text-brand-200">
                        {descOpen ? '收起 ↑' : '展開 ↓'}
                      </button>
                    )}
                  </div>
                )}

                {autoResolved && (
                  <p className="mt-3 text-xs text-accent-400/90">
                    ✦ 已自動為你匹配到可播放片源（下方可切換線路）
                  </p>
                )}

                {/* 操作按鈕 */}
                <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <Link
                    href={playHref(detail.id, detail.source, resumeEp, detail.title)}
                    className="inline-flex items-center gap-2 bg-brand-gradient text-white font-bold text-sm px-8 py-3 rounded-full shadow-[0_8px_28px_rgba(46,124,246,0.5)] hover:brightness-110 hover:scale-[1.03] active:scale-95 transition-all"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M6 4l12 6-12 6V4z" />
                    </svg>
                    {record ? `繼續播放 第 ${resumeEp} 集` : '立即播放'}
                  </Link>
                  <button
                    onClick={toggleFav}
                    disabled={favBusy}
                    className={`inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full border transition-all active:scale-95 ${
                      faved
                        ? 'text-amber-300 border-amber-300/40 bg-amber-300/10'
                        : 'text-fog border-edge hover:text-mist hover:border-brand-500/60'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={faved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    {faved ? '已收藏' : '收藏'}
                  </button>
                </div>
              </div>
            </div>

            {/* 播放線路 */}
            <section className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-mist flex items-center gap-2.5">
                  <span
                    className="inline-block w-8 h-3.5 rounded-[3px] opacity-70"
                    style={{ backgroundImage: 'repeating-linear-gradient(90deg, #2E7CF6 0px, #2E7CF6 5px, transparent 5px, transparent 10px)' }}
                    aria-hidden
                  />
                  播放線路
                </h2>
                <button
                  onClick={switchLines}
                  disabled={loadingLines}
                  className="text-xs text-brand-300 border border-brand-500/40 rounded-full px-4 py-1.5 hover:bg-brand-500/10 transition-colors disabled:opacity-50"
                >
                  {loadingLines ? '搜尋中…' : candidates.length > 0 ? '重新搜尋' : '換線路'}
                </button>
              </div>
              {candidates.length > 0 ? (
                <SourceList candidates={candidates} currentSource={detail.source} title={detail.title} />
              ) : (
                <p className="text-xs text-dim">當前線路：{detail.source_name}。點右上「換線路」搜尋同一影片的其他片源。</p>
              )}
            </section>

            {/* 選集 */}
            {totalEps > 0 && (
              <section className="mt-10">
                <h2 className="text-lg font-bold text-mist flex items-center gap-2.5 mb-4">
                  <span
                    className="inline-block w-8 h-3.5 rounded-[3px] opacity-70"
                    style={{ backgroundImage: 'repeating-linear-gradient(90deg, #22D3EE 0px, #22D3EE 5px, transparent 5px, transparent 10px)' }}
                    aria-hidden
                  />
                  選集
                  <span className="text-xs font-normal text-dim">共 {totalEps} 集</span>
                </h2>
                <EpisodeGrid
                  total={totalEps}
                  titles={detail.episodes_titles}
                  hrefFor={(n) => playHref(detail.id, detail.source, n, detail.title)}
                  current={record ? resumeEp : undefined}
                />
              </section>
            )}

            {/* 同類推薦 */}
            {recommend.length > 0 && (
              <section className="mt-12">
                <h2 className="text-lg font-bold text-mist flex items-center gap-2.5 mb-4">
                  <span
                    className="inline-block w-8 h-3.5 rounded-[3px] opacity-70"
                    style={{ backgroundImage: 'repeating-linear-gradient(90deg, #2E7CF6 0px, #2E7CF6 5px, transparent 5px, transparent 10px)' }}
                    aria-hidden
                  />
                  同類推薦
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {recommend.map((r) => (
                    <PosterCard
                      key={r.id}
                      item={{ id: r.id, title: r.title, poster: r.poster, rate: r.rate, year: r.year }}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
}

export default function DetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-abyss" />}>
      <DetailView />
    </Suspense>
  );
}
