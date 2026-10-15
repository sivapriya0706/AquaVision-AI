import { API_BASE_URL } from "../config/api";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ title, onOpenNotifications, onSelectTab }) {
  const { user, role, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(2);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetch(`${API_BASE_URL}/api/notifications?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const unread = data.filter((n) => !n.read).length;
            setUnreadCount(unread);
          }
        })
        .catch(() => {});
    }
  }, [user?.id]);

  const roleDisplay =
    role === "admin"
      ? "Admin"
      : role === "partner"
      ? "Delivery Partner"
      : "Customer";

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{title}</h1>
      </div>

      <div className="navbar-right">
        {/* Active Role Indicator Badge */}
        <div className="role-switch-container">
          <div className="demo-switch-btn" style={{ cursor: "default" }}>
            <span className="switch-icon">💧</span>
            <span>{roleDisplay}</span>
          </div>
        </div>

        {/* Notifications Icon */}
        <button
          type="button"
          className="icon-action-btn"
          onClick={onOpenNotifications}
          title="Notifications"
        >
          <span className="bell-icon">🔔</span>
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </button>

        {/* User Profile Top-Right Menu */}
        <div className="user-menu-container">
          <button
            type="button"
            className="user-profile-widget"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="avatar-circle">
              {user?.avatar || (user?.name ? user.name[0] : "U")}
            </div>
            <div className="user-details">
              <strong>{user?.name || "User"}</strong>
              <small>{roleDisplay}</small>
            </div>
          </button>

          {showUserMenu && (
            <div className="user-dropdown-menu">
              <div className="user-dropdown-header">
                <strong>{user?.name}</strong>
                <small>{user?.email}</small>
              </div>

              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setShowUserMenu(false);
                  if (onSelectTab) onSelectTab("profile");
                }}
              >
                👤 Profile Settings
              </button>

              {role === "admin" && (
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onSelectTab) onSelectTab("settings");
                  }}
                >
                  ⚙️ System Settings
                </button>
              )}

              <div className="dropdown-divider"></div>

              <button
                type="button"
                className="dropdown-item logout-item"
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
