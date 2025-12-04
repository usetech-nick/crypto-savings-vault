"use client";

import React from "react";
import deployedContractsData from "../../contracts/deployedContracts";
import BalanceCard from "./BalanceCard";
import DepositForm from "./DepositForm";
import StatCard from "./StatCard";
import WithdrawForm from "./WithdrawForm";
import { Toaster } from "react-hot-toast";
import { formatEther } from "viem";
import { useReadContract, useWalletClient } from "wagmi";

export default function DashboardShell() {
  const { data: wallet } = useWalletClient();
  const user = wallet?.account?.address;

  const contract = deployedContractsData[11155111].CryptoSavingsVault;

  /** Format ETH Helper */
  const formatETH = (raw: any) => {
    if (!raw) return "0.00";
    const eth = parseFloat(formatEther(raw));

    if (eth >= 1) return eth.toFixed(3); // e.g. 2.345
    if (eth >= 0.01) return eth.toFixed(4); // e.g. 0.0456
    return eth.toFixed(6); // e.g. 0.000456
  };

  /** ---------------------------
   *  READ: Earned Interest
   *  -------------------------- */
  const { data: earnedRaw } = useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: "calculateInterest",
    args: user ? [user] : undefined,
  });

  const earnedEth = earnedRaw ? formatETH(earnedRaw) : "0.00";

  /** ---------------------------
   *  READ: Current APR
   *  -------------------------- */
  const { data: aprRaw } = useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: "getCurrentAPR",
  });

  const apr = aprRaw ? (Number(aprRaw) / 100).toFixed(2) : "0.00";

  /** ---------------------------
   *  READ: ETH Price (Tellor)
   *  -------------------------- */
  const { data: priceRaw } = useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: "getETHPrice",
  });

  const ethPrice = priceRaw ? Number(priceRaw) : 0;
  const ethPriceFormatted = ethPrice.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
          {/* BalanceCard handles formatting inside */}
          <BalanceCard ethPrice={ethPrice} />

          <StatCard
            label="Earned Interest"
            value={`${earnedEth} ETH`}
            subvalue={`$${(Number(earnedEth) * ethPrice).toFixed(2)}`}
            accent="green"
          />

          <StatCard label="Current APR" value={`${apr}%`} accent="blue" />

          <StatCard label="ETH Price" value={`$${ethPriceFormatted}`} accent="purple" />
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
