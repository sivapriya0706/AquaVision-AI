// ======================================================
// AquaVision AI - Data Store & MongoDB Persistence
// Supports MongoDB via Mongoose with graceful fallback to in-memory store
// ======================================================

const crypto = require("crypto");

const User = require("../models/User");
const WaterCan = require("../models/WaterCan");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");
const EmptyCanCollection = require("../models/EmptyCanCollection");
const DamageReport = require("../models/DamageReport");
const { isConnected } = require("../config/db");

// Password hashing & constant-time verification using native crypto scrypt
function hashPassword(password) {
  if (!password) return "";
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  if (!password || !storedPassword || typeof storedPassword !== "string" || !storedPassword.includes(":")) {
    return false;
  }
  const [salt, originalHash] = storedPassword.split(":");
  if (!salt || !originalHash) return false;
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(originalHash, "hex"));
  } catch {
    return false;
  }
}

// ======================================================
// INITIAL DEMO DATASETS
// ======================================================

const initialUsers = [
  {
    id: "USR-001",
    name: "Sivapriya",
    email: "customer@aquavision.ai",
    role: "customer",
    password: hashPassword("Customer@123"),
    phone: "+91 98765 43210",
    address: "Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103",
    avatar: "S",
    assignedPartnerId: "USR-003",
    waterCansCount: 4,
    balanceDue: 450,
  },
  {
    id: "USR-002",
    name: "Sunita Sharma",
    email: "sunita@aquavision.ai",
    role: "customer",
    password: hashPassword("Customer@123"),
    phone: "+91 98451 23456",
    address: "Villa 12, Palm Meadows, Whitefield, Bengaluru - 560066",
    avatar: "SS",
    assignedPartnerId: "USR-004",
    waterCansCount: 6,
    balanceDue: 0,
  },
  {
    id: "USR-003",
    name: "Arun",
    email: "partner@aquavision.ai",
    role: "partner",
    password: hashPassword("Partner@123"),
    phone: "+91 91234 56789",
    vehicleNumber: "KA 03 EQ 4521 (Tata Ace)",
    assignedZone: "Bellandur & Sarjapur Road",
    avatar: "A",
    rating: 4.8,
    activeDeliveriesCount: 4,
  },
  {
    id: "USR-004",
    name: "Vikram Rathore",
    email: "vikram.dp@aquavision.ai",
    role: "partner",
    password: hashPassword("Partner@123"),
    phone: "+91 99887 66554",
    vehicleNumber: "KA 05 MN 8820 (Mahindra Bolero)",
    assignedZone: "Whitefield & ITPL",
    avatar: "VR",
    rating: 4.9,
    activeDeliveriesCount: 3,
  },
  {
    id: "USR-005",
    name: "AquaVision Admin",
    email: "admin@aquavision.ai",
    role: "admin",
    password: hashPassword("Admin@123"),
    phone: "+91 98000 11223",
    department: "Operations & Quality Assurance",
    avatar: "A",
  },
];

