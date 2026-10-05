<script setup lang="ts">
import { useAppHeader } from "../model/use-app-header";
import AppHeaderThemeToggle from "./app-header-theme-toggle.vue";
import AppHeaderMobile from "./app-header-mobile.vue";

// #region composable
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

        <!-- Навигационные ссылки: Главная, Документация, Студия автора -->
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
              'app-header__nav-link--active': currentPath.startsWith('/docs'),
            }"
            @click="navigateTo('/docs')"
          >
            <span class="nav-icon">📖</span>
            <span>Документация</span>
          </button>
          <button
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
        </nav>
      </div>

      <!-- Правая часть: Войти в Кабинет + Круглая тема + Мобильный гамбургер -->
      <div class="app-header__actions">
        <button
          type="button"
          class="app-header__auth-btn"
          :class="{
            'app-header__auth-btn--active':
              currentPath.startsWith('/auth') ||
              currentPath.startsWith('/cabinet'),
          }"
          @click="navigateTo('/auth')"
        >
          <span class="auth-icon">🔑</span>
          <span>Войти в Кабинет</span>
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
    gap: 1rem;
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
