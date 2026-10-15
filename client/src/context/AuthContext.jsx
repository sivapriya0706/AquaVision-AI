import { API_BASE_URL } from "../config/api";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = {
  customer: {
    id: "USR-001",
    name: "Sivapriya",
    email: "customer@aquavision.ai",
    role: "customer",
    phone: "+91 98765 43210",
    address: "Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103",
    avatar: "S",
    assignedPartnerId: "USR-003",
    waterCansCount: 4,
    balanceDue: 450,
  },
  partner: {
    id: "USR-003",
    name: "Arun",
    email: "partner@aquavision.ai",
    role: "partner",
    phone: "+91 91234 56789",
    vehicleNumber: "KA 03 EQ 4521 (Tata Ace)",
    assignedZone: "Bellandur & Sarjapur Road",
    avatar: "A",
    rating: 4.8,
    activeDeliveriesCount: 4,
  },
  admin: {
    id: "USR-005",
    name: "AquaVision Admin",
    email: "admin@aquavision.ai",
    role: "admin",
    phone: "+91 98000 11223",
    department: "Operations & Quality Assurance",
    avatar: "A",
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("aquavision_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default to unauthenticated: no auto-login without credentials
    return null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("aquavision_user", JSON.stringify(user));
      if (user.token) {
        localStorage.setItem("aquavision_token", user.token);
      }
    } else {
      localStorage.removeItem("aquavision_user");
      localStorage.removeItem("aquavision_token");
    }
  }, [user]);

  const loginWithCredentials = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const fullUser = { ...data.user, token: data.token };
        setUser(fullUser);
        localStorage.setItem("aquavision_user", JSON.stringify(fullUser));
        if (data.token) {
          localStorage.setItem("aquavision_token", data.token);
        }
        setLoading(false);
        return { success: true, user: fullUser };
      }
      setLoading(false);
      return { success: false, message: data.message || "Invalid email or password." };
    } catch {
      setLoading(false);
      return { success: false, message: "Unable to reach AquaVision server. Please ensure backend is running." };
    }
  };

  const registerCustomer = async ({ name, email, password, phone, address }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, address }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const fullUser = { ...data.user, token: data.token };
        setUser(fullUser);
        localStorage.setItem("aquavision_user", JSON.stringify(fullUser));
        if (data.token) {
          localStorage.setItem("aquavision_token", data.token);
        }
        setLoading(false);
        return { success: true, user: fullUser };
      }
      setLoading(false);
      return { success: false, message: data.message || "Registration failed." };
    } catch {
      setLoading(false);
      return { success: false, message: "Unable to reach AquaVision server. Please ensure backend is running." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("aquavision_user");
    localStorage.removeItem("aquavision_token");
  };

  const updateUserProfile = (updatedFields) => {
    setUser((prev) => ({
      ...prev,
      ...updatedFields,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        loginWithCredentials,
        registerCustomer,
        logout,
        updateUserProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
