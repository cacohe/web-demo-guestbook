import { PersistenceError } from '@/domain/errors'
import type { CreateMessageInput, Message } from '@/domain/message'
import { prisma } from '@/adapters/db/client'
import type { MessageRepository } from '@/ports/message-repository'
import type { Prisma } from '@prisma/client'

type MessageWithUser = Prisma.MessageGetPayload<{
  include: { user: { select: { name: true } } }
}>

/** 将 Prisma 查询结果映射为领域模型 */
function toMessage(row: MessageWithUser): Message {
  return {
    id: Number(row.id),
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    authorName: row.user.name || '路人',
  }
}

/** 基于 Prisma 的留言适配器，负责与 Neon 数据库交互 */
export class PrismaMessageRepository implements MessageRepository {
  async findAllOrderedByNewest(): Promise<Message[]> {
    try {
      const rows = await prisma.message.findMany({
        include: {
          user: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return rows.map(toMessage)
    } catch {
      throw new PersistenceError('加载留言失败，请稍后重试')
    }
  }

  async create(input: CreateMessageInput): Promise<void> {
    try {
      await prisma.message.create({
        data: {
          content: input.content,
          userId: input.userId,
        },
      })
    } catch {
      throw new PersistenceError('数据库写入失败')
    }
  }
}
