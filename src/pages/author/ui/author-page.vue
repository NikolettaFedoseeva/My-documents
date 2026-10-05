<script setup lang="ts">
import { AuthorStudio } from '@/widgets/author-studio'
</script>

<template>
  <div class="author-page">
    <AuthorStudio />
  </div>
</template>

<style scoped lang="scss">
.author-page {
  width: 100%;
  height: calc(100vh - 64px);
  overflow: hidden;
  box-sizing: border-box;
}
</style>
