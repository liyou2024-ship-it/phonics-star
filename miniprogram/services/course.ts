/**
 * 课程数据服务
 * 从 JSON 数据文件加载课程内容（数据驱动）
 */

import levelsData from '../data/levels.json';
import unitsData from '../data/units.json';
import lessonsData from '../data/lessons.json';
import phonemesData from '../data/phonemes.json';
import wordsData from '../data/words.json';
import wordFamiliesData from '../data/word-families.json';
import readersData from '../data/decodable-readers.json';
import { Level, Unit, Lesson, Phoneme, Word, WordFamily, DecodableReader } from '../types';

/** 获取所有阶段 */
export function getLevels(): Level[] {
  return levelsData as Level[];
}

/** 获取阶段 */
export function getLevelById(id: string): Level | undefined {
  return (levelsData as Level[]).find(l => l.id === id);
}

/** 获取所有单元 */
export function getUnits(): Unit[] {
  return unitsData as Unit[];
}

/** 获取阶段下的单元 */
export function getUnitsByLevelId(levelId: string): Unit[] {
  return (unitsData as Unit[]).filter(u => u.levelId === levelId);
}

/** 获取所有课节 */
export function getLessons(): Lesson[] {
  return lessonsData as Lesson[];
}

/** 获取单元下的课节 */
export function getLessonsByUnitId(unitId: string): Lesson[] {
  return (lessonsData as Lesson[]).filter(l => l.unitId === unitId);
}

/** 获取课节 */
export function getLessonById(id: string): Lesson | undefined {
  return (lessonsData as Lesson[]).find(l => l.id === id);
}

/** 获取所有音素 */
export function getPhonemes(): Phoneme[] {
  return phonemesData as Phoneme[];
}

/** 获取音素 */
export function getPhonemeById(id: string): Phoneme | undefined {
  return (phonemesData as Phoneme[]).find(p => p.id === id);
}

/** 获取所有单词 */
export function getWords(): Word[] {
  return wordsData as Word[];
}

/** 获取单词 */
export function getWordById(id: string): Word | undefined {
  return (wordsData as Word[]).find(w => w.id === id);
}

/** 获取词族下的单词 */
export function getWordsByFamilyId(familyId: string): Word[] {
  return (wordsData as Word[]).filter(w => w.familyId === familyId);
}

/** 获取所有词族 */
export function getWordFamilies(): WordFamily[] {
  return wordFamiliesData as WordFamily[];
}

/** 获取词族 */
export function getWordFamilyById(id: string): WordFamily | undefined {
  return (wordFamiliesData as WordFamily[]).find(f => f.id === id);
}

/** 获取所有可解码读物 */
export function getDecodableReaders(): DecodableReader[] {
  return readersData as DecodableReader[];
}

/** 获取读物 */
export function getReaderById(id: string): DecodableReader | undefined {
  return (readersData as DecodableReader[]).find(r => r.id === id);
}
