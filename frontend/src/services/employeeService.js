import api from "../api/axios";

export const getEmployees = async (search = "", page = 1) => {
  const response = await api.get("employees/", {
    params: {
      search,
      page,
    },
  });

  return response.data;
};
export const getEmployeeById = async (id) => {
  const response = await api.get(`employees/${id}/`);
  return response.data;
};
