'use server'

import { authService } from '@/application/auth-service'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

/** 登录 Server Action：调用 AuthService，将领域错误转为 URL 参数提示 */
export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    await authService.login(email, password)
  } catch (error) {
    if (error instanceof Error && error.name === 'InvalidCredentialsError') {
      redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }
    throw error
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

/** 注册 Server Action：调用 AuthService，将领域错误转为 URL 参数提示 */
export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    await authService.signup(email, password)
  } catch (error) {
    if (error instanceof Error && error.name === 'RegistrationError') {
      redirect(`/signup?error=${encodeURIComponent(error.message)}`)
    }
    throw error
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

/** 登出 Server Action：调用 AuthService，重定向到登录页 */
export async function logout() {
  await authService.logout()
  redirect('/login')
}
