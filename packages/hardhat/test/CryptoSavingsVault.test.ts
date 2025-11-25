import { expect } from "chai";
import { ethers } from "hardhat";
// import { CryptoSavingsVault } from "../typechain-types";
// import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("CryptoSavingsVault (ETH Version)", function () {
  let vault: any;
  let tellor: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [user1, user2] = await ethers.getSigners();

    // Fund test signers heavily so large stakes + gas never fail
    const bigEth = 10000n * 10n ** 18n; // 10k ETH
    await ethers.provider.send("hardhat_setBalance", [user1.address, "0x" + bigEth.toString(16)]);
    await ethers.provider.send("hardhat_setBalance", [user2.address, "0x" + bigEth.toString(16)]);

    // Deploy Tellor mock
    const TellorMock = await ethers.getContractFactory("TellorMock");
    tellor = await TellorMock.deploy(ethers.parseEther("2000"));
    await tellor.waitForDeployment();

    // Deploy vault with mock oracle
    const VaultFactory = await ethers.getContractFactory("CryptoSavingsVault");
    vault = await VaultFactory.deploy(await tellor.getAddress());
    await vault.waitForDeployment();
  });

  // -------------------------------------------------------
  // Deployment
  // -------------------------------------------------------
  describe("Deployment", function () {
    it("Should set the correct Tellor oracle address", async function () {
      expect(await vault.tellorOracle()).to.equal(await tellor.getAddress());
    });

    it("Should have correct APR constants", async function () {
      expect(await vault.HIGH_APR()).to.equal(600); // 6%
      expect(await vault.LOW_APR()).to.equal(300); // 3%
    });

    it("Should have correct ETH threshold", async function () {
      expect(await vault.ETH_THRESHOLD()).to.equal(ethers.parseEther("3000"));
    });

    it("Should start with zero total staked", async function () {
      expect(await vault.totalStaked()).to.equal(0);
    });
  });

  // -------------------------------------------------------
  // Staking
  // -------------------------------------------------------
  describe("Staking", function () {
    it("Should allow users to stake ETH", async function () {
      const stakeAmount = ethers.parseEther("1.0");

      await expect(vault.connect(user1).stake({ value: stakeAmount })).to.emit(vault, "Staked");

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

  // -------------------------------------------------------
  // Interest
  // -------------------------------------------------------
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

      await time.increase(30 * 24 * 60 * 60); // 30 days

      const interest = await vault.calculateInterest(user1.address);

      // 100 * 6% * (30/365) = ~0.49 ETH
      expect(interest).to.be.gt(0);
      expect(interest).to.be.closeTo(ethers.parseEther("0.49"), ethers.parseEther("0.02"));
    });

    it("Should return APR as either HIGH or LOW depending on ETH price", async function () {
      const apr = await vault.getCurrentAPR();
      expect(apr).to.be.oneOf([600n, 300n]);
    });

    it("Should calculate proportionally higher interest for larger stake", async function () {
      const smallStake = ethers.parseEther("1.0");
      const largeStake = ethers.parseEther("10.0");

      await vault.connect(user1).stake({ value: smallStake });
      await vault.connect(user2).stake({ value: largeStake });

      await time.increase(30 * 24 * 60 * 60);

      const interest1 = await vault.calculateInterest(user1.address);
      const interest2 = await vault.calculateInterest(user2.address);

      expect(interest2).to.be.gt(interest1);
      expect(interest2).to.be.closeTo(interest1 * 10n, ethers.parseEther("0.02"));
    });
  });

  // -------------------------------------------------------
  // Withdrawals
  // -------------------------------------------------------
  describe("Withdrawals", function () {
    beforeEach(async function () {
      const stakeAmount = ethers.parseEther("1.0");
      await vault.connect(user1).stake({ value: stakeAmount });
      await user2.sendTransaction({
        to: (await vault.getAddress) ? await vault.getAddress() : vault.address, // works for both ethers v6 factories and plain address
        value: ethers.parseEther("10.0"), // give the vault 10 ETH to cover payouts in tests
      });
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

    it("Should allow full withdrawal", async function () {
      const fullAmount = await vault.balances(user1.address);

      // Withdraw full amount
      await expect(vault.connect(user1).withdraw(fullAmount)).to.emit(vault, "Withdrawn");

      // Principal balance should now be zero
      expect(await vault.balances(user1.address)).to.equal(0n);
    });
  });

  // -------------------------------------------------------
  // View Functions
  // -------------------------------------------------------
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

    it("Should return zero for users who haven't staked", async function () {
      expect(await vault.balances(user2.address)).to.equal(0);
      expect(await vault.getTotalBalance(user2.address)).to.equal(0);
    });
  });

  // -------------------------------------------------------
  // Edge Cases
  // -------------------------------------------------------
  describe("Edge Cases", function () {
    it("Should handle very small stake amounts", async function () {
      const tinyAmount = 1n;

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
