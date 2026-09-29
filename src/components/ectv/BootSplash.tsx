'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * ECTV 開場動畫 — 學 Netflix 片頭邏輯：
 * 每次新會話進站，先播膠片 E logo 動畫（光束掃過、E 發光定格），
 * 播完淡出進首頁；同會話內只播一次。
 */
export default function BootSplash() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const done = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem('ectv-booted')) return;
    setVisible(true);
    const v = videoRef.current;
    const finish = () => {
      if (done.current) return;
      done.current = true;
      setFading(true);
      setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem('ectv-booted', '1');
      }, 600);
    };
    // 影片播完或 4.5 秒超時（保底）即結束
    v?.addEventListener('ended', finish);
    const timer = setTimeout(finish, 4500);
    return () => {
      clearTimeout(timer);
      v?.removeEventListener('ended', finish);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-600 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <video
        ref={videoRef}
        src="/brand/logo-intro.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
