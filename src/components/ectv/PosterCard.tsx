import Image from 'next/image';
import Link from 'next/link';

import type { MediaItem } from './types';

interface PosterCardProps {
  item: MediaItem;
  /** 詳情頁連結前綴，預設豆瓣來源 */
  detailHref?: (item: MediaItem) => string;
}

/**
 * ECTV 2:3 海報卡：hover 上浮＋藍色輝光＋播放鍵浮現
 */
export default function PosterCard({
  item,
  detailHref = (it) => `/detail?id=${encodeURIComponent(it.id)}&source=douban`,
}: PosterCardProps) {
  return (
    <Link
      href={detailHref(item)}
      className="group block w-full snap-start shrink-0"
      title={item.title}
    >
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-card border border-edge/50 transition-all duration-300 group-hover:-translate-y-2 group-hover:border-brand-500/50 group-hover:shadow-[0_16px_44px_rgba(46,124,246,0.35)]">
        {item.poster ? (
          <Image
            src={item.poster}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 40vw, (max-width: 1024px) 22vw, 12vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-abyss-glow flex items-center justify-center">
            <span className="text-dim text-xs px-3 text-center line-clamp-2">{item.title}</span>
          </div>
        )}

        {/* hover 壓暗 + 播放鍵 */}
        <div className="absolute inset-0 bg-gradient-to-t from-abyss/90 via-abyss/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
          <span className="w-14 h-14 rounded-full bg-brand-gradient flex items-center justify-center shadow-[0_0_28px_rgba(46,124,246,0.7)]">
            <svg className="w-6 h-6 fill-abyss translate-x-[2px]" viewBox="0 0 20 20">
              <path d="M6 4l12 6-12 6V4z" />
            </svg>
          </span>
        </div>

        {/* 評分徽章 */}
        {item.rate && item.rate !== '' && (
          <span className="absolute top-2 left-2 text-[11px] font-bold text-amber-300 bg-abyss/70 backdrop-blur px-1.5 py-0.5 rounded-md border border-mist/10">
            ★ {item.rate}
          </span>
        )}
      </div>

      <div className="mt-2 px-0.5">
        <p className="text-sm text-mist font-medium truncate group-hover:text-brand-300 transition-colors">
          {item.title}
        </p>
        {item.year && <p className="text-xs text-dim mt-0.5">{item.year}</p>}
      </div>
    </Link>
  );
}
