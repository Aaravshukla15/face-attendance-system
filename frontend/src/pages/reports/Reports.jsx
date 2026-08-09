import { useEffect, useState } from "react";
import {
  CalendarDays,
  FileSpreadsheet,
  User,
  Download,
  Loader2,
} from "lucide-react";

import { getEmployees } from "../../services/employeeService";
import {
  downloadDailyAttendanceReport as downloadDailyReport,
  downloadMonthlyAttendanceReport as downloadMonthlyReport,
} from "../../services/attendanceService";

export default function Reports() {
  // State

  const [dailyDate, setDailyDate] = useState("");

  const [employee, setEmployee] = useState("All Employees");

  const [month, setMonth] = useState("");

  const [employees, setEmployees] = useState([]);

  const [employeesLoading, setEmployeesLoading] = useState(true);

  const [dailyLoading, setDailyLoading] = useState(false);

  const [monthlyLoading, setMonthlyLoading] = useState(false);

  const [error, setError] = useState("");

  // Load Employees

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setEmployeesLoading(true);
        setError("");

        const data = await getEmployees();

        const employeeList = Array.isArray(data) ? data : data.results || [];

        setEmployees(employeeList);
      } catch (error) {
        console.error("Failed to load employees:", error);

        setError("Unable to load employees.");
      } finally {
        setEmployeesLoading(false);
      }
    };

    loadEmployees();
  }, []);

  // Download File Helper

  const downloadFile = (response, defaultFileName) => {
    const blob = new Blob([response.data], {
      type: response.headers["content-type"],
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    // Try to get filename from backend
    const contentDisposition = response.headers["content-disposition"];

    let fileName = defaultFileName;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);

      if (match && match[1]) {
        fileName = match[1];
      }
    }

    link.setAttribute("download", fileName);

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  };

  // Daily Report

  const handleDailyReport = async () => {
    if (!dailyDate) {
      return;
    }

    try {
      setDailyLoading(true);
      setError("");

      const response = await downloadDailyReport(dailyDate);

      downloadFile(response, `attendance_${dailyDate}.xlsx`);
    } catch (error) {
      console.error("Failed to download daily report:", error);

      setError("Unable to download the daily attendance report.");
    } finally {
      setDailyLoading(false);
    }
  };

  // Monthly Report

  const handleMonthlyReport = async () => {
    if (!month) {
      return;
    }

    try {
      setMonthlyLoading(true);
      setError("");

      const response = await downloadMonthlyReport(month, employee);

      const fileName =
        employee === "All Employees"
          ? `attendance_${month}.xlsx`
          : `attendance_${employee}_${month}.xlsx`;

      downloadFile(response, fileName);
    } catch (error) {
      console.error("Failed to download monthly report:", error);

      setError("Unable to download the monthly attendance report.");
    } finally {
      setMonthlyLoading(false);
    }
  };

  // Render

  return (
    <div>
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Reports</h1>

        <p className="text-gray-500 mt-1">
          Generate and download employee attendance reports.
        </p>
      </div>

      {/* Error */}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Report Cards */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* DAILY ATTENDANCE REPORT */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Card Header */}

          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <FileSpreadsheet size={24} className="text-blue-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Daily Attendance Report
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Generate attendance report for a specific date.
              </p>
            </div>
          </div>

          {/* Date */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>

            <div className="relative">
              <CalendarDays
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="date"
                value={dailyDate}
                onChange={(event) => setDailyDate(event.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <p className="text-xs text-gray-400 mt-1">
              Select the date for which you want the attendance report.
            </p>
          </div>

          {/* Download */}

          <button
            type="button"
            onClick={handleDailyReport}
            disabled={!dailyDate || dailyLoading}
            className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {dailyLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download size={18} />
                Download Daily Report
              </>
            )}
          </button>
        </div>

        {/* MONTHLY EMPLOYEE REPORT */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Card Header */}

          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <User size={24} className="text-green-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Employee Monthly Report
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Generate a monthly attendance report for an employee or all
                employees.
              </p>
            </div>
          </div>

          {/* Employee */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee
            </label>

            <select
              value={employee}
              onChange={(event) => setEmployee(event.target.value)}
              disabled={employeesLoading}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            >
              <option value="All Employees">All Employees</option>

              {employees.map((item) => (
                <option key={item.id} value={item.employee_id}>
                  {item.name} ({item.employee_id})
                </option>
              ))}
            </select>
          </div>

          {/* Month */}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Month
            </label>

            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Report Type Information */}

          <div className="mt-4 bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">
              {employee === "All Employees"
                ? "The report will contain attendance records for all employees."
                : `The report will contain attendance records for ${employee}.`}
            </p>
          </div>

          {/* Download */}

          <button
            type="button"
            onClick={handleMonthlyReport}
            disabled={!month || monthlyLoading}
            className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {monthlyLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download size={18} />
                Download Monthly Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* More Reports */}

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5">
        <h3 className="font-semibold text-blue-800">More Reports</h3>

        <p className="text-sm text-blue-700 mt-1">
          Department-wise and overall monthly attendance reports can be added
          here as the reporting system expands.
        </p>
      </div>
    </div>
  );
}
