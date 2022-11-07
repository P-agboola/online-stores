const express = require("express");
const { protect, restrictTo } = require("../controllers/auth-contoller");
const { getOrder, getAllOrder } = require("../controllers/order-controllers");
const router = express.Router();

router.get("/:id", protect, getOrder);
router.get("/", protect, restrictTo("admin"), getAllOrder);

module.exports = router;
