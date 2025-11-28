"use client";

import React, { useState } from "react";
import { useVaultContract } from "../../lib/Vault";
import CardWrapper from "./CardWrapper";
import toast from "react-hot-toast";
import { parseUnits } from "viem";
import { useAccount, useWriteContract } from "wagmi";

// components/dashboard/WithdrawForm.tsx

export default function WithdrawForm() {
  const { address } = useAccount();
  const { contract } = useVaultContract();

  const [amount, setAmount] = useState("0.0");
  const [loading, setLoading] = useState(false);

  const { writeContractAsync } = useWriteContract();

  const onWithdraw = async () => {
    if (!address) return toast.error("Connect wallet first");

    const num = Number(amount);
    if (!num || num <= 0) return toast.error("Enter a valid amount");

    try {
      setLoading(true);
      const wei = parseUnits(amount, 18);

      await writeContractAsync({
        address: contract.address,
        abi: contract.abi,
        functionName: "withdraw",
        args: [wei],
      });

      toast.success("Withdraw submitted!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Withdraw failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardWrapper>
      <h4 className="text-lg font-semibold text-gray-200 mb-4">Withdraw ETH</h4>

      <label className="block text-sm text-gray-300 mb-2">Amount (ETH)</label>
      <input
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="w-full rounded-md border border-white/10 bg-black/50 px-4 py-3 mb-4"
        placeholder="0.0"
      />

      <button
        onClick={onWithdraw}
        disabled={loading}
        className="w-full rounded-lg py-3 font-semibold bg-red-700 hover:bg-red-600 disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Withdraw ETH"}
      </button>
    </CardWrapper>
  );
}
