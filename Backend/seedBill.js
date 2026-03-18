const mongoose = require("mongoose");
const Bill = require("./src/models/Bill"); // adjust path if needed

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/salonDB")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

mongoose.connection.once("open", async () => {
  console.log("MongoDB connection ready. Seeding data...");

 try {
    // Delete old bills
    await Bill.deleteMany({});

    // 3. Create new bills
    await Bill.create([
      { customerName: "Alice", serviceName: "Haircut", totalAmount: 500, billNumber: "BILL001", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2026-02-02") },
      { customerName: "Bob", serviceName: "Massage", totalAmount: 1200, billNumber: "BILL002", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2026-02-02") },
      { customerName: "Charlie", serviceName: "Haircut", totalAmount: 700, billNumber: "BILL003", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2026-02-03") },
      { customerName: "Diana", serviceName: "Spa", totalAmount: 1500, billNumber: "BILL004", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2026-02-04") },
     { customerName: "Denver", serviceName: "Haircut", totalAmount: 500, billNumber: "BILL005", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2026-02-04") },
      { customerName: "Maya", serviceName: "Massage", totalAmount: 1200, billNumber: "BILL006", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2026-02-04") },
      { customerName: "Trinity", serviceName: "Haircut", totalAmount: 700, billNumber: "BILL007", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2026-02-05") },
      { customerName: "Lincoln", serviceName: "Spa", totalAmount: 1500, billNumber: "BILL008", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2026-02-06") }, 
      { customerName: "Lucy", serviceName: "Haircut", totalAmount: 500, billNumber: "BILL009", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2026-03-01") },
      { customerName: "Isabela", serviceName: "Massage", totalAmount: 1200, billNumber: "BILL0010", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2026-02-07") },
      { customerName: "John", serviceName: "Haircut", totalAmount: 700, billNumber: "BILL0011", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2026-02-07") },
      { customerName: "Aileen", serviceName: "Spa", totalAmount: 1500, billNumber: "BILL0012", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2026-12-07") },
       { customerName: "Chris", serviceName: "Haircut", totalAmount: 500, billNumber: "BILL0013", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2026-03-01") },
      { customerName: "Lukas", serviceName: "Massage", totalAmount: 1200, billNumber: "BILL0014", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2026-03-05") },
      { customerName: "Emir", serviceName: "Haircut", totalAmount: 700, billNumber: "BILL0015", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2026-02-20") },
      { customerName: "Barbara", serviceName: "Spa", totalAmount: 1500, billNumber: "BILL0016", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2025-12-15") }, 
      { customerName: "Nasir", serviceName: "Haircut", totalAmount: 500, billNumber: "BILL0017", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2026-03-01") },
      { customerName: "Henry", serviceName: "Massage", totalAmount: 1200, billNumber: "BILL0018", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2026-03-05") },
      { customerName: "Tony", serviceName: "Haircut", totalAmount: 700, billNumber: "BILL0019", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2026-02-20") },
      { customerName: "Jade", serviceName: "Spa", totalAmount: 1500, billNumber: "BILL0020", appointmentId: new mongoose.Types.ObjectId(), createdAt: new Date("2025-12-15") },
    ]);

   console.log("Seed data inserted!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
});