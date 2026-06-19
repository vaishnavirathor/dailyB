import type { Product } from '@/content/types';

/**
 * Curated storefront catalog — "start clean": Bibles & frames first, high
 * margin, zero regulatory risk. Quiet commerce: descriptions are calm and
 * devotional, never sales-loud.
 *
 * ⚠️ LEGAL RULE (enforced by content tests + the ComplianceNotice
 * component): no listing may carry health, healing or supernatural-
 * protection claims. Devotional items are faith objects — nothing more.
 * (Drugs & Magic Remedies (Objectionable Advertisements) Act, 1954.)
 *
 * Prices are placeholders for the pilot WhatsApp-order flow.
 */
export const products: Product[] = [
  {
    id: 'telugu-bible-large',
    name: { en: 'Telugu Bible — Large Print', te: 'తెలుగు బైబిల్ — పెద్ద అక్షరాలు' },
    description: {
      en: 'Telugu OV Bible in generous large print, sewn binding — made for the readers the small print left behind.',
      te: 'పెద్ద అక్షరాలతో తెలుగు బైబిల్, దృఢమైన బైండింగ్ — చిన్న అక్షరాలు చదవలేని వారి కోసం ప్రత్యేకం.',
    },
    category: 'bibles',
    priceInr: 750,
    emoji: '📖',
  },
  {
    id: 'telugu-english-bible',
    name: { en: 'Telugu–English Parallel Bible', te: 'తెలుగు–ఇంగ్లీష్ సమాంతర బైబిల్' },
    description: {
      en: 'Both languages side by side — for families and study groups that read in two tongues.',
      te: 'రెండు భాషలు పక్కపక్కనే — రెండు భాషల్లో చదివే కుటుంబాలకు, అధ్యయన బృందాలకు.',
    },
    category: 'bibles',
    priceInr: 1150,
    emoji: '📚',
  },
  {
    id: 'pocket-new-testament',
    name: { en: 'Pocket New Testament & Psalms', te: 'జేబు పరిమాణ క్రొత్త నిబంధన & కీర్తనలు' },
    description: {
      en: 'A travel-size New Testament with Psalms — slips into a shirt pocket or handbag.',
      te: 'ప్రయాణాలకు అనువైన చిన్న పరిమాణం — జేబులో, బ్యాగులో సులభంగా ఇమిడే క్రొత్త నిబంధన.',
    },
    category: 'bibles',
    priceInr: 250,
    emoji: '📕',
  },
  {
    id: 'verse-frame-psalm23',
    name: { en: 'Framed Verse — Psalm 23 (Telugu)', te: 'వచన ఫ్రేమ్ — కీర్తన 23 (తెలుగు)' },
    description: {
      en: '"యెహోవా నా కాపరి" in serif Telugu lettering on warm cream, ready to hang. A4 wooden frame.',
      te: '"యెహోవా నా కాపరి" — వెచ్చని క్రీమ్ నేపథ్యంపై అందమైన తెలుగు అక్షరాలు. A4 చెక్క ఫ్రేమ్.',
    },
    category: 'frames',
    priceInr: 599,
    emoji: '🖼️',
  },
  {
    id: 'house-blessing-frame',
    name: { en: 'House Blessing Frame — Joshua 24:15', te: 'గృహ ఆశీర్వాద ఫ్రేమ్ — యెహోషువ 24:15' },
    description: {
      en: '"నేనును నా యింటివారును యెహోవాను సేవించెదము" — the classic doorway verse for Telugu Christian homes.',
      te: '"నేనును నా యింటివారును యెహోవాను సేవించెదము" — తెలుగు క్రైస్తవ గృహాల ద్వారాలకు ప్రియమైన వచనం.',
    },
    category: 'frames',
    priceInr: 649,
    emoji: '🏠',
  },
  {
    id: 'wooden-rosary',
    name: { en: 'Wooden Rosary — Sandal Finish', te: 'చెక్క జపమాల — గంధపు ఫినిష్' },
    description: {
      en: 'Hand-strung wooden rosary with a simple crucifix, in a cloth pouch. A quiet companion for prayer.',
      te: 'చేతితో కూర్చిన చెక్క జపమాల, సాదా సిలువతో, వస్త్రపు సంచిలో. ప్రార్థనకు నెమ్మదైన తోడు.',
    },
    category: 'rosaries',
    priceInr: 349,
    emoji: '📿',
  },
  {
    id: 'velankanni-rosary',
    name: { en: 'Velankanni Rosary — Blue & White', te: 'వేలంకన్ని జపమాల — నీలం & తెలుపు' },
    description: {
      en: 'Blue-and-white beads honouring Our Lady of Velankanni, with a Marian centerpiece.',
      te: 'వేలంకన్ని మాతను స్మరించే నీలం-తెలుపు పూసలు, మరియమాత చిత్రంతో.',
    },
    category: 'rosaries',
    priceInr: 449,
    emoji: '🤍',
  },
  {
    id: 'prayer-candles',
    name: { en: 'Prayer Candles — Set of 12', te: 'ప్రార్థన కొవ్వొత్తులు — 12 సెట్' },
    description: {
      en: 'Slow-burning white candles for the home altar and evening prayer. Unscented.',
      te: 'ఇంటి ప్రార్థనా స్థలానికి, సాయంత్రపు ప్రార్థనకు నెమ్మదిగా వెలిగే తెల్ల కొవ్వొత్తులు.',
    },
    category: 'candles',
    priceInr: 199,
    emoji: '🕯️',
  },
  {
    id: 'cross-pendant',
    name: { en: 'Steel Cross Pendant with Chain', te: 'స్టీల్ సిలువ లాకెట్ — గొలుసుతో' },
    description: {
      en: 'A simple, polished stainless-steel cross on a matching chain. Understated, everyday faith.',
      te: 'నిరాడంబరమైన స్టెయిన్‌లెస్ స్టీల్ సిలువ, సరిపోయే గొలుసుతో. ప్రతిరోజూ ధరించదగినది.',
    },
    category: 'devotional',
    priceInr: 299,
    emoji: '✝️',
  },
  {
    id: 'devotional-oil',
    name: { en: 'Devotional Fragrance Oil — Frankincense', te: 'భక్తి పరిమళ తైలం — సాంబ్రాణి' },
    description: {
      en: 'A frankincense fragrance oil for prayer-time ambience — sold purely as a devotional fragrance for personal use.',
      te: 'ప్రార్థనా సమయపు పరిమళం కోసం సాంబ్రాణి తైలం — వ్యక్తిగత భక్తి పరిమళంగా మాత్రమే విక్రయం.',
    },
    category: 'devotional',
    priceInr: 149,
    emoji: '🫙',
    complianceNote: true,
  },
];
