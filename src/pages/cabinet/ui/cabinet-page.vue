<script setup lang="ts">
import { CabinetDashboard } from '@/widgets/cabinet-dashboard'
</script>

<template>
  <div class="cabinet-page">
    <main class="cabinet-page__main">
      <CabinetDashboard />
    </main>
  </div>
</template>

<style scoped lang="scss">
.cabinet-page {
  min-height: calc(100vh - 64px);
  background: #090d16;
  color: #f8fafc;
  padding: 2rem;
  box-sizing: border-box;

  &__main {
    width: 100%;
  }
}
</style>