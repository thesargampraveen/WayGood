// The 4 languages offered by the app (same data as backend/src/data/languages.js,
// kept here so the home screen renders instantly even before the API responds)
const LANGUAGES = [
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    description: 'The most widely spoken language of India',
    icon: 'candle', // MaterialCommunityIcons
    color: '#F59E0B',
    lightColor: '#FEF3C7',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    script: 'Devanagari',
    description: 'The sweet language of Maharashtra',
    icon: 'castle', // MaterialCommunityIcons
    color: '#10B981',
    lightColor: '#D1FAE5',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    script: 'Latin',
    description: 'The global language of opportunity',
    icon: 'book-open-variant', // MaterialCommunityIcons
    color: '#3B82F6',
    lightColor: '#DBEAFE',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    script: 'Telugu',
    description: 'The Italian of the East',
    icon: 'flower-tulip', // MaterialCommunityIcons
    color: '#8B5CF6',
    lightColor: '#EDE9FE',
  },
];

export default LANGUAGES;
