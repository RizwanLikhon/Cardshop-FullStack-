require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const checkoutRoute = require("./routes/checkout");

// Checkout API
app.use("/api/checkout", checkoutRoute);

app.use(cors());
app.use(express.json());

// Serve images from frontend
app.use("/images", express.static(path.join(__dirname, "../Frontend/images")));

// Test route
app.get("/", (req, res) => {
  res.send("Backend running");
});

// Products API
const productsRoute = require("./routes/products");
app.use("/api/products", productsRoute);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
