"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import axiosInstance from "../../components/AxiosInstance";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";


export default function AddEditCustomerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingId = searchParams.get("id");

  const [formData, setFormData] = useState({
    customerName: "",
    division: "",
    district: null,
    customerType: "",
    shopName: "",
    phone1: "",
    phone2: "",
    email: "",
    address: "",
    dob: "",
    nid: "",
    courierName: "",
    remarks: "",
    previousDue: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const customerTypes = ["Buyer", "Seller", "Wholeseller"];

  // Load edit data from localStorage
  useEffect(() => {
    const editData = localStorage.getItem("editCustomerData");
    if (editData) {
      const customerData = JSON.parse(editData);
      setInitialData(customerData);
      setIsEditMode(true);
      localStorage.removeItem("editCustomerData");
    }
  }, []);


  useEffect(() => {
      if (editingId) {
        fetchCustomerData(editingId);
      }
    }, [editingId]);

  // Load districts from API
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await axiosInstance.get("/districts/");
        const res2 = await axiosInstance.get("/divisions/");
      
        setDistricts(res.data);
        setDivisions(res2.data);
      } catch (error) {
        console.error("Failed to fetch districts", error);
        toast.error("Failed to load districts");
      }
    };

    fetchDistricts();
  }, []);

  useEffect(() => {
    if (formData.division && districts.length > 0) {
      const filtered = districts.filter(
        (d) => d.division_name === formData.division
      );
      setFilteredDistricts(filtered);
    }
  }, [formData.division, districts]);

  // Set form data when edit mode and districts are loaded
  const fetchCustomerData = async (id) => {
    try {
      const res = await axiosInstance.get(`/customers/${id}/`);
      const data = res.data;
      console.log("Fetched supplier data:", data);
      
      setFormData({
        customerName: data.customer_name || "",
        division: data.division || "",
        district: data.district || "",
        customerType: data.customer_type || "",
        shopName: data.shop_name || "",
        phone1: data.phone1 || "",
        phone2: data.phone2 || "",
        email: data.email || "",
        address: data.address || "",
        dob: data.date_of_birth || "",
        nid: data.nid_no || "",
        courierName: data.courier_name || "",
        remarks: data.remarks || "",
        previousDue: data.previous_due_amount ? String(data.previous_due_amount) : "",
      });
    } catch (error) {
      console.error("Error fetching Customer", error);
      alert("❌ Failed to load Customer data for editing.");
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "division") {
      const filteredDistricts = districts.filter((d) => d.division_name === value);
      console.log("districts",districts);
      console.log("Selected Division:", value);
      console.log("Filtered Districts:", filteredDistricts);
      if (filteredDistricts.length > 0) {
        setFilteredDistricts(filteredDistricts);
      } else {
        setFilteredDistricts([]);
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = "Customer name is required";
    if (!formData.district) newErrors.district = "District is required";
    if (!formData.customerType) newErrors.customerType = "Customer type is required";
    if (!formData.phone1.trim()) newErrors.phone1 = "Phone 1 is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    if (formData.phone1 && !phoneRegex.test(formData.phone1)) newErrors.phone1 = "Please enter a valid phone number";
    if (formData.phone2 && !phoneRegex.test(formData.phone2)) newErrors.phone2 = "Please enter a valid phone number";

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) newErrors.email = "Please enter a valid email address";
    }

    if (formData.previousDue && isNaN(formData.previousDue)) newErrors.previousDue = "Previous due must be a number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        customer_name: formData.customerName,
        division: formData.division,
        district: formData.district,
        customer_type: formData.customerType,
        shop_name: formData.shopName,
        phone1: formData.phone1,
        phone2: formData.phone2,
        email: formData.email,
        address: formData.address,
        date_of_birth: formData.dob || null,
        nid_no: formData.nid,
        courier_name: formData.courierName,
        remarks: formData.remarks,
        previous_due_amount: formData.previousDue ? parseFloat(formData.previousDue) : null,
      };

      if (editingId) {
        await axiosInstance.put(`/customers/${editingId}/`, payload);
        toast.success("Customer updated successfully!");
      } else {
        await axiosInstance.post("/customers/", payload);
        toast.success("Customer added successfully!");
      }

      router.push("/customer/customerList");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred. Please check your data and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset the form?")) {
      setFormData({
        customerName: "",division: null, district: null, customerType: "", shopName: "", phone1: "",
        phone2: "", email: "", address: "", dob: "", nid: "", courierName: "",
        remarks: "", previousDue: "",
      });
      setErrors({});
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // Detect if inside an open react-select menu
      const selectMenuOpen = document.querySelector(".react-select__menu");
      if (selectMenuOpen) return; // Let Enter work inside select menu

      e.preventDefault(); // Prevent form submission

      const form = e.target.form;
      const elements = Array.from(form.elements);

      const index = elements.indexOf(e.target);
      let nextElement = null;

      for (let i = index + 1; i < elements.length; i++) {
        const el = elements[i];
        if (
          el.offsetParent !== null &&
          !el.disabled &&
          el.type !== "hidden" &&
          el.tagName !== "BUTTON"
        ) {
          nextElement = el;
          break;
        }
      }

      if (nextElement) {
        nextElement.focus();
      }
    }
  };


  const renderField = (name, label, type = "text", required = false, placeholder = "") => (
    <div className="flex flex-col">
      <label className="text-sm mb-1 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        type={type}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        className={`border px-2 py-1 rounded bg-white ${errors[name] ? "border-red-500" : "border-black"}`}
        required={required}
        onKeyDown={handleKeyDown}
      />
      {errors[name] && <span className="text-red-500 text-xs mt-1">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md">
      <h2 className="text-3xl font-bold mb-8 text-center text-sky-800 tracking-wide">
        {editingId ? "✏️ Edit Customer" : "🧾 Add New Customer"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Card Container */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-sky-700 flex items-center gap-2">
            <span className="w-1 h-5 bg-sky-700 rounded"></span> Customer Information
          </h3>

          {/* Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {renderField("customerName", "Customer Name", "text", true)}
            {renderField("dob", "Date of Birth", "date")}


          <div>
              <label className="font-medium">
                Division <span className="text-red-500">*</span>
              </label>
              <select
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  required
                  className="border border-slate-400 py-1 px-2 rounded-xs w-full"
                  onKeyDown={handleKeyDown} // ✅ Add this line
                >

                <option value="">--Select--</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>


            <div>
              <label className="font-medium">
                District <span className="text-red-500">*</span>
              </label>
              <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  className="border py-1 px-2 rounded-xs w-full"
                  onKeyDown={handleKeyDown} // ✅ Add this line
                >

                <option value="">--Select--</option>
                {filteredDistricts.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Type */}
            <div className="flex flex-col">
              <label className="text-sm mb-1 font-semibold text-gray-700">
                Customer Type <span className="text-red-500">*</span>
              </label>
              <Select
                name="customerType"
                value={
                  formData.customerType
                    ? { label: formData.customerType, value: formData.customerType }
                    : null
                }
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    customerType: selected?.value || "",
                  }));
                  if (errors.customerType)
                    setErrors((prev) => ({ ...prev, customerType: "" }));
                }}
                options={customerTypes.map((t) => ({ value: t, label: t }))}
                isClearable
                placeholder="Select type"
                classNamePrefix="react-select"
                onKeyDown={handleKeyDown}
              />
              {errors.customerType && (
                <span className="text-red-500 text-xs mt-1">{errors.customerType}</span>
              )}
            </div>

            {/* Other Fields */}
            {renderField("shopName", "Shop Name")}
            {renderField("phone1", "Phone 1", "tel", true)}
            {renderField("phone2", "Phone 2", "tel")}
            {renderField("email", "E-mail Id", "email")}
            {renderField("address", "Address", "text", true)}
            {renderField("nid", "NID No")}
            {renderField("courierName", "Courier Name")}
            {renderField("previousDue", "Previous Due Amount", "number", false, "0.00")}
            {renderField("remarks", "Remarks")}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mt-8 gap-6">
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-500 text-white px-8 py-2.5 rounded-full hover:bg-gray-600 shadow transition-all duration-200 disabled:opacity-50"
            disabled={isSubmitting}
          >
            🔄 Reset
          </button>

          <button
            type="submit"
            className={`px-8 py-2.5 rounded-full text-white font-medium shadow transition-all duration-200 ${isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-sky-700 hover:bg-sky-800"
              }`}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Processing..."
              : editingId
                ? "💾 Update Customer"
                : "✅ Submit Customer"}
          </button>
        </div>
      </form>
    </div>

  );
}
