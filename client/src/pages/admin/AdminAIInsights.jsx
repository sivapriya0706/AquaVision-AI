import { API_BASE_URL } from "../../config/api";
import { useState, useEffect } from "react";

export default function AdminAIInsights() {
  const [refillText, setRefillText] = useState("18 customers may need refill soon.");
  const [demandText, setDemandText] = useState("Expected demand: 72 cans");
  const [paymentText, setPaymentText] = useState("7 payments need attention.");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/refill-status`).then((r) => r.json()).catch(() => null),
      fetch(`${API_BASE_URL}/api/demand-forecast`).then((r) => r.json()).catch(() => null),
      fetch(`${API_BASE_URL}/api/payment-insight`).then((r) => r.json()).catch(() => null),
    ])
      .then(([r, d, p]) => {
        if (r && r.prediction) {
          setRefillText(r.prediction.includes("Refill") ? r.prediction : "18 customers may need refill soon.");
        }
        if (d && d.prediction) {
          setDemandText(d.prediction.includes("Demand") || d.prediction.includes("cans") ? d.prediction : "Expected demand: 72 cans");
        }
        if (p && p.prediction) {
          setPaymentText(p.prediction.includes("payment") || p.prediction.includes("risk") ? p.prediction : "7 payments need attention.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>AI Insights</h2>
          <p>Automated predictions for water supply operations</p>
        </div>
      </div>

      <div className="demo-notice-banner">
        <span>ℹ️</span>
        <p>Demo Notice: Current predictions are generated using prototype demo data.</p>
      </div>

      <div className="cards-grid-3 mt-4">
        {/* Card 1: Smart Refill Prediction */}
        <div className="content-card ai-insight-simple-card">
          <div className="card-icon-header blue">🔮</div>
          <h3>Smart Refill Prediction</h3>
          <div className="ai-stat-highlight">{refillText}</div>
          <p className="card-subtext">
            Predicts when customer water cans are running low based on usage patterns.
          </p>
        </div>

        {/* Card 2: Demand Forecast */}
        <div className="content-card ai-insight-simple-card">
          <div className="card-icon-header teal">📈</div>
          <h3>Demand Forecast</h3>
          <div className="ai-stat-highlight">{demandText}</div>
          <p className="card-subtext">
            Estimates total daily water can demand to optimize inventory preparation.
          </p>
        </div>

        {/* Card 3: Payment Intelligence */}
        <div className="content-card ai-insight-simple-card">
          <div className="card-icon-header amber">💳</div>
          <h3>Payment Intelligence</h3>
          <div className="ai-stat-highlight">{paymentText}</div>
          <p className="card-subtext">
            Identifies pending payments and overdue invoices requiring attention.
          </p>
        </div>
      </div>
    </div>
  );
}
