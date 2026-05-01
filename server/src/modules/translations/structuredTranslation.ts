import type { TranslationProvider } from './translation.types.js';

const PRESERVED_KEYS = new Set([
  'id',
  'slug',
  'route',
  'href',
  'to',
  'url',
  'path',
  'key',
  'type',
  'status',
  'order',
  'lessonNumber',
  'phaseNumber',
  'languageSource',
  '_isTranslated',
]);

type TextSlot = {
  path: Array<string | number>;
  value: string;
};

const MAX_GOOGLE_TEXTS_PER_BATCH = 80;
const MAX_GOOGLE_CHARS_PER_BATCH = 24000;

const ARABIC_FALLBACKS = new Map<string, string>([
  ['What Is Cybersecurity?', 'الدرس 1: ما هو الأمن السيبراني؟'],
  ['Prepared by: JoeTech', 'إعداد: JoeTech'],
  ['Cybersecurity', 'الأمن السيبراني'],
  ['Information Security', 'أمن المعلومات'],
  ['Asset', 'أصل'],
  ['Assets', 'الأصول'],
  ['Threat', 'تهديد'],
  ['Vulnerability', 'ثغرة'],
  ['Risk', 'خطر'],
  ['Security Control', 'ضابط أمني'],
  ['Confidentiality', 'السرية'],
  ['Integrity', 'النزاهة'],
  ['Availability', 'التوافر'],
  ['CIA Triad', 'ثلاثية السرية والنزاهة والتوافر'],
  ['Defense-in-depth', 'الدفاع متعدد الطبقات'],
  ['Incident Response', 'الاستجابة للحوادث'],
  ['Recovery', 'التعافي'],
  ['Attacker', 'مهاجم'],
  ['Hacker', 'هاكر'],
  ['Ethical Hacking', 'الاختراق الأخلاقي'],
  ['Unauthorized Access', 'وصول غير مصرح به'],
  ['Data Exposure', 'كشف البيانات'],
  ['Account Takeover', 'الاستيلاء على الحساب'],
  ['Phishing Email', 'بريد تصيّد إلكتروني'],
  ['Multi-factor Authentication', 'المصادقة متعددة العوامل'],
  ['A Working Definition', 'تعريف عملي'],
  ['What Exactly Is Being Protected?', 'ما الذي نحميه؟'],
  ['Threats, Vulnerabilities, Controls, and Risk', 'التهديدات والثغرات والضوابط والمخاطر'],
  ['Beginner Example', 'مثال للمبتدئين'],
  ['Asset-to-Risk Flow', 'تدفق الأصل إلى المخاطر'],
  ['Valuable Assets', 'الأصول القيّمة'],
  ['Valuable Assets', 'الأصول ذات القيمة'],
  ['Threats', 'التهديدات'],
  ['Vulnerabilities', 'الثغرات'],
  ['Security Controls', 'الضوابط الأمنية'],
  ['Security Outcomes', 'النتائج الأمنية'],
  ['Cybersecurity and Information Security', 'الأمن السيبراني وأمن المعلومات'],
  ['The CIA Triad', 'ثلاثية السرية والنزاهة والتوافر'],
  ['Examples of CIA Failures', 'أمثلة على فشل السرية والنزاهة والتوافر'],
  ['Information Security Goals', 'أهداف أمن المعلومات'],
  ['Cybersecurity Is More Than Tools', 'الأمن السيبراني أكثر من مجرد أدوات'],
  ['Cybersecurity Program Model', 'نموذج برنامج الأمن السيبراني'],
  ['People', 'الأشخاص'],
  ['Processes', 'العمليات'],
  ['Technology', 'التكنولوجيا'],
  ['Identify', 'تحديد'],
  ['Protect', 'حماية'],
  ['Detect', 'اكتشاف'],
  ['Respond', 'استجابة'],
  ['Recover', 'تعافٍ'],
  ['The Defensive and Ethical Mindset', 'العقلية الدفاعية والأخلاقية'],
  ['Core Concept', 'مفهوم أساسي'],
  ['Medical Clinic Cyber Incident', 'حادثة سيبرانية في عيادة طبية'],
  ['Explain cybersecurity in plain English and in technical terms', 'اشرح الأمن السيبراني بلغة بسيطة وبمصطلحات تقنية'],
  ['Identify common digital assets that need protection', 'حدد الأصول الرقمية الشائعة التي تحتاج إلى حماية'],
  ['Distinguish among a threat, a vulnerability, a security control, and a risk', 'ميّز بين التهديد والثغرة والضابط الأمني والمخاطر'],
  ['Describe the CIA triad and explain why it matters', 'صف ثلاثية السرية والنزاهة والتوافر واشرح سبب أهميتها'],
  ['Explain why cybersecurity depends on people, processes, and technology', 'اشرح لماذا يعتمد الأمن السيبراني على الأشخاص والعمليات والتكنولوجيا'],
  ['Describe the defensive and ethical mindset expected in cybersecurity learning and work', 'صف العقلية الدفاعية والأخلاقية المتوقعة في تعلّم الأمن السيبراني والعمل فيه'],
  [
    'Phones, cloud storage, banking apps, school portals, hospital systems, delivery platforms, industrial devices, and business networks all store or process information that someone values.',
    'فالهواتف، والتخزين السحابي، والتطبيقات المصرفية، وبوابات المدارس، وأنظمة المستشفيات، ومنصات التوصيل، والأجهزة الصناعية، وشبكات الأعمال كلها تخزن أو تعالج معلومات ذات قيمة لشخص ما.',
  ],
  [
    'Phones, cloud storage, banking apps, school gates, hospital systems, delivery platforms, industrial devices, and business networks all store or process information that someone values.',
    'فالهواتف، والتخزين السحابي، والتطبيقات المصرفية، وبوابات المدارس، وأنظمة المستشفيات، ومنصات التوصيل، والأجهزة الصناعية، وشبكات الأعمال كلها تخزن أو تعالج معلومات ذات قيمة لشخص ما.',
  ],
  ['The potential harm associated with a threat, usually shaped by likelihood and impact.', 'الضرر المحتمل المرتبط بتهديد ما، ويتشكل عادة حسب الاحتمالية والتأثير.'],
  ['Asset: employee email account', 'الأصل: حساب البريد الإلكتروني للموظف'],
  ['Threat: phishing email', 'التهديد: بريد تصيّد احتيالي'],
  ['Vulnerability: no security awareness training and no multi-factor authentication', 'الثغرة: عدم وجود تدريب على الوعي الأمني وعدم وجود مصادقة متعددة العوامل'],
  ['Control: phishing awareness training, MFA, and email filtering', 'الضابط: تدريب على الوعي بالتصيّد، ومصادقة متعددة العوامل، وتصفية البريد الإلكتروني'],
  ['Risk: account takeover, data exposure, or business email fraud', 'المخاطر: الاستيلاء على الحساب أو كشف البيانات أو احتيال البريد الإلكتروني التجاري'],
  ['A threat may exist, but if the relevant vulnerability is removed or well controlled, the risk drops.', 'قد يوجد تهديد، لكن إذا أُزيلت الثغرة المرتبطة به أو تمت السيطرة عليها جيدًا، فإن مستوى المخاطر ينخفض.'],
  ['Most incidents affect more than one goal at once.', 'تؤثر معظم الحوادث على أكثر من هدف في الوقت نفسه.'],
  ['For example, ransomware commonly harms availability because files or systems become unusable, but it may also raise confidentiality and integrity concerns.', 'على سبيل المثال، تضر برمجيات الفدية عادة بالتوافر لأن الملفات أو الأنظمة تصبح غير قابلة للاستخدام، وقد تثير أيضًا مخاوف تتعلق بالسرية والنزاهة.'],
  [
    'The most important introductory model in cybersecurity is the CIA triad: confidentiality, integrity, and availability.',
    'في الأمن السيبراني، يشير اختصار CIA إلى السرية والنزاهة والتوافر، وليس إلى وكالة المخابرات المركزية. وتُعد هذه الثلاثية من أهم النماذج الأساسية لفهم أهداف الحماية.',
  ],
  [
    'Confidentiality means only authorized people or systems should see the data. Integrity means data should remain accurate, authentic, and protected from unauthorized change. Availability means authorized users should be able to access data and services when needed.',
    'السرية: منع الوصول غير المصرح به للمعلومات. النزاهة: الحفاظ على دقة البيانات ومنع تعديلها بدون تصريح. التوافر: ضمان بقاء الأنظمة والخدمات متاحة للمستخدمين المصرح لهم عند الحاجة.',
  ],
  ['The core mental model is: asset → threat → vulnerability → control → risk outcome.', 'النموذج الذهني الأساسي هو: أصل ← تهديد ← ثغرة ← ضابط أمني ← أثر أمني.'],
  ['The core mental model is: asset. threat. vulnerability. control. risk outcome.', 'النموذج الذهني الأساسي هو: أصل ← تهديد ← ثغرة ← ضابط أمني ← أثر أمني.'],
  ['The CIA triad gives three essential security goals: confidentiality, integrity, and availability.', 'تقدم ثلاثية السرية والنزاهة والتوافر ثلاثة أهداف أمنية أساسية: السرية، والنزاهة، والتوافر.'],
]);