const initialWaterCans = [
  {
    canId: "CAN-1001",
    customerId: "USR-001",
    customerName: "Sivapriya",
    capacity: "20 Liters",
    status: "In Use",
    condition: "Good",
    lastRefill: "2026-09-18",
    nextExpectedRefill: "2026-09-25",
    batch: "B-2026-08",
  },
  {
    canId: "CAN-1002",
    customerId: "USR-001",
    customerName: "Sivapriya",
    capacity: "20 Liters",
    status: "Empty",
    condition: "Good",
    lastRefill: "2026-09-15",
    nextExpectedRefill: "2026-09-25",
    batch: "B-2026-08",
  },
  {
    canId: "CAN-1003",
    customerId: "USR-001",
    customerName: "Sivapriya",
    capacity: "20 Liters",
    status: "Full",
    condition: "Good",
    lastRefill: "2026-09-22",
    nextExpectedRefill: "2026-09-29",
    batch: "B-2026-09",
  },
  {
    canId: "CAN-1004",
    customerId: "USR-001",
    customerName: "Sivapriya",
    capacity: "20 Liters",
    status: "Damaged",
    condition: "Crack near neck",
    lastRefill: "2026-09-10",
    nextExpectedRefill: "Under Inspection",
    batch: "B-2026-07",
  },
  {
    canId: "CAN-2001",
    customerId: "USR-002",
    customerName: "Sunita Sharma",
    capacity: "20 Liters",
    status: "In Use",
    condition: "Good",
    lastRefill: "2026-09-20",
    nextExpectedRefill: "2026-09-27",
    batch: "B-2026-09",
  },
  {
    canId: "CAN-2002",
    customerId: "USR-002",
    customerName: "Sunita Sharma",
    capacity: "20 Liters",
    status: "Full",
    condition: "Good",
    lastRefill: "2026-09-23",
    nextExpectedRefill: "2026-09-30",
    batch: "B-2026-09",
  },
  {
    canId: "CAN-3001",
    customerId: null,
    customerName: "Central Hub Inventory",
    capacity: "20 Liters",
    status: "Full",
    condition: "New",
    lastRefill: "2026-09-24",
    nextExpectedRefill: "In Stock",
    batch: "B-2026-09",
  },
  {
    canId: "CAN-3002",
    customerId: null,
    customerName: "Central Hub Inventory",
    capacity: "20 Liters",
    status: "Maintenance",
    condition: "Valve replacement",
    lastRefill: "2026-09-12",
    nextExpectedRefill: "Maintenance Hub",
    batch: "B-2026-06",
  },
];

const initialOrders = [
  {
    orderId: "ORD-9021",
    customerId: "USR-001",
    customerName: "Sivapriya",
    customerAddress: "Flat 402, Green Glen Layout, Bellandur",
    customerPhone: "+91 98765 43210",
    numberOfCans: 2,
    orderDate: "2026-09-24",
    deliveryDate: "2026-09-25",
    deliveryPartnerId: "USR-003",
    deliveryPartnerName: "Arun",
    status: "Out for Delivery",
    paymentStatus: "Pending",
    amount: 160,
    emptyCansReturned: 0,
    specialInstructions: "Ring bell twice, leave outside door if unavailable.",
  },
  {
    orderId: "ORD-8942",
    customerId: "USR-001",
    customerName: "Sivapriya",
    customerAddress: "Flat 402, Green Glen Layout, Bellandur",
    customerPhone: "+91 98765 43210",
    numberOfCans: 3,
    orderDate: "2026-09-18",
    deliveryDate: "2026-09-19",
    deliveryPartnerId: "USR-003",
    deliveryPartnerName: "Arun",
    status: "Delivered",
    paymentStatus: "Paid",
    amount: 240,
    emptyCansReturned: 3,
    specialInstructions: "Leave near security",
  },
  {
    orderId: "ORD-9025",
    customerId: "USR-002",
    customerName: "Sunita Sharma",
    customerAddress: "Villa 12, Palm Meadows, Whitefield",
    customerPhone: "+91 98451 23456",
    numberOfCans: 4,
    orderDate: "2026-09-24",
    deliveryDate: "2026-09-25",
    deliveryPartnerId: "USR-004",
    deliveryPartnerName: "Vikram Rathore",
    status: "Assigned",
    paymentStatus: "Paid",
    amount: 320,
    emptyCansReturned: 0,
    specialInstructions: "Call before reaching gate",
  },
  {
    orderId: "ORD-9030",
    customerId: "USR-001",
    customerName: "Sivapriya",
    customerAddress: "Flat 402, Green Glen Layout, Bellandur",
    customerPhone: "+91 98765 43210",
    numberOfCans: 2,
    orderDate: "2026-09-24",
    deliveryDate: "2026-09-26",
    deliveryPartnerId: null,
    deliveryPartnerName: "Unassigned",
    status: "Pending",
    paymentStatus: "Pending",
    amount: 160,
    emptyCansReturned: 0,
    specialInstructions: "Deliver between 9 AM to 12 PM",
  },
];

