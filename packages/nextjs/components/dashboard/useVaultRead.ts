"use client";

import deployedContractsData from "../../contracts/deployedContracts";
import { useContractRead } from "wagmi";

export default function useVaultRead(functionName: string, args?: any) {
  const contract = deployedContractsData[11155111].CryptoSavingsVault;

  return useContractRead({
    address: contract.address as `0x${string}`,
    abi: contract.abi,
    functionName: functionName as any,
    args: args ? [args] : undefined,
  });
}
