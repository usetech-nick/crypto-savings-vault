import * as chains from "viem/chains";

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
  walletAutoConnect: boolean;
};

const scaffoldConfig = {
  // Use Sepolia testnet for your vault
  targetNetworks: [chains.sepolia],
  
  // The interval at which your front-end polls the RPC servers for new data
  pollingInterval: 30000,
  
  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "cR4WnXePioePZ5fFrnSiR",
  
  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",
  
  // Only show Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: true,
  
  // Auto connect
  walletAutoConnect: true,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;