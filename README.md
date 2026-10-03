# 基于 Next.js 全栈框架的【云端留言板】

- **状态：** 功能冻结，只接受文档与保活修复；已实现功能见下一节
- **Live：** [guestbook-cacohe.vercel.app](https://guestbook-cacohe.vercel.app)
- **记录：** [笔记](docs/NOTES.md)（Next.js、Better Auth、Prisma 学习笔记）
- **License：** [MIT](LICENSE)

## 已实现功能

- 使用邮箱和密码注册账号，注册成功后直接进入留言板
- 使用邮箱和密码登录；登录失败时在登录页看到错误提示
- 登出后回到登录页，需要重新登录才能继续使用
- 未登录访问留言板会跳转到登录页；已登录再打开登录/注册页会回到留言板
- 登录后可以发表留言（1–200 字），空内容或超长会被拒绝并提示
- 留言按时间倒序展示，可以看到每条留言的内容和作者

## 技术栈

| 技术                                                  | 在本项目中的应用                         |
| ----------------------------------------------------- | ---------------------------------------- |
| [TypeScript](https://www.typescriptlang.org/)         | 基础编程语言                             |
| [Next.js](https://nextjs.org/) 16                     | 全栈框架                                 |
| [React](https://react.dev/) 19                        | 页面与表单的 UI 层                       |
| [Better Auth](https://www.better-auth.com/)           | 用户认证（邮箱密码注册 / 登录 / 登出）   |
| [Prisma](https://www.prisma.io/)                      | ORM                                      |
| [Neon](https://neon.tech/)                            | Serverless PostgreSQL                    |
| [Zod](https://zod.dev/)                               | 校验留言内容（1–200 字）                 |
| Tailwind CSS 4                                        | 页面样式                                 |
| ESLint、Prettier、Vitest                              | 代码规范、格式化与单元测试               |
| [GitHub Actions](https://github.com/features/actions) | CI：格式检查、Lint、类型检查、测试与构建 |
| [Vercel](https://vercel.com/)                         | 线上部署                                 |
| pnpm 9                                                | 包管理                                   |

### 数据

数据库是 Neon 上的 PostgreSQL，由 Prisma 访问。数据分两组：

- **认证**：用户、会话、账号、验证信息。由 Better Auth 使用，用来完成邮箱密码注册、登录和登出。
- **留言**：内容、作者、创建时间。作者关联到用户；用户删除时，其会话与留言一并删除。

结构以 Prisma schema 同步到数据库（`db push`），仓库中不保留迁移历史。

### 运行环境

- 本地由 Next.js 开发服务器同时提供页面和服务器逻辑，数据库在 Neon。
- 线上部署在 Vercel，使用同一套环境变量：认证密钥、站点地址、数据库连接串。
- 提交到主分支时，GitHub Actions 执行格式检查、Lint、类型检查、单元测试和生产构建。

## 项目结构

```
web-demo-guestbook/
├── .github/workflows/ci.yml       # CI 流水线
├── docs/
│   └── NOTES.md                   # Next.js / Better Auth / Prisma 学习笔记
├── prisma/
│   └── schema.prisma              # 数据模型（User / Session / Message 等）
├── public/                        # 静态资源
├── src/
│   ├── actions/                   # Server Actions（薄层，调用 application）
│   ├── adapters/                  # 出站适配器
│   │   ├── auth/                  # 认证端口实现（Better Auth）
│   │   ├── message/               # 留言端口实现
│   │   └── db/                    # 共享 Prisma Client
│   ├── app/                       # Next.js 页面与路由（只含路由）
│   │   ├── (auth)/                # 认证页（/login、/signup）
│   │   ├── api/auth/[...all]/     # Better Auth HTTP 端点
│   │   ├── page.tsx               # 首页留言板
│   │   ├── loading.tsx            # 加载骨架屏
│   │   └── error.tsx              # 错误边界
│   ├── application/               # 用例编排（登录、发留言）
│   ├── components/                # 客户端组件
│   ├── domain/                    # 领域模型、校验规则、业务异常
│   ├── ports/                     # 出站端口（认证 / 留言契约）
│   └── proxy.ts                   # 路由守卫（未登录跳转 /login）
├── .env.example                   # 环境变量模板
├── LICENSE
├── package.json
└── vitest.config.ts
```

### 分层职责

| 层级   | 目录                              | 职责                               |
| ------ | --------------------------------- | ---------------------------------- |
| 表现层 | `app/`、`components/`、`actions/` | 页面渲染、表单、Server Actions     |
| 应用层 | `application/`                    | 鉴权、校验、用例编排               |
| 端口   | `ports/`                          | 定义出站契约（认证、留言）         |
| 领域层 | `domain/`                         | 实体、Zod Schema、领域错误         |
| 适配器 | `adapters/`                       | Better Auth、Prisma 等具体技术实现 |

## 快速开始

需要 **Node.js 20+** 和 **pnpm 9**（仓库锁定 `pnpm@9.15.9`）。若未安装 pnpm，可先执行 `corepack enable`。

### 1. 克隆仓库并准备环境变量

Prisma CLI 只读取项目根目录的 **`.env`**，不读取 `.env.local`。Next.js 也会加载 `.env`。统一使用 `.env`。

```bash
git clone https://github.com/cacohe/web-demo-guestbook.git
cd web-demo-guestbook
cp .env.example .env
```

Windows PowerShell 可用 `Copy-Item .env.example .env`。

在 [Neon Console](https://console.neon.tech/) 创建项目，复制 **Direct** 连接串（主机名**不含** `-pooler`）。本项目 schema 只有 `DATABASE_URL`、同步方式是 `db push`，不要用 pooled 连接。

生成 Better Auth 密钥（至少 32 位，CLI 输出可直接用）：

```bash
pnpm dlx @better-auth/cli@latest secret
```

写入 `.env`：

```env
BETTER_AUTH_SECRET=生成的密钥
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://...@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
```

### 2. 安装依赖

```bash
pnpm install
```

`postinstall` 会执行 `prisma generate`。必须先有 `.env` 里的 `DATABASE_URL` 键（上一步复制模板即可），否则 generate 会因缺少环境变量失败。

### 3. 同步数据库 Schema

```bash
pnpm db:push
```

将 `prisma/schema.prisma` 推送到 Neon。本项目没有 `prisma/migrations/`，不要用 `pnpm db:migrate`。

### 4. 启动开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)，应跳转到 `/login`。注册一个账号后进入留言板，发一条留言确认写入成功。

`pnpm install` 与 `pnpm dev` 都会生成 Prisma Client。若 IDE 仍报 `@prisma/client` 类型缺失，重启 TypeScript 服务即可。

若 3000 端口被占用，Next.js 可能改用 3001，此时把 `.env` 里的 `BETTER_AUTH_URL` 改成实际地址后重启。

## 常用命令

```bash
pnpm dev            # 开发（自动生成 Prisma Client）
pnpm build          # 生产构建
pnpm start          # 启动生产服务
pnpm db:generate    # 生成 Prisma Client
pnpm db:push        # 推送 schema 到数据库（本实验使用的方式）
pnpm db:migrate     # Prisma migrate 入口；本仓库无迁移历史，留给未来 starter
pnpm db:studio      # 打开 Prisma Studio
pnpm lint           # ESLint 检查
pnpm typecheck      # TypeScript 类型检查
pnpm test           # 运行单元测试
pnpm format         # Prettier 格式化
pnpm format:check   # 检查代码格式
```

## CI（GitHub Actions）

配置文件：`.github/workflows/ci.yml`

**触发条件**：向 `main` / `master` 分支 push 或发起 Pull Request。

**执行步骤**：

| 步骤        | 命令                             | 说明             |
| ----------- | -------------------------------- | ---------------- |
| 安装依赖    | `pnpm install --frozen-lockfile` | 锁定版本安装     |
| 生成 Client | `pnpm db:generate`               | 生成 Prisma 类型 |
| 格式检查    | `pnpm format:check`              | Prettier         |
| 静态检查    | `pnpm lint`                      | ESLint           |
| 类型检查    | `pnpm typecheck`                 | TypeScript       |
| 单元测试    | `pnpm test`                      | Vitest           |
| 构建        | `pnpm build`                     | Next.js 生产构建 |

CI 使用占位环境变量，无需真实数据库连接即可完成构建。

## 部署（Vercel）

1. 推送代码到 GitHub
2. 在 Vercel 导入仓库
3. 配置环境变量：
   - `BETTER_AUTH_SECRET`（至少 32 位）
   - `BETTER_AUTH_URL`（生产域名，如 `https://your-app.vercel.app`）
   - `DATABASE_URL`（Neon **Direct** 连接串，主机名不含 `-pooler`）
4. 部署

首次部署前，在本地对生产数据库执行 `pnpm db:push`（Prisma 读取的是本地 `.env`）。

## License

[MIT](LICENSE)
