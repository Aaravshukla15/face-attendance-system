import api from "../api/axios";

// --------------------------------
// Get Employee List
// Supports pagination + search
// --------------------------------

export const getEmployees = async (page = 1, search = "") => {
  const params = {
    page,
  };

  if (search && search.trim()) {
    params.search = search.trim();
  }

  const response = await api.get("employees/", {
    params,
  });

  return response.data;
};

// --------------------------------
// Get ALL Employees
// Used by Attendance filters
// --------------------------------

// --------------------------------
// Get ALL Employees for filters
// Does not replace getEmployees()
// --------------------------------
export const getAllEmployeesForFilters = async () => {
  let allEmployees = [];
  let page = 1;

  while (true) {
    const data = await getEmployees(page);

    if (Array.isArray(data)) {
      allEmployees = [...allEmployees, ...data];
      break;
    }

    const results = data?.results || [];

    allEmployees = [...allEmployees, ...results];

    if (!data?.next) {
      break;
    }

    page += 1;
  }

  return allEmployees;
};

// --------------------------------
// Get Single Employee
// --------------------------------

export const getEmployeeById = async (id) => {
  const response = await api.get(`employees/${id}/`);

  return response.data;
};

// --------------------------------
// Update Employee
// --------------------------------

export const updateEmployee = async (id, employeeData) => {
  const response = await api.patch(`employees/${id}/`, employeeData);

  return response.data;
};

// --------------------------------
// Create Employee
// --------------------------------

export const createEmployee = async (employeeData) => {
  const response = await api.post("employees/", employeeData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// --------------------------------
// Toggle Employee Active / Inactive
// --------------------------------

export const toggleEmployeeStatus = async (id) => {
  const response = await api.patch(`employees/${id}/toggle-status/`);

  return response.data;
};
