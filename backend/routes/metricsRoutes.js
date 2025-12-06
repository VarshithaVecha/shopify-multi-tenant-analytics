// backend/routes/metricsRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const metrics = require("../controllers/metricsController");

// protect all metrics routes
router.use(auth);

// Overview
router.get("/:tenantId/metrics/overview", metrics.overview);

// Revenue by date
router.get("/:tenantId/metrics/orders", metrics.ordersByDate);

// Top customers
router.get("/:tenantId/metrics/top-customers", metrics.topCustomers);

module.exports = router;
