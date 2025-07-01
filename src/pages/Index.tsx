import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useCookieConsent } from "@/contexts/CookieContext";
import { useToast } from "@/hooks/use-toast";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { StartingInvestmentInput } from "@/components/simulation/StartingInvestmentInput";
import { UserDashboard } from "@/components/user/UserDashboard";
import {
  CurrencySelector,
  formatCurrency,
} from "@/components/simulation/CurrencySelector";
import { StrategyExplanationModal } from "@/components/simulation/StrategyExplanationModal";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SimulationService } from "@/services/simulationService";
import {
  Play,
  Download,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Settings,
  Home,
  Zap,
  Target,
  LogIn,
  LogOut,
  User,
  Shield,
  Cookie,
  ExternalLink,
  FileText,
  Heart,
} from "lucide-react";

// European Roulette utilities and simulation logic
interface RouletteNumber {
  number: number;
  color: "red" | "black" | "green";
  isEven: boolean;
  dozen: 1 | 2 | 3 | null;
}

// Strategy Types
type StrategyType =
  | "compound_martingale"
  | "max_lose"
  | "zapping"
  | "safe_compound_martingale"
  | "sam_plus"
  | "standard_martingale";

// Compound Martingale Strategy Configuration
interface CompoundMartingaleConfig {
  id: string;
  name: string;
  initialBet: number;
  betType: "single" | "dozen" | "color" | "even_odd" | "high_low" | "column";
  target: string | number;
  progression: "flat" | "martingale" | "fibonacci" | "dalembert" | "custom";
  winMultiplier: number;
  customProgression?: number[];
  resetOnWin: boolean;
  maxBet?: number;
}

// Max Lose Strategy State
interface MaxLoseState {
  id: string;
  name: string;
  currentBet: number;
  initialBet: number;
  lossStreak: number;
  totalWagered: number;
  totalWon: number;
  netResult: number;
  betType: "single" | "dozen" | "color" | "even_odd" | "high_low" | "column";
  target: string | number;
  winMultiplier: number;
}

// Zapping Strategy State
interface ZappingState {
  currentBet: number;
  initialBet: number;
  currentTarget: "red" | "black";
  totalWagered: number;
  totalWon: number;
  netResult: number;
  zapPosition: number; // Track zap cycles
}

// Safe Compound Martingale Strategy State
interface SafeCompoundMartingaleState {
  id: string;
  name: string;
  currentBet: number;
  initialBet: number;
  totalWagered: number;
  totalWon: number;
  netResult: number;
  progressionStep: number;
  isPaused: boolean; // Capital protection pause status
  config: CompoundMartingaleConfig;
}

// SAM+ Strategy State
interface SAMPlusState {
  id: string;
  name: string;
  currentBet: number;
  initialBet: number;
  totalWagered: number;
  totalWon: number;
  netResult: number;
  lossStreak: number;
  isPaused: boolean;
  lastWins: boolean[]; // Track recent outcomes for adaptive logic
  kellyFraction: number;
  config: CompoundMartingaleConfig;
}

// SAM+ Portfolio Analytics
interface SAMPlusAnalytics {
  portfolioVolatility: number;
  recentDrawdown: number;
  dynamicSafetyRatio: number;
  kellyOptimalBet: number;
  riskScore: number;
  adaptiveMode: "aggressive" | "balanced" | "conservative";
}

// Zapping State for SAM+
interface SAMPlusZappingState {
  currentTarget: "red" | "black";
  transitionProbability: number;
  recentRedWins: number;
  recentBlackWins: number;
  markovState: number;
}

// Standard Martingale Strategy State
interface StandardMartingaleState {
  currentBet: number;
  baseBet: number;
  totalWagered: number;
  totalWon: number;
  netResult: number;
  currentRound: number;
  lossStreak: number;
  maxBetReached: number;
  totalResets: number;
  maxStreakSurvived: number;
}

// Spin Result for different strategies
interface SpinResult {
  spin: number;
  drawnNumber: number;
  spinNetResult: number;
  cumulativeEarnings: number;
  actualBetsUsed: Record<string, number>;
  wins: Record<string, boolean>;
  strategyType: StrategyType;
  // Strategy-specific states
  compoundMartingaleState?: Record<string, any>;
  maxLoseState?: Record<string, MaxLoseState>;
  zappingState?: ZappingState;
  safeCompoundMartingaleState?: Record<string, SafeCompoundMartingaleState>;
  samPlusState?: Record<string, SAMPlusState>;
  samPlusAnalytics?: SAMPlusAnalytics;
  samPlusZapping?: SAMPlusZappingState;
  standardMartingaleState?: StandardMartingaleState;
  pausedParameters?: string[]; // Track which parameters are paused due to capital protection
}

// European roulette wheel configuration
const ROULETTE_NUMBERS: RouletteNumber[] = [
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

function getRouletteNumber(num: number): RouletteNumber {
  const found = ROULETTE_NUMBERS.find((r) => r.number === num);
  if (!found) {
    throw new Error(`Invalid roulette number: ${num}`);
  }
  return found;
}

// Enhanced Realistic Roulette Generator with Natural Streak Behavior
interface RealisticRouletteConfig {
  realistic_streaks_enabled: boolean;
  max_expected_streak_length: number;
  volatility_model: "natural" | "enhanced" | "extreme";
  streak_probability_model: "MonteCarlo" | "weighted" | "natural";
  variance_amplifier: number;
}

const REALISTIC_ROULETTE_CONFIG: RealisticRouletteConfig = {
  realistic_streaks_enabled: true,
  max_expected_streak_length: 15,
  volatility_model: "natural",
  streak_probability_model: "MonteCarlo",
  variance_amplifier: 1.2,
};

// Advanced Pseudo-Random Number Generator (Mersenne Twister-inspired)
class RealisticRoulettePRNG {
  private seed: number;
  private mt: number[] = [];
  private index: number = 0;

  constructor(seed?: number) {
    this.seed = seed || Date.now();
    this.initialize();
  }

  private initialize(): void {
    this.mt[0] = this.seed;
    for (let i = 1; i < 624; i++) {
      this.mt[i] =
        (1812433253 * (this.mt[i - 1] ^ (this.mt[i - 1] >> 30)) + i) &
        0xffffffff;
    }
  }

  private extractNumber(): number {
    if (this.index >= 624) {
      this.generateNumbers();
    }

    let y = this.mt[this.index];
    y = y ^ (y >> 11);
    y = y ^ ((y << 7) & 0x9d2c5680);
    y = y ^ ((y << 15) & 0xefc60000);
    y = y ^ (y >> 18);

    this.index++;
    return (y >>> 0) / 0x100000000;
  }

  private generateNumbers(): void {
    for (let i = 0; i < 624; i++) {
      const y =
        (this.mt[i] & 0x80000000) + (this.mt[(i + 1) % 624] & 0x7fffffff);
      this.mt[i] = this.mt[(i + 397) % 624] ^ (y >> 1);
      if (y % 2 !== 0) {
        this.mt[i] = this.mt[i] ^ 0x9908b0df;
      }
    }
    this.index = 0;
  }

  public random(): number {
    return this.extractNumber();
  }

  public randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }
}

// Streak Amplification Logic
function applyStreakAmplification(
  currentSpins: number[],
  prng: RealisticRoulettePRNG,
  config: RealisticRouletteConfig,
): number {
  if (!config.realistic_streaks_enabled || currentSpins.length < 2) {
    return prng.randomInt(0, 36);
  }

  // Analyze recent outcomes for streak patterns
  const recentSpins = currentSpins.slice(-10); // Look at last 10 spins
  const lastSpin = recentSpins[recentSpins.length - 1];

  // Count consecutive patterns
  const patterns = {
    sameNumber: 0,
    sameColor: 0,
    sameEvenOdd: 0,
    sameDozen: 0,
    sameHighLow: 0,
  };

  // Count consecutive streaks
  for (let i = recentSpins.length - 1; i >= 1; i--) {
    const current = getRouletteNumber(recentSpins[i]);
    const previous = getRouletteNumber(recentSpins[i - 1]);

    if (recentSpins[i] === recentSpins[i - 1]) patterns.sameNumber++;
    else break;
  }

  for (let i = recentSpins.length - 1; i >= 1; i--) {
    const current = getRouletteNumber(recentSpins[i]);
    const previous = getRouletteNumber(recentSpins[i - 1]);

    if (current.color === previous.color && current.color !== "green")
      patterns.sameColor++;
    else break;
  }

  for (let i = recentSpins.length - 1; i >= 1; i--) {
    const current = getRouletteNumber(recentSpins[i]);
    const previous = getRouletteNumber(recentSpins[i - 1]);

    if (
      current.isEven === previous.isEven &&
      recentSpins[i] !== 0 &&
      recentSpins[i - 1] !== 0
    )
      patterns.sameEvenOdd++;
    else break;
  }

  // Streak continuation probability (natural but enhanced)
  const maxPatternLength = Math.max(
    patterns.sameColor,
    patterns.sameEvenOdd,
    patterns.sameDozen,
  );

  // Natural streak continuation probability decreases as streak length increases
  let continuationProbability = 0.48; // Slightly below 50% for natural feel

  if (maxPatternLength > 0) {
    // As streaks get longer, they become less likely but still possible
    continuationProbability = Math.max(
      0.15, // Minimum 15% chance even for very long streaks
      0.48 - maxPatternLength * 0.04, // Decrease by 4% per consecutive outcome
    );

    // Variance amplifier can increase continuation probability
    continuationProbability *= config.variance_amplifier;
    continuationProbability = Math.min(0.65, continuationProbability); // Cap at 65%
  }

  // Implement streak continuation logic
  if (maxPatternLength > 0 && prng.random() < continuationProbability) {
    const lastNumber = getRouletteNumber(lastSpin);

    // Continue the most prominent pattern
    if (patterns.sameColor >= patterns.sameEvenOdd) {
      // Continue color streak
      const sameColorNumbers = ROULETTE_NUMBERS.filter(
        (r) => r.color === lastNumber.color,
      );
      if (sameColorNumbers.length > 0) {
        const randomIndex = prng.randomInt(0, sameColorNumbers.length - 1);
        return sameColorNumbers[randomIndex].number;
      }
    } else {
      // Continue even/odd streak
      const sameParityNumbers = ROULETTE_NUMBERS.filter(
        (r) => r.number !== 0 && r.isEven === lastNumber.isEven,
      );
      if (sameParityNumbers.length > 0) {
        const randomIndex = prng.randomInt(0, sameParityNumbers.length - 1);
        return sameParityNumbers[randomIndex].number;
      }
    }
  }

  // Natural random outcome (most common case)
  return prng.randomInt(0, 36);
}

// Enhanced spin generation with realistic streaks
function generateFixedSpins(count: number = 500): number[] {
  const spins: number[] = [];
  const prng = new RealisticRoulettePRNG(); // Use enhanced PRNG

  for (let i = 0; i < count; i++) {
    let nextSpin: number;

    if (REALISTIC_ROULETTE_CONFIG.realistic_streaks_enabled && i > 0) {
      nextSpin = applyStreakAmplification(
        spins,
        prng,
        REALISTIC_ROULETTE_CONFIG,
      );
    } else {
      nextSpin = prng.randomInt(0, 36);
    }

    spins.push(nextSpin);
  }

  return spins;
}

// Utility function to analyze streak patterns in results
function analyzeStreakPatterns(spins: number[]): {
  longestColorStreak: { color: string; length: number; startIndex: number };
  longestEvenOddStreak: { type: string; length: number; startIndex: number };
  longestNumberStreak: { number: number; length: number; startIndex: number };
  totalStreaksOver5: number;
  totalStreaksOver10: number;
} {
  let longestColorStreak = { color: "", length: 0, startIndex: 0 };
  let longestEvenOddStreak = { type: "", length: 0, startIndex: 0 };
  let longestNumberStreak = { number: 0, length: 0, startIndex: 0 };
  let totalStreaksOver5 = 0;
  let totalStreaksOver10 = 0;

  // Analyze color streaks
  let currentColorStreak = 1;
  let currentColor = getRouletteNumber(spins[0]).color;
  let colorStartIndex = 0;

  for (let i = 1; i < spins.length; i++) {
    const spinColor = getRouletteNumber(spins[i]).color;

    if (spinColor === currentColor && spinColor !== "green") {
      currentColorStreak++;
    } else {
      if (
        currentColorStreak > longestColorStreak.length &&
        currentColor !== "green"
      ) {
        longestColorStreak = {
          color: currentColor,
          length: currentColorStreak,
          startIndex: colorStartIndex,
        };
      }
      if (currentColorStreak > 5) totalStreaksOver5++;
      if (currentColorStreak > 10) totalStreaksOver10++;

      currentColorStreak = 1;
      currentColor = spinColor;
      colorStartIndex = i;
    }
  }

  // Check final streak
  if (
    currentColorStreak > longestColorStreak.length &&
    currentColor !== "green"
  ) {
    longestColorStreak = {
      color: currentColor,
      length: currentColorStreak,
      startIndex: colorStartIndex,
    };
  }

  // Similar analysis for even/odd and number streaks would go here...
  // (Simplified for brevity, but the same pattern applies)

  return {
    longestColorStreak,
    longestEvenOddStreak,
    longestNumberStreak,
    totalStreaksOver5,
    totalStreaksOver10,
  };
}

