<!-- PWA 更新通知 -->
<script setup lang="ts">
import { useServiceWorkerUpdate } from "../composables/register-sw";

const { isUpdateReady, reloadWithUpdate, dismissUpdate } =
  useServiceWorkerUpdate();

const handleRefresh = async () => {
  await reloadWithUpdate();
};
</script>

<template>
  <Teleport to="body">
    <div v-if="isUpdateReady" class="update-notice" role="status" aria-live="polite">
      <p class="update-notice__text">网站有新版本可用，刷新后即可更新到最新内容。</p>
      <div class="update-notice__actions">
        <button type="button" class="update-notice__button update-notice__button--ghost" @click="dismissUpdate">
          稍后
        </button>
        <button type="button" class="update-notice__button" @click="handleRefresh">
          立即刷新
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.update-notice {
  position: fixed;
  top: max(20px, env(safe-area-inset-top));
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: min(520px, calc(100vw - 32px));
  padding: 14px 16px;
  border: 1px solid var(--main-border-color);
  border-radius: 14px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--a-color) 12%, transparent), transparent 55%),
    color-mix(in srgb, var(--article-bg-color) 92%, transparent);
  box-shadow: 0px 1px 30px color-mix(in srgb, var(--html-color) 18%, transparent);
  color: var(--body-color);
  backdrop-filter: blur(12px);
}

.update-notice__text {
  margin: 0;
  line-height: 1.6;
}

.update-notice__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

.update-notice__button {
  min-width: 88px;
  padding: 8px 14px;
  border: 1px solid var(--a-color);
  border-radius: 5px;
  background: var(--a-color);
  color: var(--article-bg-color);
  cursor: pointer;
}

.update-notice__button--ghost {
  background: transparent;
  color: var(--a-color);
}

@media (max-width: 640px) {
  .update-notice {
    top: max(12px, env(safe-area-inset-top));
    padding: 12px 14px;
  }

  .update-notice__actions {
    justify-content: stretch;
  }

  .update-notice__button {
    flex: 1;
  }
}
</style>