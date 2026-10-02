'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

interface EpisodeGridProps {
  total: number;
  titles?: string[];
  /** 第 n 集（1-based）的連結 */
  hrefFor: (n: number) => string;
  /** 高亮的當前集數 */
  current?: number;
}

/**
 * ECTV 選集網格：超多集數時自動分段 Tab（每 50 集一段）
 */
export default function EpisodeGrid({ total, titles = [], hrefFor, current }: EpisodeGridProps) {
  const [tab, setTab] = useState(0);

  const tabs = useMemo(() => {
    if (total <= 60) return [{ label: `全 ${total} 集`, start: 1, end: total }];
    const out: { label: string; start: number; end: number }[] = [];
    for (let s = 1; s <= total; s += 50) {
      const e = Math.min(s + 49, total);
      out.push({
        label: `${String(s).padStart(2, '0')}–${String(e).padStart(2, '0')}`,
        start: s,
        end: e,
      });
    }
    return out;
  }, [total]);

  if (total <= 0) return null;

  const active = tabs[Math.min(tab, tabs.length - 1)];
  const range: number[] = [];
  for (let i = active.start; i <= active.end; i++) range.push(i);

  const labelOf = (n: number) => {
    const t = (titles[n - 1] ?? '').trim();
    return t && t.length <= 8 ? t : `${n}`;
  };

  return (
    <div>
      {tabs.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setTab(i)}
              className={`shrink-0 text-xs font-medium px-4 py-1.5 rounded-full border transition-all ${
                i === tab
                  ? 'bg-brand-gradient text-white border-transparent shadow-[0_4px_14px_rgba(46,124,246,0.4)]'
                  : 'text-fog border-edge hover:text-mist hover:border-brand-500/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
        {range.map((n) => (
          <Link
            key={n}
            href={hrefFor(n)}
            title={titles[n - 1] || `第 ${n} 集`}
            className={`truncate text-center text-xs sm:text-sm font-medium px-2 py-3 rounded-xl border transition-all ${
              n === current
                ? 'bg-brand-gradient text-white border-transparent shadow-[0_4px_16px_rgba(46,124,246,0.5)]'
                : 'bg-surface/60 text-fog border-edge/70 hover:text-mist hover:border-brand-500/60 hover:shadow-[0_0_12px_rgba(46,124,246,0.3)]'
            }`}
          >
            {labelOf(n)}
          </Link>
        ))}
      </div>
    </div>
  );
}
