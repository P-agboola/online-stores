const express = require("express");
const { protect, restrictTo } = require("../controllers/auth-contoller");
const {
  listByCategories,
  createAProduct,
  deleteProduct,
  updateProduct,
  listbyLatest,
  getAllProduct,
  getOneProduct,
  listproductByStore,
  uploadProductImage,
  resizeImage,
} = require("../controllers/product-controller");
const router = express.Router();

router
  .route("/:storeID")
  .post(
    protect,
    restrictTo("storeOwner"),
    uploadProductImage,
    resizeImage,
    createAProduct
  )
  .get(getAllProduct);
router
  .route("/:id")
  .delete(protect, restrictTo("admin", "storeOwner"), deleteProduct);
router
  .route("/:storeID/:id")
  .patch(
    protect,
    restrictTo("admin", "storeOwner"),
    uploadProductImage,
    resizeImage,
    updateProduct
  )
  .get(getOneProduct);
router.route("/:category").get(listByCategories);
router.route("/store/:storeID").get(listproductByStore);
router.route("/:latest").get(listbyLatest);

module.exports = router;
