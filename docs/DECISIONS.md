# 决策记录

只记录会影响下一份 Web 项目默认选项的决定。本仓库功能已冻结；要改这些默认值，去未来的 starter，不要在本实例上试验。

## 1. 认证用 Better Auth，不手写 Session

**上下文：** 需要邮箱密码、Cookie Session、与 Prisma/Postgres 共存，跑在 Next.js App Router 的 Server Action 上。

**决策：** 使用 Better Auth + `prismaAdapter`，HTTP 入口挂在 `src/app/api/auth/[...all]/route.ts`。不自建 JWT、不在本项目引入 NextAuth。

**后果：** 登录态与 User/Session/Account/Verification 表由库生成和维护，业务代码只面对 `AuthRepository`。集成成本集中在两处：Server Action 必须 `nextCookies()`；边缘守卫不能整包引入 Better Auth。

**不选 NextAuth：** 当时目标是验证「新认证库 + Server Actions」这条路径，而不是再做一遍 Auth.js 教程。

## 2. 留言走分层；认证不硬造领域规则

**上下文：** Demo 只有一个业务实体（留言），但后续希望把目录结构当成个人 Web 骨架。

**决策：**

- 留言：Action 适配 → `MessageService`（鉴权 + Zod）→ `MessageRepository` 接口 → Prisma 实现。
- 认证：Action → `AuthService` → Better Auth 仓储。`AuthService` 没有额外规则，保留只是为了与留言路径目录对称。

**后果：** 留言路径可单测、可换存储。认证路径多了一层空转。抽 starter 时认证应直接走仓储或 Better Auth，不要复制空 `AuthService`。

**不把所有东西塞进 `app/`：** 那会让「可替换存储 / 可测业务规则」无法演示。也不引入 IoC 容器：构造器默认参数 + `repositories/index.ts` 单例已经够用。

## 3. 边缘守卫只检查 Cookie 存在性

**上下文：** 未登录用户应被挡在留言板外；已登录用户不应停留在登录/注册页。

**决策：** `src/proxy.ts` 用 `getSessionCookie` 判断「像不像已登录」。真正的 Session 校验发生在 Service / Server Action 调用 `auth.api.getSession` 时。

**后果：** 伪造 Cookie 可能看到空壳页面，不能成功写入。Edge bundle 不包含 Prisma。这是成本权衡，不是完整安全模型。

**不做：** 在 proxy 里做完整鉴权、把数据库客户端引进 Edge。

## 4. 本项目用 `db push`，不上 migrate

**上下文：** 个人 Neon、单人 Demo、schema 改动少。`package.json` 里有 `db:migrate` 脚本，但仓库没有 `prisma/migrations/`。

**决策：** 本地与首次部署用 `pnpm db:push` 同步 schema。不在本仓库维护迁移历史。

**后果：** 无法演示生产级 schema 变更。README 不再把 migrate 写成「本项目的生产实践」。迁移流程属于未来 `web-starter` 的生产基线，不属于本 Lab。

## 5. 公开 Demo 不做生产加固

**上下文：** 仓库和 Live Demo 都是公开的，用途是证明闭环，不是承载真实用户。

**决策：** 不限流、不配安全响应头、不做邮箱验证 / 密码重置 / OAuth、不做 E2E。`next.config.ts` 保持空配置。

**后果：** 滥用登录和刷留言在技术上可行。任何人把本仓库当生产模板，必须先补这些，而不是 fork 后直接上线。

**边界：** 能证明的是认证 + 校验 + 分层 + CI + Serverless 部署。不能证明运维与安全基线。
