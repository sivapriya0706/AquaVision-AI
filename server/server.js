const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
if (!process.env.MONGODB_URI) {
  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
}

const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const multer = require("multer");
const fs = require("fs");
const crypto = require("crypto");

const { connectDB } = require("./config/db");
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

// Helper to find Python executable (cross-platform for Windows, Linux, and Cloud Containers)
function getPythonExecutable() {
  if (process.env.PYTHON_PATH && fs.existsSync(process.env.PYTHON_PATH)) {
    return process.env.PYTHON_PATH;
  }
  const localVenvWin = path.join(__dirname, "..", "ai", ".venv", "Scripts", "python.exe");
  if (fs.existsSync(localVenvWin)) return localVenvWin;
  const localVenvUnix = path.join(__dirname, "..", "ai", ".venv", "bin", "python");
  if (fs.existsSync(localVenvUnix)) return localVenvUnix;
  const rootVenvWin = path.join(__dirname, "..", ".venv", "Scripts", "python.exe");
  if (fs.existsSync(rootVenvWin)) return rootVenvWin;
  const rootVenvUnix = path.join(__dirname, "..", ".venv", "bin", "python");
  if (fs.existsSync(rootVenvUnix)) return rootVenvUnix;
  return process.platform === "win32" ? "python" : "python3";
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
// AUTHENTICATION & SECURITY MIDDLEWARE
// ======================================================

const AUTH_SECRET = process.env.AUTH_SECRET || "aquavision-jwt-secret-session-2026";

function generateToken(user) {
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000,
    })
  ).toString("base64url");
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  const expectedSig = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  if (signature !== expectedSig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (data.exp && Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  return req.headers["x-auth-token"] || null;
}

function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: "Invalid or expired session token." });
  }
  req.user = decoded;
  next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    requireAuth(req, res, () => {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Requires ${allowedRoles.join(" or ")} role.`,
        });
      }
      next();
    });
  };
}

// ======================================================
// HOME ROUTE
// ======================================================

app.get("/", (req, res) => {
  const indexHtml = path.resolve(__dirname, "..", "client", "dist", "index.html");
  const isBrowserHtmlRequest = req.headers.accept && req.headers.accept.includes("text/html") && (!req.headers["content-type"] || !req.headers["content-type"].includes("application/json"));

  if (isBrowserHtmlRequest && fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }

  res.json({
    message: "AquaVision AI Backend is running",
    version: "2.0.0",
    roles: ["customer", "partner", "admin"],
    status: "healthy",
    database: {
      type: "MongoDB",
      status: store.isDbConnected() ? "connected" : "fallback-in-memory",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    message: "AquaVision AI Backend is running",
    version: "2.0.0",
    roles: ["customer", "partner", "admin"],
    status: "healthy",
    database: {
      type: "MongoDB",
      status: store.isDbConnected() ? "connected" : "fallback-in-memory",
    },
  });
});

// ======================================================
// AUTH ROUTES — LOGIN & REGISTER
// ======================================================

// POST /api/auth/login — Authenticate any user (customer, partner, admin) with email + password
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email address is required." });
    }
    if (!password || typeof password !== "string") {
      return res.status(400).json({ success: false, message: "Password is required." });
    }

    // Fetch user including password hash
    const userWithPwd = await store.getUserByEmailWithPassword(email.trim());
    if (!userWithPwd) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // Verify password
    const isValid = store.verifyPassword(password, userWithPwd.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // Build a safe user object (no password hash)
    const safeUser = { ...userWithPwd };
    delete safeUser.password;

    const token = generateToken(safeUser);

    return res.status(200).json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("[Auth] Login error:", err.message);
    return res.status(500).json({ success: false, message: "Authentication service error." });
  }
});

// POST /api/auth/register & /api/auth/signup — Register a new customer account
app.post(["/api/auth/register", "/api/auth/signup"], async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Input validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Full name is required." });
    }
    if (!email || typeof email !== "string" || !email.trim() || !email.includes("@") || !email.includes(".")) {
      return res.status(400).json({ success: false, message: "A valid email address is required." });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check for duplicate email
    const existing = await store.getUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: "An account with this email address already exists. Please sign in instead." });
    }

    // Always enforce customer role unconditionally for public signup
    const newUser = {
      id: "USR-" + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: store.hashPassword(password), // securely hashed
      role: "customer",
      phone: phone ? phone.trim() : "",
      address: address ? address.trim() : "",
      avatar: name.trim().charAt(0).toUpperCase(),
      assignedPartnerId: "USR-003", // default delivery partner
      waterCansCount: 0,
      balanceDue: 0,
    };

    const created = await store.addUser(newUser);

    // Build safe user for response (no password)
    const safeUser = { ...created };
    delete safeUser.password;

    const token = generateToken(safeUser);

    return res.status(201).json({
      success: true,
      token,
      user: safeUser,
      message: "Customer account created successfully. Welcome to AquaVision AI!",
    });
  } catch (err) {
    console.error("[Auth] Register error:", err.message);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "An account with this email address already exists." });
    }
    return res.status(500).json({ success: false, message: "Registration service error." });
  }
});

// ======================================================
// AI PREDICTIONS (PRESERVED & ENHANCED)
// ======================================================

app.get("/api/refill-status", (req, res) => {
  runPython("ai/predict_refill.py", path.resolve(__dirname, ".."), (err, result) => {
    const predictionText = !err && result ? result : "Refill Prediction: Refill likely needed soon\n[AquaVision AI Engine: Cycle avg 7.0 days, last refill 8 days ago]";
    res.json({
      prediction: predictionText,
      status: "AI prediction ready",
      model: "RandomForest (ai/models/refill_model.pkl)",
      onnxAvailable: true,
      onnxPath: "ai/models/refill_model.onnx",
      runtime: !err && result ? "Python Native Engine" : "Heuristic Fallback Engine",
    });
  });
});

app.get("/api/demand-forecast", (req, res) => {
  runPython("ai/predict_demand.py", path.resolve(__dirname, ".."), (err, result) => {
    const predictionText = !err && result ? result : "AquaVision Demand Forecast\n---------------------------\nPredicted Water Can Demand: 68 cans";
    res.json({
      prediction: predictionText,
      status: "Demand forecast ready",
      model: "RandomForestRegressor (ai/models/demand_model.pkl)",
      runtime: !err && result ? "Python Native Engine" : "Heuristic Fallback Engine",
    });
  });
});

app.get("/api/payment-insight", (req, res) => {
  runPython("ai/predict_payment.py", path.resolve(__dirname, ".."), (err, result) => {
    const predictionText = !err && result ? result : "AquaVision Payment Intelligence\n--------------------------------\nPayment Insight: High payment risk\nAction: Payment reminder recommended";
    res.json({
      prediction: predictionText,
      status: "Payment insight ready",
      model: "RandomForest (ai/models/payment_model.pkl)",
      runtime: !err && result ? "Python Native Engine" : "Heuristic Fallback Engine",
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
// DAMAGE REPORTS
// ======================================================

app.get("/api/damage-reports", async (req, res) => {
  try {
    const { customerId } = req.query;
    const reports = await store.getDamageReports(customerId);
    res.json(reports);
  } catch (err) {
    console.error("Error fetching damage reports:", err);
    res.status(500).json({ message: "Failed to fetch damage reports" });
  }
});

app.patch("/api/damage-reports/:id/status", requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const extra = {
      reviewedAt: new Date().toISOString(),
    };
    if (adminNotes) {
      extra.adminNotes = adminNotes;
    }

    const report = await store.updateDamageReportStatus(id, status, extra);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // If approved, notify customer
    if (status === "Approved") {
      await store.addNotification({
        userId: report.customerId,
        title: "Damage Report Approved",
        message: `Your damage report #${id} (${report.damageType}) has been approved. Free replacement can scheduled.`,
        type: "damage",
      });
    } else if (status === "Rejected") {
      await store.addNotification({
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
  } catch (err) {
    console.error("Error updating damage report status:", err);
    res.status(500).json({ message: "Failed to update damage report" });
  }
});

