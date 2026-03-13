import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Monitor, Smartphone, CheckCircle2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();

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
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img src="/pwa-icon-192.png" alt="앱 아이콘" className="w-20 h-20 rounded-2xl shadow-md mx-auto" />
          </div>
          <CardTitle className="text-xl">DXG 반출/가스</CardTitle>
          <CardDescription>PC 및 모바일에서 앱처럼 설치하여 사용하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {installed ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-sm font-medium">앱이 설치되었습니다!</p>
              <p className="text-xs text-muted-foreground">홈 화면 또는 바탕화면에서 앱을 실행하세요.</p>
            </div>
          ) : (
            <>
              {/* Direct install button (Chrome/Edge on desktop & Android) */}
              {deferredPrompt && (
                <Button onClick={handleInstall} className="w-full gap-2" size="lg">
                  <Download className="h-5 w-5" />
                  지금 설치하기
                </Button>
              )}

              {/* PC Instructions */}
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <Monitor className="h-4 w-4 text-primary" />
                  PC (Chrome / Edge)
                </div>
                <ol className="text-xs text-muted-foreground space-y-1 ml-6 list-decimal">
                  <li>Chrome 또는 Edge 브라우저에서 이 페이지를 엽니다</li>
                  <li>주소창 오른쪽의 <strong>설치 아이콘(⊕)</strong>을 클릭합니다</li>
                  <li>"설치" 버튼을 눌러 바탕화면에 앱을 추가합니다</li>
                </ol>
              </div>

              {/* Android Instructions */}
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <Smartphone className="h-4 w-4 text-primary" />
                  Android (Chrome)
                </div>
                <ol className="text-xs text-muted-foreground space-y-1 ml-6 list-decimal">
                  <li>Chrome 브라우저에서 이 페이지를 엽니다</li>
                  <li>상단 메뉴(⋮) → <strong>"앱 설치"</strong> 또는 <strong>"홈 화면에 추가"</strong>를 선택합니다</li>
                  <li>"설치"를 눌러 홈 화면에 앱을 추가합니다</li>
                </ol>
              </div>

              {/* iOS Instructions */}
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <Smartphone className="h-4 w-4 text-primary" />
                  iPhone / iPad (Safari)
                </div>
                <ol className="text-xs text-muted-foreground space-y-1 ml-6 list-decimal">
                  <li><strong>Safari</strong> 브라우저에서 이 페이지를 엽니다</li>
                  <li>하단의 <strong>공유 버튼(□↑)</strong>을 탭합니다</li>
                  <li><strong>"홈 화면에 추가"</strong>를 선택합니다</li>
                  <li>"추가"를 눌러 홈 화면에 앱을 추가합니다</li>
                </ol>
                {isIOS && (
                  <p className="text-xs text-orange-600 mt-2">
                    ⚠️ iOS에서는 반드시 Safari를 사용해야 설치가 가능합니다.
                  </p>
                )}
              </div>
            </>
          )}

          <Button variant="ghost" className="w-full gap-1.5 text-xs" onClick={() => navigate("/login")}>
            <ArrowLeft className="h-3.5 w-3.5" />
            로그인 화면으로 이동
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
