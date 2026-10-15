import { API_BASE_URL } from "../../config/api";
import { useState, useEffect } from "react";
import Modal from "../../components/Modal";

export default function AdminDeliveryManagement() {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");

  const loadData = () => {
    fetch(`${API_BASE_URL}/api/orders`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/users?role=partner`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPartners(data);
          if (data.length > 0) setSelectedPartnerId(data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assigningOrder || !selectedPartnerId) return;

    const partner = partners.find((p) => p.id === selectedPartnerId);

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${assigningOrder.orderId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId: selectedPartnerId,
          partnerName: partner ? partner.name : "Assigned Driver",
        }),
      });

      if (res.ok) {
        setAssigningOrder(null);
        loadData();
      }
    } catch {
      alert("Failed to assign driver");
    }
  };

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>Deliveries</h2>
          <p>Track delivery assignments and status across active orders</p>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="content-card full-width">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Delivery Partner</th>
                <th>Status</th>
                <th>Expected Delivery</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">Loading deliveries...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">No deliveries found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <strong>{order.orderId}</strong> ({order.numberOfCans} Cans)
                    </td>
                    <td>{order.customerName}</td>
                    <td>{order.deliveryPartnerName || "Unassigned"}</td>
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
                    <td>{order.deliveryDate}</td>
                    <td>
                      {order.status !== "Delivered" && (
                        <button
                          type="button"
                          className="btn-outline-sm"
                          onClick={() => setAssigningOrder(order)}
                        >
                          Assign / Change Partner
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

      {/* Assign Partner Modal */}
      <Modal
        isOpen={!!assigningOrder}
        onClose={() => setAssigningOrder(null)}
        title="Assign Delivery Partner"
      >
        {assigningOrder && (
          <form onSubmit={handleAssign} className="modal-form">
            <p>
              Select delivery partner for order <strong>{assigningOrder.orderId}</strong> ({assigningOrder.customerName}):
            </p>
            <div className="form-group mt-3">
              <label>Delivery Partner</label>
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                required
              >
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.assignedZone})
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions-row mt-4">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setAssigningOrder(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Confirm Partner
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
