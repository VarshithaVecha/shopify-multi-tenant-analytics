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
exports.createDummyCustomers = async (req, res) => {
  try {
    const tenantId = req.tenant.id;

    await Customer.bulkCreate([
      { tenantId, firstName: "John", lastName: "Doe", email: "john@example.com" },
      { tenantId, firstName: "Alice", lastName: "Smith", email: "alice@example.com" },
      { tenantId, firstName: "Sam", lastName: "Lee", email: "sam@example.com" }
    ]);

    res.json({ message: "Dummy customers created!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

