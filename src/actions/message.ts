'use server'

import { messageService } from '@/application/message-service'
import { revalidatePath } from 'next/cache'

export type MessageActionState = {
  error?: string
  success?: boolean
}

/** 创建留言 Server Action：供 useActionState 消费，返回 UI 可展示的状态 */
export async function addMessage(
  _prevState: MessageActionState,
  formData: FormData
): Promise<MessageActionState> {
  try {
    await messageService.createMessage(formData.get('content'))
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.name === 'UnauthorizedError') {
      return { error: error.message }
    }

    if (error instanceof Error && error.name === 'ValidationError') {
      return { error: error.message }
    }

    if (error instanceof Error && error.name === 'PersistenceError') {
      return { error: error.message }
    }

    return { error: '操作失败，请稍后重试' }
  }
}
