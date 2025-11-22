import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/database.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "1d",
  });
};

const register = async (req, res) => {
  const { loginId, emailId, password, role } = req.body;
  console.log(req.body);
  try {
    // Validate required fields
    if (!loginId || !emailId || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: loginId, emailId, password, role"
      });
    }

    const userExists = await db.query("SELECT * FROM users WHERE email = $1", [
      emailId,
    ]);
    if (userExists.rows.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users(id, email, password_hash, role )
      VALUES($1, $2, $3, $4) RETURNING *;
    `;
    const values = [
      loginId,
      emailId,
      password_hash,
      role
    ];
    const { rows } = await db.query(query, values);
    const newUser = rows[0];

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: newUser,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during registration" });
  }
};

const login = async (req, res) => {
  const { loginId, password } = req.body;
  try {
    // Validate required fields
    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: "LoginId and password are required"
      });
    }

    const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [
      loginId,
    ]);
    const user = rows[0];

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      res.json({
        success: true,
        token: generateToken(user.id),
        user: { id: user.id, email: user.email, role: user.role },
      });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Invalid login ID or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during login" });
  }
};



export { register, login };
