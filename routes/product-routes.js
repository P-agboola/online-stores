const express = require("express");
const { protect, restrictTo } = require("../controllers/auth-contoller");
const {
  listByCategories,
  createAProduct,
  listAllProducts,
  deleteProduct,
  updateProduct,
  productByID,
  listproductByShop,
  listbyLatest,
} = require("../controllers/product-controller");
const router = express.Router();

router
  .route("/")
  .post(protect, restrictTo("shopOwner"), createAProduct)
  .get(listAllProducts);
router
  .route("/:id")
  .delete(protect, restrictTo("admin","shopOwner"), deleteProduct)
  .patch(protect, restrictTo("admin","shopOwner"), updateProduct)
  .get(productByID);
router.route("/:category").get(listByCategories);
router.route("/:shop").get(listproductByShop);
router.route("/:latest").get(listbyLatest);

module.exports = router;
