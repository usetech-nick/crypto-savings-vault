"use client";

import React from "react";
import useVaultRead from "./useVaultRead";
import { formatEther } from "viem";
import { useWalletClient } from "wagmi";

interface Props {
  ethPrice: number; // passed from DashboardShell
}

export default function BalanceCard({ ethPrice }: Props) {
  const { data: wallet } = useWalletClient();

  const { data: balance } = useVaultRead("balances", wallet?.account?.address);
  const { data: interest } = useVaultRead("calculateInterest", wallet?.account?.address);

  const balanceBn = balance ? BigInt(balance) : 0n;
  const interestBn = interest ? BigInt(interest) : 0n;

  const totalWei = balanceBn + interestBn;
  const totalEth = parseFloat(formatEther(totalWei));

  const formatETH = (eth: number) => {
    if (eth >= 1) return eth.toFixed(3);
    if (eth >= 0.01) return eth.toFixed(4);
    return eth.toFixed(6);
  };

  const displayEth = formatETH(totalEth);
  const valueUSD = (totalEth * ethPrice).toFixed(2);

  return (
    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
      <p className="text-sm text-gray-400">Your Balance</p>

      <h2 className="mt-2 text-2xl font-semibold text-purple-400">{displayEth} ETH</h2>

      <p className="text-sm text-gray-400">${valueUSD} USD</p>
    </div>
  );
}
