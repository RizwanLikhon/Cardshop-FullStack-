require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const Stripe = require("stripe");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

// ✅ test route
app.get("/", (req, res) => {
  res.send("Backend running");
});

// ✅ products route (already working)
const productsRoute = require("./routes/products");
app.use("/api/products", productsRoute);

// ✅ STRIPE CHECKOUT ROUTE (THIS WAS MISSING / BROKEN)
app.post("/api/checkout", async (req, res) => {
  try {
    const { cart } = req.body;

    if (!cart || !cart.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const line_items = cart.map(item => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [item.image]
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.qty
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: "http://localhost:5500/frontend/success.html",
      cancel_url: "http://localhost:5500/frontend/cancel.html"
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error("❌ STRIPE ERROR:", err.message);
    res.status(500).json({ error: "Stripe checkout failed" });
  }
});

// ✅ serve images correctly
app.use(
  "/images",
  express.static(path.join(__dirname, "../Frontend/images"))
);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
