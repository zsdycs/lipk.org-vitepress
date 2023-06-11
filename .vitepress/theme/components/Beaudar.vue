<!-- 表达 评论 -->
<script setup lang="ts">
import { inBrowser, useRoute } from 'vitepress'
import { watch, ref, onMounted } from 'vue'

const route = useRoute();

const comments = ref<HTMLElement>();

onMounted(() => {
  watch(() => route.path, setComments, {
    immediate: true,
  });
})

function setComments() {
  if (!inBrowser) {
    return
  }
  if (comments?.value) {
    const script = document.createElement('script');
    script.src = 'https://beaudar.lipk.org/client.js';
    script.setAttribute('repo', 'zsdycs/lipk.org-vitepress');
    script.setAttribute('issue-term', 'title');
    script.setAttribute('label', '💬 评论');
    script.setAttribute('theme', localStorage.getItem('page-theme-mode') || '');
    script.setAttribute('comment-order', 'desc');
    script.setAttribute('input-position', 'top');
    script.setAttribute('issue-label', 'pathname');
    script.async = true;
    comments.value.innerHTML = '';
    comments.value.appendChild(script);
    beaudarEnd();

  }
}

/**
  * 通过 MutationObserver 来监听 #beaudar
  */
function beaudarEnd() {
  const targetNode = comments.value as Node;
  const options = {
    attributes: true,
    childList: true,
    subtree: true,
  };

  function callback(mutationsList: MutationRecord[]) {
    mutationsList.forEach(function (element) {
      if (
        element.type === 'attributes' &&
        (element.target as Element).className === 'beaudar'
      ) {
        if (inBrowser) {
          const message = {
            type: 'set-theme',
            theme: localStorage.getItem('page-theme-mode'),
          };
          const beaudar = document.querySelector<HTMLIFrameElement>('#beaudar iframe');
          if (beaudar?.contentWindow) {
            // 与 beaudar 通信
            beaudar.contentWindow.postMessage(
              message,
              'https://beaudar.lipk.org',
            );
          }
        }
      }
    });
  }
  const mutationObserver = new MutationObserver(callback);
  mutationObserver.observe(targetNode, options);
}
</script>

<template>
  <section id="beaudar" ref="comments" class="comments"></section>
</template>
