
require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

let contractInstance = null;

/**
 * Inicializa y devuelve una instancia del contrato.
 * Este patrón asegura que las variables de entorno estén disponibles
 * en tiempo de ejecución y evita errores durante el build Docker.
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
