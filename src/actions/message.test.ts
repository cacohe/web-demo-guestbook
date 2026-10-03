import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  PersistenceError,
  UnauthorizedError,
  ValidationError,
} from '@/domain/errors'

const { createMessageMock, revalidatePathMock } = vi.hoisted(() => ({
  createMessageMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}))

vi.mock('@/application/message-service', () => ({
  messageService: {
    createMessage: createMessageMock,
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
}))

describe('message actions', () => {
  beforeEach(() => {
    createMessageMock.mockReset()
    revalidatePathMock.mockReset()
  })

  it('returns success and revalidates home after creating a message', async () => {
    createMessageMock.mockResolvedValue(undefined)

    const { addMessage } = await import('@/actions/message')
    const formData = new FormData()
    formData.set('content', 'hello')

    await expect(addMessage({}, formData)).resolves.toEqual({ success: true })

    expect(createMessageMock).toHaveBeenCalledWith('hello')
    expect(revalidatePathMock).toHaveBeenCalledWith('/')
  })

  it('returns unauthorized error without revalidating', async () => {
    createMessageMock.mockRejectedValue(new UnauthorizedError())

    const { addMessage } = await import('@/actions/message')
    const formData = new FormData()
    formData.set('content', 'hello')

    await expect(addMessage({}, formData)).resolves.toEqual({
      error: '请先登录',
    })
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('returns validation error without revalidating', async () => {
    createMessageMock.mockRejectedValue(new ValidationError('留言不能为空'))

    const { addMessage } = await import('@/actions/message')
    const formData = new FormData()
    formData.set('content', '')

    await expect(addMessage({}, formData)).resolves.toEqual({
      error: '留言不能为空',
    })
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('returns persistence error without revalidating', async () => {
    createMessageMock.mockRejectedValue(new PersistenceError())

    const { addMessage } = await import('@/actions/message')
    const formData = new FormData()
    formData.set('content', 'hello')

    await expect(addMessage({}, formData)).resolves.toEqual({
      error: '数据保存失败',
    })
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('returns a generic error for unexpected failures', async () => {
    createMessageMock.mockRejectedValue(new Error('boom'))

    const { addMessage } = await import('@/actions/message')
    const formData = new FormData()
    formData.set('content', 'hello')

    await expect(addMessage({}, formData)).resolves.toEqual({
      error: '操作失败，请稍后重试',
    })
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })
})
