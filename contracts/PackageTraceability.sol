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

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    event PackageCreated(string id, string origin, string destination, uint256 timestamp);
    event PackageUpdated(string id, string status, string location, uint256 timestamp);

    /// @dev Restricts access to only the owner address
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized to create or modify packages.");
        _;
    }

    /// @dev Verify that the package does not exist
    modifier packageNotExists(string memory _id) {
        require(packages[_id].history.length == 0, string(abi.encodePacked("Package with ID ", _id, " already exists.")));
        _;
    }

    /// @dev Verify that the package exists
    modifier packageExists(string memory _id) {
        require(packages[_id].history.length > 0, string(abi.encodePacked("Package with ID ", _id, " does not exist.")));
        _;
    }

    /// @dev Verify that the string of fieldName is not empty
    modifier nonEmptyString(string memory input, string memory fieldName) {
        require(bytes(input).length > 0, string(abi.encodePacked(fieldName, " must not be empty.")));
        _;
    }

    /// @notice Updates the ownership
    function updateOwner(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address.");
        owner = newOwner;
    }

    /// @notice Create a new package. Only the owner has access
    function createPackage(
        string memory _id,
        string memory _origin,
        string memory _destination
    ) public
        onlyOwner
        packageNotExists(_id)
        nonEmptyString(_origin, "Origin")
        nonEmptyString(_destination, "Destination")
    {
        Package storage newPackage = packages[_id];
        newPackage.id = _id;
        newPackage.origin = _origin;
        newPackage.destination = _destination;
        newPackage.history.push(PackageEvent("CREATED", _origin, block.timestamp));

        emit PackageCreated(_id, _origin, _destination, block.timestamp);
    }

    /// @notice Updates the status of a package. Only the owner has access
    function updatePackageStatus(
        string memory _id,
        string memory _status,
        string memory _location
    ) public
        onlyOwner
        packageExists(_id)
        nonEmptyString(_status, "Status")
        nonEmptyString(_location, "Location")
    {
        packages[_id].history.push(PackageEvent(_status, _location, block.timestamp));
        emit PackageUpdated(_id, _status, _location, block.timestamp);
    }

    /// @notice Returns basic information about a package
    function getPackage(string memory _id) public view packageExists(_id) returns (string memory, string memory, string memory) {
        Package storage pkg = packages[_id];
        return (pkg.id, pkg.origin, pkg.destination);
    }

    /// @notice Returns the complete event history of a package
    function getPackageHistory(string memory _id) public view packageExists(_id) returns (PackageEvent[] memory) {
        return packages[_id].history;
    }

    /// @notice Returns the last recorded state of the package
    function getPackageLastStatus(string memory _id) public view packageExists(_id) returns (string memory status, string memory location, uint256 timestamp) {
        PackageEvent storage lastEvent = packages[_id].history[packages[_id].history.length - 1];
        return (lastEvent.status, lastEvent.location, lastEvent.timestamp);
    }
}
