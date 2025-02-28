# Blockchain service

## 1- Generación, compilado y despliegue del contrato

Esta sección documenta el uso de hardhat para poder generar y acabar desplegando un smart contract en la `Sepolia testnet`.

### 1.1- Creación del contrato

Lo primero que se necesita es crear el contrato. Para ello lo definiremos dentro del directorio `/contracts` del proyecto. Mostremos un ejemplo:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract PackageTraceability {
    // implementación del contrato aquí
}
```

### 1.2- Compilación del contrato

Para poder compilar los contratos dentro del directorio `/contracts` del proyecto, se usan los comandos siguientes:

```shell
npx hardhat clean 
npx hardhat compile 
# Compiling...
# Compiled 1 contract successfully
```

Esto debería de generar los directorios `/typechain-types`, `/cache` y `/cache`

### 1.3- Testear el contrato

Si queremos probar el contrato, podemos hacerlo mediante el comando de prueba de hardhat. Para ello previamente necesitamos haber creado un fichero de test dentro del directorio `/test`  

```shell
npx hardhat test
#  PackageTraceability
#    Deployment
#      √ Should deploy successfully (339ms)
#    Package Management
#      √ Should create a package successfully
#      √ Should fail to create a duplicate package
#      √ Should retrieve package details
#      √ Should fail to retrieve a non-existent package
#      √ Should update package status successfully
#      √ Should fail to update a non-existent package
#
#
#  7 passing (370ms)
```

### 1.3- Desplegar el contrato

Para desplegar el contrato en la `Sepolia testnet`, usaremos el comando:

```shell
npx hardhat ignition deploy ./ignition/modules/PackageTraceability.ts --network sepolia
# PackageTraceabilityModule#PackageTraceability - 0x01157B9FbD2f38934594486A727d04250ec798C6
```

## 2- Interacción con el smart contract

Esta sección establece lo necesario para poder interactuar con el smart contract desplegado en la `Sepolia testnet`. Para poder hacerlo, se ha preparado un servicio en Node que interactúa mediante `ethers.js`. El primer paso será levantar el servicor mediante:

```shell
node server.js
# API running on http://localhost:3000
```

Se han expuesto mediante una API REST los distintos métodos del contrato. Los documentamos a continuación.

### Consultar un paquete por ID

Petición:
```shell
curl -X GET http://localhost:3000/package/1
```

Respuesta:
```json
{
  "id":"1",
  "origin":"Madrid",
  "destination":"Barcelona",
  "status":"Creado",
  "timestamp":"1740694668"
}
```

### Crear un paquete

Petición:
```shell
curl -X POST http://localhost:3000/package \
     -H "Content-Type: application/json" \
     -d '{"id": "1", "origin": "Madrid", "destination": "Barcelona"}'
```
Respuesta:
```json
 {
    "message": "Package created successfully",
    "txHash": "0xd23707d91f8cf724fc19e94b3b07d3b31b2c8e801bad6bcd45d290de7d5dc8f6"
 }
```

### Actualizar estado de un paquete

Petición:
```shell
curl -X PUT http://localhost:3000/package/1/status \
     -H "Content-Type: application/json" \
     -d '{"status": "DELIVERED"}'
```

Respuesta:
```json
{
    "message": "Package status updated",
    "txHash": "0xae108fdcb5a3eae259a5b134f019b22695aa1e5faa8515d3f76eefea36061dc1"
}
```
