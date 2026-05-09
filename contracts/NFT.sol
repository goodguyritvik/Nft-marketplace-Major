// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title Demo ERC721 with on-chain JSON metadata string as tokenURI
contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    /// @notice Emitted when a new token is minted to `owner`
    event NFTMinted(address indexed owner, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("MyNFT", "MNFT") {}

    /// @notice Mint a new token with metadata JSON stored as tokenURI
    /// @param tokenURI JSON string (name, description, image, category, ...)
    function createToken(string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        emit NFTMinted(msg.sender, newItemId, tokenURI);
        return newItemId;
    }
}
