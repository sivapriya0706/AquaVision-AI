import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { loginWithCredentials, registerCustomer, loading } = useAuth();

  // Mode: "customer_login" | "customer_signup" | "staff_login"
  const [authMode, setAuthMode] = useState("customer_login");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const resetMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleModeChange = (mode) => {
    resetMessages();
    setAuthMode(mode);
    setPassword("");
    if (mode === "staff_login") {
      setEmail("admin@aquavision.ai");
    } else if (mode === "customer_login") {
      setEmail("customer@aquavision.ai");
    } else {
      setEmail("");
    }
  };

  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!email || !email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    const result = await loginWithCredentials(email.trim(), password);
    if (!result.success) {
      setErrorMessage(result.message || "Invalid credentials.");
    }
  };

  const handleCustomerSignup = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!name || !name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email || !email.trim() || !email.includes("@") || !email.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    const result = await registerCustomer({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim(),
      address: address.trim(),
    });

    if (!result.success) {
      setErrorMessage(result.message || "Registration failed.");
    }
  };

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!email || !email.trim()) {
      setErrorMessage("Please enter your staff email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your staff password.");
      return;
    }

    const result = await loginWithCredentials(email.trim(), password);
    if (!result.success) {
      setErrorMessage(result.message || "Invalid staff credentials.");
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

        {/* Navigation Tabs for Auth Modes */}
        <div className="login-tabs-nav">
          <button
            type="button"
            className={`login-tab-btn ${authMode === "customer_login" ? "active" : ""}`}
            onClick={() => handleModeChange("customer_login")}
          >
            <span>👤 Customer Sign In</span>
          </button>
          <button
            type="button"
            className={`login-tab-btn ${authMode === "customer_signup" ? "active" : ""}`}
            onClick={() => handleModeChange("customer_signup")}
          >
            <span>✨ Create Customer Account</span>
          </button>
          <button
            type="button"
            className={`login-tab-btn staff ${authMode === "staff_login" ? "active" : ""}`}
            onClick={() => handleModeChange("staff_login")}
          >
            <span>🛡️ Staff Portal</span>
          </button>
        </div>

        {/* CUSTOMER LOGIN FORM */}
        {authMode === "customer_login" && (
          <form className="login-form-box" onSubmit={handleCustomerLogin}>
            <div className="section-label">
              <span>CUSTOMER LOGIN</span>
            </div>

            {errorMessage && <div className="login-error-alert">{errorMessage}</div>}
            {successMessage && <div className="login-success-alert">{successMessage}</div>}

            <div className="form-field-row">
              <div className="form-field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="customer@aquavision.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Sign In to Customer Dashboard"}
            </button>

            <div className="login-helper-box">
              Existing account: <strong>customer@aquavision.ai</strong> (Password: <strong>Customer@123</strong>)
            </div>

            <div className="login-mode-switch-link">
              Don&apos;t have an account?{" "}
              <button type="button" onClick={() => handleModeChange("customer_signup")}>
                Sign Up as Customer
              </button>
            </div>
          </form>
        )}

        {/* CUSTOMER SIGNUP FORM */}
        {authMode === "customer_signup" && (
          <form className="login-form-box" onSubmit={handleCustomerSignup}>
            <div className="section-label">
              <span>NEW CUSTOMER REGISTRATION</span>
            </div>

            {errorMessage && <div className="login-error-alert">{errorMessage}</div>}

            <div className="form-field-row">
              <div className="form-field">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="Aravind Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="aravind@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-field-row" style={{ marginTop: "14px" }}>
              <div className="form-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Password * (min 6 characters)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className="login-form-full-row" style={{ marginTop: "14px" }}>
              <div className="form-field">
                <label>Delivery Address</label>
                <input
                  type="text"
                  placeholder="Flat No, Building, Street, Area, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Customer Account"}
            </button>

            <div className="login-mode-switch-link">
              Already registered?{" "}
              <button type="button" onClick={() => handleModeChange("customer_login")}>
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* STAFF LOGIN FORM (DELIVERY PARTNER & ADMIN) */}
        {authMode === "staff_login" && (
          <form className="login-form-box" onSubmit={handleStaffLogin}>
            <div className="section-label">
              <span>STAFF AUTHENTICATION (DELIVERY PARTNER & ADMIN)</span>
            </div>

            {errorMessage && <div className="login-error-alert">{errorMessage}</div>}

            <div className="form-field-row">
              <div className="form-field">
                <label>Staff Email Address</label>
                <input
                  type="email"
                  placeholder="partner@aquavision.ai or admin@aquavision.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              style={{ background: "#0284c7" }}
              disabled={loading}
            >
              {loading ? "Authenticating Staff..." : "Sign In to Staff Console"}
            </button>

            <div className="login-helper-box">
              Partner: <strong>partner@aquavision.ai</strong> (Password: <strong>Partner@123</strong>)
              <br />
              Admin: <strong>admin@aquavision.ai</strong> (Password: <strong>Admin@123</strong>)
            </div>

            <div className="login-mode-switch-link">
              Need customer access?{" "}
              <button type="button" onClick={() => handleModeChange("customer_login")}>
                Return to Customer Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
