<script setup lang="ts">
import { ref, computed } from 'vue'
import { AssignmentItem, CourseApiService } from '@/entities/course'
import { useDocProgressStore } from '@/entities/doc'

// #region defineProps
interface Props {
  assignments: AssignmentItem[]
}

const props = defineProps<Props>()
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'update:assignments', updated: AssignmentItem[]): void
}>()
// #endregion defineEmits

// #region Store
const progressStore = useDocProgressStore()
// #endregion Store

// #region refs
const activeFilter = ref<'all' | 'pending' | 'review' | 'passed' | 'rejected'>('all')
const searchQuery = ref<string>('')
const localAssignments = ref<AssignmentItem[]>([...props.assignments])

// Модалка сдачи задания
const isSubmitModalOpen = ref<boolean>(false)
const selectedAssignment = ref<AssignmentItem | null>(null)
const submitType = ref<'repo' | 'code'>('repo')
const submitRepoUrl = ref<string>('')
const submitCode = ref<string>('')
const submitNotes = ref<string>('')
const isSubmitting = ref<boolean>(false)

// Модалка быстрой проверки ментором
const isGradeModalOpen = ref<boolean>(false)
const gradeStatus = ref<'passed' | 'rejected'>('passed')
const gradeScore = ref<number>(95)
const gradeComment = ref<string>('Отличное решение! Задание зачтено.')
const isGrading = ref<boolean>(false)
// #endregion refs

// #region computed
const stats = computed(() => {
  const total = localAssignments.value.length
  const passed = localAssignments.value.filter((a) => a.status === 'passed').length
  const review = localAssignments.value.filter((a) => a.status === 'review').length
  const pending = localAssignments.value.filter((a) => a.status === 'pending').length
  const rejected = localAssignments.value.filter((a) => a.status === 'rejected').length
  const totalXpEarned = localAssignments.value
    .filter((a) => a.status === 'passed')
    .reduce((acc, a) => acc + (a.xpReward || 0), 0)

  return { total, passed, review, pending, rejected, totalXpEarned }
})

const filteredAssignments = computed(() => {
  return localAssignments.value.filter((item) => {
    const matchesFilter =
      activeFilter.value === 'all' || item.status === activeFilter.value

    const matchesSearch =
      !searchQuery.value ||
      item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.courseTitle.toLowerCase().includes(searchQuery.value.toLowerCase())

    return matchesFilter && matchesSearch
  })
})
// #endregion computed

// #region Функции
const openSubmitModal = (assignment: AssignmentItem) => {
  selectedAssignment.value = assignment
  submitRepoUrl.value = assignment.submission?.repoUrl || ''
  submitCode.value = assignment.submission?.code || ''
  submitNotes.value = assignment.submission?.notes || ''
  submitType.value = assignment.submission?.code ? 'code' : 'repo'
  isSubmitModalOpen.value = true
}

const closeSubmitModal = () => {
  isSubmitModalOpen.value = false
  selectedAssignment.value = null
}

const handleAssignmentSubmit = async () => {
  if (!selectedAssignment.value) return

  isSubmitting.value = true
  try {
    const updated = await CourseApiService.submitAssignment(selectedAssignment.value.id, {
      repoUrl: submitType.value === 'repo' ? submitRepoUrl.value.trim() : undefined,
      code: submitType.value === 'code' ? submitCode.value.trim() : undefined,
      notes: submitNotes.value.trim(),
    })

    const index = localAssignments.value.findIndex((a) => a.id === updated.id)
    if (index !== -1) {
      localAssignments.value[index] = updated
    }
    emit('update:assignments', [...localAssignments.value])
    closeSubmitModal()
  } catch (err) {
    console.error('Ошибка отправки задания:', err)
  } finally {
    isSubmitting.value = false
  }
}

const openGradeModal = (assignment: AssignmentItem) => {
  selectedAssignment.value = assignment
  gradeStatus.value = 'passed'
  gradeScore.value = 95
  gradeComment.value = 'Отличная реализация! Все требования лабораторной соблюдены.'
  isGradeModalOpen.value = true
}

