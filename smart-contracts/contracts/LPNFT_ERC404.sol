//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "erc404/contracts/ERC404.sol";



contract LP404 is Ownable,ERC404,AccessControl{

    bytes32 public constant SPECIAL_ROLE = keccak256("SPECIAL_ROLE");

    struct Attributes {
        string[] traitTypes;
        string[] values;
        bytes32 dna;
        string traitCID;
    }

    mapping(uint => Attributes) private attributes; // tokenId => Attributes of the ERC721s
    mapping(bytes32 => bool) private uniqueness; // dna => bool. Keeps track of the uniqueness of the attributes
    mapping(uint => bool) private circulating; // tokenId => bool. Keeps track of the circulating status of the ERC721s
    mapping(address => bool) private transferExemptions; //Keeps track of transfer exemptions

    string internal description = "I am a description";
    string internal uri = "nft-viewer.com/";

    /**
     * @param _name Token name
     * @param _symbol Token Symbol
     * @param _decimals Decimals
     * @param _maxTotalSupplyERC721 Max suppy for NFT
     * @param _initialOwner Owner
     * @param _initialMintRecipient Transfer Exemption
     * @param _traitCID CID for the JSON file
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        string memory _traitCID,
        uint256 _maxTotalSupplyERC721,
        address _initialOwner,
        address _initialMintRecipient
    ) ERC404(_name, _symbol, _decimals) Ownable(_initialOwner) {
        // Do not mint the ERC721s to the initial owner, as it's a waste of gas.
        _setERC721TransferExempt(_initialMintRecipient, true);
        _mintERC20(_initialMintRecipient, _maxTotalSupplyERC721 * units);
        _setupRole(DEFAULT_ADMIN_ROLE, _initialOwner);
        _setupRole(SPECIAL_ROLE, _initialOwner);
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Modifiers ~~~~~~~~~~~~~~~~~~~~~~~~~

    modifier onlySpecialRole() {
        require(hasRole(SPECIAL_ROLE, msg.sender), "Caller is not a special role");
        _;
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
     * @param _traitCID CID for the JSON file
     */
    function setAttributes(uint _tokenId, string[] calldata _traitTypes, string[] calldata _values, bytes32 _dna,string calldata _traitCID) 
    internal onlyOwner {
        // Validate array lengths and attribute uniqueness
        require(_values.length == _traitTypes.length, "Value and traitTypes array length must be equal");
        require(!uniqueness[_dna], "Attributes must be unique");
        
        // Set the attributes
        Attributes memory newAttr = Attributes(
            _traitTypes,
            _values,
            _dna,
            _traitCID
        );

        attributes[_tokenId] = newAttr;
        uniqueness[_dna] = true;
    }


    /**
     * @dev Set the URI for all tokens
     * @param _uri the new URI
     */
    function setUri(string calldata _uri) external onlyOwner {
        uri = _uri;
    }



    /**
     * @dev Sets transfer exemption for an address
     * @param account The address to set the exemption for
     * @param value True to exempt the address, false to remove the exemption
     */
    function _setERC721TransferExempt(address account_, bool value_) internal onlyOwner {
        transferExemptions[account_] = value_;
    }



// ~~~~~~~~~~~~~~~~~~~~~~~~~ SPECIAL_ROLE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
     * @dev Set the traitCID for a given tokenId
     * @param _tokenId the id of the ERC721
     * @param _traitCID the CID for the JSON file
     */
    function setTraitCID(uint _tokenId, string calldata _traitCID) external onlySpecialRole {
        attributes[_tokenId].traitCID = _traitCID;
    }



    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Getters ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    /// @dev Gets the attributes of an NFT
    function getAttributes(uint _tokenId) external view returns (string[] memory,string[] memory) {
        return (attributes[_tokenId].traitTypes,attributes[_tokenId].values);
    }

    /// @dev Checks if the attributes are unique
    function checkUniqueness(bytes32 _dna) external view returns (bool) {
        return uniqueness[_dna];
    }

    /// @dev Returns the URI for a token ID formatted for base64
    function tokenURI(uint256 _id) public view override returns (string memory) {
        require(circulating[_id], "NFT is not in circulation");
        string memory tokenName = string(abi.encodePacked('[LP NFT] ', name, ' #', Strings.toString(_id)));
        string memory imageLink = string(abi.encodePacked(
            uri, 
            Strings.toHexString(uint256(uint160(address(this))), 20), 
            '/', 
            Strings.toString(_id)
        ));
        
        string memory attrStr = '[';

        for (uint i = 0; i < attributes[_id].values.length; i++) {
            attrStr = string.concat(attrStr, string(abi.encodePacked(
                '{"',attributes[_id].traitTypes[i], '": "', attributes[_id].values[i], '"}'
            )));
            i == attributes[_id].values.length - 1 
                ? attrStr = string.concat(attrStr, ']') 
                : attrStr = string.concat(attrStr, ',');
        }

        return string(abi.encodePacked(
        'data:application/json;base64,', Base64.encode(bytes(abi.encodePacked(
            '{',
            '"name": "', tokenName, '", ',
            '"description": "', description, '", ',
            '"image": "', imageLink, '", ',
            '"attributes": ', attrStr,', ',
            '"traitCID": "', attributes[_id].traitCID, '"',
            '}'
        )))
      ));
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Admin Functions ~~~~~~~~~~~~~~~~~~~~~~~~~
    function setERC721TransferExempt(address account_, bool value_) external onlyOwner {
        _setERC721TransferExempt(account_, value_);
    }


    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Role Management ~~~~~~~~~~~~~~~~~~~~~~~~~

    function addSpecialRole(address account) external onlyOwner {
        grantRole(SPECIAL_ROLE, account);
    }

    function removeSpecialRole(address account) external onlyOwner {
        revokeRole(SPECIAL_ROLE, account);
    }


    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Transfer Functions ~~~~~~~~~~~~~~~~~~~~~~~~~

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        require(transferExemptions[msg.sender] || transferExemptions[from],"ERC721: transfer not allowed");
        super._transfer(from, to, tokenId);
    }

}