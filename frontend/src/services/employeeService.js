import api from "../api/axios";

export const getEmployees = async (search = "") => {
  const response = await api.get("employees/", {
    params: {
      search,
    },
  });

  return response.data;
};
