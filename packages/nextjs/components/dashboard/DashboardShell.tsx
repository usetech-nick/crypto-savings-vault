"use client";

import React from "react";
import deployedContractsData from "../../contracts/deployedContracts";
import BalanceCard from "./BalanceCard";
import DepositForm from "./DepositForm";
import StatCard from "./StatCard";
import WithdrawForm from "./WithdrawForm";
import { Toaster } from "react-hot-toast";
import { formatEther } from "viem";
import { useContractRead, useWalletClient } from "wagmi";

// components/dashboard/DashboardShell.tsx

// adjust if needed

export default function DashboardShell() {
  const { data: wallet } = useWalletClient();
  const user = wallet?.account?.address;

  const contract = deployedContractsData[11155111].CryptoSavingsVault;

  /** ---------------------------
   *  READ: Earned Interest
   *  -------------------------- */
  const { data: earnedRaw } = useContractRead({
    address: contract.address,
    abi: contract.abi,
    functionName: "calculateInterest",
    args: user ? [user] : undefined,
  });
  const earned = earnedRaw ? `${formatEther(earnedRaw)} ETH` : "Loading...";

  /** ---------------------------
   *  READ: Current APR
   *  -------------------------- */
  const { data: aprRaw } = useContractRead({
    address: contract.address,
    abi: contract.abi,
    functionName: "getCurrentAPR",
  });
  const apr = aprRaw ? aprRaw.toString() : "Loading...";

  /** ---------------------------
   *  READ: ETH Price (Tellor)
   *  -------------------------- */
  const { data: priceRaw } = useContractRead({
    address: contract.address,
    abi: contract.abi,
    functionName: "getETHPrice",
  });

  const ethPrice = priceRaw ? Number(priceRaw).toFixed(2) : "Loading...";

  return (
    <main className="min-h-screen bg-black/95 text-white p-6">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        <header className="text-center py-8">
          <h1 className="text-4xl font-extrabold">Savings Dashboard</h1>
          <p className="mt-2 text-gray-300">Manage your crypto savings and earn interest</p>
        </header>

        {/* -----------------------------------
            TOP STATS ROW
        ------------------------------------- */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <BalanceCard />

          <StatCard label="Earned Interest" value={earned} accent="green" />
          <StatCard label="Current APR" value={`${(Number(apr) / 100).toFixed(2)}%`} accent="blue" />
          <StatCard label="ETH Price" value={`$${ethPrice}`} accent="purple" />
        </section>

        {/* -----------------------------------
            DEPOSIT / WITHDRAW
        ------------------------------------- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DepositForm />
          <WithdrawForm />
        </section>

        {/* -----------------------------------
            APR Explanation
        ------------------------------------- */}
        <section className="bg-white/5 p-6 rounded-2xl border border-white/5">
          <h3 className="font-semibold mb-2">How APR Works</h3>
          <p className="text-sm text-gray-300">
            APR flips depending on ETH price (Tellor). When ETH price is below the threshold, high APR applies —
            otherwise low APR applies.
          </p>
        </section>
      </div>
    </main>
  );
}
