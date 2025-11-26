import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("CryptoSavingsVault (Dynamic Rules Version)", function () {
  let vault: any;
  let tellor: any;
  let owner: any;
  let user1: any;
  let user2: any;

  // -----------------------
  // Constructor parameters
  // -----------------------
  const MIN_DEPOSIT = ethers.parseEther("0.01");
  const MAX_DEPOSIT = ethers.parseEther("100");
  const ETH_THRESHOLD = ethers.parseUnits("3000", 18);
  const HIGH_APR = 600;
  const LOW_APR = 300;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Give users tons of ETH (for testing)
    const bigEth = 10000n * 10n ** 18n;
    await ethers.provider.send("hardhat_setBalance", [user1.address, "0x" + bigEth.toString(16)]);
    await ethers.provider.send("hardhat_setBalance", [user2.address, "0x" + bigEth.toString(16)]);

    // -------------------------
    // Deploy Tellor mock
    // -------------------------
    const TellorMock = await ethers.getContractFactory("TellorMock");
    tellor = await TellorMock.deploy(ethers.parseUnits("2000", 18)); // price < 3000 => HIGH APR
    await tellor.waitForDeployment();

    // -------------------------
    // Deploy vault
    // -------------------------
    const Vault = await ethers.getContractFactory("CryptoSavingsVault");
    vault = await Vault.deploy(await tellor.getAddress(), MIN_DEPOSIT, MAX_DEPOSIT, ETH_THRESHOLD, HIGH_APR, LOW_APR);
    await vault.waitForDeployment();
  });

  // -------------------------------------------------------
  // Deployment
  // -------------------------------------------------------
  describe("Deployment", function () {
    it("Sets the correct Tellor oracle", async function () {
      expect(await vault.tellorOracle()).to.equal(await tellor.getAddress());
    });

    it("Sets rule variables correctly", async function () {
      expect(await vault.minDeposit()).to.equal(MIN_DEPOSIT);
      expect(await vault.maxDeposit()).to.equal(MAX_DEPOSIT);
      expect(await vault.ethThreshold()).to.equal(ETH_THRESHOLD);
      expect(await vault.highAprBps()).to.equal(HIGH_APR);
      expect(await vault.lowAprBps()).to.equal(LOW_APR);
    });

    it("Starts with zero total staked", async function () {
      expect(await vault.totalStaked()).to.equal(0);
    });
  });

  // -------------------------------------------------------
  // Staking
  // -------------------------------------------------------
  describe("Staking", function () {
    it("Allows staking ETH", async function () {
      const amount = ethers.parseEther("1");
      await expect(vault.connect(user1).stake({ value: amount })).to.emit(vault, "Staked");
      expect(await vault.balances(user1.address)).to.equal(amount);
    });

    it("Rejects zero stake", async function () {
      await expect(vault.connect(user1).stake({ value: 0 })).to.be.revertedWith("Amount must be > 0");
    });

    it("Rejects below min deposit", async function () {
      await expect(vault.connect(user1).stake({ value: 1 })).to.be.reverted;
    });

    it("Rejects above max total deposit", async function () {
      await expect(vault.connect(user1).stake({ value: ethers.parseEther("200") })).to.be.reverted;
    });

    it("Allows multiple stakes and accumulates correctly", async function () {
      await vault.connect(user1).stake({ value: ethers.parseEther("1") });
      await vault.connect(user1).stake({ value: ethers.parseEther("2") });

      expect(await vault.balances(user1.address)).to.equal(ethers.parseEther("3"));
    });
  });

  // -------------------------------------------------------
  // Interest Calculation
  // -------------------------------------------------------
  describe("Interest Calculation", function () {
    it("Zero interest immediately after stake", async function () {
      await vault.connect(user1).stake({ value: ethers.parseEther("1") });
      expect(await vault.calculateInterest(user1.address)).to.equal(0);
    });

    it("Accrues interest over time", async function () {
      await vault.connect(user1).stake({ value: ethers.parseEther("100") });
      await time.increase(30 * 24 * 60 * 60); // 30 days

      const interest = await vault.calculateInterest(user1.address);
      expect(interest).to.be.gt(0);
    });

    it("Reports HIGH APR when price < threshold", async function () {
      expect(await vault.getCurrentAPR()).to.equal(HIGH_APR);
    });

    it("Reports LOW APR when price > threshold", async function () {
      await tellor.setPrice(ethers.parseUnits("4000", 18)); // above threshold
      expect(await vault.getCurrentAPR()).to.equal(LOW_APR);
    });
  });

  // -------------------------------------------------------
  // Withdrawals
  // -------------------------------------------------------
  describe("Withdrawals", function () {
    beforeEach(async function () {
      await vault.connect(user1).stake({ value: ethers.parseEther("1") });

      // give vault 10 ETH so it can pay interest
      await owner.sendTransaction({
        to: await vault.getAddress(),
        value: ethers.parseEther("10"),
      });
    });

    it("Allows withdrawing part of stake", async function () {
      await expect(vault.connect(user1).withdraw(ethers.parseEther("0.5"))).to.emit(vault, "Withdrawn");

      expect(await vault.balances(user1.address)).to.equal(ethers.parseEther("0.5"));
    });

    it("Rejects zero withdrawal", async function () {
      await expect(vault.connect(user1).withdraw(0)).to.be.revertedWith("Amount must be > 0");
    });

    it("Rejects withdrawing more than balance", async function () {
      await expect(vault.connect(user1).withdraw(ethers.parseEther("10"))).to.be.revertedWith("Insufficient balance");
    });

    it("Allows full withdrawal", async function () {
      const bal = await vault.balances(user1.address);

      await vault.connect(user1).withdraw(bal);
      expect(await vault.balances(user1.address)).to.equal(0);
    });
  });

  // -------------------------------------------------------
  // Views
  // -------------------------------------------------------
  describe("View helpers", function () {
    it("Returns correct total balance", async function () {
      await vault.connect(user1).stake({ value: ethers.parseEther("1") });
      await time.increase(10 * 24 * 60 * 60);

      const interest = await vault.calculateInterest(user1.address);
      const principal = await vault.balances(user1.address);
      const total = await vault.getTotalBalance(user1.address);

      expect(total).to.equal(principal + interest);
    });

    it("Returns zero for unstaked user", async function () {
      expect(await vault.getTotalBalance(user2.address)).to.equal(0);
    });
  });

  // -------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------
  describe("Edge cases", function () {
    it("Rejects tiny stake below minDeposit", async function () {
      await expect(
        vault.connect(user1).stake({ value: 1 }), // 1 wei
      ).to.be.revertedWith("Below min deposit");
    });

    it("Allows large stake below maxDeposit", async function () {
      const largeStake = ethers.parseEther("80"); // maxDeposit = 100 ETH
      await vault.connect(user1).stake({ value: largeStake });
      expect(await vault.balances(user1.address)).to.equal(largeStake);
    });

    it("Rejects stake above maxDeposit", async function () {
      const tooLarge = ethers.parseEther("200");
      await expect(vault.connect(user1).stake({ value: tooLarge })).to.be.revertedWith("Above max deposit");
    });
  });
});
