//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "https://github:Pandora-Labs-Org/erc404/blob/main/contracts/examples/ERC404Example.sol";

contract LP404 is Ownable, ERC404 {
    struct attributes {
        string[] value;
        string[] trait_types; // Types of traits
    }

    mapping(uint => attributes[]) private _attributes; // Attributes of the ERC721s
    mapping(bytes64 => bool) private _uniqueness; // Hash of the attributes to keep track of uniqueness

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 maxTotalSupplyERC721_,
        address initialOwner_,
        address initialMintRecipient_,
        string[] memory trait_types_
    ) ERC404(name_, symbol_, decimals_) Ownable(initialOwner_) {
        // Do not mint the ERC721s to the initial owner, as it's a waste of gas.
        _setERC721TransferExempt(initialMintRecipient_, true);
        _mintERC20(initialMintRecipient_, maxTotalSupplyERC721_ * units);
    }

    // Will return attributes of an ERC721
    function getAttributes(
        uint tokenId_
    ) external view returns (attributes[] memory) {
        return _attributes[tokenId_];
    }

    // Will check if the hash is unique
    function checkUniqueness(bytes64 dna_) external view returns (bool) {
        return _uniqueness[dna_];
    }

    // This came with the example contract, not sure if it's needed
    function setERC721TransferExempt(
        address account_,
        bool value_
    ) external onlyOwner {
        _setERC721TransferExempt(account_, value_);
    }
}
