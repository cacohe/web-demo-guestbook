// 认证布局：统一认证页面的样式
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl text-black sm:p-10">
        {children}
      </div>
    </div>
  )
}
