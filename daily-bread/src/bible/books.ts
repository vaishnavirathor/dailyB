import type { Localized } from '@/content/types';

/**
 * Bundled offline Bibles (public domain), two editions:
 *  - te-ov: Telugu OV (పరిశుద్ధ గ్రంథము, BSI 1880s) — ./data
 *  - en-kjv: English King James Version — ./data-en
 * Source: godlytalias/Bible-Database (validated: 66 books, canonical
 * chapter counts). Data files are GENERATED — do not hand-edit.
 */
export type BibleVersion = 'te-ov' | 'en-kjv';

export interface BibleVersionInfo {
  id: BibleVersion;
  /** Embossed cover title. */
  title: Localized;
  subtitle: Localized;
  cover: 'navy' | 'burgundy';
}

export const bibleVersions: BibleVersionInfo[] = [
  {
    id: 'te-ov',
    title: { te: 'పరిశుద్ధ గ్రంథము', en: 'పరిశుద్ధ గ్రంథము' },
    subtitle: { te: 'తెలుగు · OV 1880', en: 'Telugu · Old Version 1880' },
    cover: 'navy',
  },
  {
    id: 'en-kjv',
    title: { te: 'HOLY BIBLE', en: 'HOLY BIBLE' },
    subtitle: { te: 'ఇంగ్లీష్ · కింగ్ జేమ్స్ వెర్షన్', en: 'English · King James Version' },
    cover: 'burgundy',
  },
];

export function bibleVersion(id: string): BibleVersionInfo | undefined {
  return bibleVersions.find((v) => v.id === id);
}

export interface BibleBook {
  id: string;
  /** 1-based canonical book number. */
  n: number;
  name: Localized;
  chapters: number;
  testament: 'old' | 'new';
}

