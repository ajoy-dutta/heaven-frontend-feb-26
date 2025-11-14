'use client';

import { useState, useEffect } from 'react';
import AxiosInstance from '../components/AxiosInstance';

export default function LoanPurchaseEntry() {
    const [formData, setFormData] = useState({
        invoice_no: 'AUTO GENERATE',
        purchase_date: '',
        display_purchase_date: '',
        exporter_name: '',
        company_name: '',
        total_price: '',
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [exporters, setExporters] = useState([]);
    const [companies, setCompanies] = useState([]);

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
        const today = new Date();

        const formattedForInput = today.toISOString().slice(0, 10); // YYYY-MM-DD for input[type=date]
        const formattedForUI = today.toLocaleDateString('en-GB'); // DD/MM/YYYY

        setFormData(prev => ({
            ...prev,
            purchase_date: formattedForInput,
            display_purchase_date: formattedForUI,
        }));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = () => {
        if (selectedFile) {
            console.log('Selected file:', selectedFile.name);
        } else {
            alert('Please select a file first.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            alert('Please upload a file before submitting.');
            return;
        }

        try {
            const data = new FormData();
            data.append('invoice_no', formData.invoice_no);
            data.append('purchase_date', formData.purchase_date);
            data.append('exporter_name', formData.exporter_name);
            data.append('total_price', formData.total_price);
            data.append('xl_file', selectedFile);
            data.append('company_name', formData.company_name);

            console.log("Data to be sent:", {
                invoice_no: formData.invoice_no,
                purchase_date: formData.purchase_date,
                exporter_name: formData.exporter_name,
                company_name: formData.company_name,
                total_price: formData.total_price,
                xl_file: selectedFile ? selectedFile.name : null,
            });

            const response = await AxiosInstance.post('upload-order-excel/', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            console.log('Success:', response.data);
            alert('Purchase entry saved successfully!');

            setFormData({
                invoice_no: 'AUTO GENERATE',
                purchase_date: new Date().toISOString().slice(0, 10),
                display_purchase_date: new Date().toLocaleDateString('en-GB'),
                exporter_name: '',
                company_name: '',
                total_price: '',
            });
            setSelectedFile(null);
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error saving purchase entry. Check console for details.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-4 bg-gradient-to-b from-gray-50 to-white rounded-lg shadow-md">
            <h2 className="text-2xl font-extrabold mb-4 text-center text-blue-700 tracking-wide">
                🛒 Product Purchase Entry
            </h2>

            <form
                onSubmit={handleSubmit}
                className="space-y-8 bg-white shadow-lg rounded-2xl p-8 border border-blue-100"
            >
                {/* Purchase Entry Section */}
                <section>
                    <h3 className="text-lg font-semibold mb-4 text-blue-600 flex items-center gap-2">
                        <span className="w-1 h-4 bg-blue-600 rounded"></span> Purchase Information
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Invoice No
                            </label>
                            <input
                                type="text"
                                name="invoice_no"
                                value={formData.invoice_no}
                                readOnly
                                className="w-full border border-gray-300 rounded-lg px-3 py-1 bg-gray-100 text-gray-500 cursor-not-allowed"
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
                                className="w-full border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-400"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Display: {formData.display_purchase_date}
                            </p>
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
                                className="w-full border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-400"
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

                {/* Order Sheet Section */}
                <section className="grid md:grid-cols-3 gap-6">

                    {/* Left: Company Name */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Company Name *
                        </label>
                        <select
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 
                                        bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 
                                        focus:ring-blue-500"
                                                >
                            <option value="">-- Select --</option>
                            {companies.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.company_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Middle: Order Sheet Upload */}
                    <div>
                        <h3 className="text-sm mb-1 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            Ordered file
                        </h3>

                        <div className="bg-card dark:bg-gray-900 border rounded-xl p-5 shadow-sm 
                                        dark:border-gray-700 dark:shadow-md space-y-1">

                            <h4 className="text-md font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                Upload Excel File
                            </h4>

                            <input
                                type="file"
                                name="xl_file"
                                onChange={handleFileChange}
                                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 
                                bg-white dark:bg-gray-800 dark:text-gray-300 cursor-pointer focus:ring-2 
                                focus:ring-blue-500 w-full"/>
                        </div>
                    </div>

                    {/* Right: Total Price */}
                    <div className="flex flex-col space-y-1">
                        <label className="text-sm text-gray-700 dark:text-gray-300">
                            Total Price
                        </label>

                        <input
                            type="text"
                            name="total_price"
                            value={formData.total_price}
                            onChange={handleChange}
                            readOnly
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 
                 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 cursor-not-allowed"
                        />
                    </div>

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
