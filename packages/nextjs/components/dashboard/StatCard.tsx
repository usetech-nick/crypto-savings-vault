"use client";

import React from "react";

export default function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: "green" | "blue" | "purple";
}) {
  const color = {
    green: "text-green-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
  }[accent];

  return (
    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
      <p className="text-sm text-gray-400">{label}</p>
      <h2 className={`mt-2 text-2xl font-semibold ${color}`}>{value}</h2>
    </div>
  );
}
