import { auth } from '@/adapters/auth/better-auth'
import { toNextJsHandler } from 'better-auth/next-js'

/** 向外暴露 Better Auth 的 HTTP API：外部可以访问这些API来处理登录、注册、登出等 /api/auth/* 请求 */
export const { GET, POST } = toNextJsHandler(auth)
