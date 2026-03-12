import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Sidebar & Topbar
import Sidebar from "../../components/admin/SidebarAdmin";
import Topbar from "../../components/admin/TopbarAdmin";

const RevenueDashboard = () => {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("daily");
  const token = localStorage.getItem("accessToken");

  // Format chart labels for weekly, monthly, yearly
  const formatRevenueChart = (chartData = [], filterType) => {
    return chartData.map((item) => {
      let label = item._id;

      if (filterType === "weekly") {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const daysOffset = (item._id - 1) * 7;
        const startDate = new Date(
          startOfYear.getTime() + daysOffset * 24 * 60 * 60 * 1000
        );
        const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
        label = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      } else if (filterType === "monthly") {
        const month = item._id - 1; // MongoDB month is 1-based
        const date = new Date(new Date().getFullYear(), month, 1);
        label = date.toLocaleString("default", { month: "short", year: "numeric" });
      } else if (filterType === "yearly") {
        label = item._id; // already readable
      }

      return { ...item, _id: label };
    });
  };

  // Fetch revenue from API
  const fetchRevenue = async (type) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/revenue/report?filter=${type}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Map revenueByService
      const mappedRevenueByService = (res.data.revenueByService || []).map((s) => ({
        name: s._id,
        revenue: s.revenue,
        orders: s.count,
      }));

      // Map revenueByPackage
      const mappedRevenueByPackage = (res.data.revenueByPackage || []).map((p) => ({
        _id: p._id,
        revenue: p.revenue,
        count: p.count,
      }));

      // Map revenueChart
      const mappedRevenueChart = formatRevenueChart(res.data.revenueChart || [], type);

      setData({
        ...res.data,
        revenueByService: mappedRevenueByService,
        revenueByPackage: mappedRevenueByPackage,
        revenueChart: mappedRevenueChart,
        bills: res.data.bills || [],
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchRevenue(filter);
  }, [filter]);

  // Download PDF
  const downloadPDF = () => {
    if (!data) return;

    const doc = new jsPDF("p", "mm", "a4");
    doc.setFontSize(18);
    doc.text(`Revenue Dashboard - ${filter.toUpperCase()}`, 14, 20);

    doc.setFontSize(12);
    doc.text(`Total Revenue: Rs ${data.totalRevenue}`, 14, 30);
    doc.text(`Total Orders: ${data.bills.length}`, 14, 37);
    doc.text(`Services: ${data.revenueByService.length}`, 14, 44);
    doc.text(`Customers: ${data.bills.length}`, 14, 51);

    // Revenue by Service Table
    autoTable(doc, {
      startY: 60,
      head: [["Service", "Revenue", "Orders"]],
      body: (data.revenueByService || []).map((s) => [s.name, `Rs ${s.revenue}`, s.orders]),
      theme: "grid",
      headStyles: { fillColor: "#7c3aed", textColor: "#fff" },
      styles: { fontSize: 10 },
    });

    // Revenue by Package Table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Package", "Revenue", "Orders"]],
      body: (data.revenueByPackage || []).map((p) => [p._id, `Rs ${p.revenue}`, p.count]),
      theme: "grid",
      headStyles: { fillColor: "#f59e0b", textColor: "#fff" },
      styles: { fontSize: 10 },
    });

    // Revenue Chart Table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [[filter.toUpperCase(), "Revenue"]],
      body: (data.revenueChart || []).map((item) => [item._id, `Rs ${item.revenue}`]),
      theme: "grid",
      headStyles: { fillColor: "#4f46e5", textColor: "#fff" },
      styles: { fontSize: 10 },
    });

    // Recent Orders Table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Customer", "Service", "Amount", "Date"]],
      body: (data.bills || []).map((bill) => [
        bill.customerName,
        bill.serviceName,
        `Rs ${bill.totalAmount}`,
        new Date(bill.createdAt).toLocaleDateString(),
      ]),
      theme: "grid",
      headStyles: { fillColor: "#10b981", textColor: "#fff" },
      styles: { fontSize: 10 },
    });

    doc.save(`Revenue-${filter}.pdf`);
  };

  if (!data) return <p className="p-6">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1">
        <Topbar />
        <div className="p-6">
          {/* Filter & Download */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Revenue Dashboard</h2>
            <div className="flex gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <button
                onClick={downloadPDF}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
              >
                Download PDF
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            {[
              { title: "Total Revenue", value: `Rs ${data.totalRevenue}` },
              { title: "Total Orders", value: (data.bills || []).length },
              { title: "Services", value: (data.revenueByService || []).length },
              { title: "Customers", value: (data.bills || []).length },
            ].map((card, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
              >
                <p className="text-gray-500">{card.title}</p>
                <h2 className="text-2xl font-bold mt-2">{card.value}</h2>
              </div>
            ))}
          </div>

          {/* Revenue by Service */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-5 rounded-xl shadow">
              <h3 className="font-semibold mb-4">Revenue by Service</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={data.revenueByService || []}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-5 rounded-xl shadow overflow-auto">
              <h3 className="font-semibold mb-4">Revenue by Service Table</h3>
              <table className="w-full text-left">
                <thead className="border-b">
                  <tr>
                    <th className="p-2">Service</th>
                    <th className="p-2">Revenue</th>
                    <th className="p-2">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.revenueByService || []).map((service, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-2">{service.name}</td>
                      <td className="p-2">Rs {service.revenue}</td>
                      <td className="p-2">{service.orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

         {/* Revenue by Package */}
<div className="grid grid-cols-2 gap-6 mb-6">
  {/* Package Chart */}
  <div className="bg-white p-5 rounded-xl shadow">
    <h3 className="font-semibold mb-4">Revenue by Package</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data.revenueByPackage || []} // <-- Correct array
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="_id" /> {/* Package name */}
        <YAxis />
        <Tooltip />
        <Bar dataKey="revenue" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  </div>

  {/* Package Table */}
  <div className="bg-white p-5 rounded-xl shadow overflow-auto">
    <h3 className="font-semibold mb-4">Revenue by Package Table</h3>
    <table className="w-full text-left">
      <thead className="border-b">
        <tr>
          <th className="p-2">Package</th>
          <th className="p-2">Revenue</th>
          <th className="p-2">Orders</th>
        </tr>
      </thead>
      <tbody>
        {(data.revenueByPackage || []).map((pkg, idx) => (
          <tr key={idx} className="border-b hover:bg-gray-50">
            <td className="p-2">{pkg._id}</td>
            <td className="p-2">Rs {pkg.revenue}</td>
            <td className="p-2">{pkg.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

          {/* Revenue Analytics */}
          <div className="bg-white p-5 rounded-xl shadow mb-6">
            <h3 className="font-semibold mb-4">Revenue Analytics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenueChart || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7c3aed"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly / Monthly / Yearly Bar Chart */}
          {["weekly", "monthly", "yearly"].includes(filter) && (
            <div className="bg-white p-5 rounded-xl shadow mb-6">
              <h3 className="font-semibold mb-4">
                {filter.charAt(0).toUpperCase() + filter.slice(1)} Transactions
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.revenueChart || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Orders */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Recent Orders</h3>
            <table className="w-full text-left">
              <thead className="border-b">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {(data.bills || []).map((bill) => (
                  <tr key={bill._id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3">{bill.customerName}</td>
                    <td className="p-3">{bill.serviceName}</td>
                    <td className="p-3">Rs {bill.totalAmount}</td>
                    <td className="p-3">{new Date(bill.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RevenueDashboard;