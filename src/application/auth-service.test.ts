import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthPort } from '@/ports/auth-port'
import { AuthService } from '@/application/auth-service'

vi.mock('@/adapters', () => ({
  authAdapter: {},
}))

describe('AuthService', () => {
  const auth: AuthPort = {
    getCurrentUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }

  const service = new AuthService(auth)

  beforeEach(() => {
    vi.mocked(auth.signInWithPassword).mockReset()
    vi.mocked(auth.signUp).mockReset()
    vi.mocked(auth.signOut).mockReset()
  })

  it('delegates login to the auth port', async () => {
    vi.mocked(auth.signInWithPassword).mockResolvedValue()

    await service.login('user@example.com', 'secret123')

    expect(auth.signInWithPassword).toHaveBeenCalledWith(
      'user@example.com',
      'secret123'
    )
  })

  it('delegates signup to the auth port', async () => {
    vi.mocked(auth.signUp).mockResolvedValue()

    await service.signup('new@example.com', 'secret123')

    expect(auth.signUp).toHaveBeenCalledWith('new@example.com', 'secret123')
  })

  it('delegates logout to the auth port', async () => {
    vi.mocked(auth.signOut).mockResolvedValue()

    await service.logout()

    expect(auth.signOut).toHaveBeenCalledOnce()
  })
})
