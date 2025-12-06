const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { getProducts, syncProducts } = require("../controllers/productController");

// protect product routes
router.use(auth);

router.get("/:tenantId/products", getProducts);
router.post("/:tenantId/products/sync", syncProducts);

module.exports = router;
