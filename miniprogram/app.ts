/// <reference path="../typings/index.d.ts" />
/**
 * 自然拼读星 - 应用入口
 */

import { userStore } from './store/user.store';
import { ensureLogin, CLOUD_ENV } from './services/auth.service';

App<IAppOption>({
  globalData: {
    appName: '自然拼读星',
    version: '0.1.0',
  },

  onLaunch() {
    console.log('[自然拼读星] 应用启动');

    // 初始化微信云托管环境（env 见 auth.service.ts 的 CLOUD_ENV）
    try {
      const cloud: any = (wx as any).cloud;
      if (cloud && cloud.init) cloud.init({ env: CLOUD_ENV, traceUser: true });
    } catch (e) {
      console.warn('[自然拼读星] wx.cloud.init 失败', e);
    }

    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    console.log('[自然拼读星] 系统信息', {
      platform: systemInfo.platform,
      version: systemInfo.version,
      SDKVersion: systemInfo.SDKVersion,
    });

    // 微信云托管登录 + 无账号自动注册（后端按 openid 完成注册；失败回退本地账号）
    ensureLogin()
      .then((profile) => {
        userStore.setProfile(profile);
        console.log('[自然拼读星] 登录成功', profile.nickname, profile.id);
      })
      .catch((e) => {
        console.warn('[自然拼读星] 登录失败（已回退到本地账号）', e);
      });
  },

  onShow() {
    console.log('[自然拼读星] 应用显示');
  },

  onHide() {
    console.log('[自然拼读星] 应用隐藏');
  },
});
