'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import EctvLogo from './EctvLogo';

const NAV_LINKS = [
  { label: '首頁', href: '/' },
  { label: '電影', href: '/douban?type=movie' },
  { label: '劇集', href: '/douban?type=tv' },
  { label: '動漫', href: '/douban?type=anime' },
  { label: '直播', href: '/live' },
];

/**
 * ECTV 桌面頂欄：滾動後毛玻璃背景
 */
export default function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [keyword, setKeyword] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = keyword.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-abyss/80 backdrop-blur-xl border-b border-edge/60 shadow-[0_8px_30px_rgba(3,8,20,0.5)]'
          : 'bg-gradient-to-b from-abyss/90 to-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 h-16 flex items-center gap-6">
        <EctvLogo size="md" />

        {/* 中導航 */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href.split('?')[0]);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative px-3.5 py-2 text-sm font-medium rounded-full transition-colors ${
                  active ? 'text-mist' : 'text-fog hover:text-mist'
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 h-[3px] w-6 rounded-full bg-brand-gradient shadow-[0_0_10px_rgba(46,124,246,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* 搜尋框 */}
        <form onSubmit={submitSearch} className="hidden sm:block relative">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜尋電影、劇集…"
            className="w-44 focus:w-64 transition-all duration-300 bg-surface/70 border border-edge rounded-full pl-9 pr-4 py-1.5 text-sm text-mist placeholder:text-dim outline-none focus:border-brand-500/70 focus:ring-2 focus:ring-brand-500/20"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
            />
          </svg>
        </form>

        {/* 使用者入口 */}
        <Link
          href="/login"
          aria-label="我的"
          className="w-9 h-9 rounded-full bg-surface border border-edge flex items-center justify-center text-fog hover:text-mist hover:border-brand-500/60 hover:shadow-[0_0_14px_rgba(46,124,246,0.35)] transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </Link>
      </div>
    </header>
  );
}
