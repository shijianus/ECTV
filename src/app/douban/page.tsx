'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import BottomNav from '@/components/ectv/BottomNav';
import EmptyState from '@/components/ectv/EmptyState';
import Footer from '@/components/ectv/Footer';
import PosterCard from '@/components/ectv/PosterCard';
import TopNav from '@/components/ectv/TopNav';
import { fetchJson } from '@/components/ectv/ectv-api';
import type { MediaItem } from '@/components/ectv/types';

/* ---------- 類型與標籤配置 ---------- */

type DoubanType = 'movie' | 'tv' | 'anime';

const TABS: { key: DoubanType; label: string; apiType: 'movie' | 'tv'; tags: string[] }[] = [
  { key: 'movie', label: '電影', apiType: 'movie', tags: ['熱門', '最新', '高分', 'top250'] },
  { key: 'tv', label: '劇集', apiType: 'tv', tags: ['熱門', '美劇', '英劇', '韓劇', '日劇', '國產劇'] },
  { key: 'anime', label: '動漫', apiType: 'tv', tags: ['動漫'] },
];

const PAGE_SIZE = 24;

interface DoubanDto {
  code: number;
  message: string;
  list: { id: string; title: string; poster: string; rate: string; year: string }[];
}

function tagLabel(tag: string) {
  return tag === 'top250' ? 'Top 250' : tag;
}

/* ---------- 骨架屏 ---------- */

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[2/3] rounded-2xl bg-card border border-edge/40" />
          <div className="mt-2 h-3.5 rounded bg-card w-3/4" />
          <div className="mt-1.5 h-3 rounded bg-card w-1/3" />
        </div>
      ))}
    </div>
  );
}

/* ---------- 主視圖 ---------- */

function DoubanView() {
  const params = useSearchParams();
  const rawType = params.get('type');
  const tab = TABS.find((t) => t.key === rawType) ?? TABS[0];

  const [tag, setTag] = useState(tab.tags[0]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(
    async (pageStart: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else {
        setLoading(true);
        setError('');
      }
      try {
        const data = await fetchJson<DoubanDto>(
          `/api/douban?type=${tab.apiType}&tag=${encodeURIComponent(tag)}&pageSize=${PAGE_SIZE}&pageStart=${pageStart}`
        );
        const list: MediaItem[] = (data.list ?? []).map((it) => ({
          id: it.id,
          title: it.title,
          poster: it.poster,
          rate: it.rate,
          year: it.year || undefined,
        }));
        setItems((prev) => (append ? [...prev, ...list] : list));
        setHasMore(list.length >= PAGE_SIZE);
      } catch (e) {
        if (!append) setError(e instanceof Error ? e.message : '載入失敗，請稍後重試');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [tab.apiType, tag]
  );

  // 切換類型時重置標籤
  useEffect(() => {
    setTag(tab.tags[0]);
  }, [tab]);

  useEffect(() => {
    setItems([]);
    setHasMore(true);
    load(0, false);
  }, [load]);

  return (
    <div className="min-h-screen bg-abyss bg-abyss-glow text-mist pb-24 md:pb-0">
      <TopNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-28">
        {/* 頁面標題＋類型 Tab */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">豆瓣榜單</h1>
            <p className="text-sm text-fog mt-1">熱門影視發現，點擊海報查看詳情</p>
          </div>
          <div className="flex gap-1 p-1 rounded-full bg-surface border border-edge/60">
            {TABS.map((t) => {
              const active = t.key === tab.key;
              return (
                <Link
                  key={t.key}
                  href={`/douban?type=${t.key}`}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    active
                      ? 'bg-brand-gradient text-abyss font-bold shadow-[0_4px_16px_rgba(46,124,246,0.4)]'
                      : 'text-fog hover:text-mist'
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* 子標籤 */}
        {tab.tags.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {tab.tags.map((t) => {
              const active = t === tag;
              return (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                    active
                      ? 'border-brand-500/60 bg-brand-500/15 text-mist font-medium'
                      : 'border-edge/60 bg-surface/60 text-fog hover:border-brand-500/40 hover:text-mist'
                  }`}
                >
                  {tagLabel(t)}
                </button>
              );
            })}
          </div>
        )}

        {/* 內容區 */}
        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="flex flex-col items-center py-20 text-center">
            <p className="text-fog mb-4">載入失敗：{error}</p>
            <button
              onClick={() => load(0, false)}
              className="px-6 py-2.5 rounded-full bg-brand-gradient text-abyss text-sm font-bold hover:brightness-110 transition"
            >
              重新載入
            </button>
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="暫無榜單資料" hint="豆瓣暫時沒有返回這個分類的內容，換個標籤試試。" />
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6">
              {items.map((item) => (
                <PosterCard key={`${tab.key}-${item.id}`} item={item} />
              ))}
            </div>
            <div className="flex justify-center mt-10 mb-4">
              {loadingMore ? (
                <div className="w-8 h-8 rounded-full border-2 border-brand-500/30 border-t-brand-400 animate-spin" />
              ) : hasMore ? (
                <button
                  onClick={() => load(items.length, true)}
                  className="px-8 py-2.5 rounded-full border border-brand-500/50 text-brand-300 text-sm font-medium hover:bg-brand-500/10 transition"
                >
                  載入更多
                </button>
              ) : (
                <p className="text-xs text-dim">已經到底了</p>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

export default function DoubanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-abyss flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-brand-500/30 border-t-brand-400 animate-spin" />
        </div>
      }
    >
      <DoubanView />
    </Suspense>
  );
}
