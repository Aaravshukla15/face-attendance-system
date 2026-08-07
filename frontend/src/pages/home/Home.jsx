import { useNavigate } from "react-router-dom";
import { Camera, ShieldCheck } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
            Welcome to Office
          </h1>

          <p className="text-gray-500 mt-4 text-lg">
            Office Attendance Management System
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {/* Employee Attendance */}
            <button
              onClick={() => navigate("/attendance/record")}
              className="group border-2 border-blue-100 hover:border-blue-500 rounded-2xl p-8 transition hover:shadow-lg text-left"
            >
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition">
                <Camera size={28} />
              </div>

              <h2 className="text-2xl font-bold text-slate-800">
                Employee Attendance
              </h2>

              <p className="text-gray-500 mt-2">
                Record your attendance using the office camera and face
                recognition.
              </p>

              <div className="mt-6 text-blue-600 font-semibold">
                Record Attendance →
              </div>
            </button>

            {/* Admin Login */}
            <button
              onClick={() => navigate("/admin-login")}
              className="group border-2 border-slate-200 hover:border-slate-500 rounded-2xl p-8 transition hover:shadow-lg text-left"
            >
              <div className="w-14 h-14 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-5 group-hover:bg-slate-700 group-hover:text-white transition">
                <ShieldCheck size={28} />
              </div>

              <h2 className="text-2xl font-bold text-slate-800">Admin Login</h2>

              <p className="text-gray-500 mt-2">
                Login to manage employees, attendance, reports and settings.
              </p>

              <div className="mt-6 text-slate-700 font-semibold">
                Admin Login →
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
