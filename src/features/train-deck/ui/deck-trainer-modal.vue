<script setup lang="ts">
import { useDeckTrainer } from '../model/use-deck-trainer'

// #region defineProps
interface Props {
  courseId?: string
}

const props = withDefaults(defineProps<Props>(), {
  courseId: 'all',
})
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'close'): void
}>()
// #endregion defineEmits

// #region composable
const {
  cards,
  initialTotalCards,
  currentIndex,
  currentCard,
  isFlipped,
  isHintVisible,
  isLoading,
  isFinished,
  progressPercent,
  formattedTimer,
  sessionStats,
  combo,
  mistakeCards,
  isSoundMuted,
  toggleSound,
  flipCard,
  toggleHint,
  rateCard,
  restartSession,
  repeatMistakes,
} = useDeckTrainer({
  courseId: props.courseId,
  onClose: () => emit('close'),
})
// #endregion composable
</script>

<template>
  <div class="deck-trainer-overlay">
    <!-- Фоновые световые сферы -->
    <div class="deck-trainer__orb deck-trainer__orb--1"></div>
    <div class="deck-trainer__orb deck-trainer__orb--2"></div>

    <!-- Тонкий верхний прогресс-бар -->
    <div class="deck-trainer__progress-track">
      <div
        class="deck-trainer__progress-fill"
        :style="{ width: `${progressPercent}%` }"
      ></div>
    </div>

    <!-- Верхний хедер тренажера -->
    <header class="deck-trainer__header">
      <div class="deck-trainer__header-left">
        <span class="deck-trainer__logo">🧠 Active Recall Focus Mode</span>
        <span v-if="currentCard" class="deck-trainer__course-title">
          {{ currentCard.courseTitle }}
        </span>
      </div>

      <div class="deck-trainer__header-center">
        <!-- Индикатор комбо -->
        <div v-if="combo >= 2" class="combo-badge">
          <span class="combo-icon">🔥</span>
          <span class="combo-text">x{{ combo }} Комбо! (+{{ Math.min(25, (combo - 1) * 5) }} XP)</span>
        </div>

        <!-- Таймер сессии -->
        <div class="timer-badge">
          <span>⏱ {{ formattedTimer }}</span>
        </div>
      </div>

      <div class="deck-trainer__header-right">
        <span v-if="!isFinished" class="card-counter">
          {{ Math.min(currentIndex + 1, cards.length) }} / {{ initialTotalCards }}
        </span>
        <button
          type="button"
          class="btn-sound-toggle"
          :class="{ 'btn-sound-toggle--muted': isSoundMuted }"
          :title="isSoundMuted ? 'Включить тактильные звуки' : 'Выключить тактильные звуки'"
          @click="toggleSound"
        >
          <span class="sound-icon">{{ isSoundMuted ? '🔇' : '🔊' }}</span>
        </button>
        <button
          type="button"
          class="btn-close"
          title="Выйти из тренировки (Esc)"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>
    </header>

    <!-- Состояние загрузки -->
    <div v-if="isLoading" class="deck-trainer__loading">
      <div class="deck-spinner"></div>
      <span>Подготовка колоды Active Recall...</span>
    </div>

    <!-- Нет доступных карточек -->
    <div v-else-if="cards.length === 0" class="deck-trainer__empty">
      <div class="empty-icon">📭</div>
      <h2>В этом курсе пока нет карточек</h2>
      <p>Создайте 3D-флешкарты в Студии автора, чтобы тренировать память.</p>
      <button type="button" class="btn-primary" @click="emit('close')">
        Вернуться назад
      </button>
    </div>

    <!-- Экран завершения сессии (Results Screen) -->
    <div v-else-if="isFinished" class="deck-trainer__summary">
      <div class="summary-card">
        <div class="summary-card__trophy">🏆</div>
        <h2 class="summary-card__title">Сессия тренировки завершена!</h2>
        <p class="summary-card__subtitle">
          Отличная работа по закреплению долговременной памяти.
        </p>

        <!-- Начисленный XP -->
        <div class="xp-gain-badge">
          <span class="xp-star">⭐</span>
          <span class="xp-val">+{{ sessionStats.earnedXp }} XP</span>
          <span class="xp-note">начислено в профиль</span>
        </div>

        <!-- Сетка статистики сессии -->
        <div class="summary-stats-grid">
          <div class="stat-pill stat-pill--known">
            <span class="stat-num">{{ sessionStats.knownCount }}</span>
            <span class="stat-lbl">🟢 Выучено</span>
          </div>

          <div class="stat-pill stat-pill--doubt">
            <span class="stat-num">{{ sessionStats.doubtCount }}</span>
            <span class="stat-lbl">🟡 С сомнением</span>
          </div>

          <div class="stat-pill stat-pill--repeat">
            <span class="stat-num">{{ sessionStats.repeatCount }}</span>
            <span class="stat-lbl">🔴 На повторение</span>
          </div>

          <div class="stat-pill stat-pill--combo">
            <span class="stat-num">x{{ sessionStats.maxCombo }}</span>
            <span class="stat-lbl">🔥 Макс. комбо</span>
          </div>
        </div>

        <!-- Кнопки действий -->
        <div class="summary-actions">
          <button
            v-if="mistakeCards.length > 0"
            type="button"
            class="btn-repeat-mistakes"
            @click="repeatMistakes"
          >
            🔄 Повторить сложные карточки ({{ mistakeCards.length }})
          </button>

          <button
            type="button"
            class="btn-restart"
            @click="restartSession"
          >
            ⚡ Запустить заново
          </button>

          <button
            type="button"
            class="btn-finish"
            @click="emit('close')"
          >
            ✓ Завершить и выйти
          </button>
        </div>
      </div>
    </div>

    <!-- Основная тренировочная область (3D Card) -->
    <main v-else-if="currentCard" class="deck-trainer__main">
      <div class="flashcard-container" :class="{ 'flashcard-container--flipped': isFlipped }">
        <div class="flashcard-card" @click="flipCard">
          <!-- ЛИЦЕВАЯ СТОРОНА: Вопрос -->
          <div class="flashcard-face flashcard-face--front">
            <div class="face-header">
              <span class="badge-cat">
                📂 {{ currentCard.flashcard.category || currentCard.docTitle }}
              </span>
              <span
                class="badge-difficulty"
                :class="`badge-difficulty--${currentCard.flashcard.difficulty}`"
              >
                {{
                  currentCard.flashcard.difficulty === 'hard'
                    ? '⚡ Сложно'
                    : currentCard.flashcard.difficulty === 'easy'
                    ? '🌱 Легко'
                    : '⚖️ Средне'
                }}
              </span>
            </div>

            <div class="face-body">
              <span class="face-question-label">ВОПРОС:</span>
              <h3 class="face-question">{{ currentCard.flashcard.question }}</h3>

              <!-- Раскрывающаяся подсказка -->
              <div v-if="currentCard.flashcard.hint" class="hint-block" @click.stop>
                <button
                  type="button"
                  class="btn-hint"
                  @click="toggleHint"
                >
                  <span>💡 {{ isHintVisible ? 'Скрыть подсказку' : 'Показать подсказку (H)' }}</span>
                </button>
                <p v-if="isHintVisible" class="hint-text">
                  {{ currentCard.flashcard.hint }}
                </p>
              </div>
            </div>

            <div class="face-footer">
              <button
                type="button"
                class="btn-flip"
                @click.stop="flipCard"
              >
                <span>Перевернуть карточку</span>
                <span class="key-hint">[ Пробел ]</span>
              </button>
            </div>
          </div>

          <!-- ОБОРОТНАЯ СТОРОНА: Ответ & Самооценка -->
          <div class="flashcard-face flashcard-face--back" @click.stop>
            <div class="face-header">
              <span class="badge-cat">
                💡 Ответ & Академическое пояснение
              </span>
              <button type="button" class="btn-flip-back" @click="flipCard">
                ↺ К вопросу
              </button>
            </div>

            <div class="face-body face-body--answer">
              <span class="face-question-preview">{{ currentCard.flashcard.question }}</span>
              <div class="face-answer-box">
                <p class="face-answer">{{ currentCard.flashcard.answer }}</p>
              </div>
            </div>

            <div class="face-footer face-footer--ratings">
              <div class="rating-buttons-group">
                <button
                  type="button"
                  class="btn-rate btn-rate--repeat"
                  title="Отправить карточку в конец колоды для повторения (Клавиша 1)"
                  @click="rateCard('repeat')"
                >
                  <span class="rate-icon">🔴</span>
                  <div class="rate-text">
                    <span class="rate-label">Повторить</span>
                    <span class="rate-key">[ 1 ]</span>
                  </div>
                </button>

                <button
                  type="button"
                  class="btn-rate btn-rate--doubt"
                  title="Вспомнил с трудом (Клавиша 2)"
                  @click="rateCard('doubt')"
                >
                  <span class="rate-icon">🟡</span>
                  <div class="rate-text">
                    <span class="rate-label">Сомневаюсь</span>
                    <span class="rate-key">[ 2 ]</span>
                  </div>
                </button>

                <button
                  type="button"
                  class="btn-rate btn-rate--know"
                  title="Отлично знаю материал (Клавиша 3)"
                  @click="rateCard('know')"
                >
                  <span class="rate-icon">🟢</span>
                  <div class="rate-text">
                    <span class="rate-label">Знаю! (+25 XP)</span>
                    <span class="rate-key">[ 3 ]</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Подсказка с горячими клавишами -->
      <footer class="deck-trainer__hotkeys">
        <span>Горячие клавиши:</span>
        <kbd>Пробел</kbd> — перевернуть •
        <kbd>1</kbd> — повторить •
        <kbd>2</kbd> — сомневаюсь •
        <kbd>3</kbd> — знаю •
        <kbd>H</kbd> — подсказка •
        <kbd>Esc</kbd> — выход
      </footer>
    </main>
  </div>
