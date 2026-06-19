import type { ReadingPlan } from '@/content/types';

/**
 * Two short, achievable starter plans. "The Lord's Prayer" walks the prayer
 * that names the app; "Promises for the Week" samples each promise theme.
 */
export const plans: ReadingPlan[] = [
  {
    id: 'lords-prayer',
    title: { en: "The Lord's Prayer", te: 'ప్రభువు ప్రార్థన' },
    description: {
      en: 'Seven days inside the prayer Jesus taught — one phrase at a time.',
      te: 'యేసు నేర్పిన ప్రార్థనలో ఏడు రోజులు — ఒక్కో మాట చొప్పున.',
    },
    days: [
      {
        reference: { en: 'Matthew 6:9', te: 'మత్తయి 6:9' },
        text: {
          en: 'Our Father which art in heaven, Hallowed be thy name.',
          te: 'పరలోకమందున్న మా తండ్రీ, నీ నామము పరిశుద్ధపరచబడును గాక.',
        },
        thought: {
          en: 'Prayer begins with a relationship: He is Father before He is anything else to us.',
          te: 'ప్రార్థన బంధంతో మొదలవుతుంది: అన్నిటికంటే ముందు ఆయన మనకు తండ్రి.',
        },
      },
      {
        reference: { en: 'Matthew 6:10a', te: 'మత్తయి 6:10అ' },
        text: {
          en: 'Thy kingdom come.',
          te: 'నీ రాజ్యము వచ్చును గాక.',
        },
        thought: {
          en: 'We ask for His rule to arrive — in the world, and first in our own hearts.',
          te: 'ఆయన పరిపాలన రావాలని అడుగుతాం — లోకంలో, అన్నిటికంటే ముందు మన హృదయాల్లో.',
        },
      },
      {
        reference: { en: 'Matthew 6:10b', te: 'మత్తయి 6:10ఆ' },
        text: {
          en: 'Thy will be done in earth, as it is in heaven.',
          te: 'నీ చిత్తము పరలోకమందు నెరవేరుచున్నట్లు భూమియందును నెరవేరును గాక.',
        },
        thought: {
          en: 'Surrender is not losing; it is aligning with the only perfect will there is.',
          te: 'శరణాగతి ఓటమి కాదు; ఏకైక పరిపూర్ణ చిత్తంతో మన దారిని కలపడం.',
        },
      },
      {
        reference: { en: 'Matthew 6:11', te: 'మత్తయి 6:11' },
        text: {
          en: 'Give us this day our daily bread.',
          te: 'మా అనుదినాహారము నేడు మాకు దయచేయుము.',
        },
        thought: {
          en: 'Daily dependence — the prayer this app is named after.',
          te: 'అనుదిన ఆధారపడటం — ఈ యాప్ పేరు పుట్టిన ప్రార్థన ఇదే.',
        },
      },
      {
        reference: { en: 'Matthew 6:12', te: 'మత్తయి 6:12' },
        text: {
          en: 'And forgive us our debts, as we forgive our debtors.',
          te: 'మా ఋణస్థులను మేము క్షమించియున్న ప్రకారము మా ఋణములను క్షమించుము.',
        },
        thought: {
          en: 'Received forgiveness flows onward — kept forgiveness goes stale.',
          te: 'పొందిన క్షమాపణ ముందుకు ప్రవహించాలి — ఆపుకున్న క్షమాపణ పాచిపోతుంది.',
        },
      },
      {
        reference: { en: 'Matthew 6:13a', te: 'మత్తయి 6:13అ' },
        text: {
          en: 'And lead us not into temptation, but deliver us from evil.',
          te: 'మమ్మును శోధనలోకి తేక దుష్టునినుండి మమ్మును తప్పించుము.',
        },
        thought: {
          en: 'We ask for protection before the battle, not only rescue after it.',
          te: 'యుద్ధం తర్వాత విడుదల మాత్రమే కాదు — యుద్ధానికి ముందే కాపుదల అడుగుతాం.',
        },
      },
      {
        reference: { en: 'Matthew 6:13b', te: 'మత్తయి 6:13ఆ' },
        text: {
          en: 'For thine is the kingdom, and the power, and the glory, for ever. Amen.',
          te: 'రాజ్యము, బలము, మహిమ నిరంతరము నీవే. ఆమేన్.',
        },
        thought: {
          en: 'Prayer ends where it began — with God, not with our list.',
          te: 'ప్రార్థన మొదలైన చోటే ముగుస్తుంది — మన జాబితాతో కాదు, దేవునితో.',
        },
      },
    ],
  },
  {
    id: 'promises-week',
    title: { en: 'Promises for the Week', te: 'వారానికి వాగ్దానాలు' },
    description: {
      en: 'Seven anchor promises — hope, provision, healing and victory for every day.',
      te: 'ఏడు ఆధార వాగ్దానాలు — ప్రతి రోజుకీ నిరీక్షణ, పోషణ, స్వస్థత, జయం.',
    },
    days: [
      {
        reference: { en: 'Numbers 6:24–25', te: 'సంఖ్యాకాండము 6:24–25' },
        text: {
          en: 'The LORD bless thee, and keep thee: the LORD make his face shine upon thee, and be gracious unto thee.',
          te: 'యెహోవా నిన్ను ఆశీర్వదించి నిన్ను కాపాడును గాక; యెహోవా నీకు తన సన్నిధానదీప్తిని అనుగ్రహించి నిన్ను కరుణించును గాక.',
        },
        thought: {
          en: 'You walk this week under a spoken blessing, not under a question mark.',
          te: 'ఈ వారం మీరు ప్రశ్నార్థకం కింద కాదు — పలికిన ఆశీర్వాదం కింద నడుస్తున్నారు.',
        },
      },
      {
        reference: { en: 'Psalm 121:7–8', te: 'కీర్తనలు 121:7–8' },
        text: {
          en: 'The LORD shall preserve thee from all evil: he shall preserve thy soul. The LORD shall preserve thy going out and thy coming in.',
          te: 'యెహోవా ఏ అపాయమును రాకుండ నిన్ను కాపాడును; ఆయన నీ ప్రాణమును కాపాడును. ఇది మొదలుకొని నిరంతరము నీ రాకపోకలయందు యెహోవా నిన్ను కాపాడును.',
        },
        thought: {
          en: 'Every departure and every return today is watched over.',
          te: 'నేటి ప్రతి బయలుదేరడం, ప్రతి తిరిగి రావడం కాపలాలో ఉంది.',
        },
      },
      {
        reference: { en: 'Isaiah 26:3', te: 'యెషయా 26:3' },
        text: {
          en: 'Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.',
          te: 'ఎవనిమనస్సు నీమీద ఆనుకొనునో వానిని నీవు పూర్ణశాంతిగలవానిగా కాపాడుదువు; ఏలయనగా అతడు నీయందు విశ్వాసముంచియున్నాడు.',
        },
        thought: {
          en: 'Peace follows attention: where the mind rests, the heart settles.',
          te: 'మనసు ఎక్కడ ఆనుకుంటుందో, హృదయం అక్కడే నెమ్మదిస్తుంది.',
        },
      },
      {
        reference: { en: 'Philippians 4:6–7', te: 'ఫిలిప్పీయులకు 4:6–7' },
        text: {
          en: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.',
          te: 'దేనినిగూర్చియు చింతపడకుడి గాని ప్రతి విషయములోను ప్రార్థన విజ్ఞాపనములచేత కృతజ్ఞతాపూర్వకముగా మీ విన్నపములు దేవునికి తెలియజేయుడి.',
        },
        thought: {
          en: 'Anxiety is an invitation to pray about that exact thing, by name.',
          te: 'ఆందోళన అంటే — సరిగ్గా ఆ విషయాన్నే పేరుపెట్టి ప్రార్థించమన్న ఆహ్వానం.',
        },
      },
      {
        reference: { en: 'Psalm 91:1', te: 'కీర్తనలు 91:1' },
        text: {
          en: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.',
          te: 'మహోన్నతుని చాటున నివసించువాడే సర్వశక్తుని నీడను విశ్రమించువాడు.',
        },
        thought: {
          en: 'The shadow moves with the One who casts it — stay close and you stay covered.',
          te: 'నీడ దాన్ని వేసేవానితోనే కదులుతుంది — దగ్గరగా ఉంటే కప్పబడే ఉంటారు.',
        },
      },
      {
        reference: { en: 'Isaiah 43:2', te: 'యెషయా 43:2' },
        text: {
          en: 'When thou passest through the waters, I will be with thee; and through the rivers, they shall not overflow thee.',
          te: 'నీవు జలములలో బడి దాటునప్పుడు నేను నీకు తోడై యుందును; నదులలో బడి వెళ్ళునప్పుడు అవి నీమీద పొర్లిపారవు.',
        },
        thought: {
          en: 'The promise is not "no waters" — it is "never alone in them."',
          te: 'వాగ్దానం "జలాలు రావు" అని కాదు — "వాటిలో ఎప్పుడూ ఒంటరిగా ఉండవు" అని.',
        },
      },
      {
        reference: { en: 'John 14:27', te: 'యోహాను 14:27' },
        text: {
          en: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.',
          te: 'శాంతి మీకనుగ్రహించి వెళ్లుచున్నాను; నా శాంతినే మీకనుగ్రహించుచున్నాను; లోకమిచ్చునట్టుగా నేను మీకనుగ్రహించుట లేదు; మీ హృదయమును కలవరపడనియ్యకుడి, వెరవనియ్యకుడి.',
        },
        thought: {
          en: "End the week holding the peace the world didn't give and cannot take.",
          te: 'లోకం ఇవ్వనిది, తీసుకోలేనిది అయిన శాంతితో వారాన్ని ముగించండి.',
        },
      },
    ],
  },
];