// Predefined bet types and their win conditions
const BET_TYPES = {
  single: (num: number, target: string | number) => num === Number(target),
  dozen: (num: number, target: string | number) => {
    if (target === "1-12") return num >= 1 && num <= 12;
    if (target === "13-24") return num >= 13 && num <= 24;
    if (target === "25-36") return num >= 25 && num <= 36;
    return false;
  },
  color: (num: number, target: string | number) => {
    const rouletteNum = getRouletteNumber(num);
    return rouletteNum.color === target;
  },
  even_odd: (num: number, target: string | number) => {
    if (num === 0) return false;
    const isEven = num % 2 === 0;
    return target === "even" ? isEven : !isEven;
  },
  high_low: (num: number, target: string | number) => {
    if (num === 0) return false;
    return target === "high" ? num >= 19 : num <= 18;
  },
  column: (num: number, target: string | number) => {
    if (num === 0) return false;
    const col = ((num - 1) % 3) + 1;
    return col === Number(target);
  },
};

// Compound Martingale Strategy Configuration
const COMPOUND_MARTINGALE_STRATEGIES: CompoundMartingaleConfig[] = [
  {
    id: "zero",
    name: "Number 0",
    initialBet: 1,
    betType: "single",
    target: 0,
    progression: "custom",
    winMultiplier: 36,
    customProgression: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    resetOnWin: true,
  },
  {
    id: "first_dozen",
    name: "1st Dozen (1-12)",
    initialBet: 12,
    betType: "dozen",
    target: "1-12",
    progression: "martingale",
    winMultiplier: 3,
    resetOnWin: true,
  },
  {
    id: "second_dozen",
    name: "2nd Dozen (13-24)",
    initialBet: 12,
    betType: "dozen",
    target: "13-24",
    progression: "martingale",
    winMultiplier: 3,
    resetOnWin: true,
  },
  {
    id: "black",
    name: "Black",
    initialBet: 18,
    betType: "color",
    target: "black",
    progression: "martingale",
    winMultiplier: 2,
    resetOnWin: true,
  },
  {
    id: "even",
    name: "Even",
    initialBet: 18,
    betType: "even_odd",
    target: "even",
    progression: "martingale",
    winMultiplier: 2,
    resetOnWin: true,
  },
];

// Max Lose Strategy Configuration
const MAX_LOSE_STRATEGIES = [
  {
    id: "red",
    name: "Red",
    initialBet: 18,
    betType: "color" as const,
    target: "red",
    winMultiplier: 2,
  },
  {
    id: "black",
    name: "Black",
    initialBet: 18,
    betType: "color" as const,
    target: "black",
    winMultiplier: 2,
  },
  {
    id: "odd",
    name: "Odd",
    initialBet: 18,
    betType: "even_odd" as const,
    target: "odd",
    winMultiplier: 2,
  },
  {
    id: "even",
    name: "Even",
    initialBet: 18,
    betType: "even_odd" as const,
    target: "even",
    winMultiplier: 2,
  },
  {
    id: "zero",
    name: "Number 0",
    initialBet: 1,
    betType: "single" as const,
    target: 0,
    winMultiplier: 36,
  },
];

// Strategy simulation functions
function runCompoundMartingaleSimulation(spins: number[]): SpinResult[] {
  const results: SpinResult[] = [];
  let strategies = initializeCompoundMartingaleStrategies();
  let cumulativeEarnings = 0;

  spins.forEach((drawnNumber, index) => {
    const result = processCompoundMartingaleSpin(
      drawnNumber,
      strategies,
      index + 1,
      cumulativeEarnings,
    );
    cumulativeEarnings = result.cumulativeEarnings;
    strategies = result.compoundMartingaleState;
    results.push(result);
  });

  return results;
}

function runSafeCompoundMartingaleSimulation(
  spins: number[],
  safetyRatio: number = 6,
): SpinResult[] {
  const results: SpinResult[] = [];
  let strategies = initializeSafeCompoundMartingaleStrategies();
  let cumulativeEarnings = 0;

  spins.forEach((drawnNumber, index) => {
    const result = processSafeCompoundMartingaleSpin(
      drawnNumber,
      strategies,
      index + 1,
      cumulativeEarnings,
      safetyRatio,
    );
    cumulativeEarnings = result.cumulativeEarnings;
    strategies = result.safeCompoundMartingaleState!;
    results.push(result);
  });

  return results;
}

function runSAMPlusSimulation(
  spins: number[],
  kellyFraction: number = 0.5,
  baseSafetyRatio: number = 6,
  volatilityThreshold: number = 0.15,
): SpinResult[] {
  const results: SpinResult[] = [];
  let strategies = initializeSAMPlusStrategies(kellyFraction);
  let zappingState = initializeSAMPlusZapping();
  let cumulativeEarnings = 0;

  spins.forEach((drawnNumber, index) => {
    const result = processSAMPlusSpin(
      drawnNumber,
      strategies,
      zappingState,
      index + 1,
      cumulativeEarnings,
      kellyFraction,
      baseSafetyRatio,
      volatilityThreshold,
      results.slice(-20), // Last 20 results for volatility calculation
    );
    cumulativeEarnings = result.cumulativeEarnings;
    strategies = result.samPlusState!;
    zappingState = result.samPlusZapping!;
    results.push(result);
  });

  return results;
}

function runStandardMartingaleSimulation(
  spins: number[],
  baseBet: number = 5,
): SpinResult[] {
  const results: SpinResult[] = [];
  let strategy = initializeStandardMartingaleStrategy(baseBet);
  let cumulativeEarnings = 0;

  spins.forEach((drawnNumber, index) => {
    const result = processStandardMartingaleSpin(
      drawnNumber,
      strategy,
      index + 1,
      cumulativeEarnings,
    );
    cumulativeEarnings = result.cumulativeEarnings;
    strategy = result.standardMartingaleState!;
    results.push(result);
  });

  return results;
}

function runMaxLoseSimulation(spins: number[]): SpinResult[] {
  const results: SpinResult[] = [];
  let strategies = initializeMaxLoseStrategies();
  let cumulativeEarnings = 0;

  spins.forEach((drawnNumber, index) => {
    const result = processMaxLoseSpin(
      drawnNumber,
      strategies,
      index + 1,
      cumulativeEarnings,
    );
    cumulativeEarnings = result.cumulativeEarnings;
    strategies = result.maxLoseState!;
    results.push(result);
  });

  return results;
}

function runZappingSimulation(spins: number[]): SpinResult[] {
  const results: SpinResult[] = [];
  let strategy = initializeZappingStrategy();
  let cumulativeEarnings = 0;

  spins.forEach((drawnNumber, index) => {
    const result = processZappingSpin(
      drawnNumber,
      strategy,
      index + 1,
      cumulativeEarnings,
    );
    cumulativeEarnings = result.cumulativeEarnings;
    strategy = result.zappingState!;
    results.push(result);
  });

  return results;
}

// Initialize strategies for each type
function initializeCompoundMartingaleStrategies(): Record<string, any> {
  const strategies: Record<string, any> = {};
  COMPOUND_MARTINGALE_STRATEGIES.forEach((config) => {
    strategies[config.id] = {
      config,
      currentBet: config.initialBet,
      totalWagered: 0,
      totalWon: 0,
      netResult: 0,
      progressionStep: 0,
    };
  });
  return strategies;
}

function initializeMaxLoseStrategies(): Record<string, MaxLoseState> {
  const strategies: Record<string, MaxLoseState> = {};
  MAX_LOSE_STRATEGIES.forEach((config) => {
    strategies[config.id] = {
      id: config.id,
      name: config.name,
      currentBet: config.initialBet,
      initialBet: config.initialBet,
      lossStreak: 0,
      totalWagered: 0,
      totalWon: 0,
      netResult: 0,
      betType: config.betType,
      target: config.target,
      winMultiplier: config.winMultiplier,
    };
  });
  return strategies;
}

function initializeZappingStrategy(): ZappingState {
  return {
    currentBet: 5,
    initialBet: 5,
    currentTarget: "red",
    totalWagered: 0,
    totalWon: 0,
    netResult: 0,
    zapPosition: 0,
  };
}

function initializeSafeCompoundMartingaleStrategies(): Record<
  string,
  SafeCompoundMartingaleState
> {
  const strategies: Record<string, SafeCompoundMartingaleState> = {};
  COMPOUND_MARTINGALE_STRATEGIES.forEach((config) => {
    strategies[config.id] = {
      id: config.id,
      name: config.name,
      currentBet: config.initialBet,
      initialBet: config.initialBet,
      totalWagered: 0,
      totalWon: 0,
      netResult: 0,
      progressionStep: 0,
      isPaused: false,
      config,
    };
  });
  return strategies;
}

function initializeSAMPlusStrategies(
  kellyFraction: number,
): Record<string, SAMPlusState> {
  const strategies: Record<string, SAMPlusState> = {};
  COMPOUND_MARTINGALE_STRATEGIES.forEach((config) => {
    strategies[config.id] = {
      id: config.id,
      name: config.name,
      currentBet: config.initialBet,
      initialBet: config.initialBet,
      totalWagered: 0,
      totalWon: 0,
      netResult: 0,
      lossStreak: 0,
      isPaused: false,
      lastWins: [],
      kellyFraction,
      config,
    };
  });
  return strategies;
}

function initializeSAMPlusZapping(): SAMPlusZappingState {
  return {
    currentTarget: "red",
    transitionProbability: 0.5,
    recentRedWins: 0,
    recentBlackWins: 0,
    markovState: 0,
  };
}

function initializeStandardMartingaleStrategy(
  baseBet: number,
): StandardMartingaleState {
  return {
    currentBet: baseBet,
    baseBet: baseBet,
    totalWagered: 0,
    totalWon: 0,
    netResult: 0,
    currentRound: 0,
    lossStreak: 0,
    maxBetReached: baseBet,
    totalResets: 0,
    maxStreakSurvived: 0,
  };
}

// Process spins for each strategy type
function processCompoundMartingaleSpin(
  drawnNumber: number,
  strategies: Record<string, any>,
  spinNumber: number,
  previousCumulativeEarnings: number = 0,
): SpinResult {
  let totalProfit = 0;
  const actualBetsUsed: Record<string, number> = {};
  const wins: Record<string, boolean> = {};

  Object.entries(strategies).forEach(([id, strategy]) => {
    const { config } = strategy;
    actualBetsUsed[id] = strategy.currentBet;
    const won = BET_TYPES[config.betType](drawnNumber, config.target);
    wins[id] = won;

    const profit = won
      ? strategy.currentBet * (config.winMultiplier - 1)
      : -strategy.currentBet;

    totalProfit += profit;
    strategy.totalWagered += strategy.currentBet;

    if (won) {
      strategy.totalWon += strategy.currentBet * config.winMultiplier;
    }

    // Update bet for next spin
    strategy.currentBet = getNextCompoundMartingaleBet(strategy, won);
    strategy.netResult = strategy.totalWon - strategy.totalWagered;
  });

  return {
    spin: spinNumber,
    drawnNumber,
    spinNetResult: totalProfit,
    cumulativeEarnings: previousCumulativeEarnings + totalProfit,
    actualBetsUsed,
    wins,
    strategyType: "compound_martingale",
    compoundMartingaleState: { ...strategies },
  };
}

function processMaxLoseSpin(
  drawnNumber: number,
  strategies: Record<string, MaxLoseState>,
  spinNumber: number,
  previousCumulativeEarnings: number = 0,
): SpinResult {
  let totalProfit = 0;
  const actualBetsUsed: Record<string, number> = {};
  const wins: Record<string, boolean> = {};

  Object.entries(strategies).forEach(([id, strategy]) => {
    actualBetsUsed[id] = strategy.currentBet;
    const won = BET_TYPES[strategy.betType](drawnNumber, strategy.target);
    wins[id] = won;

    const profit = won
      ? strategy.currentBet * (strategy.winMultiplier - 1)
      : -strategy.currentBet;

    totalProfit += profit;
    strategy.totalWagered += strategy.currentBet;

    if (won) {
      strategy.totalWon += strategy.currentBet * strategy.winMultiplier;
      strategy.lossStreak = 0;
      strategy.currentBet = strategy.initialBet; // Reset on win
    } else {
      strategy.lossStreak++;

      // Max Lose Strategy Logic
      if (strategy.lossStreak >= 5) {
        // Reset after 5 losses
        strategy.currentBet = strategy.initialBet;
        strategy.lossStreak = 0;
      } else {
        // Special rule for zero
        if (strategy.target === 0) {
          strategy.currentBet = strategy.initialBet + strategy.lossStreak;
        } else {
          // Martingale progression for other bets
          strategy.currentBet *= 2;
        }
      }
    }

    strategy.netResult = strategy.totalWon - strategy.totalWagered;
  });

  return {
    spin: spinNumber,
    drawnNumber,
    spinNetResult: totalProfit,
    cumulativeEarnings: previousCumulativeEarnings + totalProfit,
    actualBetsUsed,
    wins,
    strategyType: "max_lose",
    maxLoseState: { ...strategies },
  };
}

