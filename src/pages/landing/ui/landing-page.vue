<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  UiButton,
  UiBadge,
  UiCard,
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
  hint: 'Кликните на карточку, чтобы узнать ответ!',
}

const goToWorkspace = () => {
  router.push('/workspace')
}
</script>

<template>
  <div class="landing-page">
    <!-- Hero Block -->
    <section class="landing-hero">
      <UiBadge variant="primary" dot>⚡ ЕДИНОЕ ПРОСТРАНСТВО ЗНАНИЙ</UiBadge>
      <h1 class="landing-hero__title">
        Lern Codex — Учись системно <br />
        и <span class="gradient-text">в 3 раза эффективнее</span>
      </h1>
      <p class="landing-hero__sub">
        Интерактивная образовательная платформа с открытой документацией, 
        3D-тренажёрами запоминания и индивидуальным отслеживанием прогресса.
      </p>

      <div class="landing-hero__actions">
        <UiButton variant="primary" size="lg" @click="goToWorkspace">
          <template #icon-left>📖</template>
          Открыть Базу Знаний →
        </UiButton>
      </div>
    </section>

    <!-- 3 Key Features -->
    <section class="landing-features">
      <div class="features-grid">
        <UiCard variant="glass" padding="lg">
          <div class="feature-item">
            <span class="feature-item__icon">📚</span>
            <h3>Открытая Документация</h3>
            <p>
              Все статьи, справочники и исходные примеры кода доступны абсолютно бесплатно и без обязательной регистрации.
            </p>
          </div>
        </UiCard>

        <UiCard variant="glass" padding="lg">
          <div class="feature-item">
            <span class="feature-item__icon">🧠</span>
            <h3>Active Recall & 3D Cards</h3>
            <p>
              Встроенный тренажер интервального повторения помогает удерживать сложный материал в долгосрочной памяти.
            </p>
          </div>
        </UiCard>

        <UiCard variant="glass" padding="lg">
          <div class="feature-item">
            <span class="feature-item__icon">🎨</span>
            <h3>7 Динамических Темы</h3>
            <p>
              Комфортное чтение в любое время суток благодаря гибкой настройке оформления и UI Kit компонентам.
            </p>
          </div>
        </UiCard>
      </div>
    </section>

    <!-- Interactive Active Recall Card Demo -->
    <section class="landing-demo">
      <div class="landing-demo__header">
        <h2>Попробуйте интерактивную карточку в действии:</h2>
      </div>
      <div class="landing-demo__container">
        <UiCard variant="glass" padding="lg">
          <InteractiveFlashcard :data="demoQuestion" />
        </UiCard>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.landing-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.landing-hero {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;

  &__title {
    font-size: 3rem;
    font-weight: 800;
    line-height: 1.15;
    color: var(--text-main);
    letter-spacing: -0.02em;
  }

  .gradient-text {
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &__sub {
    font-size: 1.2rem;
    color: var(--text-muted);
    max-width: 720px;
    line-height: 1.6;
  }

  &__actions {
    margin-top: 0.75rem;
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.feature-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__icon {
    font-size: 2.2rem;
  }

  h3 {
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--text-main);
  }

  p {
    color: var(--text-muted);
    font-size: 0.95rem;
    line-height: 1.5;
  }
}

.landing-demo {
  text-align: center;

  &__header {
    margin-bottom: 1.5rem;
    h2 {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-main);
    }
  }

  &__container {
    max-width: 750px;
    margin: 0 auto;
  }
}
</style>