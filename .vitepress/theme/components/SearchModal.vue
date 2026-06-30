<!-- 全文搜索弹框 -->
<script setup lang="ts">
import {
  ref,
  watch,
  nextTick,
  computed,
  onMounted,
  onUnmounted,
} from "vue";
import { inBrowser } from "vitepress";
import { SVG_STRING } from "../composables/svg-resources";
import { useSearchModal } from "../composables/search-modal";
import { searchPagefind } from "../composables/pagefind";
import type { SearchResult } from "../composables/pagefind";
import { throttle } from "../utils";

const { isOpen, close } = useSearchModal();
const query = ref("");
const inputRef = ref<HTMLInputElement | null>(null);
const results = ref<SearchResult[]>([]);
const loading = ref(false);
const errorMsg = ref("");

const showClear = computed(() => query.value.length > 0);
const hasQuery = computed(() => query.value.trim().length > 0);

function clearQuery() {
  query.value = "";
  results.value = [];
  errorMsg.value = "";
  nextTick(() => inputRef.value?.focus());
}

function handleClose() {
  close();
  query.value = "";
  results.value = [];
  errorMsg.value = "";
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && isOpen.value) {
    handleClose();
  }
}

const doSearch = throttle(async () => {
  if (!hasQuery.value) {
    results.value = [];
    errorMsg.value = "";
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    const { results: data } = await searchPagefind(query.value.trim());
    results.value = data;
  } catch {
    errorMsg.value = "搜索出错，请稍后重试";
    results.value = [];
  } finally {
    loading.value = false;
  }
}, 300, 300);

watch(query, () => {
  doSearch();
});

watch(isOpen, (val) => {
  if (!inBrowser) {
    return;
  }
  if (val) {
    nextTick(() => {
      inputRef.value?.focus();
    });
    document.documentElement.style.overflow = "hidden";
  } else {
    document.documentElement.style.overflow = "";
  }
});

onMounted(() => {
  if (inBrowser) {
    document.addEventListener("keydown", handleKeydown);
  }
});

onUnmounted(() => {
  if (inBrowser) {
    document.removeEventListener("keydown", handleKeydown);
    document.documentElement.style.overflow = "";
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="search-modal">
      <div v-if="isOpen" class="search-modal-overlay" role="dialog" aria-modal="true" aria-label="全文搜索"
        @click.self="handleClose">
        <div class="search-modal" :class="{ 'has-results': hasQuery }">
          <div class="search-modal__search-row">
            <div class="search-modal__input-box">
              <span class="search-modal__search-icon fa-svg" v-html="SVG_STRING['fa-search']"></span>
              <input ref="inputRef" v-model="query" type="text" class="search-modal__input" placeholder="输入关键词搜索"
                aria-label="输入关键词搜索" autocomplete="off" spellcheck="false" />
              <button v-if="showClear" type="button" class="search-modal__clear" title="清除" aria-label="清除搜索内容"
                @click="clearQuery">
                <span class="fa-svg" v-html="SVG_STRING['fa-times']"></span>
              </button>
            </div>
            <button type="button" class="search-modal__close" title="关闭搜索" aria-label="关闭搜索" @click="handleClose">
              <span class="fa-svg" v-html="SVG_STRING['fa-times']"></span>
              <span class="label-text">关闭</span>
            </button>
          </div>

          <Transition name="search-results">
            <div v-if="hasQuery" class="search-modal__results">
              <div v-if="loading" class="search-modal__status">搜索中...</div>
              <div v-else-if="errorMsg" class="search-modal__status search-modal__status--error">
                {{ errorMsg }}
              </div>
              <div v-else-if="results.length === 0" class="search-modal__status">
                未找到与“{{ query }}”相关的内容
              </div>
              <ul v-else class="search-modal__result-list">
                <li v-for="item in results" :key="item.url" class="search-modal__result-item">
                  <a :href="item.url" class="search-modal__result-link" @click="handleClose">
                    <div class="search-modal__result-title">{{ item.title }}</div>
                    <div class="search-modal__result-excerpt" v-html="item.excerpt"></div>
                  </a>
                </li>
              </ul>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
