// backend/controllers/orderController.js
const sequelize = require("../config/db");
const { Op, literal } = require("sequelize");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

// Create order: expects body { customerId, items: [{ productId, quantity }, ...] }
exports.createOrder = async (req, res) => {
  const tenantId = Number(req.params.tenantId);
  // security: ensure tenant in token matches route (if using auth middleware that sets req.tenant)
  if (req.tenant && req.tenant.id !== tenantId) return res.status(403).json({ error: "Forbidden" });

  const { customerId, items } = req.body;
  if (!customerId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "customerId and items required" });
  }

  const t = await sequelize.transaction();
  try {
    // fetch and validate customer
    const customer = await Customer.findOne({ where: { id: customerId, tenantId }, transaction: t });
    if (!customer) { await t.rollback(); return res.status(400).json({ error: "Invalid customer" }); }

    // compute total and validate product existence & inventory
    let totalPrice = 0;
    const enriched = []; // { product, qty, price }
    for (const it of items) {
      const product = await Product.findOne({ where: { id: it.productId, tenantId }, transaction: t });
      if (!product) { await t.rollback(); return res.status(400).json({ error: `Invalid product ${it.productId}` }); }

      const qty = Math.max(1, Number(it.quantity) || 1);

      if (product.inventory !== null && product.inventory < qty) {
        await t.rollback();
        return res.status(400).json({ error: `Not enough inventory for ${product.title}` });
      }

      const linePrice = Number(product.price || 0) * qty;
      totalPrice += linePrice;
      enriched.push({ product, qty, price: Number(product.price || 0) });
    }

    // create Order
    const order = await Order.create({ tenantId, customerId, totalPrice, status: "Completed" }, { transaction: t });

    // create OrderItems and reduce inventory
    for (const ei of enriched) {
      await OrderItem.create({
        orderId: order.id,
        productId: ei.product.id,
        quantity: ei.qty,
        price: ei.price
      }, { transaction: t });

      if (ei.product.inventory !== null) {
        ei.product.inventory -= ei.qty;
        await ei.product.save({ transaction: t });
      }
    }

    // update customer's totalSpent
    customer.totalSpent = (Number(customer.totalSpent || 0) + totalPrice);
    await customer.save({ transaction: t });

    await t.commit();

    // return full populated order
    const full = await Order.findByPk(order.id, {
      include: [
        { model: Customer, as: "customer" },
        { model: OrderItem, as: "items", include: [{ model: Product }] }
      ]
    });

    return res.status(201).json(full);
  } catch (err) {
    await t.rollback();
    console.error("createOrder error:", err);
    return res.status(500).json({ error: "Failed to create order" });
  }
};

// Get all orders for a tenant
exports.getOrders = async (req, res) => {
  try {
    const tenantId = Number(req.params.tenantId);
    if (req.tenant && req.tenant.id !== tenantId) return res.status(403).json({ error: "Forbidden" });

    const orders = await Order.findAll({
      where: { tenantId : req.tenant.id},
      include: [
        { model: Customer, as: "customer" },
        { model: OrderItem, as: "items", include: [{ model: Product }] }
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (err) {
    console.error("getOrders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Overview: customers, orders, revenue
exports.getOverview = async (req, res) => {
  try {
    const tenantId = Number(req.params.tenantId);
    const customers = await Customer.count({ where: { tenantId } });
    const orders = await Order.count({ where: { tenantId } });
    const revenueRaw = await Order.sum("totalPrice", { where: { tenantId } });
    res.json({ customers, orders, revenue: Number(revenueRaw || 0) });
  } catch (err) {
    console.error("getOverview error:", err);
    res.status(500).json({ error: "Failed to fetch overview" });
  }
};

// Revenue grouped by date between from & to query parameters (YYYY-MM-DD)
exports.getOrdersByDate = async (req, res) => {
  try {
    const tenantId = Number(req.params.tenantId);
    const { from, to } = req.query;
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const rows = await Order.findAll({
      where: { tenantId, createdAt: { [Op.between]: [fromDate, toDate] } },
      attributes: [
        [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
        [sequelize.fn("SUM", sequelize.col("totalPrice")), "revenue"]
      ],
      group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
      order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]]
    });

    const data = rows.map(r => ({ date: r.dataValues.date, revenue: Number(r.dataValues.revenue || 0) }));
    res.json(data);
  } catch (err) {
    console.error("getOrdersByDate error:", err);
    res.status(500).json({ error: "Failed to fetch orders by date" });
  }
};

// Top 5 customers by totalSpent
exports.getTopCustomers = async (req, res) => {
  try {
    const tenantId = Number(req.params.tenantId);
    const rows = await Customer.findAll({
      where: { tenantId },
      order: [["totalSpent", "DESC"]],
      limit: 5
    });

    res.json(
      rows.map(c => ({
        id: c.id,
        name: `${c.firstName || ""} ${c.lastName || ""}`.trim(),
        total: Number(c.totalSpent || 0)
      }))
    );
  } catch (err) {
    console.error("getTopCustomers error:", err);
    res.status(500).json({ error: "Failed to fetch top customers" });
  }
};
exports.deleteOrder = async (req, res) => {
  try {
    const { tenantId, orderId } = req.params;

    // Find the order to know how much to reduce
    const order = await Order.findOne({ where: { id: orderId, tenantId } });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the customer
    const customer = await Customer.findOne({
      where: { id: order.customerId, tenantId }
    });

    if (customer) {
      // Reduce customer totalSpent
      customer.totalSpent = Number(customer.totalSpent || 0) - Number(order.totalPrice || 0);

      // Ensure it doesn't go below 0
      if (customer.totalSpent < 0) customer.totalSpent = 0;

      await customer.save();
    }

    // Now delete the order
    await Order.destroy({
      where: { id: orderId, tenantId }
    });

    res.status(200).json({ message: "Order deleted and totals updated successfully" });

  } catch (error) {
    console.error("deleteOrder error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

