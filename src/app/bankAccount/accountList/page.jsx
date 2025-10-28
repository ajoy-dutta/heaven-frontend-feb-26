"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AxiosInstance from "@/app/components/AxiosInstance";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function AccountList() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await AxiosInstance.get("/bank-accounts/");
        setAccounts(res.data);
      } catch (err) {
        console.error("Error fetching accounts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleEdit = (id) => {
    router.push(`account-master?id=${id}`);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    try {
      await AxiosInstance.delete(`/bank-accounts/${id}/`);
      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
      alert("Account deleted successfully!");
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("Failed to delete account.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading accounts...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          🏦 Bank Account List
        </h2>
        <button
          onClick={() => router.push("/bank-account/add")}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md shadow-sm transition"
        >
          + Add Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          No accounts found. Add a new one!
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border">Account Name</th>
                <th className="px-4 py-2 border">Bank Name</th>
                <th className="px-4 py-2 border">Account No</th>
                <th className="px-4 py-2 border">Balance</th>
                <th className="px-4 py-2 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr
                  key={acc.id}
                  className="hover:bg-gray-50 transition duration-150 text-black"
                >
                  <td className="px-4 py-2 border">{acc.accountName}</td>
                  <td className="px-4 py-2 border">{acc.bankName}</td>
                  <td className="px-4 py-2 border">{acc.accountNo}</td>
                  <td className="px-4 py-2 border text-right">
                    {acc.previousBalance}
                  </td>
                  <td className="px-4 py-2 border text-center space-x-2">
                    <button
                      onClick={() => handleEdit(acc.id)}
                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(acc.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
