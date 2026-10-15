import { API_BASE_URL } from "../../config/api";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function CustomerNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = () => {
    fetch(`${API_BASE_URL}/api/notifications?userId=${user?.id || "USR-001"}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {}
  };

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>Notifications &amp; Activity Alerts</h2>
          <p>Stay updated on AI refill recommendations, delivery dispatches, and quality checks.</p>
        </div>
      </div>

      <div className="content-card full-width">
        <div className="card-header">
          <div>
            <span className="card-eyebrow">FEED</span>
            <h3>Inbox Activity</h3>
          </div>
          <button
            type="button"
            className="btn-link"
            onClick={loadNotifications}
          >
            Refresh Feed
          </button>
        </div>

        <div className="notifications-extended-list">
          {loading ? (
            <p className="loading-hint">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div className="empty-history">
              <span className="empty-icon">🔔</span>
              <p>No notifications at the moment.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notif-card-row ${notif.read ? "read" : "unread"}`}
              >
                <div className="notif-card-icon">
                  {notif.type === "ai"
                    ? "🔮"
                    : notif.type === "order"
                    ? "📦"
                    : notif.type === "damage"
                    ? "⚠️"
                    : "🔔"}
                </div>
                <div className="notif-card-body">
                  <div className="notif-card-header">
                    <h4>{notif.title}</h4>
                    <span className="notif-time">{notif.date}</span>
                  </div>
                  <p>{notif.message}</p>
                </div>
                <div className="notif-card-actions">
                  {!notif.read && (
                    <button
                      type="button"
                      className="btn-outline-sm"
                      onClick={() => markAsRead(notif.id)}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
