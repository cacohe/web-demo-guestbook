import type { CreateMessageInput, Message } from '@/domain/message'

/** 留言端口：应用层通过此契约访问留言数据，不依赖具体 ORM */
export interface MessageRepository {
  findAllOrderedByNewest(): Promise<Message[]>
  create(input: CreateMessageInput): Promise<void>
}
