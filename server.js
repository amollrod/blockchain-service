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

/**
 * Logger con timestamp
 */
function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

/**
 * Configuración de Ethereum
 */
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

/**
 * Cargar ABI y dirección del contrato
 */
const contractABI = JSON.parse(
    fs.readFileSync(path.join(__dirname, "artifacts/contracts/PackageTraceability.sol/PackageTraceability.json"), "utf8")
).abi;

const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

/**
 * Obtener información de un paquete
 */
app.get("/package/:id", async (req, res) => {
    try {
        const packageId = BigInt(req.params.id);
        log(`[GET] Consultando paquete ID: ${packageId}`);

        const packageData = await contract.getPackage(packageId);

        res.json({
            id: packageData[0].toString(),
            origin: packageData[1],
            destination: packageData[2],
        });
    } catch (error) {
        log(`[ERROR][GET] ID: ${req.params.id} - ${error.message}`);
        res.status(500).json({ error: "Error fetching package" });
    }
});

/**
 * Obtener historial de un paquete
 */
app.get("/package/:id/history", async (req, res) => {
    try {
        const packageId = req.params.id;
        log(`[GET/HISTORY] Historial del paquete ID: ${packageId}`);

        const history = await contract.getPackageHistory(packageId);
        const formatted = history.map(event => ({
            status: event.status,
            location: event.location,
            timestamp: event.timestamp.toString()
        }));

        res.json({ id: packageId.toString(), history: formatted });
    } catch (error) {
        log(`[ERROR][HISTORY] ID: ${req.params.id} - ${error.message}`);
        res.status(500).json({ error: "Error fetching package history" });
    }
});

/**
 * Crear un nuevo paquete
 */
app.post("/package", async (req, res) => {
    try {
        const { id, origin, destination } = req.body;

        log(`[CREATE] ID: ${id}, origen: ${origin}, destino: ${destination}`);

        const tx = await contract.createPackage(id, origin, destination);
        log(`[CREATE] Tx enviada: ${tx.hash}`);

        await tx.wait();
        log(`[CREATE] Confirmado paquete ${id}.`);

        res.json({ message: "Package created successfully", txHash: tx.hash });
    } catch (error) {
        log(`[ERROR][CREATE] ID: ${req.body.id} - ${error.message}`);
        res.status(500).json({ error: "Error creating package" });
    }
});

/**
 * Actualizar estado del paquete
 */
app.put("/package/:id/status", async (req, res) => {
    try {
        const { status, location } = req.body;
        const packageId = req.params.id;

        if (!status || !location) {
            log(`[ERROR][UPDATE] Faltan campos. status: ${status}, location: ${location}`);
            return res.status(400).json({ error: "Status and location are required." });
        }

        log(`[UPDATE] ID: ${packageId} → estado: ${status}, ubicación: ${location}`);

        const tx = await contract.updatePackageStatus(packageId, status, location);
        log(`[UPDATE] Tx enviada: ${tx.hash}`);

        await tx.wait();
        log(`[UPDATE] Confirmado. Estado actualizado para paquete ${packageId}.`);

        res.json({ message: "Package status updated", txHash: tx.hash });
    } catch (error) {
        log(`[ERROR][UPDATE] ID: ${req.params.id} - ${error.message}`);
        res.status(500).json({ error: "Error updating package status" });
    }
});

/**
 * Iniciar servidor
 */
app.listen(PORT, () => {
    log(`API Blockchain ejecutándose en http://localhost:${PORT}`);
});
