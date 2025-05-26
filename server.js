require("dotenv").config();
const express = require("express");
const cors = require("cors");
const contract = require("./contractClient");

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
 * ENDPOINTS
 */
app.get("/package/:id", async (req, res) => {
    try {
        const packageId = req.params.id;
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
 * Obtener el último estado del paquete
 */
app.get("/package/:id/last", async (req, res) => {
    const packageId = req.params.id;

    try {
        log(`[GET/LAST] Último estado del paquete ID: ${packageId}`);

        const [status, location, timestamp] = await contract.getPackageLastStatus(packageId);

        res.json({
            id: packageId,
            status,
            location,
            timestamp: timestamp.toString(),
        });
    } catch (error) {
        log(`[ERROR][LAST] ID: ${packageId} - ${error.message}`);
        res.status(500).json({ error: "Error fetching last status" });
    }
});

/**
 * Ver el owner actual del contrato
 */
app.get("/owner", async (_, res) => {
    try {
        const currentOwner = await contract.owner();
        res.json({ owner: currentOwner });
    } catch (error) {
        res.status(500).json({ error: "Error fetching owner" });
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
 * Iniciar servidor o export para test
 */
if (require.main === module) {
    app.listen(PORT, () => {
        log(`API Blockchain ejecutándose en http://localhost:${PORT}`);
    });
} else {
    module.exports = app;
}
