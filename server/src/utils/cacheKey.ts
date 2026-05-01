export function lessonTranslationCacheKey(lessonId: string, targetLang: string, contentHash: string) {
  return `lesson:${lessonId}:translation:${targetLang}:${contentHash}`;
}
