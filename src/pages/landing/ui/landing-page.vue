<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  UiButton,
  UiBadge,
  UiCard,
  UiAlert,
  InteractiveFlashcard,
  type QuestionData
} from 'lern-ui-kit'

const router = useRouter()

const demoQuestion: QuestionData = {
  id: 'landing-demo-card',
  category: 'Active Recall',
  section: 'Методология Обучения',
  difficulty: 'easy',
  question: 'Почему методики Active Recall эффективнее обычного перечитывания?',
  answer: 'При попытке вспомнить ответ (Active Recall) мозг активирует нейронные связи, усиливает память и увеличивает удержание информации до 300% по сравнению с пассивным чтением.',
  hint: 'Нажмите на карточку, чтобы перевернуть её и проверить себя!',
}

const lastRatingResult = ref<string | null>(null)

const onRateCard = (payload: { id: string | number; rating: string }) => {
  lastRatingResult.value = payload.rating === 'know' 
    ? 'Отлично! Результат сохранён (Знаю 🟢)' 
    : payload.rating === 'doubt' 
    ? 'Сомневаюсь 🟡 — зафиксировано в план' 
    : 'Повторить 🔴 — добавлено в интервальное повторение'
}

const goToWorkspace = () => {
  router.push('/workspace')
}

const goToAuth = () => {
  router.push('/auth')
}
</script>

<template>
  <div class="landing-page">
    <!-- Hero Banner -->
    <section class="landing-hero">
      <UiBadge variant="primary" dot>📖 ОТКРЫТАЯ ПЛАТФОРМА ЗНАНИЙ</UiBadge>
      <h1 class="landing-hero__title">
        Учись в 3 раза быстрее с <br />
        <span class="gradient-text">Lern Codex Platform</span>
      </h1>
      <p class="landing-hero__sub">
        Вся документация, справочники и уроки доступны <strong>совершенно бесплатно и без авторизации</strong>. 
        Войдите в личный кабинет, если хотите автоматически сохранять прогресс, накапливать Ударный Режим (Streak) и вести интервальное повторение Active Recall.
      </p>

      <div class="landing-hero__actions">
        <UiButton variant="primary" size="lg" @click="goToWorkspace">
          <template #icon-left>📖</template>
          Читать базу знаний бесплатно →
        </UiButton>
        <UiButton variant="secondary" size="lg" @click="goToAuth">
          <template #icon-left>🔐</template>
          Войти в Кабинет
        </UiButton>
      </div>
    </section>

    <!-- Public vs Member Access Comparison Grid -->
    <section class="landing-features">
      <div class="landing-section-header">
        <UiBadge variant="secondary">ДОСТУПНОСТЬ</UiBadge>
        <h2>Как устроена доступность платформы</h2>
        <p>Мы верим, что знания должны быть открыты каждому</p>
      </div>

      <div class="features-grid">
        <!-- Public Access Card -->
        <UiCard variant="glass" padding="lg">
          <div class="feature-card">
            <div class="feature-card__header">
              <span class="feature-card__icon">🌐</span>
              <div>
                <h3>Публичный доступ (Без авторизации)</h3>
                <span class="feature-card__tag feature-card__tag--free">Бесплатно для всех</span>
              </div>
            </div>
            <ul class="feature-card__list">
              <li>
                <span class="check-icon">✓</span>
                <span>Полный доступ ко всей документации и урокам</span>
              </li>
              <li>
                <span class="check-icon">✓</span>
                <span>Мгновенный живой поиск по статьям и тегам</span>
              </li>
              <li>
                <span class="check-icon">✓</span>
                <span>Просмотр примеров кода и интерактивных схем</span>
              </li>
              <li>
                <span class="check-icon">✓</span>
                <span>Тестирование UI Kit и переключение 7 тем</span>
              </li>
            </ul>
            <UiButton variant="secondary" style="width: 100%; margin-top: 1rem" @click="goToWorkspace">
              Открыть Справочник 🔍
            </UiButton>
          </div>
        </UiCard>

        <!-- Cabinet Access Card -->
        <UiCard variant="glow" padding="lg">
          <div class="feature-card">
            <div class="feature-card__header">
              <span class="feature-card__icon">🎯</span>
              <div>
                <h3>Личный Кабинет (После авторизации)</h3>
                <span class="feature-card__tag feature-card__tag--pro">Персональный прогресс</span>
              </div>
            </div>
            <ul class="feature-card__list">
              <li>
                <span class="check-icon">★</span>
                <span>Автоматическое сохранение % прочтения в Supabase</span>
              </li>
              <li>
                <span class="check-icon">★</span>
                <span>Запоминание самооценок Active Recall (🟢 / 🟡 / 🔴)</span>
              </li>
              <li>
                <span class="check-icon">★</span>
                <span>Ударный режим (Streak Days) и личные ачивки</span>
              </li>
              <li>
                <span class="check-icon">★</span>
                <span>Синхронизация между всеми вашими устройствами</span>
              </li>
            </ul>
            <UiButton variant="primary" style="width: 100%; margin-top: 1rem" @click="goToAuth">
              Войти или Создать Аккаунт ✨
            </UiButton>
          </div>
        </UiCard>
      </div>
    </section>

    <!-- Interactive Active Recall Flashcard Demo -->
    <section class="landing-demo">
      <div class="landing-section-header">
        <UiBadge variant="primary">ИНТЕРАКТИВНЫЙ ТРЕНАЖЁР</UiBadge>
        <h2>Попробуйте 3D Active Recall прямо сейчас</h2>
        <p>Нажмите на карточку ниже, чтобы развернуть её на 180° и узнать ответ</p>
      </div>

      <div class="landing-demo__container">
        <UiCard variant="glass" padding="lg">
          <InteractiveFlashcard :data="demoQuestion" @rate="onRateCard" />

          <div v-if="lastRatingResult" class="demo-result-alert">
            <UiAlert variant="success" title="Результат демо-оценки">
              {{ lastRatingResult }}
            </UiAlert>
          </div>
        </UiCard>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="landing-cta">
      <UiCard variant="clay" padding="lg">
        <div class="cta-box">
          <h2>Готовы погрузиться в знания? 🚀</h2>
          <p>Начните чтение любого справочника прямо сейчас. Без регистраций и SMS.</p>
          <div class="cta-box__buttons">
            <UiButton variant="primary" size="lg" @click="goToWorkspace">
              Перейти к Карте Знаний 🗺
            </UiButton>
          </div>
        </div>
      </UiCard>
    </section>
  </div>
