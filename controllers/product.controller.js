const User = require("../models/User-model");
const Shop = require("../models/shop.model");
const Product = require("../models/product.model");
const CatchAsync = require("../utils/catch-async");
const multer = require("multer");
const sharp = require("sharp");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ErrorObject("Please upload only an image file", 400), false);
  }
};

const uploadImage = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadProductImage = uploadImage.single("image");

const resizeImage = CatchAsync(async (req, res, next) => {
  if (req.file) {
    let timeStamp = Date.now();
    let id = req.params.id;
    let productName;
    if (id) {
      const product = await Product.findById(id);
      if (!product) {
        return next(
          new ErrorObject(
            `There is no product with the is ${req.params.id}`,
            400
          )
        );
      }
      productName = `${product.name}-${timeStamp}.jpeg`;
    }
    productName = `${req.body.name}-${timeStamp}.jpeg`;
    req.body.image = productName;

    await sharp(req.file.buffer)
      .resize(320, 240)
      .toFormat("jpeg")
      .jpeg({ quality: 80 })
      .toFile(`public/productImage/${productName}`);
  }

  next();
});

const createAProduct = CatchAsync(async (req, res) => {
  const { name, image, description, category, quantity, price } = req.body;
  const shopOwner = await User.findById(userID);
  const shop = await Shop.findOne({ "owner.fullName": shopOwner.fullName });
  const productExists = await Product.findOne({ name });

  if (!shopOwner)
    return res
      .status(401)
      .json({ error: true, message: "unauthorized access" });
  if (!shop)
    return res
      .status(401)
      .json({ error: true, message: "unauthorized access" });

  if (productExists) {
    productExists.quantity += parseInt(quantity);
    await productExists.save();
    return res
      .status(200)
      .json({ error: false, message: "product quantity updated" });
  } else {
    const newProduct = new Product({
      name,
      image,
      description,
      category,
      quantity,
      price,
    });
    newProduct = await newProduct.populate("shop").execPopulate();

    if (newProduct) {
      newProduct = await newProduct.save();
      return res
        .status(200)
        .json({ error: false, message: "product added to your shop" });
    }
  }
});

const productByID = async (req, res) => {
  try {
    const { producID } = req.params;
    const product = Product.findOne(producID);
    if (!product)
      return res
        .status(404)
        .json({ error: true, message: "product not found" });
    return res.status(200).json({
      error: false,
      message: "product found",
      data: product,
    });
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      error: true,
      message: "Something went wrong",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    // only shop owner can update product in their shop
    const { producID } = req.params;
    const { userID } = req.params;
    const { name, image, description, category, quantity, price } = req.body;
    const productExists = await Product.findOneAndUpdate(
      { _id: producID, "shop.owner._id": userID },
      { name, image, description, category, quantity, price },
      { new: true }
    );
    if (!productExists) {
      return res
        .status(404)
        .json({ error: true, message: "porduct not found in your shop" });
    }
    return res.status(200).json({
      error: false,
      message: "product updated",
      data: productExists,
    });
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      error: true,
      message: "Something went wrong",
    });
  }
};

const listproductByShop = async (req, res) => {
  try {
    const { shopID } = req.params;
    const products = Product.find({ "shop._id": shopID });
    if (!products)
      return res
        .status(404)
        .json({ error: true, message: "No products in store" });
    return res.status(200).json({
      error: false,
      message: "products found",
      data: products,
    });
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      error: true,
      message: "Something went wrong",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { producID } = req.params;
    const { userID } = req.params;
    // only shop owner can delete product in their shop
    const deletedProduct = await Product.findOneAndDelete({
      _id: producID,
      "shop.owner._id": userID,
    });
    if (!deletedProduct) {
      return res
        .status(404)
        .json({ error: true, message: "this is not found in your store" });
    }
    return res.status(200).json({
      error: false,
      message: "product deleted",
    });
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      error: true,
      message: "Something went wrong",
    });
  }
};

const listByCategories = async (req, res) => {
  try {
    const { category } = req.params;
    const products = Product.find({ category: category });
    if (!products) {
      return res
        .status(404)
        .json({ error: true, message: "category not found" });
    }
    return res.status(200).json({
      error: false,
      message: "products found",
      data: products,
    });
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      error: true,
      message: "Something went wrong",
    });
  }
};
const listAllProducts = CatchAsync(async (req, res) => {
  const products = Product.find();
  if (!products)
    return res
      .status(404)
      .json({ error: true, message: "No products availiable" });
  res.status(200).json({
    error: false,
    message: "products found",
    data: {
      products,
    },
  });
});

const listbyLatest = async (req, res) => {
  try {
    const products = Product.find({}).sort({ updatedAt: -1 });
    if (!products)
      return res
        .status(404)
        .json({ error: true, message: "product not found" });
    return res.status(200).json({
      error: false,
      message: "products found",
      data: products,
    });
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      error: true,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  uploadProductImage,
  resizeImage,
  createAProduct,
  productByID,
  updateProduct,
  listproductByShop,
  deleteProduct,
  listByCategories,
  listAllProducts,
  listbyLatest,
};
