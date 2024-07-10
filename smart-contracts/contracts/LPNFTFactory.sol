//SPDX-License-Identifier: MIT
pragma solidity ^0.6.5;

import "kim-core/contracts/KimFactory.sol";

abstract contract LPNFTFactory is KimFactory {
    constructor(address feeTo_) public {
        owner = msg.sender;
        feePercentOwner = msg.sender;
        setStableOwner = msg.sender;
        feeTo = feeTo_;

        emit OwnershipTransferred(address(0), msg.sender);
        emit FeePercentOwnershipTransferred(address(0), msg.sender);
        emit SetStableOwnershipTransferred(address(0), msg.sender);
        emit FeeToTransferred(address(0), feeTo_);
    }
}
