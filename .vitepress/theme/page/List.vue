<!-- list 列表页 -->
<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useData } from '../composables/data'
import { routePathList } from '../composables/route-path';
import Menu from '../components/Menu.vue';
import Meta from '../components/Meta.vue';
import ArchiveList from '../components/ArchiveList';

const route = useRoute()
const { theme, frontmatter } = useData()

</script>

<template>
  <header class="masthead">
    <Menu />
  </header>
  <article class="main">
    <header v-if="frontmatter.title" class="title">
      <Meta :title="frontmatter.title" />
    </header>
    <div class="archive">
      <ArchiveList :list="routePathList(theme.routes, route)" />
    </div>
  </article>
</template>
