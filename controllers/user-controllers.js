const User = require("../models/User-model.js");
const CatchAsync = require("../utils/catch-async.js");
const ErrorObject = require("../utils/error.js");
const QueryMethod = require("../utils/query.js");

// Delete A User
exports.deleteUser = CatchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorObject(`There is no user with the id ${req.params.id}`, 400)
    );
  }
  if (req.user.role !== "admin") {
    if (req.user.id !== req.params.id) {
      return next(new ErrorObject("You are not authorised", 403));
    }
  }
  await User.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: "success",
  });
});

// Update A User
exports.updateUser = CatchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorObject(`There is no user with the id ${req.params.id}`, 400)
    );
  }
  if (req.user.id !== req.params.id) {
    return next(new ErrorObject("You are not authorised", 403));
  }
  const email = req.body.email === undefined ? user.email : req.body.email;
  const fullName =
    req.body.fullName === undefined ? user.fullName : req.body.fullName;
  const role = req.body.role === undefined ? user.role : req.body.role;
  const phoneNumber =
    req.body.phoneNumber === undefined
      ? user.phoneNumber
      : req.body.phoneNumber;
  const update = { email, fullName, phoneNumber, role };
  const updatedUser = await User.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

//  Get All Users
exports.getAllUser = CatchAsync(async (req, res, next) => {
  let queriedUsers = new QueryMethod(User.find(), req.query)
    .sort()
    .filter()
    .limit()
    .paginate();
  let users = await queriedUsers.query;
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

//  Get One User
exports.getOneUser = CatchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorObject(`There is no user with the id ${req.params.id}`, 400)
    );
  }
  if (req.user.role !== "admin") {
    if (req.user.id !== req.params.id) {
      return next(new ErrorObject("You are not authorised", 403));
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
