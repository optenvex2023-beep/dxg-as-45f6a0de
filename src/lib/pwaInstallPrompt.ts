export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __dxgDeferredInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

let initialized = false;

export const getDeferredInstallPrompt = (): BeforeInstallPromptEvent | null =>
  window.__dxgDeferredInstallPrompt ?? null;

export const clearDeferredInstallPrompt = () => {
  window.__dxgDeferredInstallPrompt = null;
};

export const initInstallPromptListener = () => {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    window.__dxgDeferredInstallPrompt = event as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent("dxg-install-prompt-ready"));
  });

  window.addEventListener("appinstalled", () => {
    clearDeferredInstallPrompt();
    window.dispatchEvent(new CustomEvent("dxg-app-installed"));
  });
};
