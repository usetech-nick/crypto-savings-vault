"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ArrowDownTrayIcon, ArrowUpTrayIcon, ChartBarIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Read user's balance from vault
  const { data: userBalance, refetch: refetchBalance } = useScaffoldReadContract({
    contractName: "CryptoSavingsVault",
    functionName: "balances",
    args: [address],
  });

  // Read user's accrued interest
  const { data: userInterest, refetch: refetchInterest } = useScaffoldReadContract({
    contractName: "CryptoSavingsVault",
    functionName: "calculateInterest",
    args: [address],
  });

  // Read current APR
  const { data: currentAPR } = useScaffoldReadContract({
    contractName: "CryptoSavingsVault",
    functionName: "getCurrentAPR",
  });

  // Read ETH price
  const { data: ethPrice } = useScaffoldReadContract({
    contractName: "CryptoSavingsVault",
    functionName: "getETHPrice",
  });

  // Deposit transaction
  const { writeContractAsync: deposit, isMining: isDepositing } = useScaffoldWriteContract({
    contractName: "CryptoSavingsVault",
  });

  // Withdraw transaction
  const { writeContractAsync: withdraw, isMining: isWithdrawing } = useScaffoldWriteContract({
    contractName: "CryptoSavingsVault",
  });

  // Format ETH price for display
  const formatETHPrice = (price: bigint | undefined) => {
    if (!price) return "Loading...";
    return `$${(Number(price) / 1e18).toFixed(2)}`;
  };

  // Format APR for display
  const formatAPR = (apr: bigint | undefined) => {
    if (!apr) return "Loading...";
    return `${Number(apr) / 100}%`;
  };

  // Format balance for display
  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return "0 ETH";
    return `${(Number(balance) / 1e18).toFixed(6)} ETH`;
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) return;
    
    try {
      const amountInWei = BigInt(Math.floor(Number(depositAmount) * 1e18));
      
      await deposit({
        functionName: "stake",
        value: amountInWei,
      }, {
        onBlockConfirmation: (txnReceipt: any) => {
          console.log("Deposit confirmed!", txnReceipt);
          setDepositAmount("");
          refetchBalance();
          refetchInterest();
        },
      });
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;
    
    try {
      const amountInWei = BigInt(Math.floor(Number(withdrawAmount) * 1e18));
      
      await withdraw({
        functionName: "withdraw",
        args: [amountInWei],
      }, {
        onBlockConfirmation: (txnReceipt: any) => {
          console.log("Withdrawal confirmed!", txnReceipt);
          setWithdrawAmount("");
          refetchBalance();
          refetchInterest();
        },
      });
    } catch (error) {
      console.error("Withdraw failed:", error);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold">Welcome to Crypto Savings Vault</h1>
          <p className="text-muted-foreground">Please connect your wallet to access the dashboard</p>
          <div className="flex justify-center">
            <w3m-button />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Savings Dashboard</h1>
          <p className="text-muted-foreground">Manage your crypto savings and earn interest</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 border">
            <div className="flex items-center gap-3 mb-2">
              <CurrencyDollarIcon className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold">Your Balance</h3>
            </div>
            <p className="text-2xl font-bold">
              {formatBalance(userBalance)}
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border">
            <div className="flex items-center gap-3 mb-2">
              <ChartBarIcon className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold">Earned Interest</h3>
            </div>
            <p className="text-2xl font-bold text-green-500">
              {formatBalance(userInterest)}
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border">
            <div className="flex items-center gap-3 mb-2">
              <ChartBarIcon className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold">Current APR</h3>
            </div>
            <p className="text-2xl font-bold text-blue-500">
              {formatAPR(currentAPR)}
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border">
            <div className="flex items-center gap-3 mb-2">
              <CurrencyDollarIcon className="w-6 h-6 text-purple-500" />
              <h3 className="text-lg font-semibold">ETH Price</h3>
            </div>
            <p className="text-2xl font-bold text-purple-500">
              {formatETHPrice(ethPrice)}
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Deposit Card */}
          <div className="bg-card rounded-lg p-6 border">
            <div className="flex items-center gap-3 mb-6">
              <ArrowDownTrayIcon className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-bold">Deposit ETH</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount (ETH)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full p-3 border rounded-lg bg-background"
                />
              </div>
              
              <button
                onClick={handleDeposit}
                disabled={isDepositing || !depositAmount || Number(depositAmount) <= 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDepositing ? "Processing..." : "Deposit ETH"}
              </button>
              
              {userBalance !== undefined && userBalance > 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Current balance: {formatBalance(userBalance)}
                </p>
              )}
            </div>
          </div>

          {/* Withdraw Card */}
          <div className="bg-card rounded-lg p-6 border">
            <div className="flex items-center gap-3 mb-6">
              <ArrowUpTrayIcon className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold">Withdraw ETH</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount (ETH)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full p-3 border rounded-lg bg-background"
                />
              </div>
              
              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing || !withdrawAmount || Number(withdrawAmount) <= 0}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWithdrawing ? "Processing..." : "Withdraw ETH"}
              </button>
              
              {userBalance !== undefined && userBalance > 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Available: {formatBalance(userBalance)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* APR Information */}
        <div className="mt-8 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold mb-2">How APR Works</h3>
          <p className="text-sm text-muted-foreground">
            {currentAPR && Number(currentAPR) === 600 
              ? "Current APR is 6% because ETH price is below $3,000"
              : currentAPR && Number(currentAPR) === 300
              ? "Current APR is 3% because ETH price is above $3,000"
              : "Loading APR information..."
            }
          </p>
          <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside">
            <li>ETH &lt; $3,000 → 6% APR</li>
            <li>ETH ≥ $3,000 → 3% APR</li>
          </ul>
        </div>

        {/* Transaction Status */}
        {(isDepositing || isWithdrawing) && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-yellow-800 dark:text-yellow-200 text-center">
              ⏳ Transaction in progress... Please wait for confirmation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}