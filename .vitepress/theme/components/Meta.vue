<!-- 页面元数据 -->
<script setup lang="ts">
import { useData } from "../composables/data";
import { parseTime } from "../utils";

const props = defineProps<{
  title?: string;
  subtitle?: string;
  blog?: boolean;
  notShowBeginning?: boolean;
}>();

const { theme, frontmatter } = useData();
</script>

<template>
  <!-- 文章头 标题 作者 / yyyyMMdd -->
  <h1 v-if="props.title" data-pagefind-meta="title">{{ props.title }}</h1>
  <h1 v-if="props.subtitle" data-pagefind-meta="title">
    <span class="subtitle">{{ subtitle }}</span>
  </h1>
  <h3 v-if="props.blog && theme.author && frontmatter.date">
    {{ theme.author }} / {{ parseTime(frontmatter.date, "{y}-{m}-{d}") }}
  </h3>
  <hr v-if="!props.notShowBeginning" id="beginning" />
</template>
