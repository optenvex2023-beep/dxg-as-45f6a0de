import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import StatusTable from "@/pages/StatusTable";
import UserManagement from "@/pages/UserManagement";
import CalibrationGas from "@/pages/CalibrationGas";
import FirstReport from "@/pages/FirstReport";
import FinalReport from "@/pages/FinalReport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/status-table" element={<StatusTable />} />
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="/calibration-gas" element={<CalibrationGas />} />
              <Route path="/first-report" element={<FirstReport />} />
              <Route path="/final-report" element={<FinalReport />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
