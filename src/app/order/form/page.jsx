"use client";

import { useEffect, useMemo, useState } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";

// light UI helpers
const Box = ({ children }) => (
  <div className="border rounded-md p-4">{children}</div>
);
const Label = ({ children }) => (
  <div className="text-sm font-semibold mb-1">{children}</div>
);
const Input = (p) => (
  <input
    {...p}
    className={
      "border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 " +
      (p.className || "")
    }
  />
);
const Select = ({ children, className, ...rest }) => (
  <select
    {...rest}
    className={
      "border rounded px-3 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 " +
      (className || "")
    }
  >
    {children}
  </select>
);
const Button = ({ children, className, ...rest }) => (
  <button
    {...rest}
    className={
      "px-4 py-2 rounded border shadow-sm active:scale-[.99] " +
      (className || "")
    }
  >
    {children}
  </button>
);
const currency = (n) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function OrderFormPage() {
  // header fields
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // lookup lists
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]); // from Product model
  const [stocks, setStocks] = useState([]); // from Stock model

  // search area state
  const [companyId, setCompanyId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedPartNo, setSelectedPartNo] = useState("");
  const [currentStock, setCurrentStock] = useState(0);
  const [salePrice, setSalePrice] = useState("");
  const [qty, setQty] = useState("");

  // order lines
  const [rows, setRows] = useState([]);

  const [saving, setSaving] = useState(false);

  // fetch lookups
  useEffect(() => {
    (async () => {
      try {
        const [c, p, s] = await Promise.all([
          AxiosInstance.get("companies/"),
          AxiosInstance.get("products/"), // you already use this elsewhere
          AxiosInstance.get("stocks/"),
        ]);
        setCompanies(c.data || []);
        setProducts(Array.isArray(p.data) ? p.data : p.data?.results || []);
        setStocks(s.data || []);
      } catch (e) {
        console.error(e);
        alert("Failed to load companies/products/stocks.");
      }
    })();
  }, []);

  // maps and filtered lists
  const stocksByProductId = useMemo(() => {
    const m = new Map();
    for (const s of stocks) {
      const pid = s?.product?.id;
      if (pid) m.set(pid, s);
    }
    return m;
  }, [stocks]);

  const productsForCompany = useMemo(() => {
    const id = Number(companyId);
    return products.filter((p) => p.company === id || p.company?.id === id);
  }, [companyId, products]);

  // select lists matching your layout
  const productNameOptions = useMemo(
    () =>
      productsForCompany.map((p) => ({
        value: String(p.id),
        label: p.product_name,
        part_no: p.part_no,
      })),
    [productsForCompany]
  );

  const partNoOptions = useMemo(
    () =>
      productsForCompany.map((p) => ({
        value: p.part_no,
        label: p.part_no,
        product_id: p.id,
      })),
    [productsForCompany]
  );

  // when product OR part no changes, sync the other & load stock/sale price
  useEffect(() => {
    if (!selectedProductId && !selectedPartNo) {
      setCurrentStock(0);
      setSalePrice("");
      return;
    }
    // resolve product id + part from either control
    let product = null;
    if (selectedProductId) {
      product = productsForCompany.find((p) => String(p.id) === selectedProductId);
      if (product && !selectedPartNo) setSelectedPartNo(product.part_no);
    } else if (selectedPartNo) {
      const hit = partNoOptions.find((o) => o.value === selectedPartNo);
      if (hit) setSelectedProductId(String(hit.product_id));
      product = productsForCompany.find((p) => p.id === hit?.product_id);
    }
    if (!product) return;

    // stock from Stock model (current_stock_quantity, sale_price)
    const st = stocksByProductId.get(product.id);
    setCurrentStock(st?.current_stock_quantity || 0); // StockProduct field :contentReference[oaicite:4]{index=4}
    setSalePrice(
      Number(st?.sale_price || product.product_bdt || 0).toFixed(2)
    ); // prefer stock.sale_price; fall back to product price if needed
  }, [selectedProductId, selectedPartNo, productsForCompany, partNoOptions, stocksByProductId]);

  const addLine = () => {
    const pid = Number(selectedProductId);
    const product = products.find((p) => p.id === pid);
    if (!companyId) return alert("Choose company.");
    if (!product) return alert("Select product.");
    const qn = Number(qty || 0);
    if (qn <= 0) return alert("Enter quantity.");
    const price = Number(salePrice || 0);

    // avoid duplicates: merge quantity if same product
    const idx = rows.findIndex((r) => r.product_id === pid);
    if (idx >= 0) {
      const copy = [...rows];
      copy[idx] = { ...copy[idx], qty: copy[idx].qty + qn, price };
      setRows(copy);
    } else {
      setRows((prev) => [
        ...prev,
        {
          product_id: pid,
          company_name:
            companies.find((c) => String(c.id) === String(companyId))?.company_name ||
            "",
          part_no: product.part_no,
          product_name: product.product_name,
          price,
          qty: qn,
        },
      ]);
    }

    // reset qty only (keep product selection)
    setQty("");
  };

  const removeLine = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const total = useMemo(
    () => rows.reduce((s, r) => s + Number(r.price) * Number(r.qty), 0),
    [rows]
  );

  const submit = async () => {
    if (!rows.length) return alert("Add at least one line.");

    const payload = {
      order_date: orderDate,
      items: rows.map((r) => ({
        product_id: r.product_id,
        quantity: Number(r.qty),
        order_price: Number(r.price),
      })),
    };
    // matches OrderSerializer contract (items with product_id/quantity/order_price) :contentReference[oaicite:5]{index=5} :contentReference[oaicite:6]{index=6}
    try {
      setSaving(true);
      await AxiosInstance.post("orders/", payload);
      alert("Order submitted.");
      // reset form
      setRows([]);
      setSelectedProductId("");
      setSelectedPartNo("");
      setCurrentStock(0);
      setSalePrice("");
      setQty("");
    } catch (e) {
      console.error(e);
      alert("Failed to submit order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Product Order Entry</h1>

      {/* Header Box */}
      <Box>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Order No:</Label>
            <Input value="AUTO GENERATED" readOnly />
          </div>
          <div>
            <Label>
              Order Date: <span className="text-red-600">*</span>
            </Label>
            <Input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
            />
          </div>
        </div>
      </Box>

      <h2 className="mt-6 mb-2 font-semibold">Product Search</h2>
      <Box>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <Label>
              Company Name: <span className="text-red-600">*</span>
            </Label>
            <div className="flex gap-2">
              <Select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
              >
                <option value="">--Select--</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </Select>
              <Button
                className="bg-emerald-400 text-white"
                onClick={() => {
                  // search button keeps the pattern from your screenshot;
                  // the actual filtering is already bound to companyId
                }}
              >
                Search
              </Button>
            </div>
          </div>

          <div className="md:col-span-4">
            <Label>Product Name</Label>
            <Select
              disabled={!companyId}
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">Select product</option>
              {productNameOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="md:col-span-4">
            <Label>Part No</Label>
            <Select
              disabled={!companyId}
              value={selectedPartNo}
              onChange={(e) => setSelectedPartNo(e.target.value)}
            >
              <option value="">Select part</option>
              {partNoOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="md:col-span-3">
            <Label>Current Stock</Label>
            <Input value={currentStock} readOnly />
          </div>

          <div className="md:col-span-3">
            <Label>Sale Price</Label>
            <Input
              type="number"
              step="0.01"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
            />
          </div>

          <div className="md:col-span-3">
            <Label>Qty</Label>
            <Input
              type="number"
              min={0}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>

          <div className="md:col-span-3">
            <Button
              className="bg-violet-600 text-white w-full"
              onClick={addLine}
              disabled={!selectedProductId || !qty}
            >
              Add
            </Button>
          </div>
        </div>
      </Box>

      <h2 className="mt-6 mb-2 font-semibold">Product Details</h2>
      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Company</th>
              <th className="p-2 border">Part No</th>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Subtotal</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-3 text-center text-gray-500">
                  No items added
                </td>
              </tr>
            ) : (
              rows.map((r, i) => {
                const sub = Number(r.price) * Number(r.qty);
                return (
                  <tr key={r.product_id}>
                    <td className="border p-2 text-center">{i + 1}</td>
                    <td className="border p-2">{r.company_name}</td>
                    <td className="border p-2">{r.part_no}</td>
                    <td className="border p-2">{r.product_name}</td>
                    <td className="border p-2 text-right">
                      {Number(r.price).toFixed(2)}
                    </td>
                    <td className="border p-2 text-right">{r.qty}</td>
                    <td className="border p-2 text-right">
                      {currency(sub)}
                    </td>
                    <td className="border p-2 text-center">
                      <Button
                        className="text-red-600 border-red-300"
                        onClick={() => removeLine(i)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6} className="border p-2 text-right font-semibold">
                Total
              </td>
              <td className="border p-2 text-right font-bold">
                {currency(total)}
              </td>
              <td className="border p-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          className="bg-emerald-400 text-white"
          onClick={submit}
          disabled={!rows.length || saving}
        >
          {saving ? "Submitting..." : "Submit Order"}
        </Button>
      </div>
    </div>
  );
}
