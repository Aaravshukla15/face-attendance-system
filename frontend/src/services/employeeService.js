import api from "../api/axios";

// Get Employee List
export const getEmployees = async (page = 1, search = "") => {
  const response = await api.get(`employees/?search=${search}&page=${page}`);

  return response.data;
};

// Get Single Employee
export const getEmployeeById = async (id) => {
  const response = await api.get(`employees/${id}/`);

  return response.data;
};

// Update Employee
export const updateEmployee = async (id, employeeData) => {
  const response = await api.patch(`employees/${id}/`, employeeData);

  return response.data;
};

// Create Employee
export const createEmployee = async (employeeData) => {
  const response = await api.post("employees/", employeeData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Toggle Employee Active / Inactive Status
export const toggleEmployeeStatus = async (id) => {
  const response = await api.patch(`employees/${id}/toggle-status/`);

  return response.data;
};
