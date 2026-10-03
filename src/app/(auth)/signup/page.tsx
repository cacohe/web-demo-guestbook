import { signup } from '@/actions/auth'
import { MIN_PASSWORD_LENGTH } from '@/domain/user'
import Link from 'next/link'

// 用户注册页
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams

  return (
    <>
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
          创建新账号
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          加入社区，开始你的第一条留言
        </p>
      </div>

      <form action={signup} className="mt-8 space-y-5">
        {params.error && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            <span className="font-semibold">注册失败：</span>
            {params.error}
          </div>
        )}
        {params.message && (
          <div className="rounded-lg border border-green-100 bg-green-50 p-3 text-sm text-green-600">
            {params.message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              邮箱地址
            </label>
            <input
              name="email"
              type="email"
              required
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              设置密码
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              placeholder={`至少 ${MIN_PASSWORD_LENGTH} 位字符`}
            />
          </div>
        </div>

        <button
          type="submit"
          className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none active:scale-[0.98]"
        >
          立即注册
        </button>
      </form>

      <div className="border-t border-gray-100 pt-6 text-center">
        <p className="text-sm text-gray-600">
          已有账号？{' '}
          <Link
            href="/login"
            className="font-semibold text-blue-600 transition-colors hover:text-blue-500"
          >
            返回登录
          </Link>
        </p>
      </div>
    </>
  )
}
