"use client";

import deployedContractsData from "../../contracts/deployedContracts";
import { useReadContract } from "wagmi";

type VaultFunctions =
  | "balances"
  | "calculateInterest"
  | "getCurrentAPR"
  | "getETHPrice"
  | "getTotalBalance"
  | "accruedInterest"
  | "stakeTimestamps"
  | "tellorOracle"
  | "minDeposit"
  | "maxDeposit"
  | "ethThreshold"
  | "highAprBps"
  | "lowAprBps";

export default function useVaultRead(fn: VaultFunctions, args?: any) {
  const contract = deployedContractsData[11155111].CryptoSavingsVault;

  return useReadContract({
    address: contract.address as `0x${string}`,
    abi: contract.abi,
    functionName: fn,
    args: args ? [args] : undefined,
    query: {
      refetchInterval: 3000, // keeps UI live
    },
  });
}
