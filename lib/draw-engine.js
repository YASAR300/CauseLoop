import crypto from 'crypto';

/**
 * Generates a cryptographically secure random integer in [min, max]
 * uses rejection sampling to eliminate modulo bias.
 */
export function getCryptoRandomInt(min, max) {
  const range = max - min + 1;
  const bytes = crypto.randomBytes(1);
  const val = bytes[0];
  const maxUsable = 256 - (256 % range);
  if (val >= maxUsable) {
    return getCryptoRandomInt(min, max);
  }
  return min + (val % range);
}

/**
 * Generates a cryptographically secure random float in [0, 1)
 * with 48 bits of entropy (double precision equivalent resolution).
 */
export function getCryptoRandomFraction() {
  const bytes = crypto.randomBytes(6);
  let val = 0;
  for (let i = 0; i < 6; i++) {
    val = (val * 256) + bytes[i];
  }
  return val / 281474976710656; // 2^48
}

/**
 * Generates sorted unique random numbers in [min, max] using crypto RNG
 */
export function generateRandomNumbers(count = 5, min = 1, max = 45) {
  const selected = new Set();
  while (selected.size < count) {
    selected.add(getCryptoRandomInt(min, max));
  }
  return Array.from(selected).sort((a, b) => a - b);
}

/**
 * Generates sorted unique numbers using frequency-weighted algorithmic strategy.
 * Formula: Weight(i) = Frequency(i) + 1 (Laplace Smoothing alpha = 1)
 */
export function generateAlgorithmicNumbers(count = 5, subscriberScores = [], min = 1, max = 45) {
  // 1. Calculate frequencies of each score in active subscriber list
  const frequencies = {};
  for (let i = min; i <= max; i++) {
    frequencies[i] = 0;
  }
  for (const score of subscriberScores) {
    if (score >= min && score <= max) {
      frequencies[score]++;
    }
  }

  // 2. Compute weights using Laplace smoothing
  const candidates = [];
  for (let i = min; i <= max; i++) {
    candidates.push({
      number: i,
      weight: frequencies[i] + 1 // Directly proportional + smoothing
    });
  }

  const selected = [];
  
  // 3. Sample without replacement
  for (let step = 0; step < count; step++) {
    const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight === 0) {
      // Fallback: Uniform random selection if weights become 0
      const remainingNumbers = candidates.map(c => c.number);
      const randIdx = getCryptoRandomInt(0, remainingNumbers.length - 1);
      selected.push(remainingNumbers[randIdx]);
      candidates.splice(randIdx, 1);
      continue;
    }

    const targetValue = getCryptoRandomFraction() * totalWeight;
    let cumulativeWeight = 0;
    let selectedIndex = -1;

    for (let i = 0; i < candidates.length; i++) {
      cumulativeWeight += candidates[i].weight;
      if (targetValue < cumulativeWeight) {
        selectedIndex = i;
        break;
      }
    }

    if (selectedIndex === -1) {
      selectedIndex = candidates.length - 1;
    }

    selected.push(candidates[selectedIndex].number);
    candidates.splice(selectedIndex, 1);
  }

  return selected.sort((a, b) => a - b);
}

/**
 * Interface function for winning number generation
 */
export function generateWinningNumbers(strategy, subscriberScores = [], count = 5, min = 1, max = 45) {
  if (strategy === 'algorithmic') {
    return generateAlgorithmicNumbers(count, subscriberScores, min, max);
  }
  return generateRandomNumbers(count, min, max);
}

/**
 * Calculates the monthly prize pool splits based on active subscriber revenue
 */
export function calculatePrizePool(activeSubscriberRevenue, prizePoolPercentage = 0.40) {
  const totalPrizePool = Math.round(activeSubscriberRevenue * prizePoolPercentage * 100) / 100;
  
  return {
    totalPrizePool,
    fiveMatchPool: Math.round(totalPrizePool * 0.40 * 100) / 100,
    fourMatchPool: Math.round(totalPrizePool * 0.35 * 100) / 100,
    threeMatchPool: Math.round(totalPrizePool * 0.25 * 100) / 100
  };
}

/**
 * Determines match counts, payouts, and rollover amounts for all active subscribers
 */
export function determineWinnersAndPayouts(winningNumbers, subscribers, totalPrizePool, rolloverAmount = 0) {
  const { fiveMatchPool, fourMatchPool, threeMatchPool } = calculatePrizePool(totalPrizePool / 0.40); // derive original pools

  const entries = [];
  const fiveMatchWinners = [];
  const fourMatchWinners = [];
  const threeMatchWinners = [];

  // Evaluate matches for all eligible subscribers (even if 0 matches)
  for (const sub of subscribers) {
    const played = sub.numbers_played || [];
    const matchCount = played.filter(n => winningNumbers.includes(n)).length;

    const entry = {
      userId: sub.id,
      full_name: sub.full_name || 'Unnamed User',
      numbers_played: played,
      match_count: matchCount,
      prize_amount: 0.00
    };

    entries.push(entry);

    if (matchCount === 5) {
      fiveMatchWinners.push(entry);
    } else if (matchCount === 4) {
      fourMatchWinners.push(entry);
    } else if (matchCount === 3) {
      threeMatchWinners.push(entry);
    }
  }

  // Calculate payouts for 5-match tier (Jackpot, supports rollover)
  const totalFiveMatchPoolAvailable = Math.round((fiveMatchPool + rolloverAmount) * 100) / 100;
  let newRolloverAmount = 0.00;

  if (fiveMatchWinners.length > 0) {
    const prize = Math.round((totalFiveMatchPoolAvailable / fiveMatchWinners.length) * 100) / 100;
    for (const winner of fiveMatchWinners) {
      winner.prize_amount = prize;
    }
    newRolloverAmount = 0.00;
  } else {
    // No jackpot winners, rolls over to next month
    newRolloverAmount = totalFiveMatchPoolAvailable;
  }

  // Calculate payouts for 4-match tier (Does not roll over)
  if (fourMatchWinners.length > 0) {
    const prize = Math.round((fourMatchPool / fourMatchWinners.length) * 100) / 100;
    for (const winner of fourMatchWinners) {
      winner.prize_amount = prize;
    }
  }

  // Calculate payouts for 3-match tier (Does not roll over)
  if (threeMatchWinners.length > 0) {
    const prize = Math.round((threeMatchPool / threeMatchWinners.length) * 100) / 100;
    for (const winner of threeMatchWinners) {
      winner.prize_amount = prize;
    }
  }

  // Filter out the actual winners (match_count >= 3)
  const winners = entries.filter(e => e.match_count >= 3);

  return {
    entries,
    winners,
    fiveMatchPool,
    fourMatchPool,
    threeMatchPool,
    newRolloverAmount
  };
}
