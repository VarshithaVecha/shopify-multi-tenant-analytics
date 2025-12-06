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
app.use(cors());
app.use(express.json());

// Public (no auth)
app.use("/api/auth", authRoutes);

// Protected routes handled INSIDE each route file
app.use("/api", customerRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", metricsRoutes);

// Sync DB
sequelize.sync().then(() => {
  console.log("DB synced");
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
