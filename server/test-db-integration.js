const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const { connectDB, isConnected } = require("./config/db");
const store = require("./data/store");
const User = require("./models/User");
const WaterCan = require("./models/WaterCan");
const Order = require("./models/Order");
const Payment = require("./models/Payment");
const Notification = require("./models/Notification");
const EmptyCanCollection = require("./models/EmptyCanCollection");
const DamageReport = require("./models/DamageReport");

async function runTests() {
  console.log("=== AquaVision AI - MongoDB Integration Test Suite ===");

  // 1. Connection Test
  console.log("\n[Test 1] Connecting to MongoDB...");
  const conn = await connectDB();
  if (!conn || !isConnected()) {
    console.error("FAILED: Could not connect to MongoDB.");
    process.exit(1);
  }
  console.log("PASSED: MongoDB connection established.");

  // 2. Seeding Test
  console.log("\n[Test 2] Testing Initial Data Seeding...");
  await store.seedInitialData();

  const userCount = await User.countDocuments();
  const canCount = await WaterCan.countDocuments();
  const orderCount = await Order.countDocuments();
  const paymentCount = await Payment.countDocuments();
  const notifCount = await Notification.countDocuments();
  const colCount = await EmptyCanCollection.countDocuments();
  const reportCount = await DamageReport.countDocuments();

  console.log(`Counts in MongoDB:
  - Users: ${userCount}
  - Water Cans: ${canCount}
  - Orders: ${orderCount}
  - Payments: ${paymentCount}
  - Notifications: ${notifCount}
  - Empty Can Collections: ${colCount}
  - Damage Reports: ${reportCount}`);

  if (userCount < 5 || canCount < 8 || orderCount < 4 || paymentCount < 3 || notifCount < 4 || colCount < 1 || reportCount < 3) {
    console.error("FAILED: Collections do not have expected seeded records.");
    process.exit(1);
  }
  console.log("PASSED: All 7 collections seeded properly in MongoDB.");

  // 3. User operations test
  console.log("\n[Test 3] Testing User operations...");
  const users = await store.getUsers();
  const customer = await store.getUserById("USR-001");
  const byEmail = await store.getUserByEmail("customer@aquavision.ai");
  if (!users.length || !customer || !byEmail || customer.name !== "Sivapriya") {
    console.error("FAILED: User queries returned unexpected data.");
    process.exit(1);
  }
  await store.updateUser("USR-001", { phone: "+91 99999 88888" });
  const updatedCustomer = await User.findOne({ id: "USR-001" });
  if (updatedCustomer.phone !== "+91 99999 88888") {
    console.error("FAILED: User update was not persisted to MongoDB.");
    process.exit(1);
  }
  // Revert phone
  await store.updateUser("USR-001", { phone: "+91 98765 43210" });
  console.log("PASSED: User queries and updates verified in MongoDB.");

  // 4. Water Can operations test
  console.log("\n[Test 4] Testing Water Can operations...");
  const cans = await store.getCans();
  const custCans = await store.getCansByCustomer("USR-001");
  const testCan = await store.addCan({
    canId: "CAN-TEST-999",
    customerId: "USR-001",
    customerName: "Sivapriya",
    capacity: "20 Liters",
    status: "Full",
    condition: "Good",
    lastRefill: "2026-10-13",
    nextExpectedRefill: "2026-10-20",
    batch: "B-2026-10",
  });
  const dbCan = await WaterCan.findOne({ canId: "CAN-TEST-999" });
  if (!dbCan) {
    console.error("FAILED: addCan did not persist to MongoDB.");
    process.exit(1);
  }
  await store.updateCanStatus("CAN-TEST-999", { status: "Empty" });
  const updatedDbCan = await WaterCan.findOne({ canId: "CAN-TEST-999" });
  if (updatedDbCan.status !== "Empty") {
    console.error("FAILED: updateCanStatus did not persist to MongoDB.");
    process.exit(1);
  }
  // Clean up test can
  await WaterCan.deleteOne({ canId: "CAN-TEST-999" });
  console.log("PASSED: Water can operations verified in MongoDB.");

  // 5. Order operations test
  console.log("\n[Test 5] Testing Order operations...");
  const newOrder = await store.createOrder({
    customerId: "USR-001",
    customerName: "Sivapriya",
    numberOfCans: 5,
    amount: 400,
    deliveryDate: "2026-10-15",
  });
  const dbOrder = await Order.findOne({ orderId: newOrder.orderId });
  if (!dbOrder || dbOrder.amount !== 400) {
    console.error("FAILED: createOrder did not persist to MongoDB.");
    process.exit(1);
  }
  await store.updateOrderStatus(newOrder.orderId, "Delivered", { emptyCansReturned: 5 });
  const updatedDbOrder = await Order.findOne({ orderId: newOrder.orderId });
  if (updatedDbOrder.status !== "Delivered" || updatedDbOrder.emptyCansReturned !== 5) {
    console.error("FAILED: updateOrderStatus did not persist to MongoDB.");
    process.exit(1);
  }
  // Clean up test order
  await Order.deleteOne({ orderId: newOrder.orderId });
  console.log("PASSED: Order operations verified in MongoDB.");

  // 6. Payment operations test
  console.log("\n[Test 6] Testing Payment operations...");
  const newPayment = await store.createPayment({
    customerId: "USR-001",
    customerName: "Sivapriya",
    amount: 400,
    method: "UPI (Test)",
  });
  const dbPayment = await Payment.findOne({ paymentId: newPayment.paymentId });
  if (!dbPayment || dbPayment.amount !== 400) {
    console.error("FAILED: createPayment did not persist to MongoDB.");
    process.exit(1);
  }
  await Payment.deleteOne({ paymentId: newPayment.paymentId });
  console.log("PASSED: Payment operations verified in MongoDB.");

  // 7. Notification operations test
  console.log("\n[Test 7] Testing Notification operations...");
  const newNotif = await store.addNotification({
    userId: "USR-001",
    title: "Test Alert",
    message: "This is a test notification",
    type: "test",
  });
  const dbNotif = await Notification.findOne({ id: newNotif.id });
  if (!dbNotif) {
    console.error("FAILED: addNotification did not persist to MongoDB.");
    process.exit(1);
  }
  await store.markNotificationRead(newNotif.id);
  const updatedDbNotif = await Notification.findOne({ id: newNotif.id });
  if (!updatedDbNotif.read) {
    console.error("FAILED: markNotificationRead did not persist to MongoDB.");
    process.exit(1);
  }
  await Notification.deleteOne({ id: newNotif.id });
  console.log("PASSED: Notification operations verified in MongoDB.");

  // 8. Empty Can Collection operations test
  console.log("\n[Test 8] Testing Empty Can Collection operations...");
  const newCol = await store.addEmptyCanCollection({
    partnerId: "USR-003",
    partnerName: "Arun",
    customerId: "USR-001",
    customerName: "Sivapriya",
    quantity: 4,
  });
  const dbCol = await EmptyCanCollection.findOne({ collectionId: newCol.collectionId });
  if (!dbCol || dbCol.quantity !== 4) {
    console.error("FAILED: addEmptyCanCollection did not persist to MongoDB.");
    process.exit(1);
  }
  await EmptyCanCollection.deleteOne({ collectionId: newCol.collectionId });
  console.log("PASSED: Empty can collection operations verified in MongoDB.");

  // 9. Damage Report operations test
  console.log("\n[Test 9] Testing Damage Report operations...");
  const newReport = await store.createDamageReport({
    reportId: "DR-TEST-999",
    customerId: "USR-001",
    customerName: "Sivapriya",
    damageType: "Crack",
    description: "Test crack report",
    photo: "/uploads/test.jpg",
    status: "Pending Review",
    createdAt: new Date().toISOString(),
  });
  const dbReport = await DamageReport.findOne({ reportId: "DR-TEST-999" });
  if (!dbReport) {
    console.error("FAILED: createDamageReport did not persist to MongoDB.");
    process.exit(1);
  }
  await store.updateDamageReportStatus("DR-TEST-999", "Approved", { adminNotes: "Approved under test" });
  const updatedDbReport = await DamageReport.findOne({ reportId: "DR-TEST-999" });
  if (updatedDbReport.status !== "Approved" || updatedDbReport.adminNotes !== "Approved under test") {
    console.error("FAILED: updateDamageReportStatus did not persist to MongoDB.");
    process.exit(1);
  }
  await DamageReport.deleteOne({ reportId: "DR-TEST-999" });
  console.log("PASSED: Damage report operations verified in MongoDB.");

  // 10. Reset Demo Data test
  console.log("\n[Test 10] Testing Reset Demo Data...");
  await store.resetDemoData();
  const resetUserCount = await User.countDocuments();
  const resetReportCount = await DamageReport.countDocuments();
  if (resetUserCount !== 5 || resetReportCount !== 3) {
    console.error("FAILED: resetDemoData did not restore initial counts.");
    process.exit(1);
  }
  console.log("PASSED: Reset demo data restores pristine collections.");

  console.log("\n=======================================================");
  console.log(" ALL DATA & MONGODB PERSISTENCE TESTS PASSED (10/10) ");
  console.log("=======================================================\n");

  await mongoose.disconnect();
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
