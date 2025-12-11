// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title ImitatiaTrophies
 * @notice Soulbound (non-transferable) NFT trophies for Imitatio achievements
 * @dev Trophies are minted to players for various achievements and cannot be transferred
 */
contract ImitatiaTrophies is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    // Trophy types
    enum TrophyType {
        WEEKLY_WINNER,      // 0 - Won a week
        SEASON_CHAMPION,    // 1 - Won a season
        HOT_STREAK,         // 2 - Top 10% for 3+ consecutive weeks
        PERFECT_PICK,       // 3 - 100%+ return in a week
        EARLY_ADOPTER,      // 4 - Season 1 participant
        GIANT_SLAYER        // 5 - Beat a top 50 player in challenge
    }

    // Trophy metadata
    struct Trophy {
        TrophyType trophyType;
        uint256 season;
        uint256 week;
        uint256 score;      // Score at time of achievement (scaled by 100)
        uint256 timestamp;
    }

    // Token ID counter
    uint256 private _tokenIdCounter;

    // Mapping from token ID to trophy data
    mapping(uint256 => Trophy) public trophies;

    // Mapping to track which achievements a user has (to prevent duplicates)
    // keccak256(address, trophyType, season, week) => bool
    mapping(bytes32 => bool) public achievementAwarded;

    // Authorized minters (game contract, admin)
    mapping(address => bool) public authorizedMinters;

    // Trophy type metadata
    mapping(TrophyType => string) public trophyNames;
    mapping(TrophyType => string) public trophyDescriptions;
    mapping(TrophyType => string) public trophyEmojis;

    // Events
    event TrophyAwarded(
        address indexed player,
        uint256 indexed tokenId,
        TrophyType trophyType,
        uint256 season,
        uint256 week
    );
    event MinterAuthorized(address indexed minter, bool authorized);

    constructor() ERC721("Imitatio Trophies", "IMTROPHY") Ownable(msg.sender) {
        // Initialize trophy metadata
        trophyNames[TrophyType.WEEKLY_WINNER] = "Weekly Champion";
        trophyNames[TrophyType.SEASON_CHAMPION] = "Season Champion";
        trophyNames[TrophyType.HOT_STREAK] = "Hot Streak";
        trophyNames[TrophyType.PERFECT_PICK] = "Perfect Pick";
        trophyNames[TrophyType.EARLY_ADOPTER] = "Early Adopter";
        trophyNames[TrophyType.GIANT_SLAYER] = "Giant Slayer";

        trophyDescriptions[TrophyType.WEEKLY_WINNER] = "Finished #1 in a weekly competition";
        trophyDescriptions[TrophyType.SEASON_CHAMPION] = "Won a full season of Imitatio";
        trophyDescriptions[TrophyType.HOT_STREAK] = "Finished in top 10% for 3+ consecutive weeks";
        trophyDescriptions[TrophyType.PERFECT_PICK] = "Achieved 100%+ portfolio return in a week";
        trophyDescriptions[TrophyType.EARLY_ADOPTER] = "Participated in Season 1";
        trophyDescriptions[TrophyType.GIANT_SLAYER] = "Beat a top 50 player in a challenge";

        trophyEmojis[TrophyType.WEEKLY_WINNER] = unicode"🥇";
        trophyEmojis[TrophyType.SEASON_CHAMPION] = unicode"🏆";
        trophyEmojis[TrophyType.HOT_STREAK] = unicode"🔥";
        trophyEmojis[TrophyType.PERFECT_PICK] = unicode"🎯";
        trophyEmojis[TrophyType.EARLY_ADOPTER] = unicode"🌱";
        trophyEmojis[TrophyType.GIANT_SLAYER] = unicode"⚔️";

        // Owner is automatically an authorized minter
        authorizedMinters[msg.sender] = true;
    }

    // ============ Modifiers ============

    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        _;
    }

    // ============ Soulbound Implementation ============

    /**
     * @notice Override transfer functions to make tokens soulbound
     * @dev Tokens can only be minted (from address(0)), not transferred
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) but prevent transfers
        if (from != address(0)) {
            revert("Soulbound: token cannot be transferred");
        }
        
        return super._update(to, tokenId, auth);
    }

    // ============ Minting Functions ============

    /**
     * @notice Award a trophy to a player
     * @param player Address of the player
     * @param trophyType Type of trophy to award
     * @param season Season number
     * @param week Week number (0 for season-wide achievements)
     * @param score Score at time of achievement (scaled by 100, e.g., 1234 = 12.34%)
     */
    function awardTrophy(
        address player,
        TrophyType trophyType,
        uint256 season,
        uint256 week,
        uint256 score
    ) external onlyAuthorizedMinter returns (uint256) {
        require(player != address(0), "Invalid player address");

        // Check for duplicate awards (same trophy type for same season/week)
        bytes32 achievementKey = keccak256(abi.encodePacked(player, trophyType, season, week));
        require(!achievementAwarded[achievementKey], "Achievement already awarded");

        // Increment token ID
        uint256 tokenId = _tokenIdCounter++;

        // Store trophy data
        trophies[tokenId] = Trophy({
            trophyType: trophyType,
            season: season,
            week: week,
            score: score,
            timestamp: block.timestamp
        });

        // Mark achievement as awarded
        achievementAwarded[achievementKey] = true;

        // Mint the token
        _safeMint(player, tokenId);

        emit TrophyAwarded(player, tokenId, trophyType, season, week);

        return tokenId;
    }

    /**
     * @notice Batch award trophies to multiple players
     * @dev Useful for end-of-week/season trophy distribution
     */
    function batchAwardTrophies(
        address[] calldata players,
        TrophyType[] calldata trophyTypes,
        uint256[] calldata seasons,
        uint256[] calldata weekNumbers,
        uint256[] calldata scores
    ) external onlyAuthorizedMinter {
        require(
            players.length == trophyTypes.length &&
            players.length == seasons.length &&
            players.length == weekNumbers.length &&
            players.length == scores.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < players.length; i++) {
            // Skip if already awarded (don't revert entire batch)
            bytes32 achievementKey = keccak256(
                abi.encodePacked(players[i], trophyTypes[i], seasons[i], weekNumbers[i])
            );
            if (achievementAwarded[achievementKey]) continue;

            uint256 tokenId = _tokenIdCounter++;

            trophies[tokenId] = Trophy({
                trophyType: trophyTypes[i],
                season: seasons[i],
                week: weekNumbers[i],
                score: scores[i],
                timestamp: block.timestamp
            });

            achievementAwarded[achievementKey] = true;
            _safeMint(players[i], tokenId);

            emit TrophyAwarded(players[i], tokenId, trophyTypes[i], seasons[i], weekNumbers[i]);
        }
    }

    // ============ View Functions ============

    /**
     * @notice Get trophy data for a token
     */
    function getTrophy(uint256 tokenId) external view returns (Trophy memory) {
        require(_ownerOf(tokenId) != address(0), "Trophy does not exist");
        return trophies[tokenId];
    }

    /**
     * @notice Check if a player has a specific achievement
     */
    function hasAchievement(
        address player,
        TrophyType trophyType,
        uint256 season,
        uint256 week
    ) external view returns (bool) {
        bytes32 achievementKey = keccak256(abi.encodePacked(player, trophyType, season, week));
        return achievementAwarded[achievementKey];
    }

    /**
     * @notice Get all trophy token IDs owned by a player
     */
    function getPlayerTrophies(address player) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(player);
        uint256[] memory tokenIds = new uint256[](balance);
        
        uint256 counter = 0;
        for (uint256 i = 0; i < _tokenIdCounter && counter < balance; i++) {
            if (_ownerOf(i) == player) {
                tokenIds[counter] = i;
                counter++;
            }
        }
        
        return tokenIds;
    }

    /**
     * @notice Get total number of trophies minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    // ============ Metadata Functions ============

    /**
     * @notice Generate on-chain SVG for trophy
     */
    function _generateSVG(uint256 tokenId) internal view returns (string memory) {
        Trophy memory trophy = trophies[tokenId];
        string memory emoji = trophyEmojis[trophy.trophyType];
        string memory name = trophyNames[trophy.trophyType];
        
        // Get background color based on trophy type
        string memory bgColor;
        if (trophy.trophyType == TrophyType.SEASON_CHAMPION || trophy.trophyType == TrophyType.EARLY_ADOPTER) {
            bgColor = "#F7931A"; // Gold for legendary
        } else if (trophy.trophyType == TrophyType.WEEKLY_WINNER || trophy.trophyType == TrophyType.HOT_STREAK) {
            bgColor = "#9945FF"; // Purple for epic
        } else {
            bgColor = "#0052FF"; // Blue for rare
        }

        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">',
            '<defs>',
            '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:#050507"/>',
            '<stop offset="100%" style="stop-color:#121217"/>',
            '</linearGradient>',
            '</defs>',
            '<rect width="400" height="400" fill="url(#bg)"/>',
            '<circle cx="200" cy="160" r="80" fill="', bgColor, '" opacity="0.2"/>',
            '<text x="200" y="180" text-anchor="middle" font-size="80">', emoji, '</text>',
            '<text x="200" y="260" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">', name, '</text>',
            '<text x="200" y="300" text-anchor="middle" fill="#71717a" font-family="Arial" font-size="16">Season ', trophy.season.toString(), ' - Week ', trophy.week.toString(), '</text>',
            '<text x="200" y="340" text-anchor="middle" fill="#0052FF" font-family="Arial" font-size="14">Imitatio</text>',
            '</svg>'
        ));
    }

    /**
     * @notice Generate token URI with on-chain metadata
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        Trophy memory trophy = trophies[tokenId];
        string memory name = trophyNames[trophy.trophyType];
        string memory description = trophyDescriptions[trophy.trophyType];
        
        string memory svg = _generateSVG(tokenId);
        string memory imageURI = string(abi.encodePacked(
            "data:image/svg+xml;base64,",
            Base64.encode(bytes(svg))
        ));

        string memory json = string(abi.encodePacked(
            '{"name":"', name, ' #', tokenId.toString(), '",',
            '"description":"', description, '",',
            '"image":"', imageURI, '",',
            '"attributes":[',
            '{"trait_type":"Trophy Type","value":"', name, '"},',
            '{"trait_type":"Season","value":', trophy.season.toString(), '},',
            '{"trait_type":"Week","value":', trophy.week.toString(), '},',
            '{"trait_type":"Score","value":', trophy.score.toString(), '},',
            '{"trait_type":"Soulbound","value":"Yes"}',
            ']}'
        ));

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }

    // ============ Admin Functions ============

    /**
     * @notice Authorize or revoke a minter
     */
    function setMinterAuthorization(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
        emit MinterAuthorized(minter, authorized);
    }

    /**
     * @notice Update trophy metadata
     */
    function setTrophyMetadata(
        TrophyType trophyType,
        string calldata name,
        string calldata description,
        string calldata emoji
    ) external onlyOwner {
        trophyNames[trophyType] = name;
        trophyDescriptions[trophyType] = description;
        trophyEmojis[trophyType] = emoji;
    }

    // ============ Required Overrides ============

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

