import { useEffect, useState } from "react";
import Modal from "../../components/Modal";

export default function AdminDamageReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const loadReports = () => {
    fetch("http://localhost:5000/api/damage-reports")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReports(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, []);

  const updateStatus = async (reportId, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/damage-reports/${reportId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      if (response.ok) {
        setReports((prev) =>
          prev.map((r) => (r.reportId === reportId ? { ...r, status } : r))
        );
      }
    } catch {
      alert("Failed to update report status");
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filter === "all") return true;
    return r.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>Damage Reports</h2>
          <p>Review customer reported damage and photo evidence</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tab-bar">
        {["all", "Pending Review", "Approved", "Rejected"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`filter-tab-btn ${filter === tab ? "active" : ""}`}
            onClick={() => setFilter(tab)}
          >
            {tab === "all" ? "All Reports" : tab} ({
              tab === "all"
                ? reports.length
                : reports.filter((r) => r.status.toLowerCase() === tab.toLowerCase()).length
            })
          </button>
        ))}
      </div>

      {/* Clean Table */}
      <div className="content-card full-width mt-3">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Customer</th>
                <th>Photo</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">Loading reports...</td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">No reports found.</td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.reportId}>
                    <td>
                      <strong>{report.reportId}</strong> ({report.damageType})
                    </td>
                    <td>{report.customerName}</td>
                    <td>
                      {report.photo ? (
                        <button
                          type="button"
                          className="btn-outline-sm"
                          onClick={() => setSelectedPhoto(`http://localhost:5000${report.photo}`)}
                        >
                          View Photo
                        </button>
                      ) : (
                        <span className="text-muted">No photo</span>
                      )}
                    </td>
                    <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          report.status === "Approved"
                            ? "success"
                            : report.status === "Rejected"
                            ? "danger"
                            : "warning"
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-button-group">
                        <button
                          type="button"
                          className="btn-success-sm"
                          onClick={() => updateStatus(report.reportId, "Approved")}
                          disabled={report.status === "Approved"}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn-danger-sm"
                          onClick={() => updateStatus(report.reportId, "Rejected")}
                          disabled={report.status === "Rejected"}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Photo Modal */}
      <Modal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        title="Damage Photo Evidence"
        maxWidth="600px"
      >
        {selectedPhoto && (
          <div className="text-center p-2">
            <img
              src={selectedPhoto}
              alt="Damage evidence"
              style={{
                maxWidth: "100%",
                maxHeight: "60vh",
                borderRadius: "8px",
                objectFit: "contain",
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
