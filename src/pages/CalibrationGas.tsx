import { Outlet, Navigate, useLocation } from "react-router-dom";

export default function CalibrationGas() {
  const location = useLocation();

  // Redirect bare /calibration-gas to /calibration-gas/inventory
  if (location.pathname === "/calibration-gas") {
    return <Navigate to="/calibration-gas/inventory" replace />;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
}
