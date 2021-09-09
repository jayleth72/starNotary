const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;
var user1;
var user2;
var instance;
var starId = 0;

contract("StarNotary", (accs) => {
  accounts = accs;
  owner = accounts[0];
});

beforeEach(async () => {
  instance = await StarNotary.deployed();
  user1 = accounts[1];
  user2 = accounts[2];
  starId++;
});

it("can Create a Star", async () => {
  let tokenId = 1;

  await instance.createStar("Awesome Star!", tokenId, { from: accounts[0] });
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), "Awesome Star!");
});

it("lets user1 put up their star for sale", async () => {
  let starPrice = web3.utils.toWei(".01", "ether");

  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it("lets user1 get the funds after the sale", async () => {
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");

  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction);
  assert.equal(value1, value2);
});

it("lets user2 buy a star, if it is put up for sale", async () => {
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");

  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it("lets user2 buy a star and decreases its balance in ether", async () => {
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");

  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
  let value =
    Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
  assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it("can add the star name and star symbol properly", async () => {
  // 1. create a Star with different tokenId
  //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided

  let name = await instance.name.call();
  let symbol = await instance.symbol.call();

  assert.equal(name, "StarToken");
  assert.equal(symbol, "STR");
});

it("lets 2 users exchange stars", async () => {
  // 1. create 2 Stars with different tokenId
  // 2. Call the exchangeStars functions implemented in the Smart Contract
  // 3. Verify that the owners changed

  let starId2 = 1 + starId;
  await instance.createStar("user 1", starId, { from: user1 });
  await instance.createStar("user 2", starId2, { from: user2 });
  await instance.exchangeStars(starId, starId2, { from: user2 });
  assert.equal(await instance.ownerOf.call(starId), user2);
  assert.equal(await instance.ownerOf.call(starId2), user1);
  starId++;
});

it("lets a user transfer a star", async () => {
  // 1. create a Star with different tokenId
  // 2. use the transferStar function implemented in the Smart Contract
  // 3. Verify the star owner changed.

  await instance.createStar("alpha centuri", starId, { from: user1 });
  await instance.transferStar(user2, starId, { from: user1 });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it("lookUptokenIdToStarInfo test", async () => {
  // 1. create a Star with different tokenId
  // 2. Call your method lookUptokenIdToStarInfo
  // 3. Verify if you Star name is the same
  await instance.createStar("Canopus", starId, { from: user1 });
  let starName = await instance.lookUptokenIdToStarInfo(starId);
  assert.equal(starName, "Canopus");
});
