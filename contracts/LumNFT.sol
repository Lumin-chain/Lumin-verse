// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface ILumToken {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract LumNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    ILumToken public lumToken;
    
    // NFT Categories
    enum NFTCategory { AVATAR, POWERUP, BADGE, PUZZLE_PACK }
    enum Rarity { COMMON, RARE, EPIC, LEGENDARY }
    
    struct NFTMetadata {
        NFTCategory category;
        Rarity rarity;
        string name;
        string description;
        uint256 price;
        bool isActive;
        uint256 utility; // For power-ups: effect strength, for avatars: point bonus
        uint256 duration; // For power-ups: effect duration in seconds
    }
    
    // Mappings
    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(address => mapping(NFTCategory => uint256[])) public userNFTsByCategory;
    mapping(uint256 => bool) public isMarketplaceListed;
    mapping(uint256 => uint256) public marketplacePrice;
    mapping(address => uint256) public creatorRoyalties; // 5% royalty for puzzle creators
    
    // Marketplace
    struct MarketplaceListing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isActive;
    }
    
    mapping(uint256 => MarketplaceListing) public marketplaceListings;
    uint256[] public activeListings;
    
    // Events
    event NFTMinted(address indexed to, uint256 indexed tokenId, NFTCategory category, Rarity rarity);
    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event NFTSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event NFTUsed(address indexed user, uint256 indexed tokenId, string gameType);
    
    constructor(address _lumTokenAddress) ERC721("Lumin NFT", "LUMNFT") {
        lumToken = ILumToken(_lumTokenAddress);
        
        // Pre-mint some initial NFTs
        _createInitialNFTs();
    }
    
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    function _createInitialNFTs() internal {
        // Create some initial NFT templates
        _mintNFT(
            owner(),
            NFTCategory.AVATAR,
            Rarity.EPIC,
            "Cyber Puzzle Master",
            "Exclusive avatar with +10% point bonus",
            15.5 * 10**18,
            10, // 10% point bonus
            0
        );
        
        _mintNFT(
            owner(),
            NFTCategory.POWERUP,
            Rarity.RARE,
            "Time Freeze Power",
            "Pause the timer for 30 seconds",
            5.0 * 10**18,
            30, // 30 seconds
            30
        );
        
        _mintNFT(
            owner(),
            NFTCategory.BADGE,
            Rarity.LEGENDARY,
            "Logic Champion Badge",
            "Proof of completing 100 logic puzzles",
            25.0 * 10**18,
            100, // Achievement threshold
            0
        );
        
        _mintNFT(
            owner(),
            NFTCategory.PUZZLE_PACK,
            Rarity.RARE,
            "Premium Sudoku Pack",
            "50 expert-level Sudoku puzzles",
            8.0 * 10**18,
            50, // Number of puzzles
            0
        );
    }
    
    function _mintNFT(
        address to,
        NFTCategory category,
        Rarity rarity,
        string memory name,
        string memory description,
        uint256 price,
        uint256 utility,
        uint256 duration
    ) internal returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        
        nftMetadata[tokenId] = NFTMetadata({
            category: category,
            rarity: rarity,
            name: name,
            description: description,
            price: price,
            isActive: true,
            utility: utility,
            duration: duration
        });
        
        userNFTsByCategory[to][category].push(tokenId);
        
        emit NFTMinted(to, tokenId, category, rarity);
        return tokenId;
    }
    
    // Public minting function (for marketplace purchases)
    function mintNFT(
        address to,
        NFTCategory category,
        Rarity rarity,
        string memory name,
        string memory description,
        uint256 price,
        uint256 utility,
        uint256 duration
    ) external onlyOwner returns (uint256) {
        return _mintNFT(to, category, rarity, name, description, price, utility, duration);
    }
    
    // Purchase NFT from marketplace
    function purchaseNFT(uint256 tokenId) external {
        require(_exists(tokenId), "NFT does not exist");
        require(isMarketplaceListed[tokenId], "NFT not listed for sale");
        
        MarketplaceListing memory listing = marketplaceListings[tokenId];
        require(listing.isActive, "Listing not active");
        require(msg.sender != listing.seller, "Cannot buy your own NFT");
        
        uint256 price = listing.price;
        require(lumToken.balanceOf(msg.sender) >= price, "Insufficient LUM balance");
        
        // Transfer payment
        require(lumToken.transferFrom(msg.sender, listing.seller, price), "Payment failed");
        
        // Transfer NFT
        _transfer(listing.seller, msg.sender, tokenId);
        
        // Update user NFT tracking
        _removeFromUserCategory(listing.seller, nftMetadata[tokenId].category, tokenId);
        userNFTsByCategory[msg.sender][nftMetadata[tokenId].category].push(tokenId);
        
        // Remove from marketplace
        isMarketplaceListed[tokenId] = false;
        marketplaceListings[tokenId].isActive = false;
        _removeFromActiveListings(tokenId);
        
        emit NFTSold(tokenId, listing.seller, msg.sender, price);
    }
    
    // List NFT on marketplace
    function listNFT(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be positive");
        require(!isMarketplaceListed[tokenId], "Already listed");
        
        isMarketplaceListed[tokenId] = true;
        marketplacePrice[tokenId] = price;
        
        marketplaceListings[tokenId] = MarketplaceListing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            isActive: true
        });
        
        activeListings.push(tokenId);
        
        emit NFTListed(tokenId, msg.sender, price);
    }
    
    // Remove NFT from marketplace
    function unlistNFT(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(isMarketplaceListed[tokenId], "Not listed");
        
        isMarketplaceListed[tokenId] = false;
        marketplaceListings[tokenId].isActive = false;
        _removeFromActiveListings(tokenId);
    }
    
    // Use NFT (for power-ups and utilities)
    function useNFT(uint256 tokenId, string memory gameType) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(nftMetadata[tokenId].isActive, "NFT not active");
        
        NFTMetadata memory metadata = nftMetadata[tokenId];
        
        if (metadata.category == NFTCategory.POWERUP) {
            // Power-ups are consumed on use
            nftMetadata[tokenId].isActive = false;
        }
        
        emit NFTUsed(msg.sender, tokenId, gameType);
    }
    
    // Get user's NFTs by category
    function getUserNFTsByCategory(address user, NFTCategory category) 
        external view returns (uint256[] memory) {
        return userNFTsByCategory[user][category];
    }
    
    // Get all active marketplace listings
    function getActiveListings() external view returns (uint256[] memory) {
        return activeListings;
    }
    
    // Get NFT metadata
    function getNFTMetadata(uint256 tokenId) external view returns (NFTMetadata memory) {
        require(_exists(tokenId), "NFT does not exist");
        return nftMetadata[tokenId];
    }
    
    // Helper functions
    function _removeFromUserCategory(address user, NFTCategory category, uint256 tokenId) internal {
        uint256[] storage userNFTs = userNFTsByCategory[user][category];
        for (uint256 i = 0; i < userNFTs.length; i++) {
            if (userNFTs[i] == tokenId) {
                userNFTs[i] = userNFTs[userNFTs.length - 1];
                userNFTs.pop();
                break;
            }
        }
    }
    
    function _removeFromActiveListings(uint256 tokenId) internal {
        for (uint256 i = 0; i < activeListings.length; i++) {
            if (activeListings[i] == tokenId) {
                activeListings[i] = activeListings[activeListings.length - 1];
                activeListings.pop();
                break;
            }
        }
    }
    
    // Override functions
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
