// backend/controllers/metricsController.js
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const sequelize = require("../config/db");
const { Op } = require("sequelize");

// =======================
// OVERVIEW
// =======================
exports.overview = async (req, res) => {
  try {
    const tenantId = Number(req.params.tenantId);

    if (req.tenant.id !== tenantId)
      return res.status(403).json({ error: "Forbidden" });

    const customersCount = await Customer.count({ where: { tenantId } });
    const ordersCount = await Order.count({ where: { tenantId } });
    const revenueRes = await Order.findAll({
      where: { tenantId },
      attributes: [
        [sequelize.fn("SUM", sequelize.col("totalPrice")), "revenue"]
      ]
    });

    const revenue = Number(revenueRes[0].get("revenue") || 0);

    res.json({ customers: customersCount, orders: ordersCount, revenue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch overview" });
  }
};

// =======================
// ORDERS BY DATE (FOR CHART)
// =======================
exports.ordersByDate = async (req, res) => {
  try {
    const tenantId = Number(req.params.tenantId);

    if (req.tenant.id !== tenantId)
      return res.status(403).json({ error: "Forbidden" });

    const from = req.query.from
      ? new Date(req.query.from)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // last 30 days

    const to = req.query.to ? new Date(req.query.to) : new Date();

    const rows = await Order.findAll({
      where: {
        tenantId,
        createdAt: { [Op.between]: [from, to] }
      },
      attributes: [
        [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
        [sequelize.fn("SUM", sequelize.col("totalPrice")), "revenue"]
      ],
      group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
      order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]]
    });

    const data = rows.map(r => ({
      date: r.get("date"),
      revenue: Number(r.get("revenue"))
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders by date" });
  }
};

// =======================
// TOP CUSTOMERS
// =======================
exports.topCustomers = async (req, res) => {
  try {
    const tenantId = Number(req.params.tenantId);

    if (req.tenant.id !== tenantId)
      return res.status(403).json({ error: "Forbidden" });

    const limit = Number(req.query.limit) || 5;

    const rows = await Customer.findAll({
      where: { tenantId },
      order: [["totalSpent", "DESC"]],
      limit
    });

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch top customers" });
  }
};