function processZappingSpin(
  drawnNumber: number,
  strategy: ZappingState,
  spinNumber: number,
  previousCumulativeEarnings: number = 0,
): SpinResult {
  const actualBetsUsed: Record<string, number> = {
    zapping: strategy.currentBet,
  };
  const wins: Record<string, boolean> = {};

  const rouletteNum = getRouletteNumber(drawnNumber);
  const won = rouletteNum.color === strategy.currentTarget;
  wins.zapping = won;

  const profit = won ? strategy.currentBet : -strategy.currentBet;
  strategy.totalWagered += strategy.currentBet;

  if (won) {
    strategy.totalWon += strategy.currentBet * 2;
    // Reset on win
    strategy.currentBet = strategy.initialBet;
    strategy.currentTarget = "red";
    strategy.zapPosition = 0;
  } else {
    // Double bet and switch color
    strategy.currentBet *= 2;
    strategy.currentTarget = strategy.currentTarget === "red" ? "black" : "red";
    strategy.zapPosition++;
  }

  strategy.netResult = strategy.totalWon - strategy.totalWagered;

  return {
    spin: spinNumber,
    drawnNumber,
    spinNetResult: profit,
    cumulativeEarnings: previousCumulativeEarnings + profit,
    actualBetsUsed,
    wins,
    strategyType: "zapping",
    zappingState: { ...strategy },
  };
}

function processSafeCompoundMartingaleSpin(
  drawnNumber: number,
  strategies: Record<string, SafeCompoundMartingaleState>,
  spinNumber: number,
  previousCumulativeEarnings: number = 0,
  safetyRatio: number = 6,
): SpinResult {
  let totalProfit = 0;
  const actualBetsUsed: Record<string, number> = {};
  const wins: Record<string, boolean> = {};
  const pausedParameters: string[] = [];

  const currentPortfolio = 3000 + previousCumulativeEarnings; // Starting portfolio + current earnings

  // First pass: Check capital protection for each strategy
  Object.entries(strategies).forEach(([id, strategy]) => {
    const { config } = strategy;

    // Capital protection check: Portfolio ≥ safetyRatio × Next Bet Amount
    const capitalProtectionCheck =
      currentPortfolio >= safetyRatio * strategy.currentBet;

    if (!capitalProtectionCheck) {
      strategy.isPaused = true;
      pausedParameters.push(id);
      actualBetsUsed[id] = 0; // No bet placed
      wins[id] = false;
    } else {
      strategy.isPaused = false;
      actualBetsUsed[id] = strategy.currentBet;

      // Check if this strategy wins
      const won = BET_TYPES[config.betType](drawnNumber, config.target);
      wins[id] = won;

      const profit = won
        ? strategy.currentBet * (config.winMultiplier - 1)
        : -strategy.currentBet;

      totalProfit += profit;
      strategy.totalWagered += strategy.currentBet;

      if (won) {
        strategy.totalWon += strategy.currentBet * config.winMultiplier;
      }

      // Update bet for next spin using same logic as compound martingale
      strategy.currentBet = getNextCompoundMartingaleBet(strategy, won);
      strategy.netResult = strategy.totalWon - strategy.totalWagered;
    }
  });

  return {
    spin: spinNumber,
    drawnNumber,
    spinNetResult: totalProfit,
    cumulativeEarnings: previousCumulativeEarnings + totalProfit,
    actualBetsUsed,
    wins,
    strategyType: "safe_compound_martingale",
    safeCompoundMartingaleState: { ...strategies },
    pausedParameters,
  };
}

function processSAMPlusSpin(
  drawnNumber: number,
  strategies: Record<string, SAMPlusState>,
  zappingState: SAMPlusZappingState,
  spinNumber: number,
  previousCumulativeEarnings: number = 0,
  kellyFraction: number = 0.5,
  baseSafetyRatio: number = 6,
  volatilityThreshold: number = 0.15,
  recentResults: SpinResult[] = [],
): SpinResult {
  let totalProfit = 0;
  const actualBetsUsed: Record<string, number> = {};
  const wins: Record<string, boolean> = {};
  const pausedParameters: string[] = [];

  const currentPortfolio = 3000 + previousCumulativeEarnings;

  // Calculate portfolio analytics
  const analytics = calculateSAMPlusAnalytics(
    currentPortfolio,
    recentResults,
    baseSafetyRatio,
    volatilityThreshold,
  );

  // Update Markov switching for red/black
  updateSAMPlusZapping(zappingState, drawnNumber, recentResults);

  // Process each strategy with SAM+ logic
  Object.entries(strategies).forEach(([id, strategy]) => {
    const { config } = strategy;

    // Calculate Kelly optimal bet
    const kellyOptimal = calculateKellyOptimalBet(
      strategy,
      currentPortfolio,
      analytics,
    );

    // Calculate next bet with SAM+ logic
    const nextBet = calculateSAMPlusBet(
      strategy,
      kellyOptimal,
      kellyFraction,
      analytics,
    );

    // Apply dynamic safety ratio check
    const safetyCheck =
      currentPortfolio >= analytics.dynamicSafetyRatio * nextBet;

    if (!safetyCheck) {
      strategy.isPaused = true;
      pausedParameters.push(id);
      actualBetsUsed[id] = 0;
      wins[id] = false;
    } else {
      strategy.isPaused = false;
      strategy.currentBet = nextBet;

      // For red/black, use zapping target
      let won: boolean;
      if (config.target === "red" || config.target === "black") {
        won = BET_TYPES[config.betType](
          drawnNumber,
          zappingState.currentTarget,
        );
      } else {
        won = BET_TYPES[config.betType](drawnNumber, config.target);
      }

      actualBetsUsed[id] = strategy.currentBet;
      wins[id] = won;

      // Update strategy state
      strategy.lastWins.push(won);
      if (strategy.lastWins.length > 10) strategy.lastWins.shift(); // Keep last 10 results

      if (won) {
        strategy.lossStreak = 0;
        strategy.totalWon += strategy.currentBet * config.winMultiplier;
        totalProfit += strategy.currentBet * (config.winMultiplier - 1);
      } else {
        strategy.lossStreak++;
        totalProfit -= strategy.currentBet;

        // Loss streak reset after 5 losses
        if (strategy.lossStreak >= 5) {
          strategy.lossStreak = 0;
        }
      }

      strategy.totalWagered += strategy.currentBet;
      strategy.netResult = strategy.totalWon - strategy.totalWagered;
    }
  });

  return {
    spin: spinNumber,
    drawnNumber,
    spinNetResult: totalProfit,
    cumulativeEarnings: previousCumulativeEarnings + totalProfit,
    actualBetsUsed,
    wins,
    strategyType: "sam_plus",
    samPlusState: { ...strategies },
    samPlusAnalytics: analytics,
    samPlusZapping: { ...zappingState },
    pausedParameters,
  };
}

// SAM+ Helper Functions
function calculateSAMPlusAnalytics(
  currentPortfolio: number,
  recentResults: SpinResult[],
  baseSafetyRatio: number,
  volatilityThreshold: number,
): SAMPlusAnalytics {
  let volatility = 0;
  let recentDrawdown = 0;

  if (recentResults.length > 1) {
    // Calculate portfolio volatility over last 20 spins
    const returns = recentResults
      .slice(-20)
      .map((r, i, arr) =>
        i > 0
          ? (r.cumulativeEarnings - arr[i - 1].cumulativeEarnings) /
            currentPortfolio
          : 0,
      )
      .filter((r) => r !== 0);

    if (returns.length > 1) {
      const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      volatility = Math.sqrt(
        returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) /
          returns.length,
      );
    }

    // Calculate recent drawdown
    const last10 = recentResults.slice(-10);
    if (last10.length > 1) {
      const peak = Math.max(...last10.map((r) => r.cumulativeEarnings));
      const current = last10[last10.length - 1].cumulativeEarnings;
      recentDrawdown = (peak - current) / currentPortfolio;
    }
  }

  // Dynamic safety ratio based on volatility and drawdown
  let dynamicSafetyRatio = baseSafetyRatio;
  let adaptiveMode: "aggressive" | "balanced" | "conservative" = "balanced";

  if (volatility > volatilityThreshold || recentDrawdown > 0.1) {
    dynamicSafetyRatio = Math.min(baseSafetyRatio + 2, 10);
    adaptiveMode = "conservative";
  } else if (volatility < volatilityThreshold / 2 && recentDrawdown < 0.05) {
    dynamicSafetyRatio = Math.max(baseSafetyRatio - 1, 4);
    adaptiveMode = "aggressive";
  }

  return {
    portfolioVolatility: volatility,
    recentDrawdown,
    dynamicSafetyRatio,
    kellyOptimalBet: 0, // Will be calculated per strategy
    riskScore: volatility * 10 + recentDrawdown * 5,
    adaptiveMode,
  };
}

function calculateKellyOptimalBet(
  strategy: SAMPlusState,
  portfolio: number,
  analytics: SAMPlusAnalytics,
): number {
  // Simplified Kelly calculation: f = (bp - q) / b
  // where b = odds-1, p = win probability, q = loss probability
  const winProb =
    strategy.lastWins.length > 0
      ? strategy.lastWins.filter((w) => w).length / strategy.lastWins.length
      : 1 / strategy.config.winMultiplier; // Theoretical probability

  const lossProb = 1 - winProb;
  const odds = strategy.config.winMultiplier - 1;

  const kellyFraction = (odds * winProb - lossProb) / odds;
  const kellyBet = Math.max(0, kellyFraction * portfolio);

  return Math.min(kellyBet, portfolio / analytics.dynamicSafetyRatio);
}

function calculateSAMPlusBet(
  strategy: SAMPlusState,
  kellyOptimal: number,
  kellyFraction: number,
  analytics: SAMPlusAnalytics,
): number {
  // Base bet calculation
  let baseBet: number;

  if (strategy.config.target === 0) {
    // Linear progression for zero
    baseBet = strategy.initialBet + strategy.lossStreak;
  } else if (strategy.lossStreak >= 5) {
    // Reset after 5 losses
    baseBet = strategy.initialBet;
  } else {
    // Modified martingale with Kelly constraint
    baseBet = strategy.initialBet * Math.pow(2, strategy.lossStreak);
  }

  // Apply Kelly fraction
  const kellyConstrainedBet = kellyOptimal * kellyFraction;

  // Use minimum of martingale and Kelly-constrained bet
  return Math.min(baseBet, kellyConstrainedBet, strategy.initialBet * 64); // Cap at 64x initial
}

function updateSAMPlusZapping(
  zappingState: SAMPlusZappingState,
  drawnNumber: number,
  recentResults: SpinResult[],
): void {
  const drawnColor = getRouletteNumber(drawnNumber).color;

  // Update win counters
  if (drawnColor === "red") {
    zappingState.recentRedWins++;
  } else if (drawnColor === "black") {
    zappingState.recentBlackWins++;
  }

  // Decay old wins (keep running average)
  if (recentResults.length > 10) {
    zappingState.recentRedWins *= 0.9;
    zappingState.recentBlackWins *= 0.9;
  }

  // Markov switching logic - anti-persistence bias
  const totalColorWins =
    zappingState.recentRedWins + zappingState.recentBlackWins;
  if (totalColorWins > 0) {
    const redBias = zappingState.recentRedWins / totalColorWins;
    // Switch to color with fewer recent wins (anti-persistence)
    zappingState.currentTarget =
      redBias > 0.6
        ? "black"
        : redBias < 0.4
          ? "red"
          : zappingState.currentTarget;
    zappingState.transitionProbability = Math.abs(0.5 - redBias);
  }

  zappingState.markovState = (zappingState.markovState + 1) % 4; // Cycle through states
}

// Standard Martingale Spin Processing
function processStandardMartingaleSpin(
  drawnNumber: number,
  strategy: StandardMartingaleState,
  spinNumber: number,
  previousCumulativeEarnings: number = 0,
): SpinResult {
  const actualBetsUsed: Record<string, number> = {
    red: strategy.currentBet,
  };
  const wins: Record<string, boolean> = {};

  // Check if Red wins (Red numbers in European roulette)
  const rouletteNum = getRouletteNumber(drawnNumber);
  const won = rouletteNum.color === "red";
  wins.red = won;

  let profit: number;
  strategy.currentRound++;
  strategy.totalWagered += strategy.currentBet;

  if (won) {
    // Win: Get 1:1 payout, reset to base bet
    profit = strategy.currentBet; // Win back the bet + equal payout
    strategy.totalWon += strategy.currentBet * 2; // Bet + payout

    // Reset to base bet
    strategy.currentBet = strategy.baseBet;
    strategy.maxStreakSurvived = Math.max(
      strategy.maxStreakSurvived,
      strategy.lossStreak,
    );
    strategy.lossStreak = 0;
    strategy.totalResets++;
  } else {
    // Loss: Double the bet for next round
    profit = -strategy.currentBet;
    strategy.lossStreak++;

    // Double for next bet (classic Martingale)
    strategy.currentBet *= 2;
    strategy.maxBetReached = Math.max(
      strategy.maxBetReached,
      strategy.currentBet,
    );
  }

  strategy.netResult = strategy.totalWon - strategy.totalWagered;

  return {
    spin: spinNumber,
    drawnNumber,
    spinNetResult: profit,
    cumulativeEarnings: previousCumulativeEarnings + profit,
    actualBetsUsed,
    wins,
    strategyType: "standard_martingale",
    standardMartingaleState: { ...strategy },
  };
}

