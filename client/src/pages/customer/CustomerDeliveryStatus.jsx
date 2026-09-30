import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function CustomerDeliveryStatus({ onNavigate }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/orders?customerId=${user?.id || "USR-001"}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
          const active = data.find(
            (o) => o.status !== "Delivered" && o.status !== "Cancelled"
          );
          setSelectedOrderId(active ? active.orderId : data[0].orderId);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const currentOrder =
    orders.find((o) => o.orderId === selectedOrderId) || orders[0];

  const flowSteps = ["Confirmed", "Assigned", "Out for Delivery", "Delivered"];

  const getStepIndex = (status) => {
    switch (status) {
      case "Pending":
      case "Confirmed":
        return 0;
      case "Assigned":
        return 1;
      case "Out for Delivery":
        return 2;
      case "Delivered":
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = currentOrder ? getStepIndex(currentOrder.status) : 0;

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>Delivery</h2>
          <p>Track your water order delivery status</p>
        </div>
        {orders.length > 1 && (
          <div className="select-order-box">
            <label>Select Order:</label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
            >
              {orders.map((o) => (
                <option key={o.orderId} value={o.orderId}>
                  {o.orderId} ({o.numberOfCans} cans - {o.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!currentOrder ? (
        <div className="empty-state-box full-width">
          <div className="empty-icon">🚚</div>
          <h3>No active deliveries</h3>
          <p>Place a new water refill order to track delivery.</p>
          <button
            type="button"
            className="btn-primary mt-3"
            onClick={() => onNavigate("refill")}
          >
            Reorder Water
          </button>
        </div>
      ) : (
        <div className="content-card full-width">
          {/* Main Info Card */}
          <div className="delivery-simple-info-grid">
            <div className="info-cell">
              <span className="cell-label">Order</span>
              <strong className="cell-value">{currentOrder.orderId} ({currentOrder.numberOfCans} Cans)</strong>
            </div>
            <div className="info-cell">
              <span className="cell-label">Customer</span>
              <strong className="cell-value">{currentOrder.customerName}</strong>
            </div>
            <div className="info-cell">
              <span className="cell-label">Delivery Partner</span>
              <strong className="cell-value">{currentOrder.deliveryPartnerName || "Arun"}</strong>
            </div>
            <div className="info-cell">
              <span className="cell-label">Expected Delivery</span>
              <strong className="cell-value">{currentOrder.deliveryDate}</strong>
            </div>
            <div className="info-cell">
              <span className="cell-label">Status</span>
              <span className="status-pill info">{currentOrder.status}</span>
            </div>
          </div>

          {/* Simple Status Flow Indicator */}
          <div className="status-flow-bar mt-4">
            <h4>Delivery Progress</h4>
            <div className="flow-steps-grid">
              {flowSteps.map((step, idx) => {
                const isDone = idx <= currentIndex;
                const isCurrent = idx === currentIndex;
                return (
                  <div
                    key={step}
                    className={`flow-step ${isDone ? "completed" : ""} ${isCurrent ? "current" : ""}`}
                  >
                    <div className="step-circle">{isDone ? "✓" : idx + 1}</div>
                    <span className="step-label">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
