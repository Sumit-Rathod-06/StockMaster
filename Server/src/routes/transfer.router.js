import express from "express";
import {
  createTransfer,
  getAllTransfers,
  getTransferById,
  updateTransfer,
  completeTransfer
} from "../controllers/transfer.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const transfer_router = express.Router();

// Transfer CRUD routes
transfer_router.post("/", protect, createTransfer);
transfer_router.get("/", protect, getAllTransfers);
transfer_router.get("/:id", protect, getTransferById);
transfer_router.put("/:id", protect, updateTransfer);
transfer_router.post("/:id/complete", protect, completeTransfer);

export default transfer_router;
