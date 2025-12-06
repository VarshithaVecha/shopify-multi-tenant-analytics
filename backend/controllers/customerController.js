// backend/controllers/customerController.js
const Customer = require("../models/Customer");
// const Tenant = require("../models/Tenant");
// const { fetchCustomers } = require("../utils/shopifyClient");

exports.getCustomers = async (req, res) => {
  try {
    const tenantId = Number(req.params.tenantId);
    if (req.tenant.id !== tenantId) return res.status(403).json({ error: "Forbidden" });

    const customers = await Customer.findAll({ where: { tenantId : req.tenant.id} });
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

exports.syncCustomers = async (req, res) => {
  // keep your sync implementation; ensure tenant check
  res.json({ message: "syncCustomers route (use existing function with tenant checks)" });
};
