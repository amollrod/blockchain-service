require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contractABI = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "artifacts/contracts/PackageTraceability.sol/PackageTraceability.json"),
        "utf8"
    )
).abi;

const contractAddress = process.env.CONTRACT_ADDRESS;

const contract = new ethers.Contract(contractAddress, contractABI, wallet);

module.exports = contract;
