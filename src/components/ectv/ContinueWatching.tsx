'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import type { PlayRecord } from '@/lib/types';

interface RecordEntry {
  key: string;
  record: PlayRecord;
}

function progressOf(r: PlayRecord): number {
  if (!r.total_time || r.total_time <= 0) return 0;
  return Math.min(100, Math.max(0, (r.play_time / r.total_time) * 100));
}

/**
 * ECTV 繼續觀看：讀 /api/playrecords，藍色進度條，可移除
 * 未登入（401）時靜默隱藏
 */
export default function ContinueWatching() {
  const [entries, setEntries] = useState<RecordEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/playrecords', { credentials: 'include' });
        if (!res.ok) {
          if (!cancelled) setEntries([]);
          return;
        }
        const data: { [key: string]: PlayRecord } = await res.json();
        const list = Object.entries(data)
          .map(([key, record]) => ({ key, record }))
          .sort((a, b) => b.record.save_time - a.record.save_time)
          .slice(0, 10);
        if (!cancelled) setEntries(list);
      } catch {
        if (!cancelled) setEntries([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const remove = useCallback(async (key: string) => {
    setEntries((prev) => (prev ? prev.filter((e) => e.key !== key) : prev));
    try {
      await fetch(`/api/playrecords?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch {
      /* 靜默失敗：本地已移除 */
    }
  }, []);

  if (!entries || entries.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span
          className="inline-block w-8 h-3.5 rounded-[3px] opacity-70"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, #22D3EE 0px, #22D3EE 5px, transparent 5px, transparent 10px)',
          }}
          aria-hidden
        />
        <h2 className="text-lg sm:text-xl font-bold text-mist">繼續觀看</h2>
      </div>

      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none">
        {entries.map(({ key, record }) => {
          const pct = progressOf(record);
          const label =
            record.total_episodes > 1
              ? `第 ${record.index} 集 / 共 ${record.total_episodes} 集`
              : record.source_name || '繼續播放';
          return (
            <div
              key={key}
              className="group relative w-[240px] sm:w-[280px] shrink-0 rounded-2xl overflow-hidden bg-card border border-edge/50 hover:border-brand-500/50 hover:shadow-[0_12px_36px_rgba(46,124,246,0.3)] transition-all"
            >
              <Link
                href={`/play?id=${encodeURIComponent(key)}&source=${encodeURIComponent(record.source_name || '')}`}
                className="block"
              >
                <div className="relative aspect-video bg-deep">
                  {record.cover ? (
                    <Image
                      src={record.cover}
                      alt={record.title}
                      fill
                      sizes="280px"
                      className="object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-abyss-glow" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-abyss/80 to-transparent" />
                  {/* 中央播放鍵 */}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-11 h-11 rounded-full bg-abyss/60 backdrop-blur border border-mist/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5 fill-mist translate-x-[1px]" viewBox="0 0 20 20">
                        <path d="M6 4l12 6-12 6V4z" />
                      </svg>
                    </span>
                  </span>
                </div>

                <div className="p-3">
                  <p className="text-sm text-mist font-medium truncate">{record.title}</p>
                  <p className="text-xs text-dim mt-1 truncate">{label}</p>
                  {/* 藍色進度條 */}
                  <div className="mt-2 h-1 rounded-full bg-edge/70 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-gradient shadow-[0_0_8px_rgba(46,124,246,0.8)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </Link>

              {/* 移除按鈕 */}
              <button
                onClick={() => remove(key)}
                aria-label={`移除 ${record.title}`}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-abyss/70 backdrop-blur border border-mist/15 text-fog flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-mist hover:border-brand-400 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
