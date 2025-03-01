import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PackageTraceabilityModule = buildModule("PackageTraceabilityModule", (m) => {
    // Definir el despliegue del contrato "PackageTraceability"
    const packageTraceability = m.contract("PackageTraceability");

    // Retornar la instancia desplegada para referencia en otros scripts o pruebas
    return { packageTraceability };
});

export default PackageTraceabilityModule;
