import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function CustomerRefillOrder({ onNavigate }) {
  const { user } = useAuth();
  const [cansCount, setCansCount] = useState(2);
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split("T")[0];
  });
  const [timeSlot, setTimeSlot] = useState("Morning (8:00 AM - 12:00 PM)");
  const [address, setAddress] = useState(
    user?.address || "Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103"
  );
  const [instructions, setInstructions] = useState("");
  const [emptyCansToReturn, setEmptyCansToReturn] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const PRICE_PER_CAN = 80;
  const totalAmount = cansCount * PRICE_PER_CAN;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user?.id || "USR-001",
          customerName: user?.name || "Sivapriya",
          customerAddress: address,
          customerPhone: user?.phone || "+91 98765 43210",
          numberOfCans: Number(cansCount),
          deliveryDate: deliveryDate,
          specialInstructions: `Slot: ${timeSlot}. Empty cans to return: ${emptyCansToReturn}. Notes: ${instructions}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to place order");
      }

      setOrderSuccess(data.order);
    } catch (err) {
      setErrorMessage(err.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>Refill / Reorder Water Cans</h2>
          <p>
            Schedule fresh 20-Liter drinking water cans delivered right to your doorstep.
          </p>
        </div>
      </div>

      {orderSuccess ? (
        <div className="success-order-box">
          <div className="success-icon">🎉</div>
          <h3>Refill Order Confirmed!</h3>
          <p>
            Your order <strong>#{orderSuccess.orderId}</strong> for{" "}
            <strong>{orderSuccess.numberOfCans} cans</strong> has been placed for{" "}
            <strong>{orderSuccess.deliveryDate}</strong>.
          </p>
          <div className="order-details-summary">
            <div>
              <span>Total Payable:</span> <strong>₹{orderSuccess.amount}</strong>
            </div>
            <div>
              <span>Delivery Slot:</span> <strong>{timeSlot}</strong>
            </div>
            <div>
              <span>Fulfillment Hub:</span> <strong>Bellandur Aqua Center</strong>
            </div>
          </div>
          <div className="success-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => onNavigate("delivery-status")}
            >
              Track Order Status →
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setOrderSuccess(null);
                setCansCount(2);
              }}
            >
              Place Another Order
            </button>
          </div>
        </div>
      ) : (
        <div className="order-form-layout">
          {/* Main Form */}
          <form className="content-card order-form-card" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="error-alert-banner">{errorMessage}</div>
            )}

            <div className="form-section-title">1. Select Refill Quantity</div>

            <div className="can-counter-group">
              <label>Number of 20-Liter Water Cans</label>
              <div className="counter-row">
                <button
                  type="button"
                  className="counter-btn"
                  onClick={() => setCansCount(Math.max(1, cansCount - 1))}
                  disabled={cansCount <= 1}
                >
                  −
                </button>
                <span className="counter-value">{cansCount} Cans</span>
                <button
                  type="button"
                  className="counter-btn"
                  onClick={() => setCansCount(Math.min(10, cansCount + 1))}
                  disabled={cansCount >= 10}
                >
                  +
                </button>
              </div>
              <small className="form-hint">
                Standard price: ₹{PRICE_PER_CAN} per sanitized 20L can.
              </small>
            </div>

            <div className="form-section-title mt-4">2. Schedule Delivery</div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Preferred Delivery Date</label>
                <input
                  type="date"
                  value={deliveryDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Preferred Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                >
                  <option value="Morning (8:00 AM - 12:00 PM)">
                    Morning (8:00 AM - 12:00 PM)
                  </option>
                  <option value="Afternoon (12:00 PM - 4:00 PM)">
                    Afternoon (12:00 PM - 4:00 PM)
                  </option>
                  <option value="Evening (4:00 PM - 8:00 PM)">
                    Evening (4:00 PM - 8:00 PM)
                  </option>
                </select>
              </div>
            </div>

            <div className="form-section-title mt-4">3. Delivery Details</div>

            <div className="form-group">
              <label>Delivery Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Empty Cans Ready for Pickup</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={emptyCansToReturn}
                  onChange={(e) => setEmptyCansToReturn(e.target.value)}
                />
                <small className="form-hint">
                  Delivery partner will collect empty cans during drop-off.
                </small>
              </div>

              <div className="form-group">
                <label>Special Instructions (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Ring bell twice, leave with security"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>
            </div>

            <div className="order-form-submit-row">
              <button
                type="submit"
                className="btn-primary full-width"
                disabled={submitting}
              >
                {submitting ? "Placing Order..." : `Confirm Refill Order (₹${totalAmount})`}
              </button>
            </div>
          </form>

          {/* Sidebar Summary & AI Assistant */}
          <div className="order-summary-sidebar">
            <div className="content-card ai-recommend-card">
              <div className="recommend-header">
                <span className="icon">🔮</span>
                <div>
                  <strong>AI Smart Recommendation</strong>
                  <small>Based on your consumption pattern</small>
                </div>
              </div>
              <p className="recommend-text">
                Your household averages <strong>2.8 cans per week</strong>. Ordering 2 cans today will keep your supply uninterrupted until next Thursday.
              </p>
              <div className="recommend-badge">Refill Interval: 7.2 Days</div>
            </div>

            <div className="content-card summary-card">
              <h3>Order Price Summary</h3>
              <div className="summary-line">
                <span>{cansCount} × 20L Water Can</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="summary-line">
                <span>Doorstep Delivery Fee</span>
                <span className="free-tag">FREE</span>
              </div>
              <div className="summary-line">
                <span>Sanitization &amp; Sealing</span>
                <span className="free-tag">INCLUDED</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-total">
                <span>Total Amount:</span>
                <span className="total-amount">₹{totalAmount}</span>
              </div>
              <div className="payment-notice">
                <span>💳 Payment method: Cash / UPI upon delivery</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
