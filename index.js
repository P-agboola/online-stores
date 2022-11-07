const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const { model } = require("mongoose");
const ErrorObject = require("./utils/error");
const productRouter = require("./routes/product-routes");
const userRouter = require("./routes/user-routes");
const cartRouter = require("./routes/cart-routes");
const orderRoutes = require("./routes/order-routes");
const shopRoutes = require("./routes/shop-routes");

app.use(express.json());
app.use(cors());

let accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a",
});
// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/carts", cartRouter);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/stores", shopRoutes);

app.all("*", (req, res, next) => {
  const err = new ErrorObject(`http:localhost:6000${req.url} not found`, 404);
  next(err);
});

app.use(ErrorObject);

module.exports = app;
