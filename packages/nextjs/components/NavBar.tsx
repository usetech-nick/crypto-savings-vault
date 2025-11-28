"use client";

import React from "react";
import Link from "next/link";
import { AppKitButton } from "@reown/appkit/react";

// your existing button

export default function Navbar() {
  return (
    <nav className="w-full px-6 py-4 flex justify-between items-center bg-black/20 backdrop-blur-xl border-b border-white/10 fixed top-0 z-50">
      {/* Left Section (Logo/Name) */}
      <Link href="/" className="text-lg font-semibold text-white">
        Crypto Savings Vault
      </Link>

      {/* Right Section */}
      <AppKitButton />
    </nav>
  );
}
