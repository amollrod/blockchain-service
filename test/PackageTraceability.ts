import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("PackageTraceability", function () {
    async function deployPackageTraceabilityFixture() {
        const [owner, otherAccount] = await hre.ethers.getSigners();

        const PackageTraceability = await hre.ethers.getContractFactory("PackageTraceability");
        const contract = await PackageTraceability.deploy();

        return { contract, owner, otherAccount };
    }

    describe("Deployment", function () {
        it("Should deploy successfully", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            expect(contract).to.be.ok;
        });
    });

    describe("Package Management", function () {
        it("Should create a package successfully", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await expect(contract.createPackage(1, "Madrid", "Barcelona"))
                .to.emit(contract, "PackageUpdated")
                .withArgs(1, "Creado", anyValue);
        });

        it("Should fail to create a duplicate package", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await contract.createPackage(1, "Madrid", "Barcelona");
            await expect(contract.createPackage(1, "Madrid", "Barcelona")).to.be.revertedWith("El paquete ya existe");
        });

        it("Should retrieve package details", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await contract.createPackage(1, "Madrid", "Barcelona");
            const packageInfo = await contract.getPackage(1);
            expect(packageInfo.id).to.equal(1);
            expect(packageInfo.origin).to.equal("Madrid");
            expect(packageInfo.destination).to.equal("Barcelona");
            expect(packageInfo.status).to.equal("Creado");
        });

        it("Should fail to retrieve a non-existent package", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await expect(contract.getPackage(99)).to.be.revertedWith("El paquete no existe");
        });

        it("Should update package status successfully", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await contract.createPackage(1, "Madrid", "Barcelona");
            await expect(contract.updatePackageStatus(1, "En tránsito"))
                .to.emit(contract, "PackageUpdated")
                .withArgs(1, "En tránsito", anyValue);
        });

        it("Should fail to update a non-existent package", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await expect(contract.updatePackageStatus(99, "En tránsito")).to.be.revertedWith("El paquete no existe");
        });
    });
});
