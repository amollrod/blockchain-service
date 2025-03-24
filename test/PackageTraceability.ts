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

    describe("Access control", function () {
        it("Should allow only backend to create packages", async function () {
            const { contract, otherAccount } = await loadFixture(deployPackageTraceabilityFixture);

            await expect(
                contract.connect(otherAccount).createPackage("pkg1", "Madrid", "Barcelona")
            ).to.be.revertedWith("Not authorized to create or modify packages.");
        });

        it("Should allow only backend to update package status", async function () {
            const { contract, owner, otherAccount } = await loadFixture(deployPackageTraceabilityFixture);

            await contract.connect(owner).createPackage("pkg1", "Madrid", "Barcelona");

            await expect(
                contract.connect(otherAccount).updatePackageStatus("pkg1", "IN_TRANSIT", "Zaragoza")
            ).to.be.revertedWith("Not authorized to create or modify packages.");
        });
    });

    describe("Create package", function () {
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

        it("Should have one history event immediately after creation", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await contract.createPackage("pkg1", "Madrid", "Barcelona");

            const history = await contract.getPackageHistory("pkg1");
            expect(history.length).to.equal(1);
            expect(history[0].status).to.equal("CREATED");
            expect(history[0].location).to.equal("Madrid");
        });

        it("Should fail to create a duplicate package", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await contract.createPackage("pkg1", "Madrid", "Barcelona");
            await expect(contract.createPackage("pkg1", "Madrid", "Barcelona"))
                .to.be.revertedWith("Package with ID pkg1 already exists.");
        });

        it("Should fail to create if origin is empty", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await expect(contract.createPackage("pkg1", "", "Barcelona"))
                .to.be.revertedWith("Origin must not be empty.");
        });

        it("Should fail to create if destination is empty", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await expect(contract.createPackage("pkg1", "Madrid", ""))
                .to.be.revertedWith("Destination must not be empty.");
        });
    });

    describe("Update package", function () {
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

        it("Should fail to update status if status is empty", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await contract.createPackage("pkg1", "Madrid", "Barcelona");

            await expect(contract.updatePackageStatus("pkg1", "", "Zaragoza"))
                .to.be.revertedWith("Status must not be empty.");
        });

        it("Should fail to update status if location is empty", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await contract.createPackage("pkg1", "Madrid", "Barcelona");

            await expect(contract.updatePackageStatus("pkg1", "IN_TRANSIT", ""))
                .to.be.revertedWith("Location must not be empty.");
        });
    });

    describe("Get package details", function () {
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
    });

    describe("Get history", function () {
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

    describe("Get last status", function () {
        it("Should retrieve the last status of a package", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await contract.createPackage("pkg1", "Madrid", "Barcelona");

            const [initialStatus, initialLocation] = await contract.getPackageLastStatus("pkg1");

            expect(initialStatus).to.equal("CREATED");
            expect(initialLocation).to.equal("Madrid"); // same location as the origin when created

            await contract.updatePackageStatus("pkg1", "IN_TRANSIT", "Zaragoza");

            const [status, location] = await contract.getPackageLastStatus("pkg1");

            expect(status).to.equal("IN_TRANSIT");
            expect(location).to.equal("Zaragoza");
        });

        it("Should fail retrieving the last status of non-existent package", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await expect(contract.getPackageLastStatus("pkg99"))
                .to.be.revertedWith("Package with ID pkg99 does not exist.");
        });

        it("Should isolate history and details between different packages", async function () {
            const { contract } = await loadFixture(deployPackageTraceabilityFixture);
            await contract.createPackage("pkg1", "Madrid", "Barcelona");
            await contract.createPackage("pkg2", "Paris", "Berlin");

            await contract.updatePackageStatus("pkg1", "IN_TRANSIT", "Zaragoza");

            const [status1] = await contract.getPackageLastStatus("pkg1");
            const [status2] = await contract.getPackageLastStatus("pkg2");

            expect(status1).to.equal("IN_TRANSIT");
            expect(status2).to.equal("CREATED"); // it was never updated
        });
    });
});
