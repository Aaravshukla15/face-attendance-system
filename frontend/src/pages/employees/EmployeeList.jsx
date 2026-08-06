import { useEffect, useState } from "react";
import EmployeeHeader from "../../components/employees/EmployeeHeader";
import { getEmployees } from "../../services/employeeService";
import { useNavigate } from "react-router-dom";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Input typed by user
  const [searchInput, setSearchInput] = useState("");

  // Actual search sent to backend
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [count, setCount] = useState(0);

  const [next, setNext] = useState(null);

  const [previous, setPrevious] = useState(null);

  const navigate = useNavigate();

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
    return <h2>Loading Employees...</h2>;
  }

  return (
    <div>
      <EmployeeHeader />

      {/* Search */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search employee..."
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg"
          >
            Search
          </button>

          <button
            onClick={() => {
              setSearch("");
              setSearchInput("");
              setPage(1);
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 rounded-lg"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
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
                    <button
                      onClick={() => navigate(`/employees/${employee.id}`)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      View
                    </button>

                    <button
                      onClick={() => navigate(`/employees/edit/${employee.id}`)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-gray-600">
          Total Employees: <strong>{count}</strong>
        </p>

        <div className="flex gap-3">
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

          <span className="flex items-center font-semibold">Page {page}</span>

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
