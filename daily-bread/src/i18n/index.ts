import type { Lang } from '@/theme';

/**
 * Typed UI strings, Telugu + English. Scripture/content text lives in
 * src/content — this dictionary is chrome/micro-copy only.
 */
const strings = {
  appName: { en: 'Daily Bread', te: 'దినసరి ఆహారం' },
  tabToday: { en: 'Today', te: 'నేడు' },
  tabCalendar: { en: 'Calendar', te: 'క్యాలెండర్' },
  tabShare: { en: 'Share', te: 'పంచుకోండి' },
  tabMore: { en: 'More', te: 'మరిన్ని' },

  verseOfTheDay: { en: 'Verse of the Day', te: 'నేటి వచనం' },
  dailyPromise: { en: "Today's Promise", te: 'నేటి వాగ్దానం' },
  reflection: { en: 'Reflection', te: 'ధ్యానం' },
  listen: { en: 'Listen', te: 'వినండి' },
  stop: { en: 'Stop', te: 'ఆపండి' },
  prayNow: { en: 'Close in prayer', te: 'ప్రార్థనతో ముగించండి' },
  amen: { en: 'Amen', te: 'ఆమేన్' },
  guidedPrayerTitle: { en: 'A short prayer', te: 'చిన్న ప్రార్థన' },
  journalPlaceholder: {
    en: 'Write a private prayer… (only you can see this)',
    te: 'మీ ప్రార్థనను రాయండి… (ఇది మీకు మాత్రమే కనిపిస్తుంది)',
  },
  readingPlans: { en: 'Reading Plans', te: 'పఠన ప్రణాళికలు' },
  day: { en: 'Day', te: 'రోజు' },
  dayStreak: { en: 'day streak', te: 'రోజుల కొనసాగింపు' },
  graceDay: { en: 'grace day kept your streak', te: 'కృప దినం మీ కొనసాగింపును కాపాడింది' },
  largeText: { en: 'Read large', te: 'పెద్ద అక్షరాలు' },

  upcomingFeasts: { en: 'Upcoming feasts', te: 'రాబోయే పండుగలు' },
  today: { en: 'Today', te: 'ఈ రోజు' },
  daysAway: { en: 'days away', te: 'రోజుల్లో' },
  tomorrow: { en: 'Tomorrow', te: 'రేపు' },

  shareTitle: { en: 'Share the Word', te: 'వాక్యాన్ని పంచుకోండి' },
  templateVerse: { en: 'Verse', te: 'వచనం' },
  templatePromise: { en: 'Promise', te: 'వాగ్దానం' },
  templateMorning: { en: 'Morning', te: 'శుభోదయం' },
  templateFestival: { en: 'Festival', te: 'పండుగ' },
  withPrayers: { en: 'With prayers', te: 'ప్రార్థనలతో' },
  yourName: { en: 'Your name (optional)', te: 'మీ పేరు (ఐచ్ఛికం)' },
  goodMorning: { en: 'Good Morning', te: 'శుభోదయం' },
  shareButton: { en: 'Share image', te: 'చిత్రాన్ని పంచుకోండి' },
  shareFailed: {
    en: 'Could not share right now. Please try again.',
    te: 'ఇప్పుడు పంచుకోలేకపోయాం. మళ్లీ ప్రయత్నించండి.',
  },
  status916: { en: 'Status 9:16', te: 'స్టేటస్ 9:16' },
  post11: { en: 'Post 1:1', te: 'పోస్ట్ 1:1' },
  scenePlain: { en: 'Plain', te: 'సాదా' },
  sceneSunrise: { en: 'Sunrise', te: 'సూర్యోదయం' },
  sceneLeaves: { en: 'Leaves', te: 'ఆకులు' },
  sceneSea: { en: 'Sea', te: 'సముద్రం' },
  sceneStars: { en: 'Stars', te: 'నక్షత్రాలు' },
  styleClassic: { en: 'Classic', te: 'క్లాసిక్' },
  styleQuote: { en: 'Quote', te: 'కోట్' },
  styleNature: { en: 'Nature', te: 'ప్రకృతి' },
  styleMinimal: { en: 'Minimal', te: 'మినిమల్' },
  styleRich: { en: 'Rich', te: 'రిచ్' },
  presetPeaceful: { en: 'Peaceful', te: 'ప్రశాంతం' },
  presetBold: { en: 'Bold', te: 'ధైర్యం' },
  presetElegant: { en: 'Elegant', te: 'సొంపు' },
  presetGraceful: { en: 'Graceful', te: 'కృప' },

  tabStore: { en: 'Store', te: 'స్టోర్' },
  tabBible: { en: 'Bible', te: 'బైబిల్' },
  chooseBible: { en: 'Choose your Bible', te: 'మీ బైబిల్ ఎంచుకోండి' },
  oldTestament: { en: 'Old Testament', te: 'పాత నిబంధన' },
  newTestament: { en: 'New Testament', te: 'క్రొత్త నిబంధన' },
  continueReading: { en: 'Continue reading', te: 'చదవడం కొనసాగించండి' },
  bookmarksLabel: { en: 'Bookmarks', te: 'బుక్‌మార్క్‌లు' },
  chaptersWord: { en: 'chapters', te: 'అధ్యాయాలు' },
  chapterWord: { en: 'Chapter', te: 'అధ్యాయం' },
  searchInBook: { en: 'Search in this book…', te: 'ఈ గ్రంథంలో వెతకండి…' },
  tapVerseHint: {
    en: 'Tap a verse to highlight · tap again for gold',
    te: 'హైలైట్‌కు వచనాన్ని తాకండి · బంగారు రంగుకు మళ్లీ తాకండి',
  },
  pageTurnHint: { en: 'Swipe to turn the page', te: 'పేజీ తిప్పడానికి స్వైప్ చేయండి' },
  menuHome: { en: 'Home', te: 'హోమ్' },
  prayerWall: { en: 'Prayer Wall', te: 'ప్రార్థన గోడ' },
  groups: { en: 'Family & Church Groups', te: 'కుటుంబ & సంఘ బృందాలు' },
  massTimes: { en: 'Mass & Service Times', te: 'ఆరాధన సమయాలు' },
  sectionCommunity: { en: 'Community', te: 'సహవాసం' },
  sectionLibrary: { en: 'Library', te: 'గ్రంథాలయం' },
  sectionApp: { en: 'App', te: 'యాప్' },

  previewBanner: {
    en: 'Offline preview — add backend keys to go live (see .env.example)',
    te: 'ఆఫ్‌లైన్ ప్రివ్యూ — ప్రత్యక్షంగా మారడానికి బ్యాకెండ్ కీలు జోడించండి',
  },
  displayNameTitle: { en: 'What should we call you?', te: 'మిమ్మల్ని ఏమని పిలవాలి?' },
  displayNameSub: {
    en: 'Shown with your prayer requests. First name is enough.',
    te: 'మీ ప్రార్థన విన్నపాలతో కనిపిస్తుంది. పేరు చాలు.',
  },
  displayNamePlaceholder: { en: 'Your name', te: 'మీ పేరు' },
  postRequest: { en: 'Share a prayer request', te: 'ప్రార్థన విన్నపం పంచుకోండి' },
  requestPlaceholder: {
    en: 'What can we pray with you for?',
    te: 'మీతో కలిసి మేము దేనికై ప్రార్థించాలి?',
  },
  post: { en: 'Post', te: 'పోస్ట్ చేయండి' },
  iPrayed: { en: 'I prayed', te: 'ప్రార్థించాను' },
  prayedLabel: { en: 'prayed', te: 'ప్రార్థించారు' },
  report: { en: 'Report', te: 'నివేదించండి' },
  wallEmpty: {
    en: 'No requests yet — be the first to share one.',
    te: 'ఇంకా విన్నపాలు లేవు — మొదటిగా మీరు పంచుకోండి.',
  },
  wallNote: {
    en: 'Family-safe space. Requests are moderated.',
    te: 'కుటుంబ-సురక్షిత స్థలం. విన్నపాలు పర్యవేక్షించబడతాయి.',
  },

  createGroup: { en: 'Create a group', te: 'బృందం సృష్టించండి' },
  joinGroup: { en: 'Join with a code', te: 'కోడ్‌తో చేరండి' },
  groupName: { en: 'Group name', te: 'బృందం పేరు' },
  inviteCode: { en: 'Invite code', te: 'ఆహ్వాన కోడ్' },
  shareInvite: { en: 'Share invite', te: 'ఆహ్వానం పంపండి' },
  members: { en: 'members', te: 'సభ్యులు' },
  leaveGroup: { en: 'Leave group', te: 'బృందం నుండి వైదొలగండి' },
  groupsEmpty: {
    en: 'Read and pray together — create a circle for your family or church.',
    te: 'కలిసి చదవండి, ప్రార్థించండి — మీ కుటుంబానికి లేదా సంఘానికి బృందం సృష్టించండి.',
  },
  join: { en: 'Join', te: 'చేరండి' },
  create: { en: 'Create', te: 'సృష్టించండి' },
  invalidCode: { en: 'Code not found — check and try again.', te: 'కోడ్ దొరకలేదు — సరిచూసి మళ్లీ ప్రయత్నించండి.' },
  inviteMessage: {
    en: 'Join our Daily Bread group "{name}" — open the app and enter code {code}',
    te: 'మా Daily Bread బృందం "{name}"లో చేరండి — యాప్ తెరిచి {code} కోడ్ నమోదు చేయండి',
  },
  groupWall: { en: 'Group prayer wall', te: 'బృంద ప్రార్థన గోడ' },

  searchCity: { en: 'Search city or church…', te: 'నగరం లేదా సంఘం వెతకండి…' },
  addTiming: { en: 'Add a timing', te: 'సమయం జోడించండి' },
  addParish: { en: 'Add your church', te: 'మీ సంఘాన్ని జోడించండి' },
  parishName: { en: 'Church / parish name', te: 'సంఘం / పారిష్ పేరు' },
  city: { en: 'City', te: 'నగరం' },
  submittedForReview: {
    en: 'Submitted for review — thank you! 🙏',
    te: 'సమీక్షకు పంపబడింది — ధన్యవాదాలు! 🙏',
  },
  serviceWordProtestant: { en: 'Service', te: 'ఆరాధన' },
  serviceWordCatholic: { en: 'Mass', te: 'దివ్యపూజ' },
  serviceWordOrthodox: { en: 'Qurbana', te: 'కుర్బానా' },
  timingLabelPlaceholder: { en: 'Label (e.g. Telugu Mass)', te: 'వివరం (ఉదా. తెలుగు పూజ)' },
  noTimesYet: {
    en: 'No timings yet — add one to help your parish.',
    te: 'ఇంకా సమయాలు లేవు — మీ సంఘానికి సహాయంగా ఒకటి జోడించండి.',
  },
  communityError: {
    en: 'Could not reach the community right now. Pull to retry.',
    te: 'ప్రస్తుతం సహవాసాన్ని చేరుకోలేకపోయాం. మళ్లీ ప్రయత్నించడానికి లాగండి.',
  },
  payUpi: { en: 'Pay with UPI', te: 'UPIతో చెల్లించండి' },
  upiUnavailable: {
    en: 'No UPI app found — order on WhatsApp instead.',
    te: 'UPI యాప్ కనబడలేదు — బదులుగా వాట్సాప్‌లో ఆర్డర్ చేయండి.',
  },
  storeTitle: { en: 'Faith Store', te: 'విశ్వాస దుకాణం' },
  storeSubtitle: {
    en: 'Curated devotional items — Bibles, frames, rosaries.',
    te: 'ఎంపిక చేసిన భక్తి వస్తువులు — బైబిళ్లు, ఫ్రేములు, జపమాలలు.',
  },
  orderWhatsApp: { en: 'Order on WhatsApp', te: 'వాట్సాప్‌లో ఆర్డర్ చేయండి' },
  orderMessage: {
    en: 'Hello! I would like to order from Daily Bread:',
    te: 'నమస్తే! Daily Bread నుండి నేను దీన్ని ఆర్డర్ చేయాలనుకుంటున్నాను:',
  },
  faithObjectNote: {
    en: 'Sold as a devotional item only.',
    te: 'భక్తి వస్తువుగా మాత్రమే విక్రయించబడుతుంది.',
  },
  complianceOilsTitle: { en: 'One hard legal line', te: 'ఒక ముఖ్యమైన చట్టపరమైన హద్దు' },
  complianceOilsBody: {
    en: 'This is a devotional fragrance for personal prayer use only. It makes no health, healing or protection claims of any kind (Drugs & Magic Remedies (Objectionable Advertisements) Act, 1954).',
    te: 'ఇది వ్యక్తిగత ప్రార్థన కోసం భక్తి పరిమళం మాత్రమే. ఆరోగ్యం, స్వస్థత లేదా రక్షణ గురించి ఎటువంటి వాగ్దానాలు చేయదు (Drugs & Magic Remedies (Objectionable Advertisements) Act, 1954).',
  },
  storeAll: { en: 'All', te: 'అన్నీ' },
  categoryBibles: { en: 'Bibles', te: 'బైబిళ్లు' },
  categoryFrames: { en: 'Frames', te: 'ఫ్రేములు' },
  categoryRosaries: { en: 'Rosaries', te: 'జపమాలలు' },
  categoryCandles: { en: 'Candles', te: 'కొవ్వొత్తులు' },
  categoryDevotional: { en: 'Devotional', te: 'భక్తి వస్తువులు' },

  memorize: { en: 'Memorize', te: 'కంఠస్థం' },
  memorizeEmpty: {
    en: "Save favorites and they'll appear here to practice.",
    te: 'ఇష్టమైనవి భద్రపరిస్తే అవి సాధనకు ఇక్కడ కనిపిస్తాయి.',
  },
  chooseVerse: { en: 'Choose a verse', te: 'వచనాన్ని ఎంచుకోండి' },
  levelWord: { en: 'Level', te: 'స్థాయి' },
  wellDone: { en: 'Well done! 🌿', te: 'భళా! 🌿' },
  exportLabel: { en: 'Export', te: 'ఎగుమతి' },

  favorites: { en: 'Favorites', te: 'ఇష్టమైనవి' },
  favoritesEmpty: {
    en: 'Tap the heart on any verse to keep it here.',
    te: 'ఏదైనా వచనంపై హృదయాన్ని తాకి ఇక్కడ భద్రపరచుకోండి.',
  },
  longPressToSave: {
    en: 'Long-press a verse to save it to Favorites',
    te: 'ఇష్టమైనవాటిలో భద్రపరచడానికి వచనాన్ని నొక్కి పట్టుకోండి',
  },

  lyrics: { en: 'Worship Lyrics', te: 'ఆరాధన గీతాలు' },
  searchLyrics: { en: 'Search hymns…', te: 'గీతాలు వెతకండి…' },
  refrain: { en: 'Refrain', te: 'పల్లవి' },
  scriptureSong: { en: 'Scripture', te: 'వాక్య గీతం' },
  originalSong: { en: 'Original', te: 'స్వీయ గీతం' },

  journal: { en: 'Prayer Journal', te: 'ప్రార్థన డైరీ' },
  journalEmpty: {
    en: 'Your private prayers will appear here.',
    te: 'మీ వ్యక్తిగత ప్రార్థనలు ఇక్కడ కనిపిస్తాయి.',
  },
  settings: { en: 'Settings', te: 'సెట్టింగ్‌లు' },
  language: { en: 'Language', te: 'భాష' },
  reminder: { en: 'Morning reminder', te: 'ఉదయపు గుర్తింపు' },
  reminderOff: { en: 'Off', te: 'ఆఫ్' },
  textSize: { en: 'Text size', te: 'అక్షర పరిమాణం' },
  textSizeNormal: { en: 'Normal', te: 'సాధారణం' },
  textSizeLarge: { en: 'Large', te: 'పెద్దది' },
  textSizeXl: { en: 'Extra large', te: 'మరింత పెద్దది' },
  tradition: { en: 'Tradition', te: 'సంప్రదాయం' },
  traditionProtestant: { en: 'Protestant / Pentecostal', te: 'ప్రొటెస్టెంట్ / పెంతెకొస్తు' },
  traditionCatholic: { en: 'Catholic', te: 'కతోలిక' },
  traditionOrthodox: { en: 'Syro-Malabar / Orthodox', te: 'సీరో-మలబార్ / ఆర్థడాక్స్' },
  traditionProtestantShort: { en: 'Protestant', te: 'ప్రొటెస్టెంట్' },
  traditionCatholicShort: { en: 'Catholic', te: 'కతోలిక' },
  traditionOrthodoxShort: { en: 'Orthodox', te: 'ఆర్థడాక్స్' },
  feastReminders: { en: 'Feast reminders', te: 'పండుగ గుర్తింపులు' },
  comingSoon: { en: 'Coming soon', te: 'త్వరలో' },
  about: { en: 'About', te: 'గురించి' },
  ttsUnavailable: {
    en: 'Telugu voice not installed on this device. Install the Google Text-to-Speech Telugu pack to listen.',
    te: 'ఈ పరికరంలో తెలుగు వాయిస్ లేదు. వినడానికి Google Text-to-Speech తెలుగు ప్యాక్ ఇన్‌స్టాల్ చేయండి.',
  },

  onboardingLanguageTitle: { en: 'Choose your language', te: 'మీ భాషను ఎంచుకోండి' },
  onboardingTraditionTitle: { en: 'Your tradition', te: 'మీ సంప్రదాయం' },
  onboardingTraditionSub: {
    en: 'Your calendar and feasts follow your tradition.',
    te: 'మీ క్యాలెండర్, పండుగలు మీ సంప్రదాయాన్ని అనుసరిస్తాయి.',
  },
  onboardingReminderTitle: { en: 'A gentle morning nudge', te: 'మృదువైన ఉదయపు గుర్తింపు' },
  onboardingReminderSub: {
    en: 'One quiet reminder each morning — never more.',
    te: 'ప్రతి ఉదయం ఒకే ఒక్క ప్రశాంత గుర్తింపు — అంతకన్నా ఎక్కువ కాదు.',
  },
  enableReminder: { en: 'Enable reminder', te: 'గుర్తింపును ప్రారంభించండి' },
  continueLabel: { en: 'Continue', te: 'కొనసాగించండి' },
  skip: { en: 'Skip', te: 'దాటవేయండి' },
  save: { en: 'Save', te: 'భద్రపరచండి' },
  delete: { en: 'Delete', te: 'తొలగించండి' },
  cancel: { en: 'Cancel', te: 'రద్దు' },
  done: { en: 'Done', te: 'పూర్తయింది' },

  notificationTitle: { en: 'Daily Bread', te: 'దినసరి ఆహారం' },
  notificationBody: {
    en: 'Your verse for today is ready 🌅',
    te: 'నేటి వచనం సిద్ధంగా ఉంది 🌅',
  },

  curtainSwipeHint: {
    en: 'Pull the curtain away — any direction',
    te: 'తెరను ఏ వైపుకైనా లాగివేయండి',
  },
  curtainSetting: { en: 'Daily promise curtain', te: 'నేటి వాగ్దాన తెర' },
  readAloudSection: { en: 'Read-aloud voice', te: 'చదివే స్వరం' },
  voiceAuto: { en: 'Auto', te: 'ఆటో' },
  voiceFemale: { en: 'Female', te: 'స్త్రీ' },
  voiceMale: { en: 'Male', te: 'పురుష' },
  teluguVoice: { en: 'Telugu voice', te: 'తెలుగు స్వరం' },
  englishVoice: { en: 'English voice', te: 'ఇంగ్లీష్ స్వరం' },
  deviceDefault: { en: 'Device default', te: 'పరికర డిఫాల్ట్' },
  noVoices: {
    en: 'No voices for this language on this device.',
    te: 'ఈ భాషకు ఈ పరికరంలో స్వరాలు లేవు.',
  },
  readChapter: { en: 'Read this chapter aloud', te: 'ఈ అధ్యాయాన్ని చదివి వినిపించు' },
  hdVoice: { en: 'HD voice (internet)', te: 'HD స్వరం (ఇంటర్నెట్)' },
  hdVoiceNote: {
    en: 'Natural neural voices via your backend. Falls back to the device voice offline.',
    te: 'బ్యాకెండ్ ద్వారా సహజమైన స్వరాలు. ఆఫ్‌లైన్‌లో పరికర స్వరానికి మారుతుంది.',
  },
  hdProviderAzure: { en: 'Azure', te: 'Azure' },
  hdProviderSarvam: { en: 'Sarvam', te: 'Sarvam' },
  hdProviderEleven: { en: 'ElevenLabs', te: 'ElevenLabs' },
  morningRitual: { en: '3-minute ritual', te: '3 నిమిషాల ఆరాధన' },
  pause: { en: 'Pause', te: 'విరామం' },
  resume: { en: 'Resume', te: 'కొనసాగించు' },
  next: { en: 'Next', te: 'తరువాత' },
  beginDay: { en: 'Begin today', te: 'రోజును ప్రారంభించండి' },

  milestoneTitle: { en: 'A faithful milestone', te: 'విశ్వాస మైలురాయి' },
  milestone7: { en: '7 days in the Word', te: 'వాక్యంలో 7 రోజులు' },
  milestone30: { en: '30 days in the Word', te: 'వాక్యంలో 30 రోజులు' },
  milestone100: { en: '100 days in the Word', te: 'వాక్యంలో 100 రోజులు' },
  milestoneBody: {
    en: 'Well done, good and faithful servant.',
    te: 'భళా, నమ్మకమైన మంచి సేవకుడా.',
  },

  errorTitle: { en: 'Something went wrong', te: 'ఏదో పొరపాటు జరిగింది' },
  errorBody: {
    en: 'Be still — restart the app and it will be made right.',
    te: 'శాంతించండి — యాప్‌ను మళ్లీ ప్రారంభించండి, సరి అవుతుంది.',
  },
  restart: { en: 'Restart', te: 'మళ్లీ ప్రారంభించండి' },

  endOfBook: {
    en: "You've reached the end of this book ✦",
    te: 'మీరు ఈ గ్రంథం చివరికి చేరుకున్నారు ✦',
  },
  beginningOfBook: {
    en: 'Beginning of the book',
    te: 'గ్రంథం ప్రారంభం',
  },
} as const;

export type StringKey = keyof typeof strings;

export function t(key: StringKey, lang: Lang): string {
  return strings[key][lang];
}

/** Localized weekday/month names for headers and the calendar grid. */
export const weekdays: Record<Lang, string[]> = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  te: ['ఆదివారం', 'సోమవారం', 'మంగళవారం', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం'],
};

export const weekdaysShort: Record<Lang, string[]> = {
  en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  te: ['ఆ', 'సో', 'మం', 'బు', 'గు', 'శు', 'శ'],
};

export const months: Record<Lang, string[]> = {
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  te: [
    'జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్',
    'జులై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్',
  ],
};
