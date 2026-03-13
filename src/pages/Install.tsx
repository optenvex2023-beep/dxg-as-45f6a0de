import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-sm">
        <CardContent className="pt-8 pb-6 px-6 flex flex-col items-center text-center gap-4">
          {installed ? (
            <>
              <CheckCircle2 className="h-14 w-14 text-green-500" />
              <h1 className="text-lg font-bold">설치 완료!</h1>
              <p className="text-sm text-muted-foreground">
                홈 화면의 DXG 아이콘을 탭하면 앱이 실행됩니다
              </p>
            </>
          ) : (
            <>
              <img
                src="/pwa-icon-192.png"
                alt="DXG 반출/가스"
                className="w-24 h-24 rounded-2xl shadow-sm"
              />
              <div className="space-y-1">
                <h1 className="text-xl font-bold">DXG 반출/가스 설치</h1>
                <p className="text-sm text-muted-foreground">
                  홈 화면에 추가하여 앱처럼 사용하세요
                </p>
              </div>

              <Button
                onClick={handleInstall}
                className="w-full gap-2 mt-2"
                size="lg"
                disabled={!deferredPrompt}
              >
                <Download className="h-5 w-5" />
                앱 설치하기
              </Button>

              <div className="w-full border-t pt-4 mt-1">
                <p className="text-xs text-muted-foreground">
                  설치 후 홈 화면의 DXG 아이콘을 탭하면 앱이 실행됩니다
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
