import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/Modal";

export default function PartnerDeliveries({ title = "Assigned Orders" }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [emptyCansCount, setEmptyCansCount] = useState(2);
  const [updating, setUpdating] = useState(false);

  const loadOrders = () => {
    fetch("http://localhost:5000/api/orders")
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
  }, []);

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
          const ord = orders.find((o) => o.orderId === orderId);
          await fetch("http://localhost:5000/api/deliveries/collect-empty", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              partnerId: user?.id || "USR-003",
              partnerName: user?.name || "Arun",
              customerId: ord?.customerId || "USR-001",
              customerName: ord?.customerName || "Customer",
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

  const filteredOrders = orders.filter((o) => {
    if (filter === "all") return true;
    if (filter === "pending") return o.status !== "Delivered" && o.status !== "Cancelled";
    return o.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>{title}</h2>
          <p>Manage assigned water can drops, customer addresses, and delivery status transitions.</p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={loadOrders}
        >
          🔄 Refresh Orders
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tab-bar">
        {["all", "pending", "Out for Delivery", "Delivered"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`filter-tab-btn ${filter === tab ? "active" : ""}`}
            onClick={() => setFilter(tab)}
          >
            {tab === "all" ? "All Deliveries" : tab === "pending" ? "Active / In-Transit" : tab} ({
              tab === "all"
                ? orders.length
                : tab === "pending"
                ? orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length
                : orders.filter((o) => o.status.toLowerCase() === tab.toLowerCase()).length
            })
          </button>
        ))}
      </div>

      <div className="cards-grid-2">
        {loading ? (
          <div className="empty-state-box full-width">Loading delivery assignments...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state-box full-width">No deliveries match this filter.</div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.orderId} className="delivery-partner-card">
              <div className="partner-card-header">
                <div>
                  <span className="order-id-label">{order.orderId}</span>
                  <h3 className="customer-name">{order.customerName}</h3>
                </div>
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
              </div>

              <div className="partner-card-body">
                <div className="info-row">
                  <span className="label">📍 Address:</span>
                  <p className="address-text">{order.customerAddress}</p>
                </div>
                <div className="info-row">
                  <span className="label">📞 Contact:</span>
                  <a href={`tel:${order.customerPhone}`} className="phone-link">
                    {order.customerPhone}
                  </a>
                </div>
                <div className="info-row">
                  <span className="label">📦 Quantity:</span>
                  <strong>{order.numberOfCans} × 20L Water Cans</strong>
                </div>
                <div className="info-row">
                  <span className="label">💳 Payment:</span>
                  <span
                    className={`payment-badge ${
                      order.paymentStatus === "Paid" ? "paid" : "due"
                    }`}
                  >
                    {order.paymentStatus === "Paid"
                      ? "Pre-Paid Online (₹" + order.amount + ")"
                      : "Collect ₹" + order.amount + " on delivery"}
                  </span>
                </div>
                {order.specialInstructions && (
                  <div className="instructions-box">
                    <span>Note:</span> {order.specialInstructions}
                  </div>
                )}
              </div>

              <div className="partner-card-footer">
                {order.status !== "Delivered" ? (
                  <div className="action-row">
                    {order.status !== "Out for Delivery" && (
                      <button
                        type="button"
                        className="btn-primary-sm"
                        onClick={() =>
                          handleUpdateStatus(order.orderId, "Out for Delivery")
                        }
                        disabled={updating}
                      >
                        🚚 Mark Out for Delivery
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-success-sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      ✓ Complete Delivery
                    </button>
                  </div>
                ) : (
                  <div className="delivered-receipt-stamp">
                    ✓ Delivered • {order.emptyCansReturned || order.numberOfCans} Empty Cans Returned
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Completion Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Fulfill Delivery: ${selectedOrder?.orderId}`}
      >
        {selectedOrder && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateStatus(selectedOrder.orderId, "Delivered", emptyCansCount);
            }}
            className="modal-form"
          >
            <p>
              Confirm delivery of <strong>{selectedOrder.numberOfCans} full water cans</strong> to{" "}
              <strong>{selectedOrder.customerName}</strong>.
            </p>

            <div className="form-group mt-3">
              <label>Number of Empty Cans Picked Up from Customer *</label>
              <input
                type="number"
                min="0"
                max="10"
                value={emptyCansCount}
                onChange={(e) => setEmptyCansCount(e.target.value)}
                required
              />
            </div>

            <div className="payment-verify-box mt-3">
              {selectedOrder.paymentStatus === "Paid" ? (
                <span className="text-success">✓ Online payment already settled.</span>
              ) : (
                <span className="text-warning">
                  ⚠️ Please collect ₹{selectedOrder.amount} from customer via QR or cash.
                </span>
              )}
            </div>

            <div className="modal-actions-row mt-4">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedOrder(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={updating}
              >
                {updating ? "Saving..." : "Confirm Delivery & Log Pickup"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
