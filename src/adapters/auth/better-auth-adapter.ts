import {
  InvalidCredentialsError,
  PersistenceError,
  RegistrationError,
} from '@/domain/errors'
import { MIN_PASSWORD_LENGTH, type User } from '@/domain/user'
import { auth } from './better-auth'
import type { AuthPort } from '@/ports/auth-port'
import { headers } from 'next/headers'

function getNameFromEmail(email: string) {
  return email.split('@')[0] || '用户'
}

/** 基于 Better Auth 的认证适配器，对应用层屏蔽具体 Auth SDK */
export class BetterAuthAdapter implements AuthPort {
  async getCurrentUser(): Promise<User | null> {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email,
    }
  }

  async signInWithPassword(email: string, password: string): Promise<void> {
    try {
      await auth.api.signInEmail({
        body: { email, password },
        headers: await headers(),
      })
    } catch {
      throw new InvalidCredentialsError()
    }
  }

  async signUp(email: string, password: string): Promise<void> {
    try {
      await auth.api.signUpEmail({
        body: {
          email,
          password,
          name: getNameFromEmail(email),
        },
        headers: await headers(),
      })
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('PASSWORD_TOO_SHORT')
      ) {
        throw new RegistrationError(
          `密码至少需要 ${MIN_PASSWORD_LENGTH} 位字符`
        )
      }
      throw new RegistrationError()
    }
  }

  async signOut(): Promise<void> {
    try {
      await auth.api.signOut({
        headers: await headers(),
      })
    } catch {
      throw new PersistenceError('登出失败')
    }
  }
}
