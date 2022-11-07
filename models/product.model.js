const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: "Name is required",
    },
    image: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
    },
    quantity: {
      type: Number,
      required: "Quantity is required",
    },
    price: {
      type: Number,
      required: "Price is required",
    },

    shop: { type: mongoose.Schema.ObjectId, ref: "Shop" },
  },
  { timestamps: true }
);
const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
