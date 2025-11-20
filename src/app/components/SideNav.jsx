"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "../provider/UserProvider";
import {
  Boxes,
  ShoppingCart,
  Receipt,
  PackagePlus,
  ClipboardList,
  Menu,
  User,
  LogOut,
} from "lucide-react";
import Image from "next/image";

export default function SideNavbar({ toggleSidebar }) {
  const { user, signOut } = useUser();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm h-14 flex items-center px-4 justify-between">
      
      {/* Left: Sidebar Toggle + Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 p-2">
          <Image src="/Feroz_logo.jpg" alt="Logo" width={32} height={32} />
          <span className="text-sm font-semibold">Heaven Autos</span>
        </Link>
      </div>

      {/* Middle: Quick Menu */}
      <div className="hidden md:flex items-center gap-6 text-sm font-medium">
        <Link
          href="/stock/list"
          className="flex items-center gap-1 hover:text-sky-700"
        >
          <Boxes size={18} /> Stock List
        </Link>

        <Link
          href="/purchaseEntry"
          className="flex items-center gap-1 hover:text-sky-700"
        >
          <PackagePlus size={18} /> Purchase Entry
        </Link>

        <Link
          href="/supplier-purchase"
          className="flex items-center gap-1 hover:text-sky-700"
        >
          <ShoppingCart size={18} /> Supplier Purchase
        </Link>

        <Link
          href="/sale"
          className="flex items-center gap-1 hover:text-sky-700"
        >
          <Receipt size={18} /> Sale
        </Link>

        <Link
          href="/order/form"
          className="flex items-center gap-1 hover:text-sky-700"
        >
          <ClipboardList size={18} /> Order
        </Link>
      </div>

      {/* Right: Profile */}
      <div className="relative group">
        <button className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100">
          <User size={20} className="text-sky-900" />
          <span className="hidden md:inline text-sky-900">
            {user?.username || "User"}
          </span>
        </button>

        {/* Dropdown */}
        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
          <Link
            href="/profile"
            className="block px-4 py-2 hover:bg-gray-100 text-sm"
          >
            Profile
          </Link>

          <button
            onClick={signOut}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
