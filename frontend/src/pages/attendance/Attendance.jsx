import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  CalendarDays,
  Users,
  UserCheck,
  X,
} from "lucide-react";

import { getAttendance } from "../../services/attendanceService";
import { getEmployees } from "../../services/employeeService";

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------
  // Filters
  // --------------------------------

  const [date, setDate] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [employee, setEmployee] = useState("All Employees");
  const [search, setSearch] = useState("");

  // --------------------------------
  // Refresh
  // --------------------------------

  const [refreshKey, setRefreshKey] = useState(0);

  // --------------------------------
  // Fetch Employees
  // --------------------------------

  useEffect(() => {
    let cancelled = false;

    const loadEmployees = async () => {
      try {
        setEmployeesLoading(true);

        const data = await getEmployees();

        if (!cancelled) {
          setEmployees(Array.isArray(data) ? data : data.results || []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load employees:", error);
        }
      } finally {
        if (!cancelled) {
          setEmployeesLoading(false);
        }
      }
    };

    loadEmployees();

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------
  // Fetch Attendance
  // Whenever filters change
  // --------------------------------

  useEffect(() => {
    let cancelled = false;

    const loadAttendance = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {};

        // -----------------------------
        // Date
        // -----------------------------

        if (date) {
          params.date = date;
        }

        // -----------------------------
        // Department
        // -----------------------------

        if (department !== "All Departments") {
          params.employee__department = department;
        }

        // -----------------------------
        // Employee
        // -----------------------------

        if (employee !== "All Employees") {
          params.employee__employee_id = employee;
        }

        // -----------------------------
        // Search
        // -----------------------------

        if (search.trim()) {
          params.search = search.trim();
        }

        console.log("Attendance filters:", params);

        const data = await getAttendance(params);

        if (!cancelled) {
          setAttendance(Array.isArray(data) ? data : data.results || []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load attendance:", error);

          setError("Unable to load attendance records.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAttendance();

    return () => {
      cancelled = true;
    };
  }, [date, department, employee, search, refreshKey]);

  // --------------------------------
  // Departments
  // --------------------------------

  const departments = [
    ...new Set(employees.map((item) => item.department).filter(Boolean)),
  ].sort();

  // --------------------------------
  // Employees Based On Department
  // --------------------------------

  const filteredEmployees =
    department === "All Departments"
      ? employees
      : employees.filter((item) => item.department === department);

  // --------------------------------
  // Clear Filters
  // --------------------------------

  const clearFilters = () => {
    setDate("");
    setDepartment("All Departments");
    setEmployee("All Employees");
    setSearch("");
  };

  // --------------------------------
  // Check If Any Filter Is Active
  // --------------------------------

  const hasActiveFilters =
    date !== "" ||
    department !== "All Departments" ||
    employee !== "All Employees" ||
    search.trim() !== "";

  // --------------------------------
  // Refresh Attendance
  // --------------------------------

  const handleRefresh = () => {
    setRefreshKey((current) => current + 1);
  };

  // --------------------------------
  // Format Date
  // --------------------------------

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const dateObject = new Date(`${value}T00:00:00`);

    return dateObject.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // --------------------------------
  // Format Time
  // --------------------------------

  const formatTime = (dateTime) => {
    if (!dateTime) {
      return "—";
    }

    return new Date(dateTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --------------------------------
  // Get Department
  // --------------------------------

  const getDepartment = (record) => {
    // If serializer returns nested employee object
    if (record.employee?.department) {
      return record.employee.department;
    }

    // If serializer directly returns department
    if (record.department) {
      return record.department;
    }

    // Fallback: find employee in employee list
    const matchedEmployee = employees.find(
      (item) => item.employee_id === record.employee_id,
    );

    return matchedEmployee?.department || "—";
  };

  // --------------------------------
  // Get Employee ID
  // --------------------------------

  const getEmployeeId = (record) => {
    return record.employee_id || record.employee?.employee_id || "—";
  };

  // --------------------------------
  // Get Employee Name
  // --------------------------------

  const getEmployeeName = (record) => {
    return record.employee_name || record.employee?.name || "Unknown Employee";
  };

  // --------------------------------
  // Status
  // --------------------------------

  const getStatus = (record) => {
    if (record.check_out) {
      return {
        text: "Completed",
        className: "bg-blue-100 text-blue-700",
      };
    }

    if (record.check_in) {
      return {
        text: "Checked In",
        className: "bg-green-100 text-green-700",
      };
    }

    return {
      text: "Pending",
      className: "bg-gray-100 text-gray-600",
    };
  };

  // --------------------------------
  // Summary
  // --------------------------------

  const totalAttendance = attendance.length;

  const checkedIn = attendance.filter((record) => record.check_in).length;

  const checkedOut = attendance.filter((record) => record.check_out).length;

  // --------------------------------
  // Render
  // --------------------------------

  return (
    <div>
      {/* -------------------------------- */}
      {/* Header */}
      {/* -------------------------------- */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Attendance</h1>

          <p className="text-gray-500 mt-1">
            View and manage employee attendance records.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* -------------------------------- */}
      {/* Filters */}
      {/* -------------------------------- */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>

            <div className="relative">
              <CalendarDays
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <p className="text-xs text-gray-400 mt-1">
              Leave blank to view all dates.
            </p>
          </div>

          {/* Department */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>

            <select
              value={department}
              onChange={(event) => {
                setDepartment(event.target.value);
                setEmployee("All Employees");
              }}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Departments">All Departments</option>

              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Employee */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee
            </label>

            <select
              value={employee}
              onChange={(event) => setEmployee(event.target.value)}
              disabled={employeesLoading}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="All Employees">All Employees</option>

              {filteredEmployees.map((item) => (
                <option key={item.id} value={item.employee_id}>
                  {item.name} ({item.employee_id})
                </option>
              ))}
            </select>
          </div>

          {/* Search */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Employee name or ID"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters */}

        {hasActiveFilters && (
          <div className="flex justify-end mt-5 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <X size={16} />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* -------------------------------- */}
      {/* Error */}
      {/* -------------------------------- */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {/* -------------------------------- */}
      {/* Summary */}
      {/* -------------------------------- */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Total */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Attendance</p>

              <p className="text-3xl font-bold text-gray-800 mt-2">
                {loading ? "—" : totalAttendance}
              </p>
            </div>

            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Checked In */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Checked In</p>

              <p className="text-3xl font-bold text-green-600 mt-2">
                {loading ? "—" : checkedIn}
              </p>
            </div>

            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <UserCheck size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Checked Out */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Checked Out</p>

              <p className="text-3xl font-bold text-blue-600 mt-2">
                {loading ? "—" : checkedOut}
              </p>
            </div>

            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <UserCheck size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------- */}
      {/* Attendance Table */}
      {/* -------------------------------- */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Header */}

        <div className="px-5 sm:px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Attendance Records
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {date
              ? `Attendance for ${formatDate(date)}`
              : "All available attendance records"}
          </p>
        </div>

        {/* Loading */}

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading attendance...
          </div>
        ) : attendance.length === 0 ? (
          <div className="p-10 text-center">
            <UserCheck size={40} className="mx-auto text-gray-300" />

            <p className="mt-3 text-gray-500">No attendance records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 sm:px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Date
                  </th>

                  <th className="px-5 sm:px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Employee ID
                  </th>

                  <th className="px-5 sm:px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Employee Name
                  </th>

                  <th className="px-5 sm:px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Department
                  </th>

                  <th className="px-5 sm:px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Check In
                  </th>

                  <th className="px-5 sm:px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Check Out
                  </th>

                  <th className="px-5 sm:px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {attendance.map((record) => {
                  const status = getStatus(record);

                  return (
                    <tr
                      key={record.id}
                      className="border-t border-gray-200 hover:bg-gray-50 transition"
                    >
                      {/* Date */}

                      <td className="px-5 sm:px-6 py-4 text-sm text-gray-700">
                        {formatDate(record.date)}
                      </td>

                      {/* Employee ID */}

                      <td className="px-5 sm:px-6 py-4 text-sm font-medium text-gray-800">
                        {getEmployeeId(record)}
                      </td>

                      {/* Employee Name */}

                      <td className="px-5 sm:px-6 py-4 text-sm text-gray-700">
                        {getEmployeeName(record)}
                      </td>

                      {/* Department */}

                      <td className="px-5 sm:px-6 py-4 text-sm text-gray-700">
                        {getDepartment(record)}
                      </td>

                      {/* Check In */}

                      <td className="px-5 sm:px-6 py-4 text-sm text-gray-700">
                        {formatTime(record.check_in)}
                      </td>

                      {/* Check Out */}

                      <td className="px-5 sm:px-6 py-4 text-sm text-gray-700">
                        {formatTime(record.check_out)}
                      </td>

                      {/* Status */}

                      <td className="px-5 sm:px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${status.className}`}
                        >
                          {status.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
