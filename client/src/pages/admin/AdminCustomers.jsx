import { API_BASE_URL } from "../../config/api";
import { useState, useEffect } from "react";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users?role=customer`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCustomers(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>Customer Directory</h2>
          <p>Supervise subscribed water consumer accounts, registered cans, and payment standing.</p>
        </div>
      </div>

      <div className="content-card full-width">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Delivery Address</th>
                <th>Active Cans</th>
                <th>Balance Due</th>
                <th>Assigned Route</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    Loading customers...
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.id}</strong></td>
                    <td>
                      <div className="customer-cell">
                        <span className="avatar-chip">{c.avatar || c.name[0]}</span>
                        <strong>{c.name}</strong>
                      </div>
                    </td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td className="max-w-address">
                      <span className="address-text">{c.address}</span>
                    </td>
                    <td>
                      <span className="can-count-badge">
                        {c.waterCansCount || 4} Cans
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          (c.balanceDue || 0) > 0 ? "warning" : "success"
                        }`}
                      >
                        ₹{c.balanceDue || 0}
                      </span>
                    </td>
                    <td>Bellandur / Whitefield</td>
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
