"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import { MdHeadsetMic } from "react-icons/md";
import logo from "../assets/Heaven_logo.png";
import { useUser } from "../provider/UserProvider";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { signOut } = useUser();
  const { cart } = useCart();

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const user =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;

  const isAuthenticated =
    user !== null && user !== undefined && user !== "null";

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  const navButton =
    "px-4 py-1.5 rounded-md border transition-all duration-300 text-sm font-semibold";

  const activeButton =
    "bg-green-600 text-white border-green-600 shadow-sm";

  const inactiveButton =
    "bg-white text-gray-700 border-transparent hover:border-green-500 hover:text-green-600 hover:bg-green-50";

  return (
    <div className="border-b bg-[#fafafc] fixed top-0 left-0 w-full z-50 shadow-sm">
      
      {/* ================= Top Bar ================= */}
      <div className="flex flex-col lg:flex-row items-center justify-between px-4 lg:px-6 bg-[#bcdff0]">

        {/* Logo + Mobile Toggle */}
        <div className="flex items-center w-full justify-between lg:w-auto">
          <Link href="/">
            <img
              src={logo.src}
              alt="Heaven Auto"
              className="w-24 object-contain"
            />
          </Link>

          <button
            className="lg:hidden text-xl text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Search */}
        <div className="hidden lg:flex relative w-full lg:w-96 my-1">
          <input
            type="text"
            placeholder="Search products..."
            className="border rounded-md px-4 py-2 w-full text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <button className="absolute right-3 top-2.5 text-gray-500 hover:text-green-600 transition">
            <FaSearch />
          </button>
        </div>

        {/* Right Section */}
        <div className="hidden lg:flex items-center gap-6 text-sm">

          <div className="flex items-center gap-2 text-gray-600">
            <FiMail className="text-lg" />
            <span className="text-xs">heavenautojessore@gmail.com</span>
          </div>

          <div className="flex items-center gap-2 border-l pl-4 text-gray-600">
            <MdHeadsetMic className="text-lg" />
            <span className="text-xs">01924-331354</span>
          </div>

          {/* Account */}
          <div className="relative border-l pl-4">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 hover:text-green-600 transition text-gray-700"
            >
              <FaUser />
              <span className="text-xs font-medium">Account</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border shadow-md rounded-2xltext-xs">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 hover:bg-green-500"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/authentication"
                    className="block px-3 py-2 hover:bg-gray-100"
                  >
                    Login / Register
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link href="/cart" className="relative border-l pl-4">
            <FaShoppingCart className="text-lg hover:text-green-600 transition" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 text-[10px] bg-red-600 text-white rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ================= Desktop Menu (Boxy Animated) ================= */}
      <div className="hidden lg:flex items-center justify-center gap-4 px-6 py-1 bg-[#FAFBFC]">

        <Link
          href="/"
          className={`${navButton} ${
            pathname === "/" ? activeButton : inactiveButton
          }`}
        >
          Home
        </Link>

        <Link
          href="/brands"
          className={`${navButton} ${
            pathname === "/brands" ? activeButton : inactiveButton
          }`}
        >
          Brands
        </Link>

        <Link
          href="/accessories"
          className={`${navButton} ${
            pathname === "/accessories" ? activeButton : inactiveButton
          }`}
        >
          Accessories
        </Link>

        <Link
          href="/how-to-order"
          className={`${navButton} ${
            pathname === "/how-to-order" ? activeButton : inactiveButton
          }`}
        >
          How to Order
        </Link>

        <Link
          href="/contact"
          className={`${navButton} ${
            pathname === "/contact" ? activeButton : inactiveButton
          }`}
        >
          Contact
        </Link>

        {isAuthenticated && (
          <Link
            href="/dashboard"
            className={`${navButton} ${
              pathname === "/dashboard" ? activeButton : inactiveButton
            }`}
          >
            Dashboard
          </Link>
        )}
      </div>

      {/* ================= Mobile Menu ================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden flex flex-col px-4 space-y-2 pb-4 text-sm font-medium bg-white border-t">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link href="/brands" onClick={() => setMobileMenuOpen(false)}>Brands</Link>
          <Link href="/accessories" onClick={() => setMobileMenuOpen(false)}>Accessories</Link>
          <Link href="/how-to-order" onClick={() => setMobileMenuOpen(false)}>How to Order</Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
