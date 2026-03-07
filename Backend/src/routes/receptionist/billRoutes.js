const express = require("express");
const router = express.Router();

const {
  generateBill,
  confirmPayment,
  getBills,
  getBillById
} = require("../../controllers/receptionist/billController");


// Receptionist generate bill
router.post("/generate", generateBill);

// confirm payment
router.post("/confirm-payment/:billId", confirmPayment);

// get all bills
router.get("/", getBills);

// get single bill
router.get("/:id", getBillById);

module.exports = router;