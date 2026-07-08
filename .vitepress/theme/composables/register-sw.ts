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
