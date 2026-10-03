'use client'

import { useActionState, useEffect, useRef } from 'react'
import { addMessage, type MessageActionState } from '@/actions/message'

const initialState: MessageActionState = {}

/** 留言表单：通过 useActionState 展示提交状态与错误信息 */
export default function MessageForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(
    addMessage,
    initialState
  )

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state.success])

  return (
    <div className="mb-8">
      {state.error && (
        <div className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <form ref={formRef} action={formAction} className="flex gap-2">
        <input
          name="content"
          maxLength={200}
          disabled={isPending}
          className="flex-1 rounded border p-2 text-black disabled:opacity-60"
          placeholder="聊聊吧..."
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {isPending ? '发送中...' : '发送'}
        </button>
      </form>
    </div>
  )
}
