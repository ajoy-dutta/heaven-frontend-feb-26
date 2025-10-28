"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../../components/AxiosInstance";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { useRouter } from "next/navigation";

export default function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const customerTypes = [
    { value: "Buyer", label: "Buyer" },
    { value: "Seller", label: "Seller" },
    { value: "Wholeseller", label: "Wholeseller" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [custRes, distRes] = await Promise.all([
        axiosInstance.get("/customers/"),
        axiosInstance.get("/districts/"),
      ]);
      setCustomers(custRes.data);
      // value & label দুটোতেই name রাখছি
      setDistricts(
        distRes.data.map((d) => ({ value: d.name, label: d.name }))
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      await axiosInstance.delete(`/customers/${id}/`);
      toast.success("Customer deleted successfully!");
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete customer");
    }
  };

  const handleEdit = (customer) => {
    localStorage.setItem("editCustomerData", JSON.stringify(customer));
    router.push("/customer/addEditCustomer");
  };

  // Filtered data logic
  const filtered = customers.filter((c) => {
    const matchesDistrict = selectedDistrict
      ? c.district === selectedDistrict.value
      : true;
    const matchesType = selectedType
      ? c.customer_type === selectedType.value
      : true;
    const matchesSearch = search
      ? c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.shop_name && c.shop_name.toLowerCase().includes(search.toLowerCase()))
      : true;

    return matchesDistrict && matchesType && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Heading */}
      <h2 className="text-3xl font-bold mb-6 text-center text-sky-800 tracking-wide">
        🧾 Customer Management
      </h2>

      {/* Filters Section */}
      <div className="bg-white shadow-md rounded-2xl p-5 mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-3 text-gray-700 text-center">
          🔍 Filter Customers
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Select
            options={districts}
            value={selectedDistrict}
            onChange={(selected) => {
              setSelectedDistrict(selected);
              setCurrentPage(1);
            }}
            isClearable
            placeholder="Select District"
            className="w-48"
          />
          <Select
            options={customerTypes}
            value={selectedType}
            onChange={(selected) => {
              setSelectedType(selected);
              setCurrentPage(1);
            }}
            isClearable
            placeholder="Customer Type"
            className="w-48"
          />
          <input
            type="text"
            placeholder="Search by name or shop..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 px-3 py-2 rounded-lg shadow-sm w-64 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
        </div>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-ring loading-xl text-sky-600"></span>
        </div>
      ) : (
        <>
          {/* Customer Table */}
          <div className="overflow-x-auto bg-white shadow-lg rounded-2xl border border-gray-200">
            <table className="min-w-full border-collapse text-center">
              <thead className="bg-gradient-to-r from-sky-700 to-sky-500 text-white">
                <tr>
                  {[
                    "#",
                    "Customer Name",
                    "Shop Name",
                    "Phone",
                    "District",
                    "Type",
                    "Previous Due",
                    "Actions",
                  ].map((head) => (
                    <th key={head} className="p-3 border border-sky-600 text-sm">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((c, idx) => (
                    <tr
                      key={c.id}
                      className="border-t hover:bg-sky-50 transition-all duration-150"
                    >
                      <td className="p-3 border">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="p-3 border font-semibold text-gray-700">
                        {c.customer_name}
                      </td>
                      <td className="p-3 border text-gray-600">
                        {c.shop_name || "-"}
                      </td>
                      <td className="p-3 border text-gray-700">{c.phone1}</td>
                      <td className="p-3 border text-gray-700">
                        {c.district || "-"}
                      </td>
                      <td className="p-3 border text-gray-700">
                        {c.customer_type}
                      </td>
                      <td className="p-3 border text-gray-700 font-medium">
                        {c.previous_due_amount
                          ? Number(c.previous_due_amount).toFixed(2)
                          : "0.00"}
                      </td>
                      <td className="p-3 border space-x-2">
                        <button
                          onClick={() => handleEdit(c)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-5 text-gray-500 italic bg-gray-50"
                    >
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${currentPage === 1
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-white hover:bg-sky-100 text-sky-700 border-sky-300"
                  }`}
              >
                ◀ Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${currentPage === i + 1
                      ? "bg-sky-600 text-white border-sky-600"
                      : "bg-white hover:bg-sky-100 text-sky-700 border-sky-300"
                    }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${currentPage === totalPages
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-white hover:bg-sky-100 text-sky-700 border-sky-300"
                  }`}
              >
                Next ▶
              </button>
            </div>
          )}
        </>
      )}
    </div>

  );
}
