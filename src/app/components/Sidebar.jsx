"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "../provider/UserProvider";

// Lucide Icons
import {
  Users,
  UserPlus,
  Boxes,
  PackagePlus,
  Store,
  LayoutDashboard,
  Package,
  ShoppingCart,
  ListOrdered,
  Building2,
  Truck,
  UserCircle,
  Bike,
  ClipboardList,
  NotebookText,
  Banknote,
  Landmark,
  Receipt,
  ArrowLeftRight,
  Settings,
  Menu,
  LogOut,
} from "lucide-react";

export default function LayoutWithSidebar({ children }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useUser();

  const toggleSidebar = () => setIsMinimized(!isMinimized);

  const toggleSubmenu = (label) => {
    setOpenMenus((prev) => ({
      ...Object.fromEntries(Object.keys(prev).map((k) => [k, false])),
      [label]: !prev[label],
    }));
  };

  const handleLogout = () => {
    signOut();
    router.push("/");
  };

  // MENU LINKS
  const links = [
    { label: "Shop Profile", icon: <Store size={18} />, href: "/shop-profile" },
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/dashboard" },

    {
      label: "Employee Manage",
      icon: <Users size={18} />,
      children: [
        { label: "Add-Edit Employee", href: "/employee/addemployee" },
        { label: "Employee List", href: "/employee/employeelist" },
      ],
    },

    {
      label: "Product",
      icon: <Package size={18} />,
      children: [
        { label: "Add Product", href: "/products/addproducts" },
        { label: "Product List", href: "/products/productslist" },
      ],
    },

    {
      label: "Bike Models",
      icon: <Bike size={18} />,
      children: [
        { label: "Add Bike Model", href: "/bike-models/add" },
        { label: "Bike Model List", href: "/bike-models/list" },
      ],
    },

    {
      label: "Exporter",
      icon: <Building2 size={18} />,
      children: [
        { label: "Add Exporter", href: "/exporter/addEdit" },
        { label: "Exporter List", href: "/exporter/list" },
      ],
    },

    {
      label: "Supplier",
      icon: <Truck size={18} />,
      children: [
        { label: "Add Supplier", href: "/supplier/addEditSupplier" },
        { label: "Supplier List", href: "/supplier/supplierList" },
      ],
    },

    {
      label: "Customer",
      icon: <UserCircle size={18} />,
      children: [
        { label: "Add Customer", href: "/customer/addEditCustomer" },
        { label: "Customer List", href: "/customer/customerList" },
      ],
    },

    {
      label: "Stock",
      icon: <Boxes size={18} />,
      children: [{ label: "Stock List", href: "/stock/list" }],
    },

    { label: "Purchase Entry", icon: <PackagePlus size={18} />, href: "/purchaseEntry" },

    {
      label: "Product Purchase From Supplier",
      icon: <ShoppingCart size={18} />,
      href: "/supplier-purchase",
    },

    {
      label: "Supplier Purchase List",
      icon: <ListOrdered size={18} />,
      href: "/purchase_list_from_supplier",
    },

    {
      label: "Product Order",
      icon: <ClipboardList size={18} />,
      children: [
        { label: "Order Form", href: "/order/form" },
        { label: "Order List", href: "/order/list" },
      ],
    },

    {
      label: "Sale",
      icon: <Receipt size={18} />,
      children: [
        { label: "Sale", href: "/sale" },
        { label: "Sale List", href: "/sale/list" },
      ],
    },

    {
      label: "Borrower",
      icon: <UserPlus size={18} />,
      children: [
        { label: "Add Borrower", href: "/borrower/addBorrower" },
        { label: "Borrower List", href: "/borrower/borrowerList" },
      ],
    },

    {
      label: "Owed",
      icon: <ArrowLeftRight size={18} />,
      children: [
        { label: "Add Owed", href: "/owe/addOwe" },
        { label: "Owed List", href: "/owe/oweList" },
      ],
    },

    {
      label: "Loan",
      icon: <Banknote size={18} />,
      children: [
        { label: "Add Loan", href: "/loan/addLoan" },
        { label: "Loan List", href: "/loan/list" },
        { label: "Loan Statement", href: "/loan/statement" },
      ],
    },

    {
      label: "Bank Account",
      icon: <Landmark size={18} />,
      children: [
        { label: "Bank Account Master", href: "/bankAccount/account-master" },
        { label: "Bank Account List", href: "/bankAccount/accountList" },
      ],
    },

    {
      label: "Transaction",
      icon: <NotebookText size={18} />,
      children: [
        { label: "Add PayReceipt", href: "/transaction/addPay" },
        { label: "Daily Expenses", href: "/transaction/paymentList" },
        { label: "Add ReceivedReceipt", href: "/transaction/addRecieve" },
        { label: "Daily Income", href: "/transaction/ReceiveList" },
        { label: "Cost Category Ledger Report", href: "/transaction/cost-ledger" },
        { label: "Sale Statement Report", href: "/transaction/customerStatement" },
        { label: "Brand Wise Sale Statement Report", href: "/transaction/brandSaleStatement" },
        { label: "Purchase Statement Report", href: "/transaction/purchaseStatement" },
        { label: "Part No wise Purchase Statement Report", href: "/transaction/partwise" },
        { label: "Income/Expenses", href: "/transaction/income-expense" },
      ],
    },

    {
      label: "Settings",
      icon: <Settings size={18} />,
      children: [
        { label: "Company Master", href: "/settings/company" },
        { label: "Product Category Master", href: "/settings/productcategory" },
        { label: "Cost Category Master", href: "/settings/costcategory" },
        { label: "Source Category Master", href: "/settings/sourcecategory" },
        { label: "Payment Mode Master", href: "/settings/paymentmode" },
        { label: "District Master", href: "/settings/district" },
        { label: "Country Master", href: "/settings/country" },
        { label: "Supplier Type Master", href: "/settings/suppliertype" },
        { label: "Bank Category Master", href: "/settings/bankcategory" },
        { label: "Bank Master", href: "/settings/bank" },
      ],
    },
  ];

  return (
    <div className="flex h-screen">

      {/* ------------------ SIDEBAR ------------------ */}
      <aside
        className={`bg-sky-900 text-white transition-all duration-300 dark:bg-sky-950 ${
          isMinimized ? "w-14" : "w-72"
        } shadow-lg fixed h-screen`}
      >
        <div className="flex flex-col h-full px-2 py-4">

          {/* Logo */}
          <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            {!isMinimized && (
              <Link href="/" className="flex items-center gap-3 p-2">
                <Image src="/Feroz_logo.jpg" alt="Logo" width={32} height={32} />
                <span className="text-sm font-semibold">Feroz Autos</span>
              </Link>
            )}

            <button onClick={toggleSidebar} className="p-2">
              <Menu size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 mt-2 space-y-2 text-xs overflow-y-auto">
            {links.map((item, index) => {
              const isChildActive = item.children?.some((child) => pathname === child.href);
              const isActive = item.href && pathname === item.href;

              return (
                <div key={index}>
                  {/* Parent with children */}
                  {item.children ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(item.label)}
                        className={`flex items-center justify-between w-full p-2 rounded-lg ${
                          openMenus[item.label] || isChildActive
                            ? "bg-lime-100 text-black"
                            : "hover:bg-white hover:text-black"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          {!isMinimized && <span>{item.label}</span>}
                        </div>
                        {!isMinimized && (
                          <span
                            className={`transform transition ${
                              openMenus[item.label] ? "rotate-180" : ""
                            }`}
                          >
                            ▼
                          </span>
                        )}
                      </button>

                      {openMenus[item.label] && !isMinimized && (
                        <div className="pl-6 py-1">
                          {item.children.map((sub, idx) => (
                            <Link
                              key={idx}
                              href={sub.href}
                              className={`block p-2 rounded-md text-sm ${
                                pathname === sub.href
                                  ? "bg-lime-100 text-black"
                                  : "hover:bg-white hover:text-black"
                              }`}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        isActive ? "bg-lime-100 text-black" : "hover:bg-white hover:text-black"
                      } ${isMinimized ? "justify-center" : ""}`}
                    >
                      {item.icon}
                      {!isMinimized && <span>{item.label}</span>}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 p-2 mt-auto rounded-lg ${
              isMinimized ? "justify-center" : ""
            } hover:bg-white hover:text-black`}
          >
            <LogOut size={18} />
            {!isMinimized && <span>Logout</span>}
          </button>
        </div>
      </aside>


      {/* ------------------ NAVBAR + CONTENT ------------------ */}
      <div className={`flex-1 ml-${isMinimized ? "14" : "72"}`}>
        {/* TOP NAVBAR */}
        <nav className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm h-14 flex items-center justify-between pl-6 pr-6 z-40"
          style={{ marginLeft: isMinimized ? "56px" : "288px" }}
        >
          {/* Quick Menu */}
          <div className="hidden md:flex gap-6 text-sm font-medium text-sky-900">
            <Link href="/stock/list">Stock</Link>
            <Link href="/purchaseEntry">Purchase Entry</Link>
            <Link href="/supplier-purchase">Purchase</Link>
            <Link href="/sale">Sale</Link>
            <Link href="/order/form">Order</Link>
          </div>

          {/* Profile */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-100">
              <UserCircle size={20} />
              <span className="hidden md:inline">{user?.username || "User"}</span>
            </button>

            <div className="absolute right-0 w-40 bg-white shadow-md rounded-md border 
              opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
              <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                Profile
              </Link>

              <button onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex gap-2">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main className="mt-16 p-4">
          {children}
        </main>

      </div>
    </div>
  );
}
