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

    string internal description = "I am a description";
    string internal uri = "nft-viewer.com/";

    /**
     * @param _name Token name
     * @param _symbol Token Symbol
     * @param _decimals Decimals
     * @param _maxTotalSupplyERC721 Max suppy for NFT
     * @param _initialOwner Owner
     * @param _initialMintRecipient Transfer Exemption
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _maxTotalSupplyERC721,
        address _initialOwner,
        address _initialMintRecipient
    ) ERC404(_name, _symbol, _decimals) Ownable(_initialOwner) {
        // Do not mint the ERC721s to the initial owner, as it's a waste of gas.
        _setERC721TransferExempt(_initialMintRecipient, true);
        _mintERC20(_initialMintRecipient, _maxTotalSupplyERC721 * units);
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Modifiers ~~~~~~~~~~~~~~~~~~~~~~~~~

    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Mint Functions ~~~~~~~~~~~~~~~~~~~~~~~~~
    event _retrieveOrMintERC721(string traitTypes, string values, bytes32 dna);

    function _retrieveOrMintERC721(attributes) internal{

        uint256 tokenId = _mintNewToken(_owner); // Assuming _mintNewToken is a function that mints or retrieves a tokenId
        circulating[tokenId] = true;
        
        // Emit the event with the necessary details
        emit ERC721Minted(tokenId, _owner, address(this));
        emit _retrieveOrMintERC721(attributes);

    }


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
    ) internal onlyOwner {
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

    /// @notice Internal function for ERC-20 transfers. Also handles any ERC-721 transfers that may be required.
    // Handles ERC-721 exemptions.
    function _transferERC20WithERC721(
        address from_,
        address to_,
        uint256 value_
    ) internal override returns (bool) {
        uint256 erc20BalanceOfSenderBefore = erc20BalanceOf(from_);
        uint256 erc20BalanceOfReceiverBefore = erc20BalanceOf(to_);

        _transferERC20(from_, to_, value_);

        // Preload for gas savings on branches
        bool isFromERC721TransferExempt = erc721TransferExempt(from_);
        bool isToERC721TransferExempt = erc721TransferExempt(to_);

        // Skip _withdrawAndStoreERC721 and/or _retrieveOrMintERC721 for ERC-721 transfer exempt addresses
        // 1) to save gas
        // 2) because ERC-721 transfer exempt addresses won't always have/need ERC-721s corresponding to their ERC20s.
        if (isFromERC721TransferExempt && isToERC721TransferExempt) {
            // Case 1) Both sender and recipient are ERC-721 transfer exempt. No ERC-721s need to be transferred.
            // NOOP.
        } else if (isFromERC721TransferExempt) {
            // Case 2) The sender is ERC-721 transfer exempt, but the recipient is not.
            // Contract should not attempt to transfer ERC-721s from the sender, but
            // the recipient should receive ERC-721s from the bank/minted for any
            // whole number increase in their balance.
            // Only cares about whole number increments.
            uint256 tokensToRetrieveOrMint = (balanceOf[to_] / units) -
                (erc20BalanceOfReceiverBefore / units);
            for (uint256 i = 0; i < tokensToRetrieveOrMint; ) {
                _retrieveOrMintERC721(to_);
                unchecked {
                    ++i;
                }
            }
        } else if (isToERC721TransferExempt) {
            // Case 3) The sender is not ERC-721 transfer exempt, but the recipient is. Contract should attempt
            //         to withdraw and store ERC-721s from the sender, but the recipient should not
            //         receive ERC-721s from the bank/minted.
            // Only cares about whole number increments.
            uint256 tokensToWithdrawAndStore = (erc20BalanceOfSenderBefore /
                units) - (balanceOf[from_] / units);
            for (uint256 i = 0; i < tokensToWithdrawAndStore; ) {
                // Update circulating status and uniqueness before withdrawing and storing
                uint256 id = _owned[from_][_owned[from_].length - 1];
                circulating[id] = false;
                uniqueness[attributes[id].dna] = false;
                // delete attributes[id]; // Ignored for now to save gas
                _withdrawAndStoreERC721(from_);
                unchecked {
                    ++i;
                }
            }
        } else {
            // Case 4) Neither the sender nor the recipient are ERC-721 transfer exempt.
            // Strategy:
            // 1. First deal with the whole tokens. These are easy and will just be transferred.
            // 2. Look at the fractional part of the value:
            //   a) If it causes the sender to lose a whole token that was represented by an NFT due to a
            //      fractional part being transferred, withdraw and store an additional NFT from the sender.
            //   b) If it causes the receiver to gain a whole new token that should be represented by an NFT
            //      due to receiving a fractional part that completes a whole token, retrieve or mint an NFT to the recevier.

            // Whole tokens worth of ERC-20s get transferred as ERC-721s without any burning/minting.
            uint256 nftsToTransfer = value_ / units;
            for (uint256 i = 0; i < nftsToTransfer; ) {
                // Pop from sender's ERC-721 stack and transfer them (LIFO)
                uint256 indexOfLastToken = _owned[from_].length - 1;
                uint256 tokenId = _owned[from_][indexOfLastToken];
                _transferERC721(from_, to_, tokenId);
                unchecked {
                    ++i;
                }
            }

            // If the transfer changes either the sender or the recipient's holdings from a fractional to a non-fractional
            // amount (or vice versa), adjust ERC-721s.

            // First check if the send causes the sender to lose a whole token that was represented by an ERC-721
            // due to a fractional part being transferred.
            //
            // Process:
            // Take the difference between the whole number of tokens before and after the transfer for the sender.
            // If that difference is greater than the number of ERC-721s transferred (whole units), then there was
            // an additional ERC-721 lost due to the fractional portion of the transfer.
            // If this is a self-send and the before and after balances are equal (not always the case but often),
            // then no ERC-721s will be lost here.
            if (
                erc20BalanceOfSenderBefore /
                    units -
                    erc20BalanceOf(from_) /
                    units >
                nftsToTransfer
            ) {
                // Update circulating status and uniqueness before withdrawing and storing
                uint256 id = _owned[from_][_owned[from_].length - 1];
                circulating[id] = false;
                uniqueness[attributes[id].dna] = false;
                // delete attributes[id]; // Ignored for now to save gas
                _withdrawAndStoreERC721(from_);
            }

            // Then, check if the transfer causes the receiver to gain a whole new token which requires gaining
            // an additional ERC-721.
            //
            // Process:
            // Take the difference between the whole number of tokens before and after the transfer for the recipient.
            // If that difference is greater than the number of ERC-721s transferred (whole units), then there was
            // an additional ERC-721 gained due to the fractional portion of the transfer.
            // Again, for self-sends where the before and after balances are equal, no ERC-721s will be gained here.
            if (
                erc20BalanceOf(to_) /
                    units -
                    erc20BalanceOfReceiverBefore /
                    units >
                nftsToTransfer
            ) {
                _retrieveOrMintERC721(to_);
            }
        }

        return true;
    }
}
