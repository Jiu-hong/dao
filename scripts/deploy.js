// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
const hre = require("hardhat");



async function main() {
  const [executor, proposer, voter1, voter2, voter3, voter4, voter5] = await ethers.getSigners();

  const name = "Jiuhong"
  const symbol = "JH"
  const supply = ethers.utils.parseEther("1000") // 1000 Tokens

    // Deploy token
  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy(name, symbol, supply);
  await token.deployed();

  const amount = ethers.utils.parseEther("50")
  await token.transfer(voter1.address, amount)
  await token.transfer(voter2.address, amount)
  await token.transfer(voter3.address, amount)
  await token.transfer(voter4.address, amount)
  await token.transfer(voter5.address, amount)

  // Deploy timelock
  const minDelay = 1 //How long do we have to wait until we can execute after a passed proposal

  // In addition to passing minDelay, we also need to pass 2 arrays.
  // The 1st array contains addresses of those who are allowed to make a proposal
  // The 2nd array contains addresses of those who are allowed to make exeuction.
  const Timelock = await hre.ethers.getContractFactory("TimeLock");
  const timelock = await Timelock.deploy(minDelay, [proposer.address], [executor.address])
  await timelock.deployed()

  // Deploy governance
  const quorum = 5
  const votingDelay = 0
  const votingPeriod = 5
  const Governance = await hre.ethers.getContractFactory("Governance");
  const governance = await Governance.deploy(token.address, timelock.address)
  await governance.deployed()

  // Deploy treasury
  // Timelock contract will be the owner of our treasury contract.
  // In the provided example, once the proposal is successful and executed,
  // timelock contract will be responsible for calling the function.
  const funds = ethers.utils.parseEther("25")
  const Treasury = await hre.ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(executor.address, { value: funds })
  await treasury.deployed()

  await treasury.transferOwnership(timelock.address)

  // Assign roles
  // You can view more information about timelock roles from the openzeppelin documentation;
  // --> 
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
