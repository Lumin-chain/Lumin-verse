// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";

interface ILumToken {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract LumDAO is 
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    ILumToken public lumToken;
    
    // Proposal categories
    enum ProposalCategory { 
        GAME_FEATURE,      // New game types, mechanics
        TOKENOMICS,        // Reward rates, token distribution
        GOVERNANCE,        // DAO parameters, voting rules
        PUZZLE_CONTENT,    // Community puzzle submissions
        PARTNERSHIP,       // External collaborations
        TREASURY          // Treasury management
    }
    
    struct ProposalMetadata {
        ProposalCategory category;
        string title;
        string description;
        address proposer;
        uint256 createdAt;
        bool executed;
    }
    
    // Mappings
    mapping(uint256 => ProposalMetadata) public proposalMetadata;
    mapping(address => uint256) public proposalCount;
    mapping(ProposalCategory => uint256) public categoryProposalCount;
    
    // Minimum LUM tokens required to create proposals
    uint256 public constant PROPOSAL_THRESHOLD = 10000 * 10**18; // 10,000 LUM
    uint256 public constant MIN_VOTING_POWER = 1000 * 10**18;    // 1,000 LUM to vote
    
    // Treasury management
    uint256 public treasuryBalance;
    mapping(address => bool) public authorizedSpenders;
    
    // Events
    event ProposalCreatedWithMetadata(
        uint256 indexed proposalId,
        address indexed proposer,
        ProposalCategory category,
        string title
    );
    event TreasuryFunded(address indexed funder, uint256 amount);
    event TreasurySpent(address indexed spender, uint256 amount, string purpose);
    event PuzzleApproved(uint256 indexed proposalId, address indexed creator, uint256 reward);
    
    constructor(
        IVotes _token,
        TimelockController _timelock,
        address _lumTokenAddress
    )
        Governor("LumDAO")
        GovernorSettings(1, 50400, 0) // 1 block delay, ~1 week voting period, 0 proposal threshold
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% quorum
        GovernorTimelockControl(_timelock)
    {
        lumToken = ILumToken(_lumTokenAddress);
    }
    
    // Create proposal with metadata
    function proposeWithMetadata(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description,
        ProposalCategory category,
        string memory title
    ) public returns (uint256) {
        require(
            lumToken.balanceOf(msg.sender) >= PROPOSAL_THRESHOLD,
            "Insufficient LUM tokens to create proposal"
        );
        
        uint256 proposalId = propose(targets, values, calldatas, description);
        
        proposalMetadata[proposalId] = ProposalMetadata({
            category: category,
            title: title,
            description: description,
            proposer: msg.sender,
            createdAt: block.timestamp,
            executed: false
        });
        
        proposalCount[msg.sender]++;
        categoryProposalCount[category]++;
        
        emit ProposalCreatedWithMetadata(proposalId, msg.sender, category, title);
        
        return proposalId;
    }
    
    // Puzzle submission and approval system
    function submitPuzzleProposal(
        string memory puzzleData,
        string memory title,
        string memory description,
        uint256 requestedReward
    ) external returns (uint256) {
        require(requestedReward <= 1000 * 10**18, "Reward too high"); // Max 1000 LUM
        
        // Create a proposal for puzzle approval
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);
        
        targets[0] = address(this);
        values[0] = 0;
        calldatas[0] = abi.encodeWithSignature(
            "approvePuzzle(address,uint256,string)",
            msg.sender,
            requestedReward,
            puzzleData
        );
        
        return proposeWithMetadata(
            targets,
            values,
            calldatas,
            description,
            ProposalCategory.PUZZLE_CONTENT,
            title
        );
    }
    
    // Approve puzzle and reward creator
    function approvePuzzle(
        address creator,
        uint256 reward,
        string memory puzzleData
    ) external {
        require(msg.sender == address(this), "Only callable through governance");
        require(treasuryBalance >= reward, "Insufficient treasury balance");
        
        treasuryBalance -= reward;
        require(lumToken.transfer(creator, reward), "Reward transfer failed");
        
        emit PuzzleApproved(0, creator, reward); // proposalId would be passed in real implementation
    }
    
    // Treasury management functions
    function fundTreasury(uint256 amount) external {
        require(
            lumToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        treasuryBalance += amount;
        emit TreasuryFunded(msg.sender, amount);
    }
    
    function spendFromTreasury(
        address recipient,
        uint256 amount,
        string memory purpose
    ) external {
        require(authorizedSpenders[msg.sender], "Not authorized to spend");
        require(treasuryBalance >= amount, "Insufficient treasury balance");
        
        treasuryBalance -= amount;
        require(lumToken.transfer(recipient, amount), "Transfer failed");
        
        emit TreasurySpent(msg.sender, amount, purpose);
    }
    
    function authorizeSpender(address spender) external onlyGovernance {
        authorizedSpenders[spender] = true;
    }
    
    function revokeSpender(address spender) external onlyGovernance {
        authorizedSpenders[spender] = false;
    }
    
    // Voting power check
    function hasVotingPower(address account) public view returns (bool) {
        return getVotes(account, block.number - 1) >= MIN_VOTING_POWER;
    }
    
    // Get proposals by category
    function getProposalsByCategory(ProposalCategory category) 
        external view returns (uint256) {
        return categoryProposalCount[category];
    }
    
    // Get user's proposal history
    function getUserProposalCount(address user) external view returns (uint256) {
        return proposalCount[user];
    }
    
    // Override functions
    function votingDelay()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }
    
    function votingPeriod()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }
    
    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }
    
    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }
    
    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }
    
    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
        proposalMetadata[proposalId].executed = true;
    }
    
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }
    
    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
