const {
  uploadStoreImage,
  resizeImage,
  deleteStore,
  createStore,
  getAllStores,
  getStoreByName,
  updateStore,
  getOnestore,
} = require("../controllers/store-controllers");
const express = require("express");
const { restrictTo, protect } = require("../controllers/auth-contoller");

const router = express.Router();

router
  .route("/:storeID")
  .patch(
    protect,
    restrictTo("admin", "storeOwner"),
    uploadStoreImage,
    resizeImage,
    updateStore
  )
  .delete(protect, restrictTo("admin", "storeOwner"), deleteStore)
  .get(getOnestore);
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
