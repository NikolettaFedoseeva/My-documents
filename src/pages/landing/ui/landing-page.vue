<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  UiButton,
  UiBadge,
  InteractiveFlashcard,
  type QuestionData,
} from 'lern-ui-kit'

const router = useRouter()

const demoQuestion: QuestionData = {
  id: 'landing-demo',
  category: 'Lern Codex',
  section: 'О Проекте',
  difficulty: 'easy',
  question: 'Что такое Lern Codex?',
  answer: 'Lern Codex — это интерактивная платформа с открытой базой знаний, 3D Active Recall тренажёрами и удобной системой отслеживания личного прогресса.',
  hint: 'Кликните на карточку, чтобы перевернуть её!',
}

const goToDocs = () => {
  router.push('/docs')
}

const goToAuth = () => {
  router.push('/auth')
}
</script>

<template>
  <div class="landing-page">
    <!-- Glow Background Effects -->
    <div class="glow-orb glow-orb--1"></div>
    <div class="glow-orb glow-orb--2"></div>

    <!-- Hero Block -->
    <section class="landing-hero">
      <div class="hero-badge-wrapper">
        <UiBadge variant="primary" dot>⚡ ЕДИНОЕ ПРОСТРАНСТВО ЗНАНИЙ</UiBadge>
      </div>

      <h1 class="landing-hero__title">
        Lern Codex — Учись системно <br />
        и <span class="gradient-text">в 3 раза эффективнее</span>
      </h1>

      <p class="landing-hero__sub">
        Интерактивная образовательная платформа с открытой документацией, 
        3D-тренажёрами запоминания и индивидуальным отслеживанием прогресса.
      </p>

      <div class="landing-hero__actions">
        <UiButton variant="primary" size="lg" @click="goToDocs">
          <template #icon-left>📖</template>
          Открыть Базу Знаний →
        </UiButton>
        <UiButton variant="secondary" size="lg" @click="goToAuth">
          <template #icon-left>🔑</template>
          Войти в Кабинет
        </UiButton>
      </div>
    </section>

    <!-- 3 Glassmorphic Features Grid -->
    <section class="landing-features">
      <div class="features-grid">
        <div class="glass-card">
          <div class="feature-item">
            <div class="feature-item__icon-box">
              <span>📚</span>
            </div>
            <h3>Открытая Документация</h3>
            <p>
              Все статьи, справочники и исходные примеры кода доступны абсолютно бесплатно и без обязательной регистрации на роуте <code>/docs</code>.
            </p>
          </div>
        </div>

        <div class="glass-card">
          <div class="feature-item">
            <div class="feature-item__icon-box">
              <span>🧠</span>
            </div>
            <h3>Active Recall & 3D Cards</h3>
            <p>
              Встроенный тренажер интервального повторения помогает удерживать сложный материал в долгосрочной памяти.
            </p>
          </div>
        </div>

        <div class="glass-card">
          <div class="feature-item">
            <div class="feature-item__icon-box">
              <span>🎨</span>
            </div>
            <h3>7 Динамических Темы</h3>
            <p>
              Комфортное чтение в любое время суток благодаря выпадающему круглом переключателю оформления в шапке.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive Active Recall Card Demo -->
    <section class="landing-demo">
      <div class="landing-demo__header">
        <h2>Попробуйте интерактивную карточку в действии:</h2>
      </div>
      <div class="landing-demo__container">
        <div class="glass-card glass-card--demo">
          <InteractiveFlashcard :data="demoQuestion" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.landing-page {
  max-width: 1140px;
  margin: 0 auto;
  padding: 4rem 1.5rem 6rem;
  display: flex;
  flex-direction: column;
  gap: 4.5rem;
  position: relative;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  opacity: 0.22;
  z-index: 0;

  &--1 {
    width: 450px;
    height: 450px;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
    background: #38bdf8;
  }

  &--2 {
    width: 350px;
    height: 350px;
    bottom: 100px;
    right: 5%;
    background: #818cf8;
  }
}

.landing-hero {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  position: relative;
  z-index: 1;

  &__title {
    font-size: 3.2rem;
    font-weight: 800;
    line-height: 1.2;
    color: #ffffff;
    letter-spacing: -0.02em;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }

  .gradient-text {
    background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
  }

  &__sub {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.82);
    max-width: 760px;
    line-height: 1.6;
    font-weight: 500;
  }

  &__actions {
    display: flex;
    gap: 1.25rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.75rem;
  position: relative;
  z-index: 1;
}

/* Glassmorphism Card Style */
.glass-card {
  padding: 2rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-6px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(56, 189, 248, 0.5);
    box-shadow: 0 0 25px rgba(56, 189, 248, 0.25);
  }

  &--demo {
    padding: 1.5rem;
  }
}

.feature-item {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__icon-box {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
  }

  h3 {
    font-size: 1.3rem;
    font-weight: 800;
    color: #ffffff;
  }

  p {
    color: #cbd5e1;
    font-size: 0.98rem;
    line-height: 1.6;

    code {
      background: rgba(56, 189, 248, 0.15);
      padding: 0.2rem 0.45rem;
      border-radius: 6px;
      color: #38bdf8;
      font-size: 0.88rem;
      font-weight: 700;
    }
  }
}

.landing-demo {
  text-align: center;
  position: relative;
  z-index: 1;

  &__header {
    margin-bottom: 2rem;

    h2 {
      font-size: 1.6rem;
      font-weight: 800;
      color: #ffffff;
    }
  }

  &__container {
    max-width: 800px;
    margin: 0 auto;
  }
}
</style>