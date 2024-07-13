// SPDX-License-Identifier: MIT
pragma solidity ^0.6.5;

interface ILP404Factory {
    function createLP404(
        string calldata _name,
        string calldata _symbol,
        string calldata _traitCID,
        string calldata _description,
        uint8 _decimals,
        address owner
    ) external returns (address);
}
