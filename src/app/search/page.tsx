'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import BottomNav from '@/components/ectv/BottomNav';
import EmptyState from '@/components/ectv/EmptyState';
import Footer from '@/components/ectv/Footer';
import PosterCard from '@/components/ectv/PosterCard';
import TopNav from '@/components/ectv/TopNav';
import {
  detailHref,
  fetchJson,
  type SearchResultItem,
} from '@/components/ectv/ectv-api';

type Status = 'idle' | 'loading' | 'done' | 'error';

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[2/3] rounded-2xl bg-card border border-edge/50" />
          <div className="mt-2 h-4 rounded bg-card w-3/4" />
          <div className="mt-1.5 h-3 rounded bg-card w-1/3" />
        </div>
      ))}
    </div>
  );
}

function SearchView() {
  const router = useRouter();
  const params = useSearchParams();
  const q = (params.get('q') ?? '').trim();

  const [input, setInput] = useState(q);
  const [status, setStatus] = useState<Status>(q ? 'loading' : 'idle');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  // ?q= 變化時觸發搜尋
  useEffect(() => {
    setInput(q);
    if (!q) {
      setStatus('idle');
      setResults([]);
      return;
    }
    setStatus('loading');
    setError('');
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    (async () => {
      try {
        const data = await fetchJson<{ results: SearchResultItem[] }>(
          `/api/search?q=${encodeURIComponent(q)}`,
          { signal: ctrl.signal }
        );
        setResults(data.results ?? []);
        setStatus('done');
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setError(e instanceof Error ? e.message : '搜尋失敗');
        setStatus('error');
      }
    })();
    return () => ctrl.abort();
  }, [q]);

  const submit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const kw = input.trim();
      if (kw) router.push(`/search?q=${encodeURIComponent(kw)}`);
    },
    [input, router]
  );

  const sourceCount = new Set(results.map((r) => r.source)).size;

  return (
    <div className="min-h-screen bg-abyss text-mist">
      <TopNav />

      <main className="pt-24 pb-24 md:pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-[1400px]">
          {/* 大搜尋框 */}
          <form onSubmit={submit} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="搜尋電影、劇集、動漫…"
                autoFocus={!q}
                className="w-full bg-surface/70 border border-edge rounded-full pl-12 pr-28 py-3.5 text-base text-mist placeholder:text-dim outline-none focus:border-brand-500/70 focus:ring-2 focus:ring-brand-500/25 focus:shadow-[0_0_36px_rgba(46,124,246,0.25)] transition-all"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dim"
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
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-gradient text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_18px_rgba(46,124,246,0.45)]"
              >
                搜尋
              </button>
            </div>
          </form>

          <div className="mt-10">
            {status === 'idle' && (
              <div className="text-center py-16">
                <div
                  className="mx-auto w-16 h-16 mb-6 rounded-2xl bg-card border border-edge flex items-center justify-center"
                  aria-hidden
                >
                  <svg className="w-8 h-8 text-dim" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                  </svg>
                </div>
                <p className="text-fog text-sm">在上方輸入關鍵詞，搜尋全網片源</p>
              </div>
            )}

            {status === 'loading' && <SearchSkeleton />}

            {status === 'error' && (
              <div className="text-center py-16">
                <p className="text-lg font-bold text-mist">搜尋出錯了</p>
                <p className="text-sm text-fog mt-2">{error}</p>
                <button
                  onClick={() => submit()}
                  className="mt-6 text-sm font-semibold text-brand-300 border border-brand-500/40 rounded-full px-6 py-2 hover:bg-brand-500/10 transition-colors"
                >
                  重試
                </button>
              </div>
            )}

            {status === 'done' && results.length === 0 && (
              <EmptyState
                title={`沒有找到「${q}」`}
                hint="換個關鍵詞試試，例如只輸入片名核心字，或檢查是否有錯別字。"
              />
            )}

            {status === 'done' && results.length > 0 && (
              <>
                <p className="text-sm text-fog mb-6">
                  找到 <span className="text-mist font-bold">{results.length}</span> 個結果
                  ，來自 <span className="text-mist font-bold">{sourceCount}</span> 個片源
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {results.map((r) => (
                    <div key={`${r.source}+${r.id}`} className="relative">
                      <PosterCard
                        item={{
                          id: r.id,
                          title: r.title,
                          poster: r.poster,
                          rate: '',
                          year: r.year,
                        }}
                        detailHref={() => detailHref(r.id, r.source, r.title)}
                      />
                      <span className="absolute top-2 right-2 text-[10px] font-medium text-accent-400 bg-abyss/75 backdrop-blur px-1.5 py-0.5 rounded-md border border-accent-400/25 pointer-events-none">
                        {r.source_name}
                      </span>
                    </div>
                  ))}
                </div>
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-abyss" />}>
      <SearchView />
    </Suspense>
  );
}
