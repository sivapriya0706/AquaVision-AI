import { useAuth } from "../context/AuthContext";

export const CUSTOMER_NAV = [
  { id: "dashboard", label: "Home", icon: "⌂" },
  { id: "water-cans", label: "My Cans", icon: "🪣" },
  { id: "orders", label: "My Orders", icon: "📦" },
  { id: "delivery-status", label: "Delivery", icon: "🚚" },
  { id: "payments", label: "Payments", icon: "💳" },
  { id: "damage-report", label: "Report Damage", icon: "⚠️" },
];

export const PARTNER_NAV = [
  { id: "dashboard", label: "Home", icon: "⌂" },
  { id: "today-deliveries", label: "Today's Deliveries", icon: "📅" },
  { id: "delivery-route", label: "Route", icon: "🗺️" },
  { id: "empty-can-collection", label: "Can Collection", icon: "🔄" },
  { id: "delivery-history", label: "History", icon: "📜" },
];

export const ADMIN_NAV = [
  { id: "dashboard", label: "Home", icon: "⌂" },
  { id: "orders", label: "Orders", icon: "📦" },
  { id: "water-cans", label: "Water Cans", icon: "🪣" },
  { id: "delivery-management", label: "Deliveries", icon: "🚚" },
  { id: "damage-reports", label: "Damage Reports", icon: "⚠️" },
  { id: "payments", label: "Payments", icon: "💳" },
  { id: "ai-insights", label: "AI Insights", icon: "🧠" },
];

export default function Sidebar({ currentTab, onSelectTab }) {
  const { role } = useAuth();

  let navItems = CUSTOMER_NAV;
  let roleTitle = "Customer Portal";

  if (role === "partner") {
    navItems = PARTNER_NAV;
    roleTitle = "Delivery Partner";
  } else if (role === "admin") {
    navItems = ADMIN_NAV;
    roleTitle = "Admin Console";
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">💧</div>
        <div>
          <h2>AquaVision AI</h2>
          <span>{roleTitle.toUpperCase()}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item-btn ${isActive ? "active" : ""}`}
              onClick={() => onSelectTab(item.id)}
              type="button"
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