export const bibleBooks: BibleBook[] = [
  { id: 'genesis', n: 1, name: { en: 'Genesis', te: 'ఆదికాండము' }, chapters: 50, testament: 'old' },
  { id: 'exodus', n: 2, name: { en: 'Exodus', te: 'నిర్గమకాండము' }, chapters: 40, testament: 'old' },
  { id: 'leviticus', n: 3, name: { en: 'Leviticus', te: 'లేవీయకాండము' }, chapters: 27, testament: 'old' },
  { id: 'numbers', n: 4, name: { en: 'Numbers', te: 'సంఖ్యాకాండము' }, chapters: 36, testament: 'old' },
  { id: 'deuteronomy', n: 5, name: { en: 'Deuteronomy', te: 'ద్వితీయోపదేశకాండము' }, chapters: 34, testament: 'old' },
  { id: 'joshua', n: 6, name: { en: 'Joshua', te: 'యెహోషువ' }, chapters: 24, testament: 'old' },
  { id: 'judges', n: 7, name: { en: 'Judges', te: 'న్యాయాధిపతులు' }, chapters: 21, testament: 'old' },
  { id: 'ruth', n: 8, name: { en: 'Ruth', te: 'రూతు' }, chapters: 4, testament: 'old' },
  { id: '1-samuel', n: 9, name: { en: '1 Samuel', te: '1 సమూయేలు' }, chapters: 31, testament: 'old' },
  { id: '2-samuel', n: 10, name: { en: '2 Samuel', te: '2 సమూయేలు' }, chapters: 24, testament: 'old' },
  { id: '1-kings', n: 11, name: { en: '1 Kings', te: '1 రాజులు' }, chapters: 22, testament: 'old' },
  { id: '2-kings', n: 12, name: { en: '2 Kings', te: '2 రాజులు' }, chapters: 25, testament: 'old' },
  { id: '1-chronicles', n: 13, name: { en: '1 Chronicles', te: '1 దినవృత్తాంతములు' }, chapters: 29, testament: 'old' },
  { id: '2-chronicles', n: 14, name: { en: '2 Chronicles', te: '2 దినవృత్తాంతములు' }, chapters: 36, testament: 'old' },
  { id: 'ezra', n: 15, name: { en: 'Ezra', te: 'ఎజ్రా' }, chapters: 10, testament: 'old' },
  { id: 'nehemiah', n: 16, name: { en: 'Nehemiah', te: 'నెహెమ్యా' }, chapters: 13, testament: 'old' },
  { id: 'esther', n: 17, name: { en: 'Esther', te: 'ఎస్తేరు' }, chapters: 10, testament: 'old' },
  { id: 'job', n: 18, name: { en: 'Job', te: 'యోబు' }, chapters: 42, testament: 'old' },
  { id: 'psalms', n: 19, name: { en: 'Psalms', te: 'కీర్తనలు' }, chapters: 150, testament: 'old' },
  { id: 'proverbs', n: 20, name: { en: 'Proverbs', te: 'సామెతలు' }, chapters: 31, testament: 'old' },
  { id: 'ecclesiastes', n: 21, name: { en: 'Ecclesiastes', te: 'ప్రసంగి' }, chapters: 12, testament: 'old' },
  { id: 'song-of-solomon', n: 22, name: { en: 'Song of Solomon', te: 'పరమగీతము' }, chapters: 8, testament: 'old' },
  { id: 'isaiah', n: 23, name: { en: 'Isaiah', te: 'యెషయా' }, chapters: 66, testament: 'old' },
  { id: 'jeremiah', n: 24, name: { en: 'Jeremiah', te: 'యిర్మీయా' }, chapters: 52, testament: 'old' },
  { id: 'lamentations', n: 25, name: { en: 'Lamentations', te: 'విలాపవాక్యములు' }, chapters: 5, testament: 'old' },
  { id: 'ezekiel', n: 26, name: { en: 'Ezekiel', te: 'యెహెజ్కేలు' }, chapters: 48, testament: 'old' },
  { id: 'daniel', n: 27, name: { en: 'Daniel', te: 'దానియేలు' }, chapters: 12, testament: 'old' },
  { id: 'hosea', n: 28, name: { en: 'Hosea', te: 'హోషేయ' }, chapters: 14, testament: 'old' },
  { id: 'joel', n: 29, name: { en: 'Joel', te: 'యోవేలు' }, chapters: 3, testament: 'old' },
  { id: 'amos', n: 30, name: { en: 'Amos', te: 'ఆమోసు' }, chapters: 9, testament: 'old' },
  { id: 'obadiah', n: 31, name: { en: 'Obadiah', te: 'ఓబద్యా' }, chapters: 1, testament: 'old' },
  { id: 'jonah', n: 32, name: { en: 'Jonah', te: 'యోనా' }, chapters: 4, testament: 'old' },
  { id: 'micah', n: 33, name: { en: 'Micah', te: 'మీకా' }, chapters: 7, testament: 'old' },
  { id: 'nahum', n: 34, name: { en: 'Nahum', te: 'నహూము' }, chapters: 3, testament: 'old' },
  { id: 'habakkuk', n: 35, name: { en: 'Habakkuk', te: 'హబక్కూకు' }, chapters: 3, testament: 'old' },
  { id: 'zephaniah', n: 36, name: { en: 'Zephaniah', te: 'జెఫన్యా' }, chapters: 3, testament: 'old' },
  { id: 'haggai', n: 37, name: { en: 'Haggai', te: 'హగ్గయి' }, chapters: 2, testament: 'old' },
  { id: 'zechariah', n: 38, name: { en: 'Zechariah', te: 'జెకర్యా' }, chapters: 14, testament: 'old' },
  { id: 'malachi', n: 39, name: { en: 'Malachi', te: 'మలాకీ' }, chapters: 4, testament: 'old' },
  { id: 'matthew', n: 40, name: { en: 'Matthew', te: 'మత్తయి' }, chapters: 28, testament: 'new' },
  { id: 'mark', n: 41, name: { en: 'Mark', te: 'మార్కు' }, chapters: 16, testament: 'new' },
  { id: 'luke', n: 42, name: { en: 'Luke', te: 'లూకా' }, chapters: 24, testament: 'new' },
  { id: 'john', n: 43, name: { en: 'John', te: 'యోహాను' }, chapters: 21, testament: 'new' },
  { id: 'acts', n: 44, name: { en: 'Acts', te: 'అపొస్తలుల కార్యములు' }, chapters: 28, testament: 'new' },
  { id: 'romans', n: 45, name: { en: 'Romans', te: 'రోమీయులకు' }, chapters: 16, testament: 'new' },
  { id: '1-corinthians', n: 46, name: { en: '1 Corinthians', te: '1 కొరింథీయులకు' }, chapters: 16, testament: 'new' },
  { id: '2-corinthians', n: 47, name: { en: '2 Corinthians', te: '2 కొరింథీయులకు' }, chapters: 13, testament: 'new' },
  { id: 'galatians', n: 48, name: { en: 'Galatians', te: 'గలతీయులకు' }, chapters: 6, testament: 'new' },
  { id: 'ephesians', n: 49, name: { en: 'Ephesians', te: 'ఎఫెసీయులకు' }, chapters: 6, testament: 'new' },
  { id: 'philippians', n: 50, name: { en: 'Philippians', te: 'ఫిలిప్పీయులకు' }, chapters: 4, testament: 'new' },
  { id: 'colossians', n: 51, name: { en: 'Colossians', te: 'కొలొస్సయులకు' }, chapters: 4, testament: 'new' },
  { id: '1-thessalonians', n: 52, name: { en: '1 Thessalonians', te: '1 థెస్సలొనీకయులకు' }, chapters: 5, testament: 'new' },
  { id: '2-thessalonians', n: 53, name: { en: '2 Thessalonians', te: '2 థెస్సలొనీకయులకు' }, chapters: 3, testament: 'new' },
  { id: '1-timothy', n: 54, name: { en: '1 Timothy', te: '1 తిమోతికి' }, chapters: 6, testament: 'new' },
  { id: '2-timothy', n: 55, name: { en: '2 Timothy', te: '2 తిమోతికి' }, chapters: 4, testament: 'new' },
  { id: 'titus', n: 56, name: { en: 'Titus', te: 'తీతుకు' }, chapters: 3, testament: 'new' },
  { id: 'philemon', n: 57, name: { en: 'Philemon', te: 'ఫిలేమోనుకు' }, chapters: 1, testament: 'new' },
  { id: 'hebrews', n: 58, name: { en: 'Hebrews', te: 'హెబ్రీయులకు' }, chapters: 13, testament: 'new' },
  { id: 'james', n: 59, name: { en: 'James', te: 'యాకోబు' }, chapters: 5, testament: 'new' },
  { id: '1-peter', n: 60, name: { en: '1 Peter', te: '1 పేతురు' }, chapters: 5, testament: 'new' },
  { id: '2-peter', n: 61, name: { en: '2 Peter', te: '2 పేతురు' }, chapters: 3, testament: 'new' },
  { id: '1-john', n: 62, name: { en: '1 John', te: '1 యోహాను' }, chapters: 5, testament: 'new' },
  { id: '2-john', n: 63, name: { en: '2 John', te: '2 యోహాను' }, chapters: 1, testament: 'new' },
  { id: '3-john', n: 64, name: { en: '3 John', te: '3 యోహాను' }, chapters: 1, testament: 'new' },
  { id: 'jude', n: 65, name: { en: 'Jude', te: 'యూదా' }, chapters: 1, testament: 'new' },
  { id: 'revelation', n: 66, name: { en: 'Revelation', te: 'ప్రకటన గ్రంథము' }, chapters: 22, testament: 'new' },
];

