import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createEmployee } from "../../services/employeeService";

export default function AddEmployee() {
  const navigate = useNavigate();

  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    designation: "",
    email: "",
    phone: "",
    photo: null,
    is_active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const file = files[0];

      setFormData((prev) => ({
        ...prev,
        photo: file,
      }));

      if (file) {
        setPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("department", formData.department);
      data.append("designation", formData.designation);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("photo", formData.photo);
      data.append("is_active", formData.is_active);

      await createEmployee(data);

      alert("Employee Created Successfully");

      navigate("/employees");
    } catch (error) {
      console.error(error);
      alert("Failed to create employee.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg mb-6"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8">Add Employee</h1>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
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

          <InputField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <InputField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <div className="md:col-span-2">
            <label className="block font-semibold mb-2">Employee Photo</label>

            <div className="border-2 border-dashed rounded-xl p-6 text-center">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-40 h-40 object-cover rounded-xl mx-auto mb-4"
                />
              ) : (
                <div className="w-40 h-40 bg-gray-100 rounded-xl mx-auto flex items-center justify-center text-gray-500 mb-4">
                  No Image Selected
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                name="photo"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              Active Employee
            </label>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
            >
              Save Employee
            </button>
          </div>
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
