import { User } from "../models/users.js";
import ErrorHandler from "./errorHandler.js";
import jwt from "jsonwebtoken";

//Is logged in or not
export const isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token)
      return next(new ErrorHandler("Login first to access this resource", 401));

    const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);
    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    next(error);
  }
};

//Check for a paticular role
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new ErrorHandler(
          `Role (${req.user.role}) is not allowed to access this resource`,
          403
        )
      );
    next();
  };
};
