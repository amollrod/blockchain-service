// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract PackageTraceability {
    struct PackageEvent {
        string status;
        string location;
        uint256 timestamp;
    }

    struct Package {
        string id;
        string origin;
        string destination;
        PackageEvent[] history;
    }

    mapping(string => Package) private packages;

    event PackageCreated(string id, string origin, string destination, uint256 timestamp);
    event PackageUpdated(string id, string status, string location, uint256 timestamp);

    function createPackage(string memory _id, string memory _origin, string memory _destination) public {
        require(packages[_id].history.length == 0, string(abi.encodePacked("Package with ID ", _id, " already exists.")));

        Package storage newPackage = packages[_id];
        newPackage.id = _id;
        newPackage.origin = _origin;
        newPackage.destination = _destination;

        newPackage.history.push(PackageEvent("CREATED", _origin, block.timestamp));

        emit PackageCreated(_id, _origin, _destination, block.timestamp);
    }

    function updatePackageStatus(string memory _id, string memory _status, string memory _location) public {
        require(packages[_id].history.length > 0, string(abi.encodePacked("Package with ID ", _id, " does not exist.")));

        Package storage pkg = packages[_id];
        pkg.history.push(PackageEvent(_status, _location, block.timestamp));

        emit PackageUpdated(_id, _status, _location, block.timestamp);
    }

    function getPackage(string memory _id) public view returns (string memory, string memory, string memory) {
        require(packages[_id].history.length > 0, string(abi.encodePacked("Package with ID ", _id, " does not exist.")));
        Package storage pkg = packages[_id];
        return (pkg.id, pkg.origin, pkg.destination);
    }

    function getPackageHistory(string memory _id) public view returns (PackageEvent[] memory) {
        require(packages[_id].history.length > 0, string(abi.encodePacked("Package with ID ", _id, " does not exist.")));
        return packages[_id].history;
    }
}
