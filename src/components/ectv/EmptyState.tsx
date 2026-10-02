interface EmptyStateProps {
  title?: string;
  hint?: string;
}

/**
 * ECTV 優雅空狀態：無片源 / 無資料時顯示，絕不白屏
 */
export default function EmptyState({
  title = '暫無內容',
  hint = '還沒有可展示的影片資料。',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      {/* 膠片 E 剪影 */}
      <div className="relative w-20 h-20 mb-6 opacity-60">
        <div className="absolute inset-0 rounded-[22%] bg-card border border-edge" />
        <div
          className="absolute inset-x-3 top-1/2 -translate-y-1/2 h-8 opacity-50"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, #2E7CF6 0px, #2E7CF6 8px, transparent 8px, transparent 16px)',
          }}
        />
      </div>
      <h3 className="text-lg font-bold text-mist">{title}</h3>
      <p className="text-sm text-fog mt-2 max-w-md leading-relaxed">{hint}</p>
    </div>
  );
}
