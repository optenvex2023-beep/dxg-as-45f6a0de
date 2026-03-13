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
  const [showManual, setShowManual] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    } else {
      setShowManual(true);
    }
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
              >
                <Download className="h-5 w-5" />
                앱 설치하기
              </Button>

              {showManual && (
                <div className="w-full border rounded-lg p-4 text-left space-y-3 mt-1">
                  {isIOS ? (
                    <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal ml-4">
                      <li><strong>Safari</strong> 브라우저에서 이 페이지를 엽니다</li>
                      <li>하단의 <strong>공유 버튼(□↑)</strong>을 탭합니다</li>
                      <li><strong>"홈 화면에 추가"</strong>를 선택합니다</li>
                    </ol>
                  ) : (
                    <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal ml-4">
                      <li>Chrome 브라우저 상단 메뉴(<strong>⋮</strong>)를 탭합니다</li>
                      <li><strong>"앱 설치"</strong> 또는 <strong>"홈 화면에 추가"</strong>를 선택합니다</li>
                      <li>"설치"를 눌러 완료합니다</li>
                    </ol>
                  )}
                </div>
              )}

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
