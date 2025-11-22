import express from "express";
import {
  createAdjustment,
  getAllAdjustments,
  getAdjustmentById,
  getAdjustmentsByReason,
  getProductAdjustmentHistory,
  getWarehouseAdjustmentHistory,
  getStockLedger
} from "../controllers/adjustment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const adjustment_router = express.Router();

// Adjustment CRUD routes
adjustment_router.post("/", protect, createAdjustment);
adjustment_router.get("/", protect, getAllAdjustments);
adjustment_router.get("/by-reason", protect, getAdjustmentsByReason);

// Stock Ledger route - MUST come before /:id
adjustment_router.get("/ledger", protect, getStockLedger);

// Adjustment history routes - MUST come before /:id to avoid conflicts
adjustment_router.get("/product/:product_id", protect, getProductAdjustmentHistory);
adjustment_router.get("/warehouse/:warehouse_id", protect, getWarehouseAdjustmentHistory);

// Dynamic ID route - MUST be last to avoid catching named routes
adjustment_router.get("/:id", protect, getAdjustmentById);

export default adjustment_router;
