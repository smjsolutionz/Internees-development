import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/admin/SidebarAdmin";
import Topbar from "../../components/admin/TopbarAdmin";
import axios from "axios";
import toast from "react-hot-toast";
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiArrowUpCircle, FiArrowDownCircle } from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const STATUSES = ["ALL", "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"];

function statusBadge(status) {
  if (status === "LOW_STOCK") return "bg-yellow-100 text-yellow-600";
  if (status === "OUT_OF_STOCK") return "bg-red-100 text-red-600";
  return "bg-green-100 text-green-700";
}

export default function InventoryProductsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const [productModal, setProductModal] = useState(null); // null | {mode, product}
  const [productForm, setProductForm] = useState({ name: "", category: "", minimumStock: 10 });

  const [stockModal, setStockModal] = useState(null); // null | {type, product}
  const [stockForm, setStockForm] = useState({ quantity: "", reason: "PURCHASE" });

  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const role = (storedUser.role || "").toUpperCase();
  const canManage = role === "INVENTORY_MANAGER";

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ["ALL", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return navigate("/login");

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category !== "ALL") params.category = category;
      if (status !== "ALL") params.status = status;

      const { data } = await axios.get(`${API_BASE_URL}/api/inventory/products`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (data.success) setProducts(data.products || []);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else toast.error(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, status]);

  const openCreate = () => {
    setProductModal({ mode: "create" });
    setProductForm({ name: "", category: "", minimumStock: 10 });
  };

  const openEdit = (p) => {
    setProductModal({ mode: "edit", product: p });
    setProductForm({ name: p.name || "", category: p.category || "", minimumStock: p.minimumStock ?? 10 });
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return navigate("/login");

      if (!productForm.name.trim() || !productForm.category.trim()) {
        toast.error("Name and category are required");
        return;
      }

      const payload = {
        name: productForm.name.trim(),
        category: productForm.category.trim(),
        minimumStock: Number(productForm.minimumStock) || 10,
      };

      if (productModal?.mode === "create") {
        await axios.post(`${API_BASE_URL}/api/inventory/products`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product added");
      } else {
        await axios.patch(`${API_BASE_URL}/api/inventory/products/${productModal.product._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product updated");
      }

      setProductModal(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
    }
  };

  const deleteProduct = async (p) => {
    if (!confirm(`Delete product "${p.name}"?`)) return;
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${API_BASE_URL}/api/inventory/products/${p._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const openStock = (type, p) => {
    setStockModal({ type, product: p });
    setStockForm({ quantity: "", reason: type === "IN" ? "PURCHASE" : "SERVICE_USAGE" });
  };

  const submitStock = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return navigate("/login");

      const qty = Number(stockForm.quantity);
      if (!qty || qty <= 0) {
        toast.error("Enter valid quantity");
        return;
      }

      if (stockModal.type === "IN") {
        await axios.post(
          `${API_BASE_URL}/api/inventory/stock-in`,
          { productId: stockModal.product._id, quantity: qty, reason: stockForm.reason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Stock added");
      } else {
        await axios.post(
          `${API_BASE_URL}/api/inventory/stock-out`,
          { productId: stockModal.product._id, quantity: qty, reason: stockForm.reason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Stock reduced");
      }

      setStockModal(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Stock update failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="flex-1 flex flex-col">
        <Topbar setSidebarOpen={setSidebarOpen} />

        <section className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h1 className="text-2xl font-semibold">Inventory Products</h1>
            {canManage && (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#BB8C4B] text-white rounded hover:bg-[#a67c42]"
              >
                <FiPlus /> Add Product
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
                    placeholder="Search product name"
                    className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#BB8C4B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#BB8C4B]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#BB8C4B]"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={fetchProducts}
                className="w-full sm:w-auto px-4 py-2 bg-[#BB8C4B] text-white rounded hover:bg-[#a67c42]"
              >
                Search
              </button>
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No products found</div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="p-4 space-y-3 md:hidden">
                  {products.map((p) => (
                    <div key={p._id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.category}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(p.status)}`}>
                          {p.status?.replaceAll("_", " ")}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Current Stock</p>
                          <p className="text-gray-900 font-medium">{p.currentStock}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Minimum</p>
                          <p className="text-gray-900 font-medium">{p.minimumStock}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {canManage && (
                          <>
                            <button
                              onClick={() => openStock("IN", p)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded border hover:bg-gray-50"
                            >
                              <FiArrowUpCircle /> Stock In
                            </button>
                            <button
                              onClick={() => openStock("OUT", p)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded border hover:bg-gray-50"
                            >
                              <FiArrowDownCircle /> Stock Out
                            </button>
                            <button
                              onClick={() => openEdit(p)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded border hover:bg-gray-50"
                            >
                              <FiEdit2 /> Edit
                            </button>
                            <button
                              onClick={() => deleteProduct(p)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded border text-red-600 hover:bg-red-50"
                            >
                              <FiTrash2 /> Delete
                            </button>
                          </>
                        )}
                        {!canManage && role === "MANAGER" && (
                          <button
                            onClick={() => openStock("OUT", p)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded border hover:bg-gray-50"
                          >
                            <FiArrowDownCircle /> Stock Out
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Minimum</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {products.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                          <td className="px-4 py-3 text-sm">{p.category}</td>
                          <td className="px-4 py-3 text-sm">{p.currentStock}</td>
                          <td className="px-4 py-3 text-sm">{p.minimumStock}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(p.status)}`}>
                              {p.status?.replaceAll("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              {canManage && (
                                <>
                                  <button
                                    onClick={() => openStock("IN", p)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded border hover:bg-gray-50 text-sm"
                                  >
                                    <FiArrowUpCircle /> In
                                  </button>
                                  <button
                                    onClick={() => openStock("OUT", p)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded border hover:bg-gray-50 text-sm"
                                  >
                                    <FiArrowDownCircle /> Out
                                  </button>
                                  <button
                                    onClick={() => openEdit(p)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded border hover:bg-gray-50 text-sm"
                                  >
                                    <FiEdit2 /> Edit
                                  </button>
                                  <button
                                    onClick={() => deleteProduct(p)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded border text-red-600 hover:bg-red-50 text-sm"
                                  >
                                    <FiTrash2 /> Delete
                                  </button>
                                </>
                              )}
                              {!canManage && role === "MANAGER" && (
                                <button
                                  onClick={() => openStock("OUT", p)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded border hover:bg-gray-50 text-sm"
                                >
                                  <FiArrowDownCircle /> Out
                                </button>
                              )}
                              {!canManage && role !== "MANAGER" && (
                                <span className="text-sm text-gray-400">View only</span>
                              )}
                            </div>
                          </td>
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

      {/* Add/Edit Product Modal */}
      {productModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {productModal.mode === "create" ? "Add Product" : "Edit Product"}
            </h3>
            <form onSubmit={submitProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  value={productForm.name}
                  onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  value={productForm.category}
                  onChange={(e) => setProductForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Level</label>
                <input
                  type="number"
                  min="0"
                  value={productForm.minimumStock}
                  onChange={(e) => setProductForm((f) => ({ ...f, minimumStock: e.target.value }))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setProductModal(null)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#BB8C4B] text-white rounded hover:bg-[#a67c42]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock In/Out Modal */}
      {stockModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">
              {stockModal.type === "IN" ? "Stock In" : "Stock Out"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{stockModal.product.name}</p>

            <form onSubmit={submitStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm((f) => ({ ...f, quantity: e.target.value }))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                {stockModal.type === "IN" ? (
                  <select
                    value={stockForm.reason}
                    onChange={(e) => setStockForm((f) => ({ ...f, reason: e.target.value }))}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="PURCHASE">Purchase</option>
                    <option value="ADJUSTMENT">Adjustment</option>
                  </select>
                ) : (
                  <select
                    value={stockForm.reason}
                    onChange={(e) => setStockForm((f) => ({ ...f, reason: e.target.value }))}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="SERVICE_USAGE">Service usage</option>
                    <option value="DAMAGE">Damage</option>
                    <option value="ADJUSTMENT">Adjustment</option>
                  </select>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStockModal(null)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#BB8C4B] text-white rounded hover:bg-[#a67c42]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

