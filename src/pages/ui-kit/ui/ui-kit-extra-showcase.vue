<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  UiButton,
  UiButtonWrapper,
  UiCard,
  UiCardForm,
  UiCardLiLayout,
  UiChart,
  UiCounter,
  UiCropper,
  UiDatePicker,
  UiEmojiAnimation,
  UiFileInput,
  UiImageList,
  UiInput,
  UiInputCopy,
  UiLabel,
  UiList,
  UiMultiDropdown,
  UiScroll,
  UiTimePicker,
  UiUploadAvatar,
} from 'lern-ui-kit'
import type { ChartDatum, DropdownOption, FileRejection, ImageListItem, ListItem } from 'lern-ui-kit'

// #region Формы
const email = ref<string>('')
const birthDate = ref<string>('')
const lessonTime = ref<string>('')
const topics = ref<string[]>(['vue'])
const files = ref<File[]>([])
const fileError = ref<string>('')
const isSubmitting = ref<boolean>(false)
const formError = ref<string>('')

const topicOptions: DropdownOption[] = [
  { id: 'vue', label: 'Vue 3', icon: '⚡' },
  { id: 'ts', label: 'TypeScript', icon: '🔷' },
  { id: 'fsd', label: 'Feature-Sliced Design', icon: '🧱' },
  { id: 'pinia', label: 'Pinia', icon: '🍍' },
  { id: 'pg', label: 'PostgreSQL', icon: '🗄️' },
  { id: 'jest', label: 'Jest', icon: '🧪', disabled: true },
]

const today = new Date().toISOString().slice(0, 10)

const onReject = (rejections: FileRejection[]): void => {
  fileError.value = rejections[0]?.message ?? ''
}

const onFilesChange = (): void => {
  fileError.value = ''
}

const submitDemoForm = (): void => {
  formError.value = ''
  if (!email.value.includes('@')) {
    formError.value = 'Укажите корректный email'
    return
  }
  isSubmitting.value = true
  setTimeout(() => {
    isSubmitting.value = false
  }, 1200)
}
// #endregion Формы

// #region Списки и макеты
const listItems: ListItem[] = [
  { id: '1', icon: '📘', title: 'Реактивность в Vue 3', description: 'ref, reactive, computed', meta: '12 мин' },
  { id: '2', icon: '🧩', title: 'Composition API', description: 'Композаблы и переиспользование', meta: '18 мин' },
  { id: '3', icon: '🔒', title: 'Продвинутые паттерны', description: 'Откроется после теста', meta: '25 мин', disabled: true },
]
const selectedListItem = ref<string>('1')

const courseCards = [
  { id: 'c1', icon: '⚡', title: 'Vue 3', lessons: 24 },
  { id: 'c2', icon: '🔷', title: 'TypeScript Pro', lessons: 31 },
  { id: 'c3', icon: '🧱', title: 'Feature-Sliced Design', lessons: 18 },
  { id: 'c4', icon: '🗄️', title: 'PostgreSQL', lessons: 27 },
]
const cardsLoading = ref<boolean>(false)
const reloadCards = (): void => {
  cardsLoading.value = true
  setTimeout(() => {
    cardsLoading.value = false
  }, 1100)
}

