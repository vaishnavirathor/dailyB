import type { FixedFeast, Localized, Tradition } from '@/content/types';

/**
 * Feast data per tradition layer.
 *
 * - Protestant/Pentecostal: deliberately spare — the great gospel feasts.
 * - Catholic: solemnities + India-loved feasts (Velankanni, St. Thomas,
 *   Francis Xavier) + Marian days.
 * - Syro-Malabar/Orthodox: East Syriac high days (Dukrana, Denha, Sliba).
 *
 * Movable feasts are computed (computus/liturgical) and joined in the
 * repository. ⚠️ Names and selections flagged for review by clergy of
 * each tradition before launch.
 */

export const fixedFeastsByTradition: Record<Tradition, FixedFeast[]> = {
  protestant: [
    { id: 'new-year', name: { en: 'New Year', te: 'నూతన సంవత్సరం' }, month: 1, day: 1, accent: 'navy' },
    {
      id: 'christmas-eve',
      name: { en: 'Christmas Eve', te: 'క్రిస్మస్ ఈవ్' },
      month: 12,
      day: 24,
      accent: 'navy',
    },
    {
      id: 'christmas',
      name: { en: 'Christmas', te: 'క్రిస్మస్' },
      month: 12,
      day: 25,
      accent: 'gold',
      readings: { en: 'Isaiah 9:2–7 · Luke 2:1–14', te: 'యెషయా 9:2–7 · లూకా 2:1–14' },
    },
    {
      id: 'watch-night',
      name: { en: 'Watch Night', te: 'వాచ్ నైట్ ఆరాధన' },
      month: 12,
      day: 31,
      accent: 'navy',
    },
  ],

  catholic: [
    {
      id: 'mary-mother-of-god',
      name: { en: 'Mary, Mother of God · New Year', te: 'దేవమాత మరియ మహోత్సవం · నూతన సంవత్సరం' },
      month: 1,
      day: 1,
      accent: 'gold',
      readings: { en: 'Numbers 6:22–27 · Luke 2:16–21', te: 'సంఖ్యా 6:22–27 · లూకా 2:16–21' },
    },
    {
      id: 'epiphany',
      name: { en: 'Epiphany of the Lord', te: 'ప్రభు ప్రత్యక్ష మహోత్సవం (ఎపిఫనీ)' },
      month: 1,
      day: 6,
      accent: 'gold',
      readings: { en: 'Isaiah 60:1–6 · Matthew 2:1–12', te: 'యెషయా 60:1–6 · మత్తయి 2:1–12' },
    },
    {
      id: 'lourdes',
      name: { en: 'Our Lady of Lourdes', te: 'లూర్దు మాత పండుగ' },
      month: 2,
      day: 11,
      accent: 'navy',
    },
    {
      id: 'st-joseph',
      name: { en: 'St. Joseph', te: 'పునీత యోసేపు మహోత్సవం' },
      month: 3,
      day: 19,
      accent: 'navy',
    },
    {
      id: 'annunciation',
      name: { en: 'The Annunciation', te: 'మంగళవార్త మహోత్సవం' },
      month: 3,
      day: 25,
      accent: 'navy',
      readings: { en: 'Isaiah 7:10–14 · Luke 1:26–38', te: 'యెషయా 7:10–14 · లూకా 1:26–38' },
    },
    {
      id: 'peter-paul',
      name: { en: 'Sts. Peter & Paul', te: 'పునీత పేతురు పౌలు మహోత్సవం' },
      month: 6,
      day: 29,
      accent: 'navy',
    },
    {
      id: 'st-thomas',
      name: { en: 'St. Thomas, Apostle of India', te: 'పునీత తోమా — భారత అపొస్తలుని పండుగ' },
      month: 7,
      day: 3,
      accent: 'gold',
      readings: { en: 'John 20:24–29', te: 'యోహాను 20:24–29' },
    },
    {
      id: 'mount-carmel',
      name: { en: 'Our Lady of Mount Carmel', te: 'కర్మెల్ మాత పండుగ' },
      month: 7,
      day: 16,
      accent: 'navy',
    },
    {
      id: 'assumption',
      name: { en: 'Assumption of Mary', te: 'మాత మరియ మోక్షారోహణ మహోత్సవం' },
      month: 8,
      day: 15,
      accent: 'gold',
      readings: { en: 'Luke 1:39–56', te: 'లూకా 1:39–56' },
    },
    {
      id: 'velankanni-novena',
      name: { en: 'Velankanni Novena begins', te: 'వేలంకన్ని నొవేనా ప్రారంభం' },
      month: 8,
      day: 29,
      accent: 'gold',
    },
    {
      id: 'velankanni',
      name: {
        en: 'Our Lady of Velankanni · Nativity of Mary',
        te: 'వేలంకన్ని ఆరోగ్యమాత పండుగ · మాత మరియ జననం',
      },
      month: 9,
      day: 8,
      accent: 'gold',
      readings: { en: 'Luke 1:26–38', te: 'లూకా 1:26–38' },
    },
    {
      id: 'rosary',
      name: { en: 'Our Lady of the Rosary', te: 'జపమాల మాత పండుగ' },
      month: 10,
      day: 7,
      accent: 'navy',
    },
    {
      id: 'all-saints',
      name: { en: 'All Saints', te: 'సకల పునీతుల మహోత్సవం' },
      month: 11,
      day: 1,
      accent: 'gold',
    },
    {
      id: 'all-souls',
      name: { en: 'All Souls', te: 'సకల ఆత్మల దినం' },
      month: 11,
      day: 2,
      accent: 'navy',
    },
    {
      id: 'francis-xavier',
      name: { en: 'St. Francis Xavier', te: 'పునీత ఫ్రాన్సిస్ జేవియర్ పండుగ' },
      month: 12,
      day: 3,
      accent: 'gold',
    },
    {
      id: 'immaculate-conception',
      name: { en: 'Immaculate Conception', te: 'అమలోద్భవి మాత మహోత్సవం' },
      month: 12,
      day: 8,
      accent: 'gold',
    },
    {
      id: 'christmas-eve',
      name: { en: 'Christmas Eve', te: 'క్రిస్మస్ ఈవ్' },
      month: 12,
      day: 24,
      accent: 'navy',
    },
    {
      id: 'christmas',
      name: { en: 'Christmas — Nativity of the Lord', te: 'క్రిస్మస్ — ప్రభు జనన మహోత్సవం' },
      month: 12,
      day: 25,
      accent: 'gold',
      readings: { en: 'Isaiah 9:2–7 · Luke 2:1–14', te: 'యెషయా 9:2–7 · లూకా 2:1–14' },
    },
  ],

  orthodox: [
    {
      id: 'denha',
      name: { en: 'Denha — Epiphany', te: 'దెన్హా — ప్రభు ప్రత్యక్షత పండుగ' },
      month: 1,
      day: 6,
      accent: 'gold',
      readings: { en: 'Matthew 3:13–17', te: 'మత్తయి 3:13–17' },
    },
    {
      id: 'st-joseph',
      name: { en: 'St. Joseph', te: 'పునీత యోసేపు పండుగ' },
      month: 3,
      day: 19,
      accent: 'navy',
    },
    {
      id: 'dukrana',
      name: { en: 'Dukrana — St. Thomas Day', te: 'దుక్రానా — పునీత తోమా పెరున్నాళ్' },
      month: 7,
      day: 3,
      accent: 'gold',
      readings: { en: 'John 20:24–29', te: 'యోహాను 20:24–29' },
    },
    {
      id: 'shunoyo',
      name: { en: 'Assumption — Shunoyo', te: 'మాత మరియ మోక్షారోహణం (శునోయో)' },
      month: 8,
      day: 15,
      accent: 'gold',
    },
    {
      id: 'nativity-of-mary',
      name: { en: 'Nativity of Mary · Velankanni', te: 'మాత మరియ జననం · వేలంకన్ని' },
      month: 9,
      day: 8,
      accent: 'gold',
    },
    {
      id: 'sliba',
      name: { en: 'Sliba — Exaltation of the Cross', te: 'స్లీబా — సిలువ మహోత్సవం' },
      month: 9,
      day: 14,
      accent: 'gold',
      readings: { en: 'John 3:13–17', te: 'యోహాను 3:13–17' },
    },
    {
      id: 'christmas',
      name: { en: 'Christmas — Yaldo', te: 'క్రిస్మస్ — యల్దో మహోత్సవం' },
      month: 12,
      day: 25,
      accent: 'gold',
      readings: { en: 'Isaiah 9:2–7 · Luke 2:1–14', te: 'యెషయా 9:2–7 · లూకా 2:1–14' },
    },
  ],
};

