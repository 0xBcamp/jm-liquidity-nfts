// SPDX-License-Identifier: MIT
pragma solidity ^0.6.5;

import "../UniswapV2ERC20.sol";

contract TSTToken is UniswapV2ERC20 {
    constructor(uint256 initialSupply) public {
        _mint(msg.sender, initialSupply);
    }
}
