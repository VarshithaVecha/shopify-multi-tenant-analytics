const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./config/db");

// import models
require("./models/Tenant");
require("./models/Customer");
require("./models/Product");
require("./models/Order");
require("./models/OrderItem");

// import routes
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const metricsRoutes = require("./routes/metricsRoutes");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://shopify-multi-tenant-analytics-eight.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());

// Public routes
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api", customerRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", metricsRoutes);

// Root check
app.get("/", (req, res) => {
  res.send("Backend Running");
});

// Sync DB (force resets table)
sequelize.sync()
  .then(() => console.log("Database synced"))
  .catch(err => console.log("DB Error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
