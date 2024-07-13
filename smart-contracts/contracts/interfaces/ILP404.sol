// SPDX-License-Identifier: MIT
pragma solidity ^0.6.5;

interface ILP404 {
    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Mint Functions ~~~~~~~~~~~~~~~~~~~~~~~~~
    function mintERC20(address to_, uint256 value_) external;

    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Setters ~~~~~~~~~~~~~~~~~~~~~~~~~
    function setCollectionInfo(string calldata _traitCID, string calldata _description) external;

    function setAttributes(
        uint _tokenId, 
        string[] calldata _traitTypes, 
        string[] calldata _values, 
        bytes32 _dna
    ) external;

    function setERC721TransferExempt(address account_, bool value_) external;

    function setAdminPrivileges(address _admin, bool _state) external;

   
}
