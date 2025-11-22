import express from "express";
import {
  getTotalProductsInStock,
  getLowStockItems,
  getPendingReceipts,
  getPendingDeliveries,
  getScheduledTransfers,
  getAllKPIs
} from "../controllers/dashboard.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const dashboard_router = express.Router();

// Dashboard KPI Routes
dashboard_router.route('/kpis').get(protect, getAllKPIs);
dashboard_router.route('/total-products').get(protect, getTotalProductsInStock);
dashboard_router.route('/low-stock').get(protect, getLowStockItems);
dashboard_router.route('/pending-receipts').get(protect, getPendingReceipts);
dashboard_router.route('/pending-deliveries').get(protect, getPendingDeliveries);
dashboard_router.route('/scheduled-transfers').get(protect, getScheduledTransfers);

export default dashboard_router;