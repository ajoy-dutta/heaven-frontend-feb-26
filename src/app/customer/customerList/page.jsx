"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../../components/AxiosInstance";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { useRouter } from "next/navigation";
import { AiFillEdit } from "react-icons/ai";
import { RiDeleteBin6Fill } from "react-icons/ri";

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
          <div className="overflow-x-auto border border-gray-300 shadow-sm bg-white">
            <table className="table table-xs border border-slate-400 min-w-full border-collapse text-sm">
              <thead className="bg-sky-900 text-white">
                <tr className="font-light text-center">
                  <th className="p-2 border border-slate-400">SL</th>
                  <th className="p-2 border border-slate-400">Customer Name</th>
                  <th className="p-2 border border-slate-400">Type</th>
                  <th className="p-2 border border-slate-400">Shop Name</th>
                  <th className="p-2 border border-slate-400">Phone</th>
                  <th className="p-2 border border-slate-400">Email</th>
                  <th className="p-2 border border-slate-400">Division & District</th>
                  <th className="p-2 border border-slate-400">Address</th>
                  <th className="p-2 border border-slate-400">DOB</th>
                  <th className="p-2 border border-slate-400">Previous Due</th>
                  <th className="p-2 border border-slate-400">Created Date</th>
                  <th className="p-2 border border-slate-400">NID</th>
                  <th className="p-2 border border-slate-400">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((c, idx) => (
                    <tr
                      key={c.id}
                      className="odd:bg-white even:bg-sky-50 text-center text-sm"
                    >
                      <td className="p-2 border border-slate-400">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>

                      <td className="p-2 border border-slate-400">
                        {c.customer_name}
                      </td>

                      <td className="p-2 border border-slate-400">
                        {c.customer_type}
                      </td>

                      <td className="p-2 border border-slate-400">
                        {c.shop_name || "-"}
                      </td>

                      <td className="p-2 border border-slate-400">
                        {c.phone1}
                        <br />
                        <span>{c.phone2}</span>
                      </td>

                      <td className="p-2 border border-slate-400">
                        {c.email || "-"}
                      </td>

                      <td className="p-2 border border-slate-400">
                        {c.division || "-"}, {c.district || "-"}
                      </td>

                      <td className="p-2 border border-slate-400">
                        {c.address || "-"}
                      </td>

                      <td className="p-2 border border-slate-400">
                        {c.dob || "-"}
                      </td>

                      <td className="p-2 border border-slate-400 text-right">
                        {c.previous_due_amount
                          ? Number(c.previous_due_amount).toFixed(2)
                          : "0.00"}
                      </td>

                      <td className="p-2 border border-slate-400">
                        {c.created_at?.split("T")[0] ?? "-"}
                      </td>

                      <td className="p-2 border border-slate-400">
                        {c.NID || "-"}
                      </td>

                      <td className="p-2 border border-slate-400 flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            router.push(`/customer/addEditCustomer?id=${c.id}`)
                          }
                          className="bg-yellow-500 hover:bg-yellow-600 text-white p-1 rounded text-xs"
                        >
                          <AiFillEdit className="text-black" />
                        </button>

                        <button
                          onClick={() => handleDelete(c.id)}
                          className="bg-red-600 hover:bg-red-700 text-white p-1 rounded text-xs"
                        >
                          <RiDeleteBin6Fill />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="p-2 border text-center text-gray-500 bg-gray-50"
                      colSpan={13}
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
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  currentPage === 1
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
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                    currentPage === i + 1
                      ? "bg-sky-600 text-white border-sky-600"
                      : "bg-white hover:bg-sky-100 text-sky-700 border-sky-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  currentPage === totalPages
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
