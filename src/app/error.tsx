'use client' // 客户端组件

// 错误页面：当页面加载失败时，显示错误信息并提供重试按钮
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center p-8 text-center">
      <h2 className="text-xl font-semibold text-gray-900">页面加载失败</h2>
      <p className="mt-2 text-sm text-gray-600">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
      >
        重试
      </button>
    </div>
  )
}
