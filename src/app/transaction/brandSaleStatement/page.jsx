"use client";

import { useState, useEffect } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";


export default function BrandSaleReport() {
  const [companies, setCompanies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [company, setCompany] = useState("");
  const [customer, setCustomer] = useState("");
  const [fromDate, setFromDate] = useState("2025-08-01");
  const [toDate, setToDate] = useState("2025-11-06");
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch companies & customers on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [companyRes, customerRes] = await Promise.all([
          AxiosInstance.get("/companies/"),
          AxiosInstance.get("/customers/"),
        ]);
        setCompanies(companyRes.data);
        setCustomers(customerRes.data);
        setCompany(companyRes.data[0]?.name || ""); // default first company
        setCustomer(customerRes.data[0]?.name || ""); // default first customer
      } catch (err) {
        console.error("Error fetching filter data:", err);
      }
    };
    fetchFilters();
  }, []);

  // Fetch sales data based on selected filters
  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const res = await AxiosInstance.get("/brand-sale-report/", {
        params: { company, customer, from_date: fromDate, to_date: toDate },
      });
      setSalesData(res.data);
    } catch (err) {
      console.error("Error fetching sales data:", err);
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (company && customer) fetchSalesData(); // fetch initially after filter lists load
  }, [company, customer]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSalesData();
  };

  const handleDownload = () => {
    alert("Download Excel clicked");
    // implement Excel download logic here
  };

  const handlePrint = () => {
    window.print();
  };

  const totalAmount = salesData.reduce((acc, item) => acc + item.amount, 0);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-semibold mb-4">Brand Wise Sale Statement Report</h1>

      {/* Filter Form */}
      <form className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-4" onSubmit={handleSearch}>
        <div>
          <label className="block font-medium mb-1">Company Name: *</label>
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.company_name}>{c.company_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Customer Name:</label>
          <select
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.customer_name}>{c.customer_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">From Date: *</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">To Date: *</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
          >
            Search
          </button>
        </div>
      </form>

      {/* Download / Print Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={handleDownload}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded"
        >
          Download Excel
        </button>
        <button
          onClick={handlePrint}
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-4 py-2 rounded"
        >
          Print
        </button>
      </div>

      {/* Report Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center py-4">Loading data...</p>
        ) : salesData.length === 0 ? (
          <p className="text-center py-4">No data found for selected filters.</p>
        ) : (
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Invoice No</th>
                <th className="border px-2 py-1">Part No</th>
                <th className="border px-2 py-1">Product Name</th>
                <th className="border px-2 py-1">Customer Name</th>
                <th className="border px-2 py-1">Qty</th>
                <th className="border px-2 py-1">Sale Amount</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((item, idx) => (
                <tr key={idx} className="text-center">
                  <td className="border px-2 py-1">{item.date}</td>
                  <td className="border px-2 py-1">{item.invoice}</td>
                  <td className="border px-2 py-1">{item.partNo}</td>
                  <td className="border px-2 py-1">{item.product}</td>
                  <td className="border px-2 py-1">{item.customer}</td>
                  <td className="border px-2 py-1">{item.qty.toFixed(2)}</td>
                  <td className="border px-2 py-1">{item.amount.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="font-bold text-right">
                <td colSpan="6" className="border px-2 py-1 text-right">Total:</td>
                <td className="border px-2 py-1">{totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
