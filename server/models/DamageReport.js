const mongoose = require("mongoose");

const damageReportSchema = new mongoose.Schema(
  {
    reportId: {
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
    damageType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    photo: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Pending Review",
    },
    adminNotes: {
      type: String,
    },
    reviewedAt: {
      type: String,
    },
    createdAt: {
      type: String,
      required: true,
    },
  },
  {
    id: false,
    versionKey: false,
  }
);

module.exports = mongoose.model("DamageReport", damageReportSchema);
