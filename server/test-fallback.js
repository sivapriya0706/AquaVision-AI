const path = require("path");
const { connectDB, isConnected } = require("./config/db");
const store = require("./data/store");

async function testFallback() {
  console.log("=== Testing Graceful Offline / Fallback Mode ===");
  // Point to non-existent port
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27019/aquavision";

  const conn = await connectDB({ serverSelectionTimeoutMS: 2000, connectTimeoutMS: 2000 });
  console.log("isConnected() result:", isConnected());

  if (isConnected()) {
    console.error("FAILED: Should not report connected for invalid URI.");
    process.exit(1);
  }

  // Check that store still returns data from in-memory fallback
  const users = await store.getUsers();
  const cans = await store.getCans();
  const orders = await store.getOrders();

  console.log(`Fallback retrieved in-memory records:
  - Users: ${users.length}
  - Cans: ${cans.length}
  - Orders: ${orders.length}`);

  if (users.length !== 5 || cans.length !== 8 || orders.length !== 4) {
    console.error("FAILED: Fallback did not return in-memory data.");
    process.exit(1);
  }

  console.log("PASSED: Graceful in-memory fallback operates successfully when MongoDB is unreachable.\n");
  process.exit(0);
}

testFallback();
