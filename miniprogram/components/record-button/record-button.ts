Component({
  properties: {
    disabled: { type: Boolean, value: false },
  },

  data: {
    isRecording: false,
    duration: 0,
    hasRecording: false,
    _timer: null as number | null,
    _manager: null as WechatMiniprogram.RecorderManager | null,
  },

  lifetimes: {
    attached() {
      this.data._manager = wx.getRecorderManager();
      this.data._manager.onStop((res) => {
        this.setData({ isRecording: false, hasRecording: true });
        this.triggerEvent('record', { tempFilePath: res.tempFilePath, duration: this.data.duration });
      });
    },
    detached() {
      if (this.data._timer) clearInterval(this.data._timer);
    },
  },

  methods: {
    startRecord() {
      if (this.data.disabled || this.data.isRecording) return;
      this.data._manager!.start({ duration: 30000, format: 'mp3' });
      this.setData({ isRecording: true, duration: 0 });
      this.data._timer = setInterval(() => {
        this.setData({ duration: this.data.duration + 1 });
      }, 1000);
    },

    stopRecord() {
      if (!this.data.isRecording) return;
      this.data._manager!.stop();
      if (this.data._timer) { clearInterval(this.data._timer); this.data._timer = null; }
    },

    playRecord() {
      this.triggerEvent('play');
    },

    onTap() {
      if (this.data.isRecording) this.stopRecord();
      else if (this.data.hasRecording) this.playRecord();
      else this.startRecord();
    },
  },
});
