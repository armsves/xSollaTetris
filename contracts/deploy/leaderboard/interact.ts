import { ethers } from "hardhat";
import { utils } from "zksync-ethers";
import fs from "fs";
import path from "path";

// Updated Player interface to match the enhanced contract
interface ClientData {
  gameTime: number;
  moves: number;
  lineClears: number[];
  powerUpsUsed: string[];
}

interface Player {
  playerAddress: string;
  score: number;
  level: number;
  lines: number;
  timestamp: number;
  verificationHash: string;
  rank: number;
  clientData: ClientData;
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

  // Submit a score with enhanced data
  const score = Math.floor(Math.random() * 10000); // Random score between 0-9999
  const level = Math.floor(Math.random() * 10) + 1; // Random level between 1-10
  const lines = Math.floor(Math.random() * 100); // Random lines count
  const verificationHash = `hash-${Date.now()}`; // Mock verification hash
  const gameTime = Math.floor(Math.random() * 600); // Random game time up to 10 minutes
  const moves = Math.floor(Math.random() * 1000); // Random moves count
  const lineClears = [3, 2, 1, 4]; // Example line clears
  const powerUpsUsed = ["bomb", "freeze"]; // Example power-ups

  console.log(`Submitting enhanced score data from wallet: ${wallet.address}`);
  console.log(`Score: ${score}, Level: ${level}, Lines: ${lines}`);

  // Call the enhanced submitScore function
  const submitTx = await leaderboardContract.submitScore(
    score,
    level,
    lines,
    verificationHash,
    gameTime,
    moves,
    lineClears,
    powerUpsUsed
  );

  console.log(`Transaction hash: ${submitTx.hash}`);
  await submitTx.wait();
  console.log("Enhanced score data submitted successfully!");

  // Read player's score
  const playerScore = await leaderboardContract.getPlayerScore(wallet.address);
  console.log(`Player score for ${wallet.address}: ${playerScore}`);

  // Get player's full data
  const playerData = await leaderboardContract.getPlayerData(wallet.address);
  console.log("\nPlayer full data:");
  console.log(`Address: ${playerData.playerAddress}`);
  console.log(`Score: ${playerData.score}`);
  console.log(`Level: ${playerData.level}`);
  console.log(`Lines: ${playerData.lines}`);
  console.log(`Timestamp: ${new Date(Number(playerData.timestamp) * 1000).toLocaleString()}`);
  console.log(`Verification Hash: ${playerData.verificationHash}`);
  console.log(`Rank: ${playerData.rank}`);
  console.log("Game Stats:");
  console.log(`  Game Time: ${playerData.clientData.gameTime} seconds`);
  console.log(`  Moves: ${playerData.clientData.moves}`);
  console.log(`  Line Clears: ${playerData.clientData.lineClears.join(', ')}`);
  console.log(`  Power-ups Used: ${playerData.clientData.powerUpsUsed.join(', ')}`);

  // Get the top 10 players with enhanced data
  const topPlayers = await leaderboardContract.getTopPlayers(10);
  console.log("\nTop players:");
  topPlayers.forEach((player: Player, index: number) => {
    console.log(`${index + 1}. Address: ${player.playerAddress}`);
    console.log(`   Score: ${player.score}, Level: ${player.level}, Rank: ${player.rank}`);
    console.log(`   Lines: ${player.lines}, Game Time: ${player.clientData.gameTime}s`);
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