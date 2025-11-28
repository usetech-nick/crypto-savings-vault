"use client";

import React from "react";
import useVaultRead from "./useVaultRead";
import { formatEther } from "viem";
import { useWalletClient } from "wagmi";

export default function BalanceCard() {
  const { data: wallet } = useWalletClient();
  // components/dashboard/BalanceCard.tsx

  const { data: balance } = useVaultRead("balances", wallet?.account?.address);
  const { data: interest } = useVaultRead("calculateInterest", wallet?.account?.address);

  const balanceBn = balance ? BigInt(balance) : 0n;
  const interestBn = interest ? BigInt(interest) : 0n;

  const total = formatEther(balanceBn + interestBn);

  return (
    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
      <p className="text-sm text-gray-400">Your Balance</p>
      <h2 className="mt-2 text-2xl font-semibold text-purple-400">{total} ETH</h2>
    </div>
  );
}
