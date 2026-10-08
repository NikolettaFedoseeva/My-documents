<script setup lang="ts">
import { useAppHeader } from "../model/use-app-header";
import AppHeaderThemeToggle from "./app-header-theme-toggle.vue";
import AppHeaderMobile from "./app-header-mobile.vue";
import AppHeaderRoleSwitcher from "./app-header-role-switcher.vue";
import { useUserSessionStore } from "@/entities/user";
import { useCommandPalette } from "@/features/command-palette";

// #region composable
const sessionStore = useUserSessionStore();
const { open: openCommandPalette } = useCommandPalette();

const {
  navLinks,
  currentPath,
  isMobileMenuOpen,
  themes,
  activeThemeObj,
  navigateTo,
  toggleMobileMenu,
  closeMobileMenu,
  selectTheme,
} = useAppHeader();
// #endregion composable
</script>

<template>
  <header class="app-header">
    <div class="app-header__container">
      <!-- Левая часть: Бренд + Навигация -->
      <div class="app-header__left">
        <div class="app-header__brand" @click="navigateTo('/')">
          <span class="app-header__logo">🎓</span>
          <span class="app-header__title">LERN</span>
          <span class="app-header__badge">PRO</span>
        </div>

        <!-- Навигационные ссылки: Главная, Курсы, Документация, Студия автора, Админ -->
        <nav class="app-header__nav">
          <button
            type="button"
            class="app-header__nav-link"
            :class="{ 'app-header__nav-link--active': currentPath === '/' }"
            @click="navigateTo('/')"
          >
            Главная
          </button>

          <button
            type="button"
            class="app-header__nav-link"
            :class="{
              'app-header__nav-link--active': currentPath.startsWith('/courses'),
            }"
            @click="navigateTo('/courses')"
          >
            <span class="nav-icon">📚</span>
            <span>Курсы</span>
          </button>

          <button
            type="button"
            class="app-header__nav-link"
            :class="{
              'app-header__nav-link--active': currentPath.startsWith('/docs'),
            }"
            @click="navigateTo('/docs')"
          >
            <span class="nav-icon">📖</span>
            <span>Справочник</span>
          </button>

          <button
            v-if="sessionStore.isAuthor"
            type="button"
            class="app-header__nav-link"
            :class="{
              'app-header__nav-link--active': currentPath.startsWith('/author'),
            }"
            @click="navigateTo('/author')"
          >
            <span class="nav-icon">✍️</span>
            <span>Студия автора</span>
          </button>

          <button
            v-if="sessionStore.isAdmin"
            type="button"
            class="app-header__nav-link"
            :class="{
              'app-header__nav-link--active': currentPath.startsWith('/admin'),
            }"
            @click="navigateTo('/admin')"
          >
            <span class="nav-icon">👑</span>
            <span>Админ</span>
          </button>
        </nav>
      </div>

      <!-- Правая часть: Поиск + Переключатель Роли + Профиль/Войти + Круглая тема + Мобильный гамбургер -->
      <div class="app-header__actions">
        <!-- 0. Кнопка вызова Command Palette (Ctrl+K) -->
        <button
          type="button"
          class="app-header__search-trigger"
          title="Быстрый поиск и команды (Ctrl+K)"
          @click="openCommandPalette"
        >
          <span class="search-trigger__icon">🔍</span>
          <span class="search-trigger__label">Поиск</span>
          <kbd class="search-trigger__kbd">Ctrl K</kbd>
        </button>

        <!-- 1. Интерактивный переключатель роли (RBAC) -->
        <AppHeaderRoleSwitcher />

        <!-- 2. Авторизованный профиль или кнопка Войти -->
        <button
          v-if="sessionStore.isAuthenticated"
          type="button"
          class="app-header__user-btn"
          :class="{
            'app-header__user-btn--active': currentPath.startsWith('/cabinet'),
          }"
          :title="`Личный кабинет (${sessionStore.currentUser.name})`"
          @click="navigateTo('/cabinet')"
        >
          <img
            :src="sessionStore.currentUser.avatar"
            :alt="sessionStore.currentUser.name"
            class="user-avatar-img"
          />
          <span class="user-name">{{ sessionStore.currentUser.name }}</span>
        </button>

        <button
          v-else
          type="button"
          class="app-header__auth-btn"
          :class="{
            'app-header__auth-btn--active': currentPath.startsWith('/auth'),
          }"
          @click="navigateTo('/auth')"
        >
          <span class="auth-icon">🔑</span>
          <span>Войти</span>
        </button>

        <!-- Круглая кнопка переключения тем -->
        <AppHeaderThemeToggle
          :themes="themes"
          :active-theme="activeThemeObj"
          @select-theme="selectTheme"
        />

        <!-- Гамбургер меню для мобильных -->
        <button
          type="button"
          class="app-header__hamburger-btn"
          aria-label="Меню навигации"
          @click="toggleMobileMenu"
        >
          ☰
        </button>
      </div>
    </div>

    <!-- Мобильная шторка -->
    <AppHeaderMobile
      :is-open="isMobileMenuOpen"
      :links="navLinks"
      :current-path="currentPath"
      :themes="themes"
      :active-theme="activeThemeObj"
      @close="closeMobileMenu"
      @navigate="navigateTo"
      @select-theme="selectTheme"
    />
  </header>
