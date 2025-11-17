"use client";

import React, { useEffect, useState } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";
import { useSearchParams } from "next/navigation";


export default function SupplierForm() {
  const [supplierTypes, setSupplierTypes] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [divisions, setDivision] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);

  const searchParams = useSearchParams();
  const editingId = searchParams.get("id"); // will be null if not provided
  console.log("Editing ID:", editingId);

  const [formData, setFormData] = useState({
    supplier_name: "",
    division: "",
    district: "",
    country: "",
    supplier_type: "",
    shop_name: "",
    phone1: "",
    phone2: "",
    email: "",
    address: "",
    date_of_birth: "",
    nid_no: "",
    remarks: "",
    previous_due_amount: "",
  });

  useEffect(() => {
    fetchSupplierTypes();
    fetchDistricts();
    fetchDivision();
  }, []);

  useEffect(() => {
    if (editingId) {
      fetchSupplier(editingId);
    }
  }, [editingId]);

  const fetchSupplierTypes = async () => {
    try {
      const res = await AxiosInstance.get("/supplier-types/");
      setSupplierTypes(res.data);
    } catch (error) {
      console.error("Error fetching supplier types", error);
    }
  };

  const fetchDistricts = async () => {
    try {
      const res = await AxiosInstance.get("/districts/");
      setDistricts(res.data);
    } catch (error) {
      console.error("Error fetching districts", error);
    }
  };

  const fetchDivision = async () => {
    try {
      const res = await AxiosInstance.get("/divisions/");
      setDivision(res.data);
    } catch (error) {
      console.error("Error fetching division", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "division") {
      const filteredDistricts = districts.filter((d) => d.division_name === value);
      if (filteredDistricts.length > 0) {
        setFilteredDistricts(filteredDistricts);
      } else {
        setFilteredDistricts([]);
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  useEffect(() => {
    if (formData.division && districts.length > 0) {
      const filtered = districts.filter(
        (d) => d.division_name === formData.division
      );
      setFilteredDistricts(filtered);
    }
  }, [formData.division, districts]);


  const fetchSupplier = async (id) => {
    try {
      const res = await AxiosInstance.get(`/suppliers/${id}/`);
      const data = res.data;
      console.log("Fetched supplier data:", data);
      
      setFormData({
        supplier_name: data.supplier_name ?? "",
        division: data.division ?? "",
        district: data.district ?? "",
        country: data.country ?? "",
        supplier_type: data.supplier_type ?? "",
        shop_name: data.shop_name ?? "",
        phone1: data.phone1 ?? "",
        phone2: data.phone2 ?? "",
        email: data.email ?? "",
        address: data.address ?? "",
        date_of_birth: data.date_of_birth ?? "",
        nid_no: data.nid_no ?? "",
        remarks: data.remarks ?? "",
        previous_due_amount: data.previous_due_amount ?? "",
      });
    } catch (error) {
      console.error("Error fetching supplier", error);
      alert("❌ Failed to load supplier data for editing.");
    }
  };

  const handleReset = () => {
    setFormData({
      supplier_name: "",
      division: "",
      district: "",
      country: "",
      supplier_type: "",
      shop_name: "",
      phone1: "",
      phone2: "",
      email: "",
      address: "",
      date_of_birth: null,
      nid_no: "",
      remarks: "",
      previous_due_amount: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        supplier_type: parseInt(formData.supplier_type) || null,
        previous_due_amount: formData.previous_due_amount
          ? parseFloat(formData.previous_due_amount)
          : 0,
      };
      if (!payload.date_of_birth) payload.date_of_birth = null;

      let res;
      if (editingId) {
        // EDIT
        res = await AxiosInstance.put(`/suppliers/${editingId}/`, payload);
        alert("✅ Supplier updated successfully!");
      } else {
        // CREATE
        res = await AxiosInstance.post("/suppliers/", payload);
        alert("✅ Supplier created successfully!");
      }

      console.log("Response:", res.data);
      handleReset();
    } catch (error) {
      console.error("Error submitting supplier", error);
      alert("❌ Failed to save supplier. See console for details.");
    }
  };


    const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    // Skip if react-select menu is open
    const selectMenuOpen = document.querySelector(".react-select__menu");
    if (selectMenuOpen) return;

    e.preventDefault();

    // Select all focusable elements
    const allFocusable = Array.from(
      document.querySelectorAll(
        `input:not([type="hidden"]),
       select,
       textarea,
       button,
       [tabindex]:not([tabindex="-1"])`
      )
    ).filter(
      (el) =>
        el.offsetParent !== null && // visible
        !el.disabled && // not disabled
        !(el.readOnly === true || el.getAttribute("readonly") !== null) // not readonly
    );

    const currentIndex = allFocusable.indexOf(e.target);

    if (currentIndex !== -1) {
      for (let i = currentIndex + 1; i < allFocusable.length; i++) {
        const nextEl = allFocusable[i];
        nextEl.focus();
        break;
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white shadow-lg rounded-xl p-4 border border-slate-200">
        <h2 className="text-xl font-bold mb-4 text-slate-800 tracking-wide">
          {editingId ? "Update Supplier" : "Add New Supplier"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm"
        >
          {/* -------- SECTION TITLE -------- */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-semibold text-blue-800">
              Personal Information
            </h3>
            <div className="h-0.5 bg-blue-800/40 rounded"></div>
          </div>

          {/* Supplier Name */}
          <div className="col-span-1">
            <label className="font-semibold text-slate-700">Supplier Name *</label>
            <input
              type="text"
              name="supplier_name"
              value={formData.supplier_name}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              required
              className="mt-1 border border-slate-300 py-1 px-3 rounded-md w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Division */}
          <div>
            <label className="font-semibold text-slate-700">Division *</label>
            <select
              name="division"
              value={formData.division}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              required
              className="mt-1 border border-slate-300 py-1 px-3 rounded-md w-full focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select --</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="font-semibold text-slate-700">District *</label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              required
              className="mt-1 border border-slate-300 py-1 px-3 rounded-md w-full focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select --</option>
              {filteredDistricts.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="font-semibold text-slate-700">Country *</label>
            <input
              type="text"
              name="country"
              onKeyDown={handleKeyDown}
              value={formData.country}
              onChange={handleChange}
              required
              className="mt-1 border border-slate-300 py-1 px-3 rounded-md w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Supplier Type */}
          <div>
            <label className="font-semibold text-slate-700">Supplier Type *</label>
            <select
              name="supplier_type"
              value={formData.supplier_type}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              required
              className="mt-1 border border-slate-300 py-1 px-3 rounded-md w-full focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select --</option>
              {supplierTypes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Shop Name */}
          <div>
            <label className="font-semibold text-slate-700">Shop Name</label>
            <input
              type="text"
              name="shop_name"
              value={formData.shop_name}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="mt-1 border border-slate-300 py-1 px-3 rounded-md w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* -------- SECTION TITLE -------- */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-semibold text-blue-800">
              Contact Details
            </h3>
            <div className="h-0.5 bg-blue-800/40 rounded"></div>
          </div>

          {/* Phone 1 */}
          <div>
            <label className="font-semibold text-slate-700">Phone 1 *</label>
            <input
              type="text"
              name="phone1"
              value={formData.phone1}
              onChange={handleChange}
              required
              onKeyDown={handleKeyDown}
              className="mt-1 border border-slate-300 py-1 px-3 rounded-md w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone 2 */}
          <div>
            <label className="font-semibold text-slate-700">Phone 2</label>
            <input
              type="text"
              name="phone2"
              value={formData.phone2}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="mt-1 border border-slate-300 py-1 px-3 rounded-md w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="font-semibold text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="mt-1 border border-slate-300 py-1 px-3 rounded-md w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-3">
            <label className="font-semibold text-slate-700">Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              onKeyDown={handleKeyDown}
              rows="2"
              className="mt-1 border border-slate-300 py-1 px-3 rounded-md w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* -------- SECTION TITLE -------- */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-semibold text-blue-800">
              Additional Information
            </h3>
            <div className="h-0.5 bg-blue-800/40 rounded"></div>
          </div>

          {/* DOB */}
          <div>
            <label className="font-semibold text-slate-700">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="mt-1 border border-slate-300 py-1 px-3 rounded-md w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* NID */}
          <div>
            <label className="font-semibold text-slate-700">NID No</label>
            <input
              type="text"
              name="nid_no"
              value={formData.nid_no}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="mt-1 border border-slate-300 py-1 px-3 rounded-md w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="font-semibold text-slate-700">Remarks</label>
            <input
              type="text"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="mt-1 border border-slate-300 py-1 px-3 rounded-md w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Previous Due */}
          <div>
            <label className="font-semibold text-slate-700">
              Previous Due Amount
            </label>
            <input
              type="number"
              name="previous_due_amount"
              value={formData.previous_due_amount}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="mt-1 border border-slate-300 py-1 px-3 rounded-md w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* -------- BUTTONS -------- */}
          <div className="md:col-span-3 flex gap-4 mt-2">
            <button
              type="submit"
              onKeyDown={handleKeyDown}
              className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-1 rounded-lg font-medium shadow-md transition"
            >
              {editingId ? "Update Supplier" : "Save Supplier"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              onKeyDown={handleKeyDown}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-1 rounded-lg font-medium shadow-md transition"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>

  );
}
