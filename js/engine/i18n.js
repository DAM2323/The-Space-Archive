// Tiny translation layer. All player-facing text is read through t('key').

const dictionaries = {};   // language code -> { key: text }
let current = 'en';

export function addLanguage(code, strings) {
  dictionaries[code] = strings;
}

export function setLanguage(code) {
  if (dictionaries[code]) current = code;
}

export const languages = () => Object.keys(dictionaries);

export function getLanguage() {
  return current;
}

// t('key', {n: 3}) replaces {n} in the text. Falls back to English, then to
// the key itself so a missing string is easy to spot during development.
export function t(key, vars) {
  let text = dictionaries[current]?.[key] ?? dictionaries.en?.[key] ?? key;
  if (vars) {
    for (const name in vars) text = text.replaceAll(`{${name}}`, vars[name]);
  }
  return text;
}
