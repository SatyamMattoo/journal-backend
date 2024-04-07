import express from "express";
import {
  assignArticleToEditor,
  createArticle,
  getArticlesForIssue,
  getAssignedArticles,
  getEditors,
  getPreviousArticles,
  publishArticle,
  publishedArticles,
  readyToPublish,
  resubmission,
  sendToPublish,
  submittedArticles,
  trackProgress,
  underreviewArticles,
} from "../controllers/articles.js";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.js";
import { upload } from "../utils/docUpload.js";

const router = express.Router();

//All Users
router.get("/published", publishedArticles);
router.get("/editors", getEditors);

//Signed in Users
router.post("/track", isAuthenticated, trackProgress);
router.post(
  "/submit",
  isAuthenticated,
  upload.single("pdfFile"),
  createArticle
);

//Admin
router.post(
  "/admin/assigneditor/:articleId/:editorId",
  isAuthenticated,
  authorizeRoles("admin"),
  assignArticleToEditor
);
router.get(
  "/admin/submitted",
  isAuthenticated,
  authorizeRoles("admin"),
  submittedArticles
);
router.get(
  "/admin/underreview",
  isAuthenticated,
  authorizeRoles("admin"),
  underreviewArticles
);
router.get(
  "/admin/readytopublish",
  isAuthenticated,
  authorizeRoles("admin"),
  readyToPublish
);
router.put(
  "/admin/publisharticle/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  publishArticle
);

//Editor Roles
router.get(
  "/editor/assigned",
  isAuthenticated,
  authorizeRoles("editor"),
  getAssignedArticles
);
router.get(
  "/editor/previous",
  isAuthenticated,
  authorizeRoles("editor"),
  getPreviousArticles
);
router.put(
  "/editor/resubmission/:id",
  isAuthenticated,
  authorizeRoles("editor"),
  resubmission
);
router.put(
  "/editor/sendtopublish/:id",
  isAuthenticated,
  authorizeRoles("editor"),
  sendToPublish
);

//All users
router.get("/volume/:volumeNumber/:issueNumber", getArticlesForIssue);

export default router;
