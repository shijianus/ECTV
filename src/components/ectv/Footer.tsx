import Link from 'next/link';

import EctvLogo from './EctvLogo';

/**
 * ECTV 頁腳：品牌列 + MoonTVPlus 署名（CC BY-NC-SA 4.0 的 BY 要求）
 */
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-edge/60 bg-deep/60">
      {/* 膠片齒孔頂飾 */}
      <div
        className="h-6 opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(157,180,212,0.5) 0px, rgba(157,180,212,0.5) 12px, transparent 12px, transparent 26px)',
          backgroundSize: '100% 8px',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat-x',
        }}
        aria-hidden
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
          <div>
            <EctvLogo size="md" />
            <p className="text-xs text-dim mt-3 max-w-sm leading-relaxed">
              ECTV —— 你的私人深海影院。聚合全網片源，沉浸式觀影體驗。
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-fog">
            <Link href="/" className="hover:text-brand-300 transition-colors">首頁</Link>
            <Link href="/search" className="hover:text-brand-300 transition-colors">搜尋</Link>
            <Link href="/watchlist" className="hover:text-brand-300 transition-colors">收藏</Link>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-edge/40 flex flex-col sm:flex-row gap-2 sm:items-center justify-between text-xs text-dim">
          <p>© 2026 ECTV. All rights reserved.</p>
          <p>
            基於{' '}
            <a
              href="https://github.com/mtvpls/MoonTVPlus"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fog hover:text-brand-300 underline underline-offset-2 transition-colors"
            >
              MoonTVPlus
            </a>{' '}
            二次開發 ·{' '}
            <a
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hant"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fog hover:text-brand-300 underline underline-offset-2 transition-colors"
            >
              CC BY-NC-SA 4.0
            </a>{' '}
           （非商業使用）
          </p>
        </div>
      </div>
    </footer>
  );
}
