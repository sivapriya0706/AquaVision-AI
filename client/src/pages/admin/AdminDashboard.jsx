import { API_BASE_URL } from "../../config/api";
import { useState, useEffect } from "react";

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    todayOrders: 4,
    pendingDeliveries: 2,
    pendingDamageReports: 1,
    pendingPayments: 2,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Orders
    fetch(`${API_BASE_URL}/api/orders`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentOrders(data.slice(0, 5));
          const pending = data.filter((o) => o.status !== "Delivered");
          const pendingPay = data.filter((o) => o.paymentStatus !== "Paid");
          setStats((prev) => ({
            ...prev,
            todayOrders: data.length,
            pendingDeliveries: pending.length,
            pendingPayments: pendingPay.length,
          }));
        }
      })
      .catch(() => {});

    // Damage Reports
    fetch(`${API_BASE_URL}/api/damage-reports`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const pending = data.filter((r) => r.status === "Pending Review");
          setPendingReports(data.slice(0, 4));
          setStats((prev) => ({
            ...prev,
            pendingDamageReports: pending.length,
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="portal-container">
      {/* Header Banner */}
      <div className="welcome-banner admin-banner">
        <div className="welcome-text">
          <h2>Admin Dashboard 🛡️</h2>
          <p>Operations summary for AquaVision AI</p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="stats-grid-4">
        <div className="stat-card">
          <div className="stat-icon blue">📦</div>
          <div className="stat-info">
            <span className="stat-title">Today's Orders</span>
            <div className="stat-value-num">{stats.todayOrders}</div>
            <span className="stat-meta">Total orders placed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">🚚</div>
          <div className="stat-info">
            <span className="stat-title">Pending Deliveries</span>
            <div className="stat-value-num">{stats.pendingDeliveries}</div>
            <span className="stat-meta">Active fulfillment</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rose">⚠️</div>
          <div className="stat-info">
            <span className="stat-title">Pending Damage Reports</span>
            <div className="stat-value-num">{stats.pendingDamageReports}</div>
            <span className="stat-meta">Requires review</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald">💳</div>
          <div className="stat-info">
            <span className="stat-title">Pending Payments</span>
            <div className="stat-value-num">{stats.pendingPayments}</div>
            <span className="stat-meta">Awaiting payment</span>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Orders & Recent Damage Reports */}
      <div className="two-col-grid mt-4">
        {/* Recent Orders */}
        <div className="content-card">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <button
              type="button"
              className="btn-link"
              onClick={() => onNavigate("orders")}
            >
              View All
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Cans</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-3">Loading...</td>
                  </tr>
                ) : (
                  recentOrders.map((o) => (
                    <tr key={o.orderId}>
                      <td><strong>{o.orderId}</strong></td>
                      <td>{o.customerName}</td>
                      <td>{o.numberOfCans} Cans</td>
                      <td>
                        <span
                          className={`status-pill ${
                            o.status === "Delivered"
                              ? "success"
                              : o.status === "Out for Delivery"
                              ? "info"
                              : "warning"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Damage Reports */}
        <div className="content-card">
          <div className="card-header">
            <h3>Recent Damage Reports</h3>
            <button
              type="button"
              className="btn-link"
              onClick={() => onNavigate("damage-reports")}
            >
              View All
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-3">Loading...</td>
                  </tr>
                ) : pendingReports.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-3">No damage reports.</td>
                  </tr>
                ) : (
                  pendingReports.map((r) => (
                    <tr key={r.reportId}>
                      <td><strong>{r.reportId}</strong></td>
                      <td>{r.customerName}</td>
                      <td>{r.damageType}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            r.status === "Approved"
                              ? "success"
                              : r.status === "Rejected"
                              ? "danger"
                              : "warning"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
