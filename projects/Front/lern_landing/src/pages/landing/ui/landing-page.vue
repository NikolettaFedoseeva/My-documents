<script setup lang="ts">
import { ref } from 'vue'
import { UiButton, UiBadge, UiCard, InteractiveFlashcard, type QuestionData } from '@/shared/ui'

const demoQuestion: QuestionData = {
  id: 'demo-card',
  category: 'Demo',
  section: 'Active Recall',
  difficulty: 'easy',
  question: 'Как механика Active Recall ускоряет запоминание материала?',
  answer: 'При попытке вспомнить ответ без подсказки мозг формирует более сильные нейронные связи, улучшая сохранение информации в долгосрочной памяти до 300%!',
}
</script>

<template>
  <div class="landing-page">
    <header class="landing-hero">
      <UiBadge variant="primary" dot>РЕВОЛЮЦИЯ В ОБУЧЕНИИ</UiBadge>
      <h1 class="landing-hero__title">
        Учитесь быстрее с <span class="gradient-text">Lern Codex</span>
      </h1>
      <p class="landing-hero__sub">
        Интерактивный справочник, 3D-карточки Active Recall, интервальное повторение и 7 премиальных стилей интерфейса.
      </p>
      <div class="landing-hero__actions">
        <UiButton variant="primary" size="lg">Начать обучение бесплатно →</UiButton>
        <UiButton variant="secondary" size="lg">Посмотреть витрину UI Kit</UiButton>
      </div>
    </header>

    <section class="landing-demo-card">
      <h2>🃏 Попробуйте тренажёр прямо сейчас:</h2>
      <UiCard variant="glass" padding="lg">
        <InteractiveFlashcard :data="demoQuestion" />
      </UiCard>
    </section>
  </div>
</template>

<style scoped lang="scss">
.landing-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;
}
.landing-hero {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;

  &__title {
    font-size: 3.2rem;
    font-weight: 800;
    line-height: 1.15;
    color: var(--text-main);
  }
  .gradient-text {
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  &__sub {
    font-size: 1.25rem;
    color: var(--text-muted);
    max-width: 700px;
  }
  &__actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }
}
.landing-demo-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  h2 { font-size: 1.6rem; color: var(--text-main); text-align: center; }
}
</style>