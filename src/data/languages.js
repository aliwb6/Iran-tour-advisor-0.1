export const popularLanguages = [
  'Persian',
  'English',
  'Arabic',
  'French',
  'German',
  'Spanish',
  'Italian',
  'Chinese (Mandarin)',
  'Russian',
  'Turkish',
];

const languageLabels = {
  Persian: { fa: 'فارسی', ar: 'الفارسية' },
  English: { fa: 'انگلیسی', ar: 'الإنجليزية' },
  Arabic: { fa: 'عربی', ar: 'العربية' },
  French: { fa: 'فرانسوی', ar: 'الفرنسية' },
  German: { fa: 'آلمانی', ar: 'الألمانية' },
  Spanish: { fa: 'اسپانیایی', ar: 'الإسبانية' },
  Italian: { fa: 'ایتالیایی', ar: 'الإيطالية' },
  'Chinese (Mandarin)': { fa: 'چینی (ماندارین)', ar: 'الصينية (الماندرين)' },
  Russian: { fa: 'روسی', ar: 'الروسية' },
  Turkish: { fa: 'ترکی', ar: 'التركية' },
};

export const allLanguages = [
  'Portuguese',
  'Russian',
  'Japanese',
  'Korean',
  'Chinese (Mandarin)',
  'Chinese (Cantonese)',
  'Hindi',
  'Urdu',
  'Turkish',
  'Dutch',
  'Swedish',
  'Norwegian',
  'Danish',
  'Finnish',
  'Polish',
  'Czech',
  'Romanian',
  'Hungarian',
  'Greek',
  'Hebrew',
  'Swahili',
  'Indonesian',
  'Malay',
  'Thai',
  'Vietnamese',
  'Bengali',
  'Punjabi',
  'Pashto',
  'Kurdish',
  'Azerbaijani',
  'Armenian',
  'Georgian',
  'Ukrainian',
  'Catalan',
  'Croatian',
  'Serbian',
  'Slovak',
  'Bulgarian',
  'Slovenian',
  'Estonian',
  'Latvian',
  'Lithuanian',
  'Albanian',
  'Macedonian',
  'Maltese',
  'Icelandic',
  'Welsh',
  'Irish',
  'Basque',
];

export function parseLanguages(value) {
  const raw = Array.isArray(value)
    ? value
    : String(value || '').split(/[,،;؛·]/);

  const seen = new Set();
  return raw
    .map((language) => String(language || '').trim())
    .filter((language) => {
      if (!language) return false;
      const key = language.toLocaleLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function mergeLanguages(...lists) {
  return parseLanguages(lists.flatMap((list) => parseLanguages(list)));
}

export function toLanguageOptions(languages) {
  return parseLanguages(languages).map((language) => ({
    key: language,
    en: language,
    fa: languageLabels[language]?.fa || language,
    ar: languageLabels[language]?.ar || language,
  }));
}
