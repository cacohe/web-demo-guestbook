import MessageForm from '@/components/MessageForm'
import { logout } from '@/actions/auth'
import { messageService } from '@/application/message-service'

// 留言数据依赖 Session 与数据库，禁用静态预渲染
export const dynamic = 'force-dynamic'

// 主页面：展示留言板、表单、留言列表
export default async function Home() {
  let messages

  try {
    messages = await messageService.listMessages()
  } catch (error) {
    if (error instanceof Error && error.name === 'PersistenceError') {
      throw new Error(error.message)
    }
    throw error
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">社区留言板</h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-gray-500">
            登出
          </button>
        </form>
      </div>

      <MessageForm />

      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className="rounded border bg-white p-4 text-black shadow-sm"
          >
            <p>{message.content}</p>
            <p className="mt-2 text-xs text-blue-500">@{message.authorName}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
