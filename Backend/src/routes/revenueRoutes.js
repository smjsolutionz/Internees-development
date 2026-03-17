const express = require("express");
const router = express.Router();
const { getRevenueReport } = require("../controllers/revenueController");

router.get("/report", getRevenueReport);

module.exports = router;