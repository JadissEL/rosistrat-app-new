// European Roulette utilities and simulation logic

export interface RouletteNumber {
  number: number;
  color: "red" | "black" | "green";
  isEven: boolean;
  dozen: 1 | 2 | 3 | null;
}

export interface BettingStrategy {
  name: string;
  currentBet: number;
  initialBet: number;
  totalWagered: number;
  totalWon: number;
  netResult: number;
}

export interface SpinResult {
  spin: number;
  drawnNumber: number;
  strategies: {
    zero: BettingStrategy;
    firstDozen: BettingStrategy;
    secondDozen: BettingStrategy;
    black: BettingStrategy;
    even: BettingStrategy;
  };
  spinNetResult: number;
  cumulativeEarnings: number;
}

// European roulette wheel configuration
const ROULETTE_NUMBERS: RouletteNumber[] = [
  // Green
  { number: 0, color: "green", isEven: false, dozen: null },

  // Red numbers
  { number: 1, color: "red", isEven: false, dozen: 1 },
  { number: 3, color: "red", isEven: false, dozen: 1 },
  { number: 5, color: "red", isEven: false, dozen: 1 },
  { number: 7, color: "red", isEven: false, dozen: 1 },
  { number: 9, color: "red", isEven: false, dozen: 1 },
  { number: 12, color: "red", isEven: true, dozen: 1 },
  { number: 14, color: "red", isEven: true, dozen: 2 },
  { number: 16, color: "red", isEven: true, dozen: 2 },
  { number: 18, color: "red", isEven: true, dozen: 2 },
  { number: 19, color: "red", isEven: false, dozen: 2 },
  { number: 21, color: "red", isEven: false, dozen: 2 },
  { number: 23, color: "red", isEven: false, dozen: 2 },
  { number: 25, color: "red", isEven: false, dozen: 3 },
  { number: 27, color: "red", isEven: false, dozen: 3 },
  { number: 30, color: "red", isEven: true, dozen: 3 },
  { number: 32, color: "red", isEven: true, dozen: 3 },
  { number: 34, color: "red", isEven: true, dozen: 3 },
  { number: 36, color: "red", isEven: true, dozen: 3 },

  // Black numbers
  { number: 2, color: "black", isEven: true, dozen: 1 },
  { number: 4, color: "black", isEven: true, dozen: 1 },
  { number: 6, color: "black", isEven: true, dozen: 1 },
  { number: 8, color: "black", isEven: true, dozen: 1 },
  { number: 10, color: "black", isEven: true, dozen: 1 },
  { number: 11, color: "black", isEven: false, dozen: 1 },
  { number: 13, color: "black", isEven: false, dozen: 2 },
  { number: 15, color: "black", isEven: false, dozen: 2 },
  { number: 17, color: "black", isEven: false, dozen: 2 },
  { number: 20, color: "black", isEven: true, dozen: 2 },
  { number: 22, color: "black", isEven: true, dozen: 2 },
  { number: 24, color: "black", isEven: true, dozen: 2 },
  { number: 26, color: "black", isEven: true, dozen: 3 },
  { number: 28, color: "black", isEven: true, dozen: 3 },
  { number: 29, color: "black", isEven: false, dozen: 3 },
  { number: 31, color: "black", isEven: false, dozen: 3 },
  { number: 33, color: "black", isEven: false, dozen: 3 },
  { number: 35, color: "black", isEven: false, dozen: 3 },
];

export function getRouletteNumber(num: number): RouletteNumber {
  const found = ROULETTE_NUMBERS.find((r) => r.number === num);
  if (!found) {
    throw new Error(`Invalid roulette number: ${num}`);
  }
  return found;
}

export function generateRandomSpin(): number {
  return Math.floor(Math.random() * 37); // 0-36
}

export function generateFixedSpins(
  count: number = 300,
  seed?: number,
): number[] {
  // Use a simple seed-based random number generator for reproducible results
  let random = seed ? seedRandom(seed) : Math.random;

  const spins: number[] = [];
  for (let i = 0; i < count; i++) {
    spins.push(Math.floor(random() * 37));
  }
  return spins;
}

function seedRandom(seed: number) {
  let x = Math.sin(seed) * 10000;
  return function () {
    x = Math.sin(x) * 10000;
    return x - Math.floor(x);
  };
}

export function initializeStrategies(): SpinResult["strategies"] {
  return {
    zero: {
      name: "Number 0",
      currentBet: 1,
      initialBet: 1,
      totalWagered: 0,
      totalWon: 0,
      netResult: 0,
    },
    firstDozen: {
      name: "1st Dozen (1-12)",
      currentBet: 12,
      initialBet: 12,
      totalWagered: 0,
      totalWon: 0,
      netResult: 0,
    },
    secondDozen: {
      name: "2nd Dozen (13-24)",
      currentBet: 12,
      initialBet: 12,
      totalWagered: 0,
      totalWon: 0,
      netResult: 0,
    },
    black: {
      name: "Black",
      currentBet: 18,
      initialBet: 18,
      totalWagered: 0,
      totalWon: 0,
      netResult: 0,
    },
    even: {
      name: "Even",
      currentBet: 18,
      initialBet: 18,
      totalWagered: 0,
      totalWon: 0,
      netResult: 0,
    },
  };
}

