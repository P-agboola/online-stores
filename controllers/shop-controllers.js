const User = require("../models/User-model");
const Store = require("../models/store-model");
const Product = require("../models/product-model");
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

const uploadStoreImage = uploadImage.single("image");

const resizeImage = CatchAsync(async (req, res, next) => {
  if (req.file) {
    let timeStamp = Date.now();
    let id = req.params.id;
    let storeName;
    if (id) {
      const store = await Store.findById(id);
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

const createStore = CatchAsync(async (req, res, next) => {
  const { name, description, image } = req.body;
  // const { userID } = req.params;
  // const storeOwner = await User.findById(userID);
  const storeExists = await Store.findOne({ name: name });
  if (storeExists) {
    return res.status(409).json({
      error: true,
      message: `a shop with this name ${storeExists.name} already exist`,
    });
  }
  // create a new shop
  let id = req.user._id;
  const newStore = await Store.create({
    name,
    description,
    owner: id,
    image,
  });
  if (newStore) {
    return res.status(200).json({
      error: false,
      message: "Your store has been created successfully",
      data: { newStore },
    });
  } else {
    return res.status(400).json({
      error: true,
      message: "Bad request",
    });
  }
});

const editStore = CatchAsync(async (req, res, next) => {
  // only store owners can edit the store
  const { name, description, image } = req.body;
  const { storeID } = req.params;
  const userID = req.user._id;
  const storeToBeUpdated = await Store.findById(storeID);
  // validate the owner of the store (only store owners can delete store)
  const validStoreOwner = await User.findById(userID);
  // !validStoreOwner ||
  if (validStoreOwner._id !== storeToBeUpdated.owner) {
    return res
      .status(401)
      .json({ error: true, message: "unauthorized access" });
  }
  const updatedStore = await Store.findByIdAndUpdate(
    storeID,
    { name, description, image },
    { new: true }
  );

  if (updatedStore) {
    return res.status(200).json({
      error: false,
      message: "update successful",
      data: updatedStore,
    });
  } else {
    return res.status(404).json({ error: true, message: "store not found" });
  }
});

const getStoreByName = CatchAsync(async (req, res, next) => {
  // everybody can get the store
  const { name } = req.query;
  const store = await Store.find({ name });
  if (store) {
    return res.status(200).json({
      error: false,
      message: "store found",
      data: {
        store,
      },
    });
  } else {
    return res.status(404).json({ error: true, message: "store not found" });
  }
});

const getAllStores = CatchAsync(async (req, res, next) => {
  let queriedStores = new QueryMethod(Store.find(), req.query)
  .sort()
  .filter()
  .limit()
  .paginate();
  let stores = await queriedStores.query
  if (stores) {
    return res.status(200).json({
      error: false,
      message: "Stores Availble",
      data: {
        stores,
      },
    });
  } else {
    return res
      .status(404)
      .json({ error: true, message: "No stores availiable" });
  }
});

const deleteStore = async (req, res) => {
  const { storeID } = req.params;
  const userID = req.user._id;
  //  check if shop to be deleted exists
  const storeToBeDeleted = await Shop.findById(storeID);
  if (!storeToBeDeleted) {
    return res.status(404).json({ error: true, message: "store not found" });
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
  await Store.findByIdAndDelete(storeID);
  res.status(204).json({
    status: "success",
  });
};

module.exports = {
  createStore,
  editStore,
  getStoreByName,
  getAllStores,
  uploadStoreImage,
  resizeImage,
  deleteStore,
};
