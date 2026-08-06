import { useEffect, useState } from "react";
import EmployeeHeader from "../../components/employees/EmployeeHeader";
import { getEmployees } from "../../services/employeeService";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getEmployees(search);
        setEmployees(data.results);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [search]);

  if (loading) {
    return <h2>Loading Employees...</h2>;
  }

  return (
    <div>
      <EmployeeHeader />

      {/* Search Box */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-100 text-gray-700 uppercase text-sm">
              <th className="p-3 text-left">Employee ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Designation</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr
                key={employee.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-3">{employee.employee_id}</td>

                <td className="p-3">{employee.name}</td>

                <td className="p-3">{employee.department}</td>

                <td className="p-3">{employee.designation}</td>

                <td className="p-3">
                  {employee.is_active ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      Active
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                      Inactive
                    </span>
                  )}
                </td>

                <td className="p-3">
                  <div className="flex gap-2">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
                      View
                    </button>

                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
