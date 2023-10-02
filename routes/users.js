import express from "express";
import {
  createEditor,
  createUser,
  deleteEditor,
  forgotPassword,
  loginUser,
  logoutUser,
  resetPassword,
  userDetails,
} from "../controllers/users.js";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

//User routes
router.get("/my",isAuthenticated, userDetails);
router.post("/new", createUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/password/reset", forgotPassword);
router.put("/password/reset/:token", resetPassword);

//Admin
router.post(
  "/admin/createeditor",
  isAuthenticated,
  authorizeRoles("admin"),
  createEditor
);
router.delete(
  "/admin/deleteeditor/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteEditor
);

export default router;
