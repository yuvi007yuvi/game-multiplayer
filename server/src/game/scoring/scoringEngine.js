/**
 * Calculates a single player's score for a round given bid and tricks won.
 * @param {number} bid 
 * @param {number} tricksWon 
 * @returns {number} Score rounded to 1 decimal place
 */
export function calculatePlayerRoundScore(bid, tricksWon) {
  if (tricksWon >= bid) {
    // Bid met or exceeded: bid + 0.1 * extra tricks
    const score = bid + (tricksWon - bid) * 0.1;
    return Math.round(score * 10) / 10;
  }
  // Failed to meet bid: negative bid
  return -Math.abs(bid);
}

/**
 * Calculates round scores for all 4 players.
 * @param {Array<{playerId: string, bid: number, tricksWon: number}>} playerRoundData 
 * @returns {Record<string, {bid: number, tricksWon: number, roundScore: number}>}
 */
export function calculateRoundScores(playerRoundData) {
  const roundScores = {};

  for (const player of playerRoundData) {
    const roundScore = calculatePlayerRoundScore(player.bid, player.tricksWon);
    roundScores[player.playerId] = {
      bid: player.bid,
      tricksWon: player.tricksWon,
      roundScore
    };
  }

  return roundScores;
}

/**
 * Aggregates match totals across rounds and generates rankings.
 * @param {Array<string>} playerIds 
 * @param {Array<Record<string, {roundScore: number}>>} roundHistory 
 * @returns {Array<{playerId: string, totalScore: number, rank: number}>}
 */
export function calculateMatchRankings(playerIds, roundHistory) {
  const totals = {};
  for (const id of playerIds) {
    totals[id] = 0;
  }

  for (const round of roundHistory) {
    for (const [playerId, result] of Object.entries(round)) {
      if (totals[playerId] !== undefined) {
        totals[playerId] = Math.round((totals[playerId] + result.roundScore) * 10) / 10;
      }
    }
  }

  const sorted = playerIds
    .map(playerId => ({
      playerId,
      totalScore: totals[playerId]
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  // Assign ranks (1-indexed, handling ties)
  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].totalScore < sorted[i - 1].totalScore) {
      currentRank = i + 1;
    }
    sorted[i].rank = currentRank;
  }

  return sorted;
}
