import api from "../api/axios";

// Get today's attendance
export const getTodayAttendance = async () => {
  const response = await api.get("attendance/today/");

  return response.data;
};
