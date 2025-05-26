const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

function getContract() {
    const RPC_URL = process.env.SEPOLIA_RPC_URL;
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

    if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
        throw new Error("Faltan variables de entorno para configurar el contrato.");
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    const abiPath = path.join(__dirname, "artifacts", "contracts", "PackageTraceability.sol", "PackageTraceability.json");
    const abi = JSON.parse(fs.readFileSync(abiPath)).abi;

    return new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);
}

module.exports = getContract;
