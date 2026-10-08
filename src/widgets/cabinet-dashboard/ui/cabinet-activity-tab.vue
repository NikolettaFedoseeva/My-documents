<script setup lang="ts">
import { ref, computed } from 'vue'
import { UiActivityCalendar, UiXpChart } from 'lern-ui-kit'
import type { ActivityDay, XpDataPoint, XpChartPeriod } from 'lern-ui-kit'
import { useDocProgressStore } from '@/entities/doc'

// #region defineProps
interface Props {
  currentStreak?: number
  totalXp?: number
}

const props = withDefaults(defineProps<Props>(), {
  currentStreak: 12,
  totalXp: 1250,
})
// #endregion defineProps

const progressStore = useDocProgressStore()

// #region refs
const selectedCalendarDay = ref<ActivityDay | null>(null)
const selectedChartPoint = ref<XpDataPoint | null>(null)
const activeChartPeriod = ref<XpChartPeriod>('30d')
// #endregion refs

// #region Генерация истории активности для календаря
const activityDays = computed<ActivityDay[]>(() => {
  const list: ActivityDay[] = []
  const today = new Date()
  const streak = Math.max(props.currentStreak, progressStore.streakDays || 1)

  // Генерируем данные за последние 180 дней
  for (let i = 180; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]

    // Активность: в дни текущего стрика гарантированно активны
    const isStreakDay = i < streak
    // В остальные дни псевдослучайная активность для реалистичного графика
    const pseudoRand = (d.getFullYear() * 31 + d.getMonth() * 12 + d.getDate() * 7) % 10
    const isActive = isStreakDay || pseudoRand > 4

    let count = 0
    let xp = 0
    let details: string[] | undefined

    if (isActive) {
      if (isStreakDay) {
        count = ((d.getDate() * 3) % 9) + 3 // 3..11 действий
      } else {
        count = (pseudoRand % 6) + 1
      }

      xp = count * 25
      const possibleEvents = [
        'Изучена глава курса Bookish Codex',
        'Тренировка памяти 3D Active Recall',
        'Экспресс-тест самопроверки пройден',
        'Сдано практическое задание на проверку',
        'Достигнуто комбо серии 🔥 x3 Combo',
      ]
      details = possibleEvents.slice(0, Math.min(3, count))
    }

    list.push({
      date: dateStr,
      count,
      xp,
      details,
    })
  }

  return list
})
// #endregion

// #region Генерация точек для графика XP
const xpHistoryData = computed<XpDataPoint[]>(() => {
  const points: XpDataPoint[] = []
  const today = new Date()
  const daysCount = activeChartPeriod.value === '7d' ? 7 : (activeChartPeriod.value === '30d' ? 30 : 90)

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const shortLabel = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`

    // Разброс набранного опыта
    const factor = (d.getDate() * 13 + d.getMonth() * 7) % 7
    const dayXp = factor === 0 ? 30 : factor * 45 + (i < 5 ? 120 : 40)

    points.push({
      date: dateStr,
      label: shortLabel,
      xp: dayXp,
      meta: dayXp > 150 ? '🚀 Ударный день (+лабораторная)' : 'Изучение глав и флешкарт',
    })
  }

  return points
})
// #endregion

// #region Функции
const onSelectDay = (day: ActivityDay) => {
  selectedCalendarDay.value = day
}

const onSelectPoint = (point: XpDataPoint) => {
  selectedChartPoint.value = point
}
// #endregion Функции
</script>

<template>
  <div class="cabinet-activity-tab">
    <!-- Секция 1: GitHub-style Календарь стриков активности -->
    <section class="activity-section">
      <UiActivityCalendar
        :days="activityDays"
        title="🗓️ Календарь учебной активности"
        subtitle="Непрерывные стрики занятий, изучение глав и тренировки памяти"
        color-scheme="green"
        :current-streak="props.currentStreak"
        :longest-streak="Math.max(props.currentStreak, 28)"
        @select-day="onSelectDay"
      />

      <!-- Подробности выбранного дня -->
      <transition name="fade">
        <div v-if="selectedCalendarDay" class="selected-day-card">
          <div class="selected-day-card__header">
            <span class="day-date">📅 {{ selectedCalendarDay.date }}</span>
            <span class="day-badge" :class="{ 'day-badge--active': selectedCalendarDay.count > 0 }">
              {{ selectedCalendarDay.count > 0 ? `Активность: ${selectedCalendarDay.count} действий` : 'Нет активности' }}
            </span>
            <span v-if="selectedCalendarDay.xp" class="day-xp">+{{ selectedCalendarDay.xp }} XP</span>
          </div>

          <div v-if="selectedCalendarDay.details && selectedCalendarDay.details.length > 0" class="day-details-list">
            <span class="details-title">Выполненные занятия:</span>
            <ul>
              <li v-for="(act, i) in selectedCalendarDay.details" :key="i">
                ✓ {{ act }}
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </section>

    <!-- Секция 2: Интерактивный график набора опыта (XP) -->
    <section class="activity-section">
      <UiXpChart
        :data="xpHistoryData"
        title="📈 Динамика набора опыта (XP)"
        subtitle="Аналитика заработанных очков за прохождение глав, лабораторных и флешкарт"
        color="indigo"
        chart-type="area"
        :period="activeChartPeriod"
        @update:period="activeChartPeriod = $event"
        @select-point="onSelectPoint"
      />

      <!-- Информация о выбранной точке графика -->
      <transition name="fade">
        <div v-if="selectedChartPoint" class="selected-point-card">
          <span class="point-icon">⚡</span>
          <div class="point-info">
            <span class="point-date">{{ selectedChartPoint.date }}</span>
            <span class="point-val">+{{ selectedChartPoint.xp }} XP</span>
            <span v-if="selectedChartPoint.meta" class="point-meta">{{ selectedChartPoint.meta }}</span>
          </div>
        </div>
      </transition>
    </section>
  </div>
</template>

<style scoped lang="scss">
.cabinet-activity-tab {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
}

.activity-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

// Карточка выбранного дня календаря
.selected-day-card {
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);

  &__header {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;

    .day-date {
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-text-main, #0f172a);
    }

    .day-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      background: var(--color-bg-alt, #f1f5f9);
      color: var(--color-text-muted, #64748b);

      &--active {
        background: rgba(34, 197, 94, 0.15);
        color: #16a34a;
      }
    }

    .day-xp {
      font-size: 0.85rem;
      font-weight: 800;
      color: #22c55e;
      margin-left: auto;
    }
  }

  .day-details-list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    .details-title {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-text-muted, #64748b);
    }

    ul {
      margin: 0;
      padding-left: 1.2rem;
      font-size: 0.8125rem;
      color: var(--color-text-main, #334155);

      li {
        margin-bottom: 0.25rem;
      }
    }
  }
}

// Карточка выбранной точки графика
.selected-point-card {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  align-self: flex-start;

  .point-icon {
    font-size: 1.5rem;
  }

  .point-info {
    display: flex;
    flex-direction: column;

    .point-date {
      font-size: 0.75rem;
      color: var(--color-text-muted, #64748b);
    }

    .point-val {
      font-size: 1.1rem;
      font-weight: 800;
      color: #6366f1;
    }

    .point-meta {
      font-size: 0.75rem;
      color: #94a3b8;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
