import { API_BASE_URL } from "../../config/api";
import { useState, useEffect } from "react";

export default function PartnerDeliveryHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/orders`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter delivered orders
          const delivered = data.filter((o) => o.status === "Delivered");
          setHistory(delivered);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>Delivery History &amp; Dispatch Log</h2>
          <p>Historical audit trail of completed water can deliveries and empty can handovers.</p>
        </div>
      </div>

      <div className="content-card full-width">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Delivered Date</th>
                <th>Customer</th>
                <th>Address</th>
                <th>Cans Delivered</th>
                <th>Empty Cans Returned</th>
                <th>Amount Collected</th>
                <th>Payment Mode</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    Loading history...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No completed deliveries logged yet.
                  </td>
                </tr>
              ) : (
                history.map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <strong>{order.orderId}</strong>
                    </td>
                    <td>{order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : order.deliveryDate}</td>
                    <td>{order.customerName}</td>
                    <td>
                      <span className="address-text">{order.customerAddress}</span>
                    </td>
                    <td>
                      <span className="can-count-badge">{order.numberOfCans} × 20L</span>
                    </td>
                    <td>
                      <span className="can-count-badge purple">
                        {order.emptyCansReturned || order.numberOfCans} Cans
                      </span>
                    </td>
                    <td>
                      <strong>₹{order.amount}</strong>
                    </td>
                    <td>
                      <span className="status-pill success">Settled</span>
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
