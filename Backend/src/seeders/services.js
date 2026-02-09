const mongoose = require("mongoose");
const Service = require("../models/Service");
const path = require("path");

// Load .env from root directory
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const services = [
  // Hair Services
  {
    name: "Simple Hair Cut Men",
    description: "Classic men's haircut with styling",
    category: "Hair Cut",
    price: 800,
    duration: 30,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Fade Hair Cut",
    description: "Modern fade haircut with precision",
    category: "Hair Cut",
    price: 1200,
    duration: 45,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Long Cut",
    description: "Haircut for longer hair",
    category: "Hair Cut",
    price: 1000,
    duration: 40,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Signature Cut",
    description: "Premium signature haircut",
    category: "Hair Cut",
    price: 1500,
    duration: 60,
    isActive: true,
    availableForBooking: true,
  },

  // Beard Services
  {
    name: "Beard Shave",
    description: "Complete beard shave",
    category: "Hair Cut",
    price: 500,
    duration: 20,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Beard Trim",
    description: "Professional beard trimming and shaping",
    category: "Hair Cut",
    price: 400,
    duration: 15,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Fade Beard",
    description: "Fade beard styling",
    category: "Hair Cut",
    price: 600,
    duration: 25,
    isActive: true,
    availableForBooking: true,
  },

  // Facial Services
  {
    name: "Simple Cleansing",
    description: "Basic facial cleansing",
    category: "Facial",
    price: 800,
    duration: 30,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Mini Facial",
    description: "Quick rejuvenating facial",
    category: "Facial",
    price: 1500,
    duration: 45,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Whitening Cleansing",
    description: "Skin whitening facial treatment",
    category: "Facial",
    price: 2000,
    duration: 60,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Peeling Cleansing",
    description: "Deep cleansing with peeling",
    category: "Facial",
    price: 1800,
    duration: 50,
    isActive: true,
    availableForBooking: true,
  },

  // Massage
  {
    name: "Scalp Massage (10 min)",
    description: "Relaxing scalp massage",
    category: "Massage",
    price: 300,
    duration: 10,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Scalp Massage (15 min)",
    description: "Extended scalp massage",
    category: "Massage",
    price: 400,
    duration: 15,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Head & Shoulder Massage (15min)",
    description: "Complete head and shoulder relaxation",
    category: "Massage",
    price: 800,
    duration: 15,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Foot Massage",
    description: "Relaxing foot massage",
    category: "Massage",
    price: 600,
    duration: 20,
    isActive: true,
    availableForBooking: true,
  },

  // Manicure & Pedicure
  {
    name: "Hand Polish",
    description: "Hand polish service",
    category: "Manicure",
    price: 300,
    duration: 15,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Feet Polish",
    description: "Feet polish service",
    category: "Pedicure",
    price: 400,
    duration: 20,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Manicure Simple",
    description: "Basic manicure service",
    category: "Manicure",
    price: 600,
    duration: 30,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Manicure with Polish",
    description: "Manicure with nail polish",
    category: "Manicure",
    price: 800,
    duration: 40,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Pedicure Simple",
    description: "Basic pedicure service",
    category: "Pedicure",
    price: 800,
    duration: 40,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Pedicure with Polish",
    description: "Pedicure with nail polish",
    category: "Pedicure",
    price: 1000,
    duration: 50,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Signature Manicure",
    description: "Premium manicure with polish",
    category: "Manicure",
    price: 1200,
    duration: 45,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Signature Pedicure",
    description: "Premium pedicure with polish",
    category: "Pedicure",
    price: 1500,
    duration: 60,
    isActive: true,
    availableForBooking: true,
  },

  // Hair Color
  {
    name: "Hair Colour Application",
    description: "Professional hair coloring",
    category: "Hair Color",
    price: 2000,
    duration: 90,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Beard Colour Application",
    description: "Beard coloring service",
    category: "Hair Color",
    price: 800,
    duration: 30,
    isActive: true,
    availableForBooking: true,
  },

  // Other Services
  {
    name: "Protein Hair Restore",
    description: "Hair restoration treatment",
    category: "Other",
    price: 1500,
    duration: 60,
    isActive: true,
    availableForBooking: true,
  },
  {
    name: "Anti Dandruff Treatment",
    description: "Anti-dandruff scalp treatment",
    category: "Other",
    price: 1200,
    duration: 45,
    isActive: true,
    availableForBooking: true,
  },
];

const seedServices = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    console.log("Mongo URI:", process.env.MONGO_URI);

    if (!process.env.MONGO_URI) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Service.deleteMany({});
    console.log("🗑️  Cleared existing services");

    const createdServices = await Service.insertMany(services);
    console.log(`✅ ${createdServices.length} services seeded successfully`);

    await mongoose.connection.close();
    console.log("✅ Connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
    process.exit(1);
  }
};

seedServices();