const closeGradeModal = () => {
  isGradeModalOpen.value = false
  selectedAssignment.value = null
}

const handleGradeSubmit = async () => {
  if (!selectedAssignment.value) return

  isGrading.value = true
  try {
    const updated = await CourseApiService.gradeAssignment(selectedAssignment.value.id, {
      status: gradeStatus.value,
      score: gradeScore.value,
      comment: gradeComment.value,
    })

    const index = localAssignments.value.findIndex((a) => a.id === updated.id)
    if (index !== -1) {
      localAssignments.value[index] = updated
    }

    if (gradeStatus.value === 'passed' && selectedAssignment.value.xpReward) {
      progressStore.addBonusXp(selectedAssignment.value.xpReward)
    }

    emit('update:assignments', [...localAssignments.value])
    closeGradeModal()
  } catch (err) {
    console.error('Ошибка оценивания задания:', err)
  } finally {
    isGrading.value = false
  }
}
// #endregion Функции
</script>

<template>
  <div class="cabinet-assignments-tab">
    <!-- Шапка раздела и KPI -->
    <div class="cabinet-assignments-tab__header">
      <div>
        <h3 class="cabinet-assignments-tab__title">Практические задания и Лабораторные</h3>
        <p class="cabinet-assignments-tab__subtitle">
          Закрепляйте теорию на практике, сдавайте код на ревью менторам и получайте опыт платформы.
        </p>
      </div>

      <div class="cabinet-assignments-tab__xp-pill">
        <span class="cabinet-assignments-tab__xp-icon">⚡</span>
        <div class="cabinet-assignments-tab__xp-info">
          <span class="cabinet-assignments-tab__xp-val">+{{ stats.totalXpEarned }} XP</span>
          <span class="cabinet-assignments-tab__xp-lbl">Заработано за практику</span>
        </div>
      </div>
    </div>

    <!-- Фильтры и строка поиска -->
    <div class="cabinet-assignments-tab__toolbar">
      <div class="cabinet-assignments-tab__filters">
        <button
          type="button"
          class="filter-btn"
          :class="{ 'filter-btn--active': activeFilter === 'all' }"
          @click="activeFilter = 'all'"
        >
          Все ({{ stats.total }})
        </button>
        <button
          type="button"
          class="filter-btn"
          :class="{ 'filter-btn--active': activeFilter === 'pending' }"
          @click="activeFilter = 'pending'"
        >
          ✏️ К сдаче ({{ stats.pending }})
        </button>
        <button
          type="button"
          class="filter-btn filter-btn--review"
          :class="{ 'filter-btn--active': activeFilter === 'review' }"
          @click="activeFilter = 'review'"
        >
          ⏳ На проверке ({{ stats.review }})
        </button>
        <button
          type="button"
          class="filter-btn filter-btn--passed"
          :class="{ 'filter-btn--active': activeFilter === 'passed' }"
          @click="activeFilter = 'passed'"
        >
          ✓ Принято ({{ stats.passed }})
        </button>
        <button
          v-if="stats.rejected > 0"
          type="button"
          class="filter-btn filter-btn--rejected"
          :class="{ 'filter-btn--active': activeFilter === 'rejected' }"
          @click="activeFilter = 'rejected'"
        >
          ✕ Доработка ({{ stats.rejected }})
        </button>
      </div>

      <div class="cabinet-assignments-tab__search">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск задания или курса..."
          class="search-input"
        />
      </div>
    </div>

    <!-- Список заданий -->
    <div v-if="filteredAssignments.length > 0" class="cabinet-assignments-tab__list">
      <div
        v-for="item in filteredAssignments"
        :key="item.id"
        class="assignment-card"
        :class="`assignment-card--${item.status}`"
      >
        <!-- Верхняя плашка карточки -->
        <div class="assignment-card__head">
          <div class="assignment-card__meta">
            <span class="assignment-card__course">{{ item.courseTitle }}</span>
            <span
              v-if="item.type === 'lab'"
              class="assignment-card__type-badge assignment-card__type-badge--lab"
            >
              🧪 Лабораторная
            </span>
            <span
              v-else-if="item.type === 'project'"
              class="assignment-card__type-badge assignment-card__type-badge--project"
            >
              🚀 Проект
            </span>
            <span
              v-else
              class="assignment-card__type-badge"
            >
              📝 Тест
            </span>
          </div>

          <div class="assignment-card__badges">
            <span v-if="item.xpReward" class="assignment-card__reward">
              ⚡ +{{ item.xpReward }} XP
            </span>

            <span
              v-if="item.status === 'passed'"
              class="status-badge status-badge--passed"
            >
              ✓ Принято ({{ item.score }}/{{ item.maxScore }})
            </span>
            <span
              v-else-if="item.status === 'review'"
              class="status-badge status-badge--review"
            >
              ⏳ На проверке
            </span>
            <span
              v-else-if="item.status === 'rejected'"
              class="status-badge status-badge--rejected"
            >
              ✕ Требует правок
            </span>
            <span
              v-else
              class="status-badge status-badge--pending"
            >
              ✏️ Не сдано
            </span>
          </div>
        </div>

        <!-- Контент задания -->
        <h4 class="assignment-card__title">{{ item.title }}</h4>
        <p v-if="item.description" class="assignment-card__desc">
          {{ item.description }}
        </p>

        <!-- Требования -->
        <div v-if="item.requirements && item.requirements.length > 0" class="assignment-card__reqs">
          <span class="assignment-card__reqs-label">Ключевые критерии:</span>
          <ul class="assignment-card__reqs-list">
            <li v-for="(req, rIdx) in item.requirements" :key="rIdx">
              {{ req }}
            </li>
          </ul>
        </div>

        <!-- Информация о сданной работе -->
        <div v-if="item.submission" class="assignment-card__sub-box">
          <div class="assignment-card__sub-header">
            <span class="sub-icon">📦</span>
            <span class="sub-label">Сдано решение ({{ item.submittedAt }}):</span>
          </div>

          <div v-if="item.submission.repoUrl" class="assignment-card__sub-link">
            <span>Репозиторий:</span>
            <a :href="item.submission.repoUrl" target="_blank" rel="noopener noreferrer">
              {{ item.submission.repoUrl }} ↗
            </a>
          </div>

          <p v-if="item.submission.notes" class="assignment-card__sub-notes">
            «{{ item.submission.notes }}»
          </p>
        </div>

        <!-- Фидбек ментора -->
        <div v-if="item.mentorFeedback" class="mentor-bubble">
          <div class="mentor-bubble__head">
            <span class="mentor-bubble__author">👨‍🏫 {{ item.mentorFeedback.reviewerName }}</span>
            <span class="mentor-bubble__date">{{ item.mentorFeedback.reviewedAt }}</span>
          </div>
          <p class="mentor-bubble__text">
            {{ item.mentorFeedback.comment }}
          </p>
        </div>

        <!-- Кнопки действий -->
        <div class="assignment-card__actions">
          <button
            v-if="item.status === 'pending' || item.status === 'rejected'"
            type="button"
            class="action-btn action-btn--submit"
            @click="openSubmitModal(item)"
          >
            {{ item.status === 'rejected' ? 'Внести правки и пересдать 🔁' : 'Сдать решение на проверку 🚀' }}
          </button>

          <button
            v-if="item.status === 'review'"
            type="button"
            class="action-btn action-btn--edit"
            @click="openSubmitModal(item)"
          >
            Обновить отправленное решение ✏️
          </button>

          <!-- Кнопка быстрой проверки (удобно для тестирования роли автора/ментора) -->
          <button
            type="button"
            class="action-btn action-btn--mentor"
            title="Протестировать оценку ментора"
            @click="openGradeModal(item)"
          >
            🎓 Оценить как ментор
          </button>
        </div>
      </div>
    </div>

    <!-- Заглушка при отсутствии заданий -->
    <div v-else class="cabinet-assignments-tab__empty">
      <span class="empty-icon">📂</span>
      <h4>Заданий по выбранному фильтру не найдено</h4>
      <p>Попробуйте выбрать другой фильтр или сбросить поисковый запрос.</p>
    </div>

    <!-- Модальное окно сдачи решения -->
    <div v-if="isSubmitModalOpen && selectedAssignment" class="modal-overlay" @click.self="closeSubmitModal">
      <div class="modal-card">
        <div class="modal-card__header">
          <div>
            <span class="modal-card__badge">{{ selectedAssignment.courseTitle }}</span>
            <h3 class="modal-card__title">{{ selectedAssignment.title }}</h3>
          </div>
          <button type="button" class="modal-card__close" @click="closeSubmitModal">✕</button>
        </div>

        <div class="modal-card__body">
          <div class="type-selector">
            <button
              type="button"
              class="type-tab"
              :class="{ 'type-tab--active': submitType === 'repo' }"
              @click="submitType = 'repo'"
            >
              🔗 Ссылка на GitHub / Репозиторий
            </button>
            <button
              type="button"
              class="type-tab"
              :class="{ 'type-tab--active': submitType === 'code' }"
              @click="submitType = 'code'"
            >
              💻 Исходный код решения
            </button>
          </div>

          <div v-if="submitType === 'repo'" class="form-group">
            <label class="form-label">Ссылка на Git-репозиторий (GitHub, GitLab):</label>
            <input
              v-model="submitRepoUrl"
              type="url"
              placeholder="https://github.com/username/project-repo"
              class="form-input"
            />
            <span class="form-hint">Убедитесь, что репозиторий открыт для чтения ментором.</span>
          </div>

          <div v-else class="form-group">
            <label class="form-label">Исходный код решения:</label>
            <textarea
              v-model="submitCode"
              rows="6"
              placeholder="// Вставьте ключевой исходный код решения..."
              class="form-textarea form-textarea--code"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Комментарии и вопросы для проверяющего ментора:</label>
            <textarea
              v-model="submitNotes"
              rows="2"
              placeholder="На что обратить внимание, возникшие трудности или принятые архитектурные решения..."
              class="form-textarea"
            />
          </div>
        </div>

        <div class="modal-card__footer">
          <button type="button" class="modal-btn modal-btn--secondary" @click="closeSubmitModal">
            Отмена
          </button>
          <button
            type="button"
            class="modal-btn modal-btn--primary"
            :disabled="isSubmitting || (submitType === 'repo' && !submitRepoUrl) || (submitType === 'code' && !submitCode)"
            @click="handleAssignmentSubmit"
          >
            {{ isSubmitting ? 'Отправка...' : 'Отправить на проверку 🚀' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно быстрой оценки ментором -->
    <div v-if="isGradeModalOpen && selectedAssignment" class="modal-overlay" @click.self="closeGradeModal">
      <div class="modal-card">
        <div class="modal-card__header">
          <div>
            <span class="modal-card__badge modal-card__badge--mentor">Кабинет Ментора</span>
            <h3 class="modal-card__title">Оценка: {{ selectedAssignment.title }}</h3>
          </div>
          <button type="button" class="modal-card__close" @click="closeGradeModal">✕</button>
        </div>

        <div class="modal-card__body">
          <div class="form-group">
            <label class="form-label">Вердикт:</label>
            <div class="verdict-switcher">
              <button
                type="button"
                class="verdict-btn"
                :class="{ 'verdict-btn--passed': gradeStatus === 'passed' }"
                @click="gradeStatus = 'passed'"
              >
                ✓ Принять работу
              </button>
              <button
                type="button"
                class="verdict-btn"
                :class="{ 'verdict-btn--rejected': gradeStatus === 'rejected' }"
                @click="gradeStatus = 'rejected'"
              >
                ✕ Отправить на доработку
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Баллы (из {{ selectedAssignment.maxScore }}):</label>
            <input
              v-model.number="gradeScore"
              type="number"
              min="0"
              :max="selectedAssignment.maxScore"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Комментарий и рекомендации ментора:</label>
            <textarea
              v-model="gradeComment"
              rows="3"
              placeholder="Опишите, что сделано отлично и что можно улучшить..."
              class="form-textarea"
            />
          </div>
        </div>

        <div class="modal-card__footer">
          <button type="button" class="modal-btn modal-btn--secondary" @click="closeGradeModal">
            Отмена
          </button>
          <button
            type="button"
            class="modal-btn modal-btn--primary"
            :disabled="isGrading"
            @click="handleGradeSubmit"
          >
            {{ isGrading ? 'Сохранение...' : 'Зафиксировать оценку ✓' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cabinet-assignments-tab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__title {
    font-size: 1.35rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }

  &__subtitle {
    font-size: 0.85rem;
    color: #94a3b8;
    margin: 0.25rem 0 0;
  }

  &__xp-pill {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 1rem;
    background: rgba(99, 102, 241, 0.12);
    border: 1px solid rgba(129, 140, 248, 0.3);
    border-radius: 12px;
  }

  &__xp-icon {
    font-size: 1.5rem;
  }

  &__xp-info {
    display: flex;
    flex-direction: column;
  }

  &__xp-val {
    font-size: 1rem;
    font-weight: 700;
    color: #818cf8;
  }

  &__xp-lbl {
    font-size: 0.7rem;
    color: #94a3b8;
  }

  &__toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__filters {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  &__search {
    flex: 1;
    max-width: 320px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background: rgba(15, 23, 42, 0.4);
    border: 1px dashed rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    text-align: center;
    color: #94a3b8;

    .empty-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    h4 {
      color: #ffffff;
      margin: 0 0 0.25rem;
    }

    p {
      margin: 0;
      font-size: 0.85rem;
    }
  }
}

.filter-btn {
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  &--active {
    background: #6366f1;
    color: #ffffff;
    border-color: #6366f1;
  }

  &--passed.filter-btn--active {
    background: #10b981;
    border-color: #10b981;
  }

  &--review.filter-btn--active {
    background: #f59e0b;
    border-color: #f59e0b;
  }

  &--rejected.filter-btn--active {
    background: #ef4444;
    border-color: #ef4444;
  }
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.85rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.85rem;
  outline: none;

  &:focus {
    border-color: #818cf8;
  }
}

.assignment-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.15);
  }

  &--passed {
    border-left: 4px solid #10b981;
  }

  &--review {
    border-left: 4px solid #f59e0b;
  }

  &--rejected {
    border-left: 4px solid #ef4444;
  }

  &--pending {
    border-left: 4px solid #818cf8;
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  &__course {
    font-size: 0.8rem;
    font-weight: 600;
    color: #818cf8;
  }

  &__type-badge {
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.08);
    color: #cbd5e1;

    &--lab {
      background: rgba(14, 165, 233, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(14, 165, 233, 0.25);
    }

    &--project {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.25);
    }
  }

  &__badges {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  &__reward {
    padding: 0.25rem 0.6rem;
    border-radius: 6px;
    background: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.3);
    color: #fde68a;
    font-size: 0.75rem;
    font-weight: 700;
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }

  &__desc {
    font-size: 0.85rem;
    color: #cbd5e1;
    line-height: 1.5;
    margin: 0;
  }

  &__reqs {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    background: rgba(0, 0, 0, 0.2);
    padding: 0.75rem 1rem;
    border-radius: 10px;

    &-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    &-list {
      margin: 0;
      padding-left: 1.2rem;
      color: #cbd5e1;
      font-size: 0.8rem;
      line-height: 1.45;
    }
  }

  &__sub-box {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.75rem 1rem;
    background: rgba(99, 102, 241, 0.08);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 10px;
  }

  &__sub-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #a5b4fc;
  }

  &__sub-link {
    font-size: 0.8rem;
    color: #cbd5e1;

    a {
      color: #38bdf8;
      text-decoration: underline;
      margin-left: 0.3rem;

      &:hover {
        color: #7dd3fc;
      }
    }
  }

  &__sub-notes {
    font-size: 0.8rem;
    font-style: italic;
    color: #94a3b8;
    margin: 0;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;
  }
}

