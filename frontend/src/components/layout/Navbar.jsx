import { useNavigate } from "react-router-dom";
import { LogOut, User, Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar({ setSidebarOpen }) {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser();
    navigate("/", { replace: true });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          aria-label="Open sidebar"
        >
          <Menu size={21} />
        </button>

        {/* Page Title */}
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
          Dashboard
        </h1>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden sm:flex items-center gap-2 text-gray-700">
          <User size={18} />
          <span className="font-medium">Admin</span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg transition"
        >
          <LogOut size={17} />

          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
