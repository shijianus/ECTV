'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EctvLogo from '@/components/ectv/EctvLogo';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.ok ?? true)) {
        router.replace('/');
        router.refresh();
      } else {
        setError(data.message || '密碼錯誤，請重試');
      }
    } catch {
      setError('連線失敗，請檢查網路後重試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-abyss bg-abyss-glow flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <EctvLogo size="lg" />
        </div>
        <form
          onSubmit={submit}
          className="rounded-2xl border border-white/10 bg-deep/80 backdrop-blur p-8 shadow-[0_0_60px_-15px_rgba(46,124,246,0.4)]"
        >
          <h1 className="text-xl font-bold text-mist text-center">歡迎回到 ECTV</h1>
          <p className="text-sm text-fog text-center mt-1 mb-6">請輸入密碼進入你的深海影城</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密碼"
            autoFocus
            className="w-full rounded-xl bg-abyss border border-white/10 px-4 py-3 text-mist placeholder:text-fog/60 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition"
          />
          {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
          <button
            type="submit"
            disabled={!password || loading}
            className="mt-5 w-full rounded-xl bg-brand-gradient py-3 font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.99] transition"
          >
            {loading ? '驗證中…' : '進入影城'}
          </button>
        </form>
        <p className="text-xs text-fog/60 text-center mt-6">
          基於 MoonTVPlus · CC BY-NC-SA 4.0（非商業使用）
        </p>
      </div>
    </main>
  );
}
