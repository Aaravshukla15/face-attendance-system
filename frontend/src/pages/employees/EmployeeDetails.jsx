import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { getEmployeeById } from "../../services/employeeService";

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

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

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/employees")}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <button
          onClick={() => navigate(`/employees/edit/${employee.id}`)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Pencil size={18} />
          Edit
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}

        <div className="bg-slate-800 p-8 flex flex-col items-center text-white">
          {/* Future Employee Photo */}

          <div className="w-32 h-32 rounded-full bg-white text-slate-700 flex items-center justify-center text-5xl font-bold shadow-lg">
            {employee.name.charAt(0).toUpperCase()}
          </div>

          <h1 className="text-3xl font-bold mt-5">{employee.name}</h1>

          <p className="text-slate-300 mt-2">{employee.designation}</p>

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
              title="Status"
              value={employee.is_active ? "Active" : "Inactive"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="border rounded-xl p-5 bg-gray-50 hover:shadow-md transition">
      <p className="text-sm text-gray-500">{title}</p>

      <h3 className="text-lg font-semibold mt-2">{value}</h3>
    </div>
  );
}
