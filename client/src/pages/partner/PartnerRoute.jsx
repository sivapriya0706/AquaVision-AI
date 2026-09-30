import { useState } from "react";

export default function PartnerRoute() {
  const [stops, setStops] = useState([
    {
      id: 1,
      name: "AquaVision Central Bottling Depot",
      type: "Depot / Loading",
      address: "Warehouse 4, Outer Ring Road, Bellandur, Bengaluru",
      eta: "08:30 AM",
      action: "Load 24 Full 20L Cans",
      status: "Completed",
      phone: "+91 80 2345 6789",
    },
    {
      id: 2,
      name: "Sivapriya (Order #ORD-9021)",
      type: "Customer Refill Drop",
      address: "Flat 402, Green Glen Layout, Bellandur",
      eta: "09:45 AM",
      action: "Deliver 2 Cans • Collect 2 Empty",
      status: "In Progress",
      phone: "+91 98765 43210",
    },
    {
      id: 3,
      name: "Sunita Sharma (Order #ORD-9025)",
      type: "Customer Refill Drop",
      address: "Villa 12, Palm Meadows, Whitefield",
      eta: "11:15 AM",
      action: "Deliver 4 Cans • Collect 3 Empty",
      status: "Upcoming",
      phone: "+91 98451 23456",
    },
    {
      id: 4,
      name: "Green Glen Apartments Hub",
      type: "Scheduled Bulk Drop",
      address: "Tower B Security Desk, Bellandur",
      eta: "01:30 PM",
      action: "Deliver 3 Cans • Collect 3 Empty",
      status: "Upcoming",
      phone: "+91 98111 22334",
    },
    {
      id: 5,
      name: "Central Hub Return",
      type: "Depot Offload",
      address: "Warehouse 4, Outer Ring Road, Bellandur",
      eta: "03:45 PM",
      action: "Deposit Collected Empty Cans & Reconcile",
      status: "Upcoming",
      phone: "+91 80 2345 6789",
    },
  ]);

  const markStopCompleted = (id) => {
    setStops((prev) =>
      prev.map((stop) =>
        stop.id === id
          ? { ...stop, status: "Completed" }
          : stop.id === id + 1 && stop.status === "Upcoming"
          ? { ...stop, status: "In Progress" }
          : stop
      )
    );
  };

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>Delivery Route &amp; Stop Schedule</h2>
          <p>
            Sequential route plan for your daily dispatch run across Bellandur and Whitefield.
          </p>
        </div>
      </div>

      {/* Honest Prototype Disclaimer Banner */}
      <div className="gps-disclaimer-banner">
        <span className="disclaimer-icon">🗺️</span>
        <div>
          <strong>Optimized Dispatch Sequence (Simulated Navigation)</strong>
          <p>
            This route plan organizes delivery stops in sequential geographical order. Live satellite GPS telemetry is not active; route ordering is handled via scheduled dispatch stops.
          </p>
        </div>
      </div>

      {/* Route Overview Metrics */}
      <div className="stats-grid mt-4">
        <div className="stat-card">
          <div className="stat-icon blue">📍</div>
          <div className="stat-info">
            <span className="stat-title">Total Scheduled Stops</span>
            <div className="stat-value">{stops.length} Stops</div>
            <span className="stat-meta">Sector 4 Corridor Run</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald">✓</div>
          <div className="stat-info">
            <span className="stat-title">Stops Completed</span>
            <div className="stat-value">
              {stops.filter((s) => s.status === "Completed").length} / {stops.length}
            </div>
            <span className="stat-meta">Fulfillment on schedule</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teal">🛣️</div>
          <div className="stat-info">
            <span className="stat-title">Estimated Circuit Distance</span>
            <div className="stat-value">16.8 km</div>
            <span className="stat-meta">Approximate transit loop</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">🪣</div>
          <div className="stat-info">
            <span className="stat-title">Cans on Board</span>
            <div className="stat-value">18 Full / 4 Empty</div>
            <span className="stat-meta">Capacity: 30 Cans (Tata Ace)</span>
          </div>
        </div>
      </div>

      {/* Stop by Stop Sequence Timeline */}
      <div className="content-card full-width mt-4">
        <div className="card-header">
          <div>
            <span className="card-eyebrow">DISPATCH TIMELINE</span>
            <h3>Sequential Route Manifest</h3>
          </div>
        </div>

        <div className="route-manifest-list">
          {stops.map((stop, index) => (
            <div
              key={stop.id}
              className={`route-manifest-item ${stop.status.toLowerCase().replace(" ", "-")}`}
            >
              <div className="stop-marker">
                <span className="stop-index">{index + 1}</span>
                {index < stops.length - 1 && <div className="stop-connector-line"></div>}
              </div>

              <div className="stop-info-body">
                <div className="stop-top-line">
                  <h4>{stop.name}</h4>
                  <span
                    className={`status-pill ${
                      stop.status === "Completed"
                        ? "success"
                        : stop.status === "In Progress"
                        ? "info"
                        : "neutral"
                    }`}
                  >
                    {stop.status}
                  </span>
                </div>

                <div className="stop-type-badge">{stop.type}</div>
                <p className="stop-address">📍 {stop.address}</p>

                <div className="stop-action-callout">
                  <strong>Task:</strong> {stop.action} • <strong>ETA:</strong> {stop.eta}
                </div>
              </div>

              <div className="stop-side-actions">
                <a
                  href={`tel:${stop.phone}`}
                  className="btn-outline-sm"
                  title="Call contact"
                >
                  📞 Call
                </a>
                {stop.status === "In Progress" && (
                  <button
                    type="button"
                    className="btn-primary-sm"
                    onClick={() => markStopCompleted(stop.id)}
                  >
                    Mark Stop Reached ✓
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
