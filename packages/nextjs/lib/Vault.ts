// lib/vault.ts
import vaultJson from "../contracts/CryptoSavingsVault.json";

// adjust path if needed
export const vaultContract = {
  address: (vaultJson as any).address || "0xB74Ea09d31558889570410731C8006912c0A840b",
  abi: (vaultJson as any).abi,
};

export function useVaultContract() {
  // tiny wrapper so components can import a stable object
  return { contract: vaultContract };
}
