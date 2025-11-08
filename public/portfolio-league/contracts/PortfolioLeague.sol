// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title PortfolioLeague
 * @dev Main contract for Portfolio League game - manages weekly competitions
 */
contract PortfolioLeague is Ownable {
    // Asset configuration
    enum Asset { BTC, ETH, SOL, USDC }
    
    // Portfolio struct
    struct Portfolio {
        Asset[3] assets;
        uint256 submittedAt;
        bool claimed;
    }
    
    // Week data
    struct Week {
        uint256 startTime;
        uint256 endTime;
        uint256 prizePool;
        uint256 participantCount;
        bool finalized;
        mapping(address => Portfolio) portfolios;
        address[] participants;
    }
    
    // State variables
    mapping(uint256 => Week) public weeks;
    uint256 public currentWeek;
    IERC20 public usdcToken;
    
    // Chainlink price feeds
    mapping(Asset => address) public priceFeeds;
    
    // Events
    event PortfolioSubmitted(address indexed player, uint256 week, Asset[3] assets);
    event WeekFinalized(uint256 week, uint256 prizePool);
    event PrizeClaimed(address indexed winner, uint256 amount);
    
    constructor(address _usdcToken) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
        currentWeek = 1;
        _initializeWeek(1);
    }
    
    /**
     * @dev Submit portfolio for current week
     */
    function submitPortfolio(Asset[3] calldata _assets) external {
        Week storage week = weeks[currentWeek];
        require(block.timestamp < week.endTime, "Week ended");
        require(week.portfolios[msg.sender].submittedAt == 0, "Already submitted");
        require(_validateAssets(_assets), "Invalid assets");
        
        week.portfolios[msg.sender] = Portfolio({
            assets: _assets,
            submittedAt: block.timestamp,
            claimed: false
        });
        
        week.participants.push(msg.sender);
        week.participantCount++;
        
        emit PortfolioSubmitted(msg.sender, currentWeek, _assets);
    }
    
    /**
     * @dev Get portfolio for a player in a specific week
     */
    function getPortfolio(uint256 _week, address _player) 
        external 
        view 
        returns (Asset[3] memory, uint256, bool) 
    {
        Portfolio memory portfolio = weeks[_week].portfolios[_player];
        return (portfolio.assets, portfolio.submittedAt, portfolio.claimed);
    }
    
    /**
     * @dev Finalize week and calculate winners (called by backend or keeper)
     */
    function finalizeWeek(uint256 _week, address[] calldata _winners, uint256[] calldata _prizes) 
        external 
        onlyOwner 
    {
        Week storage week = weeks[_week];
        require(!week.finalized, "Already finalized");
        require(_winners.length == _prizes.length, "Array length mismatch");
        
        week.finalized = true;
        
        emit WeekFinalized(_week, week.prizePool);
        
        // Start new week
        if (_week == currentWeek) {
            currentWeek++;
            _initializeWeek(currentWeek);
        }
    }
    
    /**
     * @dev Claim prize for winning week
     */
    function claimPrize(uint256 _week) external {
        Week storage week = weeks[_week];
        require(week.finalized, "Week not finalized");
        require(!week.portfolios[msg.sender].claimed, "Already claimed");
        
        // Calculate prize (simplified - real version would use oracle data)
        uint256 prize = _calculatePrize(_week, msg.sender);
        require(prize > 0, "No prize to claim");
        
        week.portfolios[msg.sender].claimed = true;
        usdcToken.transfer(msg.sender, prize);
        
        emit PrizeClaimed(msg.sender, prize);
    }
    
    /**
     * @dev Add funds to prize pool
     */
    function addPrizePool(uint256 _amount) external {
        usdcToken.transferFrom(msg.sender, address(this), _amount);
        weeks[currentWeek].prizePool += _amount;
    }
    
    /**
     * @dev Set price feed for asset
     */
    function setPriceFeed(Asset _asset, address _feed) external onlyOwner {
        priceFeeds[_asset] = _feed;
    }
    
    /**
     * @dev Get current price from Chainlink oracle
     */
    function getPrice(Asset _asset) public view returns (uint256) {
        if (_asset == Asset.USDC) return 1e8; // $1.00 with 8 decimals
        
        address feedAddress = priceFeeds[_asset];
        require(feedAddress != address(0), "Price feed not set");
        
        AggregatorV3Interface priceFeed = AggregatorV3Interface(feedAddress);
        (, int256 price, , ,) = priceFeed.latestRoundData();
        
        return uint256(price);
    }
    
    // Internal functions
    function _initializeWeek(uint256 _week) private {
        Week storage week = weeks[_week];
        week.startTime = block.timestamp;
        week.endTime = block.timestamp + 7 days;
        week.prizePool = 1000e6; // 1000 USDC (6 decimals)
    }
    
    function _validateAssets(Asset[3] calldata _assets) private pure returns (bool) {
        // Check for duplicates
        if (_assets[0] == _assets[1] || _assets[0] == _assets[2] || _assets[1] == _assets[2]) {
            return false;
        }
        return true;
    }
    
    function _calculatePrize(uint256 _week, address _player) private view returns (uint256) {
        // Simplified - real implementation would calculate based on performance
        // This would integrate with off-chain calculation and oracle data
        return 0;
    }
}
