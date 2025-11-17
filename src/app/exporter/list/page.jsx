"use client";
import React, { useEffect, useState } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";
import { toast } from "react-hot-toast";
import { Edit, Trash2 } from "lucide-react";

export default function ExporterList() {
  const [exporters, setExporters] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExporter, setSelectedExporter] = useState(null);
  const [editData, setEditData] = useState({
    company_name: "",
    exporter_name: "",
    mail_address: "",
    whatsapp_number: "",
  });

  const fetchExporters = async () => {
    try {
      const response = await AxiosInstance.get("exporters/");
      setExporters(response.data);
    } catch (error) {
      console.error("Failed to fetch exporters:", error);
      toast.error("Failed to load exporter list.");
    }
  };

  useEffect(() => {
    fetchExporters();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this exporter?")) return;

    try {
      await AxiosInstance.delete(`exporters/${id}/`);
      toast.success("Exporter deleted!");
      fetchExporters();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete exporter.");
    }
  };

  // ---------------------------
  // EDIT FUNCTIONALITY
  // ---------------------------

  const openEditModal = (exporter) => {
    setSelectedExporter(exporter);
    setEditData({
      company_name: exporter.company_name,
      exporter_name: exporter.exporter_name,
      mail_address: exporter.mail_address,
      whatsapp_number: exporter.whatsapp_number,
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await AxiosInstance.patch(`exporters/${selectedExporter.id}/`, editData);

      toast.success("Exporter updated successfully!");
      setIsEditModalOpen(false);
      fetchExporters();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update exporter.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Exporter List</h2>

      <div className="overflow-x-auto shadow-sm border rounded-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-3 py-2 border">#</th>
              <th className="px-3 py-2 border">Company Name</th>
              <th className="px-3 py-2 border">Exporter Name</th>
              <th className="px-3 py-2 border">Mail Address</th>
              <th className="px-3 py-2 border">WhatsApp</th>
              <th className="px-3 py-2 border text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {exporters.length > 0 ? (
              exporters.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border">{index + 1}</td>
                  <td className="px-3 py-2 border">{item.company_name}</td>
                  <td className="px-3 py-2 border">{item.exporter_name}</td>
                  <td className="px-3 py-2 border">{item.mail_address}</td>
                  <td className="px-3 py-2 border">{item.whatsapp_number}</td>

                  <td className="px-3 py-2 border text-center">
                    <button
                      onClick={() => openEditModal(item)}
                      className="inline-block mr-3 text-blue-600 hover:text-blue-800 hover:cursor-pointer"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="inline-block text-red-600 hover:text-red-800 hover:cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-4 text-gray-500 border"
                >
                  No exporters found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ----------------------------
          EDIT MODAL
      ----------------------------- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-opacity-40 flex items-center z-80 justify-center">
          <div className="bg-white p-6 w-full max-w-md border border-blue-200 rounded shadow-md">

            <h2 className="text-lg font-semibold mb-4">Edit Exporter</h2>

            {/* Company Name */}
            <div className="mb-3">
              <label className="block font-medium mb-1">Company Name</label>
              <input
                type="text"
                name="company_name"
                value={editData.company_name}
                onChange={handleEditChange}
                className="border w-full px-3 py-2 rounded"
              />
            </div>

            {/* Exporter Name */}
            <div className="mb-3">
              <label className="block font-medium mb-1">Exporter Name</label>
              <input
                type="text"
                name="exporter_name"
                value={editData.exporter_name}
                onChange={handleEditChange}
                className="border w-full px-3 py-2 rounded"
              />
            </div>

            {/* Mail Address */}
            <div className="mb-3">
              <label className="block font-medium mb-1">Mail Address</label>
              <input
                type="email"
                name="mail_address"
                value={editData.mail_address}
                onChange={handleEditChange}
                className="border w-full px-3 py-2 rounded"
              />
            </div>

            {/* WhatsApp */}
            <div className="mb-3">
              <label className="block font-medium mb-1">WhatsApp Number</label>
              <input
                type="text"
                name="whatsapp_number"
                value={editData.whatsapp_number}
                onChange={handleEditChange}
                className="border w-full px-3 py-2 rounded"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border rounded hover:cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:cursor-pointer"
              >
                Update
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
