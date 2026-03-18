const express = require("express");
const router = express.Router();

const {
  generateBill,
  addServiceToBill,
  confirmPayment,
  getBills,
  getBillById
} = require("../../controllers/receptionist/billController");

router.post("/generate", generateBill);
router.post("/add-service/:billId", addServiceToBill);
router.post("/confirm-payment/:billId", confirmPayment);
router.get("/", getBills);
router.get("/:id", getBillById);

module.exports = router;