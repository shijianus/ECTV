import EctvLogo from '@/components/ectv/EctvLogo';

export default function WarningPage() {
  return (
    <main className="min-h-screen bg-abyss bg-abyss-glow flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-8">
          <EctvLogo size="lg" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-deep/80 backdrop-blur p-8">
          <h1 className="text-xl font-bold text-mist">影城尚未開幕</h1>
          <p className="text-sm text-fog mt-3 leading-relaxed">
            尚未設定管理員密碼。請在環境變數中設定{' '}
            <code className="rounded bg-abyss px-2 py-0.5 text-accent-400 font-mono text-xs">
              PASSWORD
            </code>{' '}
            後重新啟動 ECTV。
          </p>
        </div>
      </div>
    </main>
  );
}
