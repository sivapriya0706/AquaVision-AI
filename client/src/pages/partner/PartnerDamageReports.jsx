import { API_BASE_URL } from "../../config/api";
import { useState, useEffect } from "react";

export default function PartnerDamageReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/damage-reports`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReports(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>Route Damage Reports &amp; Replacements</h2>
          <p>
            Verify reported water can defects in your zone. Collect approved damaged cans during scheduled stops for depot quarantine.
          </p>
        </div>
      </div>

      <div className="content-card full-width">
        <div className="card-header">
          <div>
            <span className="card-eyebrow">DRIVER PICKUP MANIFEST</span>
            <h3>Customer Damage Reports</h3>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Customer</th>
                <th>Damage Type</th>
                <th>Issue Details</th>
                <th>Photo Evidence</th>
                <th>Status</th>
                <th>Driver Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Loading reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No active damage reports on your route.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.reportId}>
                    <td>
                      <strong>{report.reportId}</strong>
                    </td>
                    <td>
                      <strong>{report.customerName || "Customer"}</strong>
                    </td>
                    <td>
                      <span className="defect-tag">{report.damageType}</span>
                    </td>
                    <td>
                      <p className="table-desc">{report.description || "Defect reported"}</p>
                    </td>
                    <td>
                      {report.photo ? (
                        <a
                          href={`${API_BASE_URL}${report.photo}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-outline-sm"
                        >
                          View Evidence
                        </a>
                      ) : (
                        <span className="text-muted">No photo</span>
                      )}
                    </td>
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
                      {report.status === "Approved" ? (
                        <span className="pickup-action-badge">
                          🚚 Pick up &amp; Replace with Fresh Can
                        </span>
                      ) : (
                        <span className="text-muted">Awaiting Admin Decision</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
