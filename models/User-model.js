const { default: mongoose } = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "A user must have a name"],
    },
    email: {
      type: String,
      required: [true, "A user must have an email"],
      unique: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    phoneNumber: {
      type: Number,
      required: [true, "phone number is require"],
    },
    password: {
      type: String,
      required: [true, "A user must have an password"],
      select: false,
      minLength: [8, "Password must ba at least 8 characters"],
      validate: {
        validator: function (val) {
          return /^(?=.*[A-Z])(?=.*[a-z])(?=.*[\d])[A-Za-z\d]{8,}/.test(val);
        },
        message:
          "Password must contain at least a number, a lowercase and an uppercase alphabeth",
      },
    },
    confirmPassword: {
      type: String,
      required: [true, "A user must have an confirmPassword"],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "Password and confirm password are different",
      },
      select: false,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "storeOwner"],
    },
    passwordResetToken: String,
    passwordChangedAt: Date,
    passwordTokenExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  let salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    console.log(JWTTimestamp < this.passwordChangedAt);
    return JWTTimestamp < this.passwordChangedAt;
  }
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