.status-badge {
  padding: 0.3rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;

  &--passed {
    background: rgba(16, 185, 129, 0.15);
    color: #6ee7b7;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }

  &--review {
    background: rgba(245, 158, 11, 0.15);
    color: #fde68a;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }

  &--rejected {
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  &--pending {
    background: rgba(129, 140, 248, 0.15);
    color: #c7d2fe;
    border: 1px solid rgba(129, 140, 248, 0.3);
  }
}

.mentor-bubble {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.85rem 1.1rem;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 12px;

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__author {
    font-size: 0.8rem;
    font-weight: 700;
    color: #6ee7b7;
  }

  &__date {
    font-size: 0.75rem;
    color: #64748b;
  }

  &__text {
    font-size: 0.85rem;
    color: #e2e8f0;
    margin: 0;
    line-height: 1.45;
  }
}

.action-btn {
  padding: 0.55rem 1.25rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  &--submit {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
    }
  }

  &--edit {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.15);

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }

  &--mentor {
    background: transparent;
    color: #94a3b8;
    border: 1px dashed rgba(255, 255, 255, 0.15);
    font-size: 0.8rem;
    margin-left: auto;

    &:hover {
      color: #818cf8;
      border-color: #818cf8;
      background: rgba(99, 102, 241, 0.05);
    }
  }
}

// Модальное окно
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
}