/** Movable feast ids per tradition (joined with computed dates). */
export type CommonMovableId = 'palmSunday' | 'goodFriday' | 'easter' | 'pentecost';

export interface MovableFeastSpec {
  id: string;
  name: Localized;
  accent: 'gold' | 'navy';
  readings?: Localized;
}

export const commonMovableSpecs: Record<CommonMovableId, MovableFeastSpec> = {
  palmSunday: {
    id: 'palmSunday',
    name: { en: 'Palm Sunday', te: 'మట్టల ఆదివారం' },
    accent: 'navy',
    readings: { en: 'Matthew 21:1–11', te: 'మత్తయి 21:1–11' },
  },
  goodFriday: {
    id: 'goodFriday',
    name: { en: 'Good Friday', te: 'శుభ శుక్రవారం' },
    accent: 'gold',
    readings: { en: 'Isaiah 53 · John 18–19', te: 'యెషయా 53 · యోహాను 18–19' },
  },
  easter: {
    id: 'easter',
    name: { en: 'Easter — Resurrection Day', te: 'ఈస్టర్ — పునరుత్థాన దినం' },
    accent: 'gold',
    readings: { en: 'John 20:1–18', te: 'యోహాను 20:1–18' },
  },
  pentecost: {
    id: 'pentecost',
    name: { en: 'Pentecost', te: 'పెంతెకొస్తు దినం' },
    accent: 'gold',
    readings: { en: 'Acts 2:1–21', te: 'అపొస్తలుల కార్యములు 2:1–21' },
  },
};

