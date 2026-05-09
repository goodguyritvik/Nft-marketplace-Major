// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title NFT marketplace with escrowed listings and fixed-price sales
/// @notice Sellers transfer NFTs to this contract; buyers pay exact ETH to receive the token.
contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    error PriceMustBePositive();
    error IncorrectPayment();
    error ItemNotFound();
    error AlreadySold();

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        string tokenURI;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemListed(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price,
        string tokenURI
    );

    event MarketItemSold(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    constructor() {}

    /// @notice List an NFT — pulls `tokenURI` from the NFT contract for marketplace display
    function createMarketItem(address nftContract, uint256 tokenId, uint256 price) public {
        if (price == 0) revert PriceMustBePositive();

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        string memory uri = IERC721Metadata(nftContract).tokenURI(tokenId);

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false,
            uri
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemListed(itemId, nftContract, tokenId, msg.sender, price, uri);
    }

    /// @notice Buy a listed item — ETH goes to seller; NFT transferred to buyer
    function createMarketSale(address nftContract, uint256 itemId) public payable nonReentrant {
        MarketItem storage item = idToMarketItem[itemId];
        if (item.seller == address(0)) revert ItemNotFound();
        if (item.sold) revert AlreadySold();

        uint256 price = item.price;
        uint256 tokenId = item.tokenId;
        address payable seller = item.seller;

        if (msg.value != price) revert IncorrectPayment();

        seller.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        item.owner = payable(msg.sender);
        item.sold = true;

        _itemsSold.increment();

        emit MarketItemSold(itemId, nftContract, tokenId, seller, msg.sender, price);
    }

    /// @notice Returns active (unsold) listings
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);

        for (uint256 i = 1; i <= itemCount; i++) {
            if (idToMarketItem[i].owner == address(0)) {
                items[currentIndex] = idToMarketItem[i];
                currentIndex += 1;
            }
        }

        return items;
    }
}
