<script setup lang="ts">
import { ref } from 'vue'
import { UiButton, UiInput, UiCard, UiBadge, UiTable, UiModal } from '@/shared/ui'

const topicsCount = ref(12)
const questionsCount = ref(48)

const newTopicTitle = ref('')
const newTopicSection = ref('')
const isAddModalOpen = ref(false)

const columns = [
  { key: 'title', label: 'Название темы', sortable: true },
  { key: 'section', label: 'Раздел' },
  { key: 'questions', label: 'Вопросов' },
  { key: 'actions', label: 'Действия' },
]

const data = ref([
  { title: 'watch и watchEffect', section: 'Vue 3 & Composition API', questions: 4 },
  { title: 'Введение в Composition API', section: 'Vue 3 & Composition API', questions: 3 },
  { title: 'Глубокое наблюдение', section: 'Vue 3 & Composition API', questions: 5 },
])

const onAddTopic = () => {
  if (!newTopicTitle.value) return
  data.value.push({
    title: newTopicTitle.value,
    section: newTopicSection.value || 'Общий раздел',
    questions: 0,
  })
  newTopicTitle.value = ''
  newTopicSection.value = ''
  isAddModalOpen.value = false
}
</script>

<template>
  <div class="admin-page">
    <UiCard variant="glass" padding="lg">
      <div class="admin-header">
        <div>
          <h2>🛠 Панель Администратора & Конструктор</h2>
          <p>Управление структурой категорий, тем и вопросов</p>
        </div>
        <UiButton variant="primary" @click="isAddModalOpen = true">
          <template #icon-left>➕</template>
          Создать новую тему
        </UiButton>
      </div>

      <div class="admin-stats">
        <div class="stat-card">
          <span class="stat-card__num">{{ data.length }}</span>
          <span class="stat-card__label">Активных тем</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__num">48</span>
          <span class="stat-card__label">Вопросов в базе</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__num">7</span>
          <span class="stat-card__label">Визуальных тем</span>
        </div>
      </div>

      <div class="admin-table-section">
        <h3>Управление темами курса</h3>
        <UiTable :columns="columns" :data="data">
          <template #cell-actions>
            <UiButton variant="secondary" size="sm">Редактировать</UiButton>
          </template>
        </UiTable>
      </div>

      <!-- Add Modal -->
      <UiModal v-model="isAddModalOpen" title="Создание новой темы курса">
        <div class="modal-form">
          <UiInput v-model="newTopicTitle" label="Название темы" placeholder="Например: Pinia State Management" />
          <UiInput v-model="newTopicSection" label="Раздел дисциплин" placeholder="Например: Vue 3" />
        </div>
        <template #footer>
          <UiButton variant="secondary" @click="isAddModalOpen = false">Отмена</UiButton>
          <UiButton variant="primary" @click="onAddTopic">Создать тему</UiButton>
        </template>
      </UiModal>
    </UiCard>
  </div>
</template>

<style scoped lang="scss">
.admin-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
}
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  h2 { font-size: 1.8rem; font-weight: 800; color: var(--text-main); }
  p { color: var(--text-muted); }
}
.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}
.stat-card {
  padding: 1.25rem;
  border-radius: var(--radius-md);
  background: var(--bg-card-hover);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  &__num { font-size: 2.2rem; font-weight: 800; color: var(--primary); }
  &__label { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
}
.admin-table-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  h3 { font-size: 1.1rem; color: var(--text-main); font-weight: 700; }
}
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>