'use server'

import { Redis } from '@upstash/redis'
import { headers } from 'next/headers'
import { z } from 'zod'
import { createHash } from 'crypto'
import { Provider, Wallet, types, utils } from "zksync-ethers";
import { ethers } from "ethers";

interface Player {
  playerAddress: string;
  score: number;
}

// Schema for score validation
const ScoreSubmissionSchema = z.object({
  name: z.string().min(1).max(30).trim(),
  score: z.number().positive(),
  level: z.number().positive(),
  lines: z.number().nonnegative(),
  clientData: z.object({
    gameTime: z.number().positive(),
    moves: z.number().positive(),
    lineClears: z.array(z.number()),
    powerUpsUsed: z.array(z.string())
  })
})

type ScoreSubmission = z.infer<typeof ScoreSubmissionSchema>

interface LeaderboardEntry extends ScoreSubmission {
  id: string
  timestamp: number
  verificationHash: string
  rank?: number
}

// Redis setup
const redis = Redis.fromEnv()
const LEADERBOARD_KEY = 'xsollatetris-leaderboard'
const LEADERBOARD_LIMIT = 100
const SCORE_SECRET = process.env.SCORE_SECRET || 'default-secret-change-me'

// Rate limiting configuration
const RATE_LIMIT = {
  WINDOW_MS: 3600000, // 1 hour
  MAX_SUBMISSIONS: 5
}

// Score verification helpers
function generateScoreHash(data: {
  score: number
  level: number
  lines: number
  timestamp: number
  gameTime: number
  secret: string
}): string {
  return createHash('sha256')
    .update(
      `${data.score}-${data.level}-${data.lines}-${data.timestamp}-${data.gameTime}-${data.secret}`
    )
    .digest('hex')
}

function verifyScore(submission: ScoreSubmission): boolean {
  // Basic validation checks
  if (submission.clientData.gameTime <= 0 || submission.clientData.moves <= 0) {
    return false
  }

  // Verify score matches level and lines
  const expectedMinLines = (submission.level - 1) * 10
  if (submission.lines < expectedMinLines) {
    return false
  }

  // Verify average score per line is within reasonable limits
  const averageScorePerLine = submission.score / Math.max(submission.lines, 1)
  if (averageScorePerLine > 1000) {
    return false
  }

  // Verify game time is reasonable
  const minTimePerLine = 2 // seconds
  const expectedMinTime = submission.lines * minTimePerLine
  if (submission.clientData.gameTime < expectedMinTime) {
    return false
  }

  // Verify moves are reasonable
  const minMovesPerLine = 4
  const expectedMinMoves = submission.lines * minMovesPerLine
  if (submission.clientData.moves < expectedMinMoves) {
    return false
  }

  return true
}

// Rate limiting helper
async function checkRateLimit(ip: string): Promise<{
  allowed: boolean
  remaining: number
}> {
  const key = `rate-limit:${ip}`
  const now = Date.now()
  const windowStart = now - RATE_LIMIT.WINDOW_MS

  // Clean up old entries
  await redis.zremrangebyscore(key, 0, windowStart)

  // Get current count
  const count = await redis.zcard(key)

  if (count >= RATE_LIMIT.MAX_SUBMISSIONS) {
    return { allowed: false, remaining: 0 }
  }

  // Add new submission timestamp
  await redis.zadd(key, { score: now, member: now.toString() })
  await redis.expire(key, Math.ceil(RATE_LIMIT.WINDOW_MS / 1000))

  return {
    allowed: true,
    remaining: RATE_LIMIT.MAX_SUBMISSIONS - (count + 1)
  }
}

