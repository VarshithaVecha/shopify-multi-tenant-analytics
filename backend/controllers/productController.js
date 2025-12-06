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

exports.createDummyProducts = async (req, res) => {
  try {
    const tenantId = req.tenant.id;

    await Product.bulkCreate([
      { tenantId, title: "T-Shirt", price: 499 },
      { tenantId, title: "Jeans", price: 899 },
      { tenantId, title: "Shoes", price: 1299 }
    ]);

    res.json({ message: "Dummy products created!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
