const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// TEST ROUTE (must work)
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// PRODUCTS ROUTE
const productsRoute = require("./routes/products");
app.use("/api/products", productsRoute);

// START SERVER
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
