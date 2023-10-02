import express from "express";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
} from "../controllers/announcements.js";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/all", getAllAnnouncements);

//Admin
router.post(
  "/admin/create",
  isAuthenticated,
  authorizeRoles("admin"),
  createAnnouncement
);
router.delete(
  "/admin/delete/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteAnnouncement
);

export default router;
