<script setup lang="ts">
// #region defineProps
interface Props {
  totalUsers: number
  studentsCount: number
  authorsCount: number
  adminsCount: number
  totalCourses: number
  publishedCourses: number
  totalChapters: number
  completedChapters: number
  masteredFlashcards: number
}

const props = defineProps<Props>()
// #endregion defineProps

const weekDays = [
  { day: 'Пн', visits: 142, height: 65 },
  { day: 'Вт', visits: 198, height: 85 },
  { day: 'Ср', visits: 240, height: 100 },
  { day: 'Чт', visits: 215, height: 90 },
  { day: 'Пт', visits: 180, height: 75 },
  { day: 'Сб', visits: 130, height: 55 },
  { day: 'Вс', visits: 160, height: 70 },
]
</script>

<template>
  <div class="admin-analytics-tab">
    <!-- Сетка ключевых метрик KPI -->
    <div class="analytics-kpi-grid">
      <div class="kpi-card kpi-card--users">
        <div class="kpi-card__header">
          <span class="kpi-icon">👥</span>
          <span class="kpi-title">Пользователи платформы</span>
        </div>
        <div class="kpi-card__value">{{ props.totalUsers }}</div>
        <div class="kpi-card__breakdown">
          <span>🎓 {{ props.studentsCount }} студентов</span>
          <span>✍️ {{ props.authorsCount }} авторов</span>
          <span>👑 {{ props.adminsCount }} админ</span>
        </div>
      </div>

      <div class="kpi-card kpi-card--courses">
        <div class="kpi-card__header">
          <span class="kpi-icon">📚</span>
          <span class="kpi-title">Курсы и дисциплины</span>
        </div>
        <div class="kpi-card__value">{{ props.totalCourses }}</div>
        <div class="kpi-card__breakdown">
          <span>✓ {{ props.publishedCourses }} опубликовано</span>
          <span>👁️ {{ props.totalCourses - props.publishedCourses }} черновиков</span>
        </div>
      </div>

      <div class="kpi-card kpi-card--chapters">
        <div class="kpi-card__header">
          <span class="kpi-icon">📖</span>
          <span class="kpi-title">Статьи и уроки Codex</span>
        </div>
        <div class="kpi-card__value">{{ props.totalChapters }}</div>
        <div class="kpi-card__breakdown">
          <span>⭐ {{ props.completedChapters }} изучено учениками</span>
        </div>
      </div>

      <div class="kpi-card kpi-card--recall">
        <div class="kpi-card__header">
          <span class="kpi-icon">⚡</span>
          <span class="kpi-title">Active Recall память</span>
        </div>
        <div class="kpi-card__value">{{ props.masteredFlashcards }}</div>
        <div class="kpi-card__breakdown">
          <span>🧠 3D-флешкарт выучено</span>
        </div>
      </div>
    </div>

    <!-- График активности и вовлеченности -->
    <div class="analytics-charts-grid">
      <div class="chart-box">
        <div class="chart-box__header">
          <h3 class="chart-box__title">Ежедневная активность изучения (Неделя)</h3>
          <span class="chart-box__badge">+24% к прошлой неделе</span>
        </div>

        <div class="bar-chart">
          <div
            v-for="item in weekDays"
            :key="item.day"
            class="bar-column"
          >
            <div class="bar-fill-wrap">
              <div
                class="bar-fill"
                :style="{ height: `${item.height}%` }"
              >
                <span class="bar-tooltip">{{ item.visits }} визитов</span>
              </div>
            </div>
            <span class="bar-label">{{ item.day }}</span>
          </div>
        </div>
      </div>

      <div class="chart-box">
        <div class="chart-box__header">
          <h3 class="chart-box__title">Распределение дисциплин по стеку</h3>
        </div>

        <div class="distribution-list">
          <div class="distribution-item">
            <div class="distribution-info">
              <span>Frontend (Vue 3, TypeScript, Vite)</span>
              <span>55%</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar progress-bar--frontend" style="width: 55%"></div>
            </div>
          </div>

          <div class="distribution-item">
            <div class="distribution-info">
              <span>Архитектура (FSD, Microfrontends)</span>
              <span>30%</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar progress-bar--arch" style="width: 30%"></div>
            </div>
          </div>

          <div class="distribution-item">
            <div class="distribution-info">
              <span>Backend & Базы данных (PostgreSQL)</span>
              <span>15%</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar progress-bar--backend" style="width: 15%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.admin-analytics-tab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.analytics-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.kpi-card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  transition: transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(99, 102, 241, 0.35);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__value {
    font-size: 2.25rem;
    font-weight: 800;
    color: #ffffff;
    line-height: 1;
  }

  &__breakdown {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #94a3b8;
  }
}

.kpi-icon {
  font-size: 1.25rem;
}

.kpi-title {
  font-size: 0.85rem;
  color: #94a3b8;
  font-weight: 600;
}

.analytics-charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 1.25rem;
}

.chart-box {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-size: 1rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }

  &__badge {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.6rem;
    border-radius: 6px;
  }
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 160px;
  padding-top: 1rem;
  gap: 0.5rem;
}

.bar-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-fill-wrap {
  flex: 1;
  width: 100%;
  max-width: 36px;
  display: flex;
  align-items: flex-end;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  position: relative;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #818cf8 0%, #6366f1 100%);
  border-radius: 8px;
  transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;

  &:hover .bar-tooltip {
    opacity: 1;
    transform: translateY(-8px);
  }
}

.bar-tooltip {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 10;
}

.bar-label {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
}

.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.distribution-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.distribution-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #cbd5e1;
  font-weight: 600;
}

.progress-track {
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 4px;

  &--frontend {
    background: #6366f1;
  }

  &--arch {
    background: #a855f7;
  }

  &--backend {
    background: #06b6d4;
  }
}
</style>
