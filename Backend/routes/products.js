const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET products (optionally by category)
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    let query = "SELECT * FROM products";
    let values = [];

    if (category) {
      query += " WHERE category = $1";
      values.push(category);
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Products route error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
