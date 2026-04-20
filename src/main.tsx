import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initInstallPromptListener } from "@/lib/pwaInstallPrompt";
import { registerSW } from "virtual:pwa-register";

initInstallPromptListener();

// PWA 자동 업데이트: 새 빌드 감지 시 캐시 전부 비우고 즉시 reload
if ("serviceWorker" in navigator) {
  const hardReload = async () => {
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      // ignore
    }
    window.location.reload();
  };

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // 새 빌드 감지 → 즉시 활성화 후 캐시 비우고 reload
      updateSW(true).then(hardReload).catch(hardReload);
    },
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      const checkForUpdate = () => {
        registration.update().catch(() => {});
      };

      // 5분마다 새 버전 체크 (기존 1시간 → 단축)
      setInterval(checkForUpdate, 5 * 60 * 1000);

      // 탭이 다시 포커스되거나 보이게 될 때 즉시 체크 (설치앱에서 복귀 시 최신본 반영)
      window.addEventListener("focus", checkForUpdate);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkForUpdate();
      });
      // 온라인 복귀 시에도 체크
      window.addEventListener("online", checkForUpdate);
    },
  });

  // 새 SW가 활성화되면 자동 reload (다른 탭/창에서 업데이트된 경우 포함)
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    hardReload();
  });
}

createRoot(document.getElementById("root")!).render(<App />);
