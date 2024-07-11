//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "kim-core/contracts/KimFactory.sol";
import "./LPNFTPair.sol";

contract LPNFTFactory is KimFactory {

constructor(address feeTo_) KimFactory(feeTo_) {}

function createNftPair(                    //operate mostly the same as createPair function
        address tokenA,
        address tokenB,
        string memory _name,
        string memory _symbol,
        string memory _traitCID,
        uint8 _decimals,
        uint256 _maxTotalSupplyERC721,
        address _initialOwner,
        address _initialMintRecipient,
        string memory _description,
        string memory _uri
    ) external returns (address pair) {
        require(tokenA != tokenB, "LPNFTFactory: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "LPNFTFactory: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "LPNFTFactory: PAIR_EXISTS");

        bytes memory bytecode = abi.encodePacked(
    type(LPNFTPair).creationCode,
    abi.encode(
        _name,
        _symbol,
        _traitCID,
        _decimals,
        _maxTotalSupplyERC721,
        _initialOwner,
        _initialMintRecipient,
        _description,
        _uri
    )
);

        bytes32 salt = keccak256(abi.encodePacked(token0, token1, _name, _symbol, _traitCID, _decimals, _maxTotalSupplyERC721, _initialOwner, _initialMintRecipient, _description, _uri));

        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }

        require(pair != address(0), "LPNFTFactory: FAILED");

        LPNFTPair(pair).initialize(token0, token1);

        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair; // Populate mapping in the reverse direction
        allPairs.push(pair);

    
    }

    function setPairMetadata(
        address pair,
        string memory _name,
        string memory _symbol,
        string memory _traitCID,
        uint8 _decimals,
        uint256 _maxTotalSupplyERC721,
        address _initialOwner,
        address _initialMintRecipient,
        string memory _description,
        string memory _uri
    ) external {
        require(getPair[address(0)][address(0)] == pair, "LPNFTFactory: INVALID_PAIR");

        LPNFTPair(pair).setMetadata(
            _name,
            _symbol,
            _traitCID,
            _decimals,
            _maxTotalSupplyERC721,
            _initialOwner,
            _initialMintRecipient,
            _description,
            _uri
        );
    }

}


    