const makeSvg = (c1: string, c2: string, label: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="640" height="480" fill="url(#g)"/><text x="320" y="260" font-size="72" text-anchor="middle" fill="white" font-family="sans-serif">${label}</text></svg>`,
  )}`

const images = ref<ImageListItem[]>([
  { id: 'i1', src: makeSvg('#6366f1', '#06b6d4', 'Vue'), alt: 'Vue', caption: 'Обложка: Vue' },
  { id: 'i2', src: makeSvg('#f59e0b', '#ef4444', 'TS'), alt: 'TypeScript', caption: 'Обложка: TypeScript' },
  { id: 'i3', src: makeSvg('#10b981', '#3b82f6', 'FSD'), alt: 'FSD', caption: 'Обложка: FSD' },
])
const removeImage = (image: ImageListItem): void => {
  images.value = images.value.filter((i) => i.id !== image.id)
}

const scrollLines = Array.from({ length: 30 }, (_, i) => `Строка прокрутки №${i + 1}`)
const reachedEndCount = ref<number>(0)
// #endregion Списки и макеты

// #region Счётчик
const timerRunning = ref<boolean>(false)
const timerKey = ref<number>(0)
const questionNumber = ref<number>(3)
// #endregion Счётчик

// #region График
const barData: ChartDatum[] = [
  { label: 'Пн', value: 60 },
  { label: 'Вт', value: 120 },
  { label: 'Ср', value: 85 },
  { label: 'Чт', value: 190 },
  { label: 'Пт', value: 140 },
]
const donutData: ChartDatum[] = [
  { label: 'Frontend', value: 12 },
  { label: 'Архитектура', value: 7 },
  { label: 'Backend', value: 5 },
]
const chartType = ref<'bar' | 'line'>('bar')
const lineAndBarType = computed<'bar' | 'line'>(() => chartType.value)
// #endregion График

// #region Медиа
const avatar = ref<string>('')
const avatarError = ref<string>('')
const cropperRef = ref<InstanceType<typeof UiCropper> | null>(null)
const croppedPreview = ref<string>('')
const cropSource = makeSvg('#a855f7', '#ec4899', 'CROP')

const applyCrop = (): void => {
  croppedPreview.value = cropperRef.value?.getCroppedDataUrl() ?? ''
}

const emojiTrigger = ref<number>(0)
const rainTrigger = ref<number>(0)
// #endregion Медиа
</script>

<template>
  <section class="extra-showcase">
    <header class="extra-showcase__head">
      <h2>Новые компоненты UI Kit</h2>
      <p>Формы, макеты, графики и работа с изображениями. Все компоненты подстраиваются под активную тему.</p>
    </header>

    <div class="extra-showcase__grid">
      <!-- ФОРМЫ -->
      <UiCard variant="glass" padding="lg" class="extra-showcase__wide">
        <UiCardForm
          title="UiCardForm + поля ввода"
          description="Форма-обёртка с состоянием отправки и общей ошибкой"
          submit-text="Отправить"
          cancel-text="Сбросить"
          cancelable
          :loading="isSubmitting"
          :error="formError"
          @submit="submitDemoForm"
          @cancel="email = ''"
        >
          <div class="extra-showcase__field">
            <UiLabel required hint="Мы не рассылаем спам">Email</UiLabel>
            <UiInput v-model="email" type="email" placeholder="name@example.com" />
          </div>
          <div class="extra-showcase__two">
            <UiDatePicker v-model="birthDate" label="Дата (UiDatePicker)" :max="today" hint="Будущие даты недоступны" />
            <UiTimePicker v-model="lessonTime" label="Время (UiTimePicker)" :minute-step="15" min="08:00" max="21:00" />
          </div>
          <UiMultiDropdown v-model="topics" :options="topicOptions" label="Темы (UiMultiDropdown)" :max="4" />
          <UiFileInput
            v-model="files"
            label="Файлы (UiFileInput)"
            accept="image/*,.pdf"
            multiple
            :max-size-mb="2"
            :max-files="3"
            :error="fileError"
            hint="Изображения или PDF, до 3 файлов"
            @reject="onReject"
            @change="onFilesChange"
          />
          <UiInputCopy label="Ссылка на курс (UiInputCopy)" value="https://lern.dev/courses/vue3-mastery" />
        </UiCardForm>
      </UiCard>

      <!-- КНОПКИ, СЧЁТЧИК, СПИСОК -->
      <UiCard variant="glass" padding="lg">
        <h3>UiButtonWrapper</h3>
        <UiButtonWrapper align="between" aria-label="Действия">
          <UiButton variant="secondary">Назад</UiButton>
          <UiButtonWrapper gap="sm">
            <UiButton variant="secondary">Черновик</UiButton>
            <UiButton variant="primary">Опубликовать</UiButton>
          </UiButtonWrapper>
        </UiButtonWrapper>

        <h3 class="extra-showcase__spaced">UiCounter</h3>
        <div class="extra-showcase__row">
          <UiCounter mode="steps" :current="questionNumber" :total="10" />
          <UiButton variant="secondary" size="sm" @click="questionNumber = (questionNumber % 10) + 1">След. вопрос</UiButton>
        </div>
        <div class="extra-showcase__row">
          <UiCounter :key="timerKey" mode="timer" :seconds="30" direction="down" :running="timerRunning" :warn-at="10" />
          <UiButton variant="secondary" size="sm" @click="timerRunning = !timerRunning">
            {{ timerRunning ? 'Пауза' : 'Старт' }}
          </UiButton>
          <UiButton variant="secondary" size="sm" @click="(timerRunning = false), timerKey++">Сброс</UiButton>
        </div>
      </UiCard>

      <UiCard variant="glass" padding="lg">
        <h3>UiList</h3>
        <UiList v-model="selectedListItem" :items="listItems" />
        <p class="extra-showcase__note">Выбрано: <strong>{{ selectedListItem }}</strong></p>
      </UiCard>

      <!-- МАКЕТ КАРТОЧЕК -->
      <UiCard variant="glass" padding="lg" class="extra-showcase__wide">
        <div class="extra-showcase__row extra-showcase__row--between">
          <h3>UiCardLiLayout</h3>
          <UiButton variant="secondary" size="sm" @click="reloadCards">Показать скелетоны</UiButton>
        </div>
        <UiCardLiLayout :items="courseCards" item-key="id" :min-column-width="200" :loading="cardsLoading">
          <template #item="{ item }">
            <UiCard variant="glass" padding="md">
              <strong>{{ (item as typeof courseCards[number]).icon }} {{ (item as typeof courseCards[number]).title }}</strong>
              <p class="extra-showcase__note">{{ (item as typeof courseCards[number]).lessons }} уроков</p>
            </UiCard>
          </template>
        </UiCardLiLayout>
      </UiCard>

      <!-- СКРОЛЛ + ИЗОБРАЖЕНИЯ -->
      <UiCard variant="glass" padding="lg">
        <h3>UiScroll</h3>
        <UiScroll max-height="180px" @reach-end="reachedEndCount++">
          <p v-for="line in scrollLines" :key="line" class="extra-showcase__line">{{ line }}</p>
        </UiScroll>
        <p class="extra-showcase__note">Достигнут конец: {{ reachedEndCount }} раз(а)</p>
      </UiCard>

      <UiCard variant="glass" padding="lg">
        <h3>UiImageList</h3>
        <UiImageList :images="images" :columns="3" aspect-ratio="4 / 3" removable @remove="removeImage" />
      </UiCard>

      <!-- ГРАФИКИ -->
      <UiCard variant="glass" padding="lg">
        <div class="extra-showcase__row extra-showcase__row--between">
          <h3>UiChart: {{ chartType === 'bar' ? 'столбцы' : 'линия' }}</h3>
          <UiButton variant="secondary" size="sm" @click="chartType = chartType === 'bar' ? 'line' : 'bar'">
            Переключить
          </UiButton>
        </div>
        <UiChart :data="barData" :type="lineAndBarType" unit=" XP" :height="220" />
      </UiCard>

      <UiCard variant="glass" padding="lg">
        <h3>UiChart: кольцо</h3>
        <UiChart :data="donutData" type="donut" unit=" курс." />
      </UiCard>

      <!-- МЕДИА -->
      <UiCard variant="glass" padding="lg">
        <h3>UiUploadAvatar + UiCropModal</h3>
        <UiUploadAvatar v-model="avatar" name="Анна Смирнова" @error="avatarError = $event" @change="avatarError = ''" />
        <p v-if="avatarError" class="extra-showcase__note extra-showcase__note--error">{{ avatarError }}</p>
      </UiCard>

      <UiCard variant="glass" padding="lg">
        <h3>UiCropper (16:9)</h3>
        <UiCropper ref="cropperRef" :src="cropSource" :aspect-ratio="16 / 9" :output-size="480" output-type="image/png" />
        <div class="extra-showcase__row">
          <UiButton variant="primary" size="sm" @click="applyCrop">Обрезать</UiButton>
          <img v-if="croppedPreview" class="extra-showcase__crop-result" :src="croppedPreview" alt="Результат кадрирования" />
        </div>
      </UiCard>

      <UiCard variant="glass" padding="lg" class="extra-showcase__wide">
        <h3>UiEmojiAnimation</h3>
        <div class="extra-showcase__row">
          <UiEmojiAnimation :trigger="emojiTrigger" mode="burst" :emojis="['🎉', '✨', '⭐', '🔥']" :count="18">
            <UiButton variant="primary" @click="emojiTrigger++">🎉 Взрыв</UiButton>
          </UiEmojiAnimation>
          <UiEmojiAnimation :trigger="rainTrigger" mode="rise" :emojis="['❤️', '💜']" :distance="110">
            <UiButton variant="secondary" @click="rainTrigger++">❤️ Всплытие</UiButton>
          </UiEmojiAnimation>
        </div>
      </UiCard>
    </div>
  </section>
</template>

<style scoped lang="scss">
.extra-showcase {
  margin-top: 3rem;

  &__head {
    margin-bottom: 1.5rem;

    h2 {
      margin: 0 0 0.4rem;
      color: var(--text-main);
    }

    p {
      margin: 0;
      color: var(--text-muted);
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 1.25rem;
  }

  &__wide {
    grid-column: 1 / -1;
  }

  h3 {
    margin: 0 0 0.9rem;
    font-size: 1rem;
    color: var(--text-main);
  }

  &__spaced {
    margin-top: 1.5rem !important;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &__two {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.75rem;

    &--between {
      justify-content: space-between;
      margin-top: 0;
    }
  }

  &__note {
    margin: 0.6rem 0 0;
    font-size: 0.85rem;
    color: var(--text-muted);

    &--error {
      color: var(--danger);
    }
  }

  &__line {
    margin: 0;
    padding: 0.45rem 0.25rem;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-main);
    font-size: 0.9rem;
  }

  &__crop-result {
    height: 64px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-color);
  }
}
</style>
