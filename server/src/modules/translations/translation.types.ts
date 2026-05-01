export interface TranslationProvider {
  readonly name: string;
  readonly model: string;
  translateText(text: string, targetLang: string, sourceLang?: string): Promise<string>;
  translateTexts?(texts: string[], targetLang: string, sourceLang?: string): Promise<string[]>;
}

export type LessonTranslationStatus = 'completed' | 'failed' | 'stale' | 'pending';
