// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AgentVault is AccessControl, ReentrancyGuard {
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");
    address public owner;

    event Deposit(address indexed sender, uint256 amount);
    event PaymentExecuted(address indexed to, uint256 amount, bytes32 txId);

    constructor(address _owner, address _signer) {
        owner = _owner;
        _grantRole(DEFAULT_ADMIN_ROLE, _owner);
        _grantRole(SIGNER_ROLE, _signer);
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @dev Only authorized signers (AgentRail Worker) can execute payments 
     * following the off-chain policy enforcement.
     */
    function executePayment(
        address payable to,
        uint256 amount,
        bytes32 txId
    ) external onlyRole(SIGNER_ROLE) nonReentrant {
        require(address(this).balance >= amount, "Insufficient vault balance");
        
        (bool success, ) = to.call{value: amount}("");
        require(success, "Payment transfer failed");
        
        emit PaymentExecuted(to, amount, txId);
    }

    function withdraw(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        payable(owner).transfer(amount);
    }
}
