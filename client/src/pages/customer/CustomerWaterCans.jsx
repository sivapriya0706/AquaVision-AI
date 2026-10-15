import { API_BASE_URL } from "../../config/api";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function CustomerWaterCans({ onNavigate }) {
  const { user } = useAuth();
  const [cans, setCans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/cans?customerId=${user?.id || "USR-001"}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCans(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const filteredCans = cans.filter((can) => {
    if (filter === "all") return true;
    return can.status.toLowerCase() === filter.toLowerCase();
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Full":
        return <span className="status-pill success">Full</span>;
      case "In Use":
        return <span className="status-pill info">In Use</span>;
      case "Empty":
        return <span className="status-pill warning">Empty</span>;
      case "Damaged":
        return <span className="status-pill danger">Damaged</span>;
      case "Maintenance":
        return <span className="status-pill purple">Maintenance</span>;
      default:
        return <span className="status-pill neutral">{status}</span>;
    }
  };

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>My Water Cans</h2>
          <p>
            Track your registered 20-Liter cans, usage state, and refill schedules.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => onNavigate("refill")}
          >
            🔄 Order Refill
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigate("damage-report")}
          >
            ⚠️ Report Damage
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tab-bar">
        {["all", "In Use", "Full", "Empty", "Damaged"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`filter-tab-btn ${filter === tab ? "active" : ""}`}
            onClick={() => setFilter(tab)}
          >
            {tab === "all" ? "All Cans" : tab} ({
              tab === "all"
                ? cans.length
                : cans.filter((c) => c.status.toLowerCase() === tab.toLowerCase()).length
            })
          </button>
        ))}
      </div>

      {/* Cans Grid */}
      <div className="cards-grid-3">
        {filteredCans.length === 0 ? (
          <div className="empty-state-box full-width">
            <div className="empty-icon">🪣</div>
            <h3>No water cans match this filter</h3>
            <p>Try switching to &quot;All Cans&quot; or request a new refill.</p>
          </div>
        ) : (
          filteredCans.map((can) => (
            <div key={can.canId} className="can-card">
              <div className="can-card-header">
                <div>
                  <span className="can-batch">{can.batch || "Standard Batch"}</span>
                  <h3 className="can-id">{can.canId}</h3>
                </div>
                {getStatusBadge(can.status)}
              </div>

              <div className="can-visual">
                <div className={`can-bottle ${can.status.toLowerCase().replace(" ", "-")}`}>
                  <div className="bottle-cap"></div>
                  <div className="bottle-body">
                    <span className="bottle-label">20L</span>
                  </div>
                </div>
              </div>

              <div className="can-meta-list">
                <div className="meta-item">
                  <span>Capacity:</span>
                  <strong>{can.capacity}</strong>
                </div>
                <div className="meta-item">
                  <span>Condition:</span>
                  <strong>{can.condition}</strong>
                </div>
                <div className="meta-item">
                  <span>Last Refill:</span>
                  <span>{can.lastRefill}</span>
                </div>
                <div className="meta-item">
                  <span>Next Refill:</span>
                  <span className="highlight-text">{can.nextExpectedRefill}</span>
                </div>
              </div>

              <div className="can-card-actions">
                {can.status === "Empty" ? (
                  <button
                    type="button"
                    className="btn-primary-sm full-width"
                    onClick={() => onNavigate("refill")}
                  >
                    🔄 Refill This Can
                  </button>
                ) : can.status === "Damaged" ? (
                  <button
                    type="button"
                    className="btn-danger-sm full-width"
                    onClick={() => onNavigate("damage-report")}
                  >
                    View Damage Status
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-outline-sm full-width"
                    onClick={() => onNavigate("damage-report")}
                  >
                    Report Issue
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
