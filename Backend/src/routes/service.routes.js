import express from "express";
import upload from "../middleware/upload.middleware.js";
import {
  createService,
  getAllServices,
  updateService,
  deleteService
} from "../controllers/service.controller.js";

const router = express.Router();

/* CREATE */
router.post(
  "/services",
  upload.array("images", 5),
  createService
);

/* GET ALL */
router.get("/services", getAllServices);

/* UPDATE */
router.put(
  "/services/:id",
  upload.array("images", 5),
  updateService
);

/* DELETE */
router.delete("/services/:id", deleteService);

export default router;
