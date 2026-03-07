import React, { useEffect, useState } from "react";
import axios from "axios";

import ReceptionistSidebar from "../../components/admin/SidebarAdmin";
import Topbar from "../../components/admin/TopbarAdmin";

const API_BASE_URL = "http://localhost:5000";

export default function ReceptionistBills() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthConfig = () => {
    const token = localStorage.getItem("accessToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchBills = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/bill`, getAuthConfig());
      setBills(data.bills || []);
    } catch (error) {
      console.error("Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // ✅ Print Receipt Function
  const handlePrint = (bill) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${bill.billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #BB8C4B; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            td, th { border: 1px solid #ccc; padding: 8px; text-align: left; }
            .paid { color: green; font-weight: bold; }
            .unpaid { color: red; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Receipt</h2>
          <p><strong>Bill Number:</strong> ${bill.billNumber}</p>
          <p><strong>Customer:</strong> ${bill.customerName}</p>
          <p><strong>Service:</strong> ${bill.serviceName}</p>
          <p><strong>Total Amount:</strong> $${bill.totalAmount}</p>
          <p><strong>Paid Amount:</strong> $${bill.paidAmount || 0}</p>
          <p><strong>Status:</strong> ${bill.paymentStatus === "Paid" ? '<span class="paid">Paid</span>' : '<span class="unpaid">Unpaid</span>'}</p>
          <p><strong>Date:</strong> ${new Date(bill.createdAt).toLocaleDateString()}</p>
          <br/>
          <p>Thank you for your payment!</p>
          <script>
            window.print();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <ReceptionistSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="flex-1">
        <Topbar setSidebarOpen={setSidebarOpen} />
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-screen">Loading bills...</div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-[#BB8C4B] mb-6">Generated Bills</h1>
              <div className="overflow-x-auto bg-white shadow rounded-xl">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3">Bill Number</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Service</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Paid</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Action</th> {/* New column */}
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr key={bill._id} className="border-t">
                        <td className="p-3">{bill.billNumber}</td>
                        <td className="p-3">{bill.customerName}</td>
                        <td className="p-3">{bill.serviceName}</td>
                        <td className="p-3">{bill.totalAmount}</td>
                        <td className="p-3">{bill.paidAmount || 0}</td>
                        <td className="p-3">
                          {bill.paymentStatus === "Paid" ? (
                            <span className="text-green-600 font-semibold">Paid</span>
                          ) : (
                            <span className="text-red-600 font-semibold">Unpaid</span>
                          )}
                        </td>
                        <td className="p-3">{new Date(bill.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <button
                            onClick={() => handlePrint(bill)}
                            className="px-4 py-1 bg-[#BB8C4B] text-white rounded hover:bg-[#a77a3f]"
                          >
                            Print Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}