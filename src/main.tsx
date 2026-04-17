import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initInstallPromptListener } from "@/lib/pwaInstallPrompt";
import { registerSW } from "virtual:pwa-register";

initInstallPromptListener();

// PWA 자동 업데이트: 새 버전 감지 시 캐시 비우고 즉시 갱신
if ("serviceWorker" in navigator) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // 새 빌드 감지 → 즉시 활성화 후 reload
      updateSW(true);
    },
    onRegisteredSW(_swUrl, registration) {
      // 1시간마다 새 버전 체크
      if (registration) {
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);
      }
    },
  });
}

createRoot(document.getElementById("root")!).render(<App />);
