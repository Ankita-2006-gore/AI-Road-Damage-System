import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyReports from "./pages/MyReports";
import Map from "./pages/Map";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Register page */}
        <Route path="/register" element={<Register />} />

        {/* Login page */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard page */}
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/map" element={<Map />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Home page */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <div className="text-center">

                <h1 className="text-4xl font-bold text-gray-900">
                  RoadGuard AI
                </h1>

                <p className="mt-3 text-gray-600">
                  AI-Powered Road Damage Detection
                </p>

                <div className="mt-8 flex gap-4 justify-center">

                  <Link
                    to="/login"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                  >
                    Register
                  </Link>

                </div>

              </div>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;