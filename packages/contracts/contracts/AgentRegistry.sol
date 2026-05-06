// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AgentRegistry is Ownable, ReentrancyGuard {
    struct Agent {
        address owner;
        address vault;
        string metadataURI;
        bool isActive;
    }

    mapping(bytes32 => Agent) public agents;
    mapping(address => bytes32[]) public ownerAgents;

    event AgentRegistered(bytes32 indexed agentId, address indexed owner, address vault);
    event AgentRevoked(bytes32 indexed agentId);

    constructor() Ownable(msg.sender) {}

    function registerAgent(
        bytes32 agentId,
        address vault,
        string calldata metadataURI
    ) external {
        require(agents[agentId].owner == address(0), "Agent already registered");
        
        agents[agentId] = Agent({
            owner: msg.sender,
            vault: vault,
            metadataURI: metadataURI,
            isActive: true
        });
        
        ownerAgents[msg.sender].push(agentId);
        emit AgentRegistered(agentId, msg.sender, vault);
    }

    function revokeAgent(bytes32 agentId) external {
        require(agents[agentId].owner == msg.sender || msg.sender == owner(), "Not authorized");
        agents[agentId].isActive = false;
        emit AgentRevoked(agentId);
    }

    function isAgentActive(bytes32 agentId) external view returns (bool) {
        return agents[agentId].isActive;
    }
}