</template>

<style scoped lang="scss">
.landing-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3.5rem 1.5rem 6rem;
  display: flex;
  flex-direction: column;
  gap: 5rem;
}

.landing-hero {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;

  &__title {
    font-size: 3.4rem;
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
    font-size: 1.25rem;
    color: var(--text-muted);
    max-width: 780px;
    line-height: 1.6;
  }

  &__actions {
    display: flex;
    gap: 1.25rem;
    margin-top: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
}

.landing-section-header {
  text-align: center;
  margin-bottom: 2.5rem;

  h2 {
    font-size: 2.1rem;
    font-weight: 800;
    margin: 0.5rem 0;
    color: var(--text-main);
  }

  p {
    color: var(--text-muted);
    font-size: 1.1rem;
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 2rem;
}

.feature-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  justify-content: space-between;

  &__header {
    display: flex;
    align-items: center;
    gap: 1rem;

    h3 {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
    }
  }

  &__icon {
    font-size: 2.2rem;
  }

  &__tag {
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: var(--radius-sm);
    margin-top: 0.2rem;

    &--free {
      background: var(--success);
      color: #fff;
    }

    &--pro {
      background: var(--primary);
      color: #fff;
    }
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;

    li {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      font-size: 1rem;
      color: var(--text-main);
      line-height: 1.4;
    }
  }
}

.check-icon {
  font-weight: 800;
  color: var(--primary);
}

.landing-demo {
  &__container {
    max-width: 800px;
    margin: 0 auto;
  }
}

.demo-result-alert {
  margin-top: 1.5rem;
}

.landing-cta {
  .cta-box {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    padding: 2rem 1rem;

    h2 {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--text-main);
    }

    p {
      font-size: 1.15rem;
      color: var(--text-muted);
    }

    &__buttons {
      margin-top: 0.5rem;
    }
  }
}
</style>