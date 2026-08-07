export interface WhackMoleRound {
  target: string;
  options: string[];
}

export interface WordFishingTarget {
  word: string;
  fishes: string[];
}

export interface PhonemeTrainStation {
  word: string;
  letters: string[];
}

export const whackMoleRounds: WhackMoleRound[] = [
  { target: 's', options: ['s', 'a', 't', 'p'] },
  { target: 'a', options: ['a', 's', 'm', 't'] },
  { target: 't', options: ['t', 'p', 'i', 'n'] },
  { target: 'p', options: ['p', 'i', 'n', 's'] },
  { target: 'i', options: ['i', 'n', 't', 'a'] },
  { target: 'n', options: ['n', 's', 'a', 't'] },
  { target: 'm', options: ['m', 'd', 'g', 'o'] },
  { target: 'd', options: ['d', 'g', 'o', 'c'] },
  { target: 'g', options: ['g', 'o', 'c', 'k'] },
  { target: 'o', options: ['o', 'c', 'k', 'e'] },
];

export const wordFishingTargets: WordFishingTarget[] = [
  { word: 'cat', fishes: ['cat', 'hat', 'bat', 'mat'] },
  { word: 'dog', fishes: ['dog', 'log', 'fog', 'hog'] },
  { word: 'sun', fishes: ['sun', 'fun', 'run', 'bun'] },
  { word: 'pig', fishes: ['pig', 'big', 'dig', 'fig'] },
  { word: 'bed', fishes: ['bed', 'red', 'fed', 'led'] },
];

export const phonemeTrainStations: PhonemeTrainStation[] = [
  { word: 'sit', letters: ['s', 'i', 't'] },
  { word: 'sat', letters: ['a', 's', 't'] },
  { word: 'sun', letters: ['s', 'n', 'u'] },
  { word: 'cat', letters: ['t', 'a', 'c'] },
  { word: 'hat', letters: ['h', 't', 'a'] },
];
