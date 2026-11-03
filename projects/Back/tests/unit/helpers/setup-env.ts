// Тестовое окружение: реальные ключи и .env не используются
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123456'
process.env.JWT_EXPIRES_IN = '1h'
process.env.SUPABASE_URL = 'http://localhost:54321'
process.env.SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
process.env.CORS_ORIGIN = 'http://localhost:1000'
