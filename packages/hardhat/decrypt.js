const fs = require("fs");
const { Wallet } = require("ethers");

// Load the encrypted key from .env
require("dotenv").config();

async function main() {
  const encryptedJson = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED;

  if (!encryptedJson) {
    console.error("❌ DEPLOYER_PRIVATE_KEY_ENCRYPTED not found in .env");
    return;
  }

  const password = await askPassword();

  try {
    const wallet = await Wallet.fromEncryptedJson(encryptedJson, password);
    console.log("\n🔓 Decrypted Private Key:");
    console.log(wallet.privateKey, "\n");
  } catch (err) {
    console.error("❌ Wrong password or corrupted JSON");
    console.error(err);
  }
}

// Ask password from terminal
function askPassword() {
  return new Promise((resolve) => {
    process.stdout.write("Enter your password: ");
    process.stdin.on("data", (data) => {
      resolve(data.toString().trim());
    });
  });
}

main();
