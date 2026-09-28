import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

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

        if (!response.ok) {
          alert(data.message);
          return;
        }

        setReports(data.reports);

      } catch (error) {
        console.error(error);
        alert("Unable to connect to server.");
      } finally {
        setLoading(false);
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
            My Reports
          </p>
        </div>

        <Link
          to="/dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">

        <h2 className="text-2xl font-bold text-gray-900">
          My Road Damage Reports
        </h2>

        {loading && (
          <p className="mt-6 text-gray-600">
            Loading reports...
          </p>
        )}

        {!loading && reports.length === 0 && (
          <div className="mt-6 bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-500">
              No reports found.
            </p>
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="mt-6 grid gap-5">

            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow p-6"
              >

                <div className="flex justify-between items-start">

                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Report #{report.id}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>

                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {report.status}
                  </span>

                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div>
                    <p className="text-sm text-gray-500">
                      Damage Type
                    </p>
                    <p className="font-semibold text-gray-900">
                      {report.damage_type}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Confidence
                    </p>
                    <p className="font-semibold text-gray-900">
                      {report.confidence}%
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Severity
                    </p>
                    <p className="font-semibold text-gray-900">
                      {report.severity}
                    </p>
                  </div>

                </div>

                <div className="mt-4">

                  <p className="text-sm text-gray-500">
                    Location
                  </p>

                  <p className="text-gray-700">
                    {report.latitude}, {report.longitude}
                  </p>

                </div>

                {report.description && (
                  <div className="mt-4">

                    <p className="text-sm text-gray-500">
                      Description
                    </p>

                    <p className="text-gray-700">
                      {report.description}
                    </p>

                  </div>
                )}

              </div>
            ))}

          </div>
        )}

      </main>

    </div>
  );
}

export default MyReports;