const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

Component({
  properties: {
    letter: { type: String, value: '' },
    size: { type: String, value: 'normal' },
    selected: { type: Boolean, value: false },
    disabled: { type: Boolean, value: false },
  },

  data: {
    isVowel: false,
    tileClass: '',
  },

  observers: {
    'letter, selected, disabled, size'(l: string, s: boolean, d: boolean, sz: string) {
      const cls: string[] = [`tile--${sz}`];
      if (s) cls.push('tile--selected');
      if (d) cls.push('tile--disabled');
      if (VOWELS.has(l.toLowerCase())) cls.push('tile--vowel');
      else if (l) cls.push('tile--consonant');
      this.setData({ isVowel: VOWELS.has(l.toLowerCase()), tileClass: cls.join(' ') });
    },
  },

  methods: {
    onTap() {
      if (!this.data.disabled) {
        this.triggerEvent('tap', { letter: this.data.letter });
      }
    },
  },
});
