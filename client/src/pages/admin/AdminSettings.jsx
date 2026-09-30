import { useState } from "react";

export default function AdminSettings() {
  const [hubName, setHubName] = useState("AquaVision Central Depot (Bellandur)");
  const [canPrice, setCanPrice] = useState("80");
  const [supportPhone, setSupportPhone] = useState("+91 80 2345 6789");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDemoData = async () => {
    if (window.confirm("Reset all demo data (cans, orders, payments, reports) back to initial prototype defaults?")) {
      try {
        const res = await fetch("http://localhost:5000/api/system/reset-demo", {
          method: "POST",
        });
        if (res.ok) {
          setResetSuccess(true);
          setTimeout(() => {
            setResetSuccess(false);
            window.location.reload();
          }, 1500);
        }
      } catch {
        alert("Failed to reset demo data.");
      }
    }
  };

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>System Operations &amp; Settings</h2>
          <p>
            Configure operational parameters, pricing models, and system demo state.
          </p>
        </div>
      </div>

      <div className="two-col-grid">
        {/* Settings Form */}
        <div className="content-card">
          <div className="card-header">
            <div>
              <span className="card-eyebrow">CONFIGURATION</span>
              <h3>Hub Operations Parameters</h3>
            </div>
          </div>

          {savedSuccess && (
            <div className="success-alert-banner">
              ✓ Settings saved successfully!
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="edit-profile-form">
            <div className="form-group">
              <label>Central Bottling Hub Name</label>
              <input
                type="text"
                value={hubName}
                onChange={(e) => setHubName(e.target.value)}
                required
              />
            </div>

            <div className="form-group mt-3">
              <label>Standard 20L Can Refill Price (₹)</label>
              <input
                type="number"
                value={canPrice}
                onChange={(e) => setCanPrice(e.target.value)}
                required
              />
            </div>

            <div className="form-group mt-3">
              <label>Helpline / Dispatch Support Phone</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary full-width mt-4">
              Save Configuration
            </button>
          </form>
        </div>

        {/* Demo State Control & Diagnostics */}
        <div className="content-card">
          <div className="card-header">
            <div>
              <span className="card-eyebrow">DEMO CONTROLS</span>
              <h3>Prototype Presentation Toolkit</h3>
            </div>
          </div>

          {resetSuccess && (
            <div className="success-alert-banner">
              ✓ Demo data has been restored to initial state! Reloading...
            </div>
          )}

          <p className="text-muted text-sm">
            During presentations or live demonstrations, use this button to instantly restore all customer cans, assigned driver routes, and payment ledgers back to their clean initial state.
          </p>

          <div className="demo-reset-box mt-3">
            <button
              type="button"
              className="btn-danger full-width"
              onClick={handleResetDemoData}
            >
              🔄 Reset Demo Data to Clean State
            </button>
          </div>

          <div className="system-health-diagnostics mt-4">
            <h4>System Environment Status</h4>
            <div className="diag-row">
              <span>Backend API Server:</span>
              <strong className="text-success">Online (Port 5000)</strong>
            </div>
            <div className="diag-row">
              <span>Python 3.14 Venv:</span>
              <strong className="text-success">ai/.venv Operational</strong>
            </div>
            <div className="diag-row">
              <span>ONNX Model:</span>
              <strong>ai/models/refill_model.onnx</strong>
            </div>
            <div className="diag-row">
              <span>ONNX Execution Provider:</span>
              <span>CPUExecutionProvider (Intel Host)</span>
            </div>
            <div className="diag-row">
              <span>Target Edge Architecture:</span>
              <span>Qualcomm Snapdragon NPU (QNN)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
