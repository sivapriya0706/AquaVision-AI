import { API_BASE_URL } from "../../config/api";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/Modal";

export default function CustomerPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(160);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState("");

  const loadPayments = () => {
    fetch(`${API_BASE_URL}/api/payments?customerId=${user?.id || "USR-001"}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPayments(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayments();
  }, [user?.id]);

  const amountPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const pendingAmount = 160;
  const currentBill = amountPaid + pendingAmount;
  const paymentStatus = pendingAmount > 0 ? "Pending" : "Paid";

  const handleDemoPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user?.id || "USR-001",
          customerName: user?.name || "Sivapriya",
          orderId: "ORD-9021",
          amount: Number(paymentAmount),
          method: paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Payment failed");
      }

      setPaymentSuccessMsg(`Payment of ₹${paymentAmount} completed successfully!`);
      loadPayments();
      setTimeout(() => {
        setIsProcessing(false);
        setShowPayModal(false);
        setPaymentSuccessMsg("");
      }, 1200);
    } catch {
      alert("Payment failed.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>Payments</h2>
          <p>View your bills and payment history</p>
        </div>
        {pendingAmount > 0 && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowPayModal(true)}
          >
            Pay Bill (₹{pendingAmount})
          </button>
        )}
      </div>

      {/* 4 Summary Cards */}
      <div className="stats-grid-4">
        <div className="stat-card">
          <div className="stat-icon blue">📄</div>
          <div className="stat-info">
            <span className="stat-title">Current Bill</span>
            <div className="stat-value-num">₹{currentBill}</div>
            <span className="stat-meta">Total billing</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald">✓</div>
          <div className="stat-info">
            <span className="stat-title">Amount Paid</span>
            <div className="stat-value-num">₹{amountPaid}</div>
            <span className="stat-meta">Completed payments</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">⏳</div>
          <div className="stat-info">
            <span className="stat-title">Pending Amount</span>
            <div className="stat-value-num">₹{pendingAmount}</div>
            <span className="stat-meta">Due upon delivery</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">💳</div>
          <div className="stat-info">
            <span className="stat-title">Payment Status</span>
            <div className="stat-value-text">{paymentStatus}</div>
            <span className="stat-meta">Overall account status</span>
          </div>
        </div>
      </div>

      {/* Payment History Below */}
      <div className="content-card full-width mt-4">
        <div className="card-header">
          <h3>Payment History</h3>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Date</th>
                <th>Order ID</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">Loading history...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">No payments recorded.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.paymentId}>
                    <td><strong>{p.paymentId}</strong></td>
                    <td>{p.date}</td>
                    <td>{p.orderId || "—"}</td>
                    <td>{p.method}</td>
                    <td><strong>₹{p.amount}</strong></td>
                    <td>
                      <span className="status-pill success">{p.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title="Pay Bill"
      >
        <form onSubmit={handleDemoPayment} className="modal-form">
          {paymentSuccessMsg && (
            <div className="success-alert-banner mb-3">{paymentSuccessMsg}</div>
          )}

          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-group mt-3">
            <label>Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
              <option value="Card">Debit / Credit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cash">Cash on Delivery</option>
            </select>
          </div>

          <div className="modal-actions-row mt-4">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowPayModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : `Pay ₹${paymentAmount}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
