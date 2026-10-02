'use client';

import { useEffect, useRef } from 'react';

interface PlayerViewProps {
  url: string;
  title: string;
  poster?: string;
  /** 是否為 m3u8（代理後 URL 不帶副檔名，需強制指定 type） */
  isM3u8: boolean;
  /** 斷點續播秒數 */
  initialTime?: number;
  onReady?: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
}

/**
 * ECTV 播放器：ArtPlayer 5.4 + hls.js 1.6，主題色 #2E7CF6。
 * dynamic import 延遲載入，減少首屏體積（由呼叫方用 next/dynamic 包裝 ssr:false）。
 */
export default function PlayerView({
  url,
  title,
  poster,
  isM3u8,
  initialTime = 0,
  onReady,
  onProgress,
}: PlayerViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cbRef = useRef({ onReady, onProgress, initialTime });
  cbRef.current = { onReady, onProgress, initialTime };

  useEffect(() => {
    let art: { destroy: (keepHtml?: boolean) => void } | null = null;
    let hls: { destroy: () => void } | null = null;
    let disposed = false;

    (async () => {
      const [{ default: Artplayer }, { default: Hls }] = await Promise.all([
        import('artplayer'),
        import('hls.js'),
      ]);
      if (disposed || !containerRef.current) return;

      const options: Record<string, unknown> = {
        container: containerRef.current,
        url,
        title,
        poster,
        theme: '#2E7CF6',
        autoplay: true,
        pip: true,
        setting: true,
        playbackRate: true,
        aspectRatio: true,
        fullscreen: true,
        fullscreenWeb: true,
        fastForward: true,
        autoOrientation: true,
        lock: true,
        customType: {
          m3u8: (video: HTMLVideoElement, src: string, instance: unknown) => {
            if (Hls.isSupported()) {
              const h = new Hls({ enableWorker: true });
              hls = h;
              h.loadSource(src);
              h.attachMedia(video);
              (instance as { on: (e: string, fn: () => void) => void }).on('destroy', () => h.destroy());
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              video.src = src;
            }
          },
        },
      };
      // m3u8 經 /api/proxy-m3u8 代理後 URL 不帶副檔名，必須強制指定 type
      if (isM3u8) options.type = 'm3u8';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const player = new (Artplayer as any)(options) as {
        on: (e: string, fn: () => void) => void;
        destroy: (keepHtml?: boolean) => void;
      };
      art = player;

      player.on('ready', () => {
        const t = cbRef.current.initialTime;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = player as any;
        if (t > 5 && p.duration > t + 10) {
          p.seek = t;
        }
        cbRef.current.onReady?.();
      });
      player.on('video:timeupdate', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = player as any;
        cbRef.current.onProgress?.(p.currentTime ?? 0, p.duration ?? 0);
      });
      player.on('video:ended', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = player as any;
        cbRef.current.onProgress?.(p.duration ?? 0, p.duration ?? 0);
      });
    })();

    return () => {
      disposed = true;
      try {
        art?.destroy(false);
      } catch {
        /* 忽略銷毀錯誤 */
      }
      try {
        hls?.destroy();
      } catch {
        /* 忽略 */
      }
    };
  }, [url, title, poster, isM3u8]);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_24px_80px_rgba(3,8,20,0.8)] border border-edge/40"
    />
  );
}
