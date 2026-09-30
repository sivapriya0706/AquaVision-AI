const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const store = require("./data/store");

const app = express();

app.use(cors());
app.use(express.json());

// ======================================================
// UPLOAD FOLDER
// ======================================================

const uploadFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// ======================================================
// MULTER CONFIGURATION
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Serve uploaded photos
app.use("/uploads", express.static(uploadFolder));

// ======================================================
// DAMAGE REPORT STORAGE (Pre-seeded with demo records)
// ======================================================

const damageReports = [
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

// Helper to find Python executable
function getPythonExecutable() {
  const venvPython = "C:\\Users\\WELCOME\\Documents\\AquaVision-AI\\ai\\.venv\\Scripts\\python.exe";
  if (fs.existsSync(venvPython)) {
    return venvPython;
  }
  return "python";
}

function runPython(scriptPath, cwd, onComplete) {
  const pyExe = getPythonExecutable();
  const fullScript = path.resolve(__dirname, "..", scriptPath);

  const python = spawn(pyExe, ["-u", fullScript], {
    cwd: cwd || path.resolve(__dirname, ".."),
  });

  let output = "";
  let errorOutput = "";

  python.stdout.on("data", (data) => {
    output += data.toString();
  });

  python.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  python.on("close", (code) => {
    if (code !== 0) {
      console.error(`Python execution error for ${scriptPath}:`, errorOutput);
      return onComplete(new Error(errorOutput || `Exited with code ${code}`), null);
    }
    return onComplete(null, output.trim());
  });

  python.on("error", (err) => {
    console.error(`Failed to spawn Python for ${scriptPath}:`, err);
    return onComplete(err, null);
  });
}

// ======================================================
// HOME ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.json({
    message: "AquaVision AI Backend is running",
    version: "2.0.0",
    roles: ["customer", "partner", "admin"],
    status: "healthy",
  });
});

// ======================================================
// AI PREDICTIONS (PRESERVED & ENHANCED)
// ======================================================

app.get("/api/refill-status", (req, res) => {
  runPython("ai/predict_refill.py", path.resolve(__dirname, ".."), (err, result) => {
    if (err) {
      return res.status(500).json({
        prediction: "AI prediction failed",
        error: err.message,
      });
    }
    res.json({
      prediction: result,
      status: "AI prediction ready",
      model: "RandomForest (ai/models/refill_model.pkl)",
      onnxAvailable: true,
      onnxPath: "ai/models/refill_model.onnx",
    });
  });
});

app.get("/api/demand-forecast", (req, res) => {
  runPython("ai/predict_demand.py", path.resolve(__dirname, ".."), (err, result) => {
    if (err) {
      return res.status(500).json({
        prediction: "Demand prediction failed",
        error: err.message,
      });
    }
    res.json({
      prediction: result,
      status: "Demand forecast ready",
      model: "RandomForestRegressor (ai/models/demand_model.pkl)",
    });
  });
});

app.get("/api/payment-insight", (req, res) => {
  runPython("ai/predict_payment.py", path.resolve(__dirname, ".."), (err, result) => {
    if (err) {
      return res.status(500).json({
        prediction: "Payment prediction failed",
        error: err.message,
      });
    }
    res.json({
      prediction: result,
      status: "Payment insight ready",
      model: "RandomForest (ai/models/payment_model.pkl)",
    });
  });
});

// ONNX & Edge Architecture Metadata
app.get("/api/ai/onnx-info", (req, res) => {
  res.json({
    modelName: "AquaVision Refill Prediction Model",
    format: "ONNX (Open Neural Network Exchange)",
    opset: 17,
    inputShape: "[BatchSize, 3]",
    features: [
      "avg_days_between_refills",
      "total_refills",
      "days_since_last_refill",
    ],
    activeExecutionProvider: "CPUExecutionProvider",
    hostHardware: "Intel Core Processor (x86_64 Development Host)",
    targetHardware: "Qualcomm Snapdragon NPU (via Qualcomm AI Hub / QNN Execution Provider)",
    deploymentStatus: "Portable ONNX exported & verified on host; target deployment path: Snapdragon Edge NPU",
  });
});

// ======================================================
// DAMAGE REPORTS (PRESERVED & ENHANCED)
// ======================================================

app.get("/api/damage-reports", (req, res) => {
  const { customerId } = req.query;
  if (customerId) {
    return res.json(damageReports.filter((r) => r.customerId === customerId));
  }
  res.json(damageReports);
});

app.patch("/api/damage-reports/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const report = damageReports.find((item) => item.reportId === id);

  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  report.status = status;
  if (adminNotes) {
    report.adminNotes = adminNotes;
  }
  report.reviewedAt = new Date().toISOString();

  // If approved, notify customer
  if (status === "Approved") {
    store.addNotification({
      userId: report.customerId,
      title: "Damage Report Approved",
      message: `Your damage report #${id} (${report.damageType}) has been approved. Free replacement can scheduled.`,
      type: "damage",
    });
  } else if (status === "Rejected") {
    store.addNotification({
      userId: report.customerId,
      title: "Damage Report Reviewed",
      message: `Your damage report #${id} was reviewed: ${adminNotes || "Evidence does not warrant replacement"}.`,
      type: "damage",
    });
  }

  res.json({
    success: true,
    report: report,
  });
});

