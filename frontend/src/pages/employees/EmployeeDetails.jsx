import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import {
  getEmployeeById,
  toggleEmployeeStatus,
} from "../../services/employeeService";

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const data = await getEmployeeById(id);
        setEmployee(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleToggleStatus = async () => {
    const action = employee.is_active ? "deactivate" : "activate";

    const confirmAction = window.confirm(
      `Are you sure you want to ${action} ${employee.name}?`,
    );

    if (!confirmAction) return;

    try {
      setStatusLoading(true);

      const response = await toggleEmployeeStatus(employee.id);

      setEmployee((prev) => ({
        ...prev,
        is_active: response.is_active,
      }));

      alert(
        `Employee ${
          response.is_active ? "activated" : "deactivated"
        } successfully.`,
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update employee status.");
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <h2 className="text-xl font-semibold">Loading Employee...</h2>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex justify-center items-center h-96">
        <h2 className="text-xl font-semibold text-red-600">
          Employee not found.
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Buttons */}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/employees")}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/employees/edit/${employee.id}`)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Pencil size={18} />
            Edit
          </button>

          <button
            onClick={handleToggleStatus}
            disabled={statusLoading}
            className={`px-4 py-2 rounded-lg text-white transition ${
              employee.is_active
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            } ${statusLoading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {statusLoading
              ? "Updating..."
              : employee.is_active
                ? "Deactivate"
                : "Activate"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}

        <div className="bg-slate-800 p-8 flex flex-col items-center text-white">
          {employee.photo ? (
            <img
              src={employee.photo}
              alt={employee.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-white text-slate-700 flex items-center justify-center text-5xl font-bold shadow-lg">
              {employee.name.charAt(0).toUpperCase()}
            </div>
          )}

          <h1 className="text-3xl font-bold mt-5 text-center">
            {employee.name}
          </h1>

          <p className="text-slate-300 mt-2 text-center">
            {employee.designation}
          </p>

          <span
            className={`mt-4 px-4 py-2 rounded-full font-semibold ${
              employee.is_active ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {employee.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Body */}

        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 border-b pb-3">
            Employee Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard title="Employee ID" value={employee.employee_id} />

            <InfoCard title="Full Name" value={employee.name} />

            <InfoCard title="Department" value={employee.department} />

            <InfoCard title="Designation" value={employee.designation} />

            <InfoCard
              title="Email Address"
              value={employee.email || "Not Provided"}
            />

            <InfoCard
              title="Phone Number"
              value={employee.phone || "Not Provided"}
            />

            <InfoCard
              title="Status"
              value={employee.is_active ? "Active" : "Inactive"}
            />

            <InfoCard
              title="Created On"
              value={new Date(employee.created_at).toLocaleString()}
            />

            <InfoCard
              title="Last Updated"
              value={new Date(employee.updated_at).toLocaleString()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="border rounded-xl p-5 bg-gray-50 hover:shadow-md transition duration-200">
      <p className="text-sm text-gray-500 font-medium">{title}</p>

      <h3 className="text-lg font-semibold text-gray-800 mt-2 break-words">
        {value || "-"}
      </h3>
    </div>
  );
}
