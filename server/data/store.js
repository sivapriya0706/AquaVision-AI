// ======================================================
// AquaVision AI - Demo Data Store
// Self-contained in-memory store for prototype/demo
// Can be backed by MongoDB in production
// ======================================================

const initialUsers = [
  {
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
  {
    id: "USR-002",
    name: "Sunita Sharma",
    email: "sunita@aquavision.ai",
    role: "customer",
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

// In-memory data holders
let users = [...initialUsers];
let waterCans = [...initialWaterCans];
let orders = [...initialOrders];
let payments = [...initialPayments];
let notifications = [...initialNotifications];
let emptyCanCollections = [...initialEmptyCanCollections];

module.exports = {
  getUsers: () => users,
  getUserById: (id) => users.find((u) => u.id === id),
  getUserByEmail: (email) => users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  
  getCans: () => waterCans,
  getCansByCustomer: (customerId) => waterCans.filter((c) => c.customerId === customerId),
  updateCanStatus: (canId, updates) => {
    const idx = waterCans.findIndex((c) => c.canId === canId);
    if (idx !== -1) {
      waterCans[idx] = { ...waterCans[idx], ...updates };
      return waterCans[idx];
    }
    return null;
  },
  addCan: (newCan) => {
    waterCans.unshift(newCan);
    return newCan;
  },

  getOrders: () => orders,
  getOrdersByCustomer: (customerId) => orders.filter((o) => o.customerId === customerId),
  getOrdersByPartner: (partnerId) => orders.filter((o) => o.deliveryPartnerId === partnerId),
  getOrderById: (orderId) => orders.find((o) => o.orderId === orderId),
  createOrder: (orderData) => {
    const newOrder = {
      orderId: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      orderDate: new Date().toISOString().split("T")[0],
      status: "Pending",
      paymentStatus: "Pending",
      emptyCansReturned: 0,
      ...orderData,
    };
    orders.unshift(newOrder);
    return newOrder;
  },
  updateOrderStatus: (orderId, status, extra = {}) => {
    const order = orders.find((o) => o.orderId === orderId);
    if (order) {
      order.status = status;
      Object.assign(order, extra);
      return order;
    }
    return null;
  },

  getPayments: () => payments,
  getPaymentsByCustomer: (customerId) => payments.filter((p) => p.customerId === customerId),
  createPayment: (paymentData) => {
    const newPayment = {
      paymentId: "PAY-" + Math.floor(100 + Math.random() * 900),
      date: new Date().toISOString().split("T")[0],
      status: "Completed",
      ...paymentData,
    };
    payments.unshift(newPayment);
    return newPayment;
  },

  getNotifications: (userId) => {
    if (!userId) return notifications;
    return notifications.filter((n) => n.userId === userId || n.userId === "all");
  },
  addNotification: (notif) => {
    const newNotif = {
      id: "NOTIF-" + Date.now(),
      date: "Just now",
      read: false,
      ...notif,
    };
    notifications.unshift(newNotif);
    return newNotif;
  },
  markNotificationRead: (id) => {
    const notif = notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
    return notif;
  },

  getEmptyCanCollections: () => emptyCanCollections,
  addEmptyCanCollection: (collection) => {
    const newCol = {
      collectionId: "COL-" + Math.floor(100 + Math.random() * 900),
      date: new Date().toISOString().split("T")[0],
      status: "Collected by Partner",
      ...collection,
    };
    emptyCanCollections.unshift(newCol);
    return newCol;
  },

  resetDemoData: () => {
    users = [...initialUsers];
    waterCans = [...initialWaterCans];
    orders = [...initialOrders];
    payments = [...initialPayments];
    notifications = [...initialNotifications];
    emptyCanCollections = [...initialEmptyCanCollections];
    return true;
  },
};
