import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxLength: [30, "Your name cannot exceed 30 characters"],
  },
  department: {
    type: String,
    required: [true, "Please enter your department"],
    maxLength: [30, "You cannot exceed 30 characters"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    validate: [validator.isEmail, "Please enter a valid email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [8, "Your password should be atleast 8 characters"],
    select: false,
  },
  role: {
    type: String,
    default: "user",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

export const User = mongoose.model("User", userSchema);
