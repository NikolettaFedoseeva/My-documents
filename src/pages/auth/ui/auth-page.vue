<script setup lang="ts">
import { AuthCard } from '@/widgets/auth-card'
</script>

<template>
  <div class="auth-page">
    <!-- Фоновые неоновые световые сферы -->
    <div class="auth-page__orb auth-page__orb--1"></div>
    <div class="auth-page__orb auth-page__orb--2"></div>
    <div class="auth-page__orb auth-page__orb--3"></div>

    <main class="auth-page__content">
      <AuthCard />
    </main>
  </div>
</template>

<style scoped lang="scss">
.auth-page {
  position: relative;
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #090d16;
  padding: 2rem 1rem;
  overflow: hidden;
  box-sizing: border-border-box;

  &__content {
    position: relative;
    z-index: 10;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  &__orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    opacity: 0.45;
    animation: float 10s infinite ease-in-out alternate;

    &--1 {
      width: 350px;
      height: 350px;
      background: #6366f1;
      top: -50px;
      left: 15%;
    }

    &--2 {
      width: 400px;
      height: 400px;
      background: #a855f7;
      bottom: -80px;
      right: 15%;
      animation-delay: -5s;
    }

    &--3 {
      width: 250px;
      height: 250px;
      background: #10b981;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: -2s;
    }
  }
}

@keyframes float {
  0% {
    transform: translateY(0) scale(1);
  }
  100% {
    transform: translateY(-30px) scale(1.08);
  }
}
</style>