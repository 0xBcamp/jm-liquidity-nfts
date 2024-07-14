// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LP404.sol";

contract LP404Factory {
    event LP404Created(address indexed creator, address lp404);

    event NeedsMetadata(
        uint256 indexed tokenId,
        address indexed owner,
        address indexed collection
    );

    function createLP404(
        string calldata _name,
        string calldata _symbol,
        string calldata _traitCID,
        string calldata _description,
        uint8 _decimals,
        address owner
    ) external returns (address) {
        bytes memory constructorArgs = abi.encode(_name, _symbol, _traitCID, _description, _decimals, owner, msg.sender);
        bytes memory bytecode = abi.encodePacked(type(LP404).creationCode, constructorArgs);
        bytes32 salt = keccak256(abi.encodePacked(constructorArgs));
        address lp404;
        assembly {
            lp404 := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        require(lp404 != address(0), "LP404Factory: CREATION_FAILED");
        emit LP404Created(owner, lp404);
        return lp404;
    }

    function generateMetadata(
        uint256 tokenId,
        address owner,
        address collection
    ) external {
        emit NeedsMetadata(tokenId, owner, collection);
    }
}