</template>

<style scoped lang="scss">
.deck-trainer-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: radial-gradient(circle at 50% 20%, #15192c 0%, #070911 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #f8fafc;
}

.deck-trainer__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.35;
  pointer-events: none;

  &--1 {
    width: 500px;
    height: 500px;
    background: #6366f1;
    top: -100px;
    left: 20%;
  }

  &--2 {
    width: 450px;
    height: 450px;
    background: #a855f7;
    bottom: -100px;
    right: 20%;
  }
}

.deck-trainer__progress-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  position: relative;
  z-index: 10;
}

.deck-trainer__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #34d399 100%);
  transition: width 0.4s ease;
}

.deck-trainer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 2rem;
  position: relative;
  z-index: 10;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(16px);
}

.deck-trainer__header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.deck-trainer__logo {
  font-size: 0.85rem;
  font-weight: 700;
  color: #a5b4fc;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.deck-trainer__course-title {
  font-size: 0.85rem;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.06);
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
}

.deck-trainer__header-center {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.combo-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%);
  border: 1px solid rgba(245, 158, 11, 0.5);
  color: #fef08a;
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.8rem;
  animation: pulse-combo 1.5s infinite;
}

@keyframes pulse-combo {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.timer-badge {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #cbd5e1;
  font-family: monospace;
}

.deck-trainer__header-right {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.card-counter {
  font-size: 0.95rem;
  font-weight: 700;
  color: #cbd5e1;
}

.btn-sound-toggle {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #cbd5e1;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;

  &:hover {
    background: rgba(99, 102, 241, 0.25);
    border-color: rgba(129, 140, 248, 0.5);
    transform: scale(1.08);
  }

  &--muted {
    opacity: 0.55;
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.08);

    &:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.2);
    }
  }

  .sound-icon {
    display: inline-block;
    line-height: 1;
    user-select: none;
  }
}

