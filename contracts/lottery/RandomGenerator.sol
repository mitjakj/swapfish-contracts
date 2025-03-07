pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

interface IAnycallV6Proxy {
    function executor() external view returns (address);
}

interface IAnycallExecutor {
    function context() external returns (address from, uint256 fromChainID, uint256 nonce);
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

contract RandomGenerator is VRFConsumerBaseV2, Ownable {

  struct Lottery {
    uint endTime;
    uint vrfCallTimestamp;
    uint result;
  }

  mapping(uint => Lottery) public lotteryData;

  // VRF Settings
  VRFCoordinatorV2Interface COORDINATOR;
  uint64 s_subscriptionId;
  address vrfCoordinator;
  bytes32 s_keyHash;

  uint32 callbackGasLimit = 200000;
  uint16 requestConfirmations = 3;

  bool public autoBridge = true;

  mapping(uint => uint) private vrfRequest; // requestId => lotteryId
  uint constant VRF_CALL_DELAY = 60; // min delay between vrfCalls for same lotteryId in case of failed fulfill response
  address constant anyCallAddress = 0xC10Ef9F491C9B59f936957026020C321651ac078; // Same address on all chains
  address public srcChainLottery;

  constructor(
      uint64 _subscriptionId,
      address _vrfCoordinator,
      bytes32 _sKeyHash
  ) VRFConsumerBaseV2(_vrfCoordinator) {
      vrfCoordinator = _vrfCoordinator;
      COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
      s_subscriptionId = _subscriptionId;
      s_keyHash = _sKeyHash;
  }

  function draw(uint lotteryId) external {
    Lottery memory lottery = lotteryData[lotteryId];
    require(lottery.endTime != 0 && lottery.endTime < block.timestamp, 'Lottery not ended yet.');
    require(
      lottery.vrfCallTimestamp == 0 || (lottery.result == 0 && lottery.vrfCallTimestamp + VRF_CALL_DELAY < block.timestamp), 
      'Draw not allowed.'
    );

    lotteryData[lotteryId].vrfCallTimestamp = block.timestamp;

    // Will revert if subscription is not set and funded.
    uint256 _requestId = COORDINATOR.requestRandomWords(
        s_keyHash,
        s_subscriptionId,
        requestConfirmations,
        callbackGasLimit,
        1 // request 1 random number
    );

    vrfRequest[_requestId] = lotteryId;
  }

  function bridgeResult(uint lotteryId) external {
    _bridgeResult(lotteryId);
  }

  function calcFeeAndData(uint lotteryId) public view returns (uint256, bytes memory){
    bytes memory _data = abi.encode(lotteryId, lotteryData[lotteryId].result);
    uint256 fee = CallProxy(anyCallAddress).calcSrcFees(
      "0",
      42161,
      _data.length
    );
    return (fee, _data);
  } 

  function _bridgeResult(uint lotteryId) private {
    require(lotteryData[lotteryId].result != 0, "Result not drawn.");

    (uint256 fee, bytes memory _data) = calcFeeAndData(lotteryId);

    CallProxy(anyCallAddress).anyCall{value: fee}(
        srcChainLottery,
        _data,
        address(0), // we don't have fallback
        42161, // arbitrum one
        2 // fee paid on source chain
    );

    // Return unused fee by anyCall
    /*if (address(this).balance > 0) {
        payable(msg.sender).transfer(address(this).balance);
    }*/
  }

  /**
    * @dev Callback function for chainlinks contract to fulfill requestId with generated random numbers
    * @param requestId: requestId generated upon request submission
    * @param randomWords: random uint256 numbers
    */
  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
    uint lotteryId = vrfRequest[requestId];
    require(lotteryData[lotteryId].result == 0, 'Result already set.');

    lotteryData[lotteryId].result = 1000000 + (randomWords[0] % 1000000);

    if (autoBridge) {
      _bridgeResult(lotteryId);
    }
  }

  function anyExecute(bytes calldata data)
      external
      virtual
      returns (bool success, bytes memory result)
    {
      require(
          msg.sender == IAnycallV6Proxy(anyCallAddress).executor(), 
          "AnycallClient: not authorized"
      );

      address executor = IAnycallV6Proxy(anyCallAddress).executor();
      (address from, uint256 fromChainId,) = IAnycallExecutor(executor).context();
      require(from == srcChainLottery, "SRC lottery address wrong.");
      require(fromChainId == 42161, "SRC chain not arbitrum.");

      (
          uint256 lotteryId,
          uint256 endTime
      ) = abi.decode(
          data,
          (uint256, uint256)
      );
      require(lotteryData[lotteryId].endTime == 0, 'Endtime already set.');
      lotteryData[lotteryId].endTime = endTime;
  }

  function setSrcChainLottery(
        address _srcChainLottery
    ) external onlyOwner {
      require(srcChainLottery == address(0), "Already set.");
      srcChainLottery = _srcChainLottery;
  }

  function flipAutoBridge() external onlyOwner {
    autoBridge = !autoBridge;
  }

  receive() external payable {}

  function withdraw() external onlyOwner {
    payable(msg.sender).transfer(address(this).balance);
  }
}
