const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { getCustomers, syncCustomers } = require("../controllers/customerController");

// protect customer routes (so controllers can safely use req.tenant)
router.use(auth);

router.get("/:tenantId/customers", getCustomers);
router.post("/:tenantId/customers/sync", syncCustomers);

module.exports = router;
