import { z } from 'zod'

/** 留言内容的校验规则 */
export const MessageSchema = z.object({
  content: z.string().min(1, '留言不能为空').max(200, '最多200字'),
})

/** 领域模型：留言（与数据库表结构解耦） */
export type Message = {
  id: number
  content: string
  createdAt: string
  authorName: string
}

/** 创建留言输入：用于创建留言的领域模型 */
export type CreateMessageInput = {
  content: string
  userId: string
}
