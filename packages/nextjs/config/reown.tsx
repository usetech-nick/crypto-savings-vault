import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { hardhat, mainnet, sepolia } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

// 1. Get projectId
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_REOWN_PROJECT_ID is not set");
}

// 2. Set up Wagmi adapter
const networks = [mainnet, sepolia, hardhat];

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

// 3. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, sepolia, hardhat],
  projectId,
  features: {
    analytics: true, // Optional - 0/1 analytics
    email: true, // Enable email login
    socials: ["google", "github", "apple"], // Social logins
    emailShowWallets: true, // Show wallet options with email
  },
  themeMode: "light", // or 'dark'
  themeVariables: {
    "--w3m-accent": "#3b82f6", // Customize colors
  },
});

const queryClient = new QueryClient();

export function ReownProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export { wagmiAdapter };
