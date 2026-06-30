<!-- home 首页 -->
<script setup lang="ts">
import { useData } from '../composables/data'
import Footer from '../components/Footer.vue'

const { frontmatter } = useData()
</script>

<template>
  <article :data-pagefind-body="frontmatter.search !== false ? '' : undefined">
    <Content class="archive" />
  </article>
  <Footer mode="home" />
</template>
