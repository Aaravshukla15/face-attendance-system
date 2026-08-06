import { useEffect, useState } from "react";
import EmployeeHeader from "../../components/employees/EmployeeHeader";
import {
  getEmployees,
  toggleEmployeeStatus,
} from "../../services/employeeService";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil } from "lucide-react";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search Input
  const [searchInput, setSearchInput] = useState("");

  // Actual Search Query
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [count, setCount] = useState(0);

  const [next, setNext] = useState(null);

  const [previous, setPrevious] = useState(null);

  const navigate = useNavigate();

  const handleToggleStatus = async (employee) => {
    const action = employee.is_active ? "deactivate" : "activate";

    const confirmAction = window.confirm(
      `Are you sure you want to ${action} ${employee.name}?`,
    );

    if (!confirmAction) return;

    try {
      await toggleEmployeeStatus(employee.id);

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employee.id ? { ...emp, is_active: !emp.is_active } : emp,
        ),
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update employee status.");
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);

        const data = await getEmployees(page, search);

        setEmployees(data.results);
        setCount(data.count);
        setNext(data.next);
        setPrevious(data.previous);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [search, page]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-72">
        <h2 className="text-xl font-semibold">Loading Employees...</h2>
      </div>
    );
  }

  return (
    <div>
      <EmployeeHeader />

      {/* Search */}

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by Employee ID, Name, Department..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearch(searchInput);
                setPage(1);
              }
            }}
            className="flex-1 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={() => {
              setSearch(searchInput);
              setPage(1);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Search
          </button>

          <button
            onClick={() => {
              setSearch("");
              setSearchInput("");
              setPage(1);
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Employee Table */}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-100 text-gray-700 uppercase text-sm">
              <th className="p-4 text-left">Employee</th>

              <th className="p-4 text-left">Department</th>

              <th className="p-4 text-left">Designation</th>

              <th className="p-4 text-left">Status</th>

              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {employees.length > 0 ? (
              employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  {/* Employee */}

                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      {employee.photo ? (
                        <img
                          src={employee.photo}
                          alt={employee.name}
                          className="w-12 h-12 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold">
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-gray-800">
                          {employee.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {employee.employee_id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">{employee.department}</td>

                  <td className="p-4">{employee.designation}</td>

                  <td className="p-4">
                    {employee.is_active ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => navigate(`/employees/${employee.id}`)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
                        title="View Employee"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/employees/edit/${employee.id}`)
                        }
                        className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg"
                        title="Edit Employee"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(employee)}
                        className={`text-white px-3 py-2 rounded-lg ${
                          employee.is_active
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {employee.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}

      <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
        <p className="text-gray-600">
          Total Employees : <strong>{count}</strong>
        </p>

        <div className="flex items-center gap-3">
          <button
            disabled={!previous}
            onClick={() => setPage((prev) => prev - 1)}
            className={`px-4 py-2 rounded ${
              previous
                ? "bg-gray-700 text-white hover:bg-gray-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Previous
          </button>

          <span className="font-semibold">Page {page}</span>

          <button
            disabled={!next}
            onClick={() => setPage((prev) => prev + 1)}
            className={`px-4 py-2 rounded ${
              next
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
