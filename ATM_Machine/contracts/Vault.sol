// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "openzeppelin-solidity/contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/access/AccessControlEnumerable.sol";

/*********************
Contract: Vault

Variables: 
    token: which token vault could get
    maxWithdrawAmount: max withdraw amount token which could withdraw per time.
    withdrawEnable: enable or disable to withdraw

Constants:
    WITHDRAWER_ROLE: keccak string "WITHDRAWER_ROLE"

Functions:
    setToken: to set token for Vault contract     
    setMaxWithdrawAmount: set max withdraw amount token
    setWithdrawEnable: set enable or disable to withdraw
    withdraw: Allows a user to withdraw
    deposit: Allows a user to deposit

Constructor: set wallet deploy is admin role for this Vault  and ADMIN_ROLE could set or restrict WITHDRAWER_ROLE

Modifier: onlyWithdrawer : only Owner or hasRole(WITHDRAWER_ROLE) can able to call withdraw function

****************/
contract Vault is Ownable, AccessControlEnumerable {

    IERC20 private token;
    uint256 public maxWithdrawAmount;
    bool public withdrawEnable;
    bytes32 public constant WITHDRAWER_ROLE = keccak256("WITHDRAWER_ROLE");

    /**
    notice: to set token for Vault contract.
    param: _token which Vault can able to get.
    return: none.
    **/
    function setToken(IERC20 _token) public onlyOwner {
        token = _token;
    }

    /**
    notice: set max withdraw amount token.
    param: _maxWithdrawAmount the maximum amount User can withdraw
    return: none.
    **/
    function setMaxWithdrawAmount(uint256 _maxWithdrawAmount) public onlyOwner {
        maxWithdrawAmount = _maxWithdrawAmount;
    }

    /**
    notice: set enable or disable to withdraw.
    param: _isEnable User can enable or disable withdraw.
    return: none.
    **/
    function setWithdrawEnable(bool _isEnable) public onlyOwner {
        withdrawEnable = _isEnable;
    }

    /* Constructor: set wallet deploy is admin role for this Vault  and ADMIN_ROLE could set or restrict WITHDRAWER_ROLE  */
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    /**
    notice: Allows a user to withdraw .
    param: _amount the amount to withdraw of user
            _to The address of user
    return: none.
    **/
    function withdraw(
        uint256 _amount,
        address _to
    ) external onlyWithdrawer {
        require(withdrawEnable, "Withdraw is not available");
        require(_amount <= maxWithdrawAmount, "Exceed maximum amount allowed");
        token.transfer(_to, _amount);
    }

    /**
    notice: Allows a user to deposit
    param: _amount  The amount of ether the user sent in the transaction
     */
    function deposit(uint256 _amount) external {
        require(
            token.balanceOf(msg.sender) >= _amount,
            "Insufficient account balance to deposit"
        );
        SafeERC20.safeTransferFrom(token, msg.sender, address(this), _amount);
    }


    modifier onlyWithdrawer() {
        require(owner() == _msgSender() || hasRole(WITHDRAWER_ROLE, _msgSender()), "Caller is not a withdrawer");
        _;
    }
}