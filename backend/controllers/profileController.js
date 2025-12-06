const Tenant = require("../models/Tenant");
const bcrypt = require("bcryptjs");

exports.getProfile = async (req, res) => {
  res.json({
    id: req.tenant.id,
    email: req.tenant.email,
    shopifyStore: req.tenant.shopifyStore
  });
};

exports.updateProfile = async (req, res) => {
  const { email, shopifyStore, password } = req.body;
  const tenant = await Tenant.findByPk(req.tenant.id);

  if (!tenant) return res.status(404).json({ error: "Tenant not found" });

  tenant.email = email;
  tenant.shopifyStore = shopifyStore;

  if (password && password.trim() !== "") {
    tenant.password = await bcrypt.hash(password, 10);
  }

  await tenant.save();
  res.json({ message: "Profile updated" });
};
