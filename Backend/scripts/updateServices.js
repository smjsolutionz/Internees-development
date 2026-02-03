// backend/scripts/updateServices.js
// Run this script to add isActive and availableForBooking to existing services

const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const updateServices = async () => {
  try {
    await connectDB();

    // Update all services to have the missing fields
    const result = await mongoose.connection.db
      .collection("services")
      .updateMany(
        {}, // Match all documents
        {
          $set: {
            isActive: true,
            availableForBooking: true,
          },
        },
      );

    console.log(`✅ Updated ${result.modifiedCount} services`);
    console.log(`   Matched: ${result.matchedCount} documents`);

    // Verify the update
    const services = await mongoose.connection.db
      .collection("services")
      .find({})
      .toArray();

    console.log("\n📋 All Services:");
    services.forEach((service) => {
      console.log(`   - ${service.name}`);
      console.log(`     isActive: ${service.isActive}`);
      console.log(`     availableForBooking: ${service.availableForBooking}`);
    });

    console.log("\n✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating services:", error);
    process.exit(1);
  }
};

updateServices();
