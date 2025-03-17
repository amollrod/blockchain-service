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
            expect(contract.target).to.not.equal(undefined);
        });
    });

    describe("Package Management", function () {
        it("Should create a package successfully", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await expect(contract.createPackage("pkg1", "Madrid", "Barcelona"))
                .to.emit(contract, "PackageCreated")
                .withArgs("pkg1", "Madrid", "Barcelona", anyValue);

            const packageInfo = await contract.getPackage("pkg1");
            expect(packageInfo[0]).to.equal("pkg1");
            expect(packageInfo[1]).to.equal("Madrid");
            expect(packageInfo[2]).to.equal("Barcelona");
        });

        it("Should fail to create a duplicate package", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await contract.createPackage("pkg1", "Madrid", "Barcelona");
            await expect(contract.createPackage("pkg1", "Madrid", "Barcelona"))
                .to.be.revertedWith("Package with ID pkg1 already exists.");
        });

        it("Should retrieve package details", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await contract.createPackage("pkg1", "Madrid", "Barcelona");

            const packageInfo = await contract.getPackage("pkg1");
            expect(packageInfo[0]).to.equal("pkg1");
            expect(packageInfo[1]).to.equal("Madrid");
            expect(packageInfo[2]).to.equal("Barcelona");
        });

        it("Should fail to retrieve a non-existent package", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await expect(contract.getPackage("pkg99"))
                .to.be.revertedWith("Package with ID pkg99 does not exist.");
        });

        it("Should update package status successfully", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await contract.createPackage("pkg1", "Madrid", "Barcelona");
            await expect(contract.updatePackageStatus("pkg1", "IN_TRANSIT", "Zaragoza"))
                .to.emit(contract, "PackageUpdated")
                .withArgs("pkg1", "IN_TRANSIT", "Zaragoza", anyValue);

            const history = await contract.getPackageHistory("pkg1");
            expect(history.length).to.equal(2);
            expect(history[1].status).to.equal("IN_TRANSIT");
            expect(history[1].location).to.equal("Zaragoza");
        });

        it("Should fail to update a non-existent package", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await expect(contract.updatePackageStatus("pkg99", "IN_TRANSIT", "Zaragoza"))
                .to.be.revertedWith("Package with ID pkg99 does not exist.");
        });

        it("Should retrieve the full package history", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await contract.createPackage("pkg1", "Madrid", "Barcelona");
            await contract.updatePackageStatus("pkg1", "IN_TRANSIT", "Zaragoza");
            await contract.updatePackageStatus("pkg1", "DELIVERED", "Barcelona");

            const history = await contract.getPackageHistory("pkg1");
            expect(history.length).to.equal(3);
            expect(history[0].status).to.equal("CREATED");
            expect(history[1].status).to.equal("IN_TRANSIT");
            expect(history[2].status).to.equal("DELIVERED");
        });

        it("Should fail retrieving history of non-existent package", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await expect(contract.getPackageHistory("pkg99"))
                .to.be.revertedWith("Package with ID pkg99 does not exist.");
        });
    });
});
