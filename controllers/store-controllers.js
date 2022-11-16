const User = require("../models/User-model");
const Store = require("../models/store-model");
const Product = require("../models/product-model");
const multer = require("multer");

const CatchAsync = require("../utils/catch-async");
const cloudinary = require("cloudinary");
const QueryMethod = require("../utils/query.js");
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

const uploadStoreImage = uploadImage.single("image");

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

const resizeImage = CatchAsync(async (req, res, next) => {
  if (req.file) {
    // let user_id = req.user._id;
    let storeId = req.params.id;
    if (storeId) {
      const store = await Store.findById(id);
      if (!store) {
        return next(
          new ErrorObject(`There is no store with the is ${req.params.id}`, 400)
        );
      }
      storeName = `${store.name}`;
    }
    storeName = `${req.body.name}`;

    const result = await cloudinary.v2.uploader.upload(
      req.file.path,
      { public_id: `${storeName}` },
      function (error, result) {
        // console.log(result);
      }
    );
    StoreName = result.url;
    req.body.image = StoreName;
  }

  next();
});

const createStore = CatchAsync(async (req, res, next) => {
  const { name, description, image, phoneNumber, address } = req.body;
  // const { userID } = req.params;
  // const storeOwner = await User.findById(userID);
  const storeExists = await Store.findOne({ name: name });
  if (storeExists) {
    return res.status(400).json({
      error: true,
      message: `a Store with this name ${storeExists.name} already exist`,
    });
  }
  // create a new Store
  let id = req.user._id;
  const newStore = await Store.create({
    name,
    description,
    owner: id,
    image,
    phoneNumber,
    address,
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

const updateStore = CatchAsync(async (req, res, next) => {
  // only store owners can edit the store
  const { storeID } = req.params;
  const userID = req.user._id;
  const store = await Store.findById(storeID);
  // validate the owner of the store
  const validStoreOwner = await User.findById(userID);
  if (req.user.role !== "admin") {
    if (validStoreOwner._id.toString() !== store.owner.toString()) {
      return res
        .status(401)
        .json({ error: true, message: "unauthorized access" });
    }
  }
  const name = req.body.name === undefined ? store.name : req.body.name;
  const description =
    req.body.description === undefined
      ? store.description
      : req.body.description;
  const image = req.body.image === undefined ? store.image : req.body.image;
  const address =
    req.body.address === undefined ? store.address : req.body.address;
  const phoneNumber =
    req.body.phoneNumber === undefined
      ? store.phoneNumber
      : req.body.phoneNumber;
  const updateStore = { name, description, phoneNumber, image, address };
  const updatedStore = await Store.findByIdAndUpdate(storeID, updateStore, {
    new: true,
  });

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

// get one store
const getOnestore = CatchAsync(async (req, res, next) => {
  const { storeID } = req.params;
  const store = await Store.findById(storeID);
  if (!store) {
    return next(
      new ErrorObject(`There is no store with the id ${storeID}`, 400)
    );
  }
  res.status(200).json({
    status: "success",
    data: {
      store,
    },
  });
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
  let stores = await queriedStores.query;
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

const deleteStore = CatchAsync(async (req, res) => {
  const { storeID } = req.params;
  const userID = req.user._id;
  //  check if Store to be deleted exists
  const storeToBeDeleted = await Store.findById(storeID);
  if (!storeToBeDeleted) {
    return res.status(404).json({ error: true, message: "store not found" });
  }
  // validate the owner of the store (only store owners can delete store)
  const validStoreOwner = await User.findById(userID);
  if (req.user.role !== "admin") {
    if (
      !validStoreOwner ||
      validStoreOwner._id.toString() !== storeToBeDeleted.owner.toString()
    ) {
      return res
        .status(401)
        .json({ error: true, message: "unauthorized access" });
    }
  }
  await Store.findByIdAndDelete(storeID);
  res.status(204).json({
    status: "success",
    message: "Store deleted",
  });
});

module.exports = {
  createStore,
  updateStore,
  getStoreByName,
  getOnestore,
  getAllStores,
  uploadStoreImage,
  resizeImage,
  deleteStore,
};
