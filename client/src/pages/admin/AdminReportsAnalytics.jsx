import { useState } from "react";

export default function AdminReportsAnalytics() {
  const [downloading, setDownloading] = useState(false);

  const handleExportCSV = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert("AquaVision Operations Report (September 2026) exported as CSV.");
    }, 1000);
  };

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>Operational Reports &amp; Analytics</h2>
          <p>
            System-wide water can lifecycle metrics, turnaround SLAs, and fulfillment velocity.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={handleExportCSV}
          disabled={downloading}
        >
          {downloading ? "Exporting CSV..." : "📥 Export Executive Report (CSV)"}
        </button>
      </div>

      {/* Analytics KPI Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon emerald">✓</div>
          <div className="stat-info">
            <span className="stat-title">Fulfillment SLA Rate</span>
            <div className="stat-value">96.8%</div>
            <span className="stat-meta">Delivered within scheduled slot</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teal">🔄</div>
          <div className="stat-info">
            <span className="stat-title">Can Turnaround Velocity</span>
            <div className="stat-value">6.4 Days</div>
            <span className="stat-meta">Average refill cycle per container</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">♻️</div>
          <div className="stat-info">
            <span className="stat-title">Empty Can Recovery Rate</span>
            <div className="stat-value">98.2%</div>
            <span className="stat-meta">Containers safely recovered</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">💧</div>
          <div className="stat-info">
            <span className="stat-title">Total Water Dispensed</span>
            <div className="stat-value">4,960 Liters</div>
            <span className="stat-meta">248 × 20L can cycles this month</span>
          </div>
        </div>
      </div>

      {/* Chart-Like Visual Breakdown Cards */}
      <div className="two-col-grid mt-4">
        {/* Container Condition Distribution */}
        <div className="content-card">
          <div className="card-header">
            <div>
              <span className="card-eyebrow">FLEET INTEGRITY</span>
              <h3>Water Can Condition Distribution</h3>
            </div>
          </div>

          <div className="progress-bar-group">
            <div className="progress-item">
              <div className="progress-header">
                <span>Good / Prime Condition</span>
                <strong>88.3% (219 Cans)</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill green" style={{ width: "88.3%" }}></div>
              </div>
            </div>

            <div className="progress-item mt-3">
              <div className="progress-header">
                <span>Minor Wear / Scheduled Review</span>
                <strong>6.9% (17 Cans)</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill yellow" style={{ width: "6.9%" }}></div>
              </div>
            </div>

            <div className="progress-item mt-3">
              <div className="progress-header">
                <span>Under Maintenance / Sanitization</span>
                <strong>3.2% (8 Cans)</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill blue" style={{ width: "3.2%" }}></div>
              </div>
            </div>

            <div className="progress-item mt-3">
              <div className="progress-header">
                <span>Quarantined / Damaged</span>
                <strong>1.6% (4 Cans)</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill red" style={{ width: "1.6%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Consumption Breakdown */}
        <div className="content-card">
          <div className="card-header">
            <div>
              <span className="card-eyebrow">DEMAND CURVE</span>
              <h3>Weekly Can Refill Velocity</h3>
            </div>
          </div>

          <div className="simple-bar-chart">
            <div className="bar-col">
              <div className="bar-fill" style={{ height: "65%" }}>
                <span className="bar-val">52</span>
              </div>
              <span className="bar-label">Mon</span>
            </div>
            <div className="bar-col">
              <div className="bar-fill" style={{ height: "55%" }}>
                <span className="bar-val">44</span>
              </div>
              <span className="bar-label">Tue</span>
            </div>
            <div className="bar-col">
              <div className="bar-fill" style={{ height: "70%" }}>
                <span className="bar-val">56</span>
              </div>
              <span className="bar-label">Wed</span>
            </div>
            <div className="bar-col">
              <div className="bar-fill" style={{ height: "60%" }}>
                <span className="bar-val">48</span>
              </div>
              <span className="bar-label">Thu</span>
            </div>
            <div className="bar-col">
              <div className="bar-fill highlight" style={{ height: "95%" }}>
                <span className="bar-val">76</span>
              </div>
              <span className="bar-label">Fri (Peak)</span>
            </div>
            <div className="bar-col">
              <div className="bar-fill" style={{ height: "80%" }}>
                <span className="bar-val">64</span>
              </div>
              <span className="bar-label">Sat</span>
            </div>
            <div className="bar-col">
              <div className="bar-fill" style={{ height: "40%" }}>
                <span className="bar-val">32</span>
              </div>
              <span className="bar-label">Sun</span>
            </div>
          </div>

          <div className="chart-footer-note mt-3">
            <span>⚡ Peak Friday Refill Index matches the AI Demand Model prediction.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
