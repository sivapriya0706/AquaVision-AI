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
    // Default to customer on initial fresh open for seamless demo
    return DEMO_ACCOUNTS.customer;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("aquavision_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("aquavision_user");
    }
  }, [user]);

  const loginWithRole = (role) => {
    const targetUser = DEMO_ACCOUNTS[role] || DEMO_ACCOUNTS.customer;
    setUser(targetUser);
    return targetUser;
  };

  const loginWithCredentials = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setLoading(false);
        return { success: true, user: data.user };
      }
      // If server unreachable or error, fallback to demo matching
      const found = Object.values(DEMO_ACCOUNTS).find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (found) {
        setUser(found);
        setLoading(false);
        return { success: true, user: found };
      }
      setLoading(false);
      return { success: false, message: data.message || "Invalid credentials" };
    } catch {
      // Local fallback
      const found = Object.values(DEMO_ACCOUNTS).find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (found) {
        setUser(found);
        setLoading(false);
        return { success: true, user: found };
      }
      setLoading(false);
      return { success: false, message: "Server connection failed, use demo 1-click login." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("aquavision_user");
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
        loginWithRole,
        loginWithCredentials,
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
