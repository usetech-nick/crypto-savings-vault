import { expect } from "chai";
import { ethers } from "hardhat";
import { CryptoSavingsVault } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("CryptoSavingsVault", function () {
  let vault: CryptoSavingsVault;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let tellorMock: string; // For now, just an address

  beforeEach(async function () {
    [user1, user2] = await ethers.getSigners();

    // Deploy with mock Tellor address (we'll create proper mock later)
    tellorMock = "0x0000000000000000000000000000000000000001";

    const VaultFactory = await ethers.getContractFactory("CryptoSavingsVault");
    vault = (await VaultFactory.deploy(tellorMock)) as CryptoSavingsVault;
    await vault.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct Tellor oracle address", async function () {
      expect(await vault.tellorOracle()).to.equal(tellorMock);
    });

    it("Should have correct APR constants", async function () {
      expect(await vault.HIGH_APR()).to.equal(500); // 5%
      expect(await vault.LOW_APR()).to.equal(200); // 2%
    });

    it("Should have correct BTC threshold", async function () {
      expect(await vault.BTC_THRESHOLD()).to.equal(ethers.parseEther("30000"));
    });

    it("Should start with zero total staked", async function () {
      expect(await vault.totalStaked()).to.equal(0);
    });
  });

  describe("Staking", function () {
    it("Should allow users to stake ETH", async function () {
      const stakeAmount = ethers.parseEther("1.0");

      // This will FAIL because stake() is not implemented
      // But it defines what Nishant needs to implement!
      await expect(vault.connect(user1).stake({ value: stakeAmount }))
        .to.emit(vault, "Staked")
        .withArgs(user1.address, stakeAmount, await time.latest());

      expect(await vault.balances(user1.address)).to.equal(stakeAmount);
      expect(await vault.totalStaked()).to.equal(stakeAmount);
    });

    it("Should reject zero amount stakes", async function () {
      await expect(vault.connect(user1).stake({ value: 0 })).to.be.revertedWith("Amount must be > 0");
    });

    it("Should update stake timestamp correctly", async function () {
      const stakeAmount = ethers.parseEther("1.0");

      await vault.connect(user1).stake({ value: stakeAmount });

      const timestamp = await vault.stakeTimestamps(user1.address);
      expect(timestamp).to.be.gt(0);
    });

    it("Should allow multiple users to stake", async function () {
      const amount1 = ethers.parseEther("1.0");
      const amount2 = ethers.parseEther("2.0");

      await vault.connect(user1).stake({ value: amount1 });
      await vault.connect(user2).stake({ value: amount2 });

      expect(await vault.balances(user1.address)).to.equal(amount1);
      expect(await vault.balances(user2.address)).to.equal(amount2);
      expect(await vault.totalStaked()).to.equal(amount1 + amount2);
    });

    it("Should allow users to stake multiple times", async function () {
      const firstStake = ethers.parseEther("1.0");
      const secondStake = ethers.parseEther("0.5");

      await vault.connect(user1).stake({ value: firstStake });
      await vault.connect(user1).stake({ value: secondStake });

      expect(await vault.balances(user1.address)).to.equal(firstStake + secondStake);
    });
  });

  describe("Interest Calculation", function () {
    it("Should calculate zero interest immediately after staking", async function () {
      const stakeAmount = ethers.parseEther("1.0");
      await vault.connect(user1).stake({ value: stakeAmount });

      const interest = await vault.calculateInterest(user1.address);
      expect(interest).to.equal(0);
    });

    it("Should calculate correct interest after time passes", async function () {
      const stakeAmount = ethers.parseEther("100.0");
      await vault.connect(user1).stake({ value: stakeAmount });

      // Advance time by 30 days
      await time.increase(30 * 24 * 60 * 60);

      const interest = await vault.calculateInterest(user1.address);

      // At 5% APR for 30 days: 100 * 0.05 * (30/365) ≈ 0.41 ETH
      // This is approximate due to block timestamp precision
      expect(interest).to.be.gt(0);
      expect(interest).to.be.closeTo(ethers.parseEther("0.41"), ethers.parseEther("0.01"));
    });

    it("Should use HIGH_APR when BTC price < $30k", async function () {
      // This test will need proper Tellor mock
      // For now, just check getCurrentAPR returns expected value
      const apr = await vault.getCurrentAPR();
      expect(apr).to.be.oneOf([500, 200]); // Either HIGH or LOW
    });

    it("Should calculate different interest for different stake amounts", async function () {
      const smallStake = ethers.parseEther("1.0");
      const largeStake = ethers.parseEther("10.0");

      await vault.connect(user1).stake({ value: smallStake });
      await vault.connect(user2).stake({ value: largeStake });

      await time.increase(30 * 24 * 60 * 60);

      const interest1 = await vault.calculateInterest(user1.address);
      const interest2 = await vault.calculateInterest(user2.address);

      // Larger stake should earn more interest
      expect(interest2).to.be.gt(interest1);
      expect(interest2).to.be.closeTo(interest1 * 10n, ethers.parseEther("0.01"));
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      // Stake some ETH first
      const stakeAmount = ethers.parseEther("1.0");
      await vault.connect(user1).stake({ value: stakeAmount });
    });

    it("Should allow users to withdraw staked ETH", async function () {
      const withdrawAmount = ethers.parseEther("0.5");

      await expect(vault.connect(user1).withdraw(withdrawAmount)).to.emit(vault, "Withdrawn");

      expect(await vault.balances(user1.address)).to.equal(ethers.parseEther("0.5"));
    });

    it("Should reject zero amount withdrawals", async function () {
      await expect(vault.connect(user1).withdraw(0)).to.be.revertedWith("Amount must be > 0");
    });

    it("Should reject withdrawals exceeding balance", async function () {
      const tooMuch = ethers.parseEther("2.0");

      await expect(vault.connect(user1).withdraw(tooMuch)).to.be.revertedWith("Insufficient balance");
    });

    it("Should include earned interest in withdrawal", async function () {
      await time.increase(30 * 24 * 60 * 60);

      const initialBalance = await ethers.provider.getBalance(user1.address);
      const withdrawAmount = ethers.parseEther("1.0");

      await vault.connect(user1).withdraw(withdrawAmount);

      const finalBalance = await ethers.provider.getBalance(user1.address);

      // User should receive principal + interest (minus gas)
      // This is approximate due to gas costs
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should update totalStaked after withdrawal", async function () {
      const withdrawAmount = ethers.parseEther("0.5");
      const initialTotal = await vault.totalStaked();

      await vault.connect(user1).withdraw(withdrawAmount);

      expect(await vault.totalStaked()).to.equal(initialTotal - withdrawAmount);
    });

    it("Should allow full withdrawal", async function () {
      const fullAmount = await vault.balances(user1.address);

      await vault.connect(user1).withdraw(fullAmount);

      expect(await vault.balances(user1.address)).to.equal(0);
    });
  });

  describe("View Functions", function () {
    it("Should return correct total balance including interest", async function () {
      const stakeAmount = ethers.parseEther("1.0");
      await vault.connect(user1).stake({ value: stakeAmount });

      await time.increase(30 * 24 * 60 * 60);

      const totalBalance = await vault.getTotalBalance(user1.address);
      const principal = await vault.balances(user1.address);
      const interest = await vault.calculateInterest(user1.address);

      expect(totalBalance).to.equal(principal + interest);
    });

    it("Should return zero balance for users who haven't staked", async function () {
      expect(await vault.balances(user2.address)).to.equal(0);
      expect(await vault.getTotalBalance(user2.address)).to.equal(0);
    });
  });

  describe("Tellor Oracle Integration", function () {
    it("Should return BTC price from oracle", async function () {
      // This will need proper Tellor mock
      const btcPrice = await vault.getBTCPrice();
      expect(btcPrice).to.be.gt(0);
    });

    it("Should return correct APR based on BTC price", async function () {
      const apr = await vault.getCurrentAPR();
      expect(apr).to.be.oneOf([500, 200]);
    });

    it("Should emit event when interest rate changes", async function () {
      // This test requires mocking BTC price changes
      // Will be implemented when Tellor integration is complete
    });
  });

  describe("Edge Cases", function () {
    it("Should handle very small stake amounts", async function () {
      const tinyAmount = 1n; // 1 wei

      await vault.connect(user1).stake({ value: tinyAmount });
      expect(await vault.balances(user1.address)).to.equal(tinyAmount);
    });

    it("Should handle very large stake amounts", async function () {
      const largeAmount = ethers.parseEther("1000.0");

      await vault.connect(user1).stake({ value: largeAmount });
      expect(await vault.balances(user1.address)).to.equal(largeAmount);
    });

    it("Should handle multiple withdrawals", async function () {
      const stakeAmount = ethers.parseEther("2.0");
      await vault.connect(user1).stake({ value: stakeAmount });

      await vault.connect(user1).withdraw(ethers.parseEther("0.5"));
      await vault.connect(user1).withdraw(ethers.parseEther("0.5"));

      expect(await vault.balances(user1.address)).to.equal(ethers.parseEther("1.0"));
    });
  });
});
