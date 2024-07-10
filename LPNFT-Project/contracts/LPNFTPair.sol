// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "kim-core/contracts/KimPair.sol";
import "./LP404.sol"; 

contract LPNFTPair is KimPair, LP404 {
    address public initialOwner;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _traitCID,
        uint8 _decimals,
        uint256 _maxTotalSupplyERC721,
        address _initialOwner,
        address _initialMintRecipient,
        string memory _description,
        string memory _uri
    )
        LP404(_name, _symbol, _traitCID, _decimals, _maxTotalSupplyERC721, _initialOwner, _initialMintRecipient)
    {
        factory = msg.sender; // assigns the factory address to the contract deployer
        initialOwner = _initialOwner;

        // Set metadata fields
        description = _description;
        uri = _uri;
    }

    function initialize(address _token0, address _token1) external override {
        require(msg.sender == factory && !initialized, "LPNFTPair: FORBIDDEN");

        // Call KimPair's initialize function
        super.initialize(_token0, _token1);
    }
}
