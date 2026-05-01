import { env, hasGoogleTranslateCredentials } from '../../config/env.js';
import type { TranslationProvider } from './translation.types.js';

export class MissingTranslationCredentialsError extends Error {
  constructor() {
    super('Google Translate credentials are not configured.');
  }
}

export class GoogleTranslateProvider implements TranslationProvider {
  readonly name = 'google';
  readonly model = 'cloud-translate-v2';

  async translateText(text: string, targetLang: string, sourceLang = 'en'): Promise<string> {
    const [translated] = await this.translateTexts([text], targetLang, sourceLang);
    return translated ?? text;
  }

  async translateTexts(texts: string[], targetLang: string, sourceLang = 'en'): Promise<string[]> {
    if (!hasGoogleTranslateCredentials) {
      throw new MissingTranslationCredentialsError();
    }

    if (texts.length === 0) return [];

    const url = new URL('https://translation.googleapis.com/language/translate/v2');
    url.searchParams.set('key', env.GOOGLE_TRANSLATE_API_KEY ?? '');

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: texts,
        target: targetLang,
        source: sourceLang,
        format: 'text',
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Translate failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      data?: { translations?: Array<{ translatedText?: string }> };
    };

    const translations = payload.data?.translations ?? [];
    return texts.map((text, index) => decodeHtmlEntities(translations[index]?.translatedText ?? text));
  }
}

function decodeHtmlEntities(value: string) {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}
