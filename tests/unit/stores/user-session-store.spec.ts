import { setActivePinia, createPinia } from 'pinia'
import { useUserSessionStore } from '@/entities/user/model/user-session-store'
import type { User } from '@/entities/user/types'

const makeUser = (role: User['role']): User => ({
  id: `usr-${role}`,
  name: `Тест ${role}`,
  email: `${role}@test.ru`,
  avatar: '',
  role,
  status: 'online',
  unreadNotificationsCount: 0,
  xp: 0,
  level: 1,
})

describe('User Session Store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  test('БЕЗОПАСНОСТЬ: по умолчанию пользователь — неавторизованный гость', () => {
    const store = useUserSessionStore()
    expect(store.currentRole).toBe('guest')
    expect(store.isAuthenticated).toBe(false)
    expect(store.isAdmin).toBe(false)
  })

  test('loginAs авторизует пользователя и сохраняет сессию', () => {
    const store = useUserSessionStore()
    store.loginAs(makeUser('author'))
    expect(store.isAuthenticated).toBe(true)
    expect(store.isAuthor).toBe(true)
    expect(JSON.parse(localStorage.getItem('lern_user_session_v1') as string).role).toBe('author')
  })

  test('сессия восстанавливается из localStorage после перезагрузки', () => {
    useUserSessionStore().loginAs(makeUser('student'))
    setActivePinia(createPinia())
    expect(useUserSessionStore().currentRole).toBe('student')
  })

  test('повреждённый JSON в localStorage → гость, без падения', () => {
    localStorage.setItem('lern_user_session_v1', '{broken')
    expect(useUserSessionStore().currentRole).toBe('guest')
  })

  test('logout возвращает гостя', () => {
    const store = useUserSessionStore()
    store.loginAs(makeUser('admin'))
    store.logout()
    expect(store.currentRole).toBe('guest')
    expect(store.isAdmin).toBe(false)
  })

  test('матрица прав: студент не может управлять пользователями, админ может', () => {
    const store = useUserSessionStore()
    store.loginAs(makeUser('student'))
    expect(store.can('study_courses')).toBe(true)
    expect(store.can('manage_users')).toBe(false)
    store.loginAs(makeUser('admin'))
    expect(store.can('manage_users')).toBe(true)
  })

  test('hasRole: студент не проходит в зону автора, админ проходит везде', () => {
    const store = useUserSessionStore()
    store.loginAs(makeUser('student'))
    expect(store.hasRole(['author', 'admin'])).toBe(false)
    store.loginAs(makeUser('admin'))
    expect(store.hasRole(['author'])).toBe(true)
  })
})