export function processSpinResult(
  drawnNumber: number,
  strategies: SpinResult["strategies"],
  spinNumber: number,
  previousCumulativeEarnings: number = 0,
): SpinResult {
  const rouletteNumber = getRouletteNumber(drawnNumber);
  let spinNetResult = 0;

  // Process each strategy
  Object.values(strategies).forEach((strategy) => {
    strategy.totalWagered += strategy.currentBet;
  });

  // Number 0 strategy
  if (drawnNumber === 0) {
    const winAmount = strategies.zero.currentBet * 35;
    strategies.zero.totalWon += winAmount;
    strategies.zero.netResult =
      strategies.zero.totalWon - strategies.zero.totalWagered;
    spinNetResult += winAmount - strategies.zero.currentBet;
    strategies.zero.currentBet = strategies.zero.initialBet; // Reset
  } else {
    strategies.zero.netResult =
      strategies.zero.totalWon - strategies.zero.totalWagered;
    spinNetResult -= strategies.zero.currentBet;
    strategies.zero.currentBet += 1; // Linear increase
  }

  // First Dozen (1-12) strategy
  if (rouletteNumber.dozen === 1) {
    const winAmount = strategies.firstDozen.currentBet * 2;
    strategies.firstDozen.totalWon += winAmount;
    strategies.firstDozen.netResult =
      strategies.firstDozen.totalWon - strategies.firstDozen.totalWagered;
    spinNetResult += winAmount - strategies.firstDozen.currentBet;
    strategies.firstDozen.currentBet = strategies.firstDozen.initialBet; // Reset
  } else {
    strategies.firstDozen.netResult =
      strategies.firstDozen.totalWon - strategies.firstDozen.totalWagered;
    spinNetResult -= strategies.firstDozen.currentBet;
    strategies.firstDozen.currentBet *= 2; // Double on loss
  }

  // Second Dozen (13-24) strategy
  if (rouletteNumber.dozen === 2) {
    const winAmount = strategies.secondDozen.currentBet * 2;
    strategies.secondDozen.totalWon += winAmount;
    strategies.secondDozen.netResult =
      strategies.secondDozen.totalWon - strategies.secondDozen.totalWagered;
    spinNetResult += winAmount - strategies.secondDozen.currentBet;
    strategies.secondDozen.currentBet = strategies.secondDozen.initialBet; // Reset
  } else {
    strategies.secondDozen.netResult =
      strategies.secondDozen.totalWon - strategies.secondDozen.totalWagered;
    spinNetResult -= strategies.secondDozen.currentBet;
    strategies.secondDozen.currentBet *= 2; // Double on loss
  }

  // Black strategy
  if (rouletteNumber.color === "black") {
    const winAmount = strategies.black.currentBet * 2; // 1:1 payout means double return
    strategies.black.totalWon += winAmount;
    strategies.black.netResult =
      strategies.black.totalWon - strategies.black.totalWagered;
    spinNetResult += winAmount - strategies.black.currentBet;
    strategies.black.currentBet = strategies.black.initialBet; // Reset
  } else {
    strategies.black.netResult =
      strategies.black.totalWon - strategies.black.totalWagered;
    spinNetResult -= strategies.black.currentBet;
    strategies.black.currentBet *= 2; // Double on loss
  }

  // Even strategy (excluding 0)
  if (drawnNumber !== 0 && rouletteNumber.isEven) {
    const winAmount = strategies.even.currentBet * 2; // 1:1 payout means double return
    strategies.even.totalWon += winAmount;
    strategies.even.netResult =
      strategies.even.totalWon - strategies.even.totalWagered;
    spinNetResult += winAmount - strategies.even.currentBet;
    strategies.even.currentBet = strategies.even.initialBet; // Reset
  } else {
    strategies.even.netResult =
      strategies.even.totalWon - strategies.even.totalWagered;
    spinNetResult -= strategies.even.currentBet;
    strategies.even.currentBet *= 2; // Double on loss
  }

  const cumulativeEarnings = previousCumulativeEarnings + spinNetResult;

  return {
    spin: spinNumber,
    drawnNumber,
    strategies: { ...strategies },
    spinNetResult,
    cumulativeEarnings,
  };
}

export function runSimulation(
  spins: number[],
  onProgress?: (progress: number) => void,
): SpinResult[] {
  const results: SpinResult[] = [];
  let strategies = initializeStrategies();
  let cumulativeEarnings = 0;

  spins.forEach((drawnNumber, index) => {
    const result = processSpinResult(
      drawnNumber,
      strategies,
      index + 1,
      cumulativeEarnings,
    );
    cumulativeEarnings = result.cumulativeEarnings;
    strategies = result.strategies;
    results.push(result);

    if (onProgress && (index + 1) % 10 === 0) {
      onProgress((index + 1) / spins.length);
    }
  });

  return results;
}

export function calculateFrequencyData(results: SpinResult[]) {
  const frequency: Record<number, number> = {};

  // Initialize all numbers 0-36
  for (let i = 0; i <= 36; i++) {
    frequency[i] = 0;
  }

  // Count frequencies
  results.forEach((result) => {
    frequency[result.drawnNumber]++;
  });

  return Object.entries(frequency).map(([number, count]) => ({
    number: parseInt(number),
    count,
    percentage: (count / results.length) * 100,
    color: getRouletteNumber(parseInt(number)).color,
  }));
}
