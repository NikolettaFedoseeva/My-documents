<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from 'lern-ui-kit'

const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
@use './styles/index.scss';

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>