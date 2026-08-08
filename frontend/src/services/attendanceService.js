import api from "../api/axios";

// GET TODAY'S ATTENDANCE

export const getTodayAttendance = async () => {
  const response = await api.get("attendance/today/");

  return response.data;
};

// GET ATTENDANCE RECORDS WITH FILTERS

export const getAttendance = async (params = {}) => {
  const response = await api.get("attendance/", {
    params,
  });

  return response.data;
};

// Download daily attendance Excel report
export const downloadDailyAttendanceReport = async (date) => {
  const response = await api.get("attendance/reports/daily/", {
    params: {
      date,
    },
    responseType: "blob",
  });

  return response;
};

// Download monthly attendance Excel report
export const downloadMonthlyAttendanceReport = async (month, employee = "") => {
  const params = {
    month,
  };

  // Only send employee when a specific employee
  // has been selected.
  if (employee && employee !== "All Employees") {
    params.employee = employee;
  }

  const response = await api.get("attendance/reports/monthly/", {
    params,
    responseType: "blob",
  });

  return response;
};
