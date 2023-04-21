<!-- 页面主题模式 -->
<script setup lang="ts">
import { ref } from 'vue'
import { MODE_TEXT, MODE_ORDER } from '../composables/constant'
import { addDarkmodeCSS } from '../composables/page-mode'

const modeText = ref('')

// body 背景 延迟载入
// document.body.style.background = 'url(https://lipk.oss-accelerate.aliyuncs.com/images/geometry.png)';
// document.body.style.backgroundRepeat = 'repeat';

const modeLS: string | null = localStorage.getItem('page-theme-mode');

if (modeLS) {
  modeText.value = MODE_TEXT[modeLS];
}

// 切换黑夜白天模式
function modeChange() {
  const nowDarkmode = localStorage.getItem('page-theme-mode') || 'github-light';
  const beaudar = document.querySelector<HTMLIFrameElement>('#beaudar iframe');
  const message = {
    type: 'set-theme',
    theme: 'github-light',
  };
  /**
   * 顺序：
   *       -> 'github-light'        // 浅色
   *       -> 'github-dark'         // 深色
   *       -> 'github-dark-orange'  // 深橙
   *       -> 'dark-blue'           // 深蓝
   *       -> 'icy-dark'            // 冷黑
   *       -> 'photon-dark'         // 暗黑
   */
  message.theme = MODE_ORDER[nowDarkmode];
  localStorage.setItem('page-theme-mode', MODE_ORDER[nowDarkmode]);
  modeText.value = MODE_TEXT[MODE_ORDER[nowDarkmode]];
  addDarkmodeCSS(MODE_ORDER[nowDarkmode]);
  // 与 beaudar 通信
  if (localStorage.getItem('beaudar') === 'true' && beaudar && beaudar.contentWindow) {
    beaudar.contentWindow.postMessage(message, 'https://beaudar.lipk.org');
  }
};
</script>

<template>
  <button @click="modeChange">{{ modeText }}</button>
</template>

