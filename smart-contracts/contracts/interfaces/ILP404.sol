// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity ^0.6.5;

interface ILP404 {
    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Transfer Functions ~~~~~~~~~~~~~~~~~~~~~~~~~
    function transferFrom(
        address from_,
        address to_,
        uint256 valueOrId_
    ) external returns (bool);

    function approve(
        address spender_,
        uint256 valueOrId_
    ) external returns (bool);

    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Mint Functions ~~~~~~~~~~~~~~~~~~~~~~~~~
    function mintERC20(address to_, uint256 value_) external;

    function burnERC20(address _from, uint256 _value) external;

    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Setters ~~~~~~~~~~~~~~~~~~~~~~~~~
    function setCollectionInfo(
        string calldata _traitCID,
        string calldata _description
    ) external;

    function setAttributes(
        uint _tokenId,
        string[] calldata _traitTypes,
        string[] calldata _values,
        bytes32 _dna
    ) external;

    function setPair(address _pair) external;

    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Admin Functions ~~~~~~~~~~~~~~~~~~~~~~~~~
    function setERC721TransferExempt(address account_, bool value_) external;

    function setAdminPrivileges(address _admin, bool _state) external;
}
