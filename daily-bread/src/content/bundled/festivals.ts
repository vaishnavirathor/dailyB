import type { Localized } from '@/content/types';

/**
 * Festival & Occasion greeting cards — the Clay-accented share surfaces.
 * Each pairs a warm greeting with a fixed festival verse (Telugu OV/KJV).
 */
export type FestivalId = 'christmas' | 'easter' | 'goodfriday' | 'feast';

export interface FestivalCard {
  id: FestivalId;
  label: Localized; // chip label
  greeting: Localized; // big line on the card
  verse: { text: Localized; reference: Localized };
}

export const festivalCards: FestivalCard[] = [
  {
    id: 'christmas',
    label: { en: 'Christmas', te: 'క్రిస్మస్' },
    greeting: { en: 'Merry Christmas!', te: 'క్రిస్మస్ శుభాకాంక్షలు' },
    verse: {
      text: {
        en: 'For unto you is born this day in the city of David a Saviour, which is Christ the Lord.',
        te: 'దావీదు పట్టణమందు నేడు రక్షకుడు మీకొరకు పుట్టియున్నాడు; ఈయన ప్రభువైన క్రీస్తు.',
      },
      reference: { en: 'Luke 2:11', te: 'లూకా 2:11' },
    },
  },
  {
    id: 'easter',
    label: { en: 'Easter', te: 'ఈస్టర్' },
    greeting: { en: 'He is Risen — Happy Easter!', te: 'ప్రభువు లేచియున్నాడు — ఈస్టర్ శుభాకాంక్షలు!' },
    verse: {
      text: {
        en: 'He is not here: for he is risen, as he said.',
        te: 'ఆయన ఇక్కడ లేడు; తాను చెప్పినట్టే ఆయన లేచియున్నాడు.',
      },
      reference: { en: 'Matthew 28:6', te: 'మత్తయి 28:6' },
    },
  },
  {
    id: 'goodfriday',
    label: { en: 'Good Friday', te: 'శుభ శుక్రవారం' },
    greeting: { en: 'In His love, this Good Friday', te: 'ఆయన ప్రేమలో — శుభ శుక్రవారం' },
    verse: {
      text: {
        en: 'Greater love hath no man than this, that a man lay down his life for his friends.',
        te: 'తన స్నేహితుల కొరకు తన ప్రాణము పెట్టువానికంటె ఎక్కువైన ప్రేమ గలవాడెవడును లేడు.',
      },
      reference: { en: 'John 15:13', te: 'యోహాను 15:13' },
    },
  },
  {
    id: 'feast',
    label: { en: 'Feast Day', te: 'పండుగ' },
    greeting: { en: 'Blessed Feast Day!', te: 'పండుగ శుభాకాంక్షలు' },
    verse: {
      text: {
        en: 'This is the day which the LORD hath made; we will rejoice and be glad in it.',
        te: 'యెహోవా ఏర్పరచిన దినము ఇదే; దీనియందు మనము ఉత్సహించి సంతోషించెదము.',
      },
      reference: { en: 'Psalm 118:24', te: 'కీర్తనలు 118:24' },
    },
  },
];

export function festivalCard(id: FestivalId): FestivalCard {
  return festivalCards.find((f) => f.id === id) ?? festivalCards[festivalCards.length - 1];
}