export async function submitScore(
  submission: ScoreSubmission
): Promise<{ success: boolean; error?: string; entry?: LeaderboardEntry }> {
  try {
    // Parse and validate submission data
    const validatedData = ScoreSubmissionSchema.parse(submission)

    // Get IP for rate limiting
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0] || 'unknown'

    /*
    // Check rate limit
    const rateLimit = await checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Rate limit exceeded. Try again later. Remaining attempts: ${rateLimit.remaining}`
      }
    }*/

    // Verify score is legitimate
    if (!verifyScore(validatedData)) {
      return { success: false, error: 'Invalid score submission' }
    }

    // Create entry with verification hash
    const timestamp = Date.now()
    const verificationHash = generateScoreHash({
      score: validatedData.score,
      level: validatedData.level,
      lines: validatedData.lines,
      timestamp,
      gameTime: validatedData.clientData.gameTime,
      secret: SCORE_SECRET
    })

    const entry: LeaderboardEntry = {
      id: crypto.randomUUID(),
      ...validatedData,
      timestamp,
      verificationHash
    }

    /*
    // Store entry in Redis
    await redis.zadd(LEADERBOARD_KEY, {
      score: entry.score,
      member: JSON.stringify(entry)
    })

    // Keep only top scores
    await redis.zremrangebyrank(LEADERBOARD_KEY, 0, -LEADERBOARD_LIMIT - 1)
    */
    const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);
    const LEADERBOARD_ADDRESS = process.env.LEADERBOARD_ADDRESS ?? "YOUR_LEADERBOARD_ADDRESS";
    const contractArtifact = require("../abi/XsollaLeaderboard.json");
    const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY || '0x', provider);

    const leaderboardContract = new ethers.Contract(
      LEADERBOARD_ADDRESS,
      contractArtifact.abi,
      wallet
    );

    console.log("Score:", Number(entry.score), typeof Number(entry.score));
    console.log("Level:", Number(entry.level), typeof Number(entry.level));
    console.log("Lines:", Number(entry.lines), typeof Number(entry.lines));
    console.log("VerificationHash:", entry.verificationHash, typeof entry.verificationHash);
    console.log("GameTime:", Number(entry.clientData.gameTime), typeof Number(entry.clientData.gameTime));
    console.log("Moves:", entry.clientData.moves, typeof entry.clientData.moves);
    console.log("LineClears:", entry.clientData.lineClears, typeof entry.clientData.lineClears, JSON.stringify(entry.clientData.lineClears));
    console.log("PowerUpsUsed:", entry.clientData.powerUpsUsed, typeof entry.clientData.powerUpsUsed, JSON.stringify(entry.clientData.powerUpsUsed));
    
    const submitTx = await leaderboardContract.submitScore(
      Number(entry.score),
      Number(entry.level),
      Number(entry.lines),
      entry.verificationHash,
      Math.floor(entry.clientData.gameTime),
      entry.clientData.moves,
      entry.clientData.lineClears,
      entry.clientData.powerUpsUsed
    );

    console.log(`Transaction hash: ${submitTx.hash}`);
    await submitTx.wait();
    console.log("Enhanced score data submitted successfully!");

    return { success: true, entry }
  } catch (error) {
    console.error('Failed to submit score:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid submission data format' }
    }
    return { success: false, error: 'Failed to submit score' }
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);
    const LEADERBOARD_ADDRESS = process.env.LEADERBOARD_ADDRESS ?? "YOUR_LEADERBOARD_ADDRESS";
    const contractArtifact = require("../abi/XsollaLeaderboard.json");

    const leaderboardContract = new ethers.Contract(
      LEADERBOARD_ADDRESS,
      contractArtifact.abi,
      provider
    );

    try {
      const topPlayers = await leaderboardContract.getLeaderboard();
      console.log("Top players from contractssss:", topPlayers);

      if (!topPlayers || topPlayers.length === 0) {
        console.log("No players found in the leaderboard contract.");
        return [];
      }

      // Map the blockchain data to the expected LeaderboardEntry format
      const leaderboardEntries: LeaderboardEntry[] = topPlayers.map((player: Player, index: number) => {
        // Convert score from BigNumber if needed
        const playerScore = typeof player.score === 'object' && player.score ?
          player.score : Number(player.score);

        console.log(`${index + 1}. Address: ${player.playerAddress}, Score: ${playerScore}`);

        // Create a valid LeaderboardEntry from the blockchain data
        return {
          id: player.playerAddress,
          name: `Player ${player.playerAddress.slice(0, 6)}...`, // Truncate address for display
          score: playerScore,
          level: Math.floor(playerScore / 1000) + 1, // Approximate level based on score
          lines: Math.floor(playerScore / 100),      // Approximate lines based on score
          timestamp: Date.now() - (1000 * 60 * index), // Recent timestamps
          verificationHash: `blockchain-verified-${player.playerAddress}`,
          rank: index + 1,
          clientData: {
            gameTime: 300, // Default values for required fields
            moves: 500,
            lineClears: [1, 2, 3],
            powerUpsUsed: []
          }
        };
      });

      return leaderboardEntries;
    } catch (contractError) {
      console.error('Contract interaction failed:', contractError);
      // Return empty array if contract call fails
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    // Return empty array instead of throwing
    return [];
  }
}
