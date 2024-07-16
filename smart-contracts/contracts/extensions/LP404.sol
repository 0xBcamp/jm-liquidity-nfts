// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {MetadataLibrary} from "./lib/OnChainMetadata.sol";
import "./LP404Factory.sol";
import "ERC404/contracts/ERC404.sol";

contract LP404 is Ownable, ERC404 {
    using MetadataLibrary for MetadataLibrary.Attribute[];

    error LengthMisMatch();
    
    struct Attributes {
        string[] traitTypes;
        string[] values;
        bytes32 dna;
    }

    mapping(uint => Attributes) public attributes; // tokenId => Attributes of the ERC721s
    mapping(bytes32 => bool) public uniqueness; // dna => bool. Keeps track of the uniqueness of the attributes
    mapping(uint => bool) private circulating; // tokenId => bool. Keeps track of the circulating status of the ERC721s
    mapping(address => bool) private admin; //Keeps track of addresses with admin privileges

    address public factory;
    address public pairContract;

    string public traitCID;
    string public description = "I am a description";
    
    string internal uri = "nft-viewer.com/";

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _traitCID,
        string memory _description,
        uint8 _decimals,
        address _initialOwner,
        address _factory
    ) ERC404(_name, _symbol, _decimals) Ownable(_initialOwner) {
        _setERC721TransferExempt(_initialOwner, true);
        traitCID = _traitCID;
        description = _description;
        factory = _factory;
        admin[_factory] = true;
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Modifiers ~~~~~~~~~~~~~~~~~~~~~~~~~
    modifier onlyAdmin() {
        if (!admin[_msgSender()]) {
            revert Unauthorized();
        }
        _;
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Mint Functions ~~~~~~~~~~~~~~~~~~~~~~~~~
    function _retrieveOrMintERC721(address _to) internal override {
        uint256 tokenId = getNextTokenId();
        circulating[tokenId] = true;

        super._retrieveOrMintERC721(_to);

        LP404Factory(factory).generateMetadata(tokenId, _to, address(this));
    }

    function mintERC20(address to, uint256 amount) external onlyAdmin {
        _mintERC20(to, amount);
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Setters ~~~~~~~~~~~~~~~~~~~~~~~~~
    function setCollectionInfo(string calldata _traitCID, string calldata _description) external onlyAdmin {
        traitCID = _traitCID;
        description = _description;
    }

    function setAttributes(
        uint _tokenId, 
        string[] calldata _traitTypes, 
        string[] calldata _values, 
        bytes32 _dna
    ) external onlyAdmin {
        if (_values.length != _traitTypes.length) {
            revert LengthMisMatch();
        }
        if (uniqueness[_dna]) {
            revert AlreadyExists();
        }

        Attributes memory newAttr = Attributes(_traitTypes, _values, _dna);

        attributes[_tokenId] = newAttr;
        uniqueness[_dna] = true;
    }

    function resetNFT(uint _tokenId) internal onlyAdmin {
        bytes32 dna = attributes[_tokenId].dna;

        uniqueness[dna] = false;
        circulating[_tokenId] = false;

        attributes[_tokenId].traitTypes = [''];
        attributes[_tokenId].values = [''];
        attributes[_tokenId].dna = 0;
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Getters ~~~~~~~~~~~~~~~~~~~~~~~~~
    function tokenURI(uint256 _id) public view override returns (string memory) {
        if (!circulating[_id]) {
            revert InvalidTokenId();
        }

        MetadataLibrary.Attribute[] memory attrs = new MetadataLibrary.Attribute[](attributes[_id].values.length);
        for (uint i = 0; i < attributes[_id].values.length; i++) {
            attrs[i] = MetadataLibrary.Attribute(attributes[_id].traitTypes[i], attributes[_id].values[i]);
        }

        return MetadataLibrary.buildTokenURI(
            _id,
            name,
            description,
            uri,
            address(this),
            attrs
        );
    }

    function getNextTokenId() internal view  returns (uint tokenId) {
        uint tokenIndex = getERC721QueueLength();
        
        if (tokenIndex > 0) {
            return getERC721TokensInQueue(tokenIndex - 1, 1)[0];
        } else {
            return minted + 1;
        }
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Admin Functions ~~~~~~~~~~~~~~~~~~~~~~~~~
    function setERC721TransferExempt(address account_, bool value_) external onlyAdmin {
        _setERC721TransferExempt(account_, value_);
    }

    function setAdminPrivileges(address _admin, bool _state) public onlyAdmin {
        admin[_admin] = _state;
    }

    function setPair(address _pair) external onlyAdmin {
        pairContract = _pair;
        setAdminPrivileges(_pair, true);
    }

    // Function that allows external Pair Contract to burn tokens
    function burnERC20(
        address _from,
        uint256 _value
    ) public onlyAdmin {
        _transferERC20WithERC721(_from, address(0), _value);
    }

    function _withdrawAndStoreERC721(address _from) internal override {
        uint256 id = _owned[_from][_owned[_from].length - 1];

        resetNFT(id);

        super._withdrawAndStoreERC721(_from);
    }
}
