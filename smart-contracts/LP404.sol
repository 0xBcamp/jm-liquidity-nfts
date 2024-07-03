//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "https://github:Pandora-Labs-Org/erc404/blob/main/contracts/examples/ERC404Example.sol";

contract LP404 is Ownable, ERC404 {
    /**
     * @dev Metadata structure for the ERC721s
     */
    struct attributes {
        string[] value;
        string[] trait_types;
    }

    mapping(uint => attributes[]) private _attributes; // Attributes of the ERC721s
    mapping(bytes64 => bool) private _uniqueness; // Keeps track of the uniqueness of the attributes

    /**
     *
     * @param name_
     * @param symbol_
     * @param decimals_
     * @param maxTotalSupplyERC721_
     * @param initialOwner_
     * @param initialMintRecipient_
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 maxTotalSupplyERC721_,
        address initialOwner_,
        address initialMintRecipient_
    ) ERC404(name_, symbol_, decimals_) Ownable(initialOwner_) {
        // Do not mint the ERC721s to the initial owner, as it's a waste of gas.
        _setERC721TransferExempt(initialMintRecipient_, true);
        _mintERC20(initialMintRecipient_, maxTotalSupplyERC721_ * units);
    }

    /**
     * @dev Gets the attributes of an ERC721
     * @param tokenId_
     */
    function getAttributes(
        uint tokenId_
    ) external view returns (attributes[] memory) {
        return _attributes[tokenId_];
    }

    /**
     * @dev Checks if the attributes are unique
     * @param dna_ the hash of the attributes
     */
    function checkUniqueness(bytes64 dna_) external view returns (bool) {
        return _uniqueness[dna_];
    }

    /**
     * @dev Set the attributes and uniqueness of an ERC721
     * @notice Setting this to onlyOwner for now, but can be changed to a different modifier
     * @param tokenId_
     * @param value_
     * @param trait_types_
     */
    function setAttributes(
        uint tokenId_,
        string[] memory value_,
        string[] memory trait_types_
    ) internal onlyOwner {
        // Check if the attributes are already set
        require(_attributes[tokenId_].length == 0, "Attributes already set");
        require(
            value_.length == trait_types_.length,
            "Value and trait_types length mismatch"
        );
        // Set the attributes
        _attributes[tokenId_].push(
            attributes({value: value_, trait_types: trait_types_})
        );
        // Hash the attributes by encoding them in base64 then hashing with keccak256
        // Logic: data:application/json;base64, + base64(attributes)
        // I borrowed the logic from the snippet Richard posted in the Discord
        bytes64 dna = keccak256(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"value": "',
                            value_,
                            '", "trait_types": "',
                            trait_types_,
                            '"}'
                        )
                    )
                )
            )
        );
        // Check if the attributes are unique and set them
        require(!_uniqueness[dna], "Attributes are not unique");
        _uniqueness[dna] = true;
    }

    // This came with the example contract, not sure if it's needed
    function setERC721TransferExempt(
        address account_,
        bool value_
    ) external onlyOwner {
        _setERC721TransferExempt(account_, value_);
    }
}
