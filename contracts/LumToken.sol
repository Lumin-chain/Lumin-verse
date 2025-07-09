// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LumToken is ERC20, ERC20Burnable, Pausable, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 10% initial circulation
    
    // Emission parameters
    uint256 public constant INITIAL_REWARD_PER_DAY = 1000 * 10**18;
    uint256 public constant DECAY_CONSTANT = 4; // 0.0004 * 10000 for precision
    uint256 public deploymentTime;
    
    // Allocation tracking
    mapping(address => uint256) public allocations;
    mapping(string => uint256) public categoryAllocations;
    
    // Reward tracking
    mapping(address => uint256) public lastRewardClaim;
    mapping(address => uint256) public totalRewardsEarned;
    
    // Game mechanics
    mapping(address => uint256) public playerPoints;
    mapping(address => uint256) public playerLevel;
    mapping(address => uint256) public dailyStreak;
    mapping(address => uint256) public lastPlayDate;
    
    // Events
    event RewardClaimed(address indexed player, uint256 amount, string gameType);
    event PointsEarned(address indexed player, uint256 points, string gameType);
    event LevelUp(address indexed player, uint256 newLevel);
    event StreakUpdated(address indexed player, uint256 streak);
    
    constructor() ERC20("Lumin Token", "LUM") {
        deploymentTime = block.timestamp;
        
        // Initial token distribution
        _mint(msg.sender, INITIAL_SUPPLY);
        
        // Set initial allocations
        categoryAllocations["playerRewards"] = 300_000_000 * 10**18; // 30%
        categoryAllocations["ecosystem"] = 250_000_000 * 10**18; // 25%
        categoryAllocations["team"] = 150_000_000 * 10**18; // 15%
        categoryAllocations["liquidity"] = 200_000_000 * 10**18; // 20%
        categoryAllocations["treasury"] = 100_000_000 * 10**18; // 10%
    }
    
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    // Calculate current reward rate based on exponential decay
    function getCurrentRewardRate() public view returns (uint256) {
        uint256 daysSinceDeployment = (block.timestamp - deploymentTime) / 86400;
        uint256 decayFactor = (DECAY_CONSTANT * daysSinceDeployment) / 10000;
        
        if (decayFactor > 100) return 0; // Prevent underflow
        
        return INITIAL_REWARD_PER_DAY * (100 - decayFactor) / 100;
    }
    
    // Award points for puzzle completion
    function awardPoints(
        address player,
        uint256 points,
        string memory gameType,
        uint256 timeElapsed,
        uint256 accuracy
    ) external onlyOwner {
        require(player != address(0), "Invalid player address");
        require(points > 0, "Points must be positive");
        
        // Base points
        uint256 totalPoints = points;
        
        // Time bonus (faster completion = more points)
        if (timeElapsed < 300) { // Less than 5 minutes
            totalPoints += (300 - timeElapsed) / 10;
        }
        
        // Accuracy bonus
        if (accuracy > 80) {
            totalPoints += (accuracy - 80) * 2;
        }
        
        // Daily streak bonus
        updateDailyStreak(player);
        if (dailyStreak[player] > 1) {
            totalPoints += dailyStreak[player] * 10;
        }
        
        playerPoints[player] += totalPoints;
        
        // Check for level up
        uint256 newLevel = calculateLevel(playerPoints[player]);
        if (newLevel > playerLevel[player]) {
            playerLevel[player] = newLevel;
            emit LevelUp(player, newLevel);
        }
        
        emit PointsEarned(player, totalPoints, gameType);
    }
    
    // Convert points to LUM tokens
    function claimRewards() external {
        address player = msg.sender;
        uint256 points = playerPoints[player];
        require(points > 0, "No points to claim");
        
        // Conversion rate: 100 points = 1 LUM token
        uint256 rewardAmount = points * 10**16; // 0.01 LUM per point
        
        // Apply current reward rate multiplier
        uint256 currentRate = getCurrentRewardRate();
        rewardAmount = (rewardAmount * currentRate) / INITIAL_REWARD_PER_DAY;
        
        require(totalSupply() + rewardAmount <= MAX_SUPPLY, "Would exceed max supply");
        require(categoryAllocations["playerRewards"] >= rewardAmount, "Insufficient reward allocation");
        
        // Reset points and mint tokens
        playerPoints[player] = 0;
        categoryAllocations["playerRewards"] -= rewardAmount;
        totalRewardsEarned[player] += rewardAmount;
        lastRewardClaim[player] = block.timestamp;
        
        _mint(player, rewardAmount);
        
        emit RewardClaimed(player, rewardAmount, "pointConversion");
    }
    
    // Update daily streak
    function updateDailyStreak(address player) internal {
        uint256 today = block.timestamp / 86400;
        uint256 lastPlay = lastPlayDate[player] / 86400;
        
        if (today == lastPlay + 1) {
            // Consecutive day
            dailyStreak[player]++;
        } else if (today > lastPlay + 1) {
            // Streak broken
            dailyStreak[player] = 1;
        }
        // If same day, don't change streak
        
        lastPlayDate[player] = block.timestamp;
        emit StreakUpdated(player, dailyStreak[player]);
    }
    
    // Calculate player level based on total points
    function calculateLevel(uint256 totalPoints) public pure returns (uint256) {
        if (totalPoints < 100) return 1;
        if (totalPoints < 500) return 2;
        if (totalPoints < 1000) return 3;
        if (totalPoints < 2500) return 4;
        if (totalPoints < 5000) return 5;
        if (totalPoints < 10000) return 6;
        if (totalPoints < 25000) return 7;
        if (totalPoints < 50000) return 8;
        if (totalPoints < 100000) return 9;
        return 10; // Max level
    }
    
    // PvP match rewards
    function awardPvPReward(address winner, address loser, uint256 wagerAmount) external onlyOwner {
        require(winner != address(0) && loser != address(0), "Invalid addresses");
        require(balanceOf(loser) >= wagerAmount, "Insufficient balance for wager");
        
        // Transfer wager from loser to winner
        _transfer(loser, winner, wagerAmount);
        
        // Award bonus points to winner
        playerPoints[winner] += 250; // Base PvP victory points
        
        emit RewardClaimed(winner, wagerAmount, "pvpVictory");
    }
    
    // Emergency functions
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= categoryAllocations["treasury"], "Exceeds treasury allocation");
        categoryAllocations["treasury"] -= amount;
        _mint(owner(), amount);
    }
    
    // View functions
    function getPlayerStats(address player) external view returns (
        uint256 points,
        uint256 level,
        uint256 streak,
        uint256 totalRewards,
        uint256 lastClaim
    ) {
        return (
            playerPoints[player],
            playerLevel[player],
            dailyStreak[player],
            totalRewardsEarned[player],
            lastRewardClaim[player]
        );
    }
    
    function getRemainingAllocation(string memory category) external view returns (uint256) {
        return categoryAllocations[category];
    }
    
    function getTimeUntilNextRewardDecay() external view returns (uint256) {
        uint256 daysSinceDeployment = (block.timestamp - deploymentTime) / 86400;
        return 86400 - ((block.timestamp - deploymentTime) % 86400);
    }
}
