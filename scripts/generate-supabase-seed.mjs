import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { courseData } from '../src/data/coursePageData.js';
import { defaultPhasesDetailData } from '../src/data/phaseData.js';
import { getLessonContent } from '../src/data/lessonContentData.js';

function uuidFor(input) {
  const hash = createHash('sha1').update(input).digest('hex').slice(0, 32);
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(13, 16)}`,
    `8${hash.slice(17, 20)}`,
    hash.slice(20, 32),
  ].join('-');
}

function sql(value) {
  if (value === null || value === undefined) return 'null';
  return `'${String(value).replaceAll("'", "''")}'`;
}

function jsonSql(value) {
  return `${sql(JSON.stringify(value))}::jsonb`;
}

function hashContent(content) {
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

function stripRuntimeFlags(content) {
  const cloned = structuredClone(content);
  delete cloned._isTranslated;
  return cloned;
}

const courseId = uuidFor(`course:${courseData.slug}`);
const phaseRows = courseData.phases.map((phase) => ({
  id: uuidFor(`phase:${courseData.slug}:${phase.id}`),
  courseId,
  phaseNumber: phase.id,
  title: phase.title,
  description: `Phase ${phase.id}: ${phase.title}`,
  status: phase.locked ? 'draft' : 'published',
}));

const lessonRows = [];
const translationRows = [];
for (const lessonNumber of [1, 2]) {
  const english = stripRuntimeFlags(getLessonContent(1, lessonNumber, 'en'));
  const arabic = stripRuntimeFlags(getLessonContent(1, lessonNumber, 'ar'));
  const fallbackTitle = lessonNumber === 1
    ? 'Lesson 1: What Is Cybersecurity?'
    : 'Lesson 2: Why Cybersecurity Matters';
  english.title ||= fallbackTitle;
  arabic.title ||= lessonNumber === 1
    ? 'الدرس 1: ما هو الأمن السيبراني؟'
    : 'الدرس 2: لماذا الأمن السيبراني مهم؟';
  const contentHash = hashContent(english);
  const lessonId = uuidFor(`lesson:${courseData.slug}:1:${lessonNumber}`);
  const phaseId = uuidFor(`phase:${courseData.slug}:1`);
  const slug = lessonNumber === 1 ? 'what-is-cybersecurity' : 'why-cybersecurity-matters';

  lessonRows.push({
    id: lessonId,
    courseId,
    phaseId,
    lessonNumber,
    slug,
    title: english.title,
    contentJson: english,
    contentHash,
    status: 'published',
  });

  translationRows.push({
    id: uuidFor(`translation:${lessonId}:ar`),
    lessonId,
    targetLang: 'ar',
    contentJson: arabic,
    sourceContentHash: contentHash,
    provider: 'curated',
    providerModel: 'manual-polished',
    status: 'completed',
  });
}

const quizRows = [];
const questionRows = [];
for (const phase of Object.values(defaultPhasesDetailData)) {
  if (!phase.quiz) continue;
  const phaseId = uuidFor(`phase:${courseData.slug}:${phase.id}`);
  const quizId = uuidFor(`quiz:${courseData.slug}:${phase.id}`);
  quizRows.push({
    id: quizId,
    courseId,
    phaseId,
    slug: `phase-${phase.id}-quiz`,
    title: phase.quiz.title,
    passingScore: phase.quiz.passingScore || 70,
    status: 'published',
  });

  phase.quiz.questions?.forEach((question, index) => {
    questionRows.push({
      id: uuidFor(`quiz-question:${quizId}:${index + 1}`),
      quizId,
      questionNumber: index + 1,
      prompt: question.text || question.prompt || `Question ${index + 1}`,
      optionsJson: question.options || [],
      correctAnswerIndex: Number(question.correctAnswerIndex || 0),
    });
  });
}

const lines = [
  '-- Generated from frontend lesson/course data. Run after supabase/schema.sql.',
  'begin;',
  `insert into public.courses (id, slug, title, description, difficulty, status) values (${sql(courseId)}, ${sql(courseData.slug)}, ${sql(courseData.title)}, ${sql(courseData.description)}, ${sql(courseData.difficulty)}, 'published') on conflict (slug) do update set title = excluded.title, description = excluded.description, difficulty = excluded.difficulty, status = excluded.status;`,
  ...phaseRows.map((phase) => `insert into public.phases (id, course_id, phase_number, title, description, status) values (${sql(phase.id)}, ${sql(phase.courseId)}, ${phase.phaseNumber}, ${sql(phase.title)}, ${sql(phase.description)}, ${sql(phase.status)}) on conflict (course_id, phase_number) do update set title = excluded.title, description = excluded.description, status = excluded.status;`),
  ...lessonRows.map((lesson) => `insert into public.lessons (id, course_id, phase_id, lesson_number, slug, title, content_json, content_hash, status) values (${sql(lesson.id)}, ${sql(lesson.courseId)}, ${sql(lesson.phaseId)}, ${lesson.lessonNumber}, ${sql(lesson.slug)}, ${sql(lesson.title)}, ${jsonSql(lesson.contentJson)}, ${sql(lesson.contentHash)}, ${sql(lesson.status)}) on conflict (course_id, slug) do update set phase_id = excluded.phase_id, lesson_number = excluded.lesson_number, title = excluded.title, content_json = excluded.content_json, content_hash = excluded.content_hash, status = excluded.status;`),
  ...translationRows.map((translation) => `insert into public.translations (id, lesson_id, target_lang, content_json, source_content_hash, provider, provider_model, status, reviewed_at) values (${sql(translation.id)}, ${sql(translation.lessonId)}, ${sql(translation.targetLang)}, ${jsonSql(translation.contentJson)}, ${sql(translation.sourceContentHash)}, ${sql(translation.provider)}, ${sql(translation.providerModel)}, ${sql(translation.status)}, now()) on conflict (lesson_id, target_lang) do update set content_json = excluded.content_json, source_content_hash = excluded.source_content_hash, provider = excluded.provider, provider_model = excluded.provider_model, status = excluded.status;`),
  ...quizRows.map((quiz) => `insert into public.quizzes (id, course_id, phase_id, slug, title, passing_score, status) values (${sql(quiz.id)}, ${sql(quiz.courseId)}, ${sql(quiz.phaseId)}, ${sql(quiz.slug)}, ${sql(quiz.title)}, ${quiz.passingScore}, ${sql(quiz.status)}) on conflict (slug) do update set title = excluded.title, passing_score = excluded.passing_score, status = excluded.status;`),
  ...questionRows.map((question) => `insert into public.quiz_questions (id, quiz_id, question_number, prompt, options_json, correct_answer_index) values (${sql(question.id)}, ${sql(question.quizId)}, ${question.questionNumber}, ${sql(question.prompt)}, ${jsonSql(question.optionsJson)}, ${question.correctAnswerIndex}) on conflict (quiz_id, question_number) do update set prompt = excluded.prompt, options_json = excluded.options_json, correct_answer_index = excluded.correct_answer_index;`),
  `insert into public.settings (key, value_json) values ('platform', ${jsonSql({
    platformName: 'Green Zone Academy',
    defaultLanguage: 'en',
    passingScore: 70,
    translationMode: 'Manual / Supabase',
    dataSourceMode: 'Supabase',
  })}) on conflict (key) do update set value_json = excluded.value_json;`,
  'commit;',
  '',
];

await mkdir('supabase', { recursive: true });
await writeFile('supabase/seed.generated.sql', lines.join('\n'), 'utf8');
console.log(`Generated supabase/seed.generated.sql with ${lessonRows.length} lessons and ${translationRows.length} translations.`);
