"use client";

import React from "react";

interface Props {
  label: string;
  value: string | number;
  subvalue?: string | number; // NEW optional line
  accent: "green" | "blue" | "purple";
}

export default function StatCard({ label, value, subvalue, accent }: Props) {
  const color = {
    green: "text-green-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
  }[accent];

  return (
    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
      <p className="text-sm text-gray-400">{label}</p>

      <h2 className={`mt-2 text-2xl font-semibold ${color}`}>{value}</h2>

      {/* NEW USD line below */}
      {subvalue && <p className="text-sm text-gray-400 mt-1">{subvalue}</p>}
    </div>
  );
}