app.post("/api/damage-report", upload.single("damagePhoto"), (req, res) => {
  try {
    const damageType = req.body.damageType;
    const customerId = req.body.customerId || "USR-001";
    const customerName = req.body.customerName || "Aravind Kumar";
    const description = req.body.description || "User-reported water can damage";

    if (!damageType) {
      return res.status(400).json({ message: "Damage type is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Damage photo is required" });
    }

    const report = {
      reportId: "DR-" + Date.now(),
      customerId: customerId,
      customerName: customerName,
      damageType: damageType,
      description: description,
      photo: `/uploads/${req.file.filename}`,
      status: "Pending Review",
      createdAt: new Date().toISOString(),
    };

    damageReports.unshift(report);

    // Notify admin
    store.addNotification({
      userId: "USR-005",
      title: "New Damage Report Submitted",
      message: `${customerName} submitted report #${report.reportId} for ${damageType}.`,
      type: "admin",
    });

    console.log("New Damage Report:", report);

    res.json({
      success: true,
      message: "Damage report submitted successfully",
      report: report,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to submit damage report",
    });
  }
});

// ======================================================
// AUTHENTICATION & USERS
// ======================================================

app.post("/api/auth/login", (req, res) => {
  const { role, email } = req.body;

  let user = null;
  if (email) {
    user = store.getUserByEmail(email);
  }

  if (!user && role) {
    user = store.getUsers().find((u) => u.role === role);
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials or demo role not found.",
    });
  }

  res.json({
    success: true,
    user: user,
    token: "demo-jwt-token-" + user.id,
  });
});

app.get("/api/users", (req, res) => {
  const { role } = req.query;
  const users = store.getUsers();
  if (role) {
    return res.json(users.filter((u) => u.role === role));
  }
  res.json(users);
});

app.get("/api/users/:id", (req, res) => {
  const user = store.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
});

app.put("/api/users/:id", (req, res) => {
  const user = store.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  Object.assign(user, req.body);
  res.json({ success: true, user });
});

// ======================================================
// WATER CAN INVENTORY
// ======================================================

app.get("/api/cans", (req, res) => {
  const { customerId, status } = req.query;
  let cans = store.getCans();

  if (customerId) {
    cans = cans.filter((c) => c.customerId === customerId);
  }
  if (status) {
    cans = cans.filter((c) => c.status.toLowerCase() === status.toLowerCase());
  }

  res.json(cans);
});

app.post("/api/cans", (req, res) => {
  const { customerId, customerName, capacity, status, condition, batch } = req.body;
  const newCan = {
    canId: "CAN-" + Math.floor(1000 + Math.random() * 9000),
    customerId: customerId || null,
    customerName: customerName || "Central Inventory",
    capacity: capacity || "20 Liters",
    status: status || "Full",
    condition: condition || "Good",
    lastRefill: new Date().toISOString().split("T")[0],
    nextExpectedRefill: "In Stock",
    batch: batch || "B-" + new Date().toISOString().slice(0, 7),
  };
  store.addCan(newCan);
  res.status(201).json({ success: true, can: newCan });
});

app.patch("/api/cans/:id", (req, res) => {
  const updated = store.updateCanStatus(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ message: "Can not found" });
  }
  res.json({ success: true, can: updated });
});

// ======================================================
// ORDERS MANAGEMENT
// ======================================================

app.get("/api/orders", (req, res) => {
  const { customerId, partnerId, status } = req.query;
  let orders = store.getOrders();

  if (customerId) {
    orders = orders.filter((o) => o.customerId === customerId);
  }
  if (partnerId) {
    orders = orders.filter((o) => o.deliveryPartnerId === partnerId);
  }
  if (status) {
    orders = orders.filter((o) => o.status.toLowerCase() === status.toLowerCase());
  }

  res.json(orders);
});

app.post("/api/orders", (req, res) => {
  const {
    customerId,
    customerName,
    customerAddress,
    customerPhone,
    numberOfCans,
    deliveryDate,
    specialInstructions,
  } = req.body;

  if (!numberOfCans || numberOfCans < 1) {
    return res.status(400).json({ message: "Invalid number of cans" });
  }

  const amount = Number(numberOfCans) * 80; // Rs 80 per 20L can

  const order = store.createOrder({
    customerId: customerId || "USR-001",
    customerName: customerName || "Aravind Kumar",
    customerAddress: customerAddress || "Flat 402, Green Glen Layout, Bellandur",
    customerPhone: customerPhone || "+91 98765 43210",
    numberOfCans: Number(numberOfCans),
    deliveryDate: deliveryDate || new Date(Date.now() + 86400000).toISOString().split("T")[0],
    deliveryPartnerId: null,
    deliveryPartnerName: "Unassigned",
    status: "Pending",
    paymentStatus: "Pending",
    amount: amount,
    specialInstructions: specialInstructions || "Standard refill request",
  });

  // Notify customer
  store.addNotification({
    userId: order.customerId,
    title: "Order Placed Successfully",
    message: `Refill order #${order.orderId} for ${numberOfCans} cans (₹${amount}) placed for ${order.deliveryDate}.`,
    type: "order",
  });

  // Notify admin
  store.addNotification({
    userId: "USR-005",
    title: "New Refill Order",
    message: `New order #${order.orderId} from ${order.customerName} requires dispatch assignment.`,
    type: "admin",
  });

  res.status(201).json({ success: true, order });
});

