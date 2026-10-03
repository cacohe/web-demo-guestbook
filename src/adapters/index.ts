import { BetterAuthAdapter } from './auth/better-auth-adapter'
import { PrismaMessageRepository } from './message/message-repository'

/** 适配器装配：切换数据库或认证方案时，只需替换此处的实现类 */
export const authAdapter = new BetterAuthAdapter()
export const messageRepository = new PrismaMessageRepository()
