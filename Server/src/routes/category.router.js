import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryHierarchy,
  getProductsByCategory
} from "../controllers/category.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const category_router = express.Router();

// More specific routes first (before :id routes)
category_router.get("/hierarchy", protect, getCategoryHierarchy);

// Category CRUD routes
category_router.post("/", protect, createCategory);
category_router.get("/", protect, getAllCategories);
category_router.get("/:id", protect, getCategoryById);
category_router.put("/:id", protect, updateCategory);
category_router.delete("/:id", protect, deleteCategory);
category_router.get("/:category_id/products", protect, getProductsByCategory);

export default category_router;
