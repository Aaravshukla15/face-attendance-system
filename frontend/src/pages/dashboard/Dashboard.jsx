import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  LogIn,
  LogOut,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function Dashboard() {
  const [attendance, setAttendance] = useState([]);

  // Real total employee count from API
  const [totalEmployeeCount, setTotalEmployeeCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [employeesResponse, attendanceResponse] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/employees/"),
          fetch("http://127.0.0.1:8000/api/attendance/today/"),
        ]);

        if (!employeesResponse.ok) {
          throw new Error("Failed to fetch employees.");
        }

        if (!attendanceResponse.ok) {
          throw new Error("Failed to fetch today's attendance.");
        }

        const employeesData = await employeesResponse.json();
        const attendanceData = await attendanceResponse.json();

        if (cancelled) return;

        // --------------------------------
        // REAL TOTAL EMPLOYEE COUNT
        // --------------------------------

        setTotalEmployeeCount(
          Array.isArray(employeesData)
            ? employeesData.length
            : employeesData.count || 0,
        );

        // --------------------------------
        // TODAY'S ATTENDANCE DATA
        // --------------------------------

        setAttendance(
          Array.isArray(attendanceData)
            ? attendanceData
            : attendanceData.results || [],
        );
      } catch (error) {
        if (cancelled) return;

        console.error("Dashboard error:", error);
        setError("Unable to load dashboard data.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((value) => value + 1);
  };

  // Use API count instead of paginated employee array length
  const totalEmployees = totalEmployeeCount;

  const presentToday = attendance.length;

  const checkedIn = attendance.filter((record) => record.check_in).length;

  const checkedOut = attendance.filter((record) => record.check_out).length;

  const formatTime = (dateTime) => {
    if (!dateTime) return "—";

    return new Date(dateTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEmployeeId = (record) => {
    if (record.employee?.employee_id) {
      return record.employee.employee_id;
    }

    return record.employee_id || "—";
  };

  const getEmployeeName = (record) => {
    if (record.employee?.name) {
      return record.employee.name;
    }

    return record.employee_name || "Unknown Employee";
  };

  const getStatus = (record) => {
    if (record.check_in && record.check_out) {
      return {
        text: "Completed",
        className: "bg-blue-100 text-blue-700",
      };
    }

    if (record.check_in) {
      return {
        text: "Working",
        className: "bg-green-100 text-green-700",
      };
    }

    return {
      text: "Not Checked In",
      className: "bg-gray-100 text-gray-600",
    };
  };

  return (
    <div>
      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

          <p className="mt-2 text-gray-500">
            Welcome to Face Attendance System
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

      {/* Error */}

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Statistics */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
        {/* Total Employees */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Employees</p>

              <p className="text-3xl font-bold text-gray-800 mt-2">
                {loading ? "—" : totalEmployees}
              </p>
            </div>

            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Present Today */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Present Today</p>

              <p className="text-3xl font-bold text-gray-800 mt-2">
                {loading ? "—" : presentToday}
              </p>
            </div>

            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <UserCheck size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Checked In */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Checked In</p>

              <p className="text-3xl font-bold text-gray-800 mt-2">
                {loading ? "—" : checkedIn}
              </p>
            </div>

            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <LogIn size={24} className="text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Checked Out */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Checked Out</p>

              <p className="text-3xl font-bold text-gray-800 mt-2">
                {loading ? "—" : checkedOut}
              </p>
            </div>

            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <LogOut size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Attendance */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8 overflow-hidden">
        {/* Table Header */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-5 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Today's Attendance
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Employees who have recorded attendance today.
            </p>
          </div>

          <Link
            to="/attendance"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View All Attendance
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* Loading */}

        {loading && (
          <div className="p-8 text-center text-gray-500">
            Loading today's attendance...
          </div>
        )}

        {/* Empty */}

        {!loading && !error && attendance.length === 0 && (
          <div className="p-10 text-center">
            <UserCheck size={40} className="mx-auto text-gray-300" />

            <p className="mt-3 text-gray-500">
              No attendance has been recorded today.
            </p>
          </div>
        )}

        {/* Desktop Table */}

        {!loading && attendance.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 sm:px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Employee ID
                  </th>

                  <th className="px-5 sm:px-6 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Employee Name
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
                      <td className="px-5 sm:px-6 py-4 text-sm font-medium text-gray-800">
                        {getEmployeeId(record)}
                      </td>

                      <td className="px-5 sm:px-6 py-4 text-sm text-gray-700">
                        {getEmployeeName(record)}
                      </td>

                      <td className="px-5 sm:px-6 py-4 text-sm text-gray-700">
                        {formatTime(record.check_in)}
                      </td>

                      <td className="px-5 sm:px-6 py-4 text-sm text-gray-700">
                        {formatTime(record.check_out)}
                      </td>

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

        {/* Mobile View All */}

        {!loading && attendance.length > 0 && (
          <div className="sm:hidden border-t border-gray-200 p-4">
            <Link
              to="/attendance"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              View All Attendance
              <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
