const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { registerTenant, loginTenant } = require("../controllers/authController");
const profile = require("../controllers/profileController");

router.post("/register", registerTenant);
router.post("/login", loginTenant);

router.get("/me/:tenantId", auth, profile.getProfile);
router.put("/me/:tenantId", auth, profile.updateProfile);

module.exports = router;
