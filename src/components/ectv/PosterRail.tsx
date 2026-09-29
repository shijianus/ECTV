'use client';

import Link from 'next/link';
import { useRef } from 'react';

import PosterCard from './PosterCard';
import type { MediaItem } from './types';

interface PosterRailProps {
  title: string;
  /** 副標題 / 裝飾文字 */
  tagline?: string;
  items: MediaItem[];
  /** 查看全部連結 */
  href?: string;
}

/**
 * ECTV 橫滑排：標題＋查看全部＋左右箭頭，scroll-snap
 */
export default function PosterRail({ title, tagline, items, href }: PosterRailProps) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  return (
    <section className="relative">
      <div className="flex items-end justify-between mb-4 px-4 sm:px-6 max-w-[1400px] mx-auto">
        <div>
          <div className="flex items-center gap-2.5">
            {/* 膠片齒孔小標記 */}
            <span
              className="inline-block w-8 h-3.5 rounded-[3px] opacity-70"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, #2E7CF6 0px, #2E7CF6 5px, transparent 5px, transparent 10px)',
              }}
              aria-hidden
            />
            <h2 className="text-lg sm:text-xl font-bold text-mist">{title}</h2>
          </div>
          {tagline && <p className="text-xs text-dim mt-1 ml-[42px]">{tagline}</p>}
        </div>

        <div className="flex items-center gap-2">
          {href && (
            <Link
              href={href}
              className="text-xs text-fog hover:text-brand-300 transition-colors mr-1"
            >
              查看全部 →
            </Link>
          )}
          <button
            onClick={() => scrollBy(-1)}
            aria-label="向左滑動"
            className="hidden sm:flex w-8 h-8 rounded-full border border-edge bg-surface/80 items-center justify-center text-fog hover:text-mist hover:border-brand-500/60 hover:shadow-[0_0_12px_rgba(46,124,246,0.35)] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="向右滑動"
            className="hidden sm:flex w-8 h-8 rounded-full border border-edge bg-surface/80 items-center justify-center text-fog hover:text-mist hover:border-brand-500/60 hover:shadow-[0_0_12px_rgba(46,124,246,0.35)] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="overflow-x-auto snap-x pb-2 scrollbar-none"
      >
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="flex gap-3 sm:gap-4 w-max">
            {items.map((item) => (
              <div key={item.id} className="w-[128px] sm:w-[160px] shrink-0 snap-start">
                <PosterCard item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
