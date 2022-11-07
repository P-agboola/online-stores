const mongoose = require("mongoose");
const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: "Name is required",
    },
    image: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: { type: mongoose.Schema.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Shop = mongoose.model("Shop", shopSchema);
module.exports = Shop;
