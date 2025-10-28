'use client';

import { useState, useEffect } from 'react';
import AxiosInstance from '../components/AxiosInstance';

export default function LoanPurchaseEntry() {
  const [formData, setFormData] = useState({
    invoice_no: 'AUTO GENERATE',
    purchase_date: '',
    exporter_name: '',
    company_name: '',
    part_no: '',
    partNoSelect: '',
    total_price: '',
    quantity: '',
    purchase_price: '',
  });


  const [selectedFile, setSelectedFile] = useState(null);
  const [exporters, setExporters] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);




  useEffect(() => {
    const fetchExporters = async () => {
      try {
        const response = await AxiosInstance.get('exporters/');
        const response2 = await AxiosInstance.get('companies/');
        setExporters(response.data);
        setCompanies(response2.data);
      } catch (error) {
        console.error('Error fetching exporters:', error);
      }
    };

    fetchExporters();
  }, []);


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await AxiosInstance.get('products/');
        setProducts(res.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    setFormData(prev => ({
      ...prev,
      purchaseDate: today,
    }));
  }, []);


  const handlePartNoChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, part_no: value });

    if (value.length > 0) {
      const filtered = products.filter(p =>
        p.part_no.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };


  const handleSuggestionClick = (part_no) => {
    setFormData({ ...formData, part_no: part_no });
    setSuggestions([]);
  };



  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSearch = () => {
    if (!formData.part_no) {
      alert('Please enter a Part No to search!');
      return;
    }


    // Find the product in the products list
    const productMatch = products.find(
      (p) => p.part_no.toLowerCase() === formData.part_no.toLowerCase()
    );

    if (productMatch) {
      // Save it with exporter name attached
      setSelectedProduct({
        ...productMatch,
        exporter_name: formData.exporter_name,
        qty: '',
        purchase_price: '',
      });
    } else {
      alert('Product not found!');
    }
  };


  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const price = parseFloat(formData.purchase_price) || 0;
    const total = quantity * price;

    setFormData(prev => ({
      ...prev,
      total_price: total.toFixed(2)
    }));
  }, [formData.quantity, formData.purchase_price]);



  const handleUpload = () => {
    if (selectedFile) {
      console.log('Uploading:', selectedFile.name);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log('Submitting:', formData);

      const response = await AxiosInstance.post('purchase/', formData);

      console.log('Success:', response.data);
      alert('Purchase entry saved successfully!');

      setFormData({
        invoice_no: 'AUTO GENERATE',
        purchase_date: '',
        exporter_name: '',
        company_name: '',
        part_no: '',
        total_price: '',
        quantity: '',
        purchase_price: '',
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error saving purchase entry. Please check the console.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 bg-gradient-to-b from-gray-50 to-white rounded-lg shadow-md">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-700 tracking-wide">
        🛒 Product Purchase Entry
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-white shadow-lg rounded-2xl p-8 border border-blue-100"
      >
        {/* Purchase Entry Section */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded"></span> Purchase Information
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Invoice No
              </label>
              <input
                type="text"
                name="invoice_no"
                value={formData.invoice_no}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Purchase Date *
              </label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Exporter Name *
              </label>
              <select
                name="exporter_name"
                value={formData.exporter_name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
              >
                <option value="">--Select--</option>
                {exporters.map((exp) => (
                  <option key={exp.id} value={exp.exporter_name}>
                    {exp.exporter_name} / {exp.whatsapp_number}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Product Search */}
        <section>
          <h3 className="text-lg font-semibold text-blue-600 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded"></span> Product Search
          </h3>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Side: Search Form */}
            <div className="md:basis-3/5 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="grid md:grid-cols-4 gap-4 items-end">
                {/* Company Name */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Company Name *
                  </label>
                  <select
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">--Select--</option>
                    {companies.map((item) => (
                      <option key={item.id} value={item.company_name}>
                        {item.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Part No with Suggestions */}
                <div className="relative col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Part No *
                  </label>
                  <input
                    type="text"
                    name="part_no"
                    value={formData.part_no}
                    onChange={handlePartNoChange}
                    placeholder="Type or select part no"
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-blue-400"
                    autoComplete="off"
                  />
                  {suggestions.length > 0 && (
                    <ul className="absolute z-10 bg-white border rounded-lg shadow w-full max-h-40 overflow-y-auto mt-1">
                      {suggestions.map((item) => (
                        <li
                          key={item.id}
                          onClick={() => handleSuggestionClick(item.part_no)}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition"
                        >
                          {item.part_no}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Search Button */}
                <div>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side: File Upload */}
            <div className="md:basis-2/5 bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-lg border border-cyan-200 shadow">
              <h3 className="text-md font-semibold mb-4 text-blue-700">
                📄 Upload Product Template
              </h3>

              <div className="flex flex-col gap-4">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full cursor-pointer focus:ring-2 focus:ring-cyan-400"
                />

                <button
                  type="button"
                  onClick={handleUpload}
                  className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-all shadow-md"
                >
                  Upload File
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Total Price */}
        <section className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="block text-sm font-medium text-gray-600">
            Total Price:
          </label>
          <input
            type="text"
            name="total_price"
            value={formData.total_price}
            readOnly
            className="sm:w-1/3 border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </section>

        {/* Product Details */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-3 text-blue-600 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded"></span> Product Details
          </h3>

          {selectedProduct ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-200 rounded-lg shadow">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="border px-3 py-2">Image</th>
                    <th className="border px-3 py-2">Part No</th>
                    <th className="border px-3 py-2">Product Name</th>
                    <th className="border px-3 py-2">Category</th>
                    <th className="border px-3 py-2">Qty</th>
                    <th className="border px-3 py-2">Purchase Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-50 hover:bg-gray-100 transition">
                    <td className="border p-2 text-center">
                      {selectedProduct.image_url ? (
                        <img
                          src={selectedProduct.image_url}
                          alt={selectedProduct.name}
                          className="w-14 h-14 object-cover mx-auto rounded-lg"
                        />
                      ) : (
                        <span className="text-red-600 text-xs">No Image</span>
                      )}
                    </td>
                    <td className="border p-2">{selectedProduct.part_no}</td>
                    <td className="border p-2">{selectedProduct.product_name}</td>
                    <td className="border p-2">{selectedProduct.category}</td>
                    <td className="border p-2">
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-lg px-2 py-1 w-20 text-center focus:ring-2 focus:ring-blue-400"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        name="purchase_price"
                        value={formData.purchase_price}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-lg px-2 py-1 w-24 text-center focus:ring-2 focus:ring-blue-400"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-4">
              No product selected yet.
            </p>
          )}
        </section>

        {/* Submit */}
        <div className="text-center mt-8">
          <button
            type="submit"
            className="bg-blue-700 text-white px-10 py-3 rounded-full hover:bg-blue-800 transition-all shadow-lg"
          >
            ✅ Submit Entry
          </button>
        </div>
      </form>
    </div>

  );
}