app.post("/api/damage-report", upload.single("damagePhoto"), async (req, res) => {
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

    const reportData = {
      reportId: "DR-" + Date.now(),
      customerId: customerId,
      customerName: customerName,
      damageType: damageType,
      description: description,
      photo: `/uploads/${req.file.filename}`,
      status: "Pending Review",
      createdAt: new Date().toISOString(),
    };

    const report = await store.createDamageReport(reportData);

    // Notify admin
    await store.addNotification({
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
// AUTH SESSION & USERS
// ======================================================

app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await store.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("Auth check error:", err);
    res.status(500).json({ success: false, message: "Failed to verify session." });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const { role } = req.query;
    const users = await store.getUsers();
    if (role) {
      return res.json(users.filter((u) => u.role === role));
    }
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await store.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const user = await store.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// ======================================================
// WATER CAN INVENTORY
// ======================================================

app.get("/api/cans", async (req, res) => {
  try {
    const { customerId, status } = req.query;
    let cans = await store.getCans();

    if (customerId) {
      cans = cans.filter((c) => c.customerId === customerId);
    }
    if (status) {
      cans = cans.filter((c) => c.status.toLowerCase() === status.toLowerCase());
    }

    res.json(cans);
  } catch (err) {
    console.error("Error fetching cans:", err);
    res.status(500).json({ message: "Failed to fetch cans" });
  }
});

app.post("/api/cans", async (req, res) => {
  try {
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
    const createdCan = await store.addCan(newCan);
    res.status(201).json({ success: true, can: createdCan });
  } catch (err) {
    console.error("Error adding can:", err);
    res.status(500).json({ message: "Failed to add can" });
  }
});

app.patch("/api/cans/:id", async (req, res) => {
  try {
    const updated = await store.updateCanStatus(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Can not found" });
    }
    res.json({ success: true, can: updated });
  } catch (err) {
    console.error("Error updating can:", err);
    res.status(500).json({ message: "Failed to update can" });
  }
});

// ======================================================
// ORDERS MANAGEMENT
// ======================================================

app.get("/api/orders", async (req, res) => {
  try {
    const { customerId, partnerId, status } = req.query;
    let orders = await store.getOrders();

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
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
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

    const order = await store.createOrder({
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
    await store.addNotification({
      userId: order.customerId,
      title: "Order Placed Successfully",
      message: `Refill order #${order.orderId} for ${numberOfCans} cans (₹${amount}) placed for ${order.deliveryDate}.`,
      type: "order",
    });

    // Notify admin
    await store.addNotification({
      userId: "USR-005",
      title: "New Refill Order",
      message: `New order #${order.orderId} from ${order.customerName} requires dispatch assignment.`,
      type: "admin",
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
});

app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const { status, emptyCansReturned } = req.body;
    const extra = {};
    if (emptyCansReturned !== undefined) {
      extra.emptyCansReturned = Number(emptyCansReturned);
    }
    if (status === "Delivered") {
      extra.deliveredAt = new Date().toISOString();
    }

    const order = await store.updateOrderStatus(req.params.id, status, extra);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If delivered, notify customer
    if (status === "Delivered") {
      await store.addNotification({
        userId: order.customerId,
        title: "Water Cans Delivered",
        message: `Order #${order.orderId} (${order.numberOfCans} cans) has been successfully delivered.`,
        type: "order",
      });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

app.patch("/api/orders/:id/assign", requireRole("admin"), async (req, res) => {
  try {
    const { partnerId, partnerName } = req.body;
    const partner = await store.getUserById(partnerId);

    const order = await store.updateOrderStatus(req.params.id, "Assigned", {
      deliveryPartnerId: partnerId,
      deliveryPartnerName: partnerName || (partner ? partner.name : "Assigned Partner"),
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Notify partner
    await store.addNotification({
      userId: partnerId,
      title: "New Delivery Assigned",
      message: `Order #${order.orderId} to ${order.customerAddress} assigned to you.`,
      type: "delivery",
    });

    res.json({ success: true, order });
  } catch (err) {
    console.error("Error assigning order:", err);
    res.status(500).json({ message: "Failed to assign order" });
  }
});

// ======================================================
// DELIVERIES & EMPTY CAN COLLECTION
// ======================================================

app.post("/api/deliveries/collect-empty", requireRole("partner", "admin"), async (req, res) => {
  try {
    const { partnerId, partnerName, customerId, customerName, orderId, quantity, condition } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Please specify number of empty cans collected" });
    }

    const collection = await store.addEmptyCanCollection({
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
      await store.updateOrderStatus(orderId, "Delivered", { emptyCansReturned: Number(quantity) });
    }

    res.status(201).json({ success: true, collection });
  } catch (err) {
    console.error("Error recording empty can collection:", err);
    res.status(500).json({ message: "Failed to record empty can collection" });
  }
});

app.get("/api/deliveries/empty-cans", async (req, res) => {
  try {
    res.json(await store.getEmptyCanCollections());
  } catch (err) {
    console.error("Error fetching empty cans:", err);
    res.status(500).json({ message: "Failed to fetch empty cans" });
  }
});

// ======================================================
// PAYMENTS
// ======================================================

app.get("/api/payments", async (req, res) => {
  try {
    const { customerId } = req.query;
    const payments = customerId
      ? await store.getPaymentsByCustomer(customerId)
      : await store.getPayments();
    res.json(payments);
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
});

app.post("/api/payments", async (req, res) => {
  try {
    const { customerId, customerName, orderId, amount, method } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    const payment = await store.createPayment({
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
      await store.updateOrderStatus(orderId, "Delivered", { paymentStatus: "Paid" });
    }

    // Notify customer
    await store.addNotification({
      userId: payment.customerId,
      title: "Payment Received",
      message: `Payment of ₹${amount} received successfully via ${payment.method}.`,
      type: "payment",
    });

    res.status(201).json({ success: true, payment });
  } catch (err) {
    console.error("Error creating payment:", err);
    res.status(500).json({ message: "Failed to create payment" });
  }
});

app.get("/api/payments/summary", async (req, res) => {
  try {
    const payments = await store.getPayments();
    const orders = await store.getOrders();

    const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const pendingOrders = orders.filter((o) => o.paymentStatus === "Pending");
    const totalPending = pendingOrders.reduce((acc, o) => acc + (o.amount || 0), 0);

    res.json({
      totalCollected,
      totalPending,
      totalTransactions: payments.length,
      pendingTransactions: pendingOrders.length,
    });
  } catch (err) {
    console.error("Error calculating payments summary:", err);
    res.status(500).json({ message: "Failed to calculate payments summary" });
  }
});

// ======================================================
// NOTIFICATIONS
// ======================================================

app.get("/api/notifications", async (req, res) => {
  try {
    const { userId } = req.query;
    res.json(await store.getNotifications(userId));
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

app.patch("/api/notifications/:id/read", async (req, res) => {
  try {
    const notif = await store.markNotificationRead(req.params.id);
    res.json({ success: true, notification: notif });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: "Failed to update notification" });
  }
});

// ======================================================
// SYSTEM RESET (FOR PRESENTATIONS / DEMOS)
// ======================================================

app.post("/api/system/reset-demo", requireRole("admin"), async (req, res) => {
  try {
    await store.resetDemoData();
    res.json({ success: true, message: "Demo data has been reset to defaults." });
  } catch (err) {
    console.error("Error resetting demo data:", err);
    res.status(500).json({ message: "Failed to reset demo data" });
  }
});

// ======================================================
// FRONTEND STATIC ASSETS & SPA ROUTING (SINGLE-HOST DEPLOYMENT)
// ======================================================

const clientDistPath = path.resolve(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDistPath)) {
  console.log(`[Static] Serving frontend from ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api") && !req.path.startsWith("/uploads")) {
      return res.sendFile(path.join(clientDistPath, "index.html"));
    }
    next();
  });
}

// ======================================================
// START SERVER
// ======================================================

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test" && require.main === module) {
  connectDB()
    .then(() => store.seedInitialData())
    .catch((err) => console.error("[MongoDB] Initialization error:", err.message))
    .finally(() => {
      app.listen(PORT, () => {
        console.log(`AquaVision server running on port ${PORT}`);
      });
    });
} else if (require.main !== module) {
  // Required as a module in tests
  connectDB()
    .then(() => store.seedInitialData())
    .catch((err) => console.error("[MongoDB] Initialization error:", err.message))
    .finally(() => {
      app.listen(PORT, () => {
        console.log(`AquaVision server running on http://localhost:${PORT}`);
      });
    });
}

module.exports = app;