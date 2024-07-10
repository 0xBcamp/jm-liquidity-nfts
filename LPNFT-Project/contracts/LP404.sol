//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "erc404/contracts/ERC404.sol";

contract LP404 is Ownable, ERC404 {
    struct Attributes {
        string[] traitTypes;
        string[] values;
        bytes32 dna;
    }

    mapping(uint => Attributes) private attributes; // tokenId => Attributes of the ERC721s
    mapping(bytes32 => bool) private uniqueness; // dna => bool. Keeps track of the uniqueness of the attributes
    mapping(uint => bool) private circulating; // tokenId => bool. Keeps track of the circulating status of the ERC721s
    mapping(address => bool) private admins; // Keeps track of admin addresses

    
    string public traitCID; // Global variable for trait CID
    string description = "I am a description";
    string uri = "nft-viewer.com/";

    /**
     * @param _name Token name
     * @param _symbol Token Symbol
     * @param _decimals Decimals
     * @param _maxTotalSupplyERC721 Max suppy for NFT
     * @param _initialOwner Owner
     * @param _initialMintRecipient Transfer Exemption
     * @param _traitCID Global Trait CID
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _maxTotalSupplyERC721,
        address _initialOwner,
        address _initialMintRecipient,
        string memory _traitCID
    ) ERC404(_name, _symbol, _decimals) Ownable(_initialOwner) {
        traitCID = _traitCID; // Set the global traitCID

        // Do not mint the ERC721s to the initial owner, as it's a waste of gas.
        _setERC721TransferExempt(_initialMintRecipient, true);
        _mintERC20(_initialMintRecipient, _maxTotalSupplyERC721 * units);
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Modifiers ~~~~~~~~~~~~~~~~~~~~~~~~~

    modifier onlyAdmin() {
        require(admins[msg.sender] || owner() == msg.sender, "Not an admin or owner");
        _;
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Admin Functions ~~~~~~~~~~~~~~~~~~~~~~~~~
    
    //To manage admin addresses

    function setAdmin(address _account, bool _isAdmin) external onlyOwner {
        admins[_account] = _isAdmin;
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Mint Functions ~~~~~~~~~~~~~~~~~~~~~~~~~

    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Setters ~~~~~~~~~~~~~~~~~~~~~~~~~
    /**
     * @dev Set the attributes and uniqueness of an ERC721
     * @notice Setting this to onlyOwner for now, but can be changed to a different modifier
     * @param _tokenId the id of the ERC721
     * @param _traitTypes Attribute Trait_Types
     * @param _values Attribute Values
     * @param _dna DNA hash of the ERC721   
     */
    function setAttributes(
        uint _tokenId,
        string[] calldata _traitTypes,
        string[] calldata _values,
        bytes32 _dna
    ) internal onlyAdmin {
        // Validate array lengths and attribute uniqueness
        require(
            _values.length == _traitTypes.length,
            "Value and traitTypes length mismatch"
        );
        require(!uniqueness[_dna], "Attributes are not unique");

        // Set the attributes
        Attributes memory newAttr = Attributes(_traitTypes, _values, _dna);

        attributes[_tokenId] = newAttr;
        uniqueness[_dna] = true;
    }

/**
     * @dev Set the global traitCID
     * @notice Only the contract owner can call this function
     * @param _traitCID The new traitCID value
     */
    function setTraitCID(string calldata _traitCID) external onlyOwner {
        traitCID = _traitCID;
    }


    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Getters ~~~~~~~~~~~~~~~~~~~~~~~~~
    /// @dev Checks if _tokenId has attributes set.
    function hasAttributes(uint _tokenId) external view returns (bool) {
        return attributes[_tokenId].dna != bytes32(0);
    }

    /// @dev Returns the attributes of _tokenId
    function getAttributes(
        uint _tokenId
    ) external view returns (string[] memory) {
        return attributes[_tokenId].values;
    }

    /// @dev Returns true if _dna has already been used.
    function usedDna(bytes32 _dna) external view returns (bool) {
        return uniqueness[_dna];
    }

    /// @dev Returns the URI for a token ID formatted for base64
    function tokenURI(
        uint256 _id
    ) public view override returns (string memory) {
        require(circulating[_id], "NFT is not in circulation");
        string memory tokenName = string(
            abi.encodePacked("[LP_NFT] ", name, " #", Strings.toString(_id))
        );
        string memory imageLink = string(
            abi.encodePacked(
                uri,
                Strings.toHexString(uint256(uint160(address(this))), 20),
                "/",
                Strings.toString(_id)
            )
        );

        string memory attrStr = "[";

        for (uint i = 0; i < attributes[_id].values.length; i++) {
            attrStr = string.concat(
                attrStr,
                string(
                    abi.encodePacked(
                        '{"',
                        attributes[_id].traitTypes[i],
                        '": "',
                        attributes[_id].values[i],
                        '"}'
                    )
                )
            );
            i == attributes[_id].values.length - 1
                ? attrStr = string.concat(attrStr, "]")
                : attrStr = string.concat(attrStr, ",");
        }

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                "{",
                                '"name": "',
                                tokenName,
                                '", ',
                                '"description": "',
                                description,
                                '", ',
                                '"image": "',
                                imageLink,
                                '", ',
                                '"attributes": ',
                                attrStr,
                                "}"
                            )
                        )
                    )
                )
            );
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Admin Functions ~~~~~~~~~~~~~~~~~~~~~~~~~
    function setERC721TransferExempt(
        address account_,
        bool value_
    ) external onlyOwner {
        _setERC721TransferExempt(account_, value_);
    }
}
