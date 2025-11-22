import pg from 'pg';
import dotenv from "dotenv";

dotenv.config({path: "./src//config/.env"});

const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(() => console.log("PostgreSQL connected"))
  .catch((err) => console.error("PostgreSQL connection error:", err.message));

export default pool;