.btn-close {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #cbd5e1;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.4);
    color: #ffffff;
  }
}

.deck-trainer__loading,
.deck-trainer__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  text-align: center;
  color: #cbd5e1;
}

.deck-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ОСНОВНОЙ РАБОЧИЙ МАКЕТ */
.deck-trainer__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  position: relative;
  z-index: 10;
}

.flashcard-container {
  width: 100%;
  max-width: 680px;
  height: 440px;
  perspective: 1200px;
}

.flashcard-card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}

.flashcard-container--flipped .flashcard-card {
  transform: rotateY(180deg);
}

.flashcard-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 24px;
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.2);

  &--front {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%);
    border: 1px solid rgba(99, 102, 241, 0.35);
  }

  &--back {
    background: linear-gradient(135deg, rgba(30, 27, 75, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
    border: 1px solid rgba(168, 85, 247, 0.4);
    transform: rotateY(180deg);
    cursor: default;
  }
}

.face-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.badge-cat {
  font-size: 0.85rem;
  font-weight: 600;
  color: #a5b4fc;
}

.badge-difficulty {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 8px;

  &--hard {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
  }
  &--medium {
    background: rgba(245, 158, 11, 0.15);
    color: #fbbf24;
  }
  &--easy {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
  }
}

.face-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: auto 0;

  &--answer {
    gap: 0.75rem;
  }
}

