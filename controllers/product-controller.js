const User = require("../models/User-model");
const Store = require("../models/store-model");
const Product = require("../models/product-model");
const CatchAsync = require("../utils/catch-async");
const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("cloudinary");
const QueryMethod = require("../utils/query");
const ErrorObject = require("../utils/error");

const multerStorage = multer.diskStorage({});

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

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

const resizeImage = CatchAsync(async (req, res, next) => {
  if (req.file) {
    // let user_id = req.user._id;
    let timeStamp = Date.now();
    let productId = req.params.id;
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return next(
          new ErrorObject(
            `There is no product with the is ${req.params.id}`,
            400
          )
        );
      }
      productName = `${product.name}-${timeStamp}`;
    }
    productName = `${req.body.name}-${timeStamp}`;

    const result = await cloudinary.v2.uploader.upload(
      req.file.path,
      { public_id: `${productName}` },
      function (error, result) {
        console.log(result);
      }
    );
    ProductName = result.url;
    req.body.image = ProductName;
  }

  next();
});

const createAProduct = CatchAsync(async (req, res, next) => {
  const { name, image, description, category, quantity, price, store } =
    req.body;
  console.log(req.body);
  let userID = req.user._id;
  const storeOwner = await User.findById(userID);
  const productExists = await Product.findOne({ name });
  if (!storeOwner)
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
    let newProduct = await Product.create({
      name,
      image,
      description,
      category,
      quantity,
      price,
      store,
    });
    return res.status(200).json({
      error: false,
      message: "product added to your shop",
      data: { newProduct },
    });
  }
});

const getOneProduct = CatchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(
      new ErrorObject(`There is no product with the id ${req.params.id}`, 400)
    );
  }
  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

// updating products (either part or all aspect of the product)
const updateProduct = CatchAsync(async (req, res, next) => {
  // only store owners can edit the store
  const { storeID } = req.params;
  const userID = req.user._id;
  const store = await Store.findById(storeID);
  // validate the owner of the store
  const validStoreOwner = await User.findById(userID);
  // !validStoreOwner ||
  if (validStoreOwner._id.toString() !== store.owner.toString()) {
    return res
      .status(401)
      .json({ error: true, message: "unauthorized access" });
  }
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(
      new ErrorObject(`There is no product with the is ${req.params.id}`, 400)
    );
  }
  const name = req.body.name === undefined ? product.name : req.body.name;
  const description =
    req.body.description === undefined
      ? product.description
      : req.body.description;
  const price = req.body.price === undefined ? product.price : req.body.price;
  const quantity =
    req.body.quantity === undefined ? product.quntity : req.body.quantity;
  const image = req.body.image === undefined ? product.image : req.body.image;
  const category =
    req.body.category === undefined ? product.category : req.body.availaible;
  const update = { name, description, amount, quantity, image, category };
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true, runValidators: true }
  );
  res.status(200).json({
    status: "updated",
    data: { updatedProduct },
  });
});

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

const getAllProduct = CatchAsync(async (req, res, next) => {
  let queriedProducts = new QueryMethod(Product.find(), req.query)
    .sort()
    .filter()
    .limit()
    .paginate();
  if (!queriedProducts) {
    return res
      .status(404)
      .json({ error: true, message: "No products availiable" });
  }
  let products = await queriedProducts.query;
  res.status(200).json({
    status: "success",
    results: products.length,
    data: { products },
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
  getOneProduct,
  updateProduct,
  listproductByShop,
  deleteProduct,
  listByCategories,
  listbyLatest,
  getAllProduct,
};
