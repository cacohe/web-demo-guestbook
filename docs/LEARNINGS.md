# 学到了什么

## 做了什么

- 邮箱密码注册 / 登录 / 登出，Session 落到 Neon（经 Prisma + Better Auth）。
- 登录后发留言、按时间倒序列表；内容用 Zod 限制 1–200 字。
- 留言路径做成 Domain → Service → Repository → Infrastructure；Server Actions 只做适配。
- GitHub Actions：format、lint、typecheck、test、build。占位环境变量即可过 CI，不连真实数据库。
- 部署到 Vercel，作为可点击的 Live Demo。

## 学到了什么

### 1. Server Action 登录必须显式写 Cookie

Better Auth 的 `signIn` / `signUp` 在 Server Action 里不会自动把 `Set-Cookie` 送到浏览器。必须挂 `nextCookies()` 插件。漏掉时：Action 成功、页面跳转、用户仍未登录。

- 代码：`src/infrastructure/auth/better-auth.ts` 的 `plugins: [nextCookies()]`
- 提交：`05b929b`（fix: set session cookies from Server Actions and align password rules）

### 2. Next.js 16 用 `proxy.ts`；边缘只查 Cookie 是否存在

路由守卫文件是 `src/proxy.ts`，不是 `middleware.ts`。边缘层若引入 Better Auth + Prisma，会把数据库客户端打进 Edge bundle。因此这里只检查 Session Cookie 是否存在；伪造 Cookie 可以进到页面，但写操作会在 Service 里被 `getSession` 拒绝。

- 代码：`src/proxy.ts`；写路径：`src/services/message-service.ts` → `auth.getCurrentUser()`
- 提交：`3b7903f`（fix: migrate route guard to Next.js 16 proxy convention）
- 手动验证：无 Cookie 访问 `/` 应跳到 `/login`；有假 Cookie 发留言应失败。

### 3. 密码规则必须同源

前端 `minLength` 与 Better Auth `minPasswordLength` 必须是同一个常量。两处各写一个数字，UI 放行、服务端拒绝，错误表现成「注册失败」而不是「密码太短」。

- 代码：`MIN_PASSWORD_LENGTH` 定义在 `src/infrastructure/auth/better-auth.ts`，注册页从这里 import
- 提交：`05b929b`

分层上这是一处泄漏：页面依赖了 infrastructure。可接受的 Demo 折中；抽 starter 时应把该常量升到 domain 或共享 config。

### 4. 分层有价值的条件是 Service 有规则、仓储可替换

留言创建顺序是：取当前用户 → 未登录抛 `UnauthorizedError` → Zod 校验 → 仓储写入。单测注入假 `AuthRepository` / `MessageRepository`，不启动 Next、不连数据库。

认证侧的 `AuthService` 只是 1:1 转调仓储，没有规则。空 Service 不是领域层，抽模板时不要复制这个空壳。

- 有规则：`src/services/message-service.ts`
- 可替换装配：`src/repositories/index.ts`
- 证据：`src/services/message-service.test.ts`
  - `rejects message creation when user is not authenticated`
  - `rejects invalid message content`
  - `creates message for authenticated user`

### 5. CI 必须能在没有真实数据库时绿

`prisma generate` 和 `next build` 只需要合法形状的 `DATABASE_URL` / `BETTER_AUTH_*`。把密钥和数据库当成 CI 密钥，会让 Demo 仓库的流水线绑死在个人 Neon 上。

- 证据：`.github/workflows/ci.yml` 的 `quality` job 使用占位连接串；push / PR 到 `main` 应全绿。

## 验证了什么

| 声明                       | 怎么复查                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| 未登录不能写留言           | `pnpm test` → MessageService「user is not authenticated」                                         |
| 空内容 / 超 200 字拒绝     | `pnpm test` → `MessageSchema` 与 MessageService validation 用例                                   |
| 登录失败回到登录页并带错误 | `pnpm test` → `src/app/actions/auth.test.ts`                                                      |
| 静态质量门禁               | `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build` 或看 GitHub Actions |
| 端到端能发一条留言         | 打开 [Live Demo](https://guestbook-cacohe.vercel.app)，注册、登录、提交一条，刷新仍在             |

未验证（有意不做）：限流、安全响应头、Prisma migrate、仓储/E2E 测试、邮箱验证、OAuth。见 [DECISIONS.md](./DECISIONS.md)。
