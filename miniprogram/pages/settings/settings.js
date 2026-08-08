"use strict";
/**
 * 设置页（账户管理）：修改密码 / 退出登录 / 注销账号
 * 仅从「个人页 → 家长模式 → 设置」进入。
 *
 * 注：绑定手机号功能暂时下线（原依赖 getPhoneNumber，需非个人主体+实名）。
 * 后端 client 的 bindPhone / getAccountInfo 仍保留在 account.service，待恢复时直接接 UI。
 */
Object.defineProperty(exports, "__esModule", { value: true });
const user_store_1 = require("../../store/user.store");
const auth_service_1 = require("../../services/auth.service");
const account_service_1 = require("../../services/account.service");
const GUEST = {
    id: 'guest',
    nickname: '游客',
    avatarUrl: '/assets/images/default-avatar.png',
    role: 'student',
    activeStudentId: 's_mock_001',
};
Page({
    data: {
        userId: '',
        loginStatus: '',
        showPwdModal: false,
        oldPwd: '',
        newPwd: '',
        confirmPwd: '',
        pwdSaving: false,
        deleting: false,
    },
    onLoad() {
        this.refreshLoginStatus();
    },
    refreshLoginStatus() {
        const stored = (0, auth_service_1.getStoredUser)();
        this.setData({
            loginStatus: stored ? '已通过微信登录' : '未登录',
            userId: stored ? stored.id : '',
        });
    },
    // ===== 修改密码 =====
    onOpenPwdModal() {
        this.setData({ showPwdModal: true, oldPwd: '', newPwd: '', confirmPwd: '', pwdSaving: false });
    },
    onClosePwdModal() {
        this.setData({ showPwdModal: false });
    },
    /** 阻止弹窗内部点击冒泡到遮罩（用于 catchtap） */
    noop() { },
    onOldPwdInput(e) {
        this.setData({ oldPwd: e.detail.value });
    },
    onNewPwdInput(e) {
        this.setData({ newPwd: e.detail.value });
    },
    onConfirmPwdInput(e) {
        this.setData({ confirmPwd: e.detail.value });
    },
    onSubmitChangePwd() {
        const { oldPwd, newPwd, confirmPwd, pwdSaving } = this.data;
        if (pwdSaving)
            return;
        if (!oldPwd || !newPwd) {
            wx.showToast({ title: '请填写完整', icon: 'none' });
            return;
        }
        if (newPwd !== confirmPwd) {
            wx.showToast({ title: '两次密码不一致', icon: 'none' });
            return;
        }
        this.setData({ pwdSaving: true });
        (0, account_service_1.changePassword)(oldPwd, newPwd)
            .then(() => {
            this.setData({ showPwdModal: false, pwdSaving: false });
            wx.showToast({ title: '密码已修改', icon: 'success' });
        })
            .catch((err) => {
            this.setData({ pwdSaving: false });
            wx.showToast({ title: '修改失败: ' + (err && err.message ? err.message : '未知错误'), icon: 'none' });
        });
    },
    // ===== 退出登录 =====
    onLogout() {
        wx.showModal({
            title: '退出登录',
            content: '确定要退出当前账号吗？',
            success: (res) => {
                if (!res.confirm)
                    return;
                (0, account_service_1.logout)()
                    .then(() => {
                    user_store_1.userStore.setProfile(GUEST);
                    wx.showToast({ title: '已退出', icon: 'success' });
                    setTimeout(() => wx.navigateBack(), 600);
                })
                    .catch((err) => {
                    wx.showToast({ title: '退出失败', icon: 'none' });
                    console.warn('[settings] 退出登录失败', err);
                });
            },
        });
    },
    // ===== 注销账号 =====
    onDeleteAccount() {
        if (this.data.deleting)
            return;
        wx.showModal({
            title: '注销账号',
            content: '注销后账户数据将被永久删除且不可恢复，确定继续吗？',
            confirmColor: '#EF4444',
            success: (res) => {
                if (!res.confirm)
                    return;
                this.setData({ deleting: true });
                (0, account_service_1.deleteAccount)()
                    .then(() => {
                    user_store_1.userStore.setProfile(GUEST);
                    this.setData({ deleting: false });
                    wx.showToast({ title: '账号已注销', icon: 'success' });
                    setTimeout(() => wx.navigateBack(), 600);
                })
                    .catch((err) => {
                    this.setData({ deleting: false });
                    wx.showToast({ title: '注销失败: ' + (err && err.message ? err.message : '未知错误'), icon: 'none' });
                });
            },
        });
    },
});
//# sourceMappingURL=settings.js.map