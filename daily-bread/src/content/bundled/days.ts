import type { DayEntry } from '@/content/types';

/**
 * Starter content set — 14 day entries; the rotation wraps until a full
 * 365-day set ships. Telugu scripture follows the public-domain Telugu
 * Old Version (BSI 1880s); English follows the KJV (public domain).
 *
 * ⚠️ Flagged in the design doc: all Telugu text must be reviewed by a
 * native speaker / pastor before launch.
 */
export const days: DayEntry[] = [
  {
    verse: {
      id: 'v01',
      reference: { en: 'Matthew 6:11', te: 'మత్తయి 6:11' },
      text: {
        en: 'Give us this day our daily bread.',
        te: 'మా అనుదినాహారము నేడు మాకు దయచేయుము.',
      },
    },
    reflection: {
      id: 'r01',
      title: { en: 'Enough for today', te: 'నేటికి సరిపడినంత' },
      body: {
        en: 'Jesus taught us to ask for bread one day at a time. Not a month of supplies, not a lifetime of security — today\'s bread. This little prayer quietly frees us from two heavy loads: regret about yesterday and anxiety about tomorrow. The God who fed Israel with manna each morning still gives in daily portions, because He wants to meet us each morning. Whatever today actually needs — strength, patience, courage, rice on the table — ask Him for it plainly. He is not tired of your daily asking; He invited it.',
        te: 'యేసు మనకు ఒక్కో రోజుకు సరిపడిన ఆహారం అడగమని నేర్పించాడు. నెల సరుకులు కాదు, జీవితకాల భద్రత కాదు — నేటి ఆహారం మాత్రమే. ఈ చిన్న ప్రార్థన నిన్నటి విచారం నుండి, రేపటి ఆందోళన నుండి మనలను విడిపిస్తుంది. ప్రతి ఉదయం మన్నాతో ఇశ్రాయేలును పోషించిన దేవుడు నేటికీ రోజు వారీగా ఇస్తున్నాడు — ఎందుకంటే ఆయన ప్రతి ఉదయం మనలను కలవాలని కోరుకుంటున్నాడు. ఈ రోజుకు ఏమి అవసరమో — బలం, సహనం, ధైర్యం, ఇంట్లో అన్నం — దాన్ని సూటిగా ఆయనను అడగండి. మీ దైనందిన ప్రార్థన ఆయనకు విసుగు కాదు; ఆయనే దాన్ని ఆహ్వానించాడు.',
      },
      prayer: {
        en: 'Father, give me what today needs, and teach me to trust You for tomorrow. Amen.',
        te: 'తండ్రీ, నేటికి కావలసినది నాకు దయచేయుము; రేపటి కోసం నిన్ను నమ్ముకోవడం నేర్పుము. ఆమేన్.',
      },
    },
  },
  {
    verse: {
      id: 'v02',
      reference: { en: 'Psalm 23:1', te: 'కీర్తనలు 23:1' },
      text: {
        en: 'The LORD is my shepherd; I shall not want.',
        te: 'యెహోవా నా కాపరి నాకు లేమి కలుగదు.',
      },
    },
    reflection: {
      id: 'r02',
      title: { en: 'A shepherd who knows you', te: 'మిమ్మల్ని ఎరిగిన కాపరి' },
      body: {
        en: 'David did not write "the LORD is a shepherd" but "the LORD is my shepherd." Everything rests on that one small word. A shepherd counts his own sheep, knows which one limps, which one wanders, which one is carrying a lamb. You are not lost in a crowd of millions to Him. Before you plan this day, hear the psalm\'s quiet promise: the One leading you knows the path, the pasture, and the valley — and He has never lost a sheep He carries.',
        te: 'దావీదు "యెహోవా ఒక కాపరి" అని రాయలేదు — "యెహోవా నా కాపరి" అని రాశాడు. ఆ ఒక్క చిన్న మాటపైనే అంతా ఆధారపడి ఉంది. కాపరి తన గొర్రెలను లెక్కిస్తాడు; ఏది కుంటుతుందో, ఏది దారి తప్పుతుందో అతనికి తెలుసు. కోట్ల మందిలో మీరు ఆయనకు కనిపించకుండా పోరు. ఈ రోజును ప్రారంభించే ముందు ఈ కీర్తన ఇచ్చే నెమ్మది వాగ్దానాన్ని వినండి: మిమ్మల్ని నడిపించేవాడికి దారి తెలుసు, పచ్చిక తెలుసు, లోయ కూడా తెలుసు — ఆయన మోసే గొర్రె ఎన్నడూ తప్పిపోలేదు.',
      },
      prayer: {
        en: 'Lord, be my shepherd today. Lead me, and I will follow without fear. Amen.',
        te: 'ప్రభువా, నేడు నా కాపరిగా ఉండుము. నన్ను నడిపించుము; భయం లేకుండా నిన్ను అనుసరిస్తాను. ఆమేన్.',
      },
    },
  },
  {
    verse: {
      id: 'v03',
      reference: { en: 'John 3:16', te: 'యోహాను 3:16' },
      text: {
        en: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
        te: 'దేవుడు లోకమును ఎంతో ప్రేమించెను. కాగా ఆయన తన అద్వితీయకుమారునిగా పుట్టిన వానియందు విశ్వాసముంచు ప్రతివాడును నశింపక నిత్యజీవము పొందునట్లు ఆయనను అనుగ్రహించెను.',
      },
    },
    reflection: {
      id: 'r03',
      title: { en: 'Love that gave', te: 'ఇచ్చిన ప్రేమ' },
      body: {
        en: 'We measure love by what it costs. Words are cheap; gifts can be small; but God\'s love is measured by what He gave — His only Son. Notice the word "whosoever": no caste, no language, no family history, no past failure is excluded from it. If you have ever wondered whether you matter, this verse is heaven\'s answer, signed at the cross. Today, let that settle deep: you are loved, not because you proved yourself, but because God is love.',
        te: 'ప్రేమను దాని వెల చూసి కొలుస్తాం. మాటలు తేలిక; బహుమతులు చిన్నవి కావచ్చు; కానీ దేవుని ప్రేమ ఆయన ఇచ్చినదాన్ని బట్టి కొలవబడుతుంది — తన ఏకైక కుమారుణ్ణి ఇచ్చాడు. "ప్రతివాడును" అనే మాటను గమనించండి: ఏ కులం, ఏ భాష, ఏ గత పొరపాటు దాని నుండి తప్పించబడలేదు. నేను విలువైనవాడినేనా అని మీరు ఎప్పుడైనా అనుకుంటే — ఈ వచనమే పరలోకపు జవాబు, సిలువపై సంతకం చేయబడింది. ఈ రోజు ఈ సత్యం లోతుగా నాటుకోనివ్వండి: మీరు మిమ్మల్ని నిరూపించుకున్నందుకు కాదు, దేవుడు ప్రేమ గనుక మీరు ప్రేమించబడుతున్నారు.',
      },
      prayer: {
        en: 'Jesus, thank You for loving me at the cost of the cross. Help me live as one who is loved. Amen.',
        te: 'యేసయ్యా, సిలువ వెలతో నన్ను ప్రేమించినందుకు వందనాలు. ప్రేమించబడినవాడిగా జీవించడానికి సహాయం చేయుము. ఆమేన్.',
      },
    },
  },
  {
    verse: {
      id: 'v04',
      reference: { en: 'Philippians 4:13', te: 'ఫిలిప్పీయులకు 4:13' },
      text: {
        en: 'I can do all things through Christ which strengtheneth me.',
        te: 'నన్ను బలపరచువానియందే నేను సమస్తమును చేయగలను.',
      },
    },
    reflection: {
      id: 'r04',
      title: { en: 'Strength on loan', te: 'అరువు కాదు — అనుగ్రహ బలం' },
      body: {
        en: 'Paul wrote this from a prison, not a palace. He had learned a secret: contentment and courage do not come from circumstances but from a Person. "Through Christ" — that is the hinge of the verse. It is not self-confidence; it is Christ-confidence. Whatever stands in front of you today — an exam, an illness, a hard conversation, an empty wallet — you do not face it with only your own strength. His strength is supplied to the weak, on request, every single day.',
        te: 'పౌలు ఈ మాటలు రాజభవనం నుండి కాదు, చెరసాల నుండి రాశాడు. అతనికి ఒక రహస్యం తెలిసింది: తృప్తి, ధైర్యం పరిస్థితుల నుండి రావు — ఒక వ్యక్తి నుండి వస్తాయి. "నన్ను బలపరచువానియందే" — ఇదే ఈ వచనపు ఆధారం. ఇది ఆత్మవిశ్వాసం కాదు; క్రీస్తు మీద విశ్వాసం. నేడు మీ ముందు ఏది నిలబడినా — పరీక్ష, జబ్బు, కష్టమైన మాట, ఖాళీ చేయి — మీరు మీ సొంత బలంతో మాత్రమే ఎదుర్కోవడం లేదు. బలహీనులకు ఆయన బలం ప్రతి రోజూ, అడిగిన వెంటనే అందుతుంది.',
      },
      prayer: {
        en: 'Lord, I am weak but You are strong. Strengthen me for what this day holds. Amen.',
        te: 'ప్రభువా, నేను బలహీనుడను గానీ నీవు బలవంతుడవు. ఈ రోజు ఎదురయ్యే ప్రతిదానికీ నన్ను బలపరచుము. ఆమేన్.',
      },
    },
  },
  {
    verse: {
      id: 'v05',
      reference: { en: 'Isaiah 41:10', te: 'యెషయా 41:10' },
      text: {
        en: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.',
        te: 'భయపడకుము నేను నీకు తోడై యున్నాను దిగులుపడకుము నేను నీ దేవుడను నేను నిన్ను బలపరతును నీకు సహాయము చేయువాడనై యున్నాను నీతియను నా దక్షిణహస్తముతో నిన్ను ఆదుకొందును.',
      },
    },
    reflection: {
      id: 'r05',
      title: { en: 'Five promises against fear', te: 'భయానికి ఎదురుగా ఐదు వాగ్దానాలు' },
      body: {
        en: 'Count the promises in this single verse: I am with you. I am your God. I will strengthen you. I will help you. I will uphold you. Five anchors for one fearful heart. God does not shame us for being afraid; He answers fear with Himself. The grip described here is His hand holding you — not your hand holding Him. On the days your grip feels weak, remember whose hand does the upholding.',
        te: 'ఈ ఒక్క వచనంలో వాగ్దానాలను లెక్కించండి: నీకు తోడై ఉన్నాను. నీ దేవుడను. నిన్ను బలపరుస్తాను. నీకు సహాయం చేస్తాను. నిన్ను ఆదుకుంటాను. భయపడే ఒక్క హృదయానికి ఐదు లంగర్లు. భయపడినందుకు దేవుడు మనలను అవమానించడు; భయానికి ఆయన తననే జవాబుగా ఇస్తాడు. ఇక్కడ చెప్పిన పట్టు — మీరు ఆయనను పట్టుకోవడం కాదు, ఆయన మిమ్మల్ని పట్టుకోవడం. మీ పట్టు బలహీనంగా అనిపించే రోజున, ఆదుకునే హస్తం ఎవరిదో గుర్తుచేసుకోండి.',
      },
      prayer: {
        en: 'My God, when fear whispers, let Your promises speak louder. Hold me fast today. Amen.',
        te: 'నా దేవా, భయం గుసగుసలాడేప్పుడు నీ వాగ్దానాలు బిగ్గరగా మాట్లాడనివ్వుము. నేడు నన్ను గట్టిగా పట్టుకొనుము. ఆమేన్.',
      },
    },
  },
  {
    verse: {
      id: 'v06',
      reference: { en: 'Psalm 46:1', te: 'కీర్తనలు 46:1' },
      text: {
        en: 'God is our refuge and strength, a very present help in trouble.',
        te: 'దేవుడు మనకు ఆశ్రయమును దుర్గమునై యున్నాడు ఆపత్కాలములో ఆయన నమ్ముకొనదగిన సహాయకుడు.',
      },
    },
    reflection: {
      id: 'r06',
      title: { en: 'A very present help', te: 'ఆపదలో దగ్గరి సహాయం' },
      body: {
        en: 'Some help arrives late; some help stays far away and sends advice. The psalmist says God is a very present help — nearest exactly when trouble is loudest. A refuge is not a place you admire from a distance; it is a place you run into. Prayer is that running. Whatever storm is circling your family, your work, or your health today, do not stand outside discussing the weather. Step inside the refuge. He is already there.',
        te: 'కొన్ని సహాయాలు ఆలస్యంగా వస్తాయి; కొన్ని దూరంగా ఉండి సలహాలు పంపుతాయి. కానీ దేవుడు "నమ్ముకొనదగిన సహాయకుడు" అని కీర్తనకారుడు అంటాడు — ఆపద పెద్దగా అరిచే క్షణంలోనే ఆయన అతి దగ్గరగా ఉంటాడు. ఆశ్రయం అంటే దూరం నుండి మెచ్చుకునే చోటు కాదు; పరుగెత్తి లోపలికి వెళ్ళే చోటు. ప్రార్థనే ఆ పరుగు. నేడు మీ కుటుంబం చుట్టూ, ఉద్యోగం చుట్టూ, ఆరోగ్యం చుట్టూ ఏ తుఫాను తిరుగుతున్నా — బయట నిలబడి వాతావరణం గురించి మాట్లాడకండి. ఆశ్రయంలోకి అడుగుపెట్టండి. ఆయన అప్పటికే అక్కడ ఉన్నాడు.',
      },
      prayer: {
        en: 'Father, You are my refuge. I run to You now with everything that troubles me. Amen.',
        te: 'తండ్రీ, నీవే నా ఆశ్రయం. నన్ను కలవరపెట్టే ప్రతిదానితో ఇప్పుడు నీ దగ్గరికి పరుగెత్తుతున్నాను. ఆమేన్.',
      },
    },
  },
  {
    verse: {
      id: 'v07',
      reference: { en: 'Matthew 11:28', te: 'మత్తయి 11:28' },
      text: {
        en: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
        te: 'ప్రయాసపడి భారము మోసికొనుచున్న సమస్త జనులారా, నా యొద్దకు రండి; నేను మీకు విశ్రాంతి కలుగజేతును.',
      },
    },
    reflection: {
      id: 'r07',
      title: { en: 'The invitation to rest', te: 'విశ్రాంతికి ఆహ్వానం' },
      body: {
        en: 'This may be the gentlest sentence Jesus ever spoke. He does not say "try harder" to the tired; He says "come to me." Religion often adds weight; Jesus lifts it. Notice that He calls the burdened ones — the very people who feel least presentable. You do not need to rest first and then come; you come, and then He gives rest. Bring Him the load you have been carrying silently. His shoulders were made for it.',
        te: 'యేసు పలికిన మాటల్లో ఇది అత్యంత మృదువైనది కావచ్చు. అలసినవారితో ఆయన "ఇంకా కష్టపడు" అనడు; "నా దగ్గరికి రా" అంటాడు. మతం తరచూ బరువు పెంచుతుంది; యేసు బరువు దించుతాడు. ఆయన పిలిచేది భారం మోసేవారినే — తాము యోగ్యులం కాదని భావించేవారినే. ముందు విశ్రాంతి పొంది తరువాత రావాలి అని కాదు; మీరు వస్తే ఆయన విశ్రాంతినిస్తాడు. మీరు మౌనంగా మోస్తున్న భారాన్ని ఆయన దగ్గరికి తీసుకురండి. ఆ భుజాలు దాని కోసమే సిద్ధమయ్యాయి.',
      },
      prayer: {
        en: 'Jesus, I come as I am, tired and loaded. Give me Your rest today. Amen.',
        te: 'యేసయ్యా, అలసిపోయి, భారంతో — ఉన్నవాడిని ఉన్నట్టే వస్తున్నాను. నేడు నీ విశ్రాంతిని దయచేయుము. ఆమేన్.',
      },
    },
  },
  {
    verse: {
      id: 'v08',
      reference: { en: 'Proverbs 3:5–6', te: 'సామెతలు 3:5–6' },
      text: {
        en: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
        te: 'నీ స్వబుద్ధిని ఆధారము చేసికొనక నీ పూర్ణహృదయముతో యెహోవాయందు నమ్మకముంచుము నీ ప్రవర్తన అంతటియందు ఆయన అధికారమునకు ఒప్పుకొనుము అప్పుడు ఆయన నీ త్రోవలను సరాళము చేయును.',
      },
    },
    reflection: {
      id: 'r08',
      title: { en: 'Crooked made straight', te: 'వంకర దారులు సరాళం' },
      body: {
        en: 'We lean on what we trust — a wall, a stick, a salary, our own cleverness. This proverb asks for a transfer of weight: lean the whole heart on the LORD. It does not promise we will understand the route; it promises He will straighten it. Acknowledge Him "in all thy ways" — in the small decisions, not only the crises. The God who directs paths is happy to be consulted about ordinary Tuesdays.',
        te: 'మనం దేన్ని నమ్ముతామో దాని మీదే ఆనుకుంటాం — గోడ, కర్ర, జీతం, సొంత తెలివి. ఈ సామెత బరువును మార్చమంటుంది: పూర్ణ హృదయాన్ని యెహోవా మీద ఆనించమంటుంది. దారి మనకు అర్థమవుతుందని వాగ్దానం లేదు; ఆయన దాన్ని సరాళం చేస్తాడని వాగ్దానం ఉంది. "నీ ప్రవర్తన అంతటియందు" ఆయనను ఒప్పుకోండి — సంక్షోభాల్లో మాత్రమే కాదు, చిన్న నిర్ణయాల్లో కూడా. దారులు సరిచేసే దేవుడు మామూలు మంగళవారాల గురించి కూడా అడిగితే సంతోషిస్తాడు.',
      },
      prayer: {
        en: 'Lord, I hand You the map. Direct my path today, even where I cannot see. Amen.',
        te: 'ప్రభువా, నా దారి పటాన్ని నీ చేతికిస్తున్నాను. నాకు కనబడని చోట కూడా నేడు నా త్రోవను నడిపించుము. ఆమేన్.',
      },
    },
  },
  {
    verse: {
      id: 'v09',
      reference: { en: 'Lamentations 3:22–23', te: 'విలాపవాక్యములు 3:22–23' },
      text: {
        en: "It is of the LORD's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.",
        te: 'యెహోవా కృపగలవాడు ఆయన వాత్సల్యత యెడతెగక నిలుచునది గనుక మనము నిర్మూలము కాకున్నవారము. అనుదినము నూతనముగా ఆయనకు వాత్సల్యత పుట్టుచున్నది నీ విశ్వాస్యత గొప్పది.',
      },
    },
    reflection: {
      id: 'r09',
      title: { en: 'New every morning', te: 'ప్రతి ఉదయం కొత్తగా' },
      body: {
        en: 'These words were written in the middle of a book of tears, by a man watching his city in ruins. Even there, he found one unburned truth: God\'s mercies restock overnight. Yesterday\'s grace was for yesterday; it is not stale bread to be stretched. This morning came with its own fresh supply of compassion, patience, and forgiveness. Whatever yesterday held — failure, grief, harsh words — the mercy account is full again. Begin from there.',
        te: 'ఈ మాటలు కన్నీళ్ళ గ్రంథం మధ్యలో రాయబడ్డాయి — శిథిలమైన తన పట్టణాన్ని చూస్తున్న వ్యక్తి రాశాడు. అక్కడ కూడా అతనికి కాలిపోని ఒక సత్యం దొరికింది: దేవుని కృప రాత్రికి రాత్రి కొత్తగా నిండుతుంది. నిన్నటి కృప నిన్నటికే; దాన్ని సాగదీయవలసిన పాత రొట్టె కాదు. ఈ ఉదయం దాని సొంత తాజా వాత్సల్యంతో, సహనంతో, క్షమాపణతో వచ్చింది. నిన్న ఏమి జరిగినా — తప్పు, దుఃఖం, కటువు మాటలు — కృప ఖాతా మళ్ళీ నిండింది. అక్కడి నుండే ప్రారంభించండి.',
      },
      prayer: {
        en: 'Faithful God, thank You for fresh mercy this morning. Help me give others what You give me. Amen.',
        te: 'నమ్మకమైన దేవా, ఈ ఉదయపు తాజా కృపకు వందనాలు. నీవు నాకిచ్చేదాన్ని ఇతరులకూ ఇవ్వడానికి సహాయం చేయుము. ఆమేన్.',
      },
    },
  },
  {
    verse: {
      id: 'v10',
      reference: { en: 'Joshua 1:9', te: 'యెహోషువ 1:9' },
      text: {
        en: 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.',
        te: 'నేను నీకు ఆజ్ఞ ఇచ్చియున్నాను గదా, నిబ్బరముగలిగి ధైర్యముగా నుండుము, భయపడకుము జడియకుము. నీవు నడుచు మార్గమంతటిలో నీ దేవుడైన యెహోవా నీకు తోడై యుండును.',
      },
    },
    reflection: {
      id: 'r10',
      title: { en: 'Courage is a command', te: 'ధైర్యం ఒక ఆజ్ఞ' },
      body: {
        en: 'God spoke these words to Joshua on the eve of an impossible assignment. Notice: courage here is not a feeling that arrives; it is a command to obey — and every command of God carries His enabling inside it. The reason given is not "you are capable" but "I am with you, wherever you go." New chapter, new city, new responsibility, new fear? The presence goes with you. Step forward.',
        te: 'అసాధ్యమైన పని ముందు నిలబడిన యెహోషువతో దేవుడు ఈ మాటలు పలికాడు. గమనించండి: ఇక్కడ ధైర్యం అనేది వచ్చి పడే భావన కాదు; పాటించవలసిన ఆజ్ఞ — దేవుని ప్రతి ఆజ్ఞలో దాన్ని నెరవేర్చే శక్తి కూడా ఉంటుంది. ఇచ్చిన కారణం "నీవు సమర్థుడవు" అని కాదు — "నీవు ఎక్కడికి వెళ్ళినా నేను నీకు తోడుగా ఉంటాను" అని. కొత్త అధ్యాయమా, కొత్త ఊరా, కొత్త బాధ్యతా, కొత్త భయమా? ఆ సన్నిధి మీతో పాటు వెళ్తుంది. ముందడుగు వేయండి.',
      },
      prayer: {
        en: 'Lord, where You send me, You go with me. Make me strong and courageous today. Amen.',
        te: 'ప్రభువా, నీవు పంపిన చోటికి నీవే తోడుగా వస్తావు. నేడు నన్ను నిబ్బరంగా, ధైర్యంగా చేయుము. ఆమేన్.',
      },
    },
  },
  {
    verse: {
      id: 'v11',
      reference: { en: 'Psalm 119:105', te: 'కీర్తనలు 119:105' },
      text: {
        en: 'Thy word is a lamp unto my feet, and a light unto my path.',
        te: 'నీ వాక్యము నా పాదములకు దీపమును నా త్రోవకు వెలుగునై యున్నది.',
      },
    },
    reflection: {
      id: 'r11',
      title: { en: 'Light for the next step', te: 'తర్వాతి అడుగుకు వెలుగు' },
      body: {
        en: 'A lamp for the feet is not a floodlight for the whole valley. Scripture usually shows us the next step, not the next decade — and that is mercy, not stinginess. Walking with God is a nightly trust exercise: enough light to move, enough darkness to keep holding His hand. If you are waiting for the full plan before you obey the next clear verse, you may wait forever. Take the lit step.',
        te: 'పాదాలకు దీపం అంటే లోయ మొత్తాన్ని చూపే పెద్ద లైటు కాదు. వాక్యం సాధారణంగా తర్వాతి అడుగును చూపుతుంది — రాబోయే పదేళ్ళను కాదు. అది లోపం కాదు, కృప. దేవునితో నడక అంటే ప్రతి రాత్రి నమ్మకపు సాధన: కదలడానికి సరిపడా వెలుగు, ఆయన చేయి విడవకుండా ఉండడానికి సరిపడా చీకటి. పూర్తి ప్రణాళిక వచ్చే వరకు స్పష్టంగా కనబడుతున్న వచనానికి లోబడకుండా ఆగితే, ఎప్పటికీ ఆగే ఉంటారు. వెలుగు పడిన అడుగు వేయండి.',
      },
      prayer: {
        en: 'Father, light my next step through Your word, and give me the heart to take it. Amen.',
        te: 'తండ్రీ, నీ వాక్యం ద్వారా నా తర్వాతి అడుగుపై వెలుగు ప్రసరించుము; దాన్ని వేసే హృదయాన్ని కూడా ఇవ్వుము. ఆమేన్.',
      },
    },
  },
  {
    verse: {
      id: 'v12',
      reference: { en: 'Romans 8:28', te: 'రోమీయులకు 8:28' },
      text: {
        en: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
        te: 'దేవుని ప్రేమించువారికి, అనగా ఆయన సంకల్పముచొప్పున పిలువబడినవారికి, మేలు కలుగుటకై సమస్తమును సమకూడి జరుగుచున్నవని యెరుగుదుము.',
      },
    },
    reflection: {
      id: 'r12',
      title: { en: 'The weaving of all things', te: 'అన్నిటినీ అల్లే చేతులు' },
      body: {
        en: 'The verse does not say all things are good — some things are bitter, unjust, and worth weeping over. It says all things work together for good, the way flour, salt, and fire are separately unpleasant but together become bread. The weaving is God\'s work, on God\'s loom, often visible only from the other side. If today holds a thread you cannot explain, trust the Weaver\'s pattern over the knot you can see.',
        te: 'అన్నీ మంచివే అని ఈ వచనం చెప్పదు — కొన్ని చేదుగా, అన్యాయంగా, ఏడ్వదగినవిగా ఉంటాయి. కానీ అన్నీ కలిసి మేలుకే పనిచేస్తాయని చెబుతుంది — పిండి, ఉప్పు, నిప్పు విడివిడిగా ఇష్టం కాకపోయినా కలిసి రొట్టె అయినట్టు. ఆ అల్లిక దేవుని పని, దేవుని మగ్గం మీద జరుగుతుంది — తరచూ అవతలి వైపు నుండి మాత్రమే కనబడుతుంది. ఈ రోజు మీకు అర్థం కాని దారం ఎదురైతే, కనబడే ముడిని కాదు — నేసేవాని నమూనాను నమ్మండి.',
      },
      prayer: {
        en: 'Lord, I cannot see the pattern, but I trust Your hands. Work all of today for good. Amen.',
        te: 'ప్రభువా, నమూనా నాకు కనబడదు గానీ నీ చేతులను నమ్ముతున్నాను. నేటి సమస్తాన్నీ మేలుకే నడిపించుము. ఆమేన్.',
      },
    },
  },
  {
    verse: {
      id: 'v13',
      reference: { en: 'Matthew 5:16', te: 'మత్తయి 5:16' },
      text: {
        en: 'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.',
        te: 'మనుష్యులు మీ సత్క్రియలను చూచి పరలోకమందున్న మీ తండ్రిని మహిమపరచునట్లు వారియెదుట మీ వెలుగు ప్రకాశింపనియ్యుడి.',
      },
    },
    reflection: {
      id: 'r13',
      title: { en: 'Quiet light', te: 'నిశ్శబ్ద వెలుగు' },
      body: {
        en: 'A lamp does not shout about shining; it simply burns where it is placed. Jesus connects light with works, not words — kindness at home, honesty at work, patience in traffic, generosity to the one who cannot repay. And He fixes the destination of the credit: "glorify your Father." Light that points to itself is glare; light that points to Him is grace. Today, shine where you are placed, and let the praise travel upward.',
        te: 'దీపం తాను వెలుగుతున్నానని అరవదు; పెట్టిన చోట నిశ్శబ్దంగా వెలుగుతుంది. యేసు వెలుగును మాటలతో కాదు — క్రియలతో కలిపాడు: ఇంట్లో దయ, పనిలో నిజాయితీ, తిరిగి ఇవ్వలేని వారికి ఔదార్యం. మెప్పు ఎవరికి చేరాలో కూడా ఆయన నిర్ణయించాడు: "మీ తండ్రిని మహిమపరచునట్లు." తనవైపు చూపే వెలుగు మిరుమిట్లు; ఆయనవైపు చూపే వెలుగు కృప. నేడు మిమ్మల్ని ఉంచిన చోటే ప్రకాశించండి — స్తుతి పైకి ప్రయాణించనివ్వండి.',
      },
      prayer: {
        en: 'Father, let something I do today make someone look up to You. Amen.',
        te: 'తండ్రీ, నేడు నేను చేసే ఏదో ఒక పని ఎవరినైనా నీవైపు చూసేలా చేయనివ్వుము. ఆమేన్.',
      },
    },
  },
  {
    verse: {
      id: 'v14',
      reference: { en: 'Psalm 118:24', te: 'కీర్తనలు 118:24' },
      text: {
        en: 'This is the day which the LORD hath made; we will rejoice and be glad in it.',
        te: 'యెహోవా ఏర్పరచిన దినము ఇదే దీనియందు మనము ఉత్సహించి సంతోషించెదము.',
      },
    },
    reflection: {
      id: 'r14',
      title: { en: 'A day worth receiving', te: 'అందుకోదగిన రోజు' },
      body: {
        en: 'Joy here is a decision made early: "we will rejoice." Not because the day is perfect, but because of who made it and gave it. Every sunrise is delivered from His hand with your name on it — twenty-four unrepeatable hours. Complaint receives the day like a tax; faith receives it like a gift. Before the noise begins, decide with the psalmist how this one will be received.',
        te: 'ఇక్కడ సంతోషం ఉదయాన్నే తీసుకునే నిర్ణయం: "మనము ఉత్సహించెదము." రోజు పరిపూర్ణం గనుక కాదు — దాన్ని చేసి ఇచ్చినవాడు ఎవరో గనుక. ప్రతి సూర్యోదయం మీ పేరుతో ఆయన చేతి నుండి అందుతుంది — తిరిగి రాని ఇరవై నాలుగు గంటలు. సణుగుడు రోజును పన్నులా అందుకుంటుంది; విశ్వాసం బహుమతిలా అందుకుంటుంది. హడావిడి మొదలయ్యే ముందు, ఈ రోజును ఎలా అందుకోవాలో కీర్తనకారునితో కలిసి నిర్ణయించండి.',
      },
      prayer: {
        en: 'Lord, thank You for this day. I receive it as Your gift and choose joy in it. Amen.',
        te: 'ప్రభువా, ఈ రోజుకు వందనాలు. దీన్ని నీ బహుమతిగా అందుకొని, ఇందులో సంతోషాన్ని ఎంచుకుంటున్నాను. ఆమేన్.',
      },
    },
  },
];
