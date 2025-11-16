"use client";

import { useEffect, useState } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";

export default function EmployeeAttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [statusMap, setStatusMap] = useState({}); // { employeeId: "present" | "absent" | "leave" }
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: "present", label: "Present" },
    { value: "absent", label: "Absent" },
    { value: "leave", label: "Leave" },
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await AxiosInstance.get("/employees/");
      setEmployees(res.data);
      const initial = {};
      res.data.forEach((emp) => {
        initial[emp.id] = "present"; // default
      });
      setStatusMap(initial);
    } catch (err) {
      console.error(err);
      alert("Failed to load employees");
    }
  };

  const handleStatusChange = (empId, value) => {
    setStatusMap((prev) => ({
      ...prev,
      [empId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) {
      alert("Select a date first");
      return;
    }

    setLoading(true);

    try {
      for (const emp of employees) {
        const status = statusMap[emp.id] || "present";

        await AxiosInstance.post("/employee-attendance/", {
          employee: emp.id,
          date,
          status,
        });
      }

      alert("Attendance saved successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to save attendance (maybe duplicate for the same date?)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Mark Employee Attendance</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div className="flex items-center gap-2">
          <label className="font-medium">Date:</label>
          <input
            type="date"
            className="border px-2 py-1 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">SL</th>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Code</th>
                <th className="border px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, idx) => (
                <tr key={emp.id} className="text-center">
                  <td className="border px-2 py-1">{idx + 1}</td>
                  <td className="border px-2 py-1">{emp.employee_name}</td>
                  <td className="border px-2 py-1">{emp.employee_code}</td>
                  <td className="border px-2 py-1">
                    <select
                      className="border px-2 py-1 rounded"
                      value={statusMap[emp.id] || "present"}
                      onChange={(e) => handleStatusChange(emp.id, e.target.value)}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}

              {employees.length === 0 && (
                <tr>
                  <td colSpan={4} className="border px-2 py-4 text-center italic">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Attendance"}
        </button>
      </form>
    </div>
  );
}
