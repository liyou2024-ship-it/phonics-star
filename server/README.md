# 自然拼读星 · 后端（微信云托管）

小程序端通过 `wx.cloud.callContainer` 调用本服务，微信会自动在请求头注入 `X-WX-OPENID`（真实 openid），后端据此识别用户，**无需自己拿 code 换 openid**。

## 接口清单（与小程序端已对齐）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/auth/login` | 登录 / 无账号自动注册，返回用户档案 |
| POST | `/api/auth/logout` | 退出登录（无状态） |
| GET  | `/api/user/info` | 获取账户资料（手机号等） |
| POST | `/api/user/change-password` | 修改密码 `{oldPassword,newPassword}` |
| POST | `/api/user/bind-phone` | 绑定手机号（暂为桩，未开放） |
| POST | `/api/user/delete` | 注销账号 |

> 统一返回结构：`{ code: number, data?: any, message?: string }`，`code===0` 为成功。

## 微信云托管部署步骤

1. 微信公众平台 → 你的小程序 → **云开发 / 云托管** → 绑定 GitHub 仓库 `liyou2024-ship-it/phonics-star`（分支 `main`）。
2. 新建**服务**，来源选「代码仓库」：
   - 仓库：`phonics-star`
   - 分支：`main`
   - **Dockerfile 路径**：`/Dockerfile`（仓库根目录，已提供）
   - 构建目录：默认 `/` 即可（Dockerfile 内只 COPY `server/`）
3. **服务设置 → 环境变量**（可选）：
   - `PORT`：可不填，平台默认注入 `80`
   - `WX_APPID` / `WX_APPSECRET`：仅当你在**本地联调**（无 `X-WX-OPENID` 注入）需要 code 换取 openid 时填；正式云托管环境由微信注入 openid，可不填。
4. 保存并**部署**（建议先部署「测试环境」），部署完成后平台会分配一个公网域名。
5. 小程序端无需改代码：`auth.service.ts` 的 `LOGIN_PATH='/api/auth/login'`、`account.service.ts` 的各路径均已匹配；只需确保 `cloud.client.ts` 的 `CLOUD_ENV` 指向本服务所在环境（`prod-d0gmqqe4yc47dd703`）。

## 本地联调

```bash
cd server
npm install
PORT=3000 node index.js
# 模拟微信注入 openid 调用登录：
curl -X POST http://localhost:3000/api/auth/login \
  -H 'content-type: application/json' \
  -H 'x-wx-openid: test_openid_123' \
  -d '{"code":"ignored"}'
```

> 容器内用户数据默认落到 `/data/users.json`（云托管磁盘不一定持久，跨重启可能清空；正式持久化建议接 TencentDB）。内测阶段内存态足够。
