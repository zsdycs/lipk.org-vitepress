import { ref } from "vue";
import { inBrowser } from "vitepress";

const isUpdateReady = ref(false);
let swRegistrationPromise: Promise<ServiceWorkerRegistration> | null = null;
let reloading = false;

function setWaitingWorker(registration: ServiceWorkerRegistration) {
  if (registration.waiting) {
    isUpdateReady.value = true;
  }
}

function watchInstallingWorker(registration: ServiceWorkerRegistration) {
  const installingWorker = registration.installing;
  if (!installingWorker) {
    return;
  }

  installingWorker.addEventListener("statechange", () => {
    if (
      installingWorker.state === "installed" &&
      navigator.serviceWorker.controller
    ) {
      setWaitingWorker(registration);
    }
  });
}

function bindReloadOnControllerChange() {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) {
      return;
    }
    reloading = true;
    window.location.reload();
  });
}

export const registerSW = () => {
  if (!inBrowser || !("serviceWorker" in navigator)) {
    return;
  }

  // 开发环境不要注册 Service Worker。
  // 它会把 Vite 的模块脚本以 cache-first 缓存，代码更新后仍命中旧模块，
  // 导致模块/Vue 实例不一致（resolveComponent 只能在 render()/setup()
  // 中使用的警告、组件渲染不出来）。开发环境由 dev-sw-cleanup 插件
  // 提供自注销的 /sw.js 来清理历史遗留的注册。
  if (import.meta.env.DEV) {
    return;
  }

  if (!swRegistrationPromise) {
    bindReloadOnControllerChange();
    swRegistrationPromise = navigator.serviceWorker.register("/sw.js", {
      updateViaCache: "none",
    });
    void swRegistrationPromise.then((registration) => {
      setWaitingWorker(registration);

      registration.addEventListener("updatefound", () => {
        watchInstallingWorker(registration);
      });
    });
  }

  return swRegistrationPromise;
};

export const useServiceWorkerUpdate = () => {
  const reloadWithUpdate = async () => {
    const registration = await swRegistrationPromise;
    if (!registration?.waiting) {
      return;
    }

    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  };

  const dismissUpdate = () => {
    isUpdateReady.value = false;
  };

  return {
    isUpdateReady,
    reloadWithUpdate,
    dismissUpdate,
  };
};
