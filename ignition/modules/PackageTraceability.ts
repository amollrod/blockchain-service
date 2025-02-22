import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PackageTraceabilityModule = buildModule("PackageTraceabilityModule", (m) => {
    // Desplegar el contrato "PackageTraceability" sin parámetros en el constructor.
    const packageTraceability = m.contract("PackageTraceability", []);

    // Retornamos la instancia desplegada para poder referenciarla en otros scripts o pruebas.
    return { packageTraceability };
});

export default PackageTraceabilityModule;
