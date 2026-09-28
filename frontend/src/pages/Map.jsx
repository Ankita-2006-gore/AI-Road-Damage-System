import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";

function Map() {
  const [reports, setReports] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/reports",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setReports(data.reports);
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      }
    };

    fetchReports();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100">

      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            RoadGuard AI
          </h1>

          <p className="text-sm text-gray-500">
            Road Damage Map
          </p>
        </div>

        <Link
          to="/dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Reported Road Damage
        </h2>

        <div className="h-[600px] rounded-xl overflow-hidden shadow-md">

          <MapContainer
            center={[18.5204, 73.8567]}
            zoom={12}
            className="h-full w-full"
          >

            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {reports.map((report) => {

              if (!report.latitude || !report.longitude) {
                return null;
              }

              return (
                <Marker
                  key={report.id}
                  position={[
                    Number(report.latitude),
                    Number(report.longitude)
                  ]}
                >
                  <Popup>
                    <div>

                      <strong>
                        Report #{report.id}
                      </strong>

                      <p>
                        Damage: {report.damage_type}
                      </p>

                      <p>
                        Confidence: {report.confidence}%
                      </p>

                      <p>
                        Severity: {report.severity}
                      </p>

                      <p>
                        Status: {report.status}
                      </p>

                    </div>
                  </Popup>
                </Marker>
              );
            })}

          </MapContainer>

        </div>

      </main>

    </div>
  );
}

export default Map;