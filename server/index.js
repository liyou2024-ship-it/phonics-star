/**
 * 自然拼读星 · 微信云托管后端（最小可用版）
 *
 * 关键约定（与小程序端对齐，切勿改动返回结构）：
 *  - 小程序通过 wx.cloud.callContainer 调用本服务，
 *    微信会自动在请求头注入 X-WX-OPENID（真实 openid），后端据此识别用户，无需自己换 openid。
 *  - 统一返回结构：{ code: number, data?: any, message?: string }，code===0 表示成功。
 *  - 登录接口：POST /api/auth/login，小程序会带 { code }（header 缺失 openid 时用于 code2Session 兜底）。
 */

const express = require('express');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
app.use(express.json());

// ───────────────────────── 配置 ─────────────────────────
const PORT = process.env.PORT || 80;
const WX_APPID = process.env.WX_APPID || '';
const WX_APPSECRET = process.env.WX_APPSECRET || '';
// 用户持久化文件（云托管容器磁盘不一定持久，失败则仅内存态，内测够用）
const USERS_FILE = process.env.USERS_FILE || '/data/users.json';

// ───────────────────────── 用户存储 ─────────────────────────
/** @type {Map<string, any>} openid -> user */
const users = new Map();

function loadUsers() {
  try {
    const arr = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    if (Array.isArray(arr)) arr.forEach((u) => users.set(u.openid, u));
  } catch (e) {
    // 文件不存在或读取失败：忽略，使用内存态
  }
}

function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify([...users.values()], null, 2));
  } catch (e) {
    // 磁盘不可写：忽略，仅内存态
  }
}

loadUsers();

function getOrCreateUser(openid) {
  let u = users.get(openid);
  if (!u) {
    u = {
      openid,
      userId: openid,
      nickname: '自然拼读星学员',
      avatarUrl: '',
      role: 'student',
      activeStudentId: 's_mock_001', // 与小程序本地 mock 学生对齐，保证课程流程可用
      phone: '',
      passwordHash: '',
      createdAt: Date.now(),
    };
    users.set(openid, u);
    saveUsers();
  }
  return u;
}

// ───────────────────────── 工具：密码 hash ─────────────────────────
function hashPwd(pwd) {
  const salt = crypto.randomBytes(8).toString('hex');
  const h = crypto.scryptSync(pwd, salt, 32).toString('hex');
  return salt + ':' + h;
}
function verifyPwd(pwd, stored) {
  if (!stored) return false;
  const [salt, h] = stored.split(':');
  if (!salt || !h) return false;
  const hh = crypto.scryptSync(pwd, salt, 32).toString('hex');
  return hh === h;
}

// ───────────────────────── 工具：openid 解析 ─────────────────────────
function openidFromHeader(req) {
  return req.headers['x-wx-openid'] || req.headers['x-wx-openid'.toLowerCase()] || '';
}

/** 没有注入 openid 时（本地联调），用 code 调 code2Session 兜底 */
async function openidFromCode(code) {
  if (!code || !WX_APPID || !WX_APPSECRET) return null;
  try {
    const url =
      'https://api.weixin.qq.com/sns/jscode2session?appid=' +
      WX_APPID +
      '&secret=' +
      WX_APPSECRET +
      '&js_code=' +
      code +
      '&grant_type=authorization_code';
    const r = await fetch(url);
    const j = await r.json();
    return j.openid || null;
  } catch (e) {
    return null;
  }
}

// ───────────────────────── 路由 ─────────────────────────
// 健康检查 / 就绪（云托管启动检测）
app.all(['/', '/healthz'], (req, res) => {
  res.json({ code: 0, message: 'ok' });
});

// 登录（无账号自动注册，由后端按 openid 完成）
app.post('/api/auth/login', async (req, res) => {
  let openid = openidFromHeader(req);
  const code = req.body && req.body.code;
  if (!openid && code) openid = await openidFromCode(code);
  if (!openid) {
    return res.json({ code: 401, message: '无法识别用户身份（缺少 X-WX-OPENID 且 code 换取失败）' });
  }
  const u = getOrCreateUser(openid);
  return res.json({
    code: 0,
    data: {
      userId: u.userId,
      openid: u.openid,
      nickname: u.nickname,
      avatarUrl: u.avatarUrl,
      role: u.role,
      activeStudentId: u.activeStudentId,
      phone: u.phone || '',
      bindPhone: !!u.phone,
    },
  });
});

// 退出登录（无状态，仅清后端标记；本地缓存由小程序端清）
app.post('/api/auth/logout', (req, res) => {
  res.json({ code: 0 });
});

// 账户资料
app.get('/api/user/info', (req, res) => {
  const openid = openidFromHeader(req);
  if (!openid) return res.json({ code: 401, message: '未登录' });
  const u = users.get(openid);
  if (!u) return res.json({ code: 404, message: '用户不存在' });
  return res.json({
    code: 0,
    data: {
      nickname: u.nickname,
      avatarUrl: u.avatarUrl,
      phone: u.phone || '',
      bindPhone: !!u.phone,
      role: u.role,
    },
  });
});

// 修改密码
app.post('/api/user/change-password', (req, res) => {
  const openid = openidFromHeader(req);
  if (!openid) return res.json({ code: 401, message: '未登录' });
  const u = users.get(openid);
  if (!u) return res.json({ code: 404, message: '用户不存在' });
  const body = req.body || {};
  if (u.passwordHash) {
    if (!verifyPwd(body.oldPassword || '', u.passwordHash)) {
      return res.json({ code: 1, message: '原密码错误' });
    }
  }
  if (!body.newPassword || String(body.newPassword).length < 6) {
    return res.json({ code: 1, message: '新密码至少 6 位' });
  }
  u.passwordHash = hashPwd(String(body.newPassword));
  saveUsers();
  return res.json({ code: 0 });
});

// 绑定手机号（暂未开放：真实实现需拿 code 调 wx phonenumber.getPhoneNumber）
app.post('/api/user/bind-phone', (req, res) => {
  const openid = openidFromHeader(req);
  if (!openid) return res.json({ code: 401, message: '未登录' });
  return res.json({
    code: 0,
    data: { bindPhone: false, message: '手机号绑定暂未开放' },
  });
});

// 注销账号（永久删除，不可恢复）
app.post('/api/user/delete', (req, res) => {
  const openid = openidFromHeader(req);
  if (!openid) return res.json({ code: 401, message: '未登录' });
  users.delete(openid);
  saveUsers();
  return res.json({ code: 0 });
});

// 404 兜底
app.use((req, res) => {
  res.json({ code: 404, message: 'Not Found: ' + req.path });
});

app.listen(PORT, () => {
  console.log('[自然拼读星后端] 已启动，监听端口', PORT);
});
