"use client";

import AxiosInstance from "@/app/components/AxiosInstance";
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function CompanyPage() {
  const [formData, setFormData] = useState({
    company_name: "",
    // incharge_name: "",
    // phone_no: "",
    // email: "",
    // address: "",
    // country: "",
    image: null,
  });

  const [companies, setCompanies] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState(null);

  // Fetch companies from backend
  const fetchCompanies = async () => {
    try {
      const res = await AxiosInstance.get("/companies/");
      setCompanies(res.data);
      console.log("Fetched companies:", res.data);
    } catch (err) {
      console.error("Failed loading companies:", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Handle text input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file upload + preview
  const handleFile = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image: file }));
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") data.append(key, value);
      });

      if (editingId) {
        await AxiosInstance.put(`/companies/${editingId}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Updated successfully!");
      } else {
        await AxiosInstance.post("/companies/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Saved successfully!");
      }

      setFormData({
        company_name: "",
        // incharge_name: "",
        // phone_no: "",
        // email: "",
        // address: "",
        // country: "",
        image: null,
      });

      setPreview(null);
      setEditingId(null);
      fetchCompanies();
    } catch (error) {
      console.error("Submit failed:", error);
      alert("Something went wrong.");
    }
  };

  // Delete company
  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;

    try {
      await AxiosInstance.delete(`/companies/${id}/`);
      fetchCompanies();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed.");
    }
  };

  // Edit company (populate form)
  const handleEdit = (company) => {
    setFormData({
      company_name: company.company_name || "",
      // incharge_name: company.incharge_name || "",
      // phone_no: company.phone_no || "",
      // email: company.email || "",
      // address: company.address || "",
      // country: company.country || "",
      image: null,
    });

    // backend already returns correct full/relative URL → use directly
    setPreview(company.image || null);
    setEditingId(company.id);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Company Master</h2>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

          <div>
            <label className="block text-sm font-semibold mb-1">
              Company Name:<span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              required
              className="border rounded-sm p-1 w-full"
            />
          </div>

          {/* <div>
            <label className="block text-sm font-semibold mb-1">
              Incharge Name:<span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="incharge_name"
              value={formData.incharge_name}
              onChange={handleChange}
              required
              className="border rounded-sm p-1 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Phone No:<span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="phone_no"
              value={formData.phone_no}
              onChange={handleChange}
              required
              className="border rounded-sm p-1 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              E-mail ID:<span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="border rounded-sm p-1 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Address:<span className="text-red-600">*</span>
            </label>
            <textarea
              name="address"
              rows={1}
              value={formData.address}
              onChange={handleChange}
              required
              className="border rounded-sm px-2 py-[3px] w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Country:<span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="border rounded-sm p-1 w-full"
            />
          </div> */}

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">
              Brand Logo
            </label>
            <input type="file" accept="image/*" onChange={handleFile} className="w-full" />

            {preview && (
              <div className="mt-2">
                <img src={preview} alt="Preview" className="h-14 rounded border" />
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="col-span-1 flex self-end">
            <button
              type="submit"
              className="bg-blue-950 hover:bg-blue-700 text-white px-2 py-[6px] rounded-md w-1/3 cursor-pointer"
            >
              {editingId ? "Update" : "Save"}
            </button>
          </div>

        </div>
      </form>

      {/* Table */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full border border-collapse text-sm">
          <thead className="bg-sky-900 text-white">
            <tr>
              <th className="border px-2 py-1 w-20">SL</th>
              <th className="border px-2 py-1">Logo</th>
              <th className="border px-2 py-1">Company Name</th>
              {/* <th className="border px-2 py-1">Incharge Name</th>
              <th className="border px-2 py-1">Phone No</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Address</th>
              <th className="border px-2 py-1">Country</th> */}
              <th className="border px-2 py-1">Edit</th>
              <th className="border px-2 py-1">Delete</th>
            </tr>
          </thead>

          <tbody>
            {companies.map((c, index) => (
              <tr key={c.id} className="text-center">
                <td className="border px-2 py-1 w-20">{index + 1}</td>

                <td className="border px-2 py-1">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.company_name}
                      className="h-8 w-auto mx-auto rounded"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-gray-200 rounded grid place-items-center">
                      {c.company_name?.[0]}
                    </div>
                  )}
                </td>

                <td className="border px-2 py-1">{c.company_name}</td>
                {/* <td className="border px-2 py-1">{c.incharge_name}</td>
                <td className="border px-2 py-1">{c.phone_no}</td>
                <td className="border px-2 py-1">{c.email}</td>
                <td className="border px-2 py-1">{c.address}</td>
                <td className="border px-2 py-1">{c.country}</td> */}

                <td
                  className="border px-2 py-1 text-yellow-600 cursor-pointer"
                  onClick={() => handleEdit(c)}
                >
                  <FaEdit />
                </td>

                <td
                  className="border px-2 py-1 text-red-600 cursor-pointer"
                  onClick={() => handleDelete(c.id)}
                >
                  <FaTrash />
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