const initialPayments = [
  {
    paymentId: "PAY-501",
    customerId: "USR-001",
    customerName: "Sivapriya",
    orderId: "ORD-8942",
    date: "2026-09-19",
    amount: 240,
    method: "UPI (Google Pay)",
    status: "Completed",
    notes: "Regular 3-can refill order",
  },
  {
    paymentId: "PAY-502",
    customerId: "USR-002",
    customerName: "Sunita Sharma",
    orderId: "ORD-9025",
    date: "2026-09-24",
    amount: 320,
    method: "UPI (PhonePe)",
    status: "Completed",
    notes: "Advance payment for 4 cans",
  },
  {
    paymentId: "PAY-503",
    customerId: "USR-001",
    customerName: "Sivapriya",
    orderId: "ORD-9021",
    date: "2026-09-24",
    amount: 160,
    method: "Pending",
    status: "Pending",
    notes: "Payment pending on delivery",
  },
];

const initialNotifications = [
  {
    id: "NOTIF-1",
    userId: "USR-001",
    title: "AI Refill Alert",
    message: "Based on your 7-day consumption pattern, your 20L can will run dry tomorrow. Tap to reorder.",
    type: "ai",
    date: "Today at 08:30 AM",
    read: false,
  },
  {
    id: "NOTIF-2",
    userId: "USR-001",
    title: "Order Dispatched",
    message: "Order #ORD-9021 is out for delivery with Arun (Tata Ace KA 03 EQ 4521).",
    type: "order",
    date: "Today at 10:15 AM",
    read: false,
  },
  {
    id: "NOTIF-3",
    userId: "USR-003",
    title: "New Delivery Assigned",
    message: "You have been assigned order #ORD-9021 for Bellandur area.",
    type: "delivery",
    date: "Today at 09:00 AM",
    read: true,
  },
  {
    id: "NOTIF-4",
    userId: "USR-005",
    title: "Damage Report Review Needed",
    message: "New damage report DR-1024 submitted by Customer Sivapriya requires inspection.",
    type: "admin",
    date: "Yesterday at 04:45 PM",
    read: true,
  },
];

const initialEmptyCanCollections = [
  {
    collectionId: "COL-301",
    partnerId: "USR-003",
    partnerName: "Arun",
    customerId: "USR-001",
    customerName: "Sivapriya",
    orderId: "ORD-8942",
    quantity: 3,
    date: "2026-09-19",
    condition: "Good",
    status: "Deposited at Hub",
  },
];

