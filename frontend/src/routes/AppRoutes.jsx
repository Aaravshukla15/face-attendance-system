import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";

import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

import Home from "../pages/home/Home";
import EmployeeList from "../pages/employees/EmployeeList";
import EmployeeDetails from "../pages/employees/EmployeeDetails";
import EditEmployee from "../pages/employees/EditEmployee";
import AddEmployee from "../pages/employees/AddEmployee";

import Attendance from "../pages/attendance/Attendance";
import RecordAttendance from "../pages/attendance/RecordAttendance";
import Reports from "../pages/reports/Reports";
import Settings from "../pages/settings/Settings";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}

        <Route path="/" element={<Home />} />

        <Route path="/admin-login" element={<Login />} />

        <Route path="/attendance/record" element={<RecordAttendance />} />

        {/* Protected Routes */}

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Employee Routes */}

          <Route path="/employees" element={<EmployeeList />} />

          <Route path="/employees/add" element={<AddEmployee />} />

          <Route path="/employees/edit/:id" element={<EditEmployee />} />

          <Route path="/employees/:id" element={<EmployeeDetails />} />

          {/* Attendance */}

          <Route path="/attendance" element={<Attendance />} />

          {/* Reports */}

          <Route path="/reports" element={<Reports />} />

          {/* Settings */}

          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