function shouldTranslateString(key: string, value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (PRESERVED_KEYS.has(key)) return false;
  if (/^https?:\/\//i.test(trimmed)) return false;
  if (/^\/[a-z0-9/_-]+$/i.test(trimmed)) return false;
  if (/^[#.:][a-z0-9_-]+$/i.test(trimmed)) return false;
  return /[A-Za-z]/.test(trimmed);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyArabicFallbacks(source: string, translated: string, targetLang: string) {
  if (targetLang !== 'ar') return translated;

  const exact = ARABIC_FALLBACKS.get(source.trim());
  let result = translated.trim();

  if (exact) {
    result = exact;
  }

  for (const [english, arabic] of ARABIC_FALLBACKS) {
    result = result.replace(new RegExp(escapeRegExp(english), 'g'), arabic);
  }

  return applyArabicTerminologyQa(result);
}

function applyArabicTerminologyQa(value: string) {
  return value
    .replace(/الالأمن السيبرانيى/g, 'الأمن السيبراني')
    .replace(/الالأمن السيبراني/g, 'الأمن السيبراني')
    .replace(/الأمن السيبرانيى/g, 'الأمن السيبراني')
    .replace(/النظم الرقمية/g, 'الأنظمة الرقمية')
    .replace(/هذه النظم/g, 'هذه الأنظمة')
    .replace(/نظم المعلومات والمعلومات/g, 'المعلومات وأنظمة المعلومات')
    .replace(/إذا تعرضت هذه الأنظمة أو غيرت أو أغلقت أو أزيلت من مكانها/g, 'إذا كُشفت هذه الأنظمة أو عُدلت أو أُغلقت أو تعطلت')
    .replace(/عدم الملاءمة/g, 'الإزعاج')
    .replace(/وسائل السلامة/g, 'مشكلات السلامة')
    .replace(/الاضطرابات التجارية/g, 'اضطرابات الأعمال')
    .replace(/الشروط الأمنية العشوائية/g, 'مصطلحات أمنية عشوائية')
    .replace(/ستتعلمون/g, 'ستتعلم')
    .replace(/وسترون أيضاً/g, 'وسترى أيضاً')
    .replace(/لماذا لا يكون الأمن السيبراني مجرد/g, 'لماذا لا يُعد الأمن السيبراني مجرد')
    .replace(/تذكّر التميّز/g, 'تذكّر الفرق')
    .replace(/طلب أمن المعلومات،/g, 'يسأل أمن المعلومات:')
    .replace(/الأمن السيبراني يسأل،/g, 'ويسأل الأمن السيبراني:')
    .replace(/وكالة المخابرات المركزية/g, 'ثلاثية السرية والنزاهة والتوافر')
    .replace(/ممتلكات ثلاثية السرية والنزاهة والتوافر/g, 'أحد عناصر ثلاثية CIA')
    .replace(/ممتلكات وكالة المخابرات المركزية/g, 'أحد عناصر ثلاثية CIA')
    .replace(/ما هي أحد عناصر ثلاثية CIA الأكثر تأثرًا أولًا؟/g, 'أي عنصر من عناصر ثلاثية CIA تأثر أولًا؟')
    .replace(/ما هي أحد عناصر ثلاثية CIA الأكثر تأثراً أولاً؟/g, 'أي عنصر من عناصر ثلاثية CIA تأثر أولًا؟')
    .replace(/ما هي أحد عناصر ثلاثية CIA الأكثر تأثرا أولا؟/g, 'أي عنصر من عناصر ثلاثية CIA تأثر أولًا؟')
    .replace(/ما هو الضعف؟/g, 'ما هي الثغرة؟')
    .replace(/اختيار أفضل مراقبة/g, 'اختر أفضل ضابط أمني')
    .replace(/أفضل مراقبة/g, 'أفضل ضابط أمني')
    .replace(/أمن السيبر(?!اني)/g, 'الأمن السيبراني')
    .replace(/الأمن السيبرى/g, 'الأمن السيبراني')
    .replace(/أمن الفضاء الإلكتروني/g, 'الأمن السيبراني')
    .replace(/الأصول المقاومة/g, 'الأصول ذات القيمة')
    .replace(/الأصول المقوّمة/g, 'الأصول ذات القيمة')
    .replace(/الأصول المقومة/g, 'الأصول ذات القيمة')
    .replace(/الأصول القيّمة/g, 'الأصول ذات القيمة')
    .replace(/الأصول القيمة/g, 'الأصول ذات القيمة')
    .replace(/الخصوم/g, 'الثغرات')
    .replace(/الخصم/g, 'الثغرة')
    .replace(/أوجه الضعف/g, 'الثغرات')
    .replace(/نقاط الضعف/g, 'الثغرات')
    .replace(/القابلية للتأثر/g, 'الثغرة')
    .replace(/القابليات للتأثر/g, 'الثغرات')
    .replace(/الرقابة الأمنية/g, 'الضوابط الأمنية')
    .replace(/المراقبة الأمنية/g, 'الضوابط الأمنية')
    .replace(/المراقبة الأمنية/g, 'الضوابط الأمنية')
    .replace(/المخاطرة/g, 'المخاطر')
    .replace(/نتيجة المخاطر/g, 'الأثر الأمني')
    .replace(/نتيجة الخطر/g, 'الأثر الأمني')
    .replace(/التهديداتات/g, 'التهديدات')
    .replace(/التوفر/g, 'التوافر')
    .replace(/الإتاحة/g, 'التوافر')
    .replace(/سلامة البيانات/g, 'نزاهة البيانات')
    .replace(/خصوصية المعلومات/g, 'سرية المعلومات')
    .replace(/الدفاع المتعمق/g, 'الدفاع متعدد الطبقات')
    .replace(/الاستجابة للحادث/g, 'الاستجابة للحوادث')
    .replace(/الوصول غير المأذون/g, 'الوصول غير المصرح به')
    .replace(/كشف البيانات/g, 'كشف البيانات')
    .replace(/الاستيلاء على الحساب/g, 'الاستيلاء على الحساب')
    .replace(/البريد الإلكتروني المضغوط/g, 'بريد تصيّد إلكتروني')
    .replace(/البريد الإلكتروني المخادع/g, 'بريد تصيّد إلكتروني')
    .replace(/توثيق متعدد العوامل/g, 'المصادقة متعددة العوامل')
    .replace(/مصادقة متعددة العوامل/g, 'المصادقة متعددة العوامل');
}

function cloneJson<T>(content: T): T {
  return JSON.parse(JSON.stringify(content)) as T;
}

function collectTextSlots(value: unknown, slots: TextSlot[], path: Array<string | number> = [], key = '') {
  if (typeof value === 'string') {
    if (shouldTranslateString(key, value)) {
      slots.push({ path, value });
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectTextSlots(item, slots, [...path, index], key));
    return;
  }

  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([childKey, childValue]) => {
      collectTextSlots(childValue, slots, [...path, childKey], childKey);
    });
  }
}

function setAtPath(target: unknown, path: Array<string | number>, value: string) {
  let cursor = target as Record<string, unknown> | unknown[];
  for (let index = 0; index < path.length - 1; index += 1) {
    cursor = cursor[path[index] as keyof typeof cursor] as Record<string, unknown> | unknown[];
  }

  const finalKey = path[path.length - 1];
  if (Array.isArray(cursor) && typeof finalKey === 'number') {
    cursor[finalKey] = value;
    return;
  }

  (cursor as Record<string, unknown>)[String(finalKey)] = value;
}

function batchSlots(slots: TextSlot[]) {
  const batches: TextSlot[][] = [];
  let current: TextSlot[] = [];
  let currentChars = 0;

  for (const slot of slots) {
    const nextChars = currentChars + slot.value.length;
    if (
      current.length > 0 &&
      (current.length >= MAX_GOOGLE_TEXTS_PER_BATCH || nextChars > MAX_GOOGLE_CHARS_PER_BATCH)
    ) {
      batches.push(current);
      current = [];
      currentChars = 0;
    }

    current.push(slot);
    currentChars += slot.value.length;
  }

  if (current.length > 0) batches.push(current);
  return batches;
}

export async function translateStructuredContent<T>(
  content: T,
  provider: TranslationProvider,
  targetLang: string,
  sourceLang = 'en',
): Promise<T> {
  const translatedContent = cloneJson(content);
  const slots: TextSlot[] = [];
  collectTextSlots(content, slots);

  for (const batch of batchSlots(slots)) {
    const sourceTexts = batch.map((slot) => slot.value);
    const translatedTexts = provider.translateTexts
      ? await provider.translateTexts(sourceTexts, targetLang, sourceLang)
      : await Promise.all(sourceTexts.map((text) => provider.translateText(text, targetLang, sourceLang)));

    batch.forEach((slot, index) => {
      setAtPath(
        translatedContent,
        slot.path,
        applyArabicFallbacks(slot.value, translatedTexts[index] ?? slot.value, targetLang),
      );
    });
  }

  return translatedContent;
}
