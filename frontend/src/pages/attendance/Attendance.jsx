import { useEffect, useState } from "react";
import { getTodayAttendance } from "../../services/attendanceService";

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayAttendance = async () => {
      try {
        setLoading(true);

        const data = await getTodayAttendance();

        setAttendance(data.results || []);
      } catch (error) {
        console.error("Failed to load attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayAttendance();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <h2 className="text-xl font-semibold">Loading Attendance...</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Attendance</h1>

        <p className="text-gray-500 mt-1">View today's employee attendance.</p>
      </div>

      {/* Summary */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Total Attendance</p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {attendance.length}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Checked In</p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {attendance.filter((record) => record.check_in).length}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Checked Out</p>

          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            {attendance.filter((record) => record.check_out).length}
          </h2>
        </div>
      </div>

      {/* Attendance Table */}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Today's Attendance
          </h2>
        </div>

        {attendance.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No attendance records found for today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-100 text-gray-700 uppercase text-sm">
                  <th className="p-4 text-left">Employee ID</th>

                  <th className="p-4 text-left">Employee Name</th>

                  <th className="p-4 text-left">Check In</th>

                  <th className="p-4 text-left">Check Out</th>

                  <th className="p-4 text-left">Status</th>
                </tr>
              </thead>

              <tbody>
                {attendance.map((record) => (
                  <tr
                    key={record.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium">{record.employee_id}</td>

                    <td className="p-4">{record.employee_name}</td>

                    <td className="p-4">
                      {record.check_in
                        ? new Date(record.check_in).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>

                    <td className="p-4">
                      {record.check_out
                        ? new Date(record.check_out).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>

                    <td className="p-4">
                      {record.check_out ? (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          Completed
                        </span>
                      ) : record.check_in ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                          Checked In
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
