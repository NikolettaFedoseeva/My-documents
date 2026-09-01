<script setup lang="ts">
import { ref } from 'vue'
import {
  UiButton,
  UiBadge,
  UiCard,
  UiProgressBar,
  InteractiveFlashcard,
  type QuestionData,
} from 'lern-ui-kit'

const userStreak = ref<number>(7)

const activeQuestion: QuestionData = {
  id: 'cab-host-1',
  category: 'Vue 3',
  section: 'Composition API',
  difficulty: 'medium',
  question: 'В чём различие между ref() и reactive() в Vue 3?',
  answer: 'ref() обертывает любые типы (включая примитивы) с доступом через .value.\nreactive() работает только с объектами без необходимости .value.',
  hint: 'Подумайте о примитивных типах данных и свойстве .value.',
}
</script>

<template>
  <div class="cabinet-page">
    <UiCard variant="glow" padding="lg">
      <div class="cabinet-header">
        <div class="cabinet-header__user">
          <div class="avatar-placeholder">👤</div>
          <div>
            <h2>Личный Кабинет Студента</h2>
            <p>Синхронизировано с базой данных Supabase</p>
          </div>
        </div>
        <UiBadge variant="success">Ударный режим: {{ userStreak }} дней 🔥</UiBadge>
      </div>

      <div class="cabinet-stats-grid">
        <div class="stat-card">
          <span class="stat-card__val">14</span>
          <span class="stat-card__lbl">Прочитанных тем</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__val">88%</span>
          <span class="stat-card__lbl">Точность ответов</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__val">32</span>
          <span class="stat-card__lbl">Active Recall карточек</span>
        </div>
      </div>

      <div class="cabinet-section">
        <h3>🎯 Текущий прогресс в курсе Vue 3</h3>
        <UiProgressBar :value="75" label="Продвинутый Composition API" show-label animated />
      </div>

      <div class="cabinet-section" style="margin-top: 2rem">
        <h3>🃏 Сегодняшнее повторение Active Recall</h3>
        <InteractiveFlashcard :data="activeQuestion" />
      </div>
    </UiCard>
  </div>
</template>

<style scoped lang="scss">
.cabinet-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
}
.cabinet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  &__user {
    display: flex;
    align-items: center;
    gap: 1rem;
    h2 { font-size: 1.6rem; font-weight: 800; color: var(--text-main); }
    p { font-size: 0.9rem; color: var(--text-muted); }
  }
}
.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}
.cabinet-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}
.stat-card {
  padding: 1.25rem;
  border-radius: var(--radius-md);
  background: var(--bg-card-hover);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  &__val { font-size: 2rem; font-weight: 800; color: var(--primary); }
  &__lbl { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
}
.cabinet-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  h3 { font-size: 1.1rem; font-weight: 700; color: var(--text-main); }
}
</style>