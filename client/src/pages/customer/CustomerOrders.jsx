import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function CustomerOrders({ onNavigate }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const loadOrders = () => {
    fetch(`http://localhost:5000/api/orders?customerId=${user?.id || "USR-001"}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [user?.id]);

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "active") return order.status !== "Delivered" && order.status !== "Cancelled";
    return order.status.toLowerCase() === filter.toLowerCase();
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Delivered":
        return <span className="status-pill success">Delivered</span>;
      case "Out for Delivery":
        return <span className="status-pill info">Out for Delivery</span>;
      case "Assigned":
        return <span className="status-pill purple">Assigned</span>;
      case "Confirmed":
        return <span className="status-pill teal">Confirmed</span>;
      case "Pending":
        return <span className="status-pill warning">Pending Dispatch</span>;
      case "Cancelled":
        return <span className="status-pill danger">Cancelled</span>;
      default:
        return <span className="status-pill neutral">{status}</span>;
    }
  };

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>My Orders</h2>
          <p>Complete history of water can refill orders and deliveries.</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => onNavigate("refill")}
        >
          ➕ Place New Refill Order
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tab-bar">
        {["all", "active", "Delivered"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`filter-tab-btn ${filter === tab ? "active" : ""}`}
            onClick={() => setFilter(tab)}
          >
            {tab === "all" ? "All Orders" : tab === "active" ? "Active In-Transit" : "Delivered"} (
              {tab === "all"
                ? orders.length
                : tab === "active"
                ? orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length
                : orders.filter((o) => o.status === "Delivered").length}
            )
          </button>
        ))}
      </div>

      <div className="content-card full-width">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Order Date</th>
                <th>Cans</th>
                <th>Delivery Date</th>
                <th>Delivery Partner</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    No orders match this filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <strong>{order.orderId}</strong>
                    </td>
                    <td>{order.orderDate}</td>
                    <td>
                      <span className="can-count-badge">
                        {order.numberOfCans} × 20L
                      </span>
                    </td>
                    <td>{order.deliveryDate}</td>
                    <td>
                      {order.deliveryPartnerName && order.deliveryPartnerName !== "Unassigned" ? (
                        <span className="partner-name-tag">
                          🛵 {order.deliveryPartnerName}
                        </span>
                      ) : (
                        <span className="text-muted">Pending Partner</span>
                      )}
                    </td>
                    <td>
                      <strong>₹{order.amount}</strong>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          order.paymentStatus === "Paid" ? "success" : "warning"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-outline-sm"
                        onClick={() => onNavigate("delivery-status")}
                      >
                        Track Status
                      </button>
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
