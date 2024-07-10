//SPDX-License-Identifier: MIT
pragma solidity ^0.6.5;

import "kim-core/contracts/KimPair.sol";

abstract contract LPNFTFactory is KimPair {
    constructor() public {
        factory = msg.sender;
    }
}