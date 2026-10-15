const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      required: true,
      enum: ["customer", "partner", "admin"],
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    assignedPartnerId: {
      type: String,
      default: null,
    },
    waterCansCount: {
      type: Number,
      default: 0,
    },
    balanceDue: {
      type: Number,
      default: 0,
    },
    vehicleNumber: {
      type: String,
      default: "",
    },
    assignedZone: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    activeDeliveriesCount: {
      type: Number,
      default: 0,
    },
    department: {
      type: String,
      default: "",
    },
  },
  {
    id: false,
    versionKey: false,
  }
);

module.exports = mongoose.model("User", userSchema);
