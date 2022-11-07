const Order = require("../models/Order-model");
const CatchAsync = require("../utils/catch-async");
const QueryMethod = require("../utils/query");
const express = require("express");
const cart = require("../models/Cart-model");
const Flutterwave = require("flutterwave-node-v3");
fs = require("fs");
const nodemailer = require("nodemailer");
const { FLW_PUBLIC_KEY, FLW_SECRET_KEY, FLW_ENCRPYTION_KEY } = process.env;

exports.getOrder = CatchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (req.user.id !== order.userId.toString()) {
    return next(new ErrorObject(`You are not authorized!!!!!!!`, 403));
  }

  res.status(200).json({
    status: "success",
    data: order,
  });
});

exports.getAllOrder = CatchAsync(async (req, res, next) => {
  let queriedOrders = new QueryMethod(Order.find(), req.query)
    .sort()
    .filter()
    .limit()
    .paginate();
  let orders = await queriedOrders.query;
  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});

exports.checkout = CatchAsync(async (req, res, next) => {
  const flw = new Flutterwave(FLW_PUBLIC_KEY, FLW_SECRET_KEY);
  const payload = {
    card_number: req.card_number,
    cvv: req.cvv,
    expiry_month: req.expiry_month,
    expiry_year: req.expiry_year,
    currency: "NGN",
    amount: req.amount,
    fullname: `${user.lastName} ${user.firstName}`,
    email: user.email,
    enckey: FLW_ENCRYPTION_KEY,
    tx_ref: `${user.lastName}-${Date.now()}-${req.amount}`,
  };

  const response = await flw.Charge.card(payload);
  // Authorizing transactions
  // For PIN transactions
  if (response.meta.authorization.mode === "pin") {
    let payload2 = payload;
    payload2.authorization = {
      mode: "pin",
      fields: ["pin"],
      pin: req.pin,
    };
    const reCallCharge = await flw.Charge.card(payload2);

    // Add the OTP to authorize the transaction
    const callValidate = await flw.Charge.validate({
      otp: "12345",
      flw_ref: reCallCharge.data.flw_ref,
    });
    res.status(200).json({
      staus: succesfully,
      message: " your payment is successful",
      order,
    });
  }
  return response;
});
