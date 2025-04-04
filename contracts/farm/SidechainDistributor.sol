// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./interfaces/IERC20.sol";
import "./libraries/SafeERC20.sol";

interface INativeFarm {
    // Deposit LP tokens to the farm for farm's token allocation.
    function deposit(uint256 _pid, uint256 _amount) external;
    // Withdraw LP tokens from MasterChef.
    function withdraw(uint256 _pid, uint256 _amount) external;
    // Get pool info
    function poolInfo(uint256 index) external view returns (address, uint256, uint256, uint256);
    // cake
    function cake() external view returns (address);
    function totalAllocPoint() external view returns (uint256);
    function cakePerSecond() external view returns (uint256);
}

interface CallProxy{
    function anyCall(
        address _to,
        bytes calldata _data,
        address _fallback,
        uint256 _toChainID,
        uint256 _flags

    ) external payable;

    function calcSrcFees(
        string calldata _appID,
        uint256 _toChainID,
        uint256 _dataLength
    ) external view returns (uint256);
}

interface IMultichainRouter {
    function swapout(
        address token,
        uint256 amount,
        address receiver,
        uint256 toChainId,
        uint256 flags
    ) external payable;
}

contract SidechainDistributor {
  using SafeERC20 for IERC20;
  using SafeMath for uint256;

  address constant anyCallAddress = 0xC10Ef9F491C9B59f936957026020C321651ac078; // Same address on all chains
    
  address public lpAddress; 
  address public nativeFarm; 
  address public sideChainFarm; 
  address public sideChainRewardVault; 
  address public multichainRouter; 
  address public anyToken; 
  address public fish; 
  uint256 public pid; 
  uint256 public destChainId; 

  constructor(
    address _nativeFarm,
    address _sideChainFarm,
    uint256 _pid,
    uint256 _destChainId,
    address _sideChainRewardVault,
    address _multichainRouter,
    address _anyToken
  ) public {
    nativeFarm = _nativeFarm;
    sideChainFarm = _sideChainFarm;
    pid = _pid;
    destChainId = _destChainId;
    sideChainRewardVault = _sideChainRewardVault;
    multichainRouter = _multichainRouter;
    anyToken = _anyToken;

    // load lpAddress
    (lpAddress,,,) = INativeFarm(_nativeFarm).poolInfo(_pid);
    // load Fish address
    fish = INativeFarm(_nativeFarm).cake();
    // Infinite approve
    IERC20(lpAddress).safeApprove(_nativeFarm, uint256(-1));
  }

  function deposit() external {
    uint256 bal = IERC20(lpAddress).balanceOf(msg.sender);
    IERC20(lpAddress).transferFrom(msg.sender, address(this), bal);

    INativeFarm(nativeFarm).deposit(pid, bal);
  }

  function bridgeRewards() external payable {
    INativeFarm(nativeFarm).withdraw(pid, 0);

    uint256 bal = IERC20(fish).balanceOf(address(this));

    IERC20(fish).safeIncreaseAllowance(multichainRouter, bal);

    IMultichainRouter(multichainRouter).swapout{value: msg.value}(
        anyToken, // address token,
        bal, // uint256 amount,
        sideChainRewardVault, // address receiver,
        destChainId, // uint256 toChainId,
        2 // uint256 flags - 2 = fee paid on source chain, 9 = dest chain (cheaper)
    );

    // Return unused fee by anyCall
    if (address(this).balance > 0) {
        payable(msg.sender).transfer(address(this).balance);
    }
  }

  function getEmissionsPerSecond() public view returns (uint256) {
    (,uint256 allocPoint,,) = INativeFarm(nativeFarm).poolInfo(pid);
    uint256 totalAllocPoint = INativeFarm(nativeFarm).totalAllocPoint();
    uint256 cakePerSecond = INativeFarm(nativeFarm).cakePerSecond();

    return allocPoint.mul(cakePerSecond).div(totalAllocPoint);
  }

  function bridgeEmissions() external payable {
    (uint256 fee, bytes memory _data) = calcFeeAndData(getEmissionsPerSecond());

    CallProxy(anyCallAddress).anyCall{value: fee}(
        sideChainFarm,
        _data,
        address(0), // we don't have fallback
        destChainId, // polygon
        2 // fee paid on source chain
    );

    // Return unused fee by anyCall
    if (address(this).balance > 0) {
        payable(msg.sender).transfer(address(this).balance);
    }
  }

  function calcFeeAndData(uint emissions) public view returns (uint256, bytes memory){
    bytes memory _data = abi.encode(emissions);
    uint256 fee = CallProxy(anyCallAddress).calcSrcFees(
      "0",
      destChainId,
      _data.length
    );
    return (fee, _data);
  } 

  receive() external payable {}
}