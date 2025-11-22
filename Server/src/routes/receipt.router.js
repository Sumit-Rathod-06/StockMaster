import express from "express";
import {
  createReceipt,
  getAllReceipts,
  getReceiptById,
  updateReceipt,
  addReceiptLine,
  updateReceiptLine,
  deleteReceiptLine,
  receiveReceipt
} from "../controllers/receipt.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const receipt_router = express.Router();

// Receipt CRUD routes
receipt_router.post("/", protect, createReceipt);
receipt_router.get("/", protect, getAllReceipts);
receipt_router.get("/:id", protect, getReceiptById);
receipt_router.put("/:id", protect, updateReceipt);
receipt_router.post("/:id/receive", protect, receiveReceipt);

// Receipt lines routes
receipt_router.post("/:receipt_id/lines", protect, addReceiptLine);
receipt_router.put("/lines/:line_id", protect, updateReceiptLine);
receipt_router.delete("/lines/:line_id", protect, deleteReceiptLine);

export default receipt_router;
