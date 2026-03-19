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

 const handlePrint = (bill) => {
  const receiptWindow = window.open("", "_blank");

  // If you don’t have items, create fallback
  const servicesHTML = bill.items
    ? bill.items.map(
        (item) => `
          <div class="row">
            <span>${item.name}</span>
            <span>Rs ${item.price}</span>
          </div>
        `
      ).join("")
    : `
      <div class="row">
        <span>${bill.serviceName}</span>
        <span>Rs ${bill.totalAmount}</span>
      </div>
    `;

  receiptWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body {
            font-family: monospace;
            width: 260px;
            margin: auto;
            padding: 10px;
          }

          h2, p {
            text-align: center;
            margin: 5px 0;
          }

          .divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }

          .row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            margin: 3px 0;
          }

          .total {
            font-weight: bold;
            font-size: 16px;
          }

          .center {
            text-align: center;
          }

          @media print {
            body {
              width: 260px;
            }
          }
        </style>
      </head>

      <body onload="window.print(); window.close();">

        <h2>Diamond Trim</h2>
        <p>Beauty Studio</p>

        <div class="divider"></div>

        <p><strong>Bill #:</strong> ${bill.billNumber}</p>
        <p>${new Date(bill.createdAt).toLocaleString()}</p>

        <div class="divider"></div>

        ${servicesHTML}

        <div class="divider"></div>

        <div class="row total">
          <span>Total</span>
          <span>Rs ${bill.totalAmount}</span>
        </div>

        <div class="row">
          <span>Paid</span>
          <span>Rs ${bill.paidAmount || 0}</span>
        </div>

        <div class="row">
          <span>Status</span>
          <span>${bill.paymentStatus}</span>
        </div>

        <div class="divider"></div>

        <p class="center">Thank you!</p>
        <p class="center">Visit Again 😊</p>

      </body>
    </html>
  `);

  receiptWindow.document.close();
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