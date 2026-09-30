import { useState, useEffect } from "react";
import "./App.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";

// Customer Views
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerWaterCans from "./pages/customer/CustomerWaterCans";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerDeliveryStatus from "./pages/customer/CustomerDeliveryStatus";
import CustomerRefillOrder from "./pages/customer/CustomerRefillOrder";
import CustomerDamageReport from "./pages/customer/CustomerDamageReport";
import CustomerPayments from "./pages/customer/CustomerPayments";
import CustomerNotifications from "./pages/customer/CustomerNotifications";
import CustomerProfile from "./pages/customer/CustomerProfile";

// Delivery Partner Views
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import PartnerDeliveries from "./pages/partner/PartnerDeliveries";
import PartnerRoute from "./pages/partner/PartnerRoute";
import PartnerEmptyCans from "./pages/partner/PartnerEmptyCans";
import PartnerDamageReports from "./pages/partner/PartnerDamageReports";
import PartnerDeliveryHistory from "./pages/partner/PartnerDeliveryHistory";
import PartnerProfile from "./pages/partner/PartnerProfile";

// Admin Views
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminWaterCans from "./pages/admin/AdminWaterCans";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminDeliveryManagement from "./pages/admin/AdminDeliveryManagement";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminDeliveryPartners from "./pages/admin/AdminDeliveryPartners";
import AdminDamageReports from "./pages/admin/AdminDamageReports";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminAIInsights from "./pages/admin/AdminAIInsights";
import AdminReportsAnalytics from "./pages/admin/AdminReportsAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";

function AppShell() {
  const { isAuthenticated, role } = useAuth();
  const [currentTab, setCurrentTab] = useState("dashboard");

  // When role changes, automatically reset tab to dashboard
  useEffect(() => {
    setCurrentTab("dashboard");
  }, [role]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Get simple clean title for Navbar
  const getTabTitle = () => {
    const titles = {
      dashboard: "Home",
      "water-cans": role === "admin" ? "Water Cans" : "My Cans",
      orders: role === "admin" ? "Orders" : "My Orders",
      "delivery-status": "Delivery",
      refill: "Reorder Water Cans",
      "damage-report": "Report Damage",
      "damage-reports": "Damage Reports",
      payments: "Payments",
      notifications: "Notifications",
      profile: "Profile",
      "today-deliveries": "Today's Deliveries",
      "assigned-orders": "Assigned Deliveries",
      "delivery-route": "Delivery Route",
      "customer-details": "Customer Contact Details",
      "empty-can-collection": "Can Collection",
      "delivery-history": "Delivery History",
      "delivery-management": "Deliveries",
      customers: "Customers",
      "delivery-partners": "Delivery Partners",
      "ai-insights": "AI Insights",
      reports: "Reports",
      settings: "Settings",
    };
    return titles[currentTab] || "AquaVision AI";
  };

  // Render content based strictly on active role and tab
  const renderRoleContent = () => {
    if (role === "customer") {
      switch (currentTab) {
        case "dashboard":
          return <CustomerDashboard onNavigate={setCurrentTab} />;
        case "water-cans":
          return <CustomerWaterCans onNavigate={setCurrentTab} />;
        case "orders":
          return <CustomerOrders onNavigate={setCurrentTab} />;
        case "delivery-status":
          return <CustomerDeliveryStatus onNavigate={setCurrentTab} />;
        case "refill":
          return <CustomerRefillOrder onNavigate={setCurrentTab} />;
        case "damage-report":
          return <CustomerDamageReport />;
        case "payments":
          return <CustomerPayments />;
        case "notifications":
          return <CustomerNotifications />;
        case "profile":
          return <CustomerProfile />;
        default:
          return <CustomerDashboard onNavigate={setCurrentTab} />;
      }
    }

    if (role === "partner") {
      switch (currentTab) {
        case "dashboard":
          return <PartnerDashboard onNavigate={setCurrentTab} />;
        case "today-deliveries":
          return <PartnerDeliveries title="Today's Deliveries" />;
        case "assigned-orders":
          return <PartnerDeliveries title="Assigned Deliveries" />;
        case "delivery-route":
          return <PartnerRoute />;
        case "empty-can-collection":
          return <PartnerEmptyCans />;
        case "damage-reports":
          return <PartnerDamageReports />;
        case "delivery-history":
          return <PartnerDeliveryHistory />;
        case "profile":
          return <PartnerProfile />;
        default:
          return <PartnerDashboard onNavigate={setCurrentTab} />;
      }
    }

    if (role === "admin") {
      switch (currentTab) {
        case "dashboard":
          return <AdminDashboard onNavigate={setCurrentTab} />;
        case "water-cans":
          return <AdminWaterCans />;
        case "orders":
          return <AdminOrders />;
        case "delivery-management":
          return <AdminDeliveryManagement />;
        case "customers":
          return <AdminCustomers />;
        case "delivery-partners":
          return <AdminDeliveryPartners />;
        case "damage-reports":
          return <AdminDamageReports />;
        case "payments":
          return <AdminPayments />;
        case "ai-insights":
          return <AdminAIInsights />;
        case "reports":
          return <AdminReportsAnalytics />;
        case "settings":
          return <AdminSettings />;
        default:
          return <AdminDashboard onNavigate={setCurrentTab} />;
      }
    }

    return <CustomerDashboard onNavigate={setCurrentTab} />;
  };

  return (
    <div className="app-shell">
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />
      <div className="main-content">
        <Navbar
          title={getTabTitle()}
          onOpenNotifications={() => setCurrentTab("notifications")}
          onSelectTab={setCurrentTab}
        />
        <main>{renderRoleContent()}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}