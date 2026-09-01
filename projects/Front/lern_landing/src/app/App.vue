<script lang="ts" setup>
import { onMounted } from "vue";
import { useTheme } from "lern-ui-kit";

const { initTheme } = useTheme();

onMounted(() => {
  initTheme();
});
</script>

<template>
  <RouterView #default="{ Component }">
    <Suspense :timeout="0">
      <template v-if="Component">
        <component :is="Component" />
      </template>
    </Suspense>
  </RouterView>
</template>

<style lang="scss">
@use "./styles/index.scss";

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>
