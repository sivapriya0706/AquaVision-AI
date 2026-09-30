import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function CustomerProfile() {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || "Sivapriya");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");
  const [address, setAddress] = useState(
    user?.address || "Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103"
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateUserProfile({ name, phone, address });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>Customer Account Profile</h2>
          <p>Manage your account credentials, primary delivery address, and contact details.</p>
        </div>
      </div>

      <div className="two-col-grid">
        {/* Profile Card Summary */}
        <div className="content-card">
          <div className="profile-hero">
            <div className="profile-large-avatar">
              {user?.avatar || "S"}
            </div>
            <h3>{user?.name || "Sivapriya"}</h3>
            <span className="role-tag">Verified Customer • Bellandur Cluster</span>
          </div>

          <div className="profile-spec-list mt-4">
            <div className="spec-row">
              <span className="label">Customer ID:</span>
              <strong>{user?.id || "USR-001"}</strong>
            </div>
            <div className="spec-row">
              <span className="label">Registered Email:</span>
              <span>{user?.email || "customer@aquavision.ai"}</span>
            </div>
            <div className="spec-row">
              <span className="label">Registered Cans:</span>
              <span>{user?.waterCansCount || 4} × 20-Liter Cans</span>
            </div>
            <div className="spec-row">
              <span className="label">Preferred Refill Day:</span>
              <span>Friday Morning</span>
            </div>
            <div className="spec-row">
              <span className="label">Assigned Delivery Partner:</span>
              <span>Arun (Tata Ace KA 03 EQ 4521)</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="content-card">
          <div className="card-header">
            <div>
              <span className="card-eyebrow">UPDATE DETAILS</span>
              <h3>Edit Contact &amp; Delivery Address</h3>
            </div>
          </div>

          {saveSuccess && (
            <div className="success-alert-banner">
              ✓ Profile information updated successfully!
            </div>
          )}

          <form onSubmit={handleSave} className="edit-profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group mt-3">
              <label>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group mt-3">
              <label>Delivery Address</label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-actions-row mt-4">
              <button type="submit" className="btn-primary full-width">
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
