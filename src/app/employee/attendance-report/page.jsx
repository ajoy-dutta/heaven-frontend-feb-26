"use client";

import { useEffect, useState } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";

export default function AttendanceReportPage() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await AxiosInstance.get("/employees/");
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load employees");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!employeeId || !fromDate || !toDate) {
      alert("Select employee, from date and to date");
      return;
    }

    try {
      const res = await AxiosInstance.get("/employee-attendance/", {
        params: {
          employee_id: employeeId,
          from_date: fromDate,
          to_date: toDate,
        },
      });
      setRecords(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load attendance report");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Attendance Report</h1>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-4 items-end">
        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">Employee</label>
          <select
            className="border px-2 py-1 rounded min-w-[200px]"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.employee_name} ({emp.employee_code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">From</label>
          <input
            type="date"
            className="border px-2 py-1 rounded"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">To</label>
          <input
            type="date"
            className="border px-2 py-1 rounded"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </form>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">SL</th>
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, idx) => (
              <tr key={rec.id} className="text-center">
                <td className="border px-2 py-1">{idx + 1}</td>
                <td className="border px-2 py-1">{rec.date}</td>
                <td className="border px-2 py-1 capitalize">{rec.status}</td>
                <td className="border px-2 py-1">{rec.remarks || "-"}</td>
              </tr>
            ))}

            {records.length === 0 && (
              <tr>
                <td colSpan={4} className="border px-2 py-4 text-center italic">
                  No records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
