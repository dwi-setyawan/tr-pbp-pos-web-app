import express from "express";
import { getSalesReport } from "../controllers/reportsController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, getSalesReport);

export default router;