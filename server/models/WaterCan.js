const mongoose = require("mongoose");

const waterCanSchema = new mongoose.Schema(
  {
    canId: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: String,
      default: null,
    },
    customerName: {
      type: String,
      default: "Central Inventory",
    },
    capacity: {
      type: String,
      default: "20 Liters",
    },
    status: {
      type: String,
      required: true,
      default: "Full",
    },
    condition: {
      type: String,
      default: "Good",
    },
    lastRefill: {
      type: String,
      default: "",
    },
    nextExpectedRefill: {
      type: String,
      default: "",
    },
    batch: {
      type: String,
      default: "",
    },
  },
  {
    id: false,
    versionKey: false,
  }
);

module.exports = mongoose.model("WaterCan", waterCanSchema);