/** Catholic-only movables (joined with catholicMovables dates). */
export const catholicMovableSpecs: MovableFeastSpec[] = [
  {
    id: 'ashWednesday',
    name: { en: 'Ash Wednesday — Lent begins', te: 'విభూతి బుధవారం — తపస్సు కాలారంభం' },
    accent: 'navy',
    readings: { en: 'Joel 2:12–18 · Matthew 6:1–18', te: 'యోవేలు 2:12–18 · మత్తయి 6:1–18' },
  },
  {
    id: 'holyThursday',
    name: { en: 'Maundy Thursday', te: 'పెసహా గురువారం' },
    accent: 'navy',
    readings: { en: 'John 13:1–15', te: 'యోహాను 13:1–15' },
  },
  {
    id: 'ascension',
    name: { en: 'Ascension of the Lord', te: 'ప్రభు ఆరోహణ మహోత్సవం' },
    accent: 'gold',
    readings: { en: 'Acts 1:1–11', te: 'అపొస్తలుల కార్యములు 1:1–11' },
  },
  {
    id: 'trinitySunday',
    name: { en: 'Trinity Sunday', te: 'త్రిత్వైక దేవుని మహోత్సవం' },
    accent: 'navy',
  },
  {
    id: 'corpusChristi',
    name: { en: 'Corpus Christi', te: 'దివ్య సత్ప్రసాద మహోత్సవం' },
    accent: 'gold',
  },
  {
    id: 'christTheKing',
    name: { en: 'Christ the King', te: 'క్రీస్తు రాజు మహోత్సవం' },
    accent: 'navy',
    readings: { en: 'John 18:33–37', te: 'యోహాను 18:33–37' },
  },
  {
    id: 'adventStart',
    name: { en: 'First Sunday of Advent', te: 'ఆగమన కాల ప్రథమ ఆదివారం' },
    accent: 'navy',
  },
];

/** Eastern-only movables. */
export const easternMovableSpecs: MovableFeastSpec[] = [
  {
    id: 'peturta',
    name: { en: 'Peturta Sunday — Great Fast begins', te: 'పేతుర్తా ఆదివారం — మహా ఉపవాస ఆరంభం' },
    accent: 'navy',
  },
  {
    id: 'pesaha',
    name: { en: 'Pesaha Thursday', te: 'పెసహా గురువారం' },
    accent: 'gold',
    readings: { en: 'John 13:1–15', te: 'యోహాను 13:1–15' },
  },
  {
    id: 'ascension',
    name: { en: 'Ascension of the Lord', te: 'ప్రభు ఆరోహణ పండుగ' },
    accent: 'gold',
  },
];

/** Localized season names for the calendar banner. */
export const catholicSeasonNames: Record<string, Localized> = {
  advent: { en: 'Advent', te: 'ఆగమన కాలం' },
  christmastide: { en: 'Christmastide', te: 'క్రిస్మస్ కాలం' },
  lent: { en: 'Lent', te: 'తపస్సు కాలం' },
  holyWeek: { en: 'Holy Week', te: 'పవిత్ర వారం' },
  eastertide: { en: 'Eastertide', te: 'పాస్క కాలం' },
  ordinary: { en: 'Ordinary Time', te: 'సాధారణ కాలం' },
};

export const easternSeasonNames: Record<string, Localized> = {
  subara: { en: 'Subara — Annunciation', te: 'సుబారా — మంగళవార్త కాలం' },
  denha: { en: 'Denha — Epiphany', te: 'దెన్హా — ప్రత్యక్షత కాలం' },
  greatFast: { en: 'Sawma Rabba — Great Fast', te: 'సౌమా రబ్బా — మహా ఉపవాస కాలం' },
  qyamta: { en: 'Qyamta — Resurrection', te: 'క్యామ్తా — పునరుత్థాన కాలం' },
  slihe: { en: 'Slihe — Apostles', te: 'శ్లీహే — అపొస్తలుల కాలం' },
  qaita: { en: 'Qaita — Summer', te: 'ఖైతా — వేసవి కాలం' },
  eliyaSlibaMuse: { en: 'Eliya–Sliba–Muse', te: 'ఏలియా–స్లీబా–మూసే కాలం' },
  qudasEdta: { en: 'Qudas Edta — Dedication', te: 'కుదాశ్ ఎద్తా — దేవాలయ ప్రతిష్ఠ కాలం' },
};
