import { API_BASE_URL } from "../../config/api";
import { useState, useEffect } from "react";
import Modal from "../../components/Modal";

export default function AdminWaterCans() {
  const [cans, setCans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCan, setSelectedCan] = useState(null);

  // New Can Form State
  const [canId, setCanId] = useState("");
  const [customerName, setCustomerName] = useState("Central Hub Inventory");
  const [capacity, setCapacity] = useState("20 Liters");
  const [status, setStatus] = useState("Full");
  const [condition, setCondition] = useState("Good");

  const loadCans = () => {
    fetch(`${API_BASE_URL}/api/cans`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCans(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCans();
  }, []);

  const handleAddCan = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/cans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canId: canId || `CAN-${Math.floor(1000 + Math.random() * 9000)}`,
          customerName: customerName,
          capacity: capacity,
          status: status,
          condition: condition,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setCanId("");
        loadCans();
      }
    } catch {
      alert("Failed to register can");
    }
  };

  const handleUpdateStatus = async (canId, newStatus, newCondition) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cans/${canId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          condition: newCondition,
        }),
      });
      if (res.ok) {
        setSelectedCan(null);
        loadCans();
      }
    } catch {
      alert("Failed to update can status");
    }
  };

  const filteredCans = cans.filter((can) => {
    if (filter === "all") return true;
    return can.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>Water Cans</h2>
          <p>Inventory of circulating water containers</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add Water Can
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tab-bar">
        {["all", "Full", "In Use", "Empty", "Damaged"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`filter-tab-btn ${filter === tab ? "active" : ""}`}
            onClick={() => setFilter(tab)}
          >
            {tab === "all" ? "All Cans" : tab} ({
              tab === "all"
                ? cans.length
                : cans.filter((c) => c.status.toLowerCase() === tab.toLowerCase()).length
            })
          </button>
        ))}
      </div>

      {/* Water Can Clean Table */}
      <div className="content-card full-width">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Can ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Last Refill</th>
                <th>Next Refill</th>
                <th>Condition</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Loading water cans...
                  </td>
                </tr>
              ) : filteredCans.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No water cans match this filter.
                  </td>
                </tr>
              ) : (
                filteredCans.map((can) => (
                  <tr key={can.canId}>
                    <td>
                      <strong>{can.canId}</strong>
                    </td>
                    <td>{can.customerName || "Central Hub Storage"}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          can.status === "Full"
                            ? "success"
                            : can.status === "In Use"
                            ? "info"
                            : can.status === "Empty"
                            ? "warning"
                            : can.status === "Damaged"
                            ? "danger"
                            : "purple"
                        }`}
                      >
                        {can.status}
                      </span>
                    </td>
                    <td>{can.lastRefill}</td>
                    <td>{can.nextExpectedRefill}</td>
                    <td>{can.condition}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-outline-sm"
                        onClick={() => setSelectedCan(can)}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Can Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Water Can"
      >
        <form onSubmit={handleAddCan} className="modal-form">
          <div className="form-group">
            <label>Can ID (Auto-generated if empty)</label>
            <input
              type="text"
              placeholder="e.g. CAN-5501"
              value={canId}
              onChange={(e) => setCanId(e.target.value)}
            />
          </div>

          <div className="form-group mt-3">
            <label>Customer / Holder Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div className="form-grid-2 mt-3">
            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Full">Full</option>
                <option value="Empty">Empty</option>
                <option value="In Use">In Use</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>

            <div className="form-group">
              <label>Capacity</label>
              <select value={capacity} onChange={(e) => setCapacity(e.target.value)}>
                <option value="20 Liters">20 Liters</option>
                <option value="10 Liters">10 Liters</option>
              </select>
            </div>
          </div>

          <div className="form-group mt-3">
            <label>Condition</label>
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
          </div>

          <div className="modal-actions-row mt-4">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Can
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Can Modal */}
      <Modal
        isOpen={!!selectedCan}
        onClose={() => setSelectedCan(null)}
        title={`Update Can: ${selectedCan?.canId}`}
      >
        {selectedCan && (
          <div className="modal-form">
            <div className="form-group">
              <label>Status</label>
              <select
                defaultValue={selectedCan.status}
                id="update-status-select"
              >
                <option value="Full">Full</option>
                <option value="Empty">Empty</option>
                <option value="In Use">In Use</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>

            <div className="form-group mt-3">
              <label>Condition</label>
              <input
                type="text"
                defaultValue={selectedCan.condition}
                id="update-condition-input"
              />
            </div>

            <div className="modal-actions-row mt-4">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedCan(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  const s = document.getElementById("update-status-select").value;
                  const c = document.getElementById("update-condition-input").value;
                  handleUpdateStatus(selectedCan.canId, s, c);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