const initialDamageReports = [
  {
    reportId: "DR-1024",
    customerId: "USR-001",
    customerName: "Sivapriya",
    damageType: "Crack",
    description: "Hairline crack along the bottom seam causing minor water dripping.",
    photo: "/uploads/sample-crack.jpg",
    status: "Pending Review",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    reportId: "DR-1023",
    customerId: "USR-002",
    customerName: "Sunita Sharma",
    damageType: "Leakage",
    description: "Dispenser valve neck is loose and leaking continuously.",
    photo: "/uploads/sample-leak.jpg",
    status: "Approved",
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
  {
    reportId: "DR-1022",
    customerId: "USR-001",
    customerName: "Sivapriya",
    damageType: "Dent",
    description: "Deep dent on the side handle, difficult to lift.",
    photo: "/uploads/sample-dent.jpg",
    status: "Rejected",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
];

// In-memory fallback data holders
let users = [...initialUsers];
let waterCans = [...initialWaterCans];
let orders = [...initialOrders];
let payments = [...initialPayments];
let notifications = [...initialNotifications];
let emptyCanCollections = [...initialEmptyCanCollections];
let damageReports = [...initialDamageReports];

// Helper to remove MongoDB internal fields from response objects
function cleanDoc(doc) {
  if (!doc) return null;
  if (Array.isArray(doc)) return doc.map(cleanDoc);
  if (doc && typeof doc.toObject === "function") doc = doc.toObject();
  const obj = { ...doc };
  delete obj._id;
  delete obj.__v;
  delete obj.password; // Never expose password hash in API responses
  return obj;
}

// ======================================================
// SEEDING AND SYNC
// ======================================================

async function seedInitialData() {
  if (!isConnected()) return;

  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany(initialUsers);
      console.log("[MongoDB] Seeded initial users");
    } else {
      // Upgrade existing users without password to have secure hashed credentials
      const unhashedUsers = await User.find({
        $or: [{ password: { $exists: false } }, { password: "" }, { password: null }],
      });
      for (const u of unhashedUsers) {
        let defaultPwd = "Customer@123";
        if (u.role === "partner") defaultPwd = "Partner@123";
        if (u.role === "admin") defaultPwd = "Admin@123";
        await User.updateOne({ _id: u._id }, { $set: { password: hashPassword(defaultPwd) } });
      }
    }

    const canCount = await WaterCan.countDocuments();
    if (canCount === 0) {
      await WaterCan.insertMany(initialWaterCans);
      console.log("[MongoDB] Seeded initial water cans");
    }

    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.insertMany(initialOrders);
      console.log("[MongoDB] Seeded initial orders");
    }

    const paymentCount = await Payment.countDocuments();
    if (paymentCount === 0) {
      await Payment.insertMany(initialPayments);
      console.log("[MongoDB] Seeded initial payments");
    }

    const notifCount = await Notification.countDocuments();
    if (notifCount === 0) {
      await Notification.insertMany(initialNotifications);
      console.log("[MongoDB] Seeded initial notifications");
    }

    const colCount = await EmptyCanCollection.countDocuments();
    if (colCount === 0) {
      await EmptyCanCollection.insertMany(initialEmptyCanCollections);
      console.log("[MongoDB] Seeded initial empty can collections");
    }

    const reportCount = await DamageReport.countDocuments();
    if (reportCount === 0) {
      await DamageReport.insertMany(initialDamageReports);
      console.log("[MongoDB] Seeded initial damage reports");
    }
  } catch (err) {
    console.error("[MongoDB] Error seeding initial data:", err.message);
  }
}

// ======================================================
// DATA ACCESS METHODS
// ======================================================

