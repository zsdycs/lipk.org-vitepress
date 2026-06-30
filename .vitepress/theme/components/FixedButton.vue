<!-- 固定在页面边上的按钮 -->
<script setup lang="ts">
import { SVG_STRING } from "../composables/svg-resources";
import { useEditLink } from "../composables/edit-link";
import { useHasEditInfo } from "../composables/has-edit-info";
import { useData } from "../composables/data";
import { useSearchModal } from "../composables/search-modal";

const { frontmatter } = useData();
const editLink = useEditLink();
const hasEditInfo = useHasEditInfo();
const { open: openSearchModal } = useSearchModal();
</script>

<template>
  <div id="fixed-button" v-if="!frontmatter.homePage">
    <div class="btn-box writeFixed" v-if="hasEditInfo">
      <a :href="editLink.url" title="编辑本页" target="_blank">
        <span class="fa-svg" v-html="SVG_STRING['fa-pencil']"></span>
        <span class="label-text">编辑</span>
      </a>
    </div>
    <div class="btn-box topFixed">
      <button type="button" title="返回顶部" onclick="window.scrollTo({top: 0});">
        <span class="fa-svg" v-html="SVG_STRING['fa-arrow-up']"></span>
        <span class="label-text">顶部</span>
      </button>
    </div>
    <div class="btn-box searchFixed">
      <button type="button" title="搜索" @click="openSearchModal">
        <span class="fa-svg" v-html="SVG_STRING['fa-search']"></span>
        <span class="label-text">搜索</span>
      </button>
    </div>
  </div>
</template>
