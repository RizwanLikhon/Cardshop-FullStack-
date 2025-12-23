const express = require("express");
const router = express.Router();
const path = require("path");

const products = require("../data/products.json");

router.get("/", (req, res) => {
  res.json(products);
});

module.exports = router;
