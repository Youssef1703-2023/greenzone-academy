import { env } from '../../config/env.js';
import { GoogleTranslateProvider } from './googleTranslate.provider.js';
import { LibreTranslateProvider } from './libreTranslate.provider.js';
import type { TranslationProvider } from './translation.types.js';

export function createTranslationProvider(): TranslationProvider {
  if (env.TRANSLATION_PROVIDER === 'google') {
    return new GoogleTranslateProvider();
  }

  return new LibreTranslateProvider();
}
