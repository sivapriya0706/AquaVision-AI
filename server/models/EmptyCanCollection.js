const mongoose = require("mongoose");

const emptyCanCollectionSchema = new mongoose.Schema(
  {
    collectionId: {
      type: String,
      required: true,
      unique: true,
    },
    partnerId: {
      type: String,
      required: true,
    },
    partnerName: {
      type: String,
      required: true,
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
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      default: "Good",
    },
    status: {
      type: String,
      default: "Deposited at Hub",
    },
  },
  {
    id: false,
    versionKey: false,
  }
);

module.exports = mongoose.model("EmptyCanCollection", emptyCanCollectionSchema);
