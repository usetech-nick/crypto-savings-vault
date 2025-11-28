"use client";

import Navbar from "../components/NavBar";
import "../config/reown";
import { ReownProvider } from "../config/reown";
import "../styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="pt-20">
        {/* Navbar is fixed at top, so we add padding-top */}
        <ReownProvider>
          <Navbar /> {/* ✅ RENDER IT HERE */}
          {children}
        </ReownProvider>
      </body>
    </html>
  );
}
