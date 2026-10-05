<script setup lang="ts">
import { User } from '@/entities/user'
import { EditProfileForm } from '@/features/edit-profile'

// #region defineProps
interface Props {
  user: User | null
}

const props = defineProps<Props>()
// #endregion defineProps
</script>

<template>
  <div class="cabinet-settings-tab">
    <h3 class="cabinet-settings-tab__title">Настройки аккаунта</h3>

    <div class="cabinet-settings-tab__content">
      <EditProfileForm
        :initial-name="props.user?.name"
        :initial-email="props.user?.email"
        :initial-avatar="props.user?.avatar"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.cabinet-settings-tab {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }

  &__content {
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.5rem;
  }
}
</style>
