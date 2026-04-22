const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const USER_ROLES = ["Admin", "SubAdmin", "User"];

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "User",
      index: true,
    },
    department: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    restricted: {
      type: Boolean,
      default: false,
    },
    printing: {
      quota: {
        remaining: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    },
    standing: {
      type: String,
      default: "Active",
    },
    ssoProvider: {
      type: String,
      default: "",
    },
    ssoExternalId: {
      type: String,
      default: "",
      index: true,
    },
    lastActivity: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.setPassword = async function setPassword(password) {
  const saltRounds = 10;
  this.passwordHash = await bcrypt.hash(password, saltRounds);
};

userSchema.methods.validatePassword = async function validatePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const quota = this.printing?.quota?.remaining ?? 0;

  return {
    id: this._id.toString(),
    username: this.username,
    fullName: this.fullName,
    email: this.email,
    role: this.role,
    department: this.department,
    phone: this.phone,
    restricted: this.restricted,
    printing: this.printing,
    quota,
    balance: quota,
    standing: this.standing,
    lastActivity: this.lastActivity,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = {
  User: mongoose.model("User", userSchema),
  USER_ROLES,
};
