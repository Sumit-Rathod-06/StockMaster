import express from "express";
import {
  createAdjustment,
  getAllAdjustments,
  getAdjustmentById,
  getAdjustmentsByReason,
  getProductAdjustmentHistory,
  getWarehouseAdjustmentHistory
} from "../controllers/adjustment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const adjustment_router = express.Router();

// Adjustment CRUD routes
adjustment_router.post("/", protect, createAdjustment);
adjustment_router.get("/", protect, getAllAdjustments);
adjustment_router.get("/by-reason", protect, getAdjustmentsByReason);
adjustment_router.get("/:id", protect, getAdjustmentById);

// Adjustment history routes
adjustment_router.get("/product/:product_id", protect, getProductAdjustmentHistory);
adjustment_router.get("/warehouse/:warehouse_id", protect, getWarehouseAdjustmentHistory);

export default adjustment_router;
