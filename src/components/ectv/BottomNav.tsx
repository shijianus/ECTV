'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  {
    label: '首頁',
    href: '/',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9.5z" />
    ),
  },
  {
    label: '搜尋',
    href: '/search',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
    ),
  },
  {
    label: '收藏',
    href: '/favorites',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.3 12.5l5 5L19.7 7l-1.4-1.4a2 2 0 00-2.8 0l-6.2 6.2-3.6-3.6a2 2 0 00-2.8 0L4.3 12.5zM4 20h16" />
    ),
  },
  {
    label: '我的',
    href: '/login',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    ),
  },
];

/**
 * ECTV 移動端底部導航（桌面隱藏）
 */
export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-abyss/85 backdrop-blur-xl border-t border-edge/60 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4 h-16">
        {TABS.map((tab) => {
          const active =
            tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 text-[11px] transition-colors ${
                active ? 'text-brand-400' : 'text-dim'
              }`}
            >
              <span className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  {tab.icon}
                </svg>
                {active && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-[3px] w-5 rounded-full bg-brand-gradient shadow-[0_0_8px_rgba(46,124,246,0.9)]" />
                )}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