module.exports = {
  isDbConnected: isConnected,
  seedInitialData,
  hashPassword,
  verifyPassword,

  // USERS
  getUsers: async () => {
    if (isConnected()) {
      try {
        const docs = await User.find().select("-_id -__v -password").lean();
        return docs;
      } catch (e) {
        console.error("[MongoDB] Error in getUsers, using fallback:", e.message);
      }
    }
    return users.map(cleanDoc);
  },

  getUserById: async (id) => {
    if (isConnected()) {
      try {
        const doc = await User.findOne({ id }).select("-_id -__v -password").lean();
        if (doc) return doc;
      } catch (e) {
        console.error("[MongoDB] Error in getUserById, using fallback:", e.message);
      }
    }
    const memUser = users.find((u) => u.id === id);
    return cleanDoc(memUser);
  },

  getUserByEmail: async (email) => {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    if (isConnected()) {
      try {
        const doc = await User.findOne({
          email: new RegExp("^" + cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i"),
        })
          .select("-_id -__v -password")
          .lean();
        if (doc) return doc;
      } catch (e) {
        console.error("[MongoDB] Error in getUserByEmail, using fallback:", e.message);
      }
    }
    const memUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    return cleanDoc(memUser);
  },

  // Internal method specifically for credential verification (includes password hash)
  getUserByEmailWithPassword: async (email) => {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    if (isConnected()) {
      try {
        const doc = await User.findOne({
          email: new RegExp("^" + cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i"),
        })
          .select("-_id -__v")
          .lean();
        if (doc) return doc;
      } catch (e) {
        console.error("[MongoDB] Error in getUserByEmailWithPassword, using fallback:", e.message);
      }
    }
    const memUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!memUser) return null;
    const obj = { ...memUser };
    delete obj._id;
    delete obj.__v;
    return obj;
  },

  addUser: async (newUser) => {
    users.unshift(newUser);
    if (isConnected()) {
      try {
        const created = await User.create(newUser);
        return cleanDoc(created);
      } catch (e) {
        console.error("[MongoDB] Error in addUser:", e.message);
      }
    }
    return cleanDoc(newUser);
  },

  updateUser: async (id, updates) => {
    // In-memory update
    const memUser = users.find((u) => u.id === id);
    if (memUser) {
      Object.assign(memUser, updates);
    }

    if (isConnected()) {
      try {
        const doc = await User.findOneAndUpdate(
          { id },
          { $set: updates },
          { returnDocument: "after", runValidators: true }
        ).select("-_id -__v -password").lean();
        if (doc) return doc;
      } catch (e) {
        console.error("[MongoDB] Error in updateUser:", e.message);
      }
    }
    return cleanDoc(memUser);
  },

  // WATER CANS
  getCans: async () => {
    if (isConnected()) {
      try {
        const docs = await WaterCan.find().select("-_id -__v").lean();
        return docs;
      } catch (e) {
        console.error("[MongoDB] Error in getCans, using fallback:", e.message);
      }
    }
    return waterCans;
  },

  getCansByCustomer: async (customerId) => {
    if (isConnected()) {
      try {
        const docs = await WaterCan.find({ customerId }).select("-_id -__v").lean();
        return docs;
      } catch (e) {
        console.error("[MongoDB] Error in getCansByCustomer, using fallback:", e.message);
      }
    }
    return waterCans.filter((c) => c.customerId === customerId);
  },

  updateCanStatus: async (canId, updates) => {
    // In-memory update
    const idx = waterCans.findIndex((c) => c.canId === canId);
    if (idx !== -1) {
      waterCans[idx] = { ...waterCans[idx], ...updates };
    }

    if (isConnected()) {
      try {
        const doc = await WaterCan.findOneAndUpdate(
          { canId },
          { $set: updates },
          { returnDocument: "after" }
        ).select("-_id -__v").lean();
        if (doc) return doc;
      } catch (e) {
        console.error("[MongoDB] Error in updateCanStatus:", e.message);
      }
    }
    return idx !== -1 ? waterCans[idx] : null;
  },

  addCan: async (newCan) => {
    waterCans.unshift(newCan);

    if (isConnected()) {
      try {
        const created = await WaterCan.create(newCan);
        return cleanDoc(created);
      } catch (e) {
        console.error("[MongoDB] Error in addCan:", e.message);
      }
    }
    return newCan;
  },

  // ORDERS
  getOrders: async () => {
    if (isConnected()) {
      try {
        const docs = await Order.find().sort({ _id: -1 }).select("-_id -__v").lean();
        return docs;
      } catch (e) {
        console.error("[MongoDB] Error in getOrders, using fallback:", e.message);
      }
    }
    return orders;
  },

  getOrdersByCustomer: async (customerId) => {
    if (isConnected()) {
      try {
        const docs = await Order.find({ customerId }).sort({ _id: -1 }).select("-_id -__v").lean();
        return docs;
      } catch (e) {
        console.error("[MongoDB] Error in getOrdersByCustomer, using fallback:", e.message);
      }
    }
    return orders.filter((o) => o.customerId === customerId);
  },

  getOrdersByPartner: async (partnerId) => {
    if (isConnected()) {
      try {
        const docs = await Order.find({ deliveryPartnerId: partnerId }).sort({ _id: -1 }).select("-_id -__v").lean();
        return docs;
      } catch (e) {
        console.error("[MongoDB] Error in getOrdersByPartner, using fallback:", e.message);
      }
    }
    return orders.filter((o) => o.deliveryPartnerId === partnerId);
  },

  getOrderById: async (orderId) => {
    if (isConnected()) {
      try {
        const doc = await Order.findOne({ orderId }).select("-_id -__v").lean();
        if (doc) return doc;
      } catch (e) {
        console.error("[MongoDB] Error in getOrderById, using fallback:", e.message);
      }
    }
    return orders.find((o) => o.orderId === orderId) || null;
  },

  createOrder: async (orderData) => {
    const newOrder = {
      orderId: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      orderDate: new Date().toISOString().split("T")[0],
      status: "Pending",
      paymentStatus: "Pending",
      emptyCansReturned: 0,
      ...orderData,
    };
    orders.unshift(newOrder);

    if (isConnected()) {
      try {
        const created = await Order.create(newOrder);
        return cleanDoc(created);
      } catch (e) {
        console.error("[MongoDB] Error in createOrder:", e.message);
      }
    }
    return newOrder;
  },

  updateOrderStatus: async (orderId, status, extra = {}) => {
    // In-memory update
    const order = orders.find((o) => o.orderId === orderId);
    if (order) {
      order.status = status;
      Object.assign(order, extra);
    }

    if (isConnected()) {
      try {
        const doc = await Order.findOneAndUpdate(
          { orderId },
          { $set: { status, ...extra } },
          { returnDocument: "after" }
        ).select("-_id -__v").lean();
        if (doc) return doc;
      } catch (e) {
        console.error("[MongoDB] Error in updateOrderStatus:", e.message);
      }
    }
    return order || null;
  },

  // PAYMENTS
  getPayments: async () => {
    if (isConnected()) {
      try {
        const docs = await Payment.find().sort({ _id: -1 }).select("-_id -__v").lean();
        return docs;
      } catch (e) {
        console.error("[MongoDB] Error in getPayments, using fallback:", e.message);
      }
    }
    return payments;
  },

  getPaymentsByCustomer: async (customerId) => {
    if (isConnected()) {
      try {
        const docs = await Payment.find({ customerId }).sort({ _id: -1 }).select("-_id -__v").lean();
        return docs;
      } catch (e) {
        console.error("[MongoDB] Error in getPaymentsByCustomer, using fallback:", e.message);
      }
    }
    return payments.filter((p) => p.customerId === customerId);
  },

  createPayment: async (paymentData) => {
    const newPayment = {
      paymentId: "PAY-" + Math.floor(100 + Math.random() * 900),
      date: new Date().toISOString().split("T")[0],
      status: "Completed",
      ...paymentData,
    };
    payments.unshift(newPayment);

    if (isConnected()) {
      try {
        const created = await Payment.create(newPayment);
        return cleanDoc(created);
      } catch (e) {
        console.error("[MongoDB] Error in createPayment:", e.message);
      }
    }
    return newPayment;
  },

  // NOTIFICATIONS
  getNotifications: async (userId) => {
    if (isConnected()) {
      try {
        const query = userId
          ? { $or: [{ userId }, { userId: "all" }] }
          : {};
        const docs = await Notification.find(query).sort({ _id: -1 }).select("-_id -__v").lean();
        return docs;
      } catch (e) {
        console.error("[MongoDB] Error in getNotifications, using fallback:", e.message);
      }
    }
    if (!userId) return notifications;
    return notifications.filter((n) => n.userId === userId || n.userId === "all");
  },

  addNotification: async (notif) => {
    const newNotif = {
      id: "NOTIF-" + Date.now(),
      date: "Just now",
      read: false,
      ...notif,
    };
    notifications.unshift(newNotif);

    if (isConnected()) {
      try {
        const created = await Notification.create(newNotif);
        return cleanDoc(created);
      } catch (e) {
        console.error("[MongoDB] Error in addNotification:", e.message);
      }
    }
    return newNotif;
  },

  markNotificationRead: async (id) => {
    // In-memory update
    const notif = notifications.find((n) => n.id === id);
    if (notif) notif.read = true;

    if (isConnected()) {
      try {
        const doc = await Notification.findOneAndUpdate(
          { id },
          { $set: { read: true } },
          { returnDocument: "after" }
        ).select("-_id -__v").lean();
        if (doc) return doc;
      } catch (e) {
        console.error("[MongoDB] Error in markNotificationRead:", e.message);
      }
    }
    return notif || null;
  },

  // EMPTY CAN COLLECTIONS
  getEmptyCanCollections: async () => {
    if (isConnected()) {
      try {
        const docs = await EmptyCanCollection.find().sort({ _id: -1 }).select("-_id -__v").lean();
        return docs;
      } catch (e) {
        console.error("[MongoDB] Error in getEmptyCanCollections, using fallback:", e.message);
      }
    }
    return emptyCanCollections;
  },

  addEmptyCanCollection: async (collection) => {
    const newCol = {
      collectionId: "COL-" + Math.floor(100 + Math.random() * 900),
      date: new Date().toISOString().split("T")[0],
      status: "Collected by Partner",
      ...collection,
    };
    emptyCanCollections.unshift(newCol);

    if (isConnected()) {
      try {
        const created = await EmptyCanCollection.create(newCol);
        return cleanDoc(created);
      } catch (e) {
        console.error("[MongoDB] Error in addEmptyCanCollection:", e.message);
      }
    }
    return newCol;
  },

  // DAMAGE REPORTS
  getDamageReports: async (customerId) => {
    if (isConnected()) {
      try {
        const query = customerId ? { customerId } : {};
        const docs = await DamageReport.find(query).sort({ _id: -1 }).select("-_id -__v").lean();
        return docs;
      } catch (e) {
        console.error("[MongoDB] Error in getDamageReports, using fallback:", e.message);
      }
    }
    if (customerId) {
      return damageReports.filter((r) => r.customerId === customerId);
    }
    return damageReports;
  },

  getDamageReportById: async (id) => {
    if (isConnected()) {
      try {
        const doc = await DamageReport.findOne({ reportId: id }).select("-_id -__v").lean();
        if (doc) return doc;
      } catch (e) {
        console.error("[MongoDB] Error in getDamageReportById, using fallback:", e.message);
      }
    }
    return damageReports.find((r) => r.reportId === id) || null;
  },

  updateDamageReportStatus: async (id, status, extra = {}) => {
    // In-memory update
    const report = damageReports.find((r) => r.reportId === id);
    if (report) {
      report.status = status;
      Object.assign(report, extra);
    }

    if (isConnected()) {
      try {
        const doc = await DamageReport.findOneAndUpdate(
          { reportId: id },
          { $set: { status, ...extra } },
          { returnDocument: "after" }
        ).select("-_id -__v").lean();
        if (doc) return doc;
      } catch (e) {
        console.error("[MongoDB] Error in updateDamageReportStatus:", e.message);
      }
    }
    return report || null;
  },

  createDamageReport: async (reportData) => {
    damageReports.unshift(reportData);

    if (isConnected()) {
      try {
        const created = await DamageReport.create(reportData);
        return cleanDoc(created);
      } catch (e) {
        console.error("[MongoDB] Error in createDamageReport:", e.message);
      }
    }
    return reportData;
  },

  // SYSTEM RESET (FOR PRESENTATIONS / DEMOS)
  resetDemoData: async () => {
    // Reset in-memory holders
    users = [...initialUsers];
    waterCans = [...initialWaterCans];
    orders = [...initialOrders];
    payments = [...initialPayments];
    notifications = [...initialNotifications];
    emptyCanCollections = [...initialEmptyCanCollections];
    damageReports = [...initialDamageReports];

    if (isConnected()) {
      try {
        await Promise.all([
          User.deleteMany({}),
          WaterCan.deleteMany({}),
          Order.deleteMany({}),
          Payment.deleteMany({}),
          Notification.deleteMany({}),
          EmptyCanCollection.deleteMany({}),
          DamageReport.deleteMany({}),
        ]);

        await Promise.all([
          User.insertMany(initialUsers),
          WaterCan.insertMany(initialWaterCans),
          Order.insertMany(initialOrders),
          Payment.insertMany(initialPayments),
          Notification.insertMany(initialNotifications),
          EmptyCanCollection.insertMany(initialEmptyCanCollections),
          DamageReport.insertMany(initialDamageReports),
        ]);
        console.log("[MongoDB] Reset demo data to pristine initial collections.");
      } catch (e) {
        console.error("[MongoDB] Error resetting collections:", e.message);
      }
    }
    return true;
  },
};
