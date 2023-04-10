<script setup lang="ts">
import { useData } from 'vitepress'
import Home from './components/Home.vue'

const { site, frontmatter } = useData()
</script>

<template>
  <template v-if="frontmatter.home">
    <Home />
  </template>
  <template v-else>
    <a href="/">Home</a>
    <Content />
  </template>
</template>
