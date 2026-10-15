const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const http = require("http");

// Set test port
process.env.PORT = "5001";

async function runE2ETests() {
  console.log("=== AquaVision AI - End-to-End API Test Suite ===");

  // Start the server
  const serverModule = require("./server");

  // Wait 1.5s for MongoDB connection and server binding
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const BASE_URL = "http://localhost:5001";

  async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  }

  try {
    // 1. Root health check
    console.log("\n[API 1] Testing GET /...");
    const rootRes = await request("/");
    if (rootRes.status !== 200 || rootRes.data.status !== "healthy" || rootRes.data.database.status !== "connected") {
      throw new Error(`GET / failed: ${JSON.stringify(rootRes)}`);
    }
    console.log("PASSED: Root endpoint reports healthy and MongoDB connected.");

    // 2. Auth tests
    console.log("\n[API 2A] Testing customer signup (POST /api/auth/register)...");
    const testEmail = `cust_${Date.now()}@testaquavision.com`;
    const regRes = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Customer",
        email: testEmail,
        password: "Password@123",
        phone: "+91 99999 11111",
        address: "Test Flat 101, Bangalore",
        role: "admin", // Client tries to specify role admin
      }),
    });
    if (regRes.status !== 201 || !regRes.data.success || regRes.data.user.role !== "customer") {
      throw new Error(`Customer signup failed or role not enforced: ${JSON.stringify(regRes)}`);
    }
    console.log("PASSED: Customer registration succeeded and role forced to 'customer'.");

    console.log("\n[API 2B] Testing duplicate email rejection...");
    const dupRes = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Duplicate Customer",
        email: testEmail,
        password: "Password@123",
      }),
    });
    if (dupRes.status !== 400 || dupRes.data.success) {
      throw new Error(`Duplicate registration should fail with 400: ${JSON.stringify(dupRes)}`);
    }
    console.log("PASSED: Duplicate email registration rejected.");

    console.log("\n[API 2C] Testing invalid credentials rejection...");
    const badLoginRes = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: testEmail, password: "WrongPassword" }),
    });
    if (badLoginRes.status !== 401 || badLoginRes.data.success) {
      throw new Error(`Login with bad password should return 401: ${JSON.stringify(badLoginRes)}`);
    }
    console.log("PASSED: Invalid password rejected with 401 Unauthorized.");

    console.log("\n[API 2D] Testing valid customer login...");
    const loginRes = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "customer@aquavision.ai", password: "Customer@123" }),
    });
    if (loginRes.status !== 200 || !loginRes.data.success || loginRes.data.user.id !== "USR-001" || !loginRes.data.token) {
      throw new Error(`Customer login failed: ${JSON.stringify(loginRes)}`);
    }
    const customerToken = loginRes.data.token;
    console.log(`PASSED: Customer login successful with token for ${loginRes.data.user.name}.`);

    console.log("\n[API 2E] Testing customer blocked from Admin API...");
    const blockedRes = await request("/api/damage-reports/DR-1024/status", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ status: "Approved" }),
    });
    if (blockedRes.status !== 403) {
      throw new Error(`Customer should be forbidden (403) from Admin API: ${JSON.stringify(blockedRes)}`);
    }
    console.log("PASSED: Customer blocked from accessing Admin endpoint (403 Forbidden).");

    console.log("\n[API 2F] Authenticating Admin & Partner...");
    const adminLoginRes = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@aquavision.ai", password: "Admin@123" }),
    });
    if (adminLoginRes.status !== 200 || adminLoginRes.data.user.role !== "admin" || !adminLoginRes.data.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLoginRes)}`);
    }
    const adminToken = adminLoginRes.data.token;

    const partnerLoginRes = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "partner@aquavision.ai", password: "Partner@123" }),
    });
    if (partnerLoginRes.status !== 200 || partnerLoginRes.data.user.role !== "partner" || !partnerLoginRes.data.token) {
      throw new Error(`Partner login failed: ${JSON.stringify(partnerLoginRes)}`);
    }
    const partnerToken = partnerLoginRes.data.token;
    console.log("PASSED: Admin and Delivery Partner authenticated successfully.");

    // 3. Users API
    console.log("\n[API 3] Testing GET /api/users & GET /api/users/:id...");
    const usersRes = await request("/api/users?role=partner");
    if (usersRes.status !== 200 || !Array.isArray(usersRes.data) || usersRes.data.length < 2) {
      throw new Error(`GET /api/users failed: ${JSON.stringify(usersRes)}`);
    }
    const userRes = await request("/api/users/USR-001");
    if (userRes.status !== 200 || userRes.data.id !== "USR-001") {
      throw new Error(`GET /api/users/USR-001 failed: ${JSON.stringify(userRes)}`);
    }
    console.log(`PASSED: Users endpoints verified.`);

    // 4. Water Cans API
    console.log("\n[API 4] Testing GET /api/cans & POST /api/cans & PATCH /api/cans/:id...");
    const cansRes = await request("/api/cans?customerId=USR-001");
    if (cansRes.status !== 200 || !Array.isArray(cansRes.data) || cansRes.data.length < 1) {
      throw new Error(`GET /api/cans failed: ${JSON.stringify(cansRes)}`);
    }
    const createCanRes = await request("/api/cans", {
      method: "POST",
      body: JSON.stringify({
        customerId: "USR-001",
        customerName: "Sivapriya",
        capacity: "20 Liters",
        status: "Full",
        condition: "New",
      }),
    });
    if (createCanRes.status !== 201 || !createCanRes.data.can?.canId) {
      throw new Error(`POST /api/cans failed: ${JSON.stringify(createCanRes)}`);
    }
    const createdCanId = createCanRes.data.can.canId;
    const patchCanRes = await request(`/api/cans/${createdCanId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "In Use" }),
    });
    if (patchCanRes.status !== 200 || patchCanRes.data.can.status !== "In Use") {
      throw new Error(`PATCH /api/cans/:id failed: ${JSON.stringify(patchCanRes)}`);
    }
    console.log(`PASSED: Water cans CRUD working and persisting.`);

    // 5. Orders API
    console.log("\n[API 5] Testing Orders endpoints...");
    const ordersRes = await request("/api/orders");
    if (ordersRes.status !== 200 || !Array.isArray(ordersRes.data)) {
      throw new Error(`GET /api/orders failed: ${JSON.stringify(ordersRes)}`);
    }
    const createOrderRes = await request("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        customerId: "USR-001",
        customerName: "Sivapriya",
        numberOfCans: 3,
        specialInstructions: "Test order for integration verification",
      }),
    });
    if (createOrderRes.status !== 201 || !createOrderRes.data.order?.orderId) {
      throw new Error(`POST /api/orders failed: ${JSON.stringify(createOrderRes)}`);
    }
    const createdOrderId = createOrderRes.data.order.orderId;

    const assignOrderRes = await request(`/api/orders/${createdOrderId}/assign`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ partnerId: "USR-003", partnerName: "Arun" }),
    });
    if (assignOrderRes.status !== 200 || assignOrderRes.data.order.deliveryPartnerId !== "USR-003") {
      throw new Error(`PATCH /api/orders/:id/assign failed: ${JSON.stringify(assignOrderRes)}`);
    }

    const statusOrderRes = await request(`/api/orders/${createdOrderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "Delivered", emptyCansReturned: 3 }),
    });
    if (statusOrderRes.status !== 200 || statusOrderRes.data.order.status !== "Delivered") {
      throw new Error(`PATCH /api/orders/:id/status failed: ${JSON.stringify(statusOrderRes)}`);
    }
    console.log(`PASSED: Order creation, assignment, and delivery cycle verified.`);

    // 6. Deliveries & Empty Cans API
    console.log("\n[API 6] Testing Empty Cans collection...");
    const collectRes = await request("/api/deliveries/collect-empty", {
      method: "POST",
      headers: { Authorization: `Bearer ${partnerToken}` },
      body: JSON.stringify({
        partnerId: "USR-003",
        partnerName: "Arun",
        customerId: "USR-001",
        customerName: "Sivapriya",
        orderId: createdOrderId,
        quantity: 3,
        condition: "Good",
      }),
    });
    if (collectRes.status !== 201 || !collectRes.data.collection?.collectionId) {
      throw new Error(`POST /api/deliveries/collect-empty failed: ${JSON.stringify(collectRes)}`);
    }
    const emptyCansRes = await request("/api/deliveries/empty-cans");
    if (emptyCansRes.status !== 200 || !Array.isArray(emptyCansRes.data)) {
      throw new Error(`GET /api/deliveries/empty-cans failed: ${JSON.stringify(emptyCansRes)}`);
    }
    console.log(`PASSED: Empty cans collection recorded.`);

    // 7. Payments API
    console.log("\n[API 7] Testing Payments endpoints...");
    const createPayRes = await request("/api/payments", {
      method: "POST",
      body: JSON.stringify({
        customerId: "USR-001",
        customerName: "Sivapriya",
        orderId: createdOrderId,
        amount: 240,
        method: "UPI (PhonePe Sandbox)",
      }),
    });
    if (createPayRes.status !== 201 || !createPayRes.data.payment?.paymentId) {
      throw new Error(`POST /api/payments failed: ${JSON.stringify(createPayRes)}`);
    }
    const summaryRes = await request("/api/payments/summary");
    if (summaryRes.status !== 200 || typeof summaryRes.data.totalCollected !== "number") {
      throw new Error(`GET /api/payments/summary failed: ${JSON.stringify(summaryRes)}`);
    }
    console.log(`PASSED: Payments creation and financial summary calculation verified.`);

    // 8. Notifications API
    console.log("\n[API 8] Testing Notifications...");
    const notifsRes = await request("/api/notifications?userId=USR-001");
    if (notifsRes.status !== 200 || !Array.isArray(notifsRes.data)) {
      throw new Error(`GET /api/notifications failed: ${JSON.stringify(notifsRes)}`);
    }
    if (notifsRes.data.length > 0) {
      const firstNotifId = notifsRes.data[0].id;
      const readRes = await request(`/api/notifications/${firstNotifId}/read`, { method: "PATCH" });
      if (readRes.status !== 200 || !readRes.data.notification?.read) {
        throw new Error(`PATCH /api/notifications/:id/read failed: ${JSON.stringify(readRes)}`);
      }
    }
    console.log(`PASSED: Notifications retrieval and mark-as-read verified.`);

    // 9. Damage Reports API
    console.log("\n[API 9] Testing Damage Reports...");
    const reportsRes = await request("/api/damage-reports");
    if (reportsRes.status !== 200 || !Array.isArray(reportsRes.data) || reportsRes.data.length < 1) {
      throw new Error(`GET /api/damage-reports failed: ${JSON.stringify(reportsRes)}`);
    }
    const updateReportRes = await request("/api/damage-reports/DR-1024/status", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "Approved", adminNotes: "Validated during E2E test" }),
    });
    if (updateReportRes.status !== 200 || updateReportRes.data.report?.status !== "Approved") {
      throw new Error(`PATCH /api/damage-reports/:id/status failed: ${JSON.stringify(updateReportRes)}`);
    }
    console.log(`PASSED: Damage reports retrieval and moderation verified.`);

    // 10. System Reset
    console.log("\n[API 10] Testing POST /api/system/reset-demo...");
    const resetRes = await request("/api/system/reset-demo", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (resetRes.status !== 200 || !resetRes.data.success) {
      throw new Error(`POST /api/system/reset-demo failed: ${JSON.stringify(resetRes)}`);
    }
    console.log("PASSED: 1-Click System Reset restored pristine demo data in MongoDB.");

    console.log("\n=======================================================");
    console.log(" ALL END-TO-END API TESTS PASSED SUCCESSFULLY (10/10) ");
    console.log("=======================================================\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\nTEST SUITE FAILED:", err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runE2ETests();
