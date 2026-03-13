import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { CalGasProvider } from "@/contexts/CalibrationGasContext";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import StatusTable from "@/pages/StatusTable";
import UserManagement from "@/pages/UserManagement";
import CalibrationGas from "@/pages/CalibrationGas";
import CalibrationGasInventory from "@/pages/calibration-gas/CalibrationGasInventory";
import CalibrationGasUpload from "@/pages/calibration-gas/CalibrationGasUpload";
import CalibrationGasReview from "@/pages/calibration-gas/CalibrationGasReview";
import CalibrationGasHistory from "@/pages/calibration-gas/CalibrationGasHistory";
import CalibrationGasNotifications from "@/pages/calibration-gas/CalibrationGasNotifications";
import CalibrationGasExport from "@/pages/calibration-gas/CalibrationGasExport";
import FirstReport from "@/pages/FirstReport";
import FinalReport from "@/pages/FinalReport";
import Login from "@/pages/Login";
import NotificationCenter from "@/pages/NotificationCenter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useApp();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">데이터 로딩 중...</p></div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      element={
        <RequireAuth>
          <Layout />
        </RequireAuth>
      }
    >
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/status-table" element={<StatusTable />} />
      <Route path="/user-management" element={<UserManagement />} />
      <Route path="/calibration-gas" element={<CalibrationGas />}>
        <Route path="inventory" element={<CalibrationGasInventory />} />
        <Route path="upload" element={<CalibrationGasUpload />} />
        <Route path="review" element={<CalibrationGasReview />} />
        <Route path="history" element={<CalibrationGasHistory />} />
        <Route path="notifications" element={<CalibrationGasNotifications />} />
        <Route path="export" element={<CalibrationGasExport />} />
      </Route>
      <Route path="/first-report" element={<FirstReport />} />
      <Route path="/final-report" element={<FinalReport />} />
      <Route path="/notifications" element={<NotificationCenter />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <CalGasProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CalGasProvider>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
