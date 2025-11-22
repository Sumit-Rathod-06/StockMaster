import express from "express";
import {
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse
} from "../controllers/warehouse.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const warehouse_router = express.Router();

// Warehouse CRUD routes
warehouse_router.post("/", protect, createWarehouse);
warehouse_router.get("/", protect, getAllWarehouses);
warehouse_router.get("/:id", protect, getWarehouseById);
warehouse_router.put("/:id", protect, updateWarehouse);
warehouse_router.delete("/:id", protect, deleteWarehouse);

export default warehouse_router;
