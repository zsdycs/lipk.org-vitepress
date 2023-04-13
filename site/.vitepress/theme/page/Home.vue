<!-- home 首页 -->
<script setup lang="ts">
import { useRoute } from 'vitepress'
import { watch } from 'vue'

const route = useRoute()

watch(() => route.path, setHomeClass, {
  immediate: true,
})

function setHomeClass() {
  if (route.path === '/') {
    // 首页时: <html> => <html class="home">
    document.documentElement.classList.add('home')
  }
}
</script>

<template>
  <main class="index">
    <article>
      <Content />
    </article>
  </main>
</template>
