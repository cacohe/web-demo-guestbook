import type { AuthPort } from '@/ports/auth-port'
import { authAdapter } from '@/adapters'

/** 认证相关的编排器：用于处理认证相关的业务逻辑 */
export class AuthService {
  constructor(private readonly auth: AuthPort = authAdapter) {}

  async login(email: string, password: string): Promise<void> {
    await this.auth.signInWithPassword(email, password)
  }

  async signup(email: string, password: string): Promise<void> {
    await this.auth.signUp(email, password)
  }

  async logout(): Promise<void> {
    await this.auth.signOut()
  }
}

export const authService = new AuthService()
