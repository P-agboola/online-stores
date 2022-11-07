const {
  createShop,
  editShop,
  getShopByName,
  getAllShops,
  uploadShopImage,
  resizeImage,
  deleteShop,
} = require("../controllers/shop-controllers");
const express = require("express");
const { protect, restrictTo } = require("../controllers/auth-contoller");
const router = express.Router();

router
  .route("/:shopID")
  .patch(
    protect,
    restrictTo("admin", "shopOwner"),
    uploadShopImage,
    resizeImage,
    editShop
  )
  .delete(protect, restrictTo("admin", "shopOwner"), deleteShop);
router
  .route("/")
  .post(
    protect,
    restrictTo("admin", "shopOwner"),
    uploadShopImage,
    resizeImage,
    createShop
  )
  .get(getAllShops);
router.route("/: name").get(getShopByName);

module.exports = router;
