import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  CalendarDays,
  UserCheck,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { getAttendance } from "../../services/attendanceService";
import { getAllEmployeesForFilters } from "../../services/employeeService";

export default function Attendance() {
  // ============================================================
  // STATE
  // ============================================================

  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(true);

  const [error, setError] = useState("");
  const [employeesError, setEmployeesError] = useState("");

  // ============================================================
  // FILTERS
  // ============================================================

  const [date, setDate] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [employee, setEmployee] = useState("All Employees");
  const [search, setSearch] = useState("");

  // Debounced search value
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ============================================================
  // PAGINATION
  // ============================================================

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // ============================================================
  // REFRESH
  // ============================================================

  const [refreshKey, setRefreshKey] = useState(0);

  // ============================================================
  // LOAD EMPLOYEES FOR FILTERS
  //
  // IMPORTANT:
  // This runs ONLY once when Attendance page loads.
  //
  // It does NOT depend on refreshKey.
  // Therefore clicking Refresh will NOT repeatedly call
  // /api/employees/.
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadEmployees = async () => {
      try {
        setEmployeesLoading(true);
        setEmployeesError("");

        const data = await getAllEmployeesForFilters();

        if (cancelled) return;

        if (Array.isArray(data)) {
          setEmployees(data);
        } else {
          setEmployees([]);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load employees for attendance filters:",
            error,
          );

          setEmployees([]);
          setEmployeesError("Unable to load employees for attendance filters.");
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

  // ============================================================
  // DEBOUNCE SEARCH
  //
  // Prevents an API request for every single character typed.
  // ============================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // ============================================================
  // LOAD ATTENDANCE
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadAttendance = async () => {
      try {
        setLoading(true);
        setError("");

        // --------------------------------------------------------
        // Build API parameters
        // --------------------------------------------------------

        const params = {
          page: currentPage,
        };

        // --------------------------------------------------------
        // DATE FILTER
        // --------------------------------------------------------

        if (date) {
          params.date = date;
        }

        // --------------------------------------------------------
        // DEPARTMENT FILTER
        // --------------------------------------------------------

        if (department !== "All Departments") {
          params.employee__department = department;
        }

        // --------------------------------------------------------
        // EMPLOYEE FILTER
        // --------------------------------------------------------

        if (employee !== "All Employees") {
          params.employee__employee_id = employee;
        }

        // --------------------------------------------------------
        // SEARCH FILTER
        // --------------------------------------------------------

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        console.log("Attendance filters:", params);

        // --------------------------------------------------------
        // API CALL
        // --------------------------------------------------------

        const data = await getAttendance(params);

        if (cancelled) return;

        // --------------------------------------------------------
        // NON-PAGINATED RESPONSE
        // --------------------------------------------------------

        if (Array.isArray(data)) {
          setAttendance(data);
          setTotalRecords(data.length);

          setHasNextPage(false);
          setHasPreviousPage(currentPage > 1);

          return;
        }

        // --------------------------------------------------------
        // PAGINATED DRF RESPONSE
        // --------------------------------------------------------

        const results = Array.isArray(data?.results) ? data.results : [];

        setAttendance(results);
        setTotalRecords(data?.count || 0);

        setHasNextPage(Boolean(data?.next));
        setHasPreviousPage(Boolean(data?.previous));
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load attendance:", error);

          setAttendance([]);
          setTotalRecords(0);
          setHasNextPage(false);
          setHasPreviousPage(false);

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
  }, [date, department, employee, debouncedSearch, currentPage, refreshKey]);

  // ============================================================
  // DEPARTMENTS
  //
  // Created from the complete employee list.
  // ============================================================

  const departments = useMemo(() => {
    const departmentSet = new Set();

    employees.forEach((item) => {
      if (item?.department) {
        departmentSet.add(item.department);
      }
    });

    return Array.from(departmentSet).sort((a, b) => a.localeCompare(b));
  }, [employees]);

  // ============================================================
  // EMPLOYEES BASED ON SELECTED DEPARTMENT
  // ============================================================

  const filteredEmployees = useMemo(() => {
    if (department === "All Departments") {
      return employees;
    }

    return employees.filter((item) => item?.department === department);
  }, [employees, department]);

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {
    setDate("");
    setDepartment("All Departments");
    setEmployee("All Employees");
    setSearch("");
    setDebouncedSearch("");
    setCurrentPage(1);
  };

  // ============================================================
  // CHECK ACTIVE FILTERS
  // ============================================================

  const hasActiveFilters =
    date !== "" ||
    department !== "All Departments" ||
    employee !== "All Employees" ||
    search.trim() !== "";

  // ============================================================
  // REFRESH ATTENDANCE
  //
  // Employee list is NOT reloaded.
  // Only attendance API is refreshed.
  // ============================================================

  const handleRefresh = () => {
    setCurrentPage(1);
    setRefreshKey((current) => current + 1);
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

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

  // ============================================================
  // FORMAT TIME
  // ============================================================

  const formatTime = (dateTime) => {
    if (!dateTime) {
      return "—";
    }

    return new Date(dateTime).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ============================================================
  // GET EMPLOYEE ID
  // ============================================================

  const getEmployeeId = (record) => {
    return record?.employee_id || record?.employee?.employee_id || "—";
  };

  // ============================================================
  // FIND EMPLOYEE
  //
  // This connects Attendance record → Employee record.
  // ============================================================

  const findEmployee = (record) => {
    const employeeId = getEmployeeId(record);

    if (!employeeId || employeeId === "—") {
      return null;
    }

    return employees.find((item) => item?.employee_id === employeeId) || null;
  };

  // ============================================================
  // GET EMPLOYEE NAME
  // ============================================================

  const getEmployeeName = (record) => {
    // First preference: nested employee data
    if (record?.employee?.name) {
      return record.employee.name;
    }

    // Second preference: serializer-provided name
    if (record?.employee_name) {
      return record.employee_name;
    }

    // Third preference: find employee locally
    const matchedEmployee = findEmployee(record);

    if (matchedEmployee?.name) {
      return matchedEmployee.name;
    }

    return "Unknown Employee";
  };

  // ============================================================
  // GET DEPARTMENT
  //
  // This fixes the "—" issue in your screenshot.
  // ============================================================

  const getDepartment = (record) => {
    // First preference: nested employee department
    if (record?.employee?.department) {
      return record.employee.department;
    }

    // Second preference: serializer-provided department
    if (record?.department) {
      return record.department;
    }

    // Third preference: match employee using employee_id
    const matchedEmployee = findEmployee(record);

    if (matchedEmployee?.department) {
      return matchedEmployee.department;
    }

    return "—";
  };

  // ============================================================
  // STATUS
  // ============================================================

  const getStatus = (record) => {
    if (record?.check_out) {
      return {
        text: "Completed",
        className: "bg-blue-100 text-blue-700",
      };
    }

    if (record?.check_in) {
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

  // ============================================================
  // PAGINATION
  // ============================================================

  const handlePreviousPage = () => {
    if (hasPreviousPage && !loading) {
      setCurrentPage((page) => Math.max(page - 1, 1));
    }
  };

  const handleNextPage = () => {
    if (hasNextPage && !loading) {
      setCurrentPage((page) => page + 1);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div>
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Attendance</h1>

          <p className="text-gray-500 mt-1">
            View and manage employee attendance records.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ====================================================== */}
      {/* FILTERS */}
      {/* ====================================================== */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ================================================== */}
          {/* DATE */}
          {/* ================================================== */}

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
                onChange={(event) => {
                  setDate(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <p className="text-xs text-gray-400 mt-1">
              Leave blank to view all dates.
            </p>
          </div>

          {/* ================================================== */}
          {/* DEPARTMENT */}
          {/* ================================================== */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>

            <select
              value={department}
              onChange={(event) => {
                setDepartment(event.target.value);

                // Reset employee whenever department changes
                setEmployee("All Employees");

                setCurrentPage(1);
              }}
              disabled={employeesLoading}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="All Departments">All Departments</option>

              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* ================================================== */}
          {/* EMPLOYEE */}
          {/* ================================================== */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee
            </label>

            <select
              value={employee}
              onChange={(event) => {
                setEmployee(event.target.value);
                setCurrentPage(1);
              }}
              disabled={employeesLoading}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="All Employees">All Employees</option>

              {filteredEmployees.map((item) => (
                <option
                  key={item.id || item.employee_id}
                  value={item.employee_id}
                >
                  {item.name} ({item.employee_id})
                </option>
              ))}
            </select>
          </div>

          {/* ================================================== */}
          {/* SEARCH */}
          {/* ================================================== */}

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
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Employee name or ID"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Employee loading/error message */}

        {employeesError && (
          <div className="mt-4 text-sm text-red-600">{employeesError}</div>
        )}

        {/* ================================================== */}
        {/* CLEAR FILTERS */}
        {/* ================================================== */}

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

      {/* ====================================================== */}
      {/* ERROR */}
      {/* ====================================================== */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {/* ====================================================== */}
      {/* ATTENDANCE TABLE */}
      {/* ====================================================== */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* ================================================== */}
        {/* TABLE HEADER */}
        {/* ================================================== */}

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

        {/* ================================================== */}
        {/* LOADING */}
        {/* ================================================== */}

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading attendance...
          </div>
        ) : attendance.length === 0 ? (
          /* ================================================== */
          /* EMPTY */
          /* ================================================== */

          <div className="p-10 text-center">
            <UserCheck size={40} className="mx-auto text-gray-300" />

            <p className="mt-3 text-gray-500">No attendance records found.</p>
          </div>
        ) : (
          <>
            {/* ================================================== */}
            {/* TABLE */}
            {/* ================================================== */}

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
                        {/* DATE */}

                        <td className="px-5 sm:px-6 py-4 text-sm text-gray-700">
                          {formatDate(record.date)}
                        </td>

                        {/* EMPLOYEE ID */}

                        <td className="px-5 sm:px-6 py-4 text-sm font-medium text-gray-800">
                          {getEmployeeId(record)}
                        </td>

                        {/* EMPLOYEE NAME */}

                        <td className="px-5 sm:px-6 py-4 text-sm text-gray-700">
                          {getEmployeeName(record)}
                        </td>

                        {/* DEPARTMENT */}

                        <td className="px-5 sm:px-6 py-4 text-sm text-gray-700">
                          {getDepartment(record)}
                        </td>

                        {/* CHECK IN */}

                        <td className="px-5 sm:px-6 py-4 text-sm text-gray-700">
                          {formatTime(record.check_in)}
                        </td>

                        {/* CHECK OUT */}

                        <td className="px-5 sm:px-6 py-4 text-sm text-gray-700">
                          {formatTime(record.check_out)}
                        </td>

                        {/* STATUS */}

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

            {/* ================================================== */}
            {/* PAGINATION */}
            {/* ================================================== */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 sm:px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Page{" "}
                <span className="font-medium text-gray-700">{currentPage}</span>
                {totalRecords > 0 && (
                  <>
                    {" "}
                    · Total records:{" "}
                    <span className="font-medium text-gray-700">
                      {totalRecords}
                    </span>
                  </>
                )}
              </p>

              <div className="flex items-center gap-2">
                {/* PREVIOUS */}

                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={!hasPreviousPage || loading}
                  className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={17} />
                  Previous
                </button>

                {/* NEXT */}

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={!hasNextPage || loading}
                  className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
