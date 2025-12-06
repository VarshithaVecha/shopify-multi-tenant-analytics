const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Tenant = require("../models/Tenant");

exports.registerTenant = async (req, res) => {
  const { shopifyStore, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const tenant = await Tenant.create({ shopifyStore, email, password: hashed });
    res.json({ message: "Tenant registered", tenantId: tenant.id });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.loginTenant = async (req, res) => {
  const { email, password } = req.body;
  try {
    const tenant = await Tenant.findOne({ where: { email } });
    if (!tenant) return res.status(400).json({ error: "Tenant not found" });

    const match = await bcrypt.compare(password, tenant.password);
    if (!match) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: tenant.id, email: tenant.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, tenantId: tenant.id });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
