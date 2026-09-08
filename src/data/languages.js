// The 3 languages offered by the app (same data as backend/src/data/languages.js,
// kept here so the home screen renders instantly even before the API responds)
const LANGUAGES = [
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    description: 'The most widely spoken language of India',
    emoji: '🪔',
    color: '#F59E0B',
    lightColor: '#FEF3C7',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    script: 'Devanagari',
    description: 'The sweet language of Maharashtra',
    emoji: '🛕',
    color: '#10B981',
    lightColor: '#D1FAE5',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    script: 'Latin',
    description: 'The global language of opportunity',
    emoji: '📘',
    color: '#3B82F6',
    lightColor: '#DBEAFE',
  },
];

export default LANGUAGES;
