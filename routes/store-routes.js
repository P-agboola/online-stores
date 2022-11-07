const {
  resizeImage,
  uploadStoreImage,
  editStore,
  deleteStore,
  createStore,
  getAllStores,
  getStoreByName,
} = require("../controllers/shop-controllers");
const express = require("express");
const { protect, restrictTo } = require("../controllers/auth-contoller");
const router = express.Router();

router
  .route("/:shopID")
  .patch(
    protect,
    restrictTo("admin", "shopOwner"),
    uploadStoreImage,
    resizeImage,
    editStore
  )
  .delete(protect, restrictTo("admin", "shopOwner"), deleteStore);
router
  .route("/")
  .post(
    protect,
    restrictTo("admin", "storeOwner"),
    uploadStoreImage,
    resizeImage,
    createStore
  )
  .get(getAllStores);
router.route("/: name").get(getStoreByName);

module.exports = router;
