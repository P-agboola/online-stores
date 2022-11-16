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
      trim: true,
      required: [true, "a product must have an image"],
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: [String],
    },
    quantity: {
      type: Number,
      required: "Quantity is required",
    },
    price: {
      type: Number,
      required: "Price is required",
    },

    store: { type: mongoose.Schema.ObjectId, ref: "Store" },
  },
  { timestamps: true }
);
const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