.modal-card {
  width: 100%;
  max-width: 580px;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__badge {
    font-size: 0.75rem;
    font-weight: 600;
    color: #818cf8;

    &--mentor {
      color: #10b981;
    }
  }

  &__title {
    font-size: 1.15rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0.2rem 0 0;
  }

  &__close {
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 1.2rem;
    cursor: pointer;

    &:hover {
      color: #ffffff;
    }
  }

  &__body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(0, 0, 0, 0.2);
  }
}

.type-selector {
  display: flex;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.3rem;
  border-radius: 10px;
}

.type-tab {
  flex: 1;
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &--active {
    background: rgba(99, 102, 241, 0.2);
    color: #818cf8;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #cbd5e1;
}

.form-input {
  padding: 0.6rem 0.85rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.85rem;
  outline: none;

  &:focus {
    border-color: #818cf8;
  }
}

.form-textarea {
  padding: 0.6rem 0.85rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.85rem;
  outline: none;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: #818cf8;
  }

  &--code {
    font-family: 'Fira Code', monospace;
    font-size: 0.8rem;
    background: #020617;
  }
}

.form-hint {
  font-size: 0.75rem;
  color: #64748b;
}

.verdict-switcher {
  display: flex;
  gap: 0.5rem;
}

.verdict-btn {
  flex: 1;
  padding: 0.6rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;

  &--passed {
    background: rgba(16, 185, 129, 0.2);
    border-color: #10b981;
    color: #6ee7b7;
  }

  &--rejected {
    background: rgba(239, 68, 68, 0.2);
    border-color: #ef4444;
    color: #fca5a5;
  }
}

.modal-btn {
  padding: 0.55rem 1.25rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;

  &--secondary {
    background: transparent;
    color: #94a3b8;

    &:hover {
      color: #ffffff;
    }
  }

  &--primary {
    background: #6366f1;
    color: #ffffff;

    &:hover:not(:disabled) {
      background: #4f46e5;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>
