import { env } from '../../config/env.js';
import type { TranslationProvider } from './translation.types.js';

export class LibreTranslateProvider implements TranslationProvider {
  readonly name = 'libretranslate';
  readonly model = 'argos-translate-structured-v4';

  async translateText(text: string, targetLang: string, sourceLang = 'en'): Promise<string> {
    const [translated] = await this.translateTexts([text], targetLang, sourceLang);
    return translated ?? text;
  }

  async translateTexts(texts: string[], targetLang: string, sourceLang = 'en'): Promise<string[]> {
    if (texts.length === 0) return [];

    const translated = await this.requestTranslation(texts, targetLang, sourceLang);

    if (Array.isArray(translated) && translated.length === texts.length) {
      return texts.map((text, index) => this.normalizeTranslatedText(translated[index] ?? text));
    }

    if (texts.length === 1 && typeof translated === 'string') {
      return [this.normalizeTranslatedText(translated)];
    }

    return Promise.all(texts.map(async (text) => {
      const single = await this.requestTranslation(text, targetLang, sourceLang);
      return typeof single === 'string' ? this.normalizeTranslatedText(single) : text;
    }));
  }

  private async requestTranslation(
    q: string | string[],
    targetLang: string,
    sourceLang: string,
  ): Promise<string | string[] | undefined> {
    const endpoint = new URL('/translate', env.LIBRETRANSLATE_URL);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q,
        source: sourceLang,
        target: targetLang,
        format: 'text',
        ...(env.LIBRETRANSLATE_API_KEY ? { api_key: env.LIBRETRANSLATE_API_KEY } : {}),
      }),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => '');
      throw new Error(`LibreTranslate failed with status ${response.status}${details ? `: ${details}` : ''}`);
    }

    const payload = (await response.json()) as {
      translatedText?: string | string[];
      error?: string;
    };

    if (payload.error) {
      throw new Error(payload.error);
    }

    return payload.translatedText;
  }

  private normalizeTranslatedText(text: string): string {
    return text
      .replace(/؟\?/g, '؟')
      .replace(/\?؟/g, '؟')
      .replace(/\s+([،؛؟.!])/g, '$1')
      .trim();
  }
}
