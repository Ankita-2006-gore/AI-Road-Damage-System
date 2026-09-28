import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [damageFilter, setDamageFilter] = useState("All");

  const token = localStorage.getItem("token");

  const fetchReports = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/reports",
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

  useEffect(() => {
    fetchReports();
  }, []);

  const updateStatus = async (reportId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/reports/${reportId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Report status updated successfully!");

      fetchReports();
    } catch (error) {
      console.error(error);
      alert("Unable to connect to server.");
    }
  };

  // Statistics
  const totalReports = reports.length;

  const newReports = reports.filter(
    (report) => report.status === "New"
  ).length;

  const acknowledgedReports = reports.filter(
    (report) => report.status === "Acknowledged"
  ).length;

  const inRepairReports = reports.filter(
    (report) => report.status === "In Repair"
  ).length;

  const completedReports = reports.filter(
    (report) => report.status === "Completed"
  ).length;

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      report.id.toString().includes(searchText) ||
      report.name.toLowerCase().includes(searchText) ||
      report.email.toLowerCase().includes(searchText) ||
      report.damage_type.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" ||
      report.status === statusFilter;

    const matchesSeverity =
      severityFilter === "All" ||
      report.severity === severityFilter;

    const matchesDamage =
      damageFilter === "All" ||
      report.damage_type === damageFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesSeverity &&
      matchesDamage
    );
  });

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            RoadGuard AI
          </h1>

          <p className="text-sm text-gray-500">
            Admin Dashboard
          </p>
        </div>

        <Link
          to="/dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          User Dashboard
        </Link>

      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">

        <h2 className="text-2xl font-bold text-gray-900">
          All Road Damage Reports
        </h2>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">
              Total Reports
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {totalReports}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">
              New
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {newReports}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">
              Acknowledged
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {acknowledgedReports}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">
              In Repair
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {inRepairReports}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">
              Completed
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {completedReports}
            </p>
          </div>

        </div>

        {/* Filters */}
        <div className="mt-8 bg-white rounded-xl shadow p-6">

          <h3 className="text-lg font-semibold text-gray-900">
            Filter Reports
          </h3>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search report, user or damage..."
              className="border border-gray-300 rounded-lg px-4 py-3"
            />

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-3"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="In Repair">In Repair</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Severity */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-3"
            >
              <option value="All">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            {/* Damage type */}
            <select
              value={damageFilter}
              onChange={(e) => setDamageFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-3"
            >
              <option value="All">All Damage Types</option>
              <option value="pothole">Pothole</option>
              <option value="longitudinal_crack">
                Longitudinal Crack
              </option>
              <option value="transverse_crack">
                Transverse Crack
              </option>
              <option value="alligator_crack">
                Alligator Crack
              </option>
              <option value="No damage">
                No Damage
              </option>
            </select>

          </div>

          <p className="mt-4 text-sm text-gray-500">
            Showing {filteredReports.length} of {reports.length} reports
          </p>

        </div>

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

        {!loading &&
          reports.length > 0 &&
          filteredReports.length === 0 && (
            <div className="mt-6 bg-white rounded-xl shadow p-8 text-center">
              <p className="text-gray-500">
                No reports match the selected filters.
              </p>
            </div>
          )}

        {!loading && filteredReports.length > 0 && (
          <div className="mt-6 overflow-x-auto bg-white rounded-xl shadow">

            <table className="w-full text-left">

              <thead className="bg-gray-50 border-b">

                <tr>
                  <th className="px-5 py-4">Report</th>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Damage</th>
                  <th className="px-5 py-4">Confidence</th>
                  <th className="px-5 py-4">Severity</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Status</th>
                </tr>

              </thead>

              <tbody>

                {filteredReports.map((report) => (

                  <tr
                    key={report.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="px-5 py-4 font-semibold">
                      #{report.id}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {report.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {report.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {report.damage_type}
                    </td>

                    <td className="px-5 py-4">
                      {report.confidence}%
                    </td>

                    <td className="px-5 py-4">
                      {report.severity}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {report.latitude}, {report.longitude}
                    </td>

                    <td className="px-5 py-4">

                      <select
                        value={report.status}
                        onChange={(e) =>
                          updateStatus(
                            report.id,
                            e.target.value
                          )
                        }
                        className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                      >

                        <option value="New">
                          New
                        </option>

                        <option value="Acknowledged">
                          Acknowledged
                        </option>

                        <option value="In Repair">
                          In Repair
                        </option>

                        <option value="Completed">
                          Completed
                        </option>

                      </select>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </main>

    </div>
  );
}

export default AdminDashboard;