import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function PartnerEmptyCans() {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("Sivapriya (Bellandur)");
  const [quantity, setQuantity] = useState(2);
  const [condition, setCondition] = useState("Good");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadCollections = () => {
    fetch("http://localhost:5000/api/deliveries/empty-cans")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCollections(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleRecordCollection = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg("");

    try {
      const res = await fetch("http://localhost:5000/api/deliveries/collect-empty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId: user?.id || "USR-003",
          partnerName: user?.name || "Arun",
          customerId: "USR-001",
          customerName: customerName,
          quantity: Number(quantity),
          condition: condition,
          notes: notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to log collection");

      setSuccessMsg(`✓ Logged collection of ${quantity} empty cans from ${customerName}.`);
      setQuantity(2);
      setNotes("");
      loadCollections();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch {
      alert("Error recording empty can collection");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCollected = collections.reduce((acc, c) => acc + (c.quantity || 0), 0);

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>Empty Water Can Collection</h2>
          <p>
            Record returned empty cans from customers to keep depot stock synchronized and maintain the circular supply loop.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">🔄</div>
          <div className="stat-info">
            <span className="stat-title">Total Empty Cans Picked Up</span>
            <div className="stat-value">{totalCollected} Cans</div>
            <span className="stat-meta">Accumulated today on vehicle</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald">🎯</div>
          <div className="stat-info">
            <span className="stat-title">Daily Collection Target</span>
            <div className="stat-value">12 Cans</div>
            <span className="stat-meta">Hub return quota</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teal">🏭</div>
          <div className="stat-info">
            <span className="stat-title">Depot Sanitization Hub</span>
            <div className="stat-value">Bellandur Center</div>
            <span className="stat-meta">Batch wash &amp; refill schedule</span>
          </div>
        </div>
      </div>

      <div className="two-col-grid mt-4">
        {/* Log Form */}
        <div className="content-card">
          <div className="card-header">
            <div>
              <span className="card-eyebrow">FIELD ENTRY</span>
              <h3>Record Empty Can Pickup</h3>
            </div>
          </div>

          {successMsg && <div className="success-alert-banner">{successMsg}</div>}

          <form onSubmit={handleRecordCollection} className="empty-cans-form">
            <div className="form-group">
              <label>Customer / Drop Location *</label>
              <select
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              >
                <option value="Aravind Kumar (Bellandur)">
                  Aravind Kumar — Flat 402, Green Glen Layout
                </option>
                <option value="Sunita Sharma (Whitefield)">
                  Sunita Sharma — Villa 12, Palm Meadows
                </option>
                <option value="Green Glen Security Desk">
                  Green Glen Security Gate Drop
                </option>
                <option value="Ad-Hoc Return Customer">
                  Ad-Hoc Direct Customer Pickup
                </option>
              </select>
            </div>

            <div className="form-group mt-3">
              <label>Number of Empty Cans *</label>
              <input
                type="number"
                min="1"
                max="20"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="form-group mt-3">
              <label>Physical Condition of Cans *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="Good">Good (Normal wear, ready for wash)</option>
                <option value="Minor Scratches">Minor Scratches (Acceptable)</option>
                <option value="Cap / Valve Damaged">Cap / Valve Damaged (Needs repair)</option>
                <option value="Cracked (To Quarantine)">Cracked (Quarantine for scrap)</option>
              </select>
            </div>

            <div className="form-group mt-3">
              <label>Driver Remarks (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Returned with cap intact"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn-primary full-width mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging..." : `Log Pickup (${quantity} Empty Cans)`}
            </button>
          </form>
        </div>

        {/* History of pickups */}
        <div className="content-card">
          <div className="card-header">
            <div>
              <span className="card-eyebrow">ACTIVITY LOG</span>
              <h3>Today&apos;s Return Log</h3>
            </div>
            <button
              type="button"
              className="btn-link"
              onClick={loadCollections}
            >
              Refresh
            </button>
          </div>

          <div className="collection-history-list">
            {loading ? (
              <p className="loading-hint">Loading pickups...</p>
            ) : collections.length === 0 ? (
              <p className="empty-hint">No empty can collections recorded today.</p>
            ) : (
              collections.map((col) => (
                <div key={col.collectionId} className="collection-item-card">
                  <div className="col-top">
                    <div>
                      <span className="col-id">{col.collectionId}</span>
                      <h4>{col.customerName}</h4>
                    </div>
                    <span className="can-count-badge purple">
                      +{col.quantity} Empty Cans
                    </span>
                  </div>
                  <div className="col-bottom">
                    <span className="condition-tag">
                      Condition: {col.condition || "Good"}
                    </span>
                    <small className="col-date">{col.date}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
