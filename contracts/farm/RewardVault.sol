// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./interfaces/IERC20.sol";
import "./libraries/SafeERC20.sol";

import "./helpers/ReentrancyGuard.sol";
import "./helpers/Pausable.sol";
import "./helpers/Ownable.sol";

contract RewardVault is Ownable {
    using SafeERC20 for IERC20;

    /**
     * @dev Mapping of addresses that are authorized to add distribute rewards.
     */
    mapping(address => bool) public authorizedAddresses;

    /**
     * @dev Only authorized addresses can call a function with this modifier.
     */
    modifier onlyAuthorized() {
        require(
            authorizedAddresses[msg.sender],
            "Not authorized."
        );
        _;
    }

    /**
     * @dev Sets or revokes authorized address.
     * @param addr Address we are setting.
     * @param isAuthorized True is setting, false if we are revoking.
     */
    function setAuthorizedAddress(address addr, bool isAuthorized)
        external
        onlyOwner
    {
        authorizedAddresses[addr] = isAuthorized;
    }

    function transfer(address token, address to, uint256 amount) public onlyAuthorized {
        IERC20(token).safeTransfer(to, amount);
    }
}