const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      required: [true, "order must have userId"],
      ref: "User",
    },
    productId: {
      type: mongoose.Schema.ObjectId,
      required: [true, "product id is required"],
      ref: "Product",
    },
    quantity: {
      type: Number,
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: [true, "product amount is required"],
    },
    amount: {
      type: Number,
    },
  },
  { toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
