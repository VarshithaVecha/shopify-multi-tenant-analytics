const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");

const {
  createOrder,
  getOrders,
  getOverview,
  getOrdersByDate,
  getTopCustomers,
  deleteOrder,
} = require("../controllers/orderController");

// Protect all routes
router.use(auth);

// Get all orders
router.get("/:tenantId/orders", getOrders);

// Create order
router.post("/:tenantId/orders", createOrder);

// DELETE order
router.delete("/:tenantId/orders/:orderId", deleteOrder);

// Dashboard metrics APIs
router.get("/:tenantId/overview", getOverview);
router.get("/:tenantId/revenue", getOrdersByDate);
router.get("/:tenantId/top-customers", getTopCustomers);

module.exports = router;
