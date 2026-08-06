import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EmployeeHeader() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Employees</h1>

        <p className="text-gray-500 mt-1">
          Manage all employees in your organization.
        </p>
      </div>

      <button
        onClick={() => navigate(`/employees/add`)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium transition"
      >
        <Plus size={18} />
        Add Employee
      </button>
    </div>
  );
}
