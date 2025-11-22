import express from "express";
import {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  updateDelivery,
  addDeliveryLine,
  updateDeliveryLine,
  deleteDeliveryLine,
  shipDelivery
} from "../controllers/delivery.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const delivery_router = express.Router();

// Delivery CRUD routes
delivery_router.post("/", protect, createDelivery);
delivery_router.get("/", protect, getAllDeliveries);
delivery_router.get("/:id", protect, getDeliveryById);
delivery_router.put("/:id", protect, updateDelivery);
delivery_router.post("/:id/ship", protect, shipDelivery);

// Delivery lines routes
delivery_router.post("/:delivery_id/lines", protect, addDeliveryLine);
delivery_router.put("/lines/:line_id", protect, updateDeliveryLine);
delivery_router.delete("/lines/:line_id", protect, deleteDeliveryLine);

export default delivery_router;
