import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createEmployee } from "../../services/employeeService";

export default function AddEmployee() {
  const navigate = useNavigate();

  const [preview, setPreview] = useState(null);

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

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

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full Name is required.";

    if (!formData.department.trim())
      newErrors.department = "Department is required.";

    if (!formData.designation.trim())
      newErrors.designation = "Designation is required.";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone Number is required.";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone Number must contain exactly 10 digits.";
    }

    if (!formData.photo) {
      newErrors.photo = "Employee photo is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);

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

      alert("Employee created successfully.");

      setFormData({
        name: "",
        department: "",
        designation: "",
        email: "",
        phone: "",
        photo: null,
        is_active: true,
      });

      setPreview(null);

      navigate("/employees");
    } catch (error) {
      console.error(error);

      if (error.response?.data) {
        const backendErrors = Object.values(error.response.data)
          .flat()
          .join("\n");

        alert(backendErrors);
      } else {
        alert("Something went wrong while creating the employee.");
      }
    } finally {
      setSaving(false);
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
            error={errors.name}
          />

          <InputField
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            error={errors.department}
          />

          <InputField
            label="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            error={errors.designation}
          />

          <InputField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />

          <InputField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
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

              {errors.photo && (
                <p className="text-red-500 text-sm mt-2">{errors.photo}</p>
              )}
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
              disabled={saving}
              className={`px-8 py-3 rounded-lg text-white font-medium transition ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? "Saving..." : "Save Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, error, type = "text" }) {
  return (
    <div>
      <label className="block font-semibold mb-2">{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${
          error ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-500"
        }`}
      />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
