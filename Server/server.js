import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import auth_router from "./src/routes/auth.router.js";
import dashboard_router from "./src/routes/dashboard.js";
import product_router from "./src/routes/product.router.js";
import category_router from "./src/routes/category.router.js";
import receipt_router from "./src/routes/receipt.router.js";
import delivery_router from "./src/routes/delivery.router.js";
import adjustment_router from "./src/routes/adjustment.router.js";
import transfer_router from "./src/routes/transfer.router.js";
import warehouse_router from "./src/routes/warehouse.router.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
dotenv.config({path: "./src/config/.env"});

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  return res.status(200).send("Hello World!");
});

app.use('/api/auth', auth_router);
app.use('/api/dashboard', dashboard_router);
app.use('/api/products', product_router);
app.use('/api/categories', category_router);
app.use('/api/receipts', receipt_router);
app.use('/api/deliveries', delivery_router);
app.use('/api/adjustments', adjustment_router);
app.use('/api/transfers', transfer_router);
app.use('/api/warehouses', warehouse_router);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});