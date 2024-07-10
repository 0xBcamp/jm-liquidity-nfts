//SPDX-License-Identifier: MIT
pragma solidity ^0.6.5;

import "kim-core/contracts/KimPair.sol";
import {LP404} from "./LP404.sol";

contract LPNFTPair is KimPair, LP404 {
    function _burn(address from, uint value) internal override {
        balanceOf[from] = balanceOf[from].sub(value);
        totalSupply = totalSupply.sub(value);

        // Send the NFT to the 0x0 address
        _transferERC20WithERC721(from, address(0), value)

        emit Transfer(from, address(0), value);
    }
}
