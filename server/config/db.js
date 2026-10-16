const mongoose = require("mongoose");

/**
 * Clean and normalize MongoDB URI from environment
 */
function getNormalizedUri() {
  let uri = process.env.MONGODB_URI;
  if (!uri || typeof uri !== "string") {
    return process.env.NODE_ENV === "production"
      ? null
      : "mongodb://127.0.0.1:27017/aquavision";
  }

  // Trim whitespace, newlines, and surrounding quotes
  uri = uri.trim().replace(/^["']|["']$/g, "").trim();

  // If user pasted with angle brackets around credentials, e.g. <user>:<pass>@...
  // Automatically sanitize them so the connection string parses properly
  uri = uri.replace(
    /^(mongodb(?:\+srv)?:\/\/)(?:<([^:>@]+)>|([^:>@]+)):(?:<([^@>]+)>|([^@>]+))@/i,
    (m, scheme, u1, u2, p1, p2) => {
      const user = u1 !== undefined ? u1 : u2;
      const pass = p1 !== undefined ? p1 : p2;
      return `${scheme}${user}:${pass}@`;
    }
  );

  // If SRV URI lacks a database name before query string (e.g. mongodb.net/ or mongodb.net/?), append /aquavision
  if (uri.startsWith("mongodb+srv://")) {
    if (uri.includes(".mongodb.net/?")) {
      uri = uri.replace(".mongodb.net/?", ".mongodb.net/aquavision?");
    } else if (uri.endsWith(".mongodb.net") || uri.endsWith(".mongodb.net/")) {
      uri = uri.replace(/\.mongodb\.net\/?$/, ".mongodb.net/aquavision");
    }

    // Ensure authSource=admin is specified for Atlas database user authentication
    if (!uri.includes("authSource=")) {
      uri += (uri.includes("?") ? "&" : "?") + "authSource=admin";
    }
  } else if (uri.startsWith("mongodb://")) {
    // Ensure database name is included for standard mongodb:// replica sets / standalone
    if (/:\d+\/\?/.test(uri)) {
      uri = uri.replace(/:\d+\/\?/, (m) => m.replace("/?", "/aquavision?"));
    } else if (/:\d+\/?$/.test(uri)) {
      uri = uri.replace(/:\d+\/?$/, (m) => m.replace(/\/?$/, "/aquavision"));
    }
  }

  return uri;
}

/**
 * Mask password in MongoDB URI for safe logging without exposing secrets
 */
function maskUri(uri) {
  if (!uri) return "(not set)";
  try {
    return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/i, "$1*****$3");
  } catch {
    return "(masked-uri)";
  }
}

/**
 * Check for common URI formatting errors
 */
function validateUriPreflight(uri) {
  if (!uri) {
    return {
      valid: false,
      error: "MONGODB_URI environment variable is not defined.",
      hint: "Set MONGODB_URI in your Render environment variables to your MongoDB Atlas connection string.",
    };
  }

  if (uri.includes("<password>") || uri.includes("<username>") || uri.includes("<cluster-url>")) {
    return {
      valid: false,
      error: "MONGODB_URI contains unreplaced placeholder like '<password>' or '<username>'.",
      hint: "Edit MONGODB_URI in Render dashboard and replace placeholders with your actual Atlas database user credentials.",
    };
  }

  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    return {
      valid: false,
      error: "MONGODB_URI must begin with 'mongodb://' or 'mongodb+srv://'.",
      hint: "Copy the standard connection string from MongoDB Atlas: Database -> Connect -> Drivers -> Node.js.",
    };
  }

  // Check for unencoded special characters in password (e.g. multiple '@' before the host)
  const afterScheme = uri.split("://")[1] || "";
  const userinfo = afterScheme.split("@")[0] || "";

  if (userinfo.includes("<") || userinfo.includes(">")) {
    return {
      valid: false,
      error: "MONGODB_URI contains literal '<' or '>' angle brackets in credentials.",
      hint: "Remove the angle brackets '<' and '>'. For example, if your password is MyPass123, write :MyPass123@ (NOT :<MyPass123>@).",
    };
  }

  const atCount = (afterScheme.split("?")[0].match(/@/g) || []).length;
  if (atCount > 1) {
    return {
      valid: false,
      error: "Password in MONGODB_URI contains unescaped '@' character.",
      hint: "Percent-encode '@' as '%40' in your database user password, or create a database user with an alphanumeric password.",
    };
  }

  return { valid: true };
}

let lastConnectionError = null;
let reconnectTimer = null;

const MONGOOSE_OPTIONS = {
  serverSelectionTimeoutMS: 30000, // 30 seconds for cloud DNS SRV + TLS resolution
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 1,
  family: 4, // Force IPv4 to eliminate container IPv6 DNS delay
};

/**
 * Connect to MongoDB with robust options, diagnostic classification, and auto-retry
 */
async function connectDB(customOptions = {}) {
  const uri = getNormalizedUri();
  const preflight = validateUriPreflight(uri);

  if (!preflight.valid) {
    lastConnectionError = preflight.error;
    console.error(`[MongoDB] Configuration Error: ${preflight.error}`);
    console.warn(`[MongoDB Hint] ${preflight.hint}`);
    if (process.env.NODE_ENV === "production") {
      console.error("[MongoDB] Running in production without a valid persistent database connection!");
    }
    return null;
  }

  console.log(`[MongoDB] Connecting to ${maskUri(uri)}...`);

  try {
    const options = { ...MONGOOSE_OPTIONS, ...customOptions };
    const conn = await mongoose.connect(uri, options);
    lastConnectionError = null;
    if (reconnectTimer) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    }

    console.log(
      `[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`
    );
    return conn;
  } catch (error) {
    lastConnectionError = error.message;
    console.error(`[MongoDB] Connection error: ${error.message}`);
    diagnoseConnectionError(error);

    // If initial connection fails in production or when MONGODB_URI is specified, start background retry
    if (!reconnectTimer && process.env.MONGODB_URI) {
      scheduleReconnect();
    }

    return null;
  }
}