</template>

<style scoped lang="scss">
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
  height: 64px;
  background: var(--bg-container, rgba(15, 23, 42, 0.85));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;

  &__container {
    width: 100%;
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    cursor: pointer;
    user-select: none;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.9;
    }
  }

  &__logo {
    font-size: 1.6rem;
    line-height: 1;
  }

  &__title {
    font-size: 1.3rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    background: linear-gradient(
      135deg,
      #ffffff 0%,
      var(--primary, #38bdf8) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &__badge {
    font-size: 0.65rem;
    font-weight: 800;
    padding: 0.15rem 0.45rem;
    border-radius: 6px;
    background: rgba(168, 85, 247, 0.2);
    color: #c084fc;
    border: 1px solid rgba(168, 85, 247, 0.35);
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 0.6rem;

    @media (max-width: 768px) {
      display: none;
    }
  }

  &__nav-link {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    background: transparent;
    border: 1px solid transparent;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    color: var(--text-muted, rgba(255, 255, 255, 0.75));
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: var(--text-main, #ffffff);
      background: var(--bg-card-hover, rgba(255, 255, 255, 0.08));
    }

    &--active {
      color: #38bdf8 !important;
      background: rgba(255, 255, 255, 0.1) !important;
      border-color: rgba(255, 255, 255, 0.15) !important;
      font-weight: 700;
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.2);
    }

    .nav-icon {
      font-size: 1rem;
      line-height: 1;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  &__search-trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.65rem 0.35rem 0.6rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: var(--text-muted, #94a3b8);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(129, 140, 248, 0.4);
      color: #ffffff;
      transform: translateY(-1px);
    }

    .search-trigger__icon {
      font-size: 0.85rem;
    }

    .search-trigger__label {
      font-size: 0.82rem;

      @media (max-width: 640px) {
        display: none;
      }
    }

    .search-trigger__kbd {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-family: inherit;
      font-weight: 600;

      @media (max-width: 768px) {
        display: none;
      }
    }
  }

  &__auth-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.5rem 1.1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
    color: #ffffff;
    border: none;
    box-shadow: 0 4px 15px rgba(56, 189, 248, 0.35);

    &:hover {
      opacity: 0.92;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(56, 189, 248, 0.45);
    }

    .auth-icon {
      font-size: 0.95rem;
      line-height: 1;
    }

    @media (max-width: 768px) {
      display: none;
    }
  }

  &__user-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.85rem 0.35rem 0.4rem;
    border-radius: 9999px;
    background: var(--bg-card, rgba(255, 255, 255, 0.08));
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
    color: var(--text-main, #ffffff);
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--primary, #38bdf8);
      background: var(--bg-card-hover, rgba(255, 255, 255, 0.14));
    }

    &--active {
      border-color: var(--primary, #38bdf8);
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.25);
    }

    .user-avatar-img {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-name {
      max-width: 120px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @media (max-width: 768px) {
      display: none;
    }
  }

  &__hamburger-btn {
    display: none;
    background: transparent;
    border: none;
    color: var(--text-main, #ffffff);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.3rem;
    line-height: 1;

    @media (max-width: 768px) {
      display: block;
    }
  }
}
</style>
