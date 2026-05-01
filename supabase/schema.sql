create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null default 'Student',
  role text not null default 'student' check (role in ('student', 'admin')),
  status text not null default 'active' check (status in ('active', 'disabled')),
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  difficulty text not null default 'Beginner',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.phases (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  phase_number integer not null,
  title text not null,
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(course_id, phase_number)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  phase_id uuid not null references public.phases(id) on delete cascade,
  lesson_number integer not null,
  slug text not null,
  title text not null,
  language_source text not null default 'en',
  content_json jsonb not null,
  content_hash text not null,
  reading_time text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(phase_id, lesson_number),
  unique(course_id, slug)
);

create table if not exists public.translations (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  target_lang text not null,
  content_json jsonb not null,
  source_content_hash text not null,
  provider text not null default 'curated',
  provider_model text,
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed', 'stale')),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(lesson_id, target_lang)
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  phase_id uuid not null references public.phases(id) on delete cascade,
  slug text unique not null,
  title text not null,
  passing_score integer not null default 70,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_number integer not null,
  prompt text not null,
  options_json jsonb not null,
  correct_answer_index integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(quiz_id, question_number)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  attempt_number integer not null default 1,
  score integer not null,
  passed boolean not null default false,
  selected_answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.student_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create table if not exists public.lesson_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  note_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  entity_name text not null,
  actor uuid references public.profiles(id) on delete set null default auth.uid(),
  details text,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value_json jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists phases_course_idx on public.phases(course_id);
create index if not exists lessons_course_phase_idx on public.lessons(course_id, phase_id);
create index if not exists translations_lesson_lang_idx on public.translations(lesson_id, target_lang);
create index if not exists quiz_attempts_user_idx on public.quiz_attempts(user_id);
create index if not exists student_progress_user_idx on public.student_progress(user_id);
create index if not exists lesson_notes_user_idx on public.lesson_notes(user_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'courses', 'phases', 'lessons', 'translations',
    'quizzes', 'quiz_questions', 'student_progress', 'lesson_notes', 'settings'
  ]
  loop
    execute format('drop trigger if exists touch_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger touch_%I_updated_at before update on public.%I for each row execute function public.touch_updated_at()', table_name, table_name);
  end loop;
end $$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, 'Student'), '@', 1)),
    'student',
    'active'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.phases enable row level security;
alter table public.lessons enable row level security;
alter table public.translations enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.student_progress enable row level security;
alter table public.lesson_notes enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.settings enable row level security;

create policy "profiles self read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles self update" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "profiles admin insert" on public.profiles for insert with check (public.is_admin());

create policy "published courses readable" on public.courses for select using (status = 'published' or public.is_admin());
create policy "admin manage courses" on public.courses for all using (public.is_admin()) with check (public.is_admin());

create policy "published phases readable" on public.phases for select using (status = 'published' or public.is_admin());
create policy "admin manage phases" on public.phases for all using (public.is_admin()) with check (public.is_admin());

create policy "published lessons readable" on public.lessons for select using (status = 'published' or public.is_admin());
create policy "admin manage lessons" on public.lessons for all using (public.is_admin()) with check (public.is_admin());

create policy "completed translations readable" on public.translations for select using (status = 'completed' or public.is_admin());
create policy "admin manage translations" on public.translations for all using (public.is_admin()) with check (public.is_admin());

create policy "published quizzes readable" on public.quizzes for select using (status = 'published' or public.is_admin());
create policy "admin manage quizzes" on public.quizzes for all using (public.is_admin()) with check (public.is_admin());

create policy "quiz questions readable" on public.quiz_questions for select using (
  exists (
    select 1 from public.quizzes q
    where q.id = quiz_id and (q.status = 'published' or public.is_admin())
  )
);
create policy "admin manage quiz questions" on public.quiz_questions for all using (public.is_admin()) with check (public.is_admin());

create policy "students manage own attempts" on public.quiz_attempts for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "students manage own progress" on public.student_progress for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "students manage own notes" on public.lesson_notes for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "admin read audit log" on public.admin_audit_log for select using (public.is_admin());
create policy "admin write audit log" on public.admin_audit_log for insert with check (public.is_admin());

create policy "settings readable" on public.settings for select using (true);
create policy "admin manage settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());
