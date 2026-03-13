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

import Sidebar from "../../components/admin/SidebarAdmin";
import Topbar from "../../components/admin/TopbarAdmin";

const RevenueDashboard = () => {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("daily");
  const token = localStorage.getItem("accessToken");

  const formatRevenueChart = (chartData, filterType) => {
    if (!chartData) return [];

    return chartData.map((item) => {
      let label = item._id || "Unknown";
      const revenue = Number(item.revenue) || 0;

      if (filterType === "weekly") {
        const weekNum = parseInt(item._id);
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const daysOffset = (weekNum - 1) * 7;

        const startDate = new Date(
          startOfYear.getTime() + daysOffset * 24 * 60 * 60 * 1000
        );

        const endDate = new Date(
          startDate.getTime() + 6 * 24 * 60 * 60 * 1000
        );

        label = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      } else if (filterType === "monthly") {
        const month = parseInt(item._id) - 1;
        const date = new Date(new Date().getFullYear(), month, 1);
        label = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
      } else if (filterType === "yearly") {
        label = item._id.toString();
      }

      return { _id: label, revenue };
    });
  };

  const fetchRevenue = async (type) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/revenue/report?filter=${type}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const mappedRevenueByService = res.data.revenueByService.map((s) => ({
        name: s._id.service || s._id,
        revenue: Number(s.revenue),
        orders: s.count,
      }));

      const mappedRevenueChart = formatRevenueChart(
        res.data.revenueChart,
        type
      );

      setData({
        ...res.data,
        revenueByService: mappedRevenueByService,
        revenueChart: mappedRevenueChart,
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchRevenue(filter);
  }, [filter]);

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

    const serviceTableData = data.revenueByService.map((s) => [
      s.name,
      `Rs ${s.revenue}`,
      s.orders,
    ]);

    autoTable(doc, {
      startY: 60,
      head: [["Service", "Revenue", "Orders"]],
      body: serviceTableData,
      theme: "grid",
      headStyles: { fillColor: "#BB8C4B", textColor: "#fff" },
      styles: { fontSize: 10 },
    });

    const chartTableData = data.revenueChart.map((item) => [
      item._id,
      `Rs ${item.revenue}`,
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [[filter.toUpperCase(), "Revenue"]],
      body: chartTableData,
      theme: "grid",
      headStyles: { fillColor: "#9C723A", textColor: "#fff" },
      styles: { fontSize: 10 },
    });

    const ordersTable = data.bills.map((bill) => [
      bill.customerName,
      bill.serviceName,
      `Rs ${bill.totalAmount}`,
      new Date(bill.createdAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Customer", "Service", "Amount", "Date"]],
      body: ordersTable,
      theme: "grid",
      headStyles: { fillColor: "#BB8C4B", textColor: "#fff" },
      styles: { fontSize: 10 },
    });

    doc.save(`Revenue-${filter}.pdf`);
  };

  if (!data) return <p className="p-6">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 min-w-0 w-full">
        <Topbar />

        <div className="p-4 md:p-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">Revenue Dashboard</h2>

            <div className="flex flex-wrap gap-3">
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
                className="bg-[#BB8C4B] text-white px-4 py-2 rounded hover:bg-[#9C723A] transition"
              >
                Download PDF
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[
              { title: "Total Revenue", value: `Rs ${data.totalRevenue}` },
              { title: "Total Orders", value: data.bills.length },
              { title: "Services", value: data.revenueByService.length },
              { title: "Customers", value: data.bills.length },
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            <div className="bg-white p-5 rounded-xl shadow">
              <h3 className="font-semibold mb-4">Revenue by Service/Package</h3>

              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.revenueByService}>
                  <CartesianGrid stroke="#f3e7d4" strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#BB8C4B" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Table Desktop */}
            <div className="bg-white p-5 rounded-xl shadow">
              <h3 className="font-semibold mb-4">Revenue Table</h3>

              <div className="hidden md:block">
                <table className="w-full text-left">
                  <thead className="border-b">
                    <tr>
                      <th className="p-2">Service</th>
                      <th className="p-2">Revenue</th>
                      <th className="p-2">Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.revenueByService.map((service, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{service.name}</td>
                        <td className="p-2">Rs {service.revenue}</td>
                        <td className="p-2">{service.orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {data.revenueByService.map((service, idx) => (
                  <div key={idx} className="border rounded-lg p-3">
                    <p className="font-semibold">{service.name}</p>
                    <div className="flex justify-between mt-2">
                      <p>Rs {service.revenue}</p>
                      <p>{service.orders} orders</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Revenue Analytics */}
          <div className="bg-white p-5 rounded-xl shadow mb-6">
            <h3 className="font-semibold mb-4">Revenue Analytics</h3>

            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.revenueChart}>
                <CartesianGrid stroke="#f3e7d4" strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#BB8C4B" strokeWidth={3}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Extra Chart */}
{["weekly", "monthly", "yearly"].includes(filter) && (
  <div className="bg-white p-5 rounded-xl shadow mb-6 w-full">
    <h3 className="font-semibold mb-4">
      {filter.charAt(0).toUpperCase() + filter.slice(1)} Transactions
    </h3>

    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data.revenueChart}>
        <CartesianGrid stroke="#f3e7d4" strokeDasharray="3 3" />
        <XAxis dataKey="_id" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="revenue" fill="#BB8C4B" />
      </BarChart>
    </ResponsiveContainer>
  </div>
)}

          {/* Recent Orders */}
          <div className="bg-white p-5 rounded-xl shadow">

            <h3 className="font-semibold mb-4">Recent Orders</h3>

            {/* Desktop Table */}
            <div className="hidden md:block">
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
                  {data.bills.map((bill) => (
                    <tr key={bill._id} className="border-b">
                      <td className="p-3">{bill.customerName}</td>
                      <td className="p-3">{bill.serviceName}</td>
                      <td className="p-3">Rs {bill.totalAmount}</td>
                      <td className="p-3">
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {data.bills.map((bill) => (
                <div key={bill._id} className="border rounded-lg p-3">
                  <p className="font-semibold">{bill.customerName}</p>
                  <p className="text-sm text-gray-500">{bill.serviceName}</p>
                  <div className="flex justify-between mt-2">
                    <p>Rs {bill.totalAmount}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(bill.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default RevenueDashboard;