app.patch("/api/orders/:id/status", (req, res) => {
  const { status, emptyCansReturned } = req.body;
  const extra = {};
  if (emptyCansReturned !== undefined) {
    extra.emptyCansReturned = Number(emptyCansReturned);
  }
  if (status === "Delivered") {
    extra.deliveredAt = new Date().toISOString();
  }

  const order = store.updateOrderStatus(req.params.id, status, extra);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // If delivered, notify customer
  if (status === "Delivered") {
    store.addNotification({
      userId: order.customerId,
      title: "Water Cans Delivered",
      message: `Order #${order.orderId} (${order.numberOfCans} cans) has been successfully delivered.`,
      type: "order",
    });
  }

  res.json({ success: true, order });
});

app.patch("/api/orders/:id/assign", (req, res) => {
  const { partnerId, partnerName } = req.body;
  const partner = store.getUserById(partnerId);

  const order = store.updateOrderStatus(req.params.id, "Assigned", {
    deliveryPartnerId: partnerId,
    deliveryPartnerName: partnerName || (partner ? partner.name : "Assigned Partner"),
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // Notify partner
  store.addNotification({
    userId: partnerId,
    title: "New Delivery Assigned",
    message: `Order #${order.orderId} to ${order.customerAddress} assigned to you.`,
    type: "delivery",
  });

  res.json({ success: true, order });
});

// ======================================================
// DELIVERIES & EMPTY CAN COLLECTION
// ======================================================

app.post("/api/deliveries/collect-empty", (req, res) => {
  const { partnerId, partnerName, customerId, customerName, orderId, quantity, condition } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "Please specify number of empty cans collected" });
  }

  const collection = store.addEmptyCanCollection({
    partnerId: partnerId || "USR-003",
    partnerName: partnerName || "Ramesh Babu",
    customerId: customerId || "USR-001",
    customerName: customerName || "Aravind Kumar",
    orderId: orderId || null,
    quantity: Number(quantity),
    condition: condition || "Good",
  });

  // If orderId provided, record on order
  if (orderId) {
    store.updateOrderStatus(orderId, "Delivered", { emptyCansReturned: Number(quantity) });
  }

  res.status(201).json({ success: true, collection });
});

app.get("/api/deliveries/empty-cans", (req, res) => {
  res.json(store.getEmptyCanCollections());
});

// ======================================================
// PAYMENTS
// ======================================================

app.get("/api/payments", (req, res) => {
  const { customerId } = req.query;
  const payments = customerId
    ? store.getPaymentsByCustomer(customerId)
    : store.getPayments();
  res.json(payments);
});

app.post("/api/payments", (req, res) => {
  const { customerId, customerName, orderId, amount, method } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid payment amount" });
  }

  const payment = store.createPayment({
    customerId: customerId || "USR-001",
    customerName: customerName || "Aravind Kumar",
    orderId: orderId || "ORD-" + Math.floor(1000 + Math.random() * 9000),
    amount: Number(amount),
    method: method || "UPI (Sandbox Demo)",
    status: "Completed",
    notes: "Demo digital payment verified",
  });

  // If orderId exists, update paymentStatus
  if (orderId) {
    store.updateOrderStatus(orderId, "Delivered", { paymentStatus: "Paid" });
  }

  // Notify customer
  store.addNotification({
    userId: payment.customerId,
    title: "Payment Received",
    message: `Payment of ₹${amount} received successfully via ${payment.method}.`,
    type: "payment",
  });

  res.status(201).json({ success: true, payment });
});

app.get("/api/payments/summary", (req, res) => {
  const payments = store.getPayments();
  const orders = store.getOrders();

  const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const pendingOrders = orders.filter((o) => o.paymentStatus === "Pending");
  const totalPending = pendingOrders.reduce((acc, o) => acc + (o.amount || 0), 0);

  res.json({
    totalCollected,
    totalPending,
    totalTransactions: payments.length,
    pendingTransactions: pendingOrders.length,
  });
});

// ======================================================
// NOTIFICATIONS
// ======================================================

app.get("/api/notifications", (req, res) => {
  const { userId } = req.query;
  res.json(store.getNotifications(userId));
});

app.patch("/api/notifications/:id/read", (req, res) => {
  const notif = store.markNotificationRead(req.params.id);
  res.json({ success: true, notification: notif });
});

// ======================================================
// SYSTEM RESET (FOR PRESENTATIONS / DEMOS)
// ======================================================

app.post("/api/system/reset-demo", (req, res) => {
  store.resetDemoData();
  res.json({ success: true, message: "Demo data has been reset to defaults." });
});

// ======================================================
// START SERVER
// ======================================================

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`AquaVision server running on http://localhost:${PORT}`);
});