<script setup lang="ts">
import { ref, computed, watchEffect, onMounted } from 'vue'
import { useData } from '../composables/data'

const { theme, page, lang } = useData()

const date = computed(() => new Date(page.value.lastUpdated!))
const isoDatetime = computed(() => date.value.toISOString())
const datetime = ref('')

onMounted(() => {
  watchEffect(() => {
    datetime.value = date.value.toLocaleString(lang.value)
  })
})
</script>

<template>
  <div class="last-updated">
    {{ theme.lastUpdatedText || '最后更新时间' }}: <time :datetime="isoDatetime">{{ datetime }}</time>
  </div>
</template>
