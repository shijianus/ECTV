'use client';

import Image from 'next/image';
import Link from 'next/link';

interface EctvLogoProps {
  /** 標識高度檔位（僅 ECTV 純藝術字，不含膠片 E 圖標） */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ECTV 標識（Wordmark）：ECTV 純藝術字。
 * 品牌規範：標識只掛純藝術字，膠片 E（Logo）僅用於瀏覽器 Tab / App icon，
 * 不出現在頁面內的品牌展示位置。
 * wordmark-lockup.webp 實際比例 1312:447 ≈ 2.94
 */
const WORDMARK_RATIO = 1312 / 447;

const WORDMARK_H = {
  sm: 20,
  md: 24,
  lg: 36,
} as const;

export default function EctvLogo({ size = 'md' }: EctvLogoProps) {
  const h = WORDMARK_H[size];

  return (
    <Link href="/" className="inline-block shrink-0 group" aria-label="ECTV 首頁">
      <span className="relative block transition-transform duration-300 group-hover:scale-[1.03]">
        <Image
          src="/brand/wordmark-lockup.webp"
          alt="ECTV"
          width={Math.round(h * WORDMARK_RATIO)}
          height={h}
          className="object-contain h-auto"
          priority
        />
      </span>
    </Link>
  );
}
