# Vulplink Cloudflare 与 Supabase 设置手册

这份手册用于把 Vulplink 从 GitHub 部署到一个 Cloudflare Worker，并连接 Supabase 数据库、后台登录、图片存储和邮件发送。公开网站仍使用 `/`、`/product`、`/product/产品名称`、`/contact`；后台使用 `/admin`，不会出现公开的 `/api` 页面。

> 重要：任何 `service_role`、API Token、Resend API Key 或密码，都不能写入 GitHub 文件、Issue、聊天或截图。它们只能放入 GitHub、Cloudflare 或 Supabase 的 Secret 设置。

## 一 设置前需要的账号

- GitHub：可以管理 `ethanloseweight/VulplinkWeb`
- Cloudflare：可以创建和管理 Workers
- Supabase：可以管理项目、数据库、Authentication 和 Edge Functions
- Resend：用于实际发送网站邮件，并已验证发件域名
- 旧 WordPress：迁移正式产品和媒体时需要后台或服务器权限

项目地址：<https://github.com/ethanloseweight/VulplinkWeb>

## 二 先设置 Supabase

### 1 创建项目并取得网址和密钥

1. 登录 Supabase，新建项目。
2. 打开项目右上角的 **Connect**，或进入 **Settings → API Keys**。
3. 记录 Project URL。本项目已经确认是 `https://tzlzyhogpcjfkjekjzjp.supabase.co`。
4. 复制 Publishable key；如果项目仍显示旧密钥，也可以使用 `anon` key。
5. 复制旧版 `service_role` key，留给 Cloudflare Worker 使用。

对应关系：

| 稍后要填写的名称 | Supabase 中复制的值 | 是否保密 |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://tzlzyhogpcjfkjekjzjp.supabase.co` | 否 |
| `VITE_SUPABASE_ANON_KEY` | Publishable key，或旧版 `anon` key | 否；Worker 运行时从 Cloudflare 注入 |
| `SUPABASE_URL` | `https://tzlzyhogpcjfkjekjzjp.supabase.co` | 否 |
| `SUPABASE_SERVICE_ROLE_KEY` | 旧版 `service_role` key | **是，绝不能放进 GitHub 文件** |

注意：本项目现在的 Worker 代码使用变量名 `SUPABASE_SERVICE_ROLE_KEY`，所以这里必须放 `service_role`，不能放 Publishable key。Supabase 的 Publishable key 可以出现在浏览器应用中；`service_role` 具有高权限，只能在服务器端使用。

### 2 建立数据库

