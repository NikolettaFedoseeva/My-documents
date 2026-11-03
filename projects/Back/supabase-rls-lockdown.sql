-- ========================================================
-- МИГРАЦИЯ БЕЗОПАСНОСТИ: закрыть прямой доступ к таблицам по публичному ключу
-- ========================================================
-- Запускать в Supabase → SQL Editor. Безопасно выполнять повторно.
-- Бэкенд работает через service_role-ключ, он обходит RLS и продолжит работать.
--
-- Зачем: старые политики "Public full access" разрешали любому, у кого есть
-- публичный ключ (он виден в браузере), читать password_hash и менять роли.

-- 1. Удаляем все политики на наших таблицах
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('users', 'courses', 'categories', 'docs', 'user_progress')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- 2. Убеждаемся, что RLS включён (без политик = доступ для anon/authenticated закрыт)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- 3. Дополнительно отзываем права у публичных ролей
REVOKE ALL ON public.users, public.courses, public.categories, public.docs, public.user_progress
  FROM anon, authenticated;

-- Проверка (должно вернуть 0 строк): SELECT * FROM pg_policies WHERE schemaname = 'public';