/** Chapter text: chapters[chapterIndex][verseIndex] (0-based). */
export type BookText = string[][];

const teluguLoaders: Record<string, () => BookText> = {
  'genesis': () => require('./data/01-genesis.json') as BookText,
  'exodus': () => require('./data/02-exodus.json') as BookText,
  'leviticus': () => require('./data/03-leviticus.json') as BookText,
  'numbers': () => require('./data/04-numbers.json') as BookText,
  'deuteronomy': () => require('./data/05-deuteronomy.json') as BookText,
  'joshua': () => require('./data/06-joshua.json') as BookText,
  'judges': () => require('./data/07-judges.json') as BookText,
  'ruth': () => require('./data/08-ruth.json') as BookText,
  '1-samuel': () => require('./data/09-1-samuel.json') as BookText,
  '2-samuel': () => require('./data/10-2-samuel.json') as BookText,
  '1-kings': () => require('./data/11-1-kings.json') as BookText,
  '2-kings': () => require('./data/12-2-kings.json') as BookText,
  '1-chronicles': () => require('./data/13-1-chronicles.json') as BookText,
  '2-chronicles': () => require('./data/14-2-chronicles.json') as BookText,
  'ezra': () => require('./data/15-ezra.json') as BookText,
  'nehemiah': () => require('./data/16-nehemiah.json') as BookText,
  'esther': () => require('./data/17-esther.json') as BookText,
  'job': () => require('./data/18-job.json') as BookText,
  'psalms': () => require('./data/19-psalms.json') as BookText,
  'proverbs': () => require('./data/20-proverbs.json') as BookText,
  'ecclesiastes': () => require('./data/21-ecclesiastes.json') as BookText,
  'song-of-solomon': () => require('./data/22-song-of-solomon.json') as BookText,
  'isaiah': () => require('./data/23-isaiah.json') as BookText,
  'jeremiah': () => require('./data/24-jeremiah.json') as BookText,
  'lamentations': () => require('./data/25-lamentations.json') as BookText,
  'ezekiel': () => require('./data/26-ezekiel.json') as BookText,
  'daniel': () => require('./data/27-daniel.json') as BookText,
  'hosea': () => require('./data/28-hosea.json') as BookText,
  'joel': () => require('./data/29-joel.json') as BookText,
  'amos': () => require('./data/30-amos.json') as BookText,
  'obadiah': () => require('./data/31-obadiah.json') as BookText,
  'jonah': () => require('./data/32-jonah.json') as BookText,
  'micah': () => require('./data/33-micah.json') as BookText,
  'nahum': () => require('./data/34-nahum.json') as BookText,
  'habakkuk': () => require('./data/35-habakkuk.json') as BookText,
  'zephaniah': () => require('./data/36-zephaniah.json') as BookText,
  'haggai': () => require('./data/37-haggai.json') as BookText,
  'zechariah': () => require('./data/38-zechariah.json') as BookText,
  'malachi': () => require('./data/39-malachi.json') as BookText,
  'matthew': () => require('./data/40-matthew.json') as BookText,
  'mark': () => require('./data/41-mark.json') as BookText,
  'luke': () => require('./data/42-luke.json') as BookText,
  'john': () => require('./data/43-john.json') as BookText,
  'acts': () => require('./data/44-acts.json') as BookText,
  'romans': () => require('./data/45-romans.json') as BookText,
  '1-corinthians': () => require('./data/46-1-corinthians.json') as BookText,
  '2-corinthians': () => require('./data/47-2-corinthians.json') as BookText,
  'galatians': () => require('./data/48-galatians.json') as BookText,
  'ephesians': () => require('./data/49-ephesians.json') as BookText,
  'philippians': () => require('./data/50-philippians.json') as BookText,
  'colossians': () => require('./data/51-colossians.json') as BookText,
  '1-thessalonians': () => require('./data/52-1-thessalonians.json') as BookText,
  '2-thessalonians': () => require('./data/53-2-thessalonians.json') as BookText,
  '1-timothy': () => require('./data/54-1-timothy.json') as BookText,
  '2-timothy': () => require('./data/55-2-timothy.json') as BookText,
  'titus': () => require('./data/56-titus.json') as BookText,
  'philemon': () => require('./data/57-philemon.json') as BookText,
  'hebrews': () => require('./data/58-hebrews.json') as BookText,
  'james': () => require('./data/59-james.json') as BookText,
  '1-peter': () => require('./data/60-1-peter.json') as BookText,
  '2-peter': () => require('./data/61-2-peter.json') as BookText,
  '1-john': () => require('./data/62-1-john.json') as BookText,
  '2-john': () => require('./data/63-2-john.json') as BookText,
  '3-john': () => require('./data/64-3-john.json') as BookText,
  'jude': () => require('./data/65-jude.json') as BookText,
  'revelation': () => require('./data/66-revelation.json') as BookText,
};

