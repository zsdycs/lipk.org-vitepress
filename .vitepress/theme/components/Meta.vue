<!-- 页面元数据 -->
<script setup lang="ts">
import { useData } from '../composables/data'
import { parseTime } from "../utils";

const props = defineProps<{
  title?: string,
  subtitle?: string,
  blog?: boolean,
}>();

const { theme, frontmatter } = useData()

</script>

<template>
  <!-- 文章头 标题 作者 / yyyyMMdd -->
  <h1 v-if="props.title">{{ props.title }}</h1>
  <h1 v-if="props.subtitle"><span class="subtitle">{{ subtitle }}</span></h1>
  <h3 v-if="blog">
    {{ theme.author }} / {{ parseTime(frontmatter.date, "{y}-{m}-{d}") }}
  </h3>
  <hr id="beginning" />
</template>

