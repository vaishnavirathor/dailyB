import type { Hymn } from '@/content/types';

/**
 * Starter worship-lyrics set with a zero-risk content policy:
 * - 'scripture' canticles quote the public-domain Telugu OV directly
 *   (the same source as the verse content), and
 * - 'original' songs are written for Daily Bread (no copyright issues).
 *
 * A licensed community hymnal (Andhra Kraisthava Keerthanalu and the
 * Malayalam/Tamil libraries) is a planned integration — those texts need
 * a licensing/partnership review before bundling.
 */
export const hymns: Hymn[] = [
  {
    id: 'psalm-23',
    title: { en: 'The Lord is my Shepherd', te: 'యెహోవా నా కాపరి' },
    source: 'scripture',
    reference: { en: 'Psalm 23', te: 'కీర్తనలు 23' },
    stanzas: [
      {
        te: 'యెహోవా నా కాపరి, నాకు లేమి కలుగదు.\nపచ్చిక గల చోట్లను ఆయన నన్ను పరుండజేయుచున్నాడు.\nశాంతికరమైన జలముల యొద్ద నన్ను నడిపించుచున్నాడు.',
        translit:
          'Yehova naa kaapari, naaku lemi kalugadu.\nPachchika gala chotlanu aayana nannu parundajeyuchunnaadu.\nShaantikaramaina jalamula yodda nannu nadipinchuchunnaadu.',
      },
      {
        te: 'గాఢాంధకారపు లోయలో నేను సంచరించినను\nఏ అపాయమునకు భయపడను — నీవు నాకు తోడై యుందువు.\nనీ దుడ్డుకఱ్ఱయు నీ దండమును నన్ను ఆదరించును.',
        translit:
          'Gaadhaandhakaarapu loyalo nenu sancharinchinanu\nE apaayamunaku bhayapadanu — neevu naaku thodai yunduvu.\nNee duddukarrayu nee dandamunu nannu aadarinchunu.',
      },
      {
        te: 'నా జీవితకాలమంతయు కృపాక్షేమములే నా వెంట వచ్చును.\nచిరకాలము యెహోవా మందిరములో నేను నివాసము చేసెదను.',
        translit:
          'Naa jeevitakaalamantayu krupaakshemamule naa venta vachchunu.\nChirakaalamu Yehova mandiramulo nenu nivaasamu chesedanu.',
      },
    ],
  },
  {
    id: 'psalm-100',
    title: { en: 'Shout for Joy — Psalm 100', te: 'ఉత్సాహ గానము — కీర్తన 100' },
    source: 'scripture',
    reference: { en: 'Psalm 100', te: 'కీర్తనలు 100' },
    stanzas: [
      {
        te: 'సర్వభూజనులారా, యెహోవాను గూర్చి ఉత్సాహధ్వని చేయుడి.\nసంతోషముతో యెహోవాను సేవించుడి.\nగానము చేయుచు ఆయన సన్నిధికి రండి.',
        translit:
          'Sarvabhoojanulaaraa, Yehovaanu goorchi utsaahadhvani cheyudi.\nSantoshamuto Yehovaanu sevinchudi.\nGaanamu cheyuchu aayana sannidhiki randi.',
        isRefrain: true,
      },
      {
        te: 'యెహోవాయే దేవుడని తెలిసికొనుడి.\nఆయనే మనలను పుట్టించెను, మనము ఆయన వారము.\nమనము ఆయన ప్రజలము, ఆయన మేపు గొఱ్ఱెలము.',
        translit:
          'Yehovaaye devudani telisikonudi.\nAayane manalanu puttinchenu, manamu aayana vaaramu.\nManamu aayana prajalamu, aayana mepu gorrelamu.',
      },
      {
        te: 'కృతజ్ఞతార్పణలు చెల్లించుచు ఆయన గుమ్మములలో ప్రవేశించుడి.\nకీర్తనలు పాడుచు ఆయన ఆవరణములలో ప్రవేశించుడి.\nఆయనను కొనియాడుడి, ఆయన నామమును ఘనపరచుడి.',
        translit:
          'Krutagnataarpanalu chellinchuchu aayana gummamulalo praveshinchudi.\nKeertanalu paaduchu aayana aavaranamulalo praveshinchudi.\nAayananu koniyaadudi, aayana naamamunu ghanaparachudi.',
      },
    ],
  },
  {
    id: 'magnificat',
    title: { en: "Mary's Song — Magnificat", te: 'మరియ గీతము — మంగళగానం' },
    source: 'scripture',
    reference: { en: 'Luke 1:46–49', te: 'లూకా 1:46–49' },
    stanzas: [
      {
        te: 'నా ప్రాణము ప్రభువును ఘనపరచుచున్నది.\nనా ఆత్మ నా రక్షకుడైన దేవునియందు ఆనందించెను.',
        translit:
          'Naa praanamu prabhuvunu ghanaparachuchunnadi.\nNaa aatma naa rakshakudaina devuniyandu aanandinchenu.',
      },
      {
        te: 'ఆయన తన దాసురాలి దీనస్థితిని కటాక్షించెను.\nఇది మొదలుకొని అన్ని తరములవారు నన్ను ధన్యురాలని యందురు.',
        translit:
          'Aayana tana daasuraali deenasthitini kataakshinchenu.\nIdi modalukoni anni taramulavaaru nannu dhanyuraalani yanduru.',
      },
      {
        te: 'సర్వశక్తిమంతుడు నాకు గొప్పకార్యములు చేసెను.\nఆయన నామము పరిశుద్ధము.',
        translit: 'Sarvashaktimantudu naaku goppakaaryamulu chesenu.\nAayana naamamu parishuddhamu.',
      },
    ],
  },
  {
    id: 'doxology-te',
    title: { en: 'Doxology — Praise God', te: 'స్తుతి గీతము' },
    source: 'original',
    stanzas: [
      {
        te: 'సకల దీవెనల మూలమా, స్తుతి!\nభూలోక జనులందరూ స్తుతించుడి!\nపరలోక సైన్యమా, స్తుతించుడి!\nతండ్రి, కుమార, పరిశుద్ధాత్మకు స్తుతి! ఆమేన్.',
        translit:
          'Sakala deevenala moolamaa, stuti!\nBhooloka janulandaroo stutinchudi!\nParaloka sainyamaa, stutinchudi!\nTandri, Kumaara, Parishuddhaatmaku stuti! Aamen.',
        isRefrain: true,
      },
    ],
  },
  {
    id: 'nee-krupa-chaalunu',
    title: { en: 'Your Grace is Enough', te: 'నీ కృప చాలును' },
    source: 'original',
    stanzas: [
      {
        te: 'నీ కృప చాలును నాకు ప్రతి దినము,\nనీ బలము నా బలహీనతలో పూర్ణము.\nఉదయాన్నే నీ వాత్సల్యత నూతనము,\nనమ్మకమైన దేవా, నీవే నా ఆశ్రయము.',
        translit:
          'Nee krupa chaalunu naaku prati dinamu,\nNee balamu naa balaheenatalo poornamu.\nUdayaanne nee vaatsalyata nootanamu,\nNammakamaina Devaa, neeve naa aashrayamu.',
        isRefrain: true,
      },
      {
        te: 'లోయలోనైనా కొండపైనైనా,\nనా చేయి విడువని నా కాపరివి నీవే.\nనా కన్నీటిని గానముగా మార్చువా,\nనా హృదయము నీకే పాడును స్తుతి.',
        translit:
          'Loyalonainaa kondapainainaa,\nNaa cheyi viduvani naa kaaparivi neeve.\nNaa kanneetini gaanamugaa maarchuvaa,\nNaa hrudayamu neeke paadunu stuti.',
      },
    ],
  },
  {
    id: 'udayakaala-stuti',
    title: { en: 'Morning Praise', te: 'ఉదయకాల స్తుతి' },
    source: 'original',
    stanzas: [
      {
        te: 'తెల్లవారెను — నీ కృపతో మేల్కొంటిని,\nనేటి ఆహారము నీ చేతిలోనిది.\nనా అడుగులు నీ వాక్యపు వెలుగులో,\nఈ దినమంతా నీతోనే నడచెదను.',
        translit:
          'Tellavaarenu — nee krupato melkontini,\nNeti aahaaramu nee chetiloniidi.\nNaa adugulu nee vaakyapu velugulo,\nEe dinamantaa neetone nadachedanu.',
      },
      {
        te: 'నీ నామము నా పెదవులపై గీతము,\nనీ సన్నిధి నా హృదయపు విశ్రాంతి.\nదినసరి ఆహారమిచ్చు తండ్రీ,\nనీకే మహిమ, నీకే స్తుతి, ఆమేన్.',
        translit:
          'Nee naamamu naa pedavulapai geetamu,\nNee sannidhi naa hrudayapu vishraanti.\nDinasari aahaaramichchu Tandree,\nNeeke mahima, neeke stuti, aamen.',
        isRefrain: true,
      },
    ],
  },
];
