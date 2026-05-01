import { translations } from '../i18n/translations';

export function translate(path, language = 'en', params = {}) {
  const keys = path.split('.');
  const lookup = (dict) => keys.reduce((value, key) => value?.[key], dict);
  const value = lookup(translations[language]) ?? lookup(translations.en) ?? path;
  if (typeof value !== 'string') return value;
  return Object.entries(params).reduce(
    (text, [key, replacement]) => text.replaceAll(`{${key}}`, String(replacement)),
    value,
  );
}
