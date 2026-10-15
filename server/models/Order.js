const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
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
    customerAddress: {
      type: String,
      default: "",
    },
    customerPhone: {
      type: String,
      default: "",
    },
    numberOfCans: {
      type: Number,
      required: true,
    },
    orderDate: {
      type: String,
      required: true,
    },
    deliveryDate: {
      type: String,
      required: true,
    },
    deliveryPartnerId: {
      type: String,
      default: null,
    },
    deliveryPartnerName: {
      type: String,
      default: "Unassigned",
    },
    status: {
      type: String,
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      default: "Pending",
    },
    amount: {
      type: Number,
      required: true,
    },
    emptyCansReturned: {
      type: Number,
      default: 0,
    },
    specialInstructions: {
      type: String,
      default: "",
    },
    deliveredAt: {
      type: String,
    },
  },
  {
    id: false,
    versionKey: false,
  }
);

module.exports = mongoose.model("Order", orderSchema);
