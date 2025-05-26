const fs = require("fs");
const path = require("path");

if (fs.existsSync(path.join(__dirname, ".env"))) {
    require("dotenv").config();
}

const { ethers } = require("ethers");

let contractInstance = null;

/**
 * Inicializa el contrato solo una vez (lazy load).
 * Usa variables de entorno ya definidas (por Docker o dotenv).
 */
function getContract() {
    if (contractInstance) return contractInstance;

    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const contractABI = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, "artifacts/contracts/PackageTraceability.sol/PackageTraceability.json"),
            "utf8"
        )
    ).abi;

    const contractAddress = process.env.CONTRACT_ADDRESS;
    contractInstance = new ethers.Contract(contractAddress, contractABI, wallet);
    return contractInstance;
}

module.exports = getContract;
