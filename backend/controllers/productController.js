// backend/controllers/productController.js
const Product = require("../models/Product");

exports.getProducts = async (req, res) => {
  try {
    const tenantId = Number(req.params.tenantId);
    if (req.tenant.id !== tenantId) return res.status(403).json({ error: "Forbidden" });

    const products = await Product.findAll({ where: { tenantId : req.tenant.id} });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// simple sync function if needed can be kept/modified
exports.syncProducts = async (req, res) => {
  // optional: use existing implementation but ensure tenant checks
  res.json({ message: "syncProducts not implemented in this file (optional)" });
};
