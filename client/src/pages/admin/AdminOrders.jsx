import { API_BASE_URL } from "../../config/api";
import { useState, useEffect } from "react";
import Modal from "../../components/Modal";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");

  const loadData = () => {
    fetch(`${API_BASE_URL}/api/orders`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
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

  const handleAssignPartner = async (e) => {
    e.preventDefault();
    if (!selectedOrderForAssign || !selectedPartnerId) return;

    const partner = partners.find((p) => p.id === selectedPartnerId);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/orders/${selectedOrderForAssign.orderId}/assign`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partnerId: selectedPartnerId,
            partnerName: partner ? partner.name : "Assigned Partner",
          }),
        }
      );
      if (res.ok) {
        setSelectedOrderForAssign(null);
        loadData();
      }
    } catch {
      alert("Failed to assign partner");
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "all") return true;
    return o.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>Orders</h2>
          <p>Manage and track all water can orders</p>
        </div>
      </div>

      {/* Simple Filters */}
      <div className="filter-tab-bar">
        {["all", "Pending", "Out for Delivery", "Delivered"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`filter-tab-btn ${filter === tab ? "active" : ""}`}
            onClick={() => setFilter(tab)}
          >
            {tab === "all" ? "All Orders" : tab} ({
              tab === "all"
                ? orders.length
                : orders.filter((o) => o.status.toLowerCase() === tab.toLowerCase()).length
            })
          </button>
        ))}
      </div>

      {/* Clean Orders Table */}
      <div className="content-card full-width">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Cans</th>
                <th>Date</th>
                <th>Delivery Status</th>
                <th>Payment Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No orders match this filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <strong>{order.orderId}</strong>
                    </td>
                    <td>{order.customerName}</td>
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
                    <td>
                      <span
                        className={`status-pill ${
                          order.paymentStatus === "Paid" ? "success" : "warning"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      {order.status !== "Delivered" && (
                        <button
                          type="button"
                          className="btn-outline-sm"
                          onClick={() => setSelectedOrderForAssign(order)}
                        >
                          Assign Partner
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
        isOpen={!!selectedOrderForAssign}
        onClose={() => setSelectedOrderForAssign(null)}
        title={`Assign Delivery Partner: ${selectedOrderForAssign?.orderId}`}
      >
        {selectedOrderForAssign && (
          <form onSubmit={handleAssignPartner} className="modal-form">
            <p>
              Assign driver for <strong>{selectedOrderForAssign.customerName}</strong> ({selectedOrderForAssign.numberOfCans} cans):
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
                onClick={() => setSelectedOrderForAssign(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Assign Partner
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
