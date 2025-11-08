// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PortfolioLeague
 * @dev v1: Paper trading with USDC prize pools
 * Players submit 3-asset allocations, performance tracked via oracle prices
 * Top decile wins share of prize pool, everyone gets season badge NFT
 */
contract PortfolioLeague is Ownable, ReentrancyGuard, ERC721 {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Asset types
    enum Asset { BTC, ETH, SOL, USDC_YIELD }
    
    // League status
    enum LeagueStatus { Upcoming, Active, Completed }
    
    struct Portfolio {
        address user;
        uint8[3] allocations; // 3 assets, each 0-100%
        Asset[3] assets;
        uint256 submittedAt;
        uint256 initialValue; // In basis points (10000 = 100%)
        uint256 finalValue;
        uint256 rank;
        bool claimed;
    }
    
    struct League {
        uint256 season;
        uint256 startTime;
        uint256 endTime;
        uint256 prizePool;
        LeagueStatus status;
        uint256 participantCount;
        uint256 topDecileCount;
        mapping(address => Portfolio) portfolios;
        mapping(uint256 => address) rankings; // rank => user
        address[] participants;
    }
    
    struct PriceSnapshot {
        uint256 btcPrice;
        uint256 ethPrice;
        uint256 solPrice;
        uint256 usdcYield; // APY in basis points
        uint256 timestamp;
    }
    
    // State variables
    mapping(uint256 => League) public leagues;
    mapping(uint256 => PriceSnapshot) public startPrices;
    mapping(uint256 => PriceSnapshot) public endPrices;
    mapping(uint256 => string) private _tokenURIs;
    
    uint256 public currentSeason;
    address public priceOracle;
    IERC20 public usdcToken;
    
    uint256 public constant ENTRY_FEE = 0; // Free to play v1
    uint256 public constant MAX_ALLOCATION = 100;
    uint256 public constant BASIS_POINTS = 10000;
    
    // Events
    event LeagueCreated(uint256 indexed season, uint256 startTime, uint256 endTime, uint256 prizePool);
    event PortfolioSubmitted(uint256 indexed season, address indexed user, Asset[3] assets, uint8[3] allocations);
    event LeagueFinalized(uint256 indexed season, uint256 winnerCount);
    event PrizesClaimed(uint256 indexed season, address indexed user, uint256 amount);
    event BadgeMinted(uint256 indexed tokenId, uint256 indexed season, address indexed user, uint256 rank);
    
    constructor(address _usdcToken, address _priceOracle) 
        ERC721("Portfolio League Badge", "PLB") 
        Ownable(msg.sender)
    {
        usdcToken = IERC20(_usdcToken);
        priceOracle = _priceOracle;
        currentSeason = 1;
    }
    
    /**
     * @dev Create a new league for the upcoming week
     */
    function createLeague(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _prizePool
    ) external onlyOwner {
        require(_startTime > block.timestamp, "Start time must be in future");
        require(_endTime > _startTime, "End time must be after start");
        require(_endTime - _startTime == 7 days, "League must be exactly 7 days");
        
        League storage league = leagues[currentSeason];
        league.season = currentSeason;
        league.startTime = _startTime;
        league.endTime = _endTime;
        league.prizePool = _prizePool;
        league.status = LeagueStatus.Upcoming;
        
        // Transfer prize pool to contract
        if (_prizePool > 0) {
            require(
                usdcToken.transferFrom(msg.sender, address(this), _prizePool),
                "Prize pool transfer failed"
            );
        }
        
        emit LeagueCreated(currentSeason, _startTime, _endTime, _prizePool);
    }
    
    /**
     * @dev Submit portfolio for current season
     */
    function submitPortfolio(
        Asset[3] calldata _assets,
        uint8[3] calldata _allocations
    ) external nonReentrant {
        League storage league = leagues[currentSeason];
        
        require(league.status == LeagueStatus.Active, "League not active");
        require(block.timestamp >= league.startTime, "League not started");
        require(block.timestamp < league.endTime, "League ended");
        require(league.portfolios[msg.sender].submittedAt == 0, "Already submitted");
        
        // Validate allocations sum to 100%
        uint256 totalAllocation = 0;
        for (uint256 i = 0; i < 3; i++) {
            require(_allocations[i] <= MAX_ALLOCATION, "Allocation exceeds 100%");
            totalAllocation += _allocations[i];
        }
        require(totalAllocation == MAX_ALLOCATION, "Allocations must sum to 100%");
        
        // Validate no duplicate assets
        require(_assets[0] != _assets[1] && _assets[1] != _assets[2] && _assets[0] != _assets[2], 
                "Duplicate assets not allowed");
        
        Portfolio storage portfolio = league.portfolios[msg.sender];
        portfolio.user = msg.sender;
        portfolio.assets = _assets;
        portfolio.allocations = _allocations;
        portfolio.submittedAt = block.timestamp;
        portfolio.initialValue = BASIS_POINTS; // Start at 100%
        
        league.participants.push(msg.sender);
        league.participantCount++;
        
        emit PortfolioSubmitted(currentSeason, msg.sender, _assets, _allocations);
    }
    
    /**
     * @dev Start the league (called by oracle at start time)
     */
    function startLeague(
        uint256 _season,
        uint256 _btcPrice,
        uint256 _ethPrice,
        uint256 _solPrice,
        uint256 _usdcYield
    ) external {
        require(msg.sender == priceOracle, "Only oracle");
        League storage league = leagues[_season];
        require(league.status == LeagueStatus.Upcoming, "League not upcoming");
        require(block.timestamp >= league.startTime, "Too early");
        
        league.status = LeagueStatus.Active;
        
        startPrices[_season] = PriceSnapshot({
            btcPrice: _btcPrice,
            ethPrice: _ethPrice,
            solPrice: _solPrice,
            usdcYield: _usdcYield,
            timestamp: block.timestamp
        });
    }
    
    /**
     * @dev Finalize league and calculate rankings (called by oracle at end time)
     */
    function finalizeLeague(
        uint256 _season,
        uint256 _btcPrice,
        uint256 _ethPrice,
        uint256 _solPrice,
        uint256 _usdcYield
    ) external {
        require(msg.sender == priceOracle, "Only oracle");
        League storage league = leagues[_season];
        require(league.status == LeagueStatus.Active, "League not active");
        require(block.timestamp >= league.endTime, "League not ended");
        
        league.status = LeagueStatus.Completed;
        
        endPrices[_season] = PriceSnapshot({
            btcPrice: _btcPrice,
            ethPrice: _ethPrice,
            solPrice: _solPrice,
            usdcYield: _usdcYield,
            timestamp: block.timestamp
        });
        
        // Calculate final values for all portfolios
        _calculateReturns(_season);
        
        // Sort and rank portfolios
        _rankPortfolios(_season);
        
        // Calculate top decile
        league.topDecileCount = (league.participantCount + 9) / 10; // Round up
        
        emit LeagueFinalized(_season, league.topDecileCount);
        
        // Increment season for next league
        currentSeason++;
    }
    
    /**
     * @dev Calculate returns for all portfolios in a league
     */
    function _calculateReturns(uint256 _season) private {
        League storage league = leagues[_season];
        PriceSnapshot memory start = startPrices[_season];
        PriceSnapshot memory end = endPrices[_season];
        
        for (uint256 i = 0; i < league.participants.length; i++) {
            address user = league.participants[i];
            Portfolio storage portfolio = league.portfolios[user];
            
            uint256 finalValue = 0;
            
            for (uint256 j = 0; j < 3; j++) {
                uint256 allocation = portfolio.allocations[j];
                uint256 assetReturn = _getAssetReturn(
                    portfolio.assets[j],
                    start,
                    end
                );
                
                // Calculate contribution to portfolio value
                finalValue += (allocation * assetReturn) / MAX_ALLOCATION;
            }
            
            portfolio.finalValue = finalValue;
        }
    }
    
    /**
     * @dev Get return for a specific asset
     */
    function _getAssetReturn(
        Asset _asset,
        PriceSnapshot memory _start,
        PriceSnapshot memory _end
    ) private pure returns (uint256) {
        if (_asset == Asset.BTC) {
            return (_end.btcPrice * BASIS_POINTS) / _start.btcPrice;
        } else if (_asset == Asset.ETH) {
            return (_end.ethPrice * BASIS_POINTS) / _start.ethPrice;
        } else if (_asset == Asset.SOL) {
            return (_end.solPrice * BASIS_POINTS) / _start.solPrice;
        } else { // USDC_YIELD
            // Calculate yield over 7 days
            uint256 weeklyYield = (_start.usdcYield * 7) / 365;
            return BASIS_POINTS + weeklyYield;
        }
    }
    
    /**
     * @dev Rank portfolios by performance
     */
    function _rankPortfolios(uint256 _season) private {
        League storage league = leagues[_season];
        
        // Simple bubble sort (fine for weekly cohorts)
        address[] memory sorted = league.participants;
        
        for (uint256 i = 0; i < sorted.length; i++) {
            for (uint256 j = i + 1; j < sorted.length; j++) {
                if (league.portfolios[sorted[j]].finalValue > 
                    league.portfolios[sorted[i]].finalValue) {
                    address temp = sorted[i];
                    sorted[i] = sorted[j];
                    sorted[j] = temp;
                }
            }
        }
        
        // Assign ranks
        for (uint256 i = 0; i < sorted.length; i++) {
            league.portfolios[sorted[i]].rank = i + 1;
            league.rankings[i + 1] = sorted[i];
        }
    }
    
    /**
     * @dev Claim prize for being in top decile
     */
    function claimPrize(uint256 _season) external nonReentrant {
        League storage league = leagues[_season];
        require(league.status == LeagueStatus.Completed, "League not completed");
        
        Portfolio storage portfolio = league.portfolios[msg.sender];
        require(portfolio.submittedAt > 0, "No portfolio submitted");
        require(!portfolio.claimed, "Prize already claimed");
        require(portfolio.rank <= league.topDecileCount, "Not in top decile");
        
        portfolio.claimed = true;
        
        // Calculate prize share (equal split among winners)
        uint256 prizeShare = league.prizePool / league.topDecileCount;
        
        require(usdcToken.transfer(msg.sender, prizeShare), "Prize transfer failed");
        
        emit PrizesClaimed(_season, msg.sender, prizeShare);
    }
    
    /**
     * @dev Mint season badge NFT
     */
    function mintBadge(uint256 _season, string memory _tokenURI) external {
        League storage league = leagues[_season];
        require(league.status == LeagueStatus.Completed, "League not completed");
        
        Portfolio storage portfolio = league.portfolios[msg.sender];
        require(portfolio.submittedAt > 0, "No portfolio submitted");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(msg.sender, tokenId);
        _tokenURIs[tokenId] = _tokenURI;
        
        emit BadgeMinted(tokenId, _season, msg.sender, portfolio.rank);
    }
    
    /**
     * @dev Get portfolio for user in a season
     */
    function getPortfolio(uint256 _season, address _user) 
        external 
        view 
        returns (
            Asset[3] memory assets,
            uint8[3] memory allocations,
            uint256 submittedAt,
            uint256 initialValue,
            uint256 finalValue,
            uint256 rank
        ) 
    {
        Portfolio storage portfolio = leagues[_season].portfolios[_user];
        return (
            portfolio.assets,
            portfolio.allocations,
            portfolio.submittedAt,
            portfolio.initialValue,
            portfolio.finalValue,
            portfolio.rank
        );
    }
    
    /**
     * @dev Get leaderboard for a season
     */
    function getLeaderboard(uint256 _season, uint256 _limit) 
        external 
        view 
        returns (address[] memory users, uint256[] memory values) 
    {
        League storage league = leagues[_season];
        uint256 count = _limit < league.participantCount ? _limit : league.participantCount;
        
        users = new address[](count);
        values = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            address user = league.rankings[i + 1];
            users[i] = user;
            values[i] = league.portfolios[user].finalValue;
        }
        
        return (users, values);
    }
    
    /**
     * @dev Update price oracle address
     */
    function setPriceOracle(address _newOracle) external onlyOwner {
        priceOracle = _newOracle;
    }
    
    /**
     * @dev Get token URI
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        virtual 
        override 
        returns (string memory) 
    {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenURIs[tokenId];
    }
}
