'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import BottomNav from '@/components/ectv/BottomNav';
import EmptyState from '@/components/ectv/EmptyState';
import EpisodeGrid from '@/components/ectv/EpisodeGrid';
import TopNav from '@/components/ectv/TopNav';
import {
  detailHref,
  fetchJson,
  makeKey,
  playHref,
  resolveDetail,
  splitKey,
  toPlayableUrl,
  type DetailData,
  type PlayRecordDto,
} from '@/components/ectv/ectv-api';

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

interface ResolvedPlay {
  title: string;
  poster: string;
  source: string;
  sourceName: string;
  videoId: string;
  key: string;
  rawUrl: string;
  ep: number;
  totalEps: number;
  epTitles: string[];
  detailId: string;
}

function PlayView() {
  const params = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [error, setError] = useState('');
  const [play, setPlay] = useState<ResolvedPlay | null>(null);
  const [resumeTime, setResumeTime] = useState(0);
  const [resumed, setResumed] = useState(false);
  const lastReportRef = useRef(0);

  // 解析播放目標
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    (async () => {
      try {
        const urlParam = params.get('url');
        const titleParam = params.get('title') ?? '';
        const epParam = Math.max(1, parseInt(params.get('ep') ?? '1', 10) || 1);

        if (urlParam) {
          // 直接給播放地址的模式
          const keyParam = params.get('key') ?? '';
          const sourceParam = params.get('source') ?? '';
          if (!cancelled) {
            setPlay({
              title: titleParam || '正在播放',
              poster: '',
              source: sourceParam,
              sourceName: '',
              videoId: '',
              key: keyParam,
              rawUrl: urlParam,
              ep: epParam,
              totalEps: 1,
              epTitles: [],
              detailId: '',
            });
            setStatus('done');
          }
          return;
        }

        const idParam = params.get('id') ?? '';
        let sourceParam = params.get('source') ?? '';
        let videoId = idParam;
        if (idParam.includes('+')) {
          // 相容「繼續觀看」的 id="source+id" 寫法
          const sp = splitKey(idParam);
          if (sp.source) sourceParam = sp.source;
          videoId = sp.id;
        }
        if (!videoId || !sourceParam) throw new Error('缺少播放參數');

        const r = await resolveDetail(videoId, sourceParam, titleParam || undefined);
        const d: DetailData = r.detail;
        if (!d.episodes || d.episodes.length === 0) throw new Error('該片源暫無可播放地址');

        const key = makeKey(d.source, d.id);
        let ep = epParam;
        let startTime = 0;
        // 讀舊進度：斷點續播
        try {
          const recs = await fetchJson<Record<string, PlayRecordDto>>('/api/playrecords');
          const rec = recs[key];
          if (rec) {
            if (!params.get('ep') && rec.index >= 1 && rec.index <= d.episodes.length) {
              ep = rec.index;
            }
            if (rec.index === ep && rec.play_time > 5 && rec.total_time > rec.play_time + 10) {
              startTime = rec.play_time;
              if (!cancelled) setResumed(true);
            }
          }
        } catch {
          /* 未登入時跳過斷點續播 */
        }

        if (ep > d.episodes.length) ep = d.episodes.length;
        if (!cancelled) {
          setResumeTime(startTime);
          setPlay({
            title: d.title,
            poster: d.poster,
            source: d.source,
            sourceName: d.source_name,
            videoId: d.id,
            key,
            rawUrl: d.episodes[ep - 1],
            ep,
            totalEps: d.episodes.length,
            epTitles: d.episodes_titles,
            detailId: d.id,
          });
          setStatus('done');
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const latestRef = useRef({ t: 0, d: 0 });

  // 上報播放進度（節流 15 秒）
  const report = useCallback(
    async (currentTime: number, duration: number, force = false) => {
      if (!play || !play.key || !Number.isFinite(currentTime) || currentTime < 1) return;
      latestRef.current = { t: currentTime, d: duration };
      const now = Date.now();
      if (!force && now - lastReportRef.current < 15000) return;
      lastReportRef.current = now;
      try {
        await fetchJson('/api/playrecords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: play.key,
            record: {
              title: play.title,
              source_name: play.sourceName || play.source,
              cover: play.poster,
              year: '',
              index: play.ep,
              total_episodes: play.totalEps,
              play_time: Math.floor(currentTime),
              total_time: Math.floor(duration || 0),
              save_time: Date.now(),
              search_title: play.title,
            },
          }),
        });
      } catch {
        /* 靜默失敗：不打斷播放 */
      }
    },
    [play]
  );

  // 離開頁面 / 切集時，用最後一次進度強制上報
  useEffect(() => {
    const doReport = () => {
      const { t, d } = latestRef.current;
      if (t > 1) void report(t, d, true);
    };
    return () => {
      doReport();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-abyss text-mist">
        <TopNav />
        <div className="pt-24 px-4 sm:px-6 max-w-[1100px] mx-auto animate-pulse">
          <div className="h-8 w-64 rounded bg-card mb-6" />
          <div className="w-full aspect-video rounded-2xl bg-card border border-edge/40" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (status === 'error' || !play) {
    return (
      <div className="min-h-screen bg-abyss text-mist">
        <TopNav />
        <div className="pt-24">
          <EmptyState title="無法播放" hint={error || '請稍後重試'} />
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

  const { url: playableUrl, isM3u8 } = toPlayableUrl(play.rawUrl, play.source);
  const epLabel = play.totalEps > 1 ? `第 ${play.ep} 集` : '';

  return (
    <div className="min-h-screen bg-abyss text-mist">
      <TopNav />

      <main className="pt-20 sm:pt-24 pb-24 md:pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-[1100px]">
          {/* 標題列 */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              aria-label="返回"
              className="w-9 h-9 shrink-0 rounded-full bg-surface/70 border border-edge flex items-center justify-center text-fog hover:text-mist hover:border-brand-500/60 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-mist truncate">
                {play.title}
                {epLabel && <span className="text-fog font-normal"> · {epLabel}</span>}
              </h1>
              {play.sourceName && <p className="text-xs text-dim mt-0.5">片源：{play.sourceName}</p>}
            </div>
          </div>

          {resumed && (
            <p className="mb-3 text-xs text-accent-400 bg-accent-400/10 border border-accent-400/25 rounded-full px-4 py-1.5 inline-block">
              ✦ 已為你回到上次觀看位置
            </p>
          )}

          <PlayerView
            key={playableUrl}
            url={playableUrl}
            title={`${play.title} ${epLabel}`}
            poster={play.poster || undefined}
            isM3u8={isM3u8}
            initialTime={resumeTime}
            onProgress={(t, d) => report(t, d)}
          />

          {/* 上一集 / 下一集 */}
          {play.totalEps > 1 && (
            <div className="mt-5 flex items-center justify-between gap-3">
              {play.ep > 1 ? (
                <Link
                  href={playHref(play.videoId, play.source, play.ep - 1, play.title)}
                  className="flex-1 text-center text-sm font-semibold text-fog border border-edge rounded-full py-2.5 hover:text-mist hover:border-brand-500/60 transition-all"
                >
                  ← 上一集
                </Link>
              ) : (
                <span className="flex-1" />
              )}
              <span className="text-xs text-dim shrink-0">
                {play.ep} / {play.totalEps}
              </span>
              {play.ep < play.totalEps ? (
                <Link
                  href={playHref(play.videoId, play.source, play.ep + 1, play.title)}
                  className="flex-1 text-center text-sm font-semibold text-white bg-brand-gradient rounded-full py-2.5 shadow-[0_4px_18px_rgba(46,124,246,0.45)] hover:brightness-110 transition-all"
                >
                  下一集 →
                </Link>
              ) : (
                <span className="flex-1" />
              )}
            </div>
          )}

          {/* 選集 */}
          {play.totalEps > 1 && play.detailId && (
            <section className="mt-8">
              <h2 className="text-base font-bold text-mist mb-4">選集</h2>
              <EpisodeGrid
                total={play.totalEps}
                titles={play.epTitles}
                hrefFor={(n) => playHref(play.videoId, play.source, n, play.title)}
                current={play.ep}
              />
            </section>
          )}

          {/* 返回詳情 */}
          {play.detailId && (
            <div className="mt-8 text-center">
              <Link
                href={detailHref(play.detailId, play.source, play.title)}
                className="text-sm text-brand-300 hover:text-brand-200 transition-colors"
              >
                查看影片詳情 →
              </Link>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-abyss" />}>
      <PlayView />
    </Suspense>
  );
}