const englishLoaders: Record<string, () => BookText> = {
  'genesis': () => require('./data-en/01-genesis.json') as BookText,
  'exodus': () => require('./data-en/02-exodus.json') as BookText,
  'leviticus': () => require('./data-en/03-leviticus.json') as BookText,
  'numbers': () => require('./data-en/04-numbers.json') as BookText,
  'deuteronomy': () => require('./data-en/05-deuteronomy.json') as BookText,
  'joshua': () => require('./data-en/06-joshua.json') as BookText,
  'judges': () => require('./data-en/07-judges.json') as BookText,
  'ruth': () => require('./data-en/08-ruth.json') as BookText,
  '1-samuel': () => require('./data-en/09-1-samuel.json') as BookText,
  '2-samuel': () => require('./data-en/10-2-samuel.json') as BookText,
  '1-kings': () => require('./data-en/11-1-kings.json') as BookText,
  '2-kings': () => require('./data-en/12-2-kings.json') as BookText,
  '1-chronicles': () => require('./data-en/13-1-chronicles.json') as BookText,
  '2-chronicles': () => require('./data-en/14-2-chronicles.json') as BookText,
  'ezra': () => require('./data-en/15-ezra.json') as BookText,
  'nehemiah': () => require('./data-en/16-nehemiah.json') as BookText,
  'esther': () => require('./data-en/17-esther.json') as BookText,
  'job': () => require('./data-en/18-job.json') as BookText,
  'psalms': () => require('./data-en/19-psalms.json') as BookText,
  'proverbs': () => require('./data-en/20-proverbs.json') as BookText,
  'ecclesiastes': () => require('./data-en/21-ecclesiastes.json') as BookText,
  'song-of-solomon': () => require('./data-en/22-song-of-solomon.json') as BookText,
  'isaiah': () => require('./data-en/23-isaiah.json') as BookText,
  'jeremiah': () => require('./data-en/24-jeremiah.json') as BookText,
  'lamentations': () => require('./data-en/25-lamentations.json') as BookText,
  'ezekiel': () => require('./data-en/26-ezekiel.json') as BookText,
  'daniel': () => require('./data-en/27-daniel.json') as BookText,
  'hosea': () => require('./data-en/28-hosea.json') as BookText,
  'joel': () => require('./data-en/29-joel.json') as BookText,
  'amos': () => require('./data-en/30-amos.json') as BookText,
  'obadiah': () => require('./data-en/31-obadiah.json') as BookText,
  'jonah': () => require('./data-en/32-jonah.json') as BookText,
  'micah': () => require('./data-en/33-micah.json') as BookText,
  'nahum': () => require('./data-en/34-nahum.json') as BookText,
  'habakkuk': () => require('./data-en/35-habakkuk.json') as BookText,
  'zephaniah': () => require('./data-en/36-zephaniah.json') as BookText,
  'haggai': () => require('./data-en/37-haggai.json') as BookText,
  'zechariah': () => require('./data-en/38-zechariah.json') as BookText,
  'malachi': () => require('./data-en/39-malachi.json') as BookText,
  'matthew': () => require('./data-en/40-matthew.json') as BookText,
  'mark': () => require('./data-en/41-mark.json') as BookText,
  'luke': () => require('./data-en/42-luke.json') as BookText,
  'john': () => require('./data-en/43-john.json') as BookText,
  'acts': () => require('./data-en/44-acts.json') as BookText,
  'romans': () => require('./data-en/45-romans.json') as BookText,
  '1-corinthians': () => require('./data-en/46-1-corinthians.json') as BookText,
  '2-corinthians': () => require('./data-en/47-2-corinthians.json') as BookText,
  'galatians': () => require('./data-en/48-galatians.json') as BookText,
  'ephesians': () => require('./data-en/49-ephesians.json') as BookText,
  'philippians': () => require('./data-en/50-philippians.json') as BookText,
  'colossians': () => require('./data-en/51-colossians.json') as BookText,
  '1-thessalonians': () => require('./data-en/52-1-thessalonians.json') as BookText,
  '2-thessalonians': () => require('./data-en/53-2-thessalonians.json') as BookText,
  '1-timothy': () => require('./data-en/54-1-timothy.json') as BookText,
  '2-timothy': () => require('./data-en/55-2-timothy.json') as BookText,
  'titus': () => require('./data-en/56-titus.json') as BookText,
  'philemon': () => require('./data-en/57-philemon.json') as BookText,
  'hebrews': () => require('./data-en/58-hebrews.json') as BookText,
  'james': () => require('./data-en/59-james.json') as BookText,
  '1-peter': () => require('./data-en/60-1-peter.json') as BookText,
  '2-peter': () => require('./data-en/61-2-peter.json') as BookText,
  '1-john': () => require('./data-en/62-1-john.json') as BookText,
  '2-john': () => require('./data-en/63-2-john.json') as BookText,
  '3-john': () => require('./data-en/64-3-john.json') as BookText,
  'jude': () => require('./data-en/65-jude.json') as BookText,
  'revelation': () => require('./data-en/66-revelation.json') as BookText,
};

const loadersByVersion: Record<BibleVersion, Record<string, () => BookText>> = {
  'te-ov': teluguLoaders,
  'en-kjv': englishLoaders,
};

const cache = new Map<string, BookText>();

export function bookText(version: BibleVersion, id: string): BookText {
  const key = `${version}:${id}`;
  let text = cache.get(key);
  if (!text) {
    text = loadersByVersion[version][id]();
    cache.set(key, text);
  }
  return text;
}

export function bibleBook(id: string): BibleBook | undefined {
  return bibleBooks.find((b) => b.id === id);
}
