<!-- list 列表页 -->
<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useData } from '../composables/data'
import { routePathList } from '../composables/route-path';
import Menu from '../components/Menu.vue';
import Meta from '../components/Meta.vue';
import ArchiveList from '../components/ArchiveList';
import Footer from '../components/Footer.vue'

const route = useRoute()
const { theme, frontmatter } = useData()

const footerMode = "common" // 常规

let footerComment = false;
if (frontmatter.value.notComment === false) {
  // 带有评论
  footerComment = true
}

</script>

<template>
  <header class="masthead">
    <Menu />
  </header>
  <article class="main">
    <header v-if="frontmatter.title" class="title">
      <Meta :title="frontmatter.title" />
    </header>
    <div class="archive" :data-pagefind-body="frontmatter.search !== false ? '' : undefined">
      <span v-if="frontmatter.title" data-pagefind-meta="title" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">{{ frontmatter.title }}</span>
      <ArchiveList :list="routePathList(theme.routes, route)" />
    </div>
    <Footer :mode="footerMode" :comment="footerComment" />
  </article>
</template>
