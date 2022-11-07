const express = require("express");
const {
  signUp,
  signIn,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require("../controllers/auth-contoller");
const {
  getAllUser,
  deleteUser,
  updateUser,
  getOneUser,
} = require("../controllers/user-controllers");
const router = express.Router();

router.post("/signUp", signUp);
router.post("/signIn", signIn);
router.get("/", protect, restrictTo("admin"), getAllUser);
router
  .route("/:id")
  .delete(protect, deleteUser)
  .patch(protect, updateUser)
  .get(protect, getOneUser);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);
router.patch("/update-password/:id", protect, updatePassword);
module.exports = router;
