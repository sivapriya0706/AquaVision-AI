import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function CustomerDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [refillPrediction, setRefillPrediction] = useState("Refill likely needed soon");
  const [activeOrder, setActiveOrder] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch AI Refill Status
    fetch("http://localhost:5000/api/refill-status")
      .then((res) => res.json())
      .then((data) => {
        setRefillPrediction(data.prediction || "Refill likely needed soon");
      })
      .catch(() => {
        setRefillPrediction("Refill likely needed soon");
      });

    // 2. Fetch Orders
    fetch(`http://localhost:5000/api/orders?customerId=${user?.id || "USR-001"}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentOrders(data.slice(0, 4));
          const active = data.find(
            (o) => o.status !== "Delivered" && o.status !== "Cancelled"
          );
          setActiveOrder(active || null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // 3. Fetch Notifications
    fetch(`http://localhost:5000/api/notifications?userId=${user?.id || "USR-001"}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data.slice(0, 3));
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const displayName = user?.name || "Sivapriya";

  return (
    <div className="portal-container">
      {/* Header Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Welcome back, {displayName} 👋</h2>
          <p>Here is your water supply overview for today.</p>
        </div>
        <div className="welcome-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => onNavigate("refill")}
          >
            Reorder Water
          </button>
        </div>
      </div>

      {/* 4 Dashboard Cards */}
      <div className="stats-grid-4">
        {/* Card 1: Next Refill */}
        <div className="stat-card">
          <div className="stat-icon blue">💧</div>
          <div className="stat-info">
            <span className="stat-title">Next Refill</span>
            <div className="stat-value-text">{refillPrediction}</div>
            <span className="stat-meta">Expected refill: 2 days</span>
          </div>
          <button
            type="button"
            className="btn-outline-sm mt-2"
            onClick={() => onNavigate("refill")}
          >
            Reorder Now
          </button>
        </div>

        {/* Card 2: Current Order */}
        <div className="stat-card">
          <div className="stat-icon teal">📦</div>
          <div className="stat-info">
            <span className="stat-title">Current Order</span>
            <div className="stat-value-text">
              {activeOrder ? `${activeOrder.numberOfCans} Cans (${activeOrder.orderId})` : "No active order"}
            </div>
            <span className="stat-meta">
              {activeOrder ? `Status: ${activeOrder.status}` : "All delivered"}
            </span>
          </div>
          {activeOrder && (
            <button
              type="button"
              className="btn-outline-sm mt-2"
              onClick={() => onNavigate("delivery-status")}
            >
              Track Delivery
            </button>
          )}
        </div>

        {/* Card 3: Delivery Status */}
        <div className="stat-card">
          <div className="stat-icon purple">🚚</div>
          <div className="stat-info">
            <span className="stat-title">Delivery Status</span>
            <div className="stat-value-text">
              {activeOrder ? activeOrder.status : "Delivered"}
            </div>
            <span className="stat-meta">
              Partner: {activeOrder?.deliveryPartnerName || "Arun"}
            </span>
          </div>
        </div>

        {/* Card 4: Payment Due */}
        <div className="stat-card">
          <div className="stat-icon emerald">💳</div>
          <div className="stat-info">
            <span className="stat-title">Payment Due</span>
            <div className="stat-value-text">
              ₹{activeOrder?.amount || user?.balanceDue || 160}
            </div>
            <span className="stat-meta">
              {activeOrder?.paymentStatus === "Paid" ? "Paid Online" : "Payment Pending"}
            </span>
          </div>
          <button
            type="button"
            className="btn-outline-sm mt-2"
            onClick={() => onNavigate("payments")}
          >
            Pay Bill
          </button>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="quick-actions-bar mt-4">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <button
            type="button"
            className="quick-action-btn primary"
            onClick={() => onNavigate("refill")}
          >
            <span>🔄</span> Reorder Water
          </button>
          <button
            type="button"
            className="quick-action-btn"
            onClick={() => onNavigate("delivery-status")}
          >
            <span>🚚</span> Track Delivery
          </button>
          <button
            type="button"
            className="quick-action-btn"
            onClick={() => onNavigate("payments")}
          >
            <span>💳</span> Pay Bill
          </button>
          <button
            type="button"
            className="quick-action-btn warning"
            onClick={() => onNavigate("damage-report")}
          >
            <span>⚠️</span> Report Damage
          </button>
        </div>
      </div>

      {/* Two Columns: Recent Orders & Notifications */}
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
                  <th>Cans</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-3">
                      {loading ? "Loading..." : "No recent orders."}
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.orderId}>
                      <td><strong>{order.orderId}</strong></td>
                      <td>{order.numberOfCans} Cans</td>
                      <td>{order.orderDate}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            order.status === "Delivered"
                              ? "success"
                              : order.status === "Out for Delivery"
                              ? "info"
                              : "warning"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications */}
        <div className="content-card">
          <div className="card-header">
            <h3>Notifications</h3>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="empty-hint">No notifications.</p>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="notification-item">
                  <div className="notif-icon">
                    {notif.type === "ai" ? "💧" : notif.type === "order" ? "📦" : "🔔"}
                  </div>
                  <div className="notif-content">
                    <strong>{notif.title}</strong>
                    <p>{notif.message}</p>
                    <small>{notif.date}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
