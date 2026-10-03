import type { User } from '@/domain/user'

/** 认证端口：应用层通过此契约访问用户会话，不依赖具体 Auth 实现 */
export interface AuthPort {
  getCurrentUser(): Promise<User | null>
  signInWithPassword(email: string, password: string): Promise<void>
  signUp(email: string, password: string): Promise<void>
  signOut(): Promise<void>
}
