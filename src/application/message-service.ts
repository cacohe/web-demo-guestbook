import { UnauthorizedError, ValidationError } from '@/domain/errors'
import { MessageSchema, type Message } from '@/domain/message'
import type { AuthPort } from '@/ports/auth-port'
import type { MessageRepository } from '@/ports/message-repository'
import { authAdapter, messageRepository } from '@/adapters'

/** 留言相关的编排器：用于处理留言相关的业务逻辑 */
export class MessageService {
  constructor(
    private readonly messages: MessageRepository = messageRepository,
    private readonly auth: AuthPort = authAdapter
  ) {}

  /** 获取留言列表 */
  async listMessages(): Promise<Message[]> {
    return this.messages.findAllOrderedByNewest()
  }

  /** 创建留言 */
  async createMessage(content: unknown): Promise<void> {
    const user = await this.auth.getCurrentUser()

    if (!user) {
      throw new UnauthorizedError()
    }

    const validated = MessageSchema.safeParse({ content })

    if (!validated.success) {
      throw new ValidationError(
        validated.error.flatten().fieldErrors.content?.[0] ?? '输入无效'
      )
    }

    await this.messages.create({
      content: validated.data.content,
      userId: user.id,
    })
  }
}

export const messageService = new MessageService()
