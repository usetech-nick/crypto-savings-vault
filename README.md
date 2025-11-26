# 🏦 Vault dApp — ETH Staking With Interest (Built on Scaffold-ETH 2)

A decentralized ETH staking vault where users can deposit ETH, earn interest over time, and withdraw their stake plus rewards.  
This project fully integrates smart contracts, a React/Next.js frontend, and the Tellor Oracle for decentralized data reads.

**Built as part of the Encode EVM Bootcamp Final Project.**

---

## ✨ Features

- 💰 **Stake ETH** into the vault
- 📈 **Earn interest** over time using precise timestamp-based calculations
- 🔐 **Withdraw** principal + interest anytime
- 🛰 **Tellor Oracle** integration for secure external data
- 🧪 **Full test suite** covering:
  - normal flows
  - multiple users
  - reward math
  - tiny/large stakes
  - edge-case scenarios
- 🧹 **Gas-safe & overflow-protected** contract logic
- ⚡ **Live frontend** built using Scaffold-ETH 2
- 🔥 Auto-generated hooks, contract hot reload, local faucet, burner wallet, wallet adapters, etc.

---

## 🧱 Tech Stack

### Smart Contracts
- Solidity ^0.8.20
- Hardhat
- Tellor Oracle (ITellor interface)
- TypeChain
- Ethers / Viem

### Frontend
- Next.js (App Router)
- React + TypeScript
- Wagmi + Viem
- Reown wallet adapter
- Tailwind
- Zustand (if used)

### Developer UX (via Scaffold-ETH 2)
- Contract hot reload
- Auto-generated TypeScript hooks
- Debug UI
- Local Hardhat faucet
- Burner wallet support

---

## 📦 Project Structure
```
packages/
├── hardhat/
│   ├── contracts/
│   │   ├── Vault.sol
│   │   └── ITellor.sol
│   ├── deploy/
│   │   └── 00-deploy-vault.ts
│   ├── test/
│   │   └── Vault.t.sol (or *.ts)
│   └── hardhat.config.ts
│
└── nextjs/
    ├── app/
    │   ├── page.tsx
    │   └── vault/
    │       ├── stake.tsx
    │       └── withdraw.tsx
    ├── components/
    │   └── VaultUI.tsx
    ├── scaffold.config.ts
    └── hooks/
```

---

## 🚀 Quickstart

### 1️⃣ Install dependencies
```bash
cd your-project
yarn install
```

### 2️⃣ Start local Hardhat chain
```bash
yarn chain
```

### 3️⃣ Deploy contracts
```bash
yarn deploy
```

This deploys:
- Vault.sol
- Tellor interface registration

### 4️⃣ Start frontend
```bash
yarn start
```

Visit: http://localhost:3000

---

## 🔍 How The Vault Works

### 1. Staking
Users deposit ETH → contract records:
- amount staked
- timestamp

### 2. Interest Calculation
Rewards are based on:
```
interest = (amount * APR * timeElapsed) / YEAR
```

APR is currently constant (or future-read via Tellor).

### 3. Tellor Integration
The dApp reads external data securely from Tellor:
- real timestamp values
- optional market data
- fallback protection

Interface used:
```solidity
interface ITellor {
    function getDataBefore(bytes32 _queryId, uint256 _timestamp)
        external
        view
        returns (...);
}
```

### 4. Withdraw
Users receive:
- original stake
- earned interest
- vault updates their state

---

## 🧪 Testing

Run full test suite:
```bash
yarn hardhat:test
```

Tests cover:
- ✔ Basic staking
- ✔ Multiple users
- ✔ Withdrawals
- ✔ Reward math
- ✔ Tiny stakes (1 wei)
- ✔ Long-duration stakes
- ✔ Correct use of block timestamps
- ✔ Tellor mock oracle reads
- ✔ New edge cases:
  - zero stake
  - double withdrawal prevention
  - overflow protection

---

## 🧩 Contract Highlights

**Vault.sol** includes:
- `stake()`
- `withdraw()`
- `_calculateInterest()`
- mapping of user positions
- events for Stake + Withdraw
- Tellor oracle calls
- safe ETH transfer pattern

**Recent improvements:**
- interest formula corrections
- timestamp safety
- subtraction of tiny stake rounding errors
- added edge-case tests
- optimized gas paths

---

## 🎨 Frontend Highlights

- Clean UI for staking & withdrawing
- Reown wallet adapter
- Live balance + rewards preview
- Auto-generated contract hooks
- Debug Contracts page (Scaffold-ETH built-in)
- Fully responsive Tailwind design

---

## 🏗 Built With Scaffold-ETH 2

This project uses the Scaffold-ETH 2 stack for development speed:
- Hot contract reload
- Preconfigured wallets
- Wagmi/Viem integration
- Local faucet
- Debug UI
- Auto-generated TypeScript contract hooks

**Docs:** https://docs.scaffoldeth.io

---

## 🤝 Contributing

Pull requests are welcome — tests required for all new logic.

---

## 📜 License

MIT License.
