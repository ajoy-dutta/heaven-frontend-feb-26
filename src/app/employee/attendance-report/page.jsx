"use client";

import { useEffect, useState } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";

export default function AttendanceReportPage() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState(""); // for download/details
  const [month, setMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [records, setRecords] = useState([]); // ALL employees attendance
  const [daysInMonth, setDaysInMonth] = useState(31);
  const [detailEmployeeId, setDetailEmployeeId] = useState(null); // which employee to show in details

  // ─── Load employees & initial month attendance (ALL employees) ───
  useEffect(() => {
    fetchEmployees();
    fetchAttendanceForMonth(); // load all employees for current month/year
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchAttendanceForMonth = async () => {
    if (!month || !year) return;

    const m = String(month).padStart(2, "0");
    const y = String(year);

    const lastDay = new Date(Number(y), Number(m), 0).getDate();
    setDaysInMonth(lastDay);

    const fromDate = `${y}-${m}-01`;
    const toDate = `${y}-${m}-${String(lastDay).padStart(2, "0")}`;

    try {
      // 🔸 No employee_id → attendance for ALL employees
      const res = await AxiosInstance.get("/employee-attendance/", {
        params: {
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

  // ─── Helper: status for given employee & day ───
const getStatusForDay = (empId, day) => {
  if (!year || !month) return "";

  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  const dateStr = `${year}-${m}-${d}`; // directly matches backend "YYYY-MM-DD"

  const rec = records.find(
    (r) => String(r.employee) === String(empId) && r.date === dateStr
  );
  if (!rec) return "";

  if (rec.status === "present") return "P";
  if (rec.status === "absent") return "A";
  if (rec.status === "leave") return "L";
  return "";
};

  // ─── Search button: reload ALL employees for that month/year ───
  const handleSearch = async (e) => {
    e.preventDefault();
    await fetchAttendanceForMonth();
  };

  // ─── Download CSV for selected employee ───
  const handleDownload = () => {
    if (!employeeId || !daysInMonth) {
      alert("Please select an employee first.");
      return;
    }

    const emp = employees.find((e) => String(e.id) === String(employeeId));
    const empName = emp ? emp.employee_name : "Employee";
    const empCode = emp ? emp.employee_code : "";

    const header = ["Employee"];
    for (let d = 1; d <= daysInMonth; d++) header.push(String(d));

    const row = [`${empName} (${empCode})`];
    for (let d = 1; d <= daysInMonth; d++) {
      row.push(getStatusForDay(employeeId, d));
    }

    const csvContent = [header.join(","), row.join(",")].join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `attendance_${empCode || employeeId}_${month}_${year}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const selectedEmployee = employees.find(
    (e) => String(e.id) === String(employeeId)
  );

  // records for details section
  const detailRecords = records.filter(
    (r) => detailEmployeeId && String(r.employee) === String(detailEmployeeId)
  );
  const detailEmployee = employees.find(
    (e) => detailEmployeeId && String(e.id) === String(detailEmployeeId)
  );

  const handleRowDetails = (empId) => {
    setDetailEmployeeId(String(empId));
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Attendance Report</h1>

      {/* ─── Filters ─── */}
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap gap-4 mb-4 items-end"
      >
        {/* Employee selector (optional, for Download & highlight) */}
        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">Employee (optional)</label>
          <select
            className="border px-2 py-1 rounded min-w-[220px]"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          >
            <option value="">All Employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.employee_name} ({emp.employee_code})
              </option>
            ))}
          </select>
        </div>

        {/* Month */}
        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">Month</label>
          <input
            type="number"
            min={1}
            max={12}
            className="border px-2 py-1 rounded w-24"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        {/* Year */}
        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">Year</label>
          <input
            type="number"
            className="border px-2 py-1 rounded w-28"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Download (Excel/CSV)
        </button>
      </form>

      {/* ─── Excel-style grid for ALL employees ─── */}
      {records.length > 0 && (
        <div className="overflow-x-auto border rounded mb-6">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 min-w-[150px] text-left">
                  Employee/ Date
                </th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                  (day) => (
                    <th
                      key={day}
                      className="border px-1 py-1 text-center min-w-[24px]"
                    >
                      {day}
                    </th>
                  )
                )}
                <th className="border px-2 py-1 min-w-[90px] text-center">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  {/* Employee name */}
                  <td className="border px-2 py-1 text-left font-medium">
                    {emp.employee_name} ({emp.employee_code})
                  </td>

                  {/* Day cells */}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                    (day) => (
                      <td
                        key={day}
                        className="border px-1 py-1 text-center align-middle"
                      >
                        {getStatusForDay(emp.id, day)}
                      </td>
                    )
                  )}

                  {/* Details button */}
                  <td className="border px-2 py-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRowDetails(emp.id)}
                      className="bg-blue-500 text-white text-xs px-3 py-1 rounded"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Detailed table for one employee ─── */}
      {detailEmployee && (
        <div className="overflow-x-auto border rounded">
          <div className="px-3 py-2 text-sm font-semibold">
            Details for: {detailEmployee.employee_name} (
            {detailEmployee.employee_code})
          </div>
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
              {detailRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="border px-2 py-4 text-center italic"
                  >
                    No records
                  </td>
                </tr>
              ) : (
                detailRecords.map((rec, idx) => (
                  <tr key={rec.id} className="text-center">
                    <td className="border px-2 py-1">{idx + 1}</td>
                    <td className="border px-2 py-1">{rec.date}</td>
                    <td className="border px-2 py-1 capitalize">
                      {rec.status}
                    </td>
                    <td className="border px-2 py-1">
                      {rec.remarks || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
