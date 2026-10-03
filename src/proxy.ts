import { getSessionCookie } from 'better-auth/cookies'
import { NextResponse, type NextRequest } from 'next/server'

/** 无需登录即可访问的路径 */
const PUBLIC_PATHS = ['/login', '/signup', '/api/auth']

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path))
}

/**
 * 仅检查 Session Cookie 是否存在，避免引入 Better Auth + Prisma 完整依赖。
 * 精确的 Session 校验在 Server Actions / Service 层完成。
 */
function hasSessionCookie(request: NextRequest) {
  return Boolean(getSessionCookie(request))
}

/** 路由守卫：未登录用户重定向到登录页，已登录用户不可访问登录/注册页 */
export function proxy(request: NextRequest) {
  const isLoggedIn = hasSessionCookie(request)
  const { pathname } = request.nextUrl
  const isAuthPage =
    pathname.startsWith('/login') || pathname.startsWith('/signup')

  // 未登录用户重定向到登录页
  if (!isLoggedIn && !isPublicPath(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 已登录用户不可访问登录/注册页
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 允许访问
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