1. 在 GitHub 打开 [`supabase/migrations/001_initial.sql`](https://github.com/ethanloseweight/VulplinkWeb/blob/main/supabase/migrations/001_initial.sql)。
2. 复制整个文件内容。
3. 在 Supabase 打开 **SQL Editor → New query**。
4. 粘贴后按 **Run**。
5. 确认没有红色错误。

这个 SQL 会建立产品、分类、网站设置、联络表单、管理员名单、Storage Bucket 和 Row Level Security 规则。

### 3 建立第一位管理员

1. 打开 **Authentication → Users → Add user**。
2. 输入后台管理员的 Email 和密码，并建立用户。
3. 打开该用户，复制 User UUID。
4. 回到 **SQL Editor** 执行：

```sql
insert into public.admin_users(user_id)
values ('把这里换成刚才复制的 User UUID');
```

完成后，这个账号可以在 `https://你的域名/admin` 登录。

### 4 部署邮件 Edge Function

邮件程序已经在 GitHub 的 [`supabase/functions/send-contact-email/index.ts`](https://github.com/ethanloseweight/VulplinkWeb/blob/main/supabase/functions/send-contact-email/index.ts)。在电脑终端进入下载后的项目目录，然后执行：

```bash
npx supabase login
npx supabase link --project-ref tzlzyhogpcjfkjekjzjp
npx supabase functions deploy send-contact-email
```

本项目的 Project ID 是 `tzlzyhogpcjfkjekjzjp`。

### 5 在 Supabase 添加邮件 Secrets

打开 **Supabase Dashboard → Edge Functions → Secrets**，逐项添加：

| Name | Value 从哪里取得 | 是否保密 |
|---|---|---|
| `RESEND_API_KEY` | Resend → API Keys → Create API Key | **是** |
| `CONTACT_FROM_EMAIL` | 已在 Resend 验证的发件地址，例如 `Vulplink <website@vulplink.com>` | 否 |
| `SALES_EMAIL` | 接收销售询价的邮箱 | 否 |
| `SUPPORT_EMAIL` | 接收售后问题的邮箱 | 否 |

`CONTACT_FROM_EMAIL` 的域名必须先在 Resend 验证，否则邮件会发送失败。保存这些值后不需要重新部署 Edge Function。

## 三 在 GitHub 添加部署 Secrets

不要修改文件来填写这些值。请打开：

**GitHub 仓库 → Settings → Secrets and variables → Actions → Secrets → New repository secret**

仓库：<https://github.com/ethanloseweight/VulplinkWeb/settings/secrets/actions>

现在只需要添加两项 Cloudflare 部署凭据：

| Name | Value 从哪里取得 | 用途 |
|---|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID | 让 GitHub 知道部署到哪个账号 |
| `CLOUDFLARE_API_TOKEN` | Cloudflare → Account API Tokens → Create Token | 允许 GitHub 部署 Worker |

Supabase URL 和 Publishable/anon key 不需要放在 GitHub。部署时 Worker 会从 Cloudflare Runtime Variables 注入它们。

Cloudflare Token 建议选择 **Edit Cloudflare Workers**，并只授权 Vulplink 所在的 Cloudflare Account。Token 只会显示一次；复制后直接放入 GitHub Secret，不要贴到 GitHub 文件。

本项目的部署流程在 [`.github/workflows/deploy.yml`](https://github.com/ethanloseweight/VulplinkWeb/blob/main/.github/workflows/deploy.yml)。

## 四 第一次部署 Cloudflare Worker

1. 打开 GitHub 仓库的 **Actions**。
2. 选择 **Deploy Vulplink Worker**。
3. 按 **Run workflow**，分支选择 `main`。
4. 等待所有步骤显示绿色。
5. 部署完成后，Cloudflare 中会出现名称为 `vulplink` 的 Worker。

Actions 页面：<https://github.com/ethanloseweight/VulplinkWeb/actions/workflows/deploy.yml>

## 五 在截图页面添加 Cloudflare Runtime Variables and Secrets

打开：

**Cloudflare Dashboard → Workers & Pages → vulplink → Settings → Variables and Secrets → Add variable**

本项目已经把两个不敏感的值写入 GitHub 的 [`wrangler.toml`](https://github.com/ethanloseweight/VulplinkWeb/blob/main/wrangler.toml)，部署时会自动带入：

```toml
[vars]
SUPABASE_URL = "https://tzlzyhogpcjfkjekjzjp.supabase.co"
SUPABASE_EMAIL_FUNCTION = "send-contact-email"
```

所以在你截图的 **Runtime variables and secrets** 区域，需要添加以下两项：

| Type | Name | Value |
|---|---|---|
| Variable | `SUPABASE_ANON_KEY` | Supabase Publishable key 或旧版 `anon` key |
| Secret | `SUPABASE_SERVICE_ROLE_KEY` | Supabase 旧版 `service_role` key |

操作时：

1. 按右上角 **Add variable**。
2. Name 复制表格中的名称，大小写必须完全一致。
3. `SUPABASE_ANON_KEY` 的 Type 选 **Variable**；它是公开浏览器密钥。
4. `SUPABASE_SERVICE_ROLE_KEY` 的 Type 必须选 **Secret**。
4. 保存后不要截图显示 Secret 的值。

`SUPABASE_URL` 和 `SUPABASE_EMAIL_FUNCTION` 已经在 `wrangler.toml` 中维护。`SUPABASE_ANON_KEY` 由 Worker 在请求 HTML 时注入给浏览器，因此 GitHub 不需要 `.env` 或 `VITE_*` Secret。

## 六 域名设置

Worker 正常运行后，在 Cloudflare 打开：

**Workers & Pages → vulplink → Settings → Domains and Routes → Add → Custom Domain**

先绑定测试子域名，确认网站、后台和邮件正常后，再切换正式域名。最终请检查：

- `https://你的域名/`
- `https://你的域名/product`
- `https://你的域名/product/任一产品slug`
- `https://你的域名/contact`
- `https://你的域名/admin`

网站没有公开 `/api` 路由。表单内部提交地址是 `POST /contact/submit`，不需要让访客直接打开。

## 七 哪些内容可以自己在 GitHub 更新

在 GitHub 打开文件后，可以按铅笔图标编辑并提交到 `main`。修改完成后，再到 Actions 手动运行 **Deploy Vulplink Worker**。

| 想修改的内容 | GitHub 文件位置 |
|---|---|
| 首页文字和区块 | [`src/pages/Home.tsx`](https://github.com/ethanloseweight/VulplinkWeb/blob/main/src/pages/Home.tsx) |
| 产品列表页面 | [`src/pages/Products.tsx`](https://github.com/ethanloseweight/VulplinkWeb/blob/main/src/pages/Products.tsx) |
| 产品详情页面结构 | [`src/pages/ProductDetail.tsx`](https://github.com/ethanloseweight/VulplinkWeb/blob/main/src/pages/ProductDetail.tsx) |
| Contact 页面文字 | [`src/pages/Contact.tsx`](https://github.com/ethanloseweight/VulplinkWeb/blob/main/src/pages/Contact.tsx) |
| Privacy 和 Terms 文字 | [`src/pages/Legal.tsx`](https://github.com/ethanloseweight/VulplinkWeb/blob/main/src/pages/Legal.tsx) |
| 默认 Email 电话和地址 | [`src/types.ts`](https://github.com/ethanloseweight/VulplinkWeb/blob/main/src/types.ts) 中的 `defaultSettings` |
| WordPress 原样式 | [`src/styles/theme.css`](https://github.com/ethanloseweight/VulplinkWeb/blob/main/src/styles/theme.css) |
| 迁移补充样式及后台样式 | [`src/styles/migration.css`](https://github.com/ethanloseweight/VulplinkWeb/blob/main/src/styles/migration.css) |
| Worker 名称和静态路由设置 | [`wrangler.toml`](https://github.com/ethanloseweight/VulplinkWeb/blob/main/wrangler.toml) |
| 邮件主题和正文 | [`supabase/functions/send-contact-email/index.ts`](https://github.com/ethanloseweight/VulplinkWeb/blob/main/supabase/functions/send-contact-email/index.ts)；修改后要重新部署 Edge Function |
| Cloudflare 部署步骤 | [`.github/workflows/deploy.yml`](https://github.com/ethanloseweight/VulplinkWeb/blob/main/.github/workflows/deploy.yml) |

产品、分类、轮播图片、联系资料和已收到的表单，优先在 `/admin` 后台修改，不需要直接改代码。只有后台没有数据时，`src/types.ts` 的 `defaultSettings` 才会作为备用内容显示。

## 八 绝对不能放进 GitHub 的内容

- `SUPABASE_SERVICE_ROLE_KEY`
- 任何 Supabase Secret key
- `CLOUDFLARE_API_TOKEN`
- `RESEND_API_KEY`
- 管理员密码
- `.env` 或 `.dev.vars` 中的真实值

`.env.example` 只能保留变量名称和假示例。不要把真实 `.env` 上传到 GitHub。

如果 Secret 曾经被提交到 GitHub，不要只删除文件；必须立即到对应平台撤销或轮换该密钥，然后更新 Secret 设置。

## 九 完成后的测试清单

- [ ] GitHub Action 全部为绿色
- [ ] 首页和 `/product` 正常显示
- [ ] 产品详情网址使用 `/product/slug`
- [ ] `/admin` 可以登录，普通用户不能进入后台
- [ ] 后台可以新增、修改、隐藏产品
- [ ] 上传图片后可以正常显示
- [ ] Sales 表单能写入 Supabase `contact_submissions`
- [ ] Support 表单能写入 Supabase `contact_submissions`
- [ ] 销售邮箱和客服邮箱都能收到通知
- [ ] 访客能收到确认邮件
- [ ] Cloudflare Runtime 页面没有把 `service_role` 错设为普通 Variable

## 十 常见问题

### GitHub Action 显示红色

先打开失败步骤。最常见原因是两个 Cloudflare GitHub Secret 缺失、名称拼错，或 Cloudflare Token 没有 Worker 编辑权限。

### 网站打开但没有产品

检查 Cloudflare Runtime Variables 中的 `SUPABASE_URL`、`SUPABASE_ANON_KEY`，并确认数据库 SQL 已执行、产品的 `published` 为 true。

### 表单显示收到但邮件未发送

表单资料可能已经写入数据库。检查 Supabase Edge Function 日志、`RESEND_API_KEY`、发件域名验证，以及 `SALES_EMAIL` 和 `SUPPORT_EMAIL`。

### 修改 GitHub 后网站没有变化

本项目目前使用手动部署。每次提交后，需要到 GitHub Actions 重新运行 **Deploy Vulplink Worker**。

## 官方参考

- Cloudflare Worker Secrets：<https://developers.cloudflare.com/workers/configuration/secrets/>
- Cloudflare GitHub Actions：<https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/>
- GitHub Actions Secrets：<https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets>
- Supabase API Keys：<https://supabase.com/docs/guides/getting-started/api-keys>
- Supabase Edge Function Secrets：<https://supabase.com/docs/guides/functions/secrets>
- Supabase Edge Function 部署：<https://supabase.com/docs/guides/functions/deploy>
