const mongoose = require("mongoose");

/**
 * Connect to MongoDB database
 * Uses environment variable MONGODB_URI or defaults to local MongoDB
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aquavision";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.warn("[MongoDB] Operating with in-memory fallback store until MongoDB is available.");
    return null;
  }
}

// Connection event handlers for resilience
mongoose.connection.on("error", (err) => {
  console.error(`[MongoDB] Runtime error: ${err.message}`);
});

mongoose.connection.on("disconnected", () => {
  console.warn("[MongoDB] Disconnected from database.");
});

mongoose.connection.on("reconnected", () => {
  console.log("[MongoDB] Reconnected to database.");
});

function isConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  isConnected,
};
