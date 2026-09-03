<script setup lang="ts">
import { useAppHeader } from '../model/use-app-header'
import AppHeaderNav from './app-header-nav.vue'
import AppHeaderUser from './app-header-user.vue'
import AppHeaderMobile from './app-header-mobile.vue'
import { GlobalSearchTrigger } from '@/features/global-search'

// #region composable
const {
  currentUser,
  visibleNavLinks,
  currentPath,
  isMobileMenuOpen,
  navigateTo,
  toggleMobileMenu,
  closeMobileMenu,
  handleSearchTrigger,
  handleLogout,
} = useAppHeader()
// #endregion composable
</script>

<template>
  <header class="app-header">
    <div class="app-header__container">
      <!-- Логотип и Бренд -->
      <div class="app-header__brand" @click="navigateTo('/')">
        <span class="app-header__logo">🎓</span>
        <span class="app-header__title">LERN</span>
        <span class="app-header__badge">PRO</span>
      </div>

      <!-- Десктопная навигация -->
      <div class="app-header__desktop-nav">
        <AppHeaderNav
          :links="visibleNavLinks"
          :current-path="currentPath"
          @navigate="navigateTo"
        />
      </div>

      <!-- Поиск и Блок пользователя -->
      <div class="app-header__actions">
        <GlobalSearchTrigger @trigger="handleSearchTrigger" />

        <div class="app-header__desktop-user">
          <AppHeaderUser
            :user="currentUser"
            @navigate="navigateTo"
            @logout="handleLogout"
          />
        </div>

        <!-- Кнопка мобильного меню (Гамбургер) -->
        <button
          type="button"
          class="app-header__hamburger-btn"
          @click="toggleMobileMenu"
        >
          ☰
        </button>
      </div>
    </div>

    <!-- Выездная мобильная шторка -->
    <AppHeaderMobile
      :is-open="isMobileMenuOpen"
      :links="visibleNavLinks"
      :current-path="currentPath"
      :user="currentUser"
      @close="closeMobileMenu"
      @navigate="navigateTo"
      @logout="handleLogout"
    />
  </header>
</template>

<style scoped lang="scss">
.app-header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  width: 100%;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  &__container {
    max-width: 1320px;
    margin: 0 auto;
    padding: 0.75rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
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
  }

  &__title {
    font-size: 1.35rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #ffffff 0%, #818cf8 100%);
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

  &__desktop-nav {
    display: flex;

    @media (max-width: 868px) {
      display: none;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__desktop-user {
    display: flex;

    @media (max-width: 868px) {
      display: none;
    }
  }

  &__hamburger-btn {
    display: none;
    background: transparent;
    border: none;
    color: #f8fafc;
    font-size: 1.4rem;
    cursor: pointer;
    padding: 0.2rem 0.4rem;

    @media (max-width: 868px) {
      display: block;
    }
  }
}
</style>
