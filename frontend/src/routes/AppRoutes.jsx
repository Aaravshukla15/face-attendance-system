import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";

import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

import EmployeeList from "../pages/employees/EmployeeList";
import Attendance from "../pages/attendance/Attendance";
import Reports from "../pages/reports/Reports";
import Settings from "../pages/settings/Settings";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}

        <Route path="/" element={<Login />} />

        {/* Protected */}

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/employees" element={<EmployeeList />} />

          <Route path="/attendance" element={<Attendance />} />

          <Route path="/reports" element={<Reports />} />

          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
