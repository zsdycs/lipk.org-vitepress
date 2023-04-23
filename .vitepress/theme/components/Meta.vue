<!-- 页面元数据 -->
<script setup lang="ts">
const props = defineProps<{
  title?: string,
  subtitle?: string,
}>()

</script>

<template>
  <!-- 文章头 标题 作者 / yyyyMMdd -->
  <h1 v-if="props.title">{{ props.title }}</h1>
  <h1 v-if="props.subtitle"><span class="subtitle">{{ subtitle }}</span></h1>
  <h3>
    <!-- {{ if .Params.date }} {{ if and (.Section) (or (.PrevInSection) (.NextInSection)) }}
    {{ with .Site.Params.author }}{{ . }}{{ end }} / {{ .Date.Format "2006-01-02" }}{{ end }}{{ end }} -->
  </h3>
  <hr id="beginning" />
</template>

