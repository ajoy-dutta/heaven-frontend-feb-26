"use client";

import { useEffect, useState } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";

export default function EmployeeSalaryPage() {
  const [employees, setEmployees] = useState([]);

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [type, setType] = useState("advance");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");

  const [summaryMonth, setSummaryMonth] = useState(
    (new Date().getMonth() + 1).toString()
  );
  const [summaryYear, setSummaryYear] = useState(
    new Date().getFullYear().toString()
  );
  const [summary, setSummary] = useState(null);

  // all salary + advance transactions for that employee & month
  const [transactions, setTransactions] = useState([]);

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

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !date || !amount) {
      alert("Employee, date and amount are required");
      return;
    }

    try {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;

      await AxiosInstance.post("/employee-salary-transactions/", {
        employee: selectedEmployee,
        date,
        year,
        month,
        transaction_type: type,
        amount: parseFloat(amount),
        remarks,
      });

      alert("Salary transaction saved");
      setAmount("");
      setRemarks("");
      // refresh summary + transactions for selected filters
      fetchSummary();
    } catch (err) {
      console.error(err);
      alert("Failed to save transaction");
    }
  };

  const fetchTransactions = async (employeeId, year, month) => {
    try {
      const res = await AxiosInstance.get("/employee-salary-transactions/", {
        params: {
          employee_id: employeeId,
          year,
          month,
        },
      });
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load salary transactions");
    }
  };

  const fetchSummary = async () => {
    if (!selectedEmployee || !summaryYear || !summaryMonth) {
      alert("Select employee and month/year for summary");
      return;
    }

    try {
      const res = await AxiosInstance.get("/employee-salary-summary/", {
        params: {
          employee_id: selectedEmployee,
          year: summaryYear,
          month: summaryMonth,
        },
      });
      setSummary(res.data);
      // also load transaction list
      fetchTransactions(selectedEmployee, summaryYear, summaryMonth);
    } catch (err) {
      console.error(err);
      alert("Failed to load salary summary");
    }
  };

  const handlePrint = () => {
    if (!summary) {
      alert("Load summary first");
      return;
    }
    window.print();
  };

  // derived values for display: remaining vs carry-forward
  const computed = (() => {
    if (!summary) return null;
    const net = Number(summary.net_salary || 0);
    const totalPaid = Number(summary.total_paid || 0);
    const remainingRaw = Number(summary.remaining_salary || 0);

    // extraPaid > 0 means employee got more than this month's net salary
    const extraPaid = totalPaid - net;

    const carryForwardNextMonth = extraPaid > 0 ? extraPaid : 0;
    const remainingThisMonth =
      extraPaid > 0 ? 0 : remainingRaw >= 0 ? remainingRaw : 0;

    return {
      net,
      totalPaid,
      remainingThisMonth,
      carryForwardNextMonth,
    };
  })();

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">Employee Salary Management</h1>

      {/* Add Transaction */}
      <section className="border rounded p-4 space-y-4">
        <h2 className="font-semibold">Add Salary / Advance Record</h2>
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee */}
            <div className="flex flex-col">
              <label className="font-medium text-sm mb-1">Employee</label>
              <select
                className="border px-2 py-1 rounded"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_name} ({emp.employee_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="flex flex-col">
              <label className="font-medium text-sm mb-1">Date</label>
              <input
                type="date"
                className="border px-2 py-1 rounded"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Type */}
            <div className="flex flex-col">
              <label className="font-medium text-sm mb-1">Type</label>
              <select
                className="border px-2 py-1 rounded"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="advance">Advance</option>
                <option value="salary">Salary Payment</option>
              </select>
            </div>

            {/* Amount */}
            <div className="flex flex-col">
              <label className="font-medium text-sm mb-1">Amount</label>
              <input
                type="number"
                className="border px-2 py-1 rounded"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="flex flex-col">
            <label className="font-medium text-sm mb-1">Remarks</label>
            <textarea
              className="border px-2 py-1 rounded"
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Transaction
          </button>
        </form>
      </section>

      {/* Summary + Transactions */}
      <section className="border rounded p-4 space-y-4">
        <h2 className="font-semibold">Salary Summary</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="font-medium text-sm mb-1">Employee</label>
            <select
              className="border px-2 py-1 rounded min-w-[200px]"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
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
            <label className="font-medium text-sm mb-1">Month</label>
            <input
              type="number"
              className="border px-2 py-1 rounded w-24"
              min={1}
              max={12}
              value={summaryMonth}
              onChange={(e) => setSummaryMonth(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium text-sm mb-1">Year</label>
            <input
              type="number"
              className="border px-2 py-1 rounded w-28"
              value={summaryYear}
              onChange={(e) => setSummaryYear(e.target.value)}
            />
          </div>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={fetchSummary}
          >
            Load Summary
          </button>

          <button
            type="button"
            className="bg-gray-700 text-white px-4 py-2 rounded"
            onClick={handlePrint}
          >
            Print
          </button>
        </div>

        {/* Summary + Payment + Transactions */}
        {summary && computed && (
          <div className="mt-4 space-y-4 text-sm">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded p-3 space-y-1">
                <h3 className="font-semibold mb-1">
                  Attendance &amp; Salary Cut
                </h3>
                <p>
                  <span className="font-medium">Base Salary:</span>{" "}
                  {summary.base_salary}
                </p>
                <p>
                  <span className="font-medium">Total Days in Month:</span>{" "}
                  {summary.total_days_in_month}
                </p>
                {summary.total_working_days !== undefined && (
                  <p>
                    <span className="font-medium">Working Days:</span>{" "}
                    {summary.total_working_days}
                  </p>
                )}
                <p>
                  <span className="font-medium">Present Days:</span>{" "}
                  {summary.present_days}
                </p>
                <p>
                  <span className="font-medium">Absent Days:</span>{" "}
                  {summary.absent_days}
                </p>
                <p>
                  <span className="font-medium">Per Day Salary:</span>{" "}
                  {summary.per_day_salary}
                </p>
                <p>
                  <span className="font-medium">Salary Cut (Absent):</span>{" "}
                  {summary.salary_cut}
                </p>
                <p>
                  <span className="font-medium">Net Salary (After Cut):</span>{" "}
                  {summary.net_salary}
                </p>
              </div>

              <div className="border rounded p-3 space-y-1">
                <h3 className="font-semibold mb-1">Payment Status</h3>
                <p>
                  <span className="font-medium">Salary Paid:</span>{" "}
                  {summary.salary_paid}
                </p>
                <p>
                  <span className="font-medium">Advance Paid:</span>{" "}
                  {summary.advance_paid}
                </p>
                <p>
                  <span className="font-medium">Total Paid (This Month):</span>{" "}
                  {summary.total_paid}
                </p>
                <p>
                  <span className="font-medium">
                    Remaining Salary (This Month):
                  </span>{" "}
                  {computed.remainingThisMonth}
                </p>
                <p>
                  <span className="font-medium text-red-600">
                    Advance From Next Month (To Adjust):
                  </span>{" "}
                  {computed.carryForwardNextMonth}
                </p>
              </div>
            </div>

            {/* Transactions list for this month */}
            <div className="border rounded p-3">
              <h3 className="font-semibold mb-2">
                Transactions for {summaryMonth}/{summaryYear}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs md:text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">SL</th>
                      <th className="border px-2 py-1">Date</th>
                      <th className="border px-2 py-1">Type</th>
                      <th className="border px-2 py-1">Amount</th>
                      <th className="border px-2 py-1">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="border px-2 py-3 text-center italic"
                        >
                          No transactions
                        </td>
                      </tr>
                    ) : (
                      transactions.map((t, idx) => (
                        <tr key={t.id} className="text-center">
                          <td className="border px-2 py-1">{idx + 1}</td>
                          <td className="border px-2 py-1">{t.date}</td>
                          <td className="border px-2 py-1 capitalize">
                            {t.transaction_type === "salary"
                              ? "Salary Payment"
                              : "Advance"}
                          </td>
                          <td className="border px-2 py-1">{t.amount}</td>
                          <td className="border px-2 py-1">
                            {t.remarks || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
