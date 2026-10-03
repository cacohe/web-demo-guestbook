/** 密码最短长度：注册页与 Better Auth 共用，避免两边各写一个数字 */
export const MIN_PASSWORD_LENGTH = 8

/** 领域模型：当前登录用户 */
export type User = {
  id: string
  email?: string
}
