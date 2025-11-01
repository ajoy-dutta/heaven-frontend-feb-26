"use client";

import { useEffect, useMemo, useState } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";

const Input = (p) => (
  <input
    {...p}
    className={
      "border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 " +
      (p.className || "")
    }
  />
);
const Button = ({ children, className, ...rest }) => (
  <button
    {...rest}
    className={
      "px-4 py-2 rounded border shadow-sm active:scale-[.99] " +
      (className || "")
    }
    type="button"
  >
    {children}
  </button>
);

const currency = (n) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await AxiosInstance.get("orders/");
      setOrders(Array.isArray(data) ? data : data?.results || []);
    } catch (e) {
      console.error(e);
      alert("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return orders;
    return orders.filter(
      (o) =>
        String(o.order_no || "").toLowerCase().includes(t) ||
        (o.items || []).some((it) =>
          String(it?.product_details?.part_no || "").toLowerCase().includes(t)
        )
    );
  }, [orders, q]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Order List</h1>

      <div className="flex gap-2 items-center mb-4">
        <Input
          placeholder="Search by Order No or Part No"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button className="border-emerald-300" onClick={load}>
          Refresh
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border text-left">Order No</th>
              <th className="p-2 border text-left">Order Date</th>
              <th className="p-2 border text-right">Items</th>
              <th className="p-2 border text-right">Qty</th>
              <th className="p-2 border text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="p-3 text-center" colSpan={5}>
                  Loading...
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan={5}>
                  No orders found
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((o) => {
                const totalQty = (o.items || []).reduce(
                  (s, it) => s + Number(it.quantity || 0),
                  0
                );
                const totalAmount = (o.items || []).reduce(
                  (s, it) =>
                    s +
                    Number(it.quantity || 0) * Number(it.order_price || 0),
                  0
                );

                return (
                  <tr key={o.id}>
                    <td className="border p-2 font-semibold">{o.order_no}</td>
                    <td className="border p-2">{o.order_date}</td>
                    <td className="border p-2 text-right">
                      {o.items?.length || 0}
                    </td>
                    <td className="border p-2 text-right">{totalQty}</td>
                    <td className="border p-2 text-right">
                      {currency(totalAmount)}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
