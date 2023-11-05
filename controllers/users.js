import { User } from "../models/users.js";
import bcrypt from "bcrypt";
import ErrorHandler from "../middlewares/errorHandler.js";
import { setCookie } from "../utils/cookieSetter.js";
import { UserClass } from "../utils/forgotPass.js";
import crypto from "crypto";

export const createUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });

    if (user) return next(new ErrorHandler("User already Exists", 400));

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({ ...req.body, password: hashedPassword });

    setCookie(res, user, "User Created Successfully", 201);
  } catch (error) {
    console.log(error)
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return next(new ErrorHandler("Please Enter Email and Password", 400));

    const user = await User.findOne({ email }).select("+password");
    if (!user) return next(new ErrorHandler("Invalid email or password", 404));

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return next(new ErrorHandler("Invalid email or password", 401));

    setCookie(res, user, `Logged in as ${user.name}`, 200);
  } catch (error) {
    next(error);
  }
};

export const logoutUser = (req, res, next) => {
  try {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
        secure: process.env.NODE_ENV === "Development" ? false : true,
      })
      .json({
        success: true,
        user: req.user,
        message: "Logged Out",
      });
  } catch (error) {
    next(error);
  }
};

export const userDetails = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

//forgot password
export const forgotPassword = async (req, res, next) => {
  try {
    // Check if the user is logged in and get their email from the session or token
    const { email } = req.body;
    const loggedInUser = await User.findOne({ email });
    if (!loggedInUser) return next(new ErrorHandler("User not found", 404));

    // Create a new user instance for the logged-in user
    const userInstance = new UserClass(new User(loggedInUser));

    // Generate a password reset token
    const { token, tokenHash } = userInstance.generatePasswordResetToken();

    // Set the password reset token and its expiration date in the user document
    loggedInUser.resetPasswordToken = tokenHash;
    const expirationMs = 60 * 60 * 1000; // 1 hour in milliseconds
    loggedInUser.resetPasswordExpire = new Date().getTime() + expirationMs;
    await loggedInUser.save(); // Save the updated user document

    // Send a password reset email to the logged-in user's email address
    await userInstance.sendPasswordResetEmail(req, token);

    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully.",
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

//reset password
export const resetPassword = async (req, res, next) => {
  try {
    // Check if the user is logged in and get their email from the session or token
    const tokenHash = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return next(new ErrorHandler("Invalid token or token expired", 400));

    if (req.body.newPassword !== req.body.confirmPassword)
      return next(new ErrorHandler("Passwords do not match", 400));

    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    setCookie(res, user, "Password reset successfully", 200);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

//Admin
export const createEditor = async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body;

    if (password.length < 8)
      return next(
        new ErrorHandler("Password must be atleast 8 characters", 400)
      );

    let user = await User.findOne({ email });

    if (user) return next(new ErrorHandler("User already Exists", 400));

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      ...req.body,
      password: hashedPassword,
      role: "editor",
    });

    res
      .status(201)
      .json({ success: true, message: "Editor created successfully", user });
  } catch (error) {
    next(error);
  }
};

//Admin - Delete Editor
export const deleteEditor = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the editor by their ID
    const editor = await User.findById(id);

    if (!editor) {
      return next(new ErrorHandler("Editor not found", 404));
    }

    // Check if the user to be deleted is an editor
    if (editor.role !== "editor") {
      return next(new ErrorHandler("Cannot delete a non-editor user", 400));
    }

    await User.findByIdAndDelete(id);

    // Respond with a success message
    res.status(200).json({
      success: true,
      message: "Editor deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