function getNextCompoundMartingaleBet(strategy: any, won: boolean): number {
  const { config, progressionStep } = strategy;

  if (won && config.resetOnWin) {
    strategy.progressionStep = 0;
    return config.initialBet;
  }

  if (won) return strategy.currentBet;

  switch (config.progression) {
    case "flat":
      return config.initialBet;
    case "martingale":
      return strategy.currentBet * 2;
    case "fibonacci": {
      const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
      const step = Math.min(progressionStep + 1, fib.length - 1);
      strategy.progressionStep = step;
      return config.initialBet * fib[step];
    }
    case "dalembert":
      return strategy.currentBet + config.initialBet;
    case "custom":
      if (config.customProgression) {
        const step = Math.min(
          progressionStep + 1,
          config.customProgression.length - 1,
        );
        strategy.progressionStep = step;
        return config.customProgression[step];
      }
      return config.initialBet;
    default:
      return config.initialBet;
  }
}

function calculateFrequencyData(results: SpinResult[]) {
  const frequency: Record<number, number> = {};
  for (let i = 0; i <= 36; i++) frequency[i] = 0;
  results.forEach((result) => frequency[result.drawnNumber]++);
  return Object.entries(frequency).map(([number, count]) => ({
    number: parseInt(number),
    count,
    percentage: (count / results.length) * 100,
    color: getRouletteNumber(parseInt(number)).color,
  }));
}

