// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title TurtleTimepieceNFT
 * @dev ERC721 contract for the Turtle Timepiece NFT collection
 */
contract TurtleTimepieceNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Maximum supply of NFTs
    uint256 public constant MAX_SUPPLY = 8;
    
    // Mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;
    
    // Mapping to track which addresses have purchased NFTs
    mapping(address => bool) public hasPurchased;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Price per NFT in ETH (0.25 ETH ≈ $500 at ~$2000/ETH)
    uint256 public mintPrice = 0.001 ether;
    
    // Events
    event NFTMinted(address owner, uint256 tokenId, string tokenURI);
    
    constructor() ERC721("Turtle Timepiece", "TURTLE") {
        _baseTokenURI = "https://gateway.pinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/";
    }
    
    /**
     * @dev Returns the base URI for token metadata
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Updates the base URI for token metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Set the mint price
     * @param newPrice New price in wei
     */
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    /**
     * @dev Mint a new NFT with payment
     * @param recipient Address to receive the NFT
     * @return tokenId The newly minted token ID
     */
    function mintWithETH(address recipient) external payable returns (uint256) {
        require(_tokenIds.current() < MAX_SUPPLY, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient ETH sent");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(recipient, newTokenId);
        
        // Set the token URI - here we're using the tokenId as part of the URI
        string memory tokenURI = string(abi.encodePacked(_baseURI(), Strings.toString(newTokenId), ".json"));
        _setTokenURI(newTokenId, tokenURI);
        
        hasPurchased[recipient] = true;
        
        emit NFTMinted(recipient, newTokenId, tokenURI);
        
        return newTokenId;
    }
    
    /**
     * @dev Mint NFT directly (owner only)
     * @param recipient Address to receive the NFT
     * @param tokenURI URI for the token metadata
     * @return tokenId The newly minted token ID
     */
    function mintNFT(address recipient, string memory tokenURI) external onlyOwner returns (uint256) {
        require(_tokenIds.current() < MAX_SUPPLY, "Max supply reached");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        hasPurchased[recipient] = true;
        
        emit NFTMinted(recipient, newTokenId, tokenURI);
        
        return newTokenId;
    }
    
    /**
     * @dev Withdraw contract funds to owner
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Returns the current token count
     */
    function getTokenCount() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    /**
     * @dev Returns true if there are still NFTs available to mint
     */
    function availableToMint() external view returns (bool) {
        return _tokenIds.current() < MAX_SUPPLY;
    }
} 