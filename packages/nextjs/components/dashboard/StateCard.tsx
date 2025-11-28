// components/dashboard/StatCard.tsx
"use client";

import React from "react";
import { useVaultContract } from "../../lib/Vault";
import CardWrapper from "./CardWrapper";
import { useAccount } from "wagmi";
import { useContractRead } from "wagmi";

// components/dashboard/StatCard.tsx

// components/dashboard/StatCard.tsx

// components/dashboard/StatCard.tsx

// components/dashboard/StatCard.tsx

// components/dashboard/StatCard.tsx

// components/dashboard/StatCard.tsx

// components/dashboard/StatCard.tsx

// components/dashboard/StatCard.tsx

// components/dashboard/StatCard.tsx

// components/dashboard/StatCard.tsx

// components/dashboard/StatCard.tsx

// components/dashboard/StatCard.tsx

type Props = {
  label: string;
  valueKey: "earned" | "apr" | "price";
  accent?: "green" | "blue" | "purple";
};

export default function StatCard({ label, valueKey, accent = "blue" }: Props) {
  const { address } = useAccount();
  const { contract } = useVaultContract();

  const readOpts: any = {
    address: contract.address,
    abi: contract.abi,
    watch: true,
    enabled: false,
  };

  if (valueKey === "earned") {
    readOpts.functionName = "calculateInterest";
    readOpts.args = address ? [address] : undefined;
    readOpts.enabled = !!address;
  } else if (valueKey === "apr") {
    readOpts.functionName = "getCurrentAPR";
    readOpts.enabled = true;
  } else if (valueKey === "price") {
    readOpts.functionName = "getETHPrice";
    readOpts.enabled = true;
  }

  const { data, isLoading } = useContractRead(readOpts);

  let display = "Loading...";
  if (!isLoading && data != null) {
    if (valueKey === "apr") {
      // APR is in basis points (e.g. 600 => 6%)
      const aprBps = Number(data as any);
      display = `${(aprBps / 100).toFixed(2)}%`;
    } else {
      // price or earned — both are wei-like values (18 decimals)
      const val = BigInt(data as any);
      const eth = Number(val) / 1e18;
      display =
        valueKey === "price"
          ? `$${eth.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
          : `${eth.toFixed(6)} ETH`;
    }
  }

  const color = accent === "green" ? "text-emerald-400" : accent === "purple" ? "text-violet-400" : "text-sky-400";

  return (
    <CardWrapper>
      <h4 className="text-sm text-gray-300">{label}</h4>
      <div className={`mt-4 text-2xl font-semibold ${color}`}>{isLoading ? "Loading..." : display}</div>
    </CardWrapper>
  );
}
