import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/admin/SidebarAdmin";
import Topbar from "../../components/admin/TopbarAdmin";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function formatDateTime(date) {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InventoryStockHistoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);

  const [productId, setProductId] = useState("ALL");
  const [type, setType] = useState("ALL"); // IN/OUT
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const role = (storedUser.role || "").toUpperCase();
  const canView = ["INVENTORY_MANAGER", "MANAGER", "ADMIN"].includes(role);

  const productOptions = useMemo(() => {
    return [{ _id: "ALL", name: "All Products" }, ...products];
  }, [products]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const { data } = await axios.get(`${API_BASE_URL}/api/inventory/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setProducts(data.products || []);
    } catch {
      // ignore
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return navigate("/login");
      if (!canView) return navigate("/");

      const params = {};
      if (productId !== "ALL") params.productId = productId;
      if (type !== "ALL") params.type = type;
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const { data } = await axios.get(`${API_BASE_URL}/api/inventory/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (data.success) setHistory(data.history || []);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else toast.error(err.response?.data?.message || "Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchHistory();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [productId, type, startDate, endDate]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="flex-1 flex flex-col">
        <Topbar setSidebarOpen={setSidebarOpen} />

        <section className="p-4 sm:p-6">
          <h1 className="text-2xl font-semibold mb-6">Stock History</h1>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#BB8C4B]"
                >
                  {productOptions.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#BB8C4B]"
                >
                  <option value="ALL">ALL</option>
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#BB8C4B]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#BB8C4B]"
                />
              </div>
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No history found</div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="p-4 space-y-3 md:hidden">
                  {history.map((h) => (
                    <div key={h._id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{h.product?.name || "-"}</p>
                          <p className="text-xs text-gray-500">{h.product?.category || "-"}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            h.type === "OUT" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                          }`}
                        >
                          {h.type}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Quantity</p>
                          <p className="text-gray-900 font-medium">{h.quantity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Reason</p>
                          <p className="text-gray-900 font-medium">{h.reason?.replaceAll("_", " ")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Before</p>
                          <p className="text-gray-900 font-medium">{h.beforeStock}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">After</p>
                          <p className="text-gray-900 font-medium">{h.afterStock}</p>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-gray-500">
                        {formatDateTime(h.createdAt)} · {h.createdBy?.name || "—"}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Before</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">After</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {history.map((h) => (
                        <tr key={h._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{formatDateTime(h.createdAt)}</td>
                          <td className="px-4 py-3 text-sm">{h.product?.name || "-"}</td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                h.type === "OUT" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                              }`}
                            >
                              {h.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{h.quantity}</td>
                          <td className="px-4 py-3 text-sm">{h.reason?.replaceAll("_", " ")}</td>
                          <td className="px-4 py-3 text-sm">{h.beforeStock}</td>
                          <td className="px-4 py-3 text-sm">{h.afterStock}</td>
                          <td className="px-4 py-3 text-sm">{h.createdBy?.name || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