.face-question-label {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #818cf8;
}

.face-question {
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.4;
  color: #ffffff;
  margin: 0;
}

.face-question-preview {
  font-size: 0.9rem;
  color: #94a3b8;
  font-weight: 500;
}

.face-answer-box {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.25rem;
  border-radius: 14px;
  max-height: 180px;
  overflow-y: auto;
}

.face-answer {
  font-size: 1.05rem;
  line-height: 1.55;
  color: #f1f5f9;
  margin: 0;
}

.hint-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-hint {
  align-self: flex-start;
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  color: #cbd5e1;
  font-size: 0.8rem;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    border-color: #facc15;
    color: #fef08a;
  }
}

.hint-text {
  font-size: 0.85rem;
  color: #fef08a;
  background: rgba(234, 179, 8, 0.1);
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  margin: 0;
}

.face-footer {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-flip {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.75rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(99, 102, 241, 0.55);
  }
}

.btn-flip-back {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.8rem;
  cursor: pointer;

  &:hover {
    color: #ffffff;
  }
}

.key-hint {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* Кнопки оценки карточки */
.rating-buttons-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;
  width: 100%;
}

.btn-rate {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;

  .rate-text {
    display: flex;
    flex-direction: column;
    text-align: left;
  }

  .rate-label {
    font-size: 0.9rem;
    font-weight: 700;
  }

  .rate-key {
    font-size: 0.7rem;
    opacity: 0.75;
  }

  &--repeat {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.35);
    color: #fca5a5;

    &:hover {
      background: #ef4444;
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(239, 68, 68, 0.4);
    }
  }

  &--doubt {
    background: rgba(245, 158, 11, 0.15);
    border-color: rgba(245, 158, 11, 0.35);
    color: #fef08a;

    &:hover {
      background: #f59e0b;
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(245, 158, 11, 0.4);
    }
  }

  &--know {
    background: rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.35);
    color: #86efac;

    &:hover {
      background: #10b981;
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.4);
    }
  }
}

.deck-trainer__hotkeys {
  margin-top: 1.5rem;
  font-size: 0.8rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  kbd {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    color: #cbd5e1;
    font-size: 0.75rem;
    font-family: inherit;
  }
}

/* ЭКРАН ИТОГОВ */
.deck-trainer__summary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  position: relative;
  z-index: 10;
}

.summary-card {
  width: 100%;
  max-width: 540px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(99, 102, 241, 0.35);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6), 0 0 50px rgba(99, 102, 241, 0.25);

  &__trophy {
    font-size: 3.5rem;
    margin-bottom: 0.5rem;
    animation: bounce 1.5s infinite alternate ease-in-out;
  }

  &__title {
    font-size: 1.6rem;
    font-weight: 800;
    color: #ffffff;
    margin: 0;
  }

  &__subtitle {
    font-size: 0.9rem;
    color: #94a3b8;
    margin: 0.5rem 0 1.5rem;
  }
}

@keyframes bounce {
  to { transform: translateY(-8px); }
}

.xp-gain-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.25) 100%);
  border: 1px solid rgba(168, 85, 247, 0.4);
  padding: 0.6rem 1.25rem;
  border-radius: 20px;
  margin-bottom: 1.5rem;

  .xp-val {
    font-size: 1.25rem;
    font-weight: 800;
    color: #fef08a;
  }

  .xp-note {
    font-size: 0.8rem;
    color: #cbd5e1;
  }
}

.summary-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  width: 100%;
  margin-bottom: 2rem;
}

.stat-pill {
  display: flex;
  flex-direction: column;
  padding: 0.85rem 0.5rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);

  .stat-num {
    font-size: 1.25rem;
    font-weight: 800;
    color: #ffffff;
  }

  .stat-lbl {
    font-size: 0.7rem;
    color: #94a3b8;
    margin-top: 0.2rem;
  }

  &--known .stat-num { color: #34d399; }
  &--doubt .stat-num { color: #fbbf24; }
  &--repeat .stat-num { color: #f87171; }
  &--combo .stat-num { color: #a855f7; }
}

.summary-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.btn-repeat-mistakes {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  padding: 0.8rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    background: #ef4444;
    color: #ffffff;
  }
}

.btn-restart {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
  padding: 0.8rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
}

.btn-finish {
  background: #6366f1;
  color: #ffffff;
  border: none;
  padding: 0.85rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);

  &:hover {
    background: #4f46e5;
  }
}
</style>
