const User = require("../models/User-model");
const Shop = require("../models/shop.model");
const Product = require("../models/product.model");
const multer = require("multer");
const sharp = require("sharp");
const CatchAsync = require("../utils/catch-async");

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

const uploadShopImage = uploadImage.single("image");

const resizeImage = CatchAsync(async (req, res, next) => {
  if (req.file) {
    let timeStamp = Date.now();
    let id = req.params.id;
    let storeName;
    if (id) {
      const store = await Shop.findById(id);
      if (!store) {
        return next(
          new ErrorObject(`There is no store with the is ${req.params.id}`, 400)
        );
      }
      storeName = `${store.name}-${timeStamp}.jpeg`;
    }
    storeName = `${req.body.name}-${timeStamp}.jpeg`;
    req.body.image = storeName;

    await sharp(req.file.buffer)
      .resize(320, 240)
      .toFormat("jpeg")
      .jpeg({ quality: 80 })
      .toFile(`public/storeImage/${storeName}`);
  }

  next();
});

const createShop = CatchAsync(async (req, res, next) => {
  const { name, description, image } = req.body;
  // const { userID } = req.params;
  // const shopOwner = await User.findById(userID);
  const shopExists = await Shop.findOne({ name: name });
  if (shopExists) {
    return res.status(409).json({
      error: true,
      message: `a shop with this name ${shopExists.name} already exist`,
    });
  }

  // create a new shop
  let id = req.user._id;
  const newStore = await Shop.create({
    name,
    description,
    owner: id,
    image,
  });
  if (newStore) {
    return res.status(200).json({
      error: false,
      message: "Your shop has been created successfully",
      data: { newStore },
    });
  } else {
    return res.status(400).json({
      error: true,
      message: "Bad request",
    });
  }
});

const editShop = CatchAsync(async (req, res, next) => {
  // only shop owners can edit the store
  const { name, description, image } = req.body;
  const { shopID } = req.params;
  const userID = req.user._id;
  const storeToBeUpdated = await Shop.findById(shopID);
  // validate the owner of the store (only store owners can delete store)
  const validStoreOwner = await User.findById(userID);
  // !validStoreOwner ||
  if (validStoreOwner._id !== storeToBeUpdated.owner) {
    return res
      .status(401)
      .json({ error: true, message: "unauthorized access" });
  }
  const updatedShop = await Shop.findByIdAndUpdate(
    shopID,
    { name, description, image },
    { new: true }
  );

  if (updatedShop) {
    return res.status(200).json({
      error: false,
      message: "update successful",
      data: updatedShop,
    });
  } else {
    return res.status(404).json({ error: true, message: "shop not found" });
  }
});

const getShopByName = CatchAsync(async (req, res, next) => {
  // everybody can get the store
  const { name } = req.query;
  const shop = await Shop.find({ name });
  if (shop) {
    return res.status(200).json({
      error: false,
      message: "shop found",
      data: {
        shop,
      },
    });
  } else {
    return res.status(404).json({ error: true, message: "shop not found" });
  }
});

const getAllShops = CatchAsync(async (req, res, next) => {
  // everybody can get the store
  const shops = await Shop.find();
  if (shops) {
    return res.status(200).json({
      error: false,
      message: "Stores Availble",
      data: {
        shops,
      },
    });
  } else {
    return res
      .status(404)
      .json({ error: true, message: "No stores availiable" });
  }
});

const deleteShop = async (req, res) => {
  const { shopID } = req.params;
  const userID = req.user._id;
  //  check if shop to be deleted exists
  const storeToBeDeleted = await Shop.findById(shopID);
  if (!storeToBeDeleted) {
    return res.status(404).json({ error: true, message: "shop not found" });
  }
  // validate the owner of the store (only store owners can delete store)
  const validStoreOwner = await User.findById(userID);
  if (req.user.role !== "admin") {
    if (!validStoreOwner || validStoreOwner._id !== storeToBeDeleted.owner) {
      return res
        .status(401)
        .json({ error: true, message: "unauthorized access" });
    }
  }
  await Shop.findByIdAndDelete(shopID);
  res.status(204).json({
    status: "success",
  });
};

module.exports = {
  createShop,
  editShop,
  getShopByName,
  getAllShops,
  uploadShopImage,
  resizeImage,
  deleteShop,
};
