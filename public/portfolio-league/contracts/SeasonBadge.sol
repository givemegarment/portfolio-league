// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title SeasonBadge
 * @dev NFT badge for Portfolio League seasons - dynamic metadata based on performance
 */
contract SeasonBadge is ERC721, Ownable {
    using Strings for uint256;
    
    // Badge data
    struct Badge {
        uint256 season;
        uint256 rank;
        uint256 totalParticipants;
        uint256 bestReturn;
        uint256 weeksPlayed;
        uint256 mintedAt;
    }
    
    // State
    mapping(uint256 => Badge) public badges;
    uint256 private _nextTokenId;
    uint256 public currentSeason;
    address public leagueContract;
    
    // Events
    event BadgeMinted(address indexed player, uint256 tokenId, uint256 season);
    
    constructor() ERC721("Portfolio League Badge", "PLB") Ownable(msg.sender) {
        currentSeason = 1;
    }
    
    /**
     * @dev Mint season badge
     */
    function mint(
        address _to,
        uint256 _rank,
        uint256 _totalParticipants,
        uint256 _bestReturn,
        uint256 _weeksPlayed
    ) external returns (uint256) {
        require(msg.sender == leagueContract || msg.sender == owner(), "Not authorized");
        
        uint256 tokenId = _nextTokenId++;
        
        badges[tokenId] = Badge({
            season: currentSeason,
            rank: _rank,
            totalParticipants: _totalParticipants,
            bestReturn: _bestReturn,
            weeksPlayed: _weeksPlayed,
            mintedAt: block.timestamp
        });
        
        _safeMint(_to, tokenId);
        
        emit BadgeMinted(_to, tokenId, currentSeason);
        
        return tokenId;
    }
    
    /**
     * @dev Set league contract address
     */
    function setLeagueContract(address _contract) external onlyOwner {
        leagueContract = _contract;
    }
    
    /**
     * @dev Start new season
     */
    function startNewSeason() external onlyOwner {
        currentSeason++;
    }
    
    /**
     * @dev Generate dynamic SVG badge
     */
    function _generateSVG(uint256 tokenId) private view returns (string memory) {
        Badge memory badge = badges[tokenId];
        
        string memory rankTier = _getRankTier(badge.rank, badge.totalParticipants);
        string memory color = _getTierColor(rankTier);
        
        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350">',
            '<defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:', color, ';stop-opacity:1" />',
            '<stop offset="100%" style="stop-color:#000;stop-opacity:1" />',
            '</linearGradient></defs>',
            '<rect width="350" height="350" fill="url(#grad)"/>',
            '<text x="175" y="80" font-size="24" fill="white" text-anchor="middle" font-weight="bold">',
            'PORTFOLIO LEAGUE',
            '</text>',
            '<text x="175" y="120" font-size="48" fill="white" text-anchor="middle" font-weight="bold">',
            'SEASON ', badge.season.toString(),
            '</text>',
            '<text x="175" y="170" font-size="32" fill="', color, '" text-anchor="middle" font-weight="bold">',
            rankTier,
            '</text>',
            '<text x="175" y="210" font-size="18" fill="white" text-anchor="middle">',
            'Rank: #', badge.rank.toString(), ' / ', badge.totalParticipants.toString(),
            '</text>',
            '<text x="175" y="240" font-size="18" fill="white" text-anchor="middle">',
            'Best Return: +', badge.bestReturn.toString(), '%',
            '</text>',
            '<text x="175" y="270" font-size="18" fill="white" text-anchor="middle">',
            'Weeks Played: ', badge.weeksPlayed.toString(),
            '</text>',
            '<text x="175" y="320" font-size="14" fill="gray" text-anchor="middle">',
            'Built on Base',
            '</text>',
            '</svg>'
        ));
    }
    
    /**
     * @dev Get rank tier based on percentile
     */
    function _getRankTier(uint256 rank, uint256 total) private pure returns (string memory) {
        uint256 percentile = (rank * 100) / total;
        
        if (percentile <= 1) return "LEGENDARY";
        if (percentile <= 5) return "ELITE";
        if (percentile <= 10) return "GOLD";
        if (percentile <= 25) return "SILVER";
        return "BRONZE";
    }
    
    /**
     * @dev Get color for tier
     */
    function _getTierColor(string memory tier) private pure returns (string memory) {
        bytes32 tierHash = keccak256(bytes(tier));
        
        if (tierHash == keccak256("LEGENDARY")) return "#FF0080";
        if (tierHash == keccak256("ELITE")) return "#0052FF";
        if (tierHash == keccak256("GOLD")) return "#FFD700";
        if (tierHash == keccak256("SILVER")) return "#C0C0C0";
        return "#CD7F32";
    }
    
    /**
     * @dev Generate token URI with dynamic metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        Badge memory badge = badges[tokenId];
        string memory svg = _generateSVG(tokenId);
        string memory rankTier = _getRankTier(badge.rank, badge.totalParticipants);
        
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Portfolio League Season ', badge.season.toString(), ' - ', rankTier, '",',
                        '"description": "Season ', badge.season.toString(), ' badge for Portfolio League. Rank #', 
                        badge.rank.toString(), ' out of ', badge.totalParticipants.toString(), ' participants.",',
                        '"image": "data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '",',
                        '"attributes": [',
                        '{"trait_type": "Season", "value": "', badge.season.toString(), '"},',
                        '{"trait_type": "Rank", "value": ', badge.rank.toString(), '},',
                        '{"trait_type": "Tier", "value": "', rankTier, '"},',
                        '{"trait_type": "Best Return", "value": ', badge.bestReturn.toString(), '},',
                        '{"trait_type": "Weeks Played", "value": ', badge.weeksPlayed.toString(), '}',
                        ']}'
                    )
                )
            )
        );
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }
}
