import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  getEmployeeById,
  updateEmployee,
} from "../../services/employeeService";

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    employee_id: "",
    name: "",
    department: "",
    designation: "",
    is_active: true,
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const data = await getEmployeeById(id);

        setFormData({
          employee_id: data.employee_id,
          name: data.name,
          department: data.department,
          designation: data.designation,
          is_active: data.is_active,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateEmployee(id, formData);

      alert("Employee Updated Successfully");

      navigate(`/employees/${id}`);
    } catch (error) {
      console.error(error);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Response:", error.response.data);

        alert(JSON.stringify(error.response.data, null, 2));
      } else {
        alert("Something went wrong.");
      }
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg mb-6"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8">Edit Employee</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="Employee ID"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
          />

          <InputField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <InputField
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
          />

          <InputField
            label="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
          />

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            Active Employee
          </label>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block font-semibold mb-2">{label}</label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
