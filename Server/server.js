import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import auth_router from "./src/routes/auth.router.js";

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});