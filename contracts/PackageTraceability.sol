// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract PackageTraceability {
    // Estructura que define la información del paquete
    struct Package {
        uint256 id;
        string origin;
        string destination;
        string status;
        uint256 timestamp;
    }

    // Mapeo para almacenar la información de cada paquete
    mapping(uint256 => Package) public packages;

    // Evento que se emite cuando se crea o actualiza un paquete
    event PackageUpdated(uint256 id, string status, uint256 timestamp);

    // Función para crear el registro de un nuevo paquete
    function createPackage(uint256 _id, string memory _origin, string memory _destination) public {
        require(packages[_id].timestamp == 0, "El paquete ya existe");
        packages[_id] = Package(_id, _origin, _destination, "Creado", block.timestamp);
        emit PackageUpdated(_id, "Creado", block.timestamp);
    }

    // Función para actualizar el estado de un paquete existente
    function updatePackageStatus(uint256 _id, string memory _status) public {
        require(packages[_id].timestamp != 0, "El paquete no existe");
        packages[_id].status = _status;
        packages[_id].timestamp = block.timestamp;
        emit PackageUpdated(_id, _status, block.timestamp);
    }

    // Función para obtener la información de un paquete
    function getPackage(uint256 _id) public view returns (Package memory) {
        require(packages[_id].timestamp != 0, "El paquete no existe");
        return packages[_id];
    }
}
