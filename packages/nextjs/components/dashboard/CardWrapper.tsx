"use client";

import React from "react";

export default function CardWrapper({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-white/10 bg-white/2 px-6 py-6 shadow-lg">{children}</div>;
  // components/dashboard/CardWrapper.tsx
}
