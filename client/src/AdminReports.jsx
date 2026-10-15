import { API_BASE_URL } from "./config/api";
import { useEffect, useState } from "react";

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    fetch(`${API_BASE_URL}/api/damage-reports`)
      .then((response) => response.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const updateStatus = async (reportId, status) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/damage-reports/${reportId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setReports((currentReports) =>
        currentReports.map((report) =>
          report.reportId === reportId
            ? { ...report, status: status }
            : report
        )
      );
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Loading damage reports...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#f4f8fb",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <span
            style={{
              color: "#0b9fa3",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "1.5px",
            }}
          >
            ADMIN PANEL
          </span>

          <h1
            style={{
              margin: "7px 0",
              color: "#17324d",
            }}
          >
            Damage Reports
          </h1>

          <p
            style={{
              color: "#8094a5",
              fontSize: "13px",
            }}
          >
            Review customer-reported water can damage and verify
            uploaded evidence.
          </p>
        </div>

        {reports.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "16px",
              border: "1px solid #e4edf2",
              color: "#647b8a",
            }}
          >
            No damage reports submitted yet.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "18px",
            }}
          >
            {reports.map((report) => (
              <div
                key={report.reportId}
                style={{
                  background: "white",
                  border: "1px solid #e4edf2",
                  borderRadius: "16px",
                  padding: "22px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                  boxShadow:
                    "0 5px 18px rgba(27, 69, 89, 0.04)",
                }}
              >
                <div>
                  <span
                    style={{
                      color: "#0b9fa3",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    {report.reportId}
                  </span>

                  <h3
                    style={{
                      margin: "7px 0",
                      color: "#17324d",
                    }}
                  >
                    Damage Report
                  </h3>

                  <p
                    style={{
                      margin: "4px 0",
                      color: "#647b8a",
                      fontSize: "13px",
                    }}
                  >
                    Damage Type:{" "}
                    <strong>{report.damageType}</strong>
                  </p>

                  <span
                    style={{
                      display: "inline-block",
                      marginTop: "10px",
                      padding: "5px 10px",
                      borderRadius: "20px",
                      background:
                        report.status === "Approved"
                          ? "#e6f8ef"
                          : report.status === "Rejected"
                          ? "#ffebeb"
                          : "#fff5dc",
                      color:
                        report.status === "Approved"
                          ? "#16895c"
                          : report.status === "Rejected"
                          ? "#c45b5b"
                          : "#a77918",
                      fontSize: "10px",
                      fontWeight: "600",
                    }}
                  >
                    {report.status}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <a
                    href={`${API_BASE_URL}${report.photo}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "10px 16px",
                      borderRadius: "8px",
                      background: "#eef7f8",
                      color: "#0b9fa3",
                      textDecoration: "none",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    View Photo
                  </a>

                  <button
                    onClick={() =>
                      updateStatus(report.reportId, "Approved")
                    }
                    style={{
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      background: "#0b9fa3",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(report.reportId, "Rejected")
                    }
                    style={{
                      border: "1px solid #e2baba",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      background: "#fff5f5",
                      color: "#c45b5b",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminReports;