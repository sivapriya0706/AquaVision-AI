const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      default: "UPI",
    },
    status: {
      type: String,
      default: "Completed",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    id: false,
    versionKey: false,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
