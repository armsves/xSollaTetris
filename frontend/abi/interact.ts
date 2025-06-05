import { ethers } from "hardhat";
import { utils } from "zksync-ethers";
import fs from "fs";
import path from "path";

interface Player {
  playerAddress: string;
  score: number;
}

// Update with the address of your deployed XsollaLeaderboard contract
const LEADERBOARD_ADDRESS = process.env.LEADERBOARD_ADDRESS ?? "YOUR_LEADERBOARD_ADDRESS";

async function main() {
  const [wallet] = await ethers.getSigners();

  console.log(`Interacting with XsollaLeaderboard at address: ${LEADERBOARD_ADDRESS}`);

  // Load the contract artifact
  const contractArtifact = require("../../artifacts-zk/contracts/leaderboard/Leaderboard.sol/XsollaLeaderboard.json");

  // Create contract instance
  const leaderboardContract = new ethers.Contract(
    LEADERBOARD_ADDRESS,
    contractArtifact.abi,
    wallet
  );

  // Submit a score
  const score = Math.floor(Math.random() * 10000); // Random score between 0-9999
  console.log(`Submitting score of ${score} from wallet: ${wallet.address}`);

  const submitTx = await leaderboardContract.submitScore(score);
  console.log(`Transaction hash: ${submitTx.hash}`);
  await submitTx.wait();
  console.log("Score submitted successfully!");

  // Read player's score
  const playerScore = await leaderboardContract.getPlayerScore(wallet.address);
  console.log(`Player score for ${wallet.address}: ${playerScore}`);

  // Get the top 10 players
const topPlayers = await leaderboardContract.getTopPlayers(10);
console.log("\nTop players:");
topPlayers.forEach((player: Player, index: number) => {
  console.log(`${index + 1}. Address: ${player.playerAddress}, Score: ${player.score}`);
});

  // Get total player count
  const playerCount = await leaderboardContract.getPlayerCount();
  console.log(`\nTotal players on leaderboard: ${playerCount}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });