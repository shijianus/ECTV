'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { HeroItem } from './types';

interface HeroProps {
  items: HeroItem[];
}

/**
 * ECTV 首頁 Hero：全幅電影感輪播
 * 深藍漸層壓暗 + 底部膠片齒孔裝飾 + 自動輪播
 */
export default function Hero({ items }: HeroProps) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (i: number) => setIndex(((i % items.length) + items.length) % items.length),
    [items.length]
  );

  useEffect(() => {
    if (items.length <= 1) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [items.length]);

  if (items.length === 0) return null;
  const item = items[index];

  return (
    <section className="relative w-full h-[78vh] min-h-[480px] max-h-[820px] overflow-hidden">
      {/* Backdrops */}
      {items.map((it, i) => (
        <div
          key={it.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {it.backdrop ? (
            <Image
              src={it.backdrop}
              alt={it.title}
              fill
              priority={i === 0}
              className="object-cover object-top"
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-abyss-glow" />
          )}
        </div>
      ))}

      {/* 深海漸層壓暗 */}
      <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/40 to-abyss/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-abyss/95 via-abyss/30 to-transparent" />

      {/* 內容 */}
      <div className="relative z-10 h-full mx-auto max-w-[1400px] px-4 sm:px-6 flex flex-col justify-end pb-20">
        <div key={item.id} className="max-w-2xl animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-bold tracking-[0.2em] text-abyss bg-brand-gradient px-2.5 py-1 rounded-md">
              ECTV 精選
            </span>
            {item.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="text-xs text-fog border border-edge rounded-full px-2.5 py-1 bg-abyss/50 backdrop-blur-sm"
              >
                {g}
              </span>
            ))}
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-mist leading-tight drop-shadow-[0_4px_24px_rgba(3,8,20,0.8)]">
            {item.title}
          </h1>

          <div className="flex items-center gap-3 mt-3 text-sm">
            {item.rating > 0 && (
              <span className="flex items-center gap-1 text-amber-300 font-semibold">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9 4.7 17.6l1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                </svg>
                {item.rating.toFixed(1)}
              </span>
            )}
            {item.year && <span className="text-fog">{item.year}</span>}
            <span className="text-dim">·</span>
            <span className="text-fog">電影</span>
          </div>

          {item.overview && (
            <p className="mt-3 text-fog text-sm sm:text-base line-clamp-2 leading-relaxed max-w-xl">
              {item.overview}
            </p>
          )}

          <div className="flex items-center gap-3 mt-6">
            <Link
              href={`/play?id=${encodeURIComponent(item.id)}&source=douban`}
              className="flex items-center gap-2 bg-brand-gradient text-abyss font-bold px-7 py-3 rounded-full text-sm sm:text-base shadow-[0_8px_30px_rgba(46,124,246,0.45)] hover:shadow-[0_8px_40px_rgba(46,124,246,0.65)] hover:scale-[1.03] active:scale-100 transition-all"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M6 4l12 6-12 6V4z" />
              </svg>
              立即播放
            </Link>
            <Link
              href={`/detail?id=${encodeURIComponent(item.id)}&source=douban`}
              className="flex items-center gap-2 bg-mist/10 backdrop-blur-md border border-mist/20 text-mist font-medium px-6 py-3 rounded-full text-sm sm:text-base hover:bg-mist/20 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" d="M12 11v5M12 8v.1" />
              </svg>
              更多資訊
            </Link>
          </div>
        </div>

        {/* 指示點 + 箭頭 */}
        <div className="flex items-center gap-4 mt-8">
          <div className="flex items-center gap-2">
            {items.map((it, i) => (
              <button
                key={it.id}
                onClick={() => go(i)}
                aria-label={`切換到 ${it.title}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? 'w-8 bg-brand-gradient shadow-[0_0_8px_rgba(46,124,246,0.8)]'
                    : 'w-1.5 bg-mist/25 hover:bg-mist/50'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => go(index - 1)}
              aria-label="上一部"
              className="w-9 h-9 rounded-full border border-mist/20 bg-abyss/50 backdrop-blur text-mist flex items-center justify-center hover:border-brand-400 hover:text-brand-300 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => go(index + 1)}
              aria-label="下一部"
              className="w-9 h-9 rounded-full border border-mist/20 bg-abyss/50 backdrop-blur text-mist flex items-center justify-center hover:border-brand-400 hover:text-brand-300 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 底部膠片齒孔裝飾（ECTV 標誌性 motif） */}
      <div className="absolute bottom-0 inset-x-0 z-10 pointer-events-none">
        <div
          className="h-7 opacity-60"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(157,180,212,0.5) 0px, rgba(157,180,212,0.5) 12px, transparent 12px, transparent 26px)',
            backgroundSize: '100% 9px',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat-x',
            maskImage:
              'linear-gradient(to bottom, transparent, black 40%, black 60%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent, black 40%, black 60%, transparent)',
          }}
        />
        <div className="h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />
      </div>
    </section>
  );
}
