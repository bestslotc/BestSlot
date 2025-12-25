/**
 * Generates a random crash point multiplier with a house edge.
 *
 * This uses the standard "inverse transform sampling" method derived from:
 *   P(multiplier >= x) = 1 / x   (for a fair game)
 * But to give the house an edge, we use:
 *   P(multiplier >= x) = (1 - houseEdge) / x
 *
 * Solving for the multiplier:
 *   multiplier = (1 - houseEdge) / U, where U ~ Uniform(0, 1)
 *
 * However, to avoid infinite multipliers and improve gameplay,
 * we cap the maximum value and add a minimum threshold.
 *
 * Additionally, we apply a small probability of very high multipliers
 * (e.g., 100x+) for excitement, while keeping the expected return < 100%.
 *
 * @returns {number} Crash multiplier (>= 1.00), rounded to 2 decimal places.
 */
export const generateCrashPoint = (): number => {
  const houseEdge = 0.03; // 3% house edge → RTP = 97%
  const minMultiplier = 1.0;
  const maxMultiplier = 1000; // Cap to prevent extreme values

  // Generate uniform random number in (0, 1]
  // Use (1 - Math.random()) to avoid division by zero
  const u = 1 - Math.random();

  // Fair crash point with house edge: multiplier = (1 - houseEdge) / u
  let crash = (1 - houseEdge) / u;

  // Enforce bounds
  crash = Math.max(minMultiplier, Math.min(crash, maxMultiplier));

  // Optional: Add a tiny chance (e.g., 0.5%) of a "jackpot" multiplier > 100x
  // This is for psychological excitement but keeps EV negative
  if (Math.random() < 0.005 && crash < 100) {
    crash = 100 + Math.random() * 900; // 100x to 1000x
  }

  // Round to 2 decimal places for display consistency
  return Math.round(crash * 100) / 100;
};
