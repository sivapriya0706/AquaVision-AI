import { API_BASE_URL } from "../../config/api";
import { useState, useEffect } from "react";

export default function AdminDeliveryPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users?role=partner`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPartners(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>Delivery Partner Roster</h2>
          <p>Supervise logistics contractors, vehicle details, active zones, and delivery ratings.</p>
        </div>
      </div>

      <div className="content-card full-width">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Driver ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Vehicle &amp; Model</th>
                <th>Assigned Zone</th>
                <th>Active Orders</th>
                <th>Rating</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    Loading partners...
                  </td>
                </tr>
              ) : (
                partners.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.id}</strong></td>
                    <td>
                      <div className="customer-cell">
                        <span className="avatar-chip partner">{p.avatar || p.name[0]}</span>
                        <strong>{p.name}</strong>
                      </div>
                    </td>
                    <td>{p.phone}</td>
                    <td>{p.vehicleNumber}</td>
                    <td>{p.assignedZone}</td>
                    <td>
                      <span className="can-count-badge purple">
                        {p.activeDeliveriesCount || 3} Drops
                      </span>
                    </td>
                    <td>
                      <span className="rating-star">★ {p.rating || "4.8"}</span>
                    </td>
                    <td>
                      <span className="status-pill success">Active</span>
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
