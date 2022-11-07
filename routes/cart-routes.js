const express = require("express");
const { protect, restrictTo } = require("../controllers/auth-contoller");
const {
  getAllCarts,
  createCart,
  getOneCart,
  updateCart,
  deleteCart,
} = require("../controllers/cart-controllers");
const router = express.Router();

router
  .route("/")
  .post(protect, createCart)
  .get(protect, restrictTo("admin"), getAllCarts);
router
  .route("/:id")
  .get(protect, getOneCart)
  .patch(protect, updateCart)
  .delete(protect, deleteCart);

module.exports = router;
