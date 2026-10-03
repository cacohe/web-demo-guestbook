import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  PersistenceError,
  UnauthorizedError,
  ValidationError,
} from '@/domain/errors'
import type { AuthPort } from '@/ports/auth-port'
import type { MessageRepository } from '@/ports/message-repository'
import { MessageService } from '@/application/message-service'

vi.mock('@/adapters', () => ({
  authAdapter: {},
  messageRepository: {},
}))

describe('MessageService', () => {
  const auth: AuthPort = {
    getCurrentUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }

  const messages: MessageRepository = {
    findAllOrderedByNewest: vi.fn(),
    create: vi.fn(),
  }

  const service = new MessageService(messages, auth)

  beforeEach(() => {
    vi.mocked(auth.getCurrentUser).mockReset()
    vi.mocked(messages.findAllOrderedByNewest).mockReset()
    vi.mocked(messages.create).mockReset()
  })

  it('lists messages from repository', async () => {
    vi.mocked(messages.findAllOrderedByNewest).mockResolvedValue([
      {
        id: 1,
        content: 'hello',
        createdAt: '2026-01-01T00:00:00.000Z',
        authorName: 'Alice',
      },
    ])

    await expect(service.listMessages()).resolves.toEqual([
      {
        id: 1,
        content: 'hello',
        createdAt: '2026-01-01T00:00:00.000Z',
        authorName: 'Alice',
      },
    ])
  })

  it('rejects message creation when user is not authenticated', async () => {
    vi.mocked(auth.getCurrentUser).mockResolvedValue(null)

    await expect(service.createMessage('hello')).rejects.toBeInstanceOf(
      UnauthorizedError
    )
    expect(messages.create).not.toHaveBeenCalled()
  })

  it('rejects invalid message content', async () => {
    vi.mocked(auth.getCurrentUser).mockResolvedValue({ id: 'user-1' })

    await expect(service.createMessage('')).rejects.toBeInstanceOf(
      ValidationError
    )
    expect(messages.create).not.toHaveBeenCalled()
  })

  it('creates message for authenticated user', async () => {
    vi.mocked(auth.getCurrentUser).mockResolvedValue({ id: 'user-1' })
    vi.mocked(messages.create).mockResolvedValue()

    await service.createMessage('hello')

    expect(messages.create).toHaveBeenCalledWith({
      content: 'hello',
      userId: 'user-1',
    })
  })

  it('propagates persistence errors from repository', async () => {
    vi.mocked(auth.getCurrentUser).mockResolvedValue({ id: 'user-1' })
    vi.mocked(messages.create).mockRejectedValue(
      new PersistenceError('数据库写入失败')
    )

    await expect(service.createMessage('hello')).rejects.toBeInstanceOf(
      PersistenceError
    )
  })
})
