-- ========================================================
-- LERN PLATFORM: СХЕМА БАЗЫ ДАННЫХ ДЛЯ SUPABASE (POSTGRESQL)
-- Проект: gywehqprnrnxqxtxskyf.supabase.co
-- ========================================================

-- 1. Таблица пользователей
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY DEFAULT ('usr-' || substr(gen_random_uuid()::text, 1, 8)),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student', -- 'admin', 'author', 'teacher', 'student', 'guest'
  avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  status TEXT DEFAULT 'offline',
  xp INTEGER DEFAULT 100,
  level INTEGER DEFAULT 1,
  is_banned BOOLEAN DEFAULT false,
  unread_notifications_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Таблица курсов
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  badge TEXT DEFAULT 'PRO',
  icon TEXT DEFAULT '📘',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Таблица категорий / модулей курса
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '📁',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Таблица статей и глав документации
CREATE TABLE IF NOT EXISTS public.docs (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  content JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  interactive_flashcards JSONB,
  quiz_questions JSONB,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Таблица прогресса обучения пользователя
CREATE TABLE IF NOT EXISTS public.user_progress (
  id TEXT PRIMARY KEY DEFAULT ('prog-' || substr(gen_random_uuid()::text, 1, 8)),
  user_id TEXT UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  completed_chapter_ids JSONB DEFAULT '[]'::jsonb,
  favorited_chapter_ids JSONB DEFAULT '[]'::jsonb,
  flashcards_mastered_ids JSONB DEFAULT '[]'::jsonb,
  xp INTEGER DEFAULT 100,
  current_streak INTEGER DEFAULT 1,
  last_active_date TEXT DEFAULT to_char(now(), 'YYYY-MM-DD'),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================================
-- ПОЛИТИКИ ДОСТУПА (Row Level Security)
-- ========================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Разрешаем чтение и запись через API (публичный/сервисный доступ)
CREATE POLICY "Public full access users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access docs" ON public.docs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access user_progress" ON public.user_progress FOR ALL USING (true) WITH CHECK (true);

-- ========================================================
-- НАЧАЛЬНЫЕ ДАННЫЕ (SEEDS)
-- ========================================================
-- 1. Администратор (пароль: admin123, хэш bcrypt)
INSERT INTO public.users (id, email, password_hash, name, role, xp, level, avatar)
VALUES (
  'usr-admin-1',
  'admin@lern.ru',
  '$2a$10$wE39i3J4yX13kS87tFj6GepLp/hS8iFwz3rWlX6sN0z6ZqL4vQyhe',
  'Николай (Администратор)',
  'admin',
  2500,
  5,
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
) ON CONFLICT (email) DO NOTHING;

-- 2. Студент (пароль: student123)
INSERT INTO public.users (id, email, password_hash, name, role, xp, level, avatar)
VALUES (
  'usr-student-1',
  'student@lern.ru',
  '$2a$10$wE39i3J4yX13kS87tFj6GepLp/hS8iFwz3rWlX6sN0z6ZqL4vQyhe',
  'Алексей (Студент)',
  'student',
  350,
  1,
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
) ON CONFLICT (email) DO NOTHING;

-- 3. Базовый курс Vue 3
INSERT INTO public.courses (id, slug, title, description, badge, icon, "order")
VALUES (
  'vue3-mastery',
  'vue3-mastery',
  'Vue 3 & Composition API: От Основ к Архитектуре',
  'Полное академическое руководство по реактивности, Script Setup, Composable-функциям и оптимизации рендеринга.',
  'PRO',
  '🟢',
  1
) ON CONFLICT (id) DO NOTHING;

-- Категория курса
INSERT INTO public.categories (id, course_id, title, description, icon, "order")
VALUES (
  'getting-started',
  'vue3-mastery',
  'Быстрый старт',
  'Основная информация о платформе LERN и начале обучения',
  '🚀',
  1
) ON CONFLICT (id) DO NOTHING;

-- Статья с карточкой Active Recall
INSERT INTO public.docs (id, category_id, title, description, content, tags, interactive_flashcards, "order")
VALUES (
  'welcome',
  'getting-started',
  'Добро пожаловать в LERN',
  'Вводная статья о возможностях интерактивной учебной платформы',
  '[{"id":"sec-1","title":"Что такое LERN?","level":2,"text":"LERN — это интерактивная платформа с тренажерами памяти Active Recall и книжным кодексом знаний."}]'::jsonb,
  '["Обзор", "Старт", "LERN"]'::jsonb,
  '[{"id":"fc-01-1","category":"LERN Codex","section":"Введение","difficulty":"easy","question":"В чём главная идея концепции Bookish Codex в LERN?","answer":"Слияние академического книжного справочника с 3D-тренажерами памяти Active Recall для глубокого и долгосрочного запоминания.","hint":"Подумайте об эстетике книги и интервальном повторении."}]'::jsonb,
  1
) ON CONFLICT (id) DO NOTHING;
