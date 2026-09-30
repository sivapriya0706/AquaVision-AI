import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function PartnerProfile() {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || "Arun");
  const [phone, setPhone] = useState(user?.phone || "+91 91234 56789");
  const [vehicle, setVehicle] = useState(user?.vehicleNumber || "KA 03 EQ 4521 (Tata Ace)");
  const [zone, setZone] = useState(user?.assignedZone || "Bellandur & Sarjapur Road");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateUserProfile({ name, phone, vehicleNumber: vehicle, assignedZone: zone });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>Delivery Partner Profile</h2>
          <p>Driver credentials, assigned delivery truck, and cluster coverage.</p>
        </div>
      </div>

      <div className="two-col-grid">
        <div className="content-card">
          <div className="profile-hero">
            <div className="profile-large-avatar partner-avatar-large">
              {user?.avatar || "RB"}
            </div>
            <h3>{user?.name || "Arun"}</h3>
            <span className="role-tag">Certified Delivery Partner • Tier 1</span>
            <div className="driver-star-rating">★ 4.8 / 5.0 (148 Deliveries Rated)</div>
          </div>

          <div className="profile-spec-list mt-4">
            <div className="spec-row">
              <span className="label">Driver Partner ID:</span>
              <strong>{user?.id || "USR-003"}</strong>
            </div>
            <div className="spec-row">
              <span className="label">Registered Phone:</span>
              <span>{user?.phone || "+91 91234 56789"}</span>
            </div>
            <div className="spec-row">
              <span className="label">Vehicle Assigned:</span>
              <span>{user?.vehicleNumber || "KA 03 EQ 4521 (Tata Ace)"}</span>
            </div>
            <div className="spec-row">
              <span className="label">Vehicle Capacity:</span>
              <span>30 × 20L Water Cans</span>
            </div>
            <div className="spec-row">
              <span className="label">Delivery Corridor:</span>
              <span>{user?.assignedZone || "Bellandur & Sarjapur Road"}</span>
            </div>
            <div className="spec-row">
              <span className="label">Fulfillment Depot:</span>
              <span>Bellandur Central Hub</span>
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <div>
              <span className="card-eyebrow">DRIVER CREDENTIALS</span>
              <h3>Update Driver &amp; Vehicle Info</h3>
            </div>
          </div>

          {saveSuccess && (
            <div className="success-alert-banner">
              ✓ Partner profile details updated!
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
              <label>Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group mt-3">
              <label>Assigned Vehicle &amp; Number Plate</label>
              <input
                type="text"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                required
              />
            </div>

            <div className="form-group mt-3">
              <label>Assigned Delivery Zone</label>
              <input
                type="text"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary full-width mt-4">
              Save Profile Updates
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
