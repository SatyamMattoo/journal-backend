import express from "express";
import { allVolumes } from "../controllers/volumes.js";

const router = express.Router();

router.get("/all", allVolumes);

export default router;