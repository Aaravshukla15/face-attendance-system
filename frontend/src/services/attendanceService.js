import api from "../api/axios";

// Get today's attendance
export const getTodayAttendance = async () => {
  const response = await api.get("attendance/today/");

  return response.data;
};

// Get attendance records with filters
export const getAttendance = async (params = {}) => {
  const response = await api.get("attendance/", {
    params,
  });

  return response.data;
};
