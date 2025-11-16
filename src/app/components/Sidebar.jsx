"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { FaSignOutAlt } from "react-icons/fa";
import Image from "next/image";
import { useUser } from "../provider/UserProvider";
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



function SidebarContent() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const pathname = usePathname();
  const Router = useRouter();
  const { signOut, user } = useUser();

  const toggleSidebar = () => setIsMinimized((prev) => !prev);
  const toggleSubmenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    signOut();
    Router.push("/");
  };

  const links = [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/dashboard" },

    // 🔹 EMPLOYEE MANAGE with new pages wired
    {
      label: "Employee Manage",
      icon: <Users size={18} />,
      children: [
        { label: "Add-Edit Employee", href: "/employee/addemployee" },
        { label: "Employee List", href: "/employee/employeelist" },
        { label: "Mark Attendance", href: "/employee/attendance" },
        { label: "Attendance Report", href: "/employee/attendance-report" },
        { label: "Salary Management", href: "/employee/salary" },
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
      icon: "🏍️",
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
    {
      label: "Purchase Entry",
      icon: <PackagePlus size={18} />,
      href: "/purchaseEntry",
    },
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
      icon: "⚙️",
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

  // ✅ Fix: open the correct parent menu when a child route is active
  useEffect(() => {
    const newOpenMenus = {};
    links.forEach((item) => {
      if (item.children?.some((child) => pathname === child.href)) {
        newOpenMenus[item.label] = true;
      }
    });
    setOpenMenus((prev) => ({ ...prev, ...newOpenMenus }));
  }, [pathname]);

  return (
    <div className="flex h-screen mt-12">
      <aside className={`bg-sky-900 pb-6 text-white transition-all duration-300 ${isMinimized ? "w-14" : "w-60"} shadow-lg`}>
        <div className="flex flex-col h-full px-2 py-4">
          
          <div className="relative flex items-center justify-end border-b border-gray-700 pb-2 px-2 ">
            <button onClick={toggleSidebar} className="">
              <Menu size={24} className="text-white hover:cursor-pointer" />
            </button>
          </div>

          <nav className="flex-1 mt-2 space-y-[2px] text-xs overflow-y-auto">
            {links.map((item, index) => {
              const isChildActive = item.children?.some(
                (child) => pathname === child.href
              );
              const isActive = item.href && pathname === item.href;

              return (
                <div key={index}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => toggleSubmenu(item.label)}
                        className={`flex items-center justify-between w-full p-2 text-left rounded-lg transition duration-200 ${
                          openMenus[item.label] || isChildActive
                            ? "bg-lime-100 text-black"
                            : "hover:bg-white hover:text-black"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span>{item.icon}</span>
                          {!isMinimized && <span>{item.label}</span>}
                        </div>
                        {!isMinimized && (
                          <span
                            className={`transition-transform duration-200 ${
                              openMenus[item.label] ? "rotate-180" : ""
                            }`}
                          >
                            &#9662; {/* ▾ */}
                          </span>
                        )}
                      </button>

                      {openMenus[item.label] && !isMinimized && (
                        <div className="pl-6 py-2">
                          {item.children.map((sub, idx) => (
                            <Link
                              key={idx}
                              href={sub.href}
                              className={`block p-2 mb-1 rounded-md text-sm transition ${
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
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? "bg-lime-100 text-black"
                          : "hover:bg-white hover:text-black"
                      } ${isMinimized ? "justify-center" : ""}`}
                    >
                      <span>{item.icon}</span>
                      {!isMinimized && <span>{item.label}</span>}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

        </div>
      </aside>
    </div>
  );
}

export default SidebarContent;
