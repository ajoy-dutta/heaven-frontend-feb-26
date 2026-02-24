"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AxiosInstance from "@/app/components/AxiosInstance";

export default function AccountMaster() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  console.log("Account ID:", id);

  const [formData, setFormData] = useState({
    accountCategory: "",
    accountName: "",
    bankName: "",
    accountNo: "",
    bankAddress: "",
    bankContact: "",
    bankMail: "",
    previousBalance: "",
  });

  const [categories, setCategories] = useState([]);
  const [banks, setBanks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch categories
  useEffect(() => {
    AxiosInstance.get("account-categories/")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // Fetch banks
  useEffect(() => {
    AxiosInstance.get("banks/")
      .then((res) => setBanks(res.data))
      .catch((err) => console.error("Error fetching banks:", err));
  }, []);

  // If ID exists, fetch existing data
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      setLoading(true);
      AxiosInstance.get(`bank-accounts/${id}/`)
        .then((res) => {
          setFormData({
            accountCategory: res.data.accountCategory || "",
            accountName: res.data.accountName || "",
            bankName: res.data.bankName || "",
            accountNo: res.data.accountNo || "",
            bankAddress: res.data.bankAddress || "",
            bankContact: res.data.bankContact || "",
            bankMail: res.data.bankMail || "",
            previousBalance: res.data.previousBalance || "",
          });
        })
        .catch((err) => console.error("Error fetching account:", err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Add or Update Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await AxiosInstance.put(`bank-accounts/${id}/`, formData);
        alert("✅ Account updated successfully!");
      } else {
        await AxiosInstance.post("bank-accounts/", formData);
        alert("✅ Bank account saved successfully!");
      }

      router.push("/account-list"); // Redirect to list page after submit
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("❌ Server error. Please try again.");
    }
  };

  // Add new category via modal
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return alert("Please enter a category name!");

    try {
      const res = await AxiosInstance.post("account-categories/", {
        name: newCategory,
      });
      setCategories((prev) => [...prev, res.data]);
      setNewCategory("");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Server error while adding category.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading account details...
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-6 mt-10 border border-gray-200 relative">
      <h1 className="text-3xl font-bold text-center text-sky-800 mb-6">
        {isEditMode ? "✏️ Edit Bank Account" : "🏦 Bank Account Master"}
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Account Category */}
        <div>
          <label className="block font-semibold">
            Account Category <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <select
              name="accountCategory"
              value={formData.accountCategory}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-1"
            >
              <option value="">--Select--</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="bg-sky-700 text-white px-3 rounded-md hover:bg-sky-800"
            >
              +
            </button>
          </div>
        </div>

        {/* Account Name */}
        <div>
          <label className="block font-semibold">
            Account Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="accountName"
            value={formData.accountName}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-1"
            placeholder="Enter account name"
          />
        </div>

        {/* Bank Name */}
        <div>
          <label className="block font-semibold">
            Bank Name <span className="text-red-500">*</span>
          </label>
          <select
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-1"
          >
            <option value="">--Select Bank--</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.name}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        {/* Account No */}
        <div>
          <label className="block font-semibold">
            Account No <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="accountNo"
            value={formData.accountNo}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-1"
            placeholder="Enter account number"
          />
        </div>

        {/* Bank Address */}
        <div>
          <label className="block font-semibold">
            Bank Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="bankAddress"
            value={formData.bankAddress}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-1"
            placeholder="Enter bank address"
          />
        </div>

        {/* Bank Contact */}
        <div>
          <label className="block font-semibold">
            Bank Contact No <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="bankContact"
            value={formData.bankContact}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-1"
            placeholder="Enter contact number"
          />
        </div>

        {/* Bank Email */}
        <div>
          <label className="block font-semibold">
            Bank Mail Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="bankMail"
            value={formData.bankMail}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-1"
            placeholder="Enter bank email"
          />
        </div>

        {/* Previous Balance */}
        <div>
          <label className="block font-semibold">
            Previous Balance <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="previousBalance"
            value={formData.previousBalance}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-1"
            placeholder="Enter previous balance"
          />
        </div>

        {/* Submit */}
        <div className="text-center mt-6 md:col-span-2">
          <button
            type="submit"
            className="bg-sky-700 text-white px-6 py-2 rounded-md hover:bg-sky-800 transition-all shadow"
          >
            {isEditMode ? "💾 Update Account" : "💾 Save Account"}
          </button>
        </div>
      </form>

      {/* Modal for Category */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-center text-sky-800">
              ➕ Add New Category
            </h2>
            <form onSubmit={handleAddCategory}>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                className="border rounded-md w-full px-3 py-1 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400" 
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-sky-700 text-white rounded hover:bg-sky-800"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
