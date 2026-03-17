const Product = require("../models/Product");
const StockHistory = require("../models/StockHistory");

/* =========================
   Helpers
========================= */
const isInventoryManager = (role) => role === "INVENTORY_MANAGER";
const isManager = (role) => role === "MANAGER";
const isAdmin = (role) => role === "ADMIN";

/* =========================
   Product CRUD
========================= */

// Inventory Manager: create product
exports.createProduct = async (req, res) => {
  try {
    if (!isInventoryManager(req.user.role)) {
      return res.status(403).json({ message: "Only Inventory Manager can add products" });
    }

    const { name, category, currentStock = 0, minimumStock = 10 } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: "Name and category are required" });
    }

    const product = await Product.create({
      name,
      category,
      currentStock,
      minimumStock,
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error("createProduct error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// All roles: list products (with search/filter)
exports.listProducts = async (req, res) => {
  try {
    const { search, category, status } = req.query;

    const filter = { isActive: true };
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (category) {
      filter.category = category;
    }
    if (status && ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"].includes(status)) {
      filter.status = status;
    }

    const products = await Product.find(filter).sort({ name: 1 }).lean();
    res.status(200).json({ success: true, products });
  } catch (err) {
    console.error("listProducts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Inventory Manager: update product
exports.updateProduct = async (req, res) => {
  try {
    if (!isInventoryManager(req.user.role)) {
      return res.status(403).json({ message: "Only Inventory Manager can update products" });
    }

    const { id } = req.params;
    const { name, category, minimumStock, isActive } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (minimumStock !== undefined) product.minimumStock = minimumStock;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();
    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error("updateProduct error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Inventory Manager: delete product (soft delete)
exports.deleteProduct = async (req, res) => {
  try {
    if (!isInventoryManager(req.user.role)) {
      return res.status(403).json({ message: "Only Inventory Manager can delete products" });
    }

    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.isActive = false;
    await product.save();

    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("deleteProduct error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   Stock In / Stock Out
========================= */

// Stock In - Inventory Manager only
exports.stockIn = async (req, res) => {
  try {
    if (!isInventoryManager(req.user.role)) {
      return res.status(403).json({ message: "Only Inventory Manager can add stock" });
    }

    const { productId, quantity, reason = "PURCHASE" } = req.body;
    const qty = Number(quantity);
    if (!productId || !qty || qty <= 0) {
      return res.status(400).json({ message: "Valid productId and quantity required" });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    const beforeStock = product.currentStock;
    product.currentStock = beforeStock + qty;
    await product.save();

    await StockHistory.create({
      product: product._id,
      type: "IN",
      quantity: qty,
      reason,
      beforeStock,
      afterStock: product.currentStock,
      createdBy: req.user.id,
    });

    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error("stockIn error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Stock Out - Inventory Manager + Manager
exports.stockOut = async (req, res) => {
  try {
    if (!isInventoryManager(req.user.role) && !isManager(req.user.role)) {
      return res.status(403).json({ message: "Not allowed to reduce stock" });
    }

    const { productId, quantity, reason } = req.body;
    const qty = Number(quantity);
    if (!productId || !qty || qty <= 0) {
      return res.status(400).json({ message: "Valid productId and quantity required" });
    }

    if (!["SERVICE_USAGE", "DAMAGE", "ADJUSTMENT"].includes(reason)) {
      return res
        .status(400)
        .json({ message: "Reason must be SERVICE_USAGE, DAMAGE or ADJUSTMENT" });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    const beforeStock = product.currentStock;
    if (beforeStock < qty) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    product.currentStock = beforeStock - qty;
    await product.save();

    await StockHistory.create({
      product: product._id,
      type: "OUT",
      quantity: qty,
      reason,
      beforeStock,
      afterStock: product.currentStock,
      createdBy: req.user.id,
    });

    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error("stockOut error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   Stock History
========================= */

// Inventory Manager + Manager + Admin (read-only)
exports.getStockHistory = async (req, res) => {
  try {
    const role = req.user.role;
    if (!isInventoryManager(role) && !isManager(role) && !isAdmin(role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { productId, type, startDate, endDate } = req.query;

    const filter = {};
    if (productId) filter.product = productId;
    if (type && ["IN", "OUT"].includes(type)) filter.type = type;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const history = await StockHistory.find(filter)
      .sort({ createdAt: -1 })
      .limit(500)
      .populate("product", "name category")
      .populate("createdBy", "name role")
      .lean();

    res.status(200).json({ success: true, history });
  } catch (err) {
    console.error("getStockHistory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   Dashboard Stock Overview
========================= */

exports.getStockOverview = async (req, res) => {
  try {
    const role = req.user.role;
    if (!isInventoryManager(role) && !isManager(role) && !isAdmin(role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const [lowStock, outOfStock, totalProducts] = await Promise.all([
      Product.countDocuments({ isActive: true, status: "LOW_STOCK" }),
      Product.countDocuments({ isActive: true, status: "OUT_OF_STOCK" }),
      Product.countDocuments({ isActive: true }),
    ]);

    res.status(200).json({
      success: true,
      overview: {
        lowStock,
        outOfStock,
        totalProducts,
      },
    });
  } catch (err) {
    console.error("getStockOverview error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

