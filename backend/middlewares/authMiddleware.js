// backend/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const Tenant = require("../models/Tenant");

module.exports = async function (req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });
  const token = auth.replace("Bearer ", "");
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    // data contains token payload; we expect token to include tenant id or user id
    // We stored tenant.id as token payload earlier (id: tenant.id)
    const tenant = await Tenant.findByPk(data.id);
    if (!tenant) return res.status(401).json({ error: "Invalid tenant token" });

    // attach tenant and token data
    req.tenant = { id: tenant.id, email: tenant.email, shopifyStore: tenant.shopifyStore, accessToken: tenant.accessToken };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
