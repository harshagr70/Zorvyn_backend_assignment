const mongoose = require("mongoose");
const { CATEGORIES, RECORD_TYPES } = require("../../shared/constants");

const recordSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0.01 },
    type: { type: String, enum: Object.values(RECORD_TYPES), required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    date: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value <= new Date(),
        message: "Date cannot be in the future",
      },
    },
    description: { type: String, trim: true, maxlength: 500 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

recordSchema.index({ isDeleted: 1, date: -1 });
recordSchema.index({ isDeleted: 1, type: 1, category: 1 });
recordSchema.index({ isDeleted: 1, type: 1, date: 1 });
recordSchema.index({ createdBy: 1, isDeleted: 1 });

module.exports = mongoose.model("Record", recordSchema);
