require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Configuración de Ethereum
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Cargar ABI y dirección del contrato
const contractABI = JSON.parse(
    fs.readFileSync(path.join(__dirname, "artifacts/contracts/PackageTraceability.sol/PackageTraceability.json"), "utf8")
).abi;

const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// **1. Endpoint para obtener un paquete por ID**
app.get("/package/:id", async (req, res) => {
    try {
        const packageId = req.params.id;
        const packageData = await contract.getPackage(packageId);
        res.json({
            id: packageData[0].toString(),
            origin: packageData[1],
            destination: packageData[2],
            status: packageData[3],
            timestamp: packageData[4].toString(),
        });
    } catch (error) {
        console.error("Error fetching package:", error);
        res.status(500).json({ error: "Error fetching package" });
    }
});

// **2. Endpoint para registrar un paquete en la blockchain**
app.post("/package", async (req, res) => {
    try {
        const { id, origin, destination } = req.body;
        const tx = await contract.createPackage(id, origin, destination);
        await tx.wait();
        res.json({ message: "Package created successfully", txHash: tx.hash });
    } catch (error) {
        console.error("Error creating package:", error);
        res.status(500).json({ error: "Error creating package" });
    }
});

// **3. Endpoint para actualizar el estado de un paquete**
app.put("/package/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const packageId = req.params.id;
        const tx = await contract.updatePackageStatus(packageId, status);
        await tx.wait();
        res.json({ message: "Package status updated", txHash: tx.hash });
    } catch (error) {
        console.error("Error updating package status:", error);
        res.status(500).json({ error: "Error updating package status" });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});
