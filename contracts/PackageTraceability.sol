// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract PackageTraceability {
    struct PackageEvent {
        string status;
        string location;
        uint256 timestamp;
    }

    struct Package {
        uint256 id;
        string origin;
        string destination;
        PackageEvent[] history;
    }

    mapping(uint256 => Package) private packages;

    event PackageCreated(uint256 id, string origin, string destination, uint256 timestamp);
    event PackageUpdated(uint256 id, string status, string location, uint256 timestamp);

    function createPackage(uint256 _id, string memory _origin, string memory _destination) public {
        require(packages[_id].history.length == 0, "Package already exists.");

        Package storage newPackage = packages[_id];
        newPackage.id = _id;
        newPackage.origin = _origin;
        newPackage.destination = _destination;

        newPackage.history.push(PackageEvent("CREATED", _origin, block.timestamp));

        emit PackageCreated(_id, _origin, _destination, block.timestamp);
    }

    function updatePackageStatus(uint256 _id, string memory _status, string memory _location) public {
        require(packages[_id].history.length > 0, "Package does not exist.");

        Package storage pkg = packages[_id];
        pkg.history.push(PackageEvent(_status, _location, block.timestamp));

        emit PackageUpdated(_id, _status, _location, block.timestamp);
    }

    function getPackage(uint256 _id) public view returns (uint256, string memory, string memory) {
        require(packages[_id].history.length > 0, "Package does not exist.");
        Package storage pkg = packages[_id];
        return (pkg.id, pkg.origin, pkg.destination);
    }

    function getPackageHistory(uint256 _id) public view returns (PackageEvent[] memory) {
        require(packages[_id].history.length > 0, "Package does not exist.");
        return packages[_id].history;
    }
}
