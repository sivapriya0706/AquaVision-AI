import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { loginWithRole, loginWithCredentials, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    const result = await loginWithCredentials(email, password);
    if (!result.success) {
      setErrorMessage(result.message || "Login failed.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-brand-icon">💧</div>
          <h2>AquaVision AI</h2>
          <p className="login-subtitle">Smart Water Can Management</p>
        </div>

        {/* Clean 3-Role Selection UI */}
        <div className="demo-roles-section">
          <div className="section-label">
            <span>SELECT ROLE TO ENTER DEMO</span>
          </div>

          <div className="role-cards-grid">
            {/* Customer Card */}
            <div
              className="role-card customer"
              onClick={() => loginWithRole("customer")}
            >
              <div className="role-card-icon">👤</div>
              <h3>Customer</h3>
              <p>
                Manage water cans, track deliveries, pay bills, and request refills.
              </p>
              <button
                type="button"
                className="role-login-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  loginWithRole("customer");
                }}
              >
                Login as Customer →
              </button>
            </div>

            {/* Delivery Partner Card */}
            <div
              className="role-card partner"
              onClick={() => loginWithRole("partner")}
            >
              <div className="role-card-icon">🛵</div>
              <h3>Delivery Partner</h3>
              <p>
                View today&apos;s assigned deliveries, routes, and empty can collections.
              </p>
              <button
                type="button"
                className="role-login-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  loginWithRole("partner");
                }}
              >
                Login as Delivery Partner →
              </button>
            </div>

            {/* Admin Card */}
            <div
              className="role-card admin"
              onClick={() => loginWithRole("admin")}
            >
              <div className="role-card-icon">🛡️</div>
              <h3>Admin</h3>
              <p>
                Manage orders, water cans, driver dispatch, damage reports, and AI insights.
              </p>
              <button
                type="button"
                className="role-login-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  loginWithRole("admin");
                }}
              >
                Login as Admin →
              </button>
            </div>
          </div>
        </div>

        {/* Credentials Login */}
        <div className="login-divider">
          <span>OR SIGN IN WITH EMAIL</span>
        </div>

        <form className="login-form-box" onSubmit={handleCustomLogin}>
          {errorMessage && <div className="login-error-alert">{errorMessage}</div>}

          <div className="form-field-row">
            <div className="form-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="customer@aquavision.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions-row">
            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
