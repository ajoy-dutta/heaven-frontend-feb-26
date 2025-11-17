"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import AxiosInstance from "@/app/components/AxiosInstance";
import { useCart } from "@/app/context/CartContext";

export default function ProductDetailsPage() {
  const params = useParams();
  const brandParam = Array.isArray(params?.brand) ? params.brand[0] : params?.brand;
  const modelParam = Array.isArray(params?.model) ? params.model[0] : params?.model;
  const productIdParam = Array.isArray(params?.productId) ? params.productId[0] : params?.productId;

  const brandId = Number(brandParam);
  const modelId = Number(modelParam);
  const productId = Number(productIdParam);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [company, setCompany] = useState(null);
  const [bikeModel, setBikeModel] = useState(null);
  const [product, setProduct] = useState(null);
  const [stock, setStock] = useState(undefined);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const { cart, addToCart } = useCart();

  // WhatsApp Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  // Base URL for images
  const apiBase = useMemo(() => {
    const b = AxiosInstance.defaults.baseURL || "";
    return b.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  }, []);
  const toImg = (src) => {
    if (!src) return null;
    if (/^https?:\/\//i.test(src)) return src;
    return `${apiBase}${src.startsWith("/") ? "" : "/"}${src}`;
  };

  // Stock helpers
  const readStockQty = (s) => {
    if (!s) return null;
    const candidates = [
      s.current_stock_qty, s.current_stock_quantity,
      s.available_qty, s.available_quantity,
      s.quantity, s.qty, s.stock_qty, s.current_stock, s.stock,
    ];
    for (const v of candidates) {
      if (v !== undefined && v !== null) {
        const n = Number(v);
        if (!Number.isNaN(n)) return n;
        return null;
      }
    }
    return null;
  };

  const readSalePrice = (prod, s) => {
    const pick = (obj, keys) => {
      for (const k of keys) if (obj && obj[k] != null && obj[k] !== "") return obj[k];
      return null;
    };
    const val =
      pick(s, ["sale_price"]) ??
      pick(prod, ["product_bdt", "product_mrp", "price", "mrp", "selling_price", "sale_price"]);
    if (val == null) return null;
    const num = parseFloat(val);
    return Number.isNaN(num) ? `৳ ${val}` : `৳ ${num.toFixed(2)}`;
  };

  // Fetch data on load
  useEffect(() => {
    if (!brandId || !modelId || !productId) return;
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const [companyRes, modelRes] = await Promise.all([
          AxiosInstance.get(`/companies/${brandId}/`),
          AxiosInstance.get(`/bike-models/${modelId}/`),
        ]);
        if (!alive) return;

        const comp = companyRes?.data || null;
        const mdl = modelRes?.data || null;
        setCompany(comp);
        setBikeModel(mdl);

        if (!comp || !mdl) {
          if (alive) setLoading(false);
          return;
        }

        const prodRes = await AxiosInstance.get(`/products/${productId}/`);
        if (!alive) return;
        const prod = prodRes?.data || null;

        const companyMatches =
          prod?.company?.id === brandId || prod?.company === brandId;
        const modelMatchesFK =
          prod?.bike_model?.id === modelId || prod?.bike_model === modelId;
        const modelMatchesText =
          !modelMatchesFK &&
          mdl?.name &&
          typeof prod?.model_no === "string" &&
          prod.model_no.trim().toLowerCase() === mdl.name.trim().toLowerCase();

        if (!companyMatches || !(modelMatchesFK || modelMatchesText)) {
          setLoading(false);
          return notFound();
        }

        setProduct(prod);

        // Fetch stock
        try {
          const stockUrl = prod?.part_no
            ? `/stocks/?product=${prod.id}&part_no=${encodeURIComponent(prod.part_no)}`
            : `/stocks/?product=${prod.id}`;
          const stockRes = await AxiosInstance.get(stockUrl);
          const s = Array.isArray(stockRes?.data) ? stockRes.data[0] : null;
          if (alive) setStock(s || null);
        } catch {
          if (alive) setStock(null);
        }

        // Related products
        let rel = [];
        try {
          const urlFK = `/products/?company=${brandId}&bike_model=${modelId}`;
          const relFK = await AxiosInstance.get(urlFK);
          rel = Array.isArray(relFK?.data) ? relFK.data : [];
          if ((!rel || rel.length === 0) && mdl?.name) {
            const urlTxt = `/products/?company=${brandId}&model_no=${encodeURIComponent(mdl.name)}`;
            const relTxt = await AxiosInstance.get(urlTxt);
            rel = Array.isArray(relTxt?.data) ? relTxt.data : [];
          }
          rel = (rel || []).filter((p) => p.id !== prod.id).slice(0, 8);
        } catch {
          rel = [];
        }
        if (alive) setRelated(rel);
      } catch (e) {
        console.error("Product details error:", e);
        if (!alive) return;
        setError("Failed to load product.");
        setProduct(null);
        setStock(null);
        setRelated([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [brandId, modelId, productId]);

  const priceText = readSalePrice(product, stock);
  const stockQty = readStockQty(stock);
  const stockLoaded = stock !== undefined;
  const available = stockLoaded ? (stockQty === null ? true : stockQty > 0) : true;

  // Build the cart item
  const buildCartItem = () => ({
    id: product.id,
    product_name: product.product_name,
    image: toImg(product.image),
    price: parseFloat(
      stock?.sale_price ??
        product?.product_bdt ??
        product?.product_mrp ??
        product?.price ??
        0
    ) || 0,
    part_no: product.part_no || product.product_code || null,
    qty: quantity,
  });

  useEffect(() => {
    if (stockQty != null && quantity > stockQty) setQuantity(stockQty > 0 ? stockQty : 1);
    if (quantity < 1) setQuantity(1);
  }, [stockQty]);

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-12">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600 mb-4">
        <Link href="/brands" className="hover:underline">Brands</Link>
        <span className="mx-2">›</span>
        {company ? (
          <Link href={`/brands/${brandId}`} className="hover:underline">{company.company_name}</Link>
        ) : (<span>Brand</span>)}
        <span className="mx-2">›</span>
        {bikeModel ? (
          <Link href={`/brands/${brandId}/${modelId}`} className="hover:underline">{bikeModel.name}</Link>
        ) : (<span>Model</span>)}
        <span className="mx-2">›</span>
        <span className="font-semibold">{product?.product_name || "Product"}</span>
      </div>

      {loading ? (
        <div className="h-60 rounded-xl border bg-white shadow animate-pulse" />
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : !product ? (
        <div className="text-gray-600">Product not found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Image */}
            <div className="bg-white border rounded-xl shadow p-4 flex items-center justify-center relative">
              {stockLoaded && stockQty !== null && stockQty <= 0 && (
                <span className="absolute top-2 right-2 text-[11px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                  Out of stock
                </span>
              )}
              {product.image ? (
                <img
                  src={toImg(product.image)}
                  alt={product.product_name || "Product image"}
                  className="max-h-96 w-auto object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="h-64 w-full bg-gray-100 rounded flex items-center justify-center text-gray-500">
                  No image
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-2xl font-bold mb-2">{product.product_name}</h1>
              <div className="text-sm text-gray-600 mb-2">
                {product.part_no
                  ? `SKU: ${product.part_no}`
                  : product.product_code
                  ? `Code: ${product.product_code}`
                  : ""}
              </div>

              {priceText && <div className="text-2xl font-semibold mb-2">{priceText}</div>}

              {/* Product Remarks */}
              {product.remarks && (
                <div className="text-sm text-gray-600 mb-4">
                  <h3 className="font-semibold">Product Details:</h3>
                  <p>{product.remarks}</p>
                </div>
              )}

              {/* Quantity Selector */}
              <label className="block text-sm text-gray-600 mb-1">Quantity</label>
              <div className="flex items-center gap-2 mb-6">
                <button
                  type="button"
                  className="bg-gray-200 px-3 py-1 rounded text-lg font-semibold"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>

                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  className="w-20 border rounded px-3 py-1 text-center"
                  value={quantity}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^\d]/g, "");
                    let n = v === "" ? 1 : parseInt(v, 10);
                    if (Number.isNaN(n) || n < 1) n = 1;
                    if (stockQty != null && n > stockQty) n = stockQty;
                    setQuantity(n);
                  }}
                />

                <button
                  type="button"
                  className="bg-gray-200 px-3 py-1 rounded text-lg font-semibold"
                  onClick={() =>
                    setQuantity((q) => {
                      const next = q + 1;
                      if (stockQty != null && next > stockQty) return q;
                      return next;
                    })
                  }
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                disabled={!available}
                className={`w-full md:w-auto px-5 py-2 rounded ${
                  available
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
                onClick={() => {
                  const inCart = cart.find((c) => c.id === product.id)?.qty || 0;
                  const desired = inCart + quantity;
                  if (stockQty != null && desired > stockQty) {
                    alert("Not enough stock to fulfill that quantity.");
                    return;
                  }
                  addToCart(buildCartItem());
                  alert(`✅ Added ${quantity} item(s) to cart!`);
                }}
              >
                {available ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          </div>

          {/* Related Products */}
          <h2 className="text-xl font-semibold mb-4">Related Products</h2>
          {related.length === 0 ? (
            <div className="text-gray-600">No related products.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/brands/${brandId}/${modelId}/products/${p.id}`}
                  className="bg-white border rounded-xl shadow p-4 block"
                >
                  <div className="h-28 bg-gray-100 rounded mb-3 flex items-center justify-center">
                    {p.image ? (
                      <img
                        src={toImg(p.image)}
                        alt={p.product_name || "Part"}
                        className="h-28 w-auto object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-gray-500">Image</span>
                    )}
                  </div>
                  <div className="font-semibold text-sm line-clamp-2">
                    {p.product_name || "Part"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {p.part_no ? `SKU: ${p.part_no}` : p.product_code ? `Code: ${p.product_code}` : ""}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

{/* Floating WhatsApp Button */}
<div
  onClick={() => setChatOpen(!chatOpen)}
  style={{
    width: "70px",
    height: "70px",
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 1000,
    cursor: "pointer",
  }}
>
  <img
    src="/wplogo.jpeg"
    alt="WhatsApp"
    style={{
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
    }}
    className="whatsapp-logo"
  />
</div>

{/* WhatsApp Popup Chat Box */}
{chatOpen && (
  <div
    style={{
      position: "fixed",
      bottom: "100px",
      right: "20px",
      width: "300px",
      background: "#f0f0f0",
      boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
      borderRadius: "12px",
      overflow: "hidden",
      zIndex: 999,
      animation: "chatFadeIn 0.25s ease",
    }}
  >
    {/* Header */}
    <div
      style={{
        background: "#25D366",
        color: "white",
        padding: "12px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <img
        src="/wplogo.jpeg"
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          border: "2px solid white",
          objectFit: "cover",
        }}
        alt="Support"
      />
      <div>
        <div style={{ fontWeight: "bold", fontSize: "15px" }}>Feroz Autos</div>
        <div style={{ fontSize: "12px", opacity: 0.9 }}>Online</div>
      </div>

      <div
        style={{
          marginLeft: "auto",
          cursor: "pointer",
          fontSize: "18px",
          fontWeight: "bold",
        }}
        onClick={() => setChatOpen(false)}
      >
        ✕
      </div>
    </div>

    {/* Chat Body */}
    <div
      style={{
        padding: "12px",
        height: "150px",
        background: "#e5ddd5",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          maxWidth: "80%",
          background: "white",
          padding: "10px 14px",
          borderRadius: "14px",
          marginBottom: "10px",
          boxShadow: "0px 1px 3px rgba(0,0,0,0.15)",
        }}
      >
        👋 Hello! How can we help you?
      </div>

      {chatMessage.trim() !== "" && (
        <div
          style={{
            alignSelf: "flex-end",
            maxWidth: "80%",
            background: "#dcf8c6",
            padding: "10px 14px",
            borderRadius: "14px",
            marginTop: "5px",
            boxShadow: "0px 1px 3px rgba(0,0,0,0.15)",
          }}
        >
          {chatMessage}
        </div>
      )}
    </div>

    {/* Input Section */}
    <div
      style={{
        background: "#f7f7f7",
        padding: "10px",
        display: "flex",
        alignItems: "center",
        borderTop: "1px solid #ddd",
      }}
    >
      <input
        type="text"
        placeholder="Type a message..."
        value={chatMessage}
        onChange={(e) => setChatMessage(e.target.value)}
        style={{
          flexGrow: 1,
          padding: "10px",
          borderRadius: "20px",
          border: "1px solid #ddd",
          outline: "none",
          fontSize: "14px",
          background: "white",
        }}
      />

<button
  onClick={() => {
    if (!chatMessage.trim()) return;

    const phone = "8801712640394";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(
      chatMessage
    )}`;
    window.open(url, "_blank");
  }}
  className="send-btn"
  style={{
    background: "#25D366",
    border: "none",
    padding: "10px 12px",
    borderRadius: "50%",
    marginLeft: "8px",
    cursor: "pointer",
    color: "white",
    fontSize: "16px",
    transition: "transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease",
  }}
>
  ➤
</button>
    </div>
  </div>
)}

{/* Styles */}
<style jsx>{`
  .whatsapp-logo:hover {
    transform: scale(1.2);
    box-shadow: 0 0 15px rgba(0, 128, 0, 0.7);
  }

  @keyframes chatFadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>
    </div>
  );
}
