/**
 * 练习题目生成器
 */

import { PracticeQuestion, PracticeMode } from './types';
import { randomPick, shuffle } from '../../utils/random';
import phonemes from '../../data/phonemes.json';
import words from '../../data/words.json';
import wordFamilies from '../../data/word-families.json';
import { progressStore } from '../../store/progress.store';

type PhonemeData = typeof phonemes[number];
type WordData = typeof words[number];
type FamilyData = typeof wordFamilies[number];

const ALPHABET_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/** 生成"听音辨字母"题目 */
export function generateListenQuestions(): PracticeQuestion[] {
  const questions: PracticeQuestion[] = [];
  const pool = shuffle([...ALPHABET_LETTERS]);

  for (let i = 0; i < 5 && i < pool.length; i++) {
    const letter = pool[i];
    const ph = phonemes.find(p => p.displayName.toLowerCase().includes(letter)) || randomPick(phonemes);

    const others = ALPHABET_LETTERS.filter(l => l !== letter);
    const distractors = shuffle(others).slice(0, 3);
    const options = shuffle([letter, ...distractors]);

    questions.push({
      id: uid('listen'),
      type: 'listen',
      prompt: `请听声音，选择对应的字母`,
      audioUrl: ph.audioUrl,
      options,
      correctIndex: options.indexOf(letter),
      explanation: `${letter.toUpperCase()} 的发音是 ${ph.symbol}，试试跟读吧！`,
    });
  }
  return questions;
}

/** 生成"听音拼单词"题目 */
export function generateSpellQuestions(): PracticeQuestion[] {
  const questions: PracticeQuestion[] = [];
  const pool = shuffle([...words]).slice(0, 5);

  for (const word of pool) {
    const letters = word.text.toLowerCase().split('');
    const otherLetters = ALPHABET_LETTERS.filter(l => !letters.includes(l));
    const distractors = shuffle(otherLetters).slice(0, 2);
    const options = shuffle([...letters, ...distractors]);

    questions.push({
      id: uid('spell'),
      type: 'spell',
      prompt: `请听单词，拼出正确拼写（${word.meaning}）`,
      audioUrl: word.audioUrl,
      options,
      correctIndex: -1, // 特殊标记：用字母选择拼接
      explanation: `${word.text} 的正确拼写是 ${letters.join('')}，单词意思是"${word.meaning}"。`,
    });
  }
  return questions;
}

/** 生成"词族训练"题目 */
export function generateFamilyQuestions(): PracticeQuestion[] {
  const questions: PracticeQuestion[] = [];
  const families = shuffle([...wordFamilies]);

  // 题1-2: 找出同族词
  for (let i = 0; i < 2 && i < families.length; i++) {
    const family = families[i];
    const correct = words.find(w => w.familyId === family.id);
    if (!correct) continue;

    const wrongList = words.filter(w => w.familyId !== family.id && w.familyId);
    const wrongPicks = shuffle(wrongList).slice(0, 3);
    const options = shuffle([correct.text, ...wrongPicks.map(w => w.text)]);

    questions.push({
      id: uid('family_match'),
      type: 'family',
      prompt: `以下哪个单词属于「${family.name}」词族？`,
      options,
      correctIndex: options.indexOf(correct.text),
      explanation: `${correct.text} 属于 ${family.name} 词族，这些词都以 ${family.name} 结尾。`,
    });
  }

  // 题3-4: 替换首音
  for (let i = 0; i < 2 && i < families.length; i++) {
    const family = families[i % families.length];
    const base = family.name.slice(1); // e.g. "at" from "-at"

    const consonants = ALPHABET_LETTERS.filter(l => !'aeiou'.includes(l));
    const from = randomPick(consonants);
    const to = randomPick(consonants.filter(c => c !== from));
    const correct = `${to}${base}`;
    const distractors = shuffle(
      ALPHABET_LETTERS.filter(l => l !== to)
        .slice(0, 3)
        .map(l => `${l}${base}`)
    );
    const options = shuffle([correct, ...distractors]);

    questions.push({
      id: uid('family_replace'),
      type: 'family',
      prompt: `把「${from}${base}」的首音换成 /${to}/，变成什么单词？`,
      options,
      correctIndex: options.indexOf(correct),
      explanation: `${from}${base} → ${correct}，把首音 /${from}/ 换成 /${to}/ 后的新词是 ${correct}。`,
    });
  }

  // 题5: 归类到词族
  if (families.length > 0) {
    const family = families[0];
    const familyWords = words.filter(w => w.familyId === family.id).slice(0, 4);
    const otherWords = words.filter(w => w.familyId !== family.id && w.familyId).slice(0, 1);
    const mixed = shuffle([...familyWords.map(w => w.text), ...otherWords.map(w => w.text)]);

    questions.push({
      id: uid('family_sort'),
      type: 'family',
      prompt: `哪些词属于「${family.name}」词族？（多选）`,
      options: mixed,
      correctIndex: -1, // 多选用不同逻辑处理
      explanation: `属于 ${family.name} 词族的词有：${familyWords.map(w => w.text).join('、')}`,
    });
  }

  return questions.slice(0, 5);
}

/** 生成错题复习题目（从进度数据中提取弱项） */
export function generateErrorReviewQuestions(): PracticeQuestion[] {
  const progress = progressStore.getState();
  const weakPhonemeIds: string[] = [];

  // 收集所有薄弱音素
  for (const lp of Object.values(progress.lessonProgressMap)) {
    if (lp.weakPhonemeIds?.length) {
      weakPhonemeIds.push(...lp.weakPhonemeIds);
    }
  }

  const uniqueWeakIds = [...new Set(weakPhonemeIds)];
  if (uniqueWeakIds.length === 0) return [];

  const questions: PracticeQuestion[] = [];
  const pool = shuffle([...uniqueWeakIds]);

  for (let i = 0; i < Math.min(5, pool.length); i++) {
    const phId = pool[i];
    const ph = phonemes.find(p => p.id === phId);
    if (!ph) continue;

    const letter = ph.displayName.replace('字母音 ', '');
    const others = ALPHABET_LETTERS.filter(l => l !== letter.toLowerCase());
    const distractors = shuffle(others).slice(0, 3);
    const options = shuffle([letter, ...distractors]);

    questions.push({
      id: uid('error'),
      type: 'error_review',
      prompt: `复习：请听声音，选择对应的字母`,
      audioUrl: ph.audioUrl,
      options,
      correctIndex: options.indexOf(letter),
      explanation: `${letter} 的发音是 ${ph.symbol}，记得多练习哦！发音要领：${ph.mouthTip}`,
    });
  }
  return questions;
}

/** 根据模式获取题目 */
export function getQuestions(mode: PracticeMode): PracticeQuestion[] {
  switch (mode) {
    case 'listen': return generateListenQuestions();
    case 'spell': return generateSpellQuestions();
    case 'family': return generateFamilyQuestions();
    case 'error_review': return generateErrorReviewQuestions();
    default: return [];
  }
}

export { uid };
