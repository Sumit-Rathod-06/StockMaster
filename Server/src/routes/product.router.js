import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getStockByLocation,
  getReorderingRules,
  updateReorderLevel
} from "../controllers/product.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const product_router = express.Router();

// More specific routes first (before :id routes)
product_router.get("/rules/reordering", protect, getReorderingRules);

// Product CRUD routes
product_router.post("/", protect, createProduct);
product_router.get("/", protect, getAllProducts);
product_router.get("/:product_id/stock-by-location", protect, getStockByLocation);
product_router.get("/:id", protect, getProductById);
product_router.put("/:id", protect, updateProduct);
product_router.delete("/:id", protect, deleteProduct);
product_router.put("/:id/reorder-level", protect, updateReorderLevel);

export default product_router;
