import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      () => {
        alert("Unable to get your location.");
      }
    );
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please select an image.");
      return;
    }

    const formData = new FormData();

    formData.append("image", image);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("description", description);

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        setLoading(false);
        return;
      }

      setResult(data);

      setImage(null);
      setDescription("");

    } catch (error) {
      console.error(error);
      alert("Unable to connect to server.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            RoadGuard AI
          </h1>

          <p className="text-sm text-gray-500">
            Road Damage Reporting System
          </p>
        </div>

        <div className="flex items-center gap-4">

          <span className="text-gray-700">
            Hello, {user?.name}
          </span>
          <Link
  to="/map"
  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
>
  Road Damage Map
</Link>
          <Link
             to="/my-reports"
             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
           >
            My Reports
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            Logout
          </button>

        </div>

      </nav>


      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-10">

        <div className="bg-white rounded-xl shadow-md p-8">

          <h2 className="text-2xl font-bold text-gray-900">
            Report Road Damage
          </h2>

          <p className="text-gray-500 mt-2">
            Upload a road image and let AI detect the damage.
          </p>


          <form
            onSubmit={handleUpload}
            className="mt-8 space-y-6"
          >

            {/* Image */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Road Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full border border-gray-300 rounded-lg p-3"
              />

            </div>


            {/* Location */}
            <div>

              <div className="flex justify-between items-center mb-2">

                <label className="text-sm font-medium text-gray-700">
                  Location
                </label>

                <button
                  type="button"
                  onClick={getLocation}
                  className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Get My Location
                </button>

              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="Latitude"
                  className="border border-gray-300 rounded-lg px-4 py-3"
                />

                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="Longitude"
                  className="border border-gray-300 rounded-lg px-4 py-3"
                />

              </div>

            </div>


            {/* Description */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the road damage..."
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />

            </div>


            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Detecting..." : "Analyze & Submit Report"}
            </button>

          </form>


          {/* AI result */}
          {result && (
            <div className="mt-8 border border-green-300 bg-green-50 rounded-lg p-6">

              <h3 className="text-xl font-bold text-green-800">
                AI Detection Result
              </h3>

              <div className="mt-4 space-y-2 text-gray-700">

                <p>
                  <strong>Damage Type:</strong>{" "}
                  {result.detection.damage_type}
                </p>

                <p>
                  <strong>Confidence:</strong>{" "}
                  {result.detection.confidence}%
                </p>

                <p>
                  <strong>Severity:</strong>{" "}
                  {result.detection.severity}
                </p>

                <p>
                  <strong>Report ID:</strong>{" "}
                  {result.reportId}
                </p>

              </div>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default Dashboard;