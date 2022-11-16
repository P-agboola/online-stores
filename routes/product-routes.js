const express = require("express");
const { protect, restrictTo } = require("../controllers/auth-contoller");
const {
  listByCategories,
  createAProduct,
  deleteProduct,
  updateProduct,
  listproductByShop,
  listbyLatest,
  uploadProductImage,
  resizeImage,
  getAllProduct,
  getOneProduct,
} = require("../controllers/product-controller");
const router = express.Router();

router
  .route("/")
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
  .delete(protect, restrictTo("admin", "storeOwner"), deleteProduct)
  .patch(
    protect,
    restrictTo("admin", "storeOwner"),
    uploadProductImage,
    resizeImage,
    updateProduct
  )
  .get(getOneProduct);
router.route("/:category").get(listByCategories);
router.route("/:shop").get(listproductByShop);
router.route("/:latest").get(listbyLatest);

module.exports = router;
