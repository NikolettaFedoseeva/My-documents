<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'

// #region Props & Emits
interface Props {
  modelValue: boolean
  title?: string
  closeOnOverlay?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  closeOnOverlay: true,
  size: 'md',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()
// #endregion Props & Emits

// #region Functions
const onClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const onOverlayClick = () => {
  if (props.closeOnOverlay) {
    onClose()
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.modelValue) {
    onClose()
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})
// #endregion Functions
</script>

<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="props.modelValue" class="ui-modal-backdrop" @click.self="onOverlayClick">
        <div class="ui-modal-container" :class="[`ui-modal-container--${props.size}`]">
          <!-- Modal Header -->
          <div v-if="props.title || $slots.header" class="ui-modal-header">
            <slot name="header">
              <h3 class="ui-modal-title">{{ props.title }}</h3>
            </slot>
            <button class="ui-modal-close-btn" @click="onClose">✕</button>
          </div>

          <!-- Modal Body -->
          <div class="ui-modal-body">
            <slot></slot>
          </div>

          <!-- Modal Footer -->
          <div v-if="$slots.footer" class="ui-modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped lang="scss">
.ui-modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(11, 15, 25, 0.65);
  backdrop-filter: blur(8px);
}

.ui-modal-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: var(--radius-lg);
  background: var(--bg-container);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-main);
  overflow: hidden;

  &--sm { max-width: 400px; }
  &--md { max-width: 560px; }
  &--lg { max-width: 800px; }
}

.ui-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.ui-modal-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.ui-modal-close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s ease;

  &:hover {
    color: var(--text-main);
  }
}

.ui-modal-body {
  padding: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
  color: var(--text-main);
}

.ui-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.1);
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
  .ui-modal-container {
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  .ui-modal-container {
    transform: scale(0.94) translateY(10px);
  }
}
</style>
