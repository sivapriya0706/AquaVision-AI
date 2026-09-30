import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/Modal";

export default function PartnerDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [emptyCansCount, setEmptyCansCount] = useState(2);
  const [updating, setUpdating] = useState(false);

  const loadOrders = () => {
    fetch("http://localhost:5000/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAssignedOrders(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const todayOrders = assignedOrders.filter((o) => o.status !== "Cancelled");
  const completedOrders = todayOrders.filter((o) => o.status === "Delivered");
  const pendingOrders = todayOrders.filter((o) => o.status !== "Delivered");
  const nextDelivery = pendingOrders[0] || null;

  const handleUpdateStatus = async (orderId, newStatus, emptyCount = 0) => {
    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          emptyCansReturned: emptyCount,
        }),
      });

      if (res.ok) {
        if (newStatus === "Delivered" && emptyCount > 0) {
          const ord = assignedOrders.find((o) => o.orderId === orderId);
          await fetch("http://localhost:5000/api/deliveries/collect-empty", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              partnerId: user?.id || "USR-003",
              partnerName: user?.name || "Arun",
              customerId: ord?.customerId || "USR-001",
              customerName: ord?.customerName || "Sivapriya",
              orderId: orderId,
              quantity: Number(emptyCount),
            }),
          });
        }
        setSelectedOrder(null);
        loadOrders();
      }
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const partnerName = user?.name || "Arun";

  return (
    <div className="portal-container">
      {/* Header Banner */}
      <div className="welcome-banner partner-banner">
        <div className="welcome-text">
          <h2>Welcome, {partnerName} 🛵</h2>
          <p>Assigned Deliveries &amp; Daily Route Overview</p>
        </div>
        <div className="welcome-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => onNavigate("delivery-route")}
          >
            View Route
          </button>
        </div>
      </div>

      {/* 4 Dashboard Cards */}
      <div className="stats-grid-4">
        <div className="stat-card">
          <div className="stat-icon blue">📅</div>
          <div className="stat-info">
            <span className="stat-title">Today's Deliveries</span>
            <div className="stat-value-num">{todayOrders.length}</div>
            <span className="stat-meta">Total scheduled</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">⏳</div>
          <div className="stat-info">
            <span className="stat-title">Pending</span>
            <div className="stat-value-num">{pendingOrders.length}</div>
            <span className="stat-meta">Awaiting completion</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald">✓</div>
          <div className="stat-info">
            <span className="stat-title">Completed</span>
            <div className="stat-value-num">{completedOrders.length}</div>
            <span className="stat-meta">Delivered today</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">📍</div>
          <div className="stat-info">
            <span className="stat-title">Next Delivery</span>
            <div className="stat-value-text">
              {nextDelivery ? nextDelivery.customerName : "All Done"}
            </div>
            <span className="stat-meta">
              {nextDelivery ? `${nextDelivery.numberOfCans} Cans` : "No pending stops"}
            </span>
          </div>
        </div>
      </div>

      {/* Simple Delivery List */}
      <div className="content-card full-width mt-4">
        <div className="card-header">
          <h3>Today's Deliveries</h3>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Order</th>
                <th>Location</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Loading deliveries...
                  </td>
                </tr>
              ) : todayOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No deliveries scheduled for today.
                  </td>
                </tr>
              ) : (
                todayOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <strong>{order.customerName}</strong>
                      <div className="text-muted text-xs">{order.customerPhone}</div>
                    </td>
                    <td>{order.numberOfCans} Water Cans</td>
                    <td>{order.customerAddress}</td>
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
                    <td>
                      {order.status === "Delivered" ? (
                        <span className="text-muted text-xs">Delivered ✓</span>
                      ) : (
                        <button
                          type="button"
                          className="btn-primary-sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          Update Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Update Status: ${selectedOrder?.orderId}`}
      >
        {selectedOrder && (
          <div className="modal-form">
            <div className="delivery-confirm-summary">
              <p>
                <strong>Customer:</strong> {selectedOrder.customerName}
              </p>
              <p>
                <strong>Order:</strong> {selectedOrder.numberOfCans} Water Cans (₹{selectedOrder.amount})
              </p>
              <p>
                <strong>Location:</strong> {selectedOrder.customerAddress}
              </p>
            </div>

            <div className="form-group mt-3">
              <label>Select Status Action</label>
              <div className="modal-action-buttons">
                {selectedOrder.status !== "Out for Delivery" && (
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedOrder.orderId, "Out for Delivery")}
                  >
                    Mark Out for Delivery
                  </button>
                )}
                <button
                  type="button"
                  className="btn-success"
                  disabled={updating}
                  onClick={() => handleUpdateStatus(selectedOrder.orderId, "Delivered", emptyCansCount)}
                >
                  Mark Delivered &amp; Collect Cans
                </button>
              </div>
            </div>

            <div className="form-group mt-3">
              <label>Empty Cans Collected</label>
              <input
                type="number"
                min="0"
                max="10"
                value={emptyCansCount}
                onChange={(e) => setEmptyCansCount(e.target.value)}
              />
            </div>

            <div className="modal-actions-row mt-4">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedOrder(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