/**
 * Diagnose MongoDB Atlas errors with actionable instructions
 */
function diagnoseConnectionError(error) {
  const msg = (error && error.message) || "";

  if (
    msg.includes("SSL alert number 80") ||
    msg.includes("tlsv1 alert internal error") ||
    msg.includes("closed") ||
    msg.includes("MongoServerSelectionError")
  ) {
    console.error(
      "\n====================================================================\n" +
      "[MongoDB Atlas Diagnostic] TLS Handshake / Connection Rejected\n" +
      "--------------------------------------------------------------------\n" +
      "Probable Cause: MongoDB Atlas Network Access IP Access List is blocking\n" +
      "Render's outbound IP address. Render Free tier uses dynamic outbound IPs.\n" +
      "\n" +
      "Action Required in MongoDB Atlas:\n" +
      "1. Log in to cloud.mongodb.com\n" +
      "2. Select your project and navigate to 'Network Access' (left sidebar)\n" +
      "3. Click 'Add IP Address'\n" +
      "4. Choose 'ALLOW ACCESS FROM ANYWHERE' (IP address: 0.0.0.0/0)\n" +
      "5. Click 'Confirm' and wait 1-2 minutes for the rule to become Active.\n" +
      "====================================================================\n"
    );
  } else if (msg.includes("AuthenticationFailed") || msg.includes("bad auth")) {
    console.error(
      "\n====================================================================\n" +
      "[MongoDB Atlas Diagnostic] Authentication Failed\n" +
      "--------------------------------------------------------------------\n" +
      "Probable Cause: Incorrect database username or password.\n" +
      "\n" +
      "Action Required in MongoDB Atlas:\n" +
      "1. Go to 'Database Access' (left sidebar in Atlas)\n" +
      "2. Verify your database user exists and has 'Read and write to any database'\n" +
      "3. Click 'Edit' -> 'Edit Password' to set a clean alphanumeric password\n" +
      "4. Update MONGODB_URI in Render with the new password\n" +
      "====================================================================\n"
    );
  } else if (msg.includes("querySrv") || msg.includes("ENOTFOUND")) {
    console.error(
      "\n====================================================================\n" +
      "[MongoDB Atlas Diagnostic] DNS SRV Record Not Found\n" +
      "--------------------------------------------------------------------\n" +
      "Probable Cause: Cluster hostname is invalid or cluster is paused.\n" +
      "Action: Check your cluster status in Atlas and ensure it is not paused.\n" +
      "====================================================================\n"
    );
  }
}

/**
 * Background reconnection retry mechanism
 */
function scheduleReconnect() {
  if (reconnectTimer) return;
  console.log("[MongoDB] Scheduling automatic reconnection attempts in background...");
  let attempts = 0;
  reconnectTimer = setInterval(async () => {
    attempts++;
    if (isConnected()) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
      return;
    }
    console.log(`[MongoDB] Reconnection attempt #${attempts}...`);
    try {
      const uri = getNormalizedUri();
      if (!uri) return;
      await mongoose.connect(uri, MONGOOSE_OPTIONS);
      console.log("[MongoDB] Reconnected successfully to database!");
      lastConnectionError = null;
      clearInterval(reconnectTimer);
      reconnectTimer = null;

      // Automatically sync seed data on reconnection
      try {
        const store = require("../data/store");
        if (store && typeof store.seedInitialData === "function") {
          await store.seedInitialData();
        }
      } catch (seedErr) {
        console.error("[MongoDB] Error seeding after reconnect:", seedErr.message);
      }
    } catch (err) {
      lastConnectionError = err.message;
      if (attempts >= 20) {
        console.warn("[MongoDB] Pausing automatic reconnection after 20 attempts.");
        clearInterval(reconnectTimer);
        reconnectTimer = null;
      }
    }
  }, 10000);
}

// Connection event handlers
mongoose.connection.on("error", (err) => {
  lastConnectionError = err.message;
  console.error(`[MongoDB Runtime Error]: ${err.message}`);
});

mongoose.connection.on("disconnected", () => {
  console.warn("[MongoDB] Disconnected from database.");
  if (process.env.MONGODB_URI && !reconnectTimer) {
    scheduleReconnect();
  }
});

mongoose.connection.on("reconnected", () => {
  console.log("[MongoDB] Reconnected to database.");
  lastConnectionError = null;
});

function isConnected() {
  return mongoose.connection.readyState === 1;
}

function getConnectionStatus() {
  const connected = isConnected();
  const uri = getNormalizedUri();
  const isAtlas = uri && uri.startsWith("mongodb+srv://");

  return {
    connected,
    type: "MongoDB",
    provider: isAtlas ? "MongoDB Atlas" : "MongoDB Local",
    status: connected ? "connected" : (process.env.NODE_ENV === "production" ? "disconnected" : "fallback-in-memory"),
    host: connected ? mongoose.connection.host : null,
    database: connected ? mongoose.connection.name : null,
    persistence: connected ? "mongodb-atlas" : "in-memory-temporary",
    error: connected ? null : lastConnectionError,
  };
}

module.exports = {
  connectDB,
  isConnected,
  getConnectionStatus,
  maskUri,
  getNormalizedUri,
};