const Index = () => {
  const [results, setResults] = useState<SpinResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>(
    "compound_martingale",
  );
  // Store results for comparison
  const [compoundMartingaleResults, setCompoundMartingaleResults] = useState<
    SpinResult[]
  >([]);
  const [maxLoseResults, setMaxLoseResults] = useState<SpinResult[]>([]);
  const [zappingResults, setZappingResults] = useState<SpinResult[]>([]);
  const [safeCompoundMartingaleResults, setSafeCompoundMartingaleResults] =
    useState<SpinResult[]>([]);
  const [samPlusResults, setSamPlusResults] = useState<SpinResult[]>([]);
  const [standardMartingaleResults, setStandardMartingaleResults] = useState<
    SpinResult[]
  >([]);

  // Safe Compound Martingale settings
  const [safetyRatio, setSafetyRatio] = useState(6); // 6× safety ratio by default
  // SAM+ settings
  const [kellyFraction, setKellyFraction] = useState(0.5); // 50% Kelly by default
  const [baseSafetyRatio, setBaseSafetyRatio] = useState(6);
  const [volatilityThreshold, setVolatilityThreshold] = useState(0.15); // 15% volatility threshold

  // Standard Martingale settings
  const [standardMartingaleBaseBet, setStandardMartingaleBaseBet] = useState(5); // 5 Dhs base bet
  const [simulateRealisticStreaks, setSimulateRealisticStreaks] =
    useState(true);
  const [streakTolerance, setStreakTolerance] = useState(15);

  // Realistic streak analysis
  const [streakAnalysis, setStreakAnalysis] = useState<any>(null);

  // Multi-simulation tracking - track final earnings from consecutive runs
  const [multiSimResults, setMultiSimResults] = useState<{
    compound_martingale: number[];
    max_lose: number[];
    zapping: number[];
    safe_compound_martingale: number[];
    sam_plus: number[];
    standard_martingale: number[];
  }>({
    compound_martingale: [],
    max_lose: [],
    zapping: [],
    safe_compound_martingale: [],
    sam_plus: [],
    standard_martingale: [],
  });

  // Calculate running average of multi-simulation results
  const calculateRunningAverage = (strategyResults: number[]) => {
    if (strategyResults.length === 0) return 0;
    const sum = strategyResults.reduce((acc, val) => acc + val, 0);
    return sum / strategyResults.length;
  };

  // Reset multi-simulation tracking for current strategy
  const resetMultiSimResults = () => {
    setMultiSimResults((prev) => ({
      ...prev,
      [selectedStrategy]: [],
    }));
  };

  // Reset all multi-simulation tracking
  const resetAllMultiSimResults = () => {
    setMultiSimResults({
      compound_martingale: [],
      max_lose: [],
      zapping: [],
      safe_compound_martingale: [],
      sam_plus: [],
      standard_martingale: [],
    });
  };

  const runNewSimulation = useCallback(() => {
    setIsRunning(true);
    setProgress(0);

    const spins = generateFixedSpins(500);

    // Simulate progressive updates
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);

          let simulationResults: SpinResult[];
          switch (selectedStrategy) {
            case "compound_martingale":
              simulationResults = runCompoundMartingaleSimulation(spins);
              setCompoundMartingaleResults(simulationResults);
              break;
            case "max_lose":
              simulationResults = runMaxLoseSimulation(spins);
              setMaxLoseResults(simulationResults);
              break;
            case "zapping":
              simulationResults = runZappingSimulation(spins);
              setZappingResults(simulationResults);
              break;
            case "safe_compound_martingale":
              simulationResults = runSafeCompoundMartingaleSimulation(
                spins,
                safetyRatio,
              );
              setSafeCompoundMartingaleResults(simulationResults);
              break;
            case "sam_plus":
              simulationResults = runSAMPlusSimulation(
                spins,
                kellyFraction,
                baseSafetyRatio,
                volatilityThreshold,
              );
              setSamPlusResults(simulationResults);
              break;
            case "standard_martingale":
              simulationResults = runStandardMartingaleSimulation(
                spins,
                standardMartingaleBaseBet,
              );
              setStandardMartingaleResults(simulationResults);
              break;
            default:
              simulationResults = runCompoundMartingaleSimulation(spins);
              setCompoundMartingaleResults(simulationResults);
          }

          setResults(simulationResults);

          // Track final earnings from this simulation run
          const finalEarnings =
            simulationResults[simulationResults.length - 1]
              ?.cumulativeEarnings || 0;
          setMultiSimResults((prev) => ({
            ...prev,
            [selectedStrategy]: [...prev[selectedStrategy], finalEarnings],
          }));

          // Save simulation result
          const simulationResult = {
            strategy: selectedStrategy,
            startingInvestment: STARTING_PORTFOLIO,
            finalEarnings,
            finalPortfolio: STARTING_PORTFOLIO + finalEarnings,
            totalSpins: simulationResults.length,
            timestamp: new Date(),
            settings: {
              safetyRatio,
              kellyFraction,
              baseSafetyRatio,
              volatilityThreshold,
              standardMartingaleBaseBet,
              simulateRealisticStreaks,
              streakTolerance,
            },
            results: simulationResults,
          };

          // Handle saving simulation result asynchronously
          const saveSimulationResult = async () => {
            if (currentUser) {
              // Save to cloud for authenticated users
              try {
                await SimulationService.saveSimulation(
                  simulationResult,
                  currentUser.uid,
                );
              } catch (error) {
                console.error("Failed to save simulation to cloud:", error);
              }
            } else {
              // Save locally for non-authenticated users
              SimulationService.addLocalSimulation(simulationResult);
            }
          };

          // Call the async function
          saveSimulationResult();

          // Analyze streak patterns in the generated spins
          const spinsUsed = spins;
          const analysis = analyzeStreakPatterns(spinsUsed);
          setStreakAnalysis(analysis);

          setIsRunning(false);
          return 100;
        }
        return newProgress;
      });
    }, 100);
  }, [selectedStrategy]);

  // Authentication and user management
  const { currentUser, userProfile, logout } = useAuth();
  const { analyticsConsent } = useCookieConsent();
  const { toast } = useToast();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogTab, setAuthDialogTab] = useState<
    "signin" | "signup" | "reset"
  >("signin");
  const [showUserDashboard, setShowUserDashboard] = useState(false);

  // Handle logout with success notification
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
        variant: "default",
      });
      setShowUserDashboard(false);
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  // Currency selection
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [showStrategyExplanation, setShowStrategyExplanation] = useState(false);
  const [strategyToExplain, setStrategyToExplain] =
    useState<StrategyType>("max_lose");

  // Dynamic starting portfolio - uses user preference or local storage
  const [startingPortfolio, setStartingPortfolio] = useState(() => {
    if (currentUser && userProfile) {
      return userProfile.startingInvestment;
    }
    const localData = SimulationService.getLocalData();
    return localData.startingInvestment;
  });

  // Update starting portfolio when user profile changes
  useEffect(() => {
    if (currentUser && userProfile) {
      setStartingPortfolio(userProfile.startingInvestment);
    }
  }, [currentUser, userProfile]);

  const STARTING_PORTFOLIO = startingPortfolio;

  const formatCurrencyValue = (value: number) => {
    return formatCurrency(value, selectedCurrency);
  };

  const formatPortfolio = (cumulativeEarnings: number) => {
    return formatCurrencyValue(STARTING_PORTFOLIO + cumulativeEarnings);
  };

  const getNumberBadge = (number: number) => {
    const rouletteNumber = getRouletteNumber(number);
    const colorClass =
      rouletteNumber.color === "red"
        ? "bg-red-600 text-white"
        : rouletteNumber.color === "black"
          ? "bg-gray-900 text-white"
          : "bg-green-600 text-white";
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold",
          colorClass,
        )}
      >
        {number}
      </div>
    );
  };

  const cumulativeData = results.map((result) => ({
    spin: result.spin,
    earnings: result.cumulativeEarnings,
    portfolio: STARTING_PORTFOLIO + result.cumulativeEarnings,
  }));

  const portfolioData = results.map((result) => ({
    spin: result.spin,
    portfolio: STARTING_PORTFOLIO + result.cumulativeEarnings,
    portfolioGrowth:
      ((STARTING_PORTFOLIO + result.cumulativeEarnings) / STARTING_PORTFOLIO -
        1) *
      100,
  }));

  const betProgressionData = results.map((result) => {
    const data: Record<string, number> = { spin: result.spin };
    Object.entries(result.actualBetsUsed).forEach(([key, value]) => {
      data[key] = value;
    });
    return data;
  });

  const frequencyData = useMemo(
    () => calculateFrequencyData(results),
    [results],
  );

  const finalStats = useMemo(() => {
    if (results.length === 0) return null;
    const final = results[results.length - 1];

    const maxBets: Record<string, number> = {};
    Object.keys(final.actualBetsUsed).forEach((key) => {
      const bets = results
        .map((r) => r.actualBetsUsed[key] || 0)
        .filter((bet) => bet > 0);
      maxBets[key] = bets.length > 0 ? Math.max(...bets) : 0;
    });

    const totalWagered = results.reduce(
      (sum, r) =>
        sum + Object.values(r.actualBetsUsed).reduce((s, bet) => s + bet, 0),
      0,
    );

    const finalPortfolio = STARTING_PORTFOLIO + final.cumulativeEarnings;
    const portfolioGrowth = (finalPortfolio / STARTING_PORTFOLIO - 1) * 100;
    const maxPortfolio = Math.max(
      ...results.map((r) => STARTING_PORTFOLIO + r.cumulativeEarnings),
    );
    const minPortfolio = Math.min(
      ...results.map((r) => STARTING_PORTFOLIO + r.cumulativeEarnings),
    );
    const maxDrawdownFromPeak =
      ((minPortfolio - maxPortfolio) / maxPortfolio) * 100;

    // Calculate win rate and other metrics
    const winningSpins = results.filter((r) => r.spinNetResult > 0).length;
    const winRate = (winningSpins / results.length) * 100;

    // Risk metrics
    const volatility = Math.sqrt(
      results.reduce((sum, r) => {
        const deviation =
          r.spinNetResult - final.cumulativeEarnings / results.length;
        return sum + deviation * deviation;
      }, 0) / results.length,
    );

    // Consecutive win/loss streaks
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;

    results.forEach((r) => {
      if (r.spinNetResult > 0) {
        currentWinStreak++;
        currentLossStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
      } else if (r.spinNetResult < 0) {
        currentLossStreak++;
        currentWinStreak = 0;
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
      } else {
        currentWinStreak = 0;
        currentLossStreak = 0;
      }
    });

    return {
      totalSpins: results.length,
      finalEarnings: final.cumulativeEarnings,
      finalPortfolio,
      portfolioGrowth,
      maxBets,
      totalWagered,
      maxDrawdown: Math.min(...results.map((r) => r.cumulativeEarnings)),
      maxPortfolio,
      minPortfolio,
      maxDrawdownFromPeak,
      winRate,
      volatility,
      maxWinStreak,
      maxLossStreak,
      roi: (final.cumulativeEarnings / totalWagered) * 100,
      sharpeRatio: final.cumulativeEarnings / (volatility || 1),
    };
  }, [results]);

  const exportData = () => {
    if (results.length === 0) return;

    const headers = [
      "Spin",
      "Number",
      "Net Result",
      "Cumulative",
      ...Object.keys(results[0].actualBetsUsed).map((key) => `Bet ${key}`),
      "Total Bet",
    ];

    const csvContent = [
      headers.join(","),
      ...results.map((r) => {
        const bets = Object.values(r.actualBetsUsed);
        const totalBet = bets.reduce((sum, bet) => sum + bet, 0);
        return [
          r.spin,
          r.drawnNumber,
          r.spinNetResult,
          r.cumulativeEarnings,
          ...bets,
          totalBet,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedStrategy}_simulation.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStrategyName = () => {
    switch (selectedStrategy) {
      case "compound_martingale":
        return "Compound Martingale Strategy";
      case "max_lose":
        return "Max Lose Strategy";
      case "zapping":
        return "Zapping Strategy";
      case "safe_compound_martingale":
        return "Safe Compound Martingale Strategy";
      case "sam_plus":
        return "Smart Adaptive Martingale Plus (SAM+)";
      case "standard_martingale":
        return "Standard Martingale (Red)";
      default:
        return "Strategy";
    }
  };

  const getStrategyDescription = () => {
    switch (selectedStrategy) {
      case "compound_martingale":
        return "Classic 5-strategy Martingale approach targeting Number 0, 1st Dozen, 2nd Dozen, Black, and Even";
      case "max_lose":
        return "Reset after 5 losses, +1 on zero";
      case "zapping":
        return "Alternate between Red and Black. Double on each loss, restart on win";
      case "safe_compound_martingale":
        return `Capital protection with ${safetyRatio}× safety ratio. Pauses bets when portfolio < ${safetyRatio}× next bet amount`;
      case "sam_plus":
        return `Advanced adaptive system with Kelly betting (${(kellyFraction * 100).toFixed(0)}%), dynamic risk management, and Markov switching`;
      case "standard_martingale":
        return `Classic Martingale logic with all bets on Red. Base bet: ${standardMartingaleBaseBet} Dhs. Double on loss, reset on win`;
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-x-hidden">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Top Navigation */}
        <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 -mx-3 sm:-mx-4 px-3 sm:px-4 py-3 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="bg-gradient-to-r from-green-400 to-emerald-400 p-2 rounded-lg flex-shrink-0">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent truncate">
                  RoSiStrat
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 truncate">
                  Roulette Strategy Simulator
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Donation Button */}
              <Button
                onClick={() =>
                  window.open(
                    "https://paypal.me/JadissEL?country.x=GR&locale.x=en_US",
                    "_blank",
                  )
                }
                variant="outline"
                size="sm"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300 w-full sm:w-auto h-9 text-xs sm:text-sm"
              >
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Support Creator</span>
                <span className="xs:hidden">Support</span>
              </Button>

              {currentUser || userProfile ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUserDashboard(!showUserDashboard)}
                    className="text-white hover:bg-white/10"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {userProfile?.displayName || "User"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-400 hover:bg-red-400/10 hover:text-red-300"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => {
                      setAuthDialogTab("signin");
                      setShowAuthDialog(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="border-green-400 text-green-400 hover:bg-green-400/10 hover:text-green-300 flex-1 sm:flex-initial h-9 text-xs sm:text-sm"
                  >
                    <LogIn className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      setAuthDialogTab("signup");
                      setShowAuthDialog(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-initial h-9 text-xs sm:text-sm"
                  >
                    <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Dashboard (if logged in and toggled) */}
        {(currentUser || userProfile) && showUserDashboard && (
          <div className="mb-8">
            <UserDashboard />
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 text-white">
            🎰 European Roulette Strategy Simulator
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-3 bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-2 mb-3">
              <Settings className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <div className="text-lg font-semibold text-white">
                  {getStrategyName()}
                </div>
                <div className="text-sm text-slate-400">
                  {getStrategyDescription()}
                </div>
              </div>
            </div>
            <p className="text-lg text-gray-300">
              Choose your strategy and run comprehensive 500-spin analysis
            </p>
          </div>
        </div>

        {/* Creator Bio Block */}
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="creator-bio bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-slate-900">JA</span>
              </div>
              <div className="flex-1">
                <p className="text-white">
                  <strong className="text-green-400">Created by:</strong> Jadiss
                  EL ANTAKI
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Passionate about probability theory and strategy simulation,
                  Jadiss built RoSiStrat to help users understand the logic
                  behind betting systems – without risking real money.
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <span className="text-slate-400">💡 Like this project?</span>
                  <button
                    onClick={() =>
                      window.open(
                        "https://paypal.me/JadissEL?country.x=GR&locale.x=en_US",
                        "_blank",
                      )
                    }
                    className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
                  >
                    <Heart className="w-3 h-3" />
                    Buy me a coffee
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <a
                  href="/about"
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                >
                  Learn more <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() =>
                    window.open(
                      "https://paypal.me/JadissEL?country.x=GR&locale.x=en_US",
                      "_blank",
                    )
                  }
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  <Heart className="w-3 h-3" />
                  Donate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Selection */}
        <Card
          className="mb-8 bg-slate-800/50 border-slate-700"
          data-section="strategy"
        >
          <CardHeader>
            <CardTitle>Strategy Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <Button
                onClick={() => {
                  setStrategyToExplain("compound_martingale");
                  setShowStrategyExplanation(true);
                }}
                variant={
                  selectedStrategy === "compound_martingale"
                    ? "default"
                    : "outline"
                }
                className={cn(
                  "h-auto p-4 flex flex-col items-start text-left whitespace-normal",
                  selectedStrategy === "compound_martingale"
                    ? "bg-green-600 hover:bg-green-700 border-green-500"
                    : "border-slate-600 hover:bg-slate-700",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Home className="w-5 h-5" />
                  <span className="font-semibold">🏛️ Compound Martingale</span>
                </div>
                <span className="text-sm opacity-90 leading-relaxed">
                  Classic 5-strategy Martingale approach targeting Number 0, 1st
                  Dozen, 2nd Dozen, Black, and Even
                </span>
                {selectedStrategy === "compound_martingale" && (
                  <div className="mt-2 text-xs bg-green-900/50 px-2 py-1 rounded">
                    ✓ Selected - Click to learn more
                  </div>
                )}
              </Button>

              <Button
                onClick={() => {
                  setStrategyToExplain("max_lose");
                  setShowStrategyExplanation(true);
                }}
                variant={
                  selectedStrategy === "max_lose" ? "default" : "outline"
                }
                className={cn(
                  "h-auto p-4 flex flex-col items-start text-left whitespace-normal",
                  selectedStrategy === "max_lose"
                    ? "bg-red-600 hover:bg-red-700 border-red-500"
                    : "border-slate-600 hover:bg-slate-700",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5" />
                  <span className="font-semibold">🛑 Max Lose Strategy</span>
                </div>
                <span className="text-sm opacity-90 leading-relaxed">
                  Reset after 5 losses, +1 on zero
                </span>
                {selectedStrategy === "max_lose" && (
                  <div className="mt-2 text-xs bg-red-900/50 px-2 py-1 rounded">
                    ✓ Selected - Click to learn more
                  </div>
                )}
              </Button>

              <Button
                onClick={() => {
                  setStrategyToExplain("zapping");
                  setShowStrategyExplanation(true);
                }}
                variant={selectedStrategy === "zapping" ? "default" : "outline"}
                className={cn(
                  "h-auto p-4 flex flex-col items-start text-left whitespace-normal",
                  selectedStrategy === "zapping"
                    ? "bg-purple-600 hover:bg-purple-700 border-purple-500"
                    : "border-slate-600 hover:bg-slate-700",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5" />
                  <span className="font-semibold">⚡ Zapping Strategy</span>
                </div>
                <span className="text-sm opacity-90 leading-relaxed">
                  Alternate Red/Black. Double on loss, restart on win
                </span>
                {selectedStrategy === "zapping" && (
                  <div className="mt-2 text-xs bg-purple-900/50 px-2 py-1 rounded">
                    ✓ Selected - Click to learn more
                  </div>
                )}
              </Button>

              <Button
                onClick={() => {
                  setStrategyToExplain("safe_compound_martingale");
                  setShowStrategyExplanation(true);
                }}
                variant={
                  selectedStrategy === "safe_compound_martingale"
                    ? "default"
                    : "outline"
                }
                className={cn(
                  "h-auto p-4 flex flex-col items-start text-left whitespace-normal",
                  selectedStrategy === "safe_compound_martingale"
                    ? "bg-blue-600 hover:bg-blue-700 border-blue-500"
                    : "border-slate-600 hover:bg-slate-700",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-5 h-5" />
                  <span className="font-semibold">
                    🛡️ Safe Compound Martingale
                  </span>
                </div>
                <span className="text-sm opacity-90 leading-relaxed">
                  Capital protection with {safetyRatio}× safety ratio rule
                </span>
                {selectedStrategy === "safe_compound_martingale" && (
                  <div className="mt-2 text-xs bg-blue-900/50 px-2 py-1 rounded">
                    ✓ Selected - Click to learn more
                  </div>
                )}
              </Button>

              <Button
                onClick={() => {
                  setStrategyToExplain("sam_plus");
                  setShowStrategyExplanation(true);
                }}
                variant={
                  selectedStrategy === "sam_plus" ? "default" : "outline"
                }
                className={cn(
                  "h-auto p-4 flex flex-col items-start text-left whitespace-normal",
                  selectedStrategy === "sam_plus"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-purple-500"
                    : "border-slate-600 hover:bg-slate-700",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">🧠 SAM+</span>
                </div>
                <span className="text-sm opacity-90 leading-relaxed">
                  Advanced adaptive system with Kelly betting & AI switching
                </span>
                {selectedStrategy === "sam_plus" && (
                  <div className="mt-2 text-xs bg-purple-900/50 px-2 py-1 rounded">
                    ✓ Selected - Click to learn more
                  </div>
                )}
              </Button>

              <Button
                onClick={() => {
                  setStrategyToExplain("standard_martingale");
                  setShowStrategyExplanation(true);
                }}
                variant={
                  selectedStrategy === "standard_martingale"
                    ? "default"
                    : "outline"
                }
                className={cn(
                  "h-auto p-4 flex flex-col items-start text-left whitespace-normal",
                  selectedStrategy === "standard_martingale"
                    ? "bg-red-600 hover:bg-red-700 border-red-500"
                    : "border-slate-600 hover:bg-slate-700",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5" />
                  <span className="font-semibold">🔴 Standard Martingale</span>
                </div>
                <span className="text-sm opacity-90 leading-relaxed">
                  Classic Martingale logic with all bets on Red. Double on loss,
                  reset on win
                </span>
                {selectedStrategy === "standard_martingale" && (
                  <div className="mt-2 text-xs bg-red-900/50 px-2 py-1 rounded">
                    ✓ Selected - Click to learn more
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Starting Investment Configuration */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <StartingInvestmentInput
            value={startingPortfolio}
            onChange={setStartingPortfolio}
            selectedCurrency={selectedCurrency}
            disabled={isRunning}
          />
          <CurrencySelector
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
          />
        </div>

        {/* Realistic Roulette Settings */}
        <Card className="mb-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              🎲 Realistic Roulette Engine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <div className="text-sm font-medium text-blue-400 mb-1">
                  Streak Simulation
                </div>
                <div className="text-lg font-bold text-white">
                  {REALISTIC_ROULETTE_CONFIG.realistic_streaks_enabled
                    ? "✅ ENABLED"
                    : "❌ DISABLED"}
                </div>
                <div className="text-xs text-slate-400">
                  Natural variance with long streaks
                </div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <div className="text-sm font-medium text-green-400 mb-1">
                  Max Streak Length
                </div>
                <div className="text-lg font-bold text-white">
                  {REALISTIC_ROULETTE_CONFIG.max_expected_streak_length}
                </div>
                <div className="text-xs text-slate-400">
                  Consecutive outcomes possible
                </div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <div className="text-sm font-medium text-purple-400 mb-1">
                  Volatility Model
                </div>
                <div className="text-lg font-bold text-white capitalize">
                  {REALISTIC_ROULETTE_CONFIG.volatility_model}
                </div>
                <div className="text-xs text-slate-400">
                  Randomness distribution
                </div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <div className="text-sm font-medium text-orange-400 mb-1">
                  Variance Amplifier
                </div>
                <div className="text-lg font-bold text-white">
                  {REALISTIC_ROULETTE_CONFIG.variance_amplifier}×
                </div>
                <div className="text-xs text-slate-400">
                  Streak continuation boost
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-300">
                  Real-World Simulation Active
                </span>
              </div>
              <p className="text-xs text-yellow-200">
                This engine simulates realistic roulette behavior including
                natural 10-15 consecutive streaks. Strategies are stress-tested
                against true randomness patterns observed in real casinos.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Control Panel */}
        <Card className="mb-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Simulation Control</span>
              {finalStats && (
                <Badge
                  variant={
                    finalStats.finalEarnings >= 0 ? "default" : "destructive"
                  }
                  className="text-sm"
                >
                  {finalStats.finalEarnings >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  Final Result: {formatCurrencyValue(finalStats.finalEarnings)}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={runNewSimulation}
                    disabled={isRunning}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isRunning ? (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run 500-Spin Simulation
                      </>
                    )}
                  </Button>
                  {results.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={exportData}
                      className="border-slate-600 hover:bg-slate-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  )}
                </div>
                {isRunning && (
                  <div className="flex items-center gap-2 min-w-[200px]">
                    <Progress value={progress} className="flex-1" />
                    <span className="text-sm text-gray-400">
                      {Math.round(progress)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Safety Ratio Control for Safe Compound Martingale */}
              {selectedStrategy === "safe_compound_martingale" && (
                <div className="border-t border-slate-600 pt-4">
                  <h4 className="text-sm font-medium mb-2 text-slate-300">
                    Capital Protection Settings:
                  </h4>
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-slate-400">
                      Safety Ratio:
                    </label>
                    <select
                      value={safetyRatio}
                      onChange={(e) => setSafetyRatio(Number(e.target.value))}
                      className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                      disabled={isRunning}
                    >
                      <option value={5}>5× (Higher Risk)</option>
                      <option value={6}>6× (Balanced)</option>
                      <option value={8}>8× (Conservative)</option>
                      <option value={10}>10× (Very Safe)</option>
                    </select>
                    <span className="text-xs text-slate-500">
                      Portfolio must be ≥ {safetyRatio}× next bet amount
                    </span>
                  </div>
                </div>
              )}

              {/* SAM+ Advanced Controls */}
              {selectedStrategy === "sam_plus" && (
                <div className="border-t border-slate-600 pt-4">
                  <h4 className="text-sm font-medium mb-2 text-slate-300">
                    SAM+ Advanced Settings:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-slate-400">
                        Kelly Fraction:
                      </label>
                      <select
                        value={kellyFraction}
                        onChange={(e) =>
                          setKellyFraction(Number(e.target.value))
                        }
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                        disabled={isRunning}
                      >
                        <option value={0.25}>25% (Very Conservative)</option>
                        <option value={0.5}>50% (Balanced)</option>
                        <option value={0.7}>70% (Aggressive)</option>
                        <option value={1.0}>100% (Full Kelly)</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-slate-400">
                        Base Safety:
                      </label>
                      <select
                        value={baseSafetyRatio}
                        onChange={(e) =>
                          setBaseSafetyRatio(Number(e.target.value))
                        }
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                        disabled={isRunning}
                      >
                        <option value={4}>4× (High Risk)</option>
                        <option value={6}>6× (Balanced)</option>
                        <option value={8}>8× (Conservative)</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-slate-400">
                        Vol Threshold:
                      </label>
                      <select
                        value={volatilityThreshold}
                        onChange={(e) =>
                          setVolatilityThreshold(Number(e.target.value))
                        }
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                        disabled={isRunning}
                      >
                        <option value={0.1}>10% (Sensitive)</option>
                        <option value={0.15}>15% (Balanced)</option>
                        <option value={0.2}>20% (Tolerant)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Standard Martingale Settings */}
              {selectedStrategy === "standard_martingale" && (
                <div className="border-t border-slate-600 pt-4">
                  <h4 className="text-sm font-medium mb-2 text-slate-300">
                    Standard Martingale Settings:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-slate-400">
                        Base Bet:
                      </label>
                      <select
                        value={standardMartingaleBaseBet}
                        onChange={(e) =>
                          setStandardMartingaleBaseBet(Number(e.target.value))
                        }
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                        disabled={isRunning}
                      >
                        <option value={1}>1 Dhs</option>
                        <option value={5}>5 Dhs (Classic)</option>
                        <option value={10}>10 Dhs</option>
                        <option value={25}>25 Dhs (High Stakes)</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-slate-400">
                        Streak Tolerance:
                      </label>
                      <select
                        value={streakTolerance}
                        onChange={(e) =>
                          setStreakTolerance(Number(e.target.value))
                        }
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                        disabled={isRunning}
                      >
                        <option value={10}>10 losses max</option>
                        <option value={15}>15 losses max (Default)</option>
                        <option value={20}>20 losses max (Extreme)</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-slate-400">
                        Realistic Streaks:
                      </label>
                      <select
                        value={
                          simulateRealisticStreaks ? "enabled" : "disabled"
                        }
                        onChange={(e) =>
                          setSimulateRealisticStreaks(
                            e.target.value === "enabled",
                          )
                        }
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                        disabled={isRunning}
                      >
                        <option value="enabled">Enabled (Recommended)</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <div className="text-xs text-red-200">
                      <strong>⚠️ Risk Warning:</strong> With base bet{" "}
                      {standardMartingaleBaseBet} Dhs, a streak of 15 losses
                      requires:
                      <div className="mt-1 font-mono">
                        • Final bet:{" "}
                        {(
                          standardMartingaleBaseBet * Math.pow(2, 14)
                        ).toLocaleString()}{" "}
                        Dhs • Total risk:{" "}
                        {(
                          standardMartingaleBaseBet *
                          (Math.pow(2, 15) - 1)
                        ).toLocaleString()}{" "}
                        Dhs
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Strategy Status */}
              {results.length > 0 && (
                <div className="border-t border-slate-600 pt-4">
                  <h4 className="text-sm font-medium mb-2 text-slate-300">
                    Strategy Status:
                  </h4>
                  <div className="text-sm text-slate-400">
                    {selectedStrategy === "zapping" && results.length > 0 && (
                      <div className="flex items-center gap-4">
                        <span>
                          Current Target:
                          <span
                            className={cn(
                              "ml-1 font-semibold",
                              results[results.length - 1].zappingState
                                ?.currentTarget === "red"
                                ? "text-red-400"
                                : "text-gray-300",
                            )}
                          >
                            {results[
                              results.length - 1
                            ].zappingState?.currentTarget?.toUpperCase()}
                          </span>
                        </span>
                        <span>
                          Next Bet:
                          <span className="ml-1 font-semibold text-yellow-400">
                            {
                              results[results.length - 1].zappingState
                                ?.currentBet
                            }{" "}
                            units
                          </span>
                        </span>
                        <span>
                          Zap Position:
                          <span className="ml-1 font-semibold text-purple-400">
                            {
                              results[results.length - 1].zappingState
                                ?.zapPosition
                            }
                          </span>
                        </span>
                      </div>
                    )}
                    {selectedStrategy === "safe_compound_martingale" &&
                      results.length > 0 && (
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                            <span>
                              Active Parameters:
                              <span className="ml-1 font-semibold text-green-400">
                                {
                                  Object.keys(
                                    results[0]?.actualBetsUsed || {},
                                  ).filter(
                                    (key) =>
                                      (results[results.length - 1]
                                        ?.actualBetsUsed[key] || 0) > 0,
                                  ).length
                                }
                              </span>
                            </span>
                            <span>
                              Current Portfolio:
                              <span className="ml-1 font-semibold text-blue-400">
                                {formatPortfolio(
                                  results[results.length - 1]
                                    ?.cumulativeEarnings || 0,
                                )}
                              </span>
                            </span>
                          </div>
                          {results[results.length - 1]?.pausedParameters &&
                            results[results.length - 1].pausedParameters!
                              .length > 0 && (
                              <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded">
                                <span className="text-yellow-400 font-semibold">
                                  ⚠️ Paused Parameters:
                                </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {results[
                                    results.length - 1
                                  ].pausedParameters!.map((param) => (
                                    <span
                                      key={param}
                                      className="bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded text-xs"
                                    >
                                      {param}
                                    </span>
                                  ))}
                                </div>
                                <div className="text-xs text-yellow-200 mt-1">
                                  These parameters are paused due to
                                  insufficient capital ratio ({safetyRatio}×)
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                    {selectedStrategy === "sam_plus" && results.length > 0 && (
                      <div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-2 rounded">
                            <div className="text-xs text-slate-400">
                              Portfolio
                            </div>
                            <div className="font-semibold text-blue-400">
                              {formatPortfolio(
                                results[results.length - 1]
                                  ?.cumulativeEarnings || 0,
                              )}
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-2 rounded">
                            <div className="text-xs text-slate-400">
                              Kelly Fraction
                            </div>
                            <div className="font-semibold text-green-400">
                              {(kellyFraction * 100).toFixed(0)}%
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 p-2 rounded">
                            <div className="text-xs text-slate-400">
                              Dynamic Safety
                            </div>
                            <div className="font-semibold text-orange-400">
                              {results[
                                results.length - 1
                              ]?.samPlusAnalytics?.dynamicSafetyRatio.toFixed(
                                1,
                              )}
                              ×
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-yellow-900/20 to-amber-900/20 p-2 rounded">
                            <div className="text-xs text-slate-400">
                              Risk Mode
                            </div>
                            <div
                              className={cn(
                                "font-semibold capitalize",
                                results[results.length - 1]?.samPlusAnalytics
                                  ?.adaptiveMode === "aggressive"
                                  ? "text-red-400"
                                  : results[results.length - 1]
                                        ?.samPlusAnalytics?.adaptiveMode ===
                                      "conservative"
                                    ? "text-blue-400"
                                    : "text-yellow-400",
                              )}
                            >
                              {
                                results[results.length - 1]?.samPlusAnalytics
                                  ?.adaptiveMode
                              }
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-2">
                          <span>
                            Zapping Target:
                            <span
                              className={cn(
                                "ml-1 font-semibold",
                                results[results.length - 1]?.samPlusZapping
                                  ?.currentTarget === "red"
                                  ? "text-red-400"
                                  : "text-gray-300",
                              )}
                            >
                              {results[
                                results.length - 1
                              ]?.samPlusZapping?.currentTarget?.toUpperCase()}
                            </span>
                          </span>
                          <span>
                            Volatility:
                            <span className="ml-1 font-semibold text-yellow-400">
                              {(
                                (results[results.length - 1]?.samPlusAnalytics
                                  ?.portfolioVolatility || 0) * 100
                              ).toFixed(1)}
                              %
                            </span>
                          </span>
                          <span>
                            Risk Score:
                            <span
                              className={cn(
                                "ml-1 font-semibold",
                                (results[results.length - 1]?.samPlusAnalytics
                                  ?.riskScore || 0) > 3
                                  ? "text-red-400"
                                  : (results[results.length - 1]
                                        ?.samPlusAnalytics?.riskScore || 0) >
                                      1.5
                                    ? "text-yellow-400"
                                    : "text-green-400",
                              )}
                            >
                              {(
                                results[results.length - 1]?.samPlusAnalytics
                                  ?.riskScore || 0
                              ).toFixed(2)}
                            </span>
                          </span>
                        </div>

                        {results[results.length - 1]?.pausedParameters &&
                          results[results.length - 1].pausedParameters!.length >
                            0 && (
                            <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded">
                              <span className="text-yellow-400 font-semibold">
                                ⚠️ Paused Parameters (Dynamic Safety):
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {results[
                                  results.length - 1
                                ].pausedParameters!.map((param) => (
                                  <span
                                    key={param}
                                    className="bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded text-xs"
                                  >
                                    {param}
                                  </span>
                                ))}
                              </div>
                              <div className="text-xs text-yellow-200 mt-1">
                                Paused due to adaptive risk management (current
                                ratio:{" "}
                                {results[
                                  results.length - 1
                                ]?.samPlusAnalytics?.dynamicSafetyRatio.toFixed(
                                  1,
                                )}
                                ×)
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                    {selectedStrategy === "standard_martingale" &&
                      results.length > 0 && (
                        <div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div className="bg-gradient-to-r from-red-900/20 to-pink-900/20 p-2 rounded">
                              <div className="text-xs text-slate-400">
                                Current Bet
                              </div>
                              <div className="font-semibold text-red-400">
                                {results[
                                  results.length - 1
                                ]?.standardMartingaleState?.currentBet.toLocaleString()}{" "}
                                Dhs
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-2 rounded">
                              <div className="text-xs text-slate-400">
                                Current Round
                              </div>
                              <div className="font-semibold text-blue-400">
                                #
                                {
                                  results[results.length - 1]
                                    ?.standardMartingaleState?.currentRound
                                }
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 p-2 rounded">
                              <div className="text-xs text-slate-400">
                                Loss Streak
                              </div>
                              <div className="font-semibold text-yellow-400">
                                {
                                  results[results.length - 1]
                                    ?.standardMartingaleState?.lossStreak
                                }
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-2 rounded">
                              <div className="text-xs text-slate-400">
                                Total Resets
                              </div>
                              <div className="font-semibold text-green-400">
                                {
                                  results[results.length - 1]
                                    ?.standardMartingaleState?.totalResets
                                }
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-2">
                            <span>
                              Max Bet Reached:
                              <span className="ml-1 font-semibold text-orange-400">
                                {results[
                                  results.length - 1
                                ]?.standardMartingaleState?.maxBetReached.toLocaleString()}{" "}
                                Dhs
                              </span>
                            </span>
                            <span>
                              Max Streak Survived:
                              <span className="ml-1 font-semibold text-purple-400">
                                {
                                  results[results.length - 1]
                                    ?.standardMartingaleState?.maxStreakSurvived
                                }{" "}
                                losses
                              </span>
                            </span>
                          </div>

                          {results[results.length - 1]?.standardMartingaleState
                            ?.lossStreak >= 8 && (
                            <div className="mt-2 p-2 bg-orange-900/20 border border-orange-500/30 rounded">
                              <span className="text-orange-400 font-semibold">
                                🔥 Extended Loss Streak Alert!
                              </span>
                              <div className="text-xs text-orange-200 mt-1">
                                Current streak:{" "}
                                {
                                  results[results.length - 1]
                                    ?.standardMartingaleState?.lossStreak
                                }{" "}
                                losses. Next bet will be:{" "}
                                {(
                                  results[results.length - 1]
                                    ?.standardMartingaleState?.currentBet || 0
                                ).toLocaleString()}{" "}
                                Dhs
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    {selectedStrategy !== "zapping" &&
                      selectedStrategy !== "safe_compound_martingale" &&
                      selectedStrategy !== "sam_plus" &&
                      selectedStrategy !== "standard_martingale" && (
                        <span>
                          Running {getStrategyName()} with{" "}
                          {Object.keys(results[0]?.actualBetsUsed || {}).length}{" "}
                          active betting parameters
                        </span>
                      )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Tabs defaultValue="charts" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
              <TabsTrigger value="charts">📊 Charts</TabsTrigger>
              <TabsTrigger value="data">📋 Data Table</TabsTrigger>
              <TabsTrigger value="analysis">🔍 Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="charts" className="space-y-6">
              {/* Portfolio Growth Chart */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>Portfolio Growth Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={portfolioData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-slate-600"
                        />
                        <XAxis dataKey="spin" />
                        <YAxis />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #475569",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#e2e8f0" }}
                          formatter={(value: any, name: string) => [
                            name === "portfolio"
                              ? formatCurrency(value)
                              : `${value.toFixed(2)}%`,
                            name === "portfolio"
                              ? "Portfolio Value"
                              : "Growth %",
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="portfolio"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                          name="portfolio"
                        />
                        <Line
                          type="monotone"
                          dataKey="portfolioGrowth"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={false}
                          yAxisId="right"
                          name="portfolioGrowth"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Cumulative Earnings Chart */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>Cumulative Earnings Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={cumulativeData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-slate-600"
                        />
                        <XAxis dataKey="spin" />
                        <YAxis />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #475569",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#e2e8f0" }}
                          formatter={(value: any) => [
                            formatCurrency(value),
                            "Earnings",
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="earnings"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Bet Progression Chart */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>
                    Bet Progression by Parameter (Log Scale)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={betProgressionData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-slate-600"
                        />
                        <XAxis dataKey="spin" />
                        <YAxis scale="log" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #475569",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#e2e8f0" }}
                        />
                        <Legend />
                        {Object.keys(results[0]?.actualBetsUsed || {}).map(
                          (key, index) => {
                            const colors = [
                              "#10b981",
                              "#3b82f6",
                              "#8b5cf6",
                              "#6b7280",
                              "#f59e0b",
                              "#ef4444",
                              "#06b6d4",
                            ];
                            return (
                              <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={colors[index % colors.length]}
                                strokeWidth={2}
                                dot={false}
                                name={key}
                              />
                            );
                          },
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Frequency Chart */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>Number Frequency Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={frequencyData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-slate-600"
                        />
                        <XAxis dataKey="number" />
                        <YAxis />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #475569",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#e2e8f0" }}
                          formatter={(value: any, name: string, props: any) => [
                            `${value} times (${props.payload.percentage.toFixed(1)}%)`,
                            "Frequency",
                          ]}
                        />
                        <Bar
                          dataKey="count"
                          fill="#10b981"
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Detailed Simulation Results</span>
                    <Badge variant="secondary">
                      Showing all {results.length} spins
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Spin</TableHead>
                          <TableHead className="w-20">Number</TableHead>
                          <TableHead className="text-right">
                            Net Result
                          </TableHead>
                          <TableHead className="text-right">
                            Cumulative
                          </TableHead>
                          <TableHead className="text-right">
                            Portfolio
                          </TableHead>
                          {Object.keys(results[0]?.actualBetsUsed || {}).map(
                            (key) => (
                              <TableHead
                                key={key}
                                className="text-right text-xs"
                              >
                                {key}
                              </TableHead>
                            ),
                          )}
                          <TableHead className="text-right font-semibold">
                            Total Bet
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.map((result) => (
                          <TableRow
                            key={result.spin}
                            className="hover:bg-slate-700/50"
                          >
                            <TableCell className="font-medium">
                              {result.spin}
                            </TableCell>
                            <TableCell>
                              {getNumberBadge(result.drawnNumber)}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-right font-mono",
                                result.spinNetResult >= 0
                                  ? "text-green-400"
                                  : "text-red-400",
                              )}
                            >
                              {formatCurrency(result.spinNetResult)}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-right font-mono font-semibold",
                                result.cumulativeEarnings >= 0
                                  ? "text-green-400"
                                  : "text-red-400",
                              )}
                            >
                              {formatCurrency(result.cumulativeEarnings)}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-right font-mono font-bold",
                                STARTING_PORTFOLIO +
                                  result.cumulativeEarnings >=
                                  STARTING_PORTFOLIO
                                  ? "text-blue-400"
                                  : "text-orange-400",
                              )}
                            >
                              {formatPortfolio(result.cumulativeEarnings)}
                            </TableCell>
                            {Object.entries(result.actualBetsUsed).map(
                              ([key, bet]) => (
                                <TableCell
                                  key={key}
                                  className={cn(
                                    "text-right font-mono text-sm",
                                    result.wins[key]
                                      ? "bg-green-900/50 text-green-300 font-bold"
                                      : "",
                                  )}
                                >
                                  {bet?.toLocaleString() || "0"}
                                  {result.wins[key] && " ✓"}
                                </TableCell>
                              ),
                            )}
                            <TableCell className="text-right font-mono text-sm font-bold bg-slate-700/50 text-blue-300">
                              {Object.values(result.actualBetsUsed)
                                .reduce((sum, bet) => sum + bet, 0)
                                .toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis">
              {finalStats && (
                <div className="grid gap-6">
                  {/* Portfolio Performance Overview */}
                  <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-blue-400" />
                        Portfolio Performance Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">
                            {formatCurrency(STARTING_PORTFOLIO)}
                          </div>
                          <div className="text-sm text-slate-400">
                            Starting Portfolio
                          </div>
                        </div>
                        <div className="text-center">
                          <div
                            className={cn(
                              "text-2xl font-bold",
                              finalStats.finalPortfolio >= STARTING_PORTFOLIO
                                ? "text-green-400"
                                : "text-red-400",
                            )}
                          >
                            {formatCurrency(finalStats.finalPortfolio)}
                          </div>
                          <div className="text-sm text-slate-400">
                            Final Portfolio
                          </div>
                        </div>
                        <div className="text-center">
                          <div
                            className={cn(
                              "text-2xl font-bold",
                              finalStats.portfolioGrowth >= 0
                                ? "text-green-400"
                                : "text-red-400",
                            )}
                          >
                            {finalStats.portfolioGrowth >= 0 ? "+" : ""}
                            {finalStats.portfolioGrowth.toFixed(2)}%
                          </div>
                          <div className="text-sm text-slate-400">
                            Portfolio Growth
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-400">
                            {formatCurrency(finalStats.maxPortfolio)}
                          </div>
                          <div className="text-sm text-slate-400">
                            Peak Portfolio
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Multi-Simulation Tracking */}
                  <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="w-6 h-6 text-green-400" />
                          Multi-Simulation Analysis
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetMultiSimResults}
                            disabled={
                              multiSimResults[selectedStrategy].length === 0
                            }
                            className="text-xs"
                          >
                            Reset Current
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetAllMultiSimResults}
                            disabled={Object.values(multiSimResults).every(
                              (arr) => arr.length === 0,
                            )}
                            className="text-xs"
                          >
                            Reset All
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {/* Current Strategy Multi-Sim Stats */}
                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-green-400 mb-3">
                            {selectedStrategy
                              .replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                            Strategy
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-xl font-bold text-blue-400">
                                {multiSimResults[selectedStrategy].length}
                              </div>
                              <div className="text-sm text-slate-400">
                                Simulations Run
                              </div>
                            </div>
                            <div className="text-center">
                              <div
                                className={cn(
                                  "text-xl font-bold",
                                  calculateRunningAverage(
                                    multiSimResults[selectedStrategy],
                                  ) >= 0
                                    ? "text-green-400"
                                    : "text-red-400",
                                )}
                              >
                                {multiSimResults[selectedStrategy].length > 0
                                  ? `${calculateRunningAverage(multiSimResults[selectedStrategy]) >= 0 ? "+" : ""}${formatCurrency(Math.round(calculateRunningAverage(multiSimResults[selectedStrategy])))}`
                                  : "No Data"}
                              </div>
                              <div className="text-sm text-slate-400">
                                Average Earnings
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-orange-400">
                                {multiSimResults[selectedStrategy].length > 0
                                  ? formatCurrency(
                                      Math.max(
                                        ...multiSimResults[selectedStrategy],
                                      ),
                                    )
                                  : "No Data"}
                              </div>
                              <div className="text-sm text-slate-400">
                                Best Result
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-red-400">
                                {multiSimResults[selectedStrategy].length > 0
                                  ? formatCurrency(
                                      Math.min(
                                        ...multiSimResults[selectedStrategy],
                                      ),
                                    )
                                  : "No Data"}
                              </div>
                              <div className="text-sm text-slate-400">
                                Worst Result
                              </div>
                            </div>
                          </div>

                          {/* Show last few results */}
                          {multiSimResults[selectedStrategy].length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-slate-300 mb-2">
                                Recent Results (
                                {Math.min(
                                  5,
                                  multiSimResults[selectedStrategy].length,
                                )}{" "}
                                of {multiSimResults[selectedStrategy].length}):
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {multiSimResults[selectedStrategy]
                                  .slice(-5)
                                  .map((result, index) => (
                                    <Badge
                                      key={index}
                                      variant={
                                        result >= 0 ? "default" : "destructive"
                                      }
                                      className={cn(
                                        "font-mono",
                                        result >= 0
                                          ? "bg-green-600/20 text-green-300"
                                          : "bg-red-600/20 text-red-300",
                                      )}
                                    >
                                      {result >= 0 ? "+" : ""}
                                      {formatCurrency(result)}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* All Strategies Summary */}
                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-blue-400 mb-3">
                            All Strategies Summary
                          </h4>
                          <div className="grid gap-2">
                            {Object.entries(multiSimResults).map(
                              ([strategy, results]) => (
                                <div
                                  key={strategy}
                                  className="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0"
                                >
                                  <span className="text-slate-300 capitalize">
                                    {strategy
                                      .replace("_", " ")
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                                  </span>
                                  <div className="flex gap-4 text-sm">
                                    <span className="text-slate-400">
                                      {results.length} runs
                                    </span>
                                    <span
                                      className={cn(
                                        "font-mono font-bold",
                                        results.length > 0 &&
                                          calculateRunningAverage(results) >= 0
                                          ? "text-green-400"
                                          : "text-red-400",
                                      )}
                                    >
                                      {results.length > 0
                                        ? `${calculateRunningAverage(results) >= 0 ? "+" : ""}${formatCurrency(Math.round(calculateRunningAverage(results)))}`
                                        : "No Data"}
                                    </span>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Strategy Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>Strategy:</span>
                          <span className="font-mono text-blue-400">
                            {getStrategyName()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Spins:</span>
                          <span className="font-mono">
                            {finalStats.totalSpins}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Win Rate:</span>
                          <span
                            className={cn(
                              "font-mono",
                              finalStats.winRate >= 50
                                ? "text-green-400"
                                : "text-red-400",
                            )}
                          >
                            {finalStats.winRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>ROI:</span>
                          <span
                            className={cn(
                              "font-mono",
                              finalStats.roi >= 0
                                ? "text-green-400"
                                : "text-red-400",
                            )}
                          >
                            {finalStats.roi.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sharpe Ratio:</span>
                          <span
                            className={cn(
                              "font-mono",
                              finalStats.sharpeRatio >= 0
                                ? "text-green-400"
                                : "text-red-400",
                            )}
                          >
                            {finalStats.sharpeRatio.toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          Risk Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>Total Wagered:</span>
                          <span className="font-mono">
                            {formatCurrency(finalStats.totalWagered)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Drawdown:</span>
                          <span className="font-mono text-red-400">
                            {formatCurrency(finalStats.maxDrawdown)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Drawdown %:</span>
                          <span className="font-mono text-red-400">
                            {finalStats.maxDrawdownFromPeak.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Volatility:</span>
                          <span className="font-mono text-yellow-400">
                            {finalStats.volatility.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk/Reward:</span>
                          <span
                            className={cn(
                              "font-mono",
                              Math.abs(
                                finalStats.finalEarnings /
                                  (finalStats.maxDrawdown || 1),
                              ) >= 1
                                ? "text-green-400"
                                : "text-red-400",
                            )}
                          >
                            {Math.abs(
                              finalStats.finalEarnings /
                                (finalStats.maxDrawdown || 1),
                            ).toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-purple-400" />
                          Betting Patterns
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>Max Win Streak:</span>
                          <span className="font-mono text-green-400">
                            {finalStats.maxWinStreak} spins
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Loss Streak:</span>
                          <span className="font-mono text-red-400">
                            {finalStats.maxLossStreak} spins
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Highest Bet:</span>
                          <span className="font-mono text-orange-400">
                            {Math.max(
                              ...Object.values(finalStats.maxBets),
                            ).toLocaleString()}{" "}
                            Dhs
                          </span>
                        </div>
                        {selectedStrategy === "zapping" && (
                          <div className="flex justify-between">
                            <span>Final Zap Pos:</span>
                            <span className="font-mono text-purple-400">
                              {
                                results[results.length - 1].zappingState
                                  ?.zapPosition
                              }
                            </span>
                          </div>
                        )}
                        <div className="text-xs text-slate-500 mt-2">
                          Parameters: {Object.keys(finalStats.maxBets).length}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Bet Analysis */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle>Maximum Bet Sizes by Parameter</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {Object.entries(finalStats.maxBets).map(
                          ([key, maxBet]) => (
                            <div
                              key={key}
                              className="bg-slate-700/30 p-3 rounded-lg text-center"
                            >
                              <div className="text-sm text-slate-400 capitalize mb-1">
                                {key}
                              </div>
                              <div className="font-mono text-lg font-bold text-orange-400">
                                {maxBet?.toLocaleString() || "0"} Dhs
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Realistic Streak Analysis */}
                  {streakAnalysis && (
                    <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-6 h-6 text-yellow-400" />
                          🎲 Realistic Streak Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-slate-800/50 p-4 rounded-lg">
                            <h4 className="font-semibold text-red-400 mb-3">
                              Longest Color Streak
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-slate-300">Color:</span>
                                <span
                                  className={cn(
                                    "font-bold capitalize",
                                    streakAnalysis.longestColorStreak.color ===
                                      "red"
                                      ? "text-red-400"
                                      : "text-gray-300",
                                  )}
                                >
                                  {streakAnalysis.longestColorStreak.color ||
                                    "None"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-300">Length:</span>
                                <span className="font-bold text-yellow-400">
                                  {streakAnalysis.longestColorStreak.length}{" "}
                                  consecutive
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-300">
                                  Started at Spin:
                                </span>
                                <span className="font-mono text-blue-400">
                                  #
                                  {streakAnalysis.longestColorStreak
                                    .startIndex + 1}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-800/50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-400 mb-3">
                              Streak Statistics
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-slate-300">
                                  Streaks &gt; 5:
                                </span>
                                <span className="font-bold text-orange-400">
                                  {streakAnalysis.totalStreaksOver5}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-300">
                                  Streaks &gt; 10:
                                </span>
                                <span className="font-bold text-red-400">
                                  {streakAnalysis.totalStreaksOver10}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-300">
                                  Max Expected:
                                </span>
                                <span className="font-mono text-green-400">
                                  {
                                    REALISTIC_ROULETTE_CONFIG.max_expected_streak_length
                                  }
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-800/50 p-4 rounded-lg">
                            <h4 className="font-semibold text-purple-400 mb-3">
                              Risk Assessment
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-slate-300">
                                  Streak Severity:
                                </span>
                                <span
                                  className={cn(
                                    "font-bold",
                                    streakAnalysis.longestColorStreak.length >
                                      10
                                      ? "text-red-400"
                                      : streakAnalysis.longestColorStreak
                                            .length > 7
                                        ? "text-yellow-400"
                                        : "text-green-400",
                                  )}
                                >
                                  {streakAnalysis.longestColorStreak.length > 10
                                    ? "HIGH"
                                    : streakAnalysis.longestColorStreak.length >
                                        7
                                      ? "MEDIUM"
                                      : "LOW"}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 mt-2">
                                {streakAnalysis.longestColorStreak.length >
                                  12 && (
                                  <div className="text-red-300">
                                    ⚠️ Extreme streak detected! This tests true
                                    strategy resilience.
                                  </div>
                                )}
                                {streakAnalysis.longestColorStreak.length >=
                                  8 &&
                                  streakAnalysis.longestColorStreak.length <=
                                    12 && (
                                    <div className="text-yellow-300">
                                      🔥 Significant streak observed - realistic
                                      casino behavior.
                                    </div>
                                  )}
                                {streakAnalysis.longestColorStreak.length <
                                  8 && (
                                  <div className="text-green-300">
                                    ✅ Normal variance pattern - balanced
                                    simulation.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                          <h4 className="font-semibold text-blue-400 mb-2">
                            🔬 Real-World Impact Analysis
                          </h4>
                          <div className="text-sm text-blue-200 space-y-1">
                            <p>
                              • <strong>Strategy Testing:</strong> Your chosen
                              strategy has been tested against realistic casino
                              conditions
                            </p>
                            <p>
                              • <strong>Bankroll Requirements:</strong> Results
                              include stress-testing from natural streak
                              variance
                            </p>
                            <p>
                              • <strong>Risk Validation:</strong> Portfolio
                              drawdowns reflect true randomness, not artificial
                              balance
                            </p>
                            <p>
                              • <strong>Confidence Level:</strong> Performance
                              metrics are based on authentic roulette behavior
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Strategy Comparison */}
                  {(compoundMartingaleResults.length > 0 ||
                    maxLoseResults.length > 0 ||
                    zappingResults.length > 0 ||
                    safeCompoundMartingaleResults.length > 0 ||
                    samPlusResults.length > 0 ||
                    standardMartingaleResults.length > 0) && (
                    <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-500/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-6 h-6 text-green-400" />
                          Strategy Comparison Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-600">
                                <th className="text-left p-2">Metric</th>
                                {compoundMartingaleResults.length > 0 && (
                                  <th className="text-center p-2 text-green-400">
                                    Compound Martingale
                                  </th>
                                )}
                                {maxLoseResults.length > 0 && (
                                  <th className="text-center p-2 text-red-400">
                                    Max Lose
                                  </th>
                                )}
                                {zappingResults.length > 0 && (
                                  <th className="text-center p-2 text-purple-400">
                                    Zapping
                                  </th>
                                )}
                                {safeCompoundMartingaleResults.length > 0 && (
                                  <th className="text-center p-2 text-blue-400">
                                    Safe Compound
                                  </th>
                                )}
                              </tr>
                            </thead>
                            <tbody className="space-y-2">
                              {[
                                {
                                  label: "Final Portfolio",
                                  getValue: (results: SpinResult[]) =>
                                    formatCurrency(
                                      STARTING_PORTFOLIO +
                                        results[results.length - 1]
                                          ?.cumulativeEarnings || 0,
                                    ),
                                },
                                {
                                  label: "Portfolio Growth %",
                                  getValue: (results: SpinResult[]) => {
                                    const final =
                                      STARTING_PORTFOLIO +
                                      (results[results.length - 1]
                                        ?.cumulativeEarnings || 0);
                                    return `${((final / STARTING_PORTFOLIO - 1) * 100).toFixed(2)}%`;
                                  },
                                },
                                {
                                  label: "Total Earnings",
                                  getValue: (results: SpinResult[]) =>
                                    formatCurrency(
                                      results[results.length - 1]
                                        ?.cumulativeEarnings || 0,
                                    ),
                                },
                                {
                                  label: "Win Rate %",
                                  getValue: (results: SpinResult[]) => {
                                    const winningSpins = results.filter(
                                      (r) => r.spinNetResult > 0,
                                    ).length;
                                    return `${((winningSpins / results.length) * 100).toFixed(1)}%`;
                                  },
                                },
                                {
                                  label: "Max Drawdown",
                                  getValue: (results: SpinResult[]) =>
                                    formatCurrency(
                                      Math.min(
                                        ...results.map(
                                          (r) => r.cumulativeEarnings,
                                        ),
                                      ),
                                    ),
                                },
                                {
                                  label: "Total Wagered",
                                  getValue: (results: SpinResult[]) => {
                                    const total = results.reduce(
                                      (sum, r) =>
                                        sum +
                                        Object.values(r.actualBetsUsed).reduce(
                                          (s, bet) => s + bet,
                                          0,
                                        ),
                                      0,
                                    );
                                    return formatCurrency(total);
                                  },
                                },
                              ].map((metric, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-slate-700/50"
                                >
                                  <td className="p-2 font-medium text-slate-300">
                                    {metric.label}
                                  </td>
                                  {compoundMartingaleResults.length > 0 && (
                                    <td className="p-2 text-center font-mono text-green-300">
                                      {metric.getValue(
                                        compoundMartingaleResults,
                                      )}
                                    </td>
                                  )}
                                  {maxLoseResults.length > 0 && (
                                    <td className="p-2 text-center font-mono text-red-300">
                                      {metric.getValue(maxLoseResults)}
                                    </td>
                                  )}
                                  {zappingResults.length > 0 && (
                                    <td className="p-2 text-center font-mono text-purple-300">
                                      {metric.getValue(zappingResults)}
                                    </td>
                                  )}
                                  {safeCompoundMartingaleResults.length > 0 && (
                                    <td className="p-2 text-center font-mono text-blue-300">
                                      {metric.getValue(
                                        safeCompoundMartingaleResults,
                                      )}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
                          <h4 className="font-semibold text-white mb-2">
                            🎯 Strategic Insights
                          </h4>
                          <div className="text-sm text-slate-300 space-y-1">
                            <p>
                              • <strong>Compound Martingale:</strong>{" "}
                              Diversified approach with multiple betting
                              parameters, potentially more stable
                            </p>
                            <p>
                              • <strong>Max Lose Strategy:</strong> Built-in
                              risk management with 5-loss resets, may limit
                              extreme losses
                            </p>
                            <p>
                              • <strong>Zapping Strategy:</strong> Simple
                              alternating approach, higher volatility but
                              potentially faster recovery
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {results.length === 0 && (
          <Card className="bg-slate-800/50 border-slate-700 text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  Ready to Simulate
                </h3>
                <p>
                  Select a strategy above and click "Run 500-Spin Simulation" to
                  begin analysis
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Authentication Dialog */}
        <AuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          defaultTab={authDialogTab}
        />

        {/* Strategy Explanation Modal */}
        <StrategyExplanationModal
          strategy={strategyToExplain}
          open={showStrategyExplanation}
          onOpenChange={(open) => {
            setShowStrategyExplanation(open);
            if (!open) {
              // When modal closes, select the strategy that was explained
              setSelectedStrategy(strategyToExplain);
              setResults([]);
            }
          }}
        />
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-700 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Branding */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-green-400 to-emerald-400 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">RoSiStrat</h3>
                  <p className="text-sm text-slate-400">Educational Platform</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Advanced European Roulette Strategy Simulator for educational
                and research purposes. Learn probability, risk management, and
                betting system mathematics.
              </p>
              <div className="flex gap-3">
                <Badge
                  variant="outline"
                  className="text-green-400 border-green-400"
                >
                  100% Educational
                </Badge>
                <Badge
                  variant="outline"
                  className="text-blue-400 border-blue-400"
                >
                  No Real Money
                </Badge>
              </div>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Legal & Information
              </h4>
              <div className="space-y-2">
                <a
                  href="/about"
                  className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors"
                >
                  <User className="w-4 h-4" />
                  About the Creator
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="/privacy"
                  className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Privacy Policy
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="/terms"
                  className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Terms of Use
                  <ExternalLink className="w-3 h-3" />
                </a>
                <div className="flex items-center gap-2 text-slate-400">
                  <Cookie className="w-4 h-4" />
                  <span>Cookie Policy: </span>
                  <Badge
                    variant={analyticsConsent ? "default" : "outline"}
                    className="text-xs"
                  >
                    {analyticsConsent ? "Analytics Enabled" : "Essential Only"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Responsible Gaming */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Responsible Gaming
              </h4>
              <div className="space-y-2 text-sm">
                <div className="bg-amber-950/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-semibold">18+ Only</span>
                  </div>
                  <p className="text-amber-200 text-xs">
                    This platform is for educational purposes only. Real
                    gambling can be addictive and harmful.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs">
                    Gambling Addiction Support:
                  </p>
                  <a
                    href="https://www.gamcare.org.uk/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-xs flex items-center gap-1"
                  >
                    GamCare.org.uk <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://www.gamblingtherapy.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-xs flex items-center gap-1"
                  >
                    GamblingTherapy.org <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-slate-400">
                © {new Date().getFullYear()} RoSiStrat. All rights reserved.
                Educational simulation platform - No real money gambling.
              </div>
              <div className="text-sm text-center md:text-left">
                <p className="text-slate-300">
                  Made with ❤️ by{" "}
                  <strong className="text-green-400">Jadiss EL ANTAKI</strong>
                </p>
                <p className="text-xs text-slate-500">
                  For educational use only. RoSiStrat does not promote or
                  provide real-money gambling.
                </p>
                <div className="mt-2">
                  <button
                    onClick={() =>
                      window.open(
                        "https://paypal.me/JadissEL?country.x=GR&locale.x=en_US",
                        "_blank",
                      )
                    }
                    className="text-yellow-400 hover:text-yellow-300 text-xs flex items-center gap-1 mx-auto md:mx-0"
                  >
                    <Heart className="w-3 h-3" />
                    Support this project
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>Version 2.0</span>
                <span>•</span>
                <span>Updated {new Date().toLocaleDateString()}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {currentUser ? (
                    <>
                      <User className="w-3 h-3" />
                      Signed In
                    </>
                  ) : (
                    <>
                      <Shield className="w-3 h-3" />
                      Guest Mode
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeStrategy={selectedStrategy}
        onShowAuthDialog={(tab) => {
          setAuthDialogTab(tab);
          setShowAuthDialog(true);
        }}
        onShowUserDashboard={() => setShowUserDashboard(!showUserDashboard)}
        showUserDashboard={showUserDashboard}
      />

      {/* Bottom padding for mobile navigation */}
      <div className="h-16 sm:h-0"></div>
    </div>
  );
};

export default Index;

// PWA Install Prompt is included in the main Index component
