export default function Navbar() {
  return (
    <header className="bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      <div className="flex items-center gap-4">
        <span className="text-gray-700 font-medium">👤 Admin</span>

        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </div>
    </header>
  );
}
