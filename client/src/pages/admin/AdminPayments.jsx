import { API_BASE_URL } from "../../config/api";
import { useState, useEffect } from "react";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/payments`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPayments(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Customer billing summary table
  const customerBilling = [
    {
      customer: "Sivapriya",
      bill: "₹400",
      paid: "₹240",
      pending: "₹160",
      status: "Pending",
    },
    {
      customer: "Sunita Sharma",
      bill: "₹320",
      paid: "₹320",
      pending: "₹0",
      status: "Paid",
    },
  ];

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>Payments</h2>
          <p>Customer billing and payment status</p>
        </div>
      </div>

      <div className="content-card full-width">
        <div className="card-header">
          <h3>Customer Payment Summary</h3>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Bill</th>
                <th>Paid</th>
                <th>Pending</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {customerBilling.map((cb) => (
                <tr key={cb.customer}>
                  <td><strong>{cb.customer}</strong></td>
                  <td>{cb.bill}</td>
                  <td>{cb.paid}</td>
                  <td>{cb.pending}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        cb.status === "Paid" ? "success" : "warning"
                      }`}
                    >
                      {cb.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Log Below */}
      <div className="content-card full-width mt-4">
        <div className="card-header">
          <h3>Recent Transactions</h3>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Customer</th>
                <th>Order ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">Loading transactions...</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.paymentId}>
                    <td><strong>{p.paymentId}</strong></td>
                    <td>{p.customerName}</td>
                    <td>{p.orderId || "—"}</td>
                    <td>{p.date}</td>
                    <td><strong>₹{p.amount}</strong></td>
                    <td>
                      <span
                        className={`status-pill ${
                          p.status === "Completed" ? "success" : "warning"
                        }`}
                      >
                        {p.status}
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
  );
}
