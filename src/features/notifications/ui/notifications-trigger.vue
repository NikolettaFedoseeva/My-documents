<script setup lang="ts">
// #region defineProps
interface Props {
  count: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
})
// #endregion defineProps

// #region defineEmits
const emit = defineEmits<{
  (e: 'click'): void
}>()
// #endregion defineEmits
</script>

<template>
  <button
    type="button"
    class="notifications-trigger"
    title="Уведомления"
    @click="emit('click')"
  >
    <span class="notifications-trigger__icon">🔔</span>
    <span v-if="props.count > 0" class="notifications-trigger__badge">
      {{ props.count > 99 ? '99+' : props.count }}
    </span>
  </button>
</template>

<style scoped lang="scss">
.notifications-trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  &__icon {
    font-size: 1.1rem;
  }

  &__badge {
    position: absolute;
    top: 2px;
    right: 2px;
    background: #ef4444;
    color: #ffffff;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.1rem 0.35rem;
    border-radius: 9999px;
    border: 2px solid #0f172a;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
  }
}
</style>
