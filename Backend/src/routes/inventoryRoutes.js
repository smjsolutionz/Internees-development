const express = require("express");
const router = express.Router();
const { adminRequireAuth } = require("../middleware/adminAuth.middleware");
const { authorize } = require("../middleware/authorize");

const {
  createProduct,
  listProducts,
  updateProduct,
  deleteProduct,
  stockIn,
  stockOut,
  getStockHistory,
  getStockOverview,
} = require("../controllers/inventoryController");

// All inventory routes require admin auth
router.use(adminRequireAuth);

// Product list: Inventory Manager (full), Manager/Admin (view)
router.get(
  "/products",
  authorize("INVENTORY_MANAGER", "MANAGER", "ADMIN"),
  listProducts
);

// Product CRUD: Inventory Manager only
router.post("/products", authorize("INVENTORY_MANAGER"), createProduct);
router.patch("/products/:id", authorize("INVENTORY_MANAGER"), updateProduct);
router.delete("/products/:id", authorize("INVENTORY_MANAGER"), deleteProduct);

// Stock In / Out
router.post("/stock-in", authorize("INVENTORY_MANAGER"), stockIn);
router.post("/stock-out", authorize("INVENTORY_MANAGER", "MANAGER"), stockOut);

// Stock History: Inventory Manager + Manager + Admin
router.get(
  "/history",
  authorize("INVENTORY_MANAGER", "MANAGER", "ADMIN"),
  getStockHistory
);

// Stock overview for dashboards
router.get(
  "/overview",
  authorize("INVENTORY_MANAGER", "MANAGER", "ADMIN"),
  getStockOverview
);

module.exports = router;

