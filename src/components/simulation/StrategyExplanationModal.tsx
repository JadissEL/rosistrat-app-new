import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target,
  Zap,
  Shield,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Home,
} from "lucide-react";

type StrategyType =
  | "compound_martingale"
  | "max_lose"
  | "zapping"
  | "safe_compound_martingale"
  | "sam_plus"
  | "standard_martingale";

interface StrategyExplanationModalProps {
  strategy: StrategyType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STRATEGY_INFO = {
  compound_martingale: {
    title: "🏛️ Compound Martingale Strategy",
    icon: Home,
    color: "green",
    riskLevel: "High",
    complexity: "Intermediate",
    description:
      "Classic 5-strategy Martingale approach targeting Number 0, 1st Dozen, 2nd Dozen, Black, and Even with traditional doubling progression.",
    howItWorks: [
      "Place simultaneous bets on 5 different parameters",
      "Bet on Number 0 (single number - 35:1 payout)",
      "Bet on 1st Dozen (numbers 1-12 - 2:1 payout)",
      "Bet on 2nd Dozen (numbers 13-24 - 2:1 payout)",
      "Bet on Black color (1:1 payout)",
      "Bet on Even numbers (1:1 payout)",
      "Double all bets after each loss",
      "Reset to base amounts after any win on any parameter",
    ],
    advantages: [
      "Multiple winning opportunities per spin",
      "Diversified risk across different bet types",
      "High coverage of the roulette table",
      "Classic proven multi-parameter approach",
      "Can win on multiple parameters simultaneously",
    ],
    disadvantages: [
      "Very high bankroll requirements",
      "Rapid bet escalation across 5 parameters",
      "Complex tracking of multiple progressions",
      "High risk of catastrophic losses",
    ],
    riskFactors: [
      "Exponential growth across 5 betting lines",
      "Requires massive bankroll for sustainability",
      "Green numbers (0) only win on one parameter",
      "Multiple simultaneous losses compound quickly",
    ],
    bestFor:
      "Experienced players with substantial bankrolls who want comprehensive table coverage and understand high-risk strategies.",
  },
  max_lose: {
    title: "🛑 Max Lose Strategy",
    icon: Target,
    color: "red",
    riskLevel: "Medium",
    complexity: "Beginner",
    description:
      "A conservative approach that automatically resets after 5 consecutive losses to prevent catastrophic losses.",
    howItWorks: [
      "Start with base bet amount on your chosen target",
      "Double the bet amount after each loss",
      "Reset to base bet after any win",
      "Automatic reset after 5 consecutive losses",
      "Bonus: +1 unit added when zero (0) appears",
    ],
    advantages: [
      "Built-in loss protection mechanism",
      "Simple and easy to understand",
      "Prevents runaway betting sequences",
      "Bonus rewards when zero appears",
    ],
    disadvantages: [
      "May miss recovery opportunities after reset",
      "Limited profit potential",
      "Still susceptible to short-term losses",
    ],
    riskFactors: [
      "5 consecutive losses trigger reset",
      "Requires discipline to follow reset rules",
      "Medium bankroll requirements",
    ],
    bestFor:
      "Conservative players who want built-in protection against long losing streaks.",
  },
  zapping: {
    title: "⚡ Zapping Strategy",
    icon: Zap,
    color: "purple",
    riskLevel: "Medium-High",
    complexity: "Intermediate",
    description:
      "Dynamic color-switching system that alternates between Red and Black with Martingale progression.",
    howItWorks: [
      "Start betting on Red with base amount",
      "If Red wins, restart with base bet on Red",
      "If Red loses, double bet and switch to Black",
      "Continue alternating colors and doubling until win",
      "Reset to base bet on Red after any win",
    ],
    advantages: [
      "Covers both major color outcomes",
      "Dynamic switching reduces monotony",
      "Fast recovery potential",
      "Diversified risk across colors",
    ],
    disadvantages: [
      "Higher volatility than single-color betting",
      "Requires larger bankroll for safety",
      "Complex tracking of color switches",
    ],
    riskFactors: [
      "Long alternating color streaks can be costly",
      "Exponential bet growth during losing runs",
      "Requires excellent bankroll management",
    ],
    bestFor:
      "Intermediate players comfortable with dynamic strategies and higher volatility.",
  },
  safe_compound_martingale: {
    title: "🛡️ Safe Compound Martingale",
    icon: Shield,
    color: "blue",
    riskLevel: "Low-Medium",
    complexity: "Intermediate",
    description:
      "Advanced capital protection system with configurable safety ratios that pause bets when portfolio falls below safety thresholds.",
    howItWorks: [
      "Set safety ratio (5×, 6×, 8×, or 10× next bet amount)",
      "Place bets normally with Martingale progression",
      "Monitor portfolio vs. next bet amount ratio",
      "Pause betting when portfolio < safety ratio × next bet",
      "Resume when portfolio recovers to safe levels",
    ],
    advantages: [
      "Maximum capital protection",
      "Configurable risk tolerance",
      "Prevents catastrophic losses",
      "Intelligent pause/resume mechanism",
    ],
    disadvantages: [
      "May pause during recovery opportunities",
      "Slower profit accumulation",
      "Complex monitoring required",
    ],
    riskFactors: [
      "Conservative approach may limit gains",
      "Requires larger starting bankroll",
      "Safety ratio selection affects performance",
    ],
    bestFor:
      "Risk-averse players who prioritize capital preservation over maximum profits.",
  },
  sam_plus: {
    title: "🧠 Smart Adaptive Martingale Plus (SAM+)",
    icon: Brain,
    color: "green",
    riskLevel: "High",
    complexity: "Advanced",
    description:
      "Sophisticated algorithmic system featuring Kelly criterion betting, dynamic risk management, and Markov switching.",
    howItWorks: [
      "Calculate optimal bet sizes using Kelly criterion",
      "Adjust risk tolerance based on portfolio volatility",
      "Use Markov switching for intelligent color selection",
      "Monitor real-time performance metrics",
      "Adapt strategy parameters dynamically",
    ],
    advantages: [
      "Mathematically optimized betting",
      "Self-adapting to market conditions",
      "Advanced risk management",
      "Multiple optimization algorithms",
    ],
    disadvantages: [
      "High complexity requires understanding",
      "Can be volatile during adaptation",
      "Requires significant bankroll",
    ],
    riskFactors: [
      "Advanced algorithms may be unpredictable",
      "High volatility during learning phase",
      "Requires deep understanding of parameters",
    ],
    bestFor:
      "Advanced players with mathematical background who want cutting-edge strategy optimization.",
  },
  standard_martingale: {
    title: "🔴 Standard Martingale (Red)",
    icon: TrendingUp,
    color: "red",
    riskLevel: "High",
    complexity: "Beginner",
    description:
      "Pure implementation of the classic Martingale system exclusively on Red color with simple doubling logic.",
    howItWorks: [
      "Place base bet amount exclusively on Red",
      "Double bet amount after each loss",
      "Reset to base bet after any win",
      "Continue until win or bankroll exhaustion",
      "Simple, pure Martingale progression",
    ],
    advantages: [
      "Mathematically simple and pure",
      "Easy to understand and implement",
      "Fast recovery when successful",
      "Classic proven system",
    ],
    disadvantages: [
      "High risk of rapid bankroll depletion",
      "No built-in protection mechanisms",
      "Vulnerable to long Red/Black streaks",
    ],
    riskFactors: [
      "Exponential bet growth can be dangerous",
      "No safety net or reset mechanism",
      "Requires large bankroll for safety",
    ],
    bestFor:
      "Experienced players who understand the risks and want to test the classic Martingale in its pure form.",
  },
};

export function StrategyExplanationModal({
  strategy,
  open,
  onOpenChange,
}: StrategyExplanationModalProps) {
  const info = STRATEGY_INFO[strategy];
  const Icon = info.icon;

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Low-Medium":
        return "text-yellow-400";
      case "Medium":
        return "text-orange-400";
      case "Medium-High":
        return "text-red-400";
      case "High":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const getComplexityColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "text-green-400";
      case "Intermediate":
        return "text-yellow-400";
      case "Advanced":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Icon className={`w-8 h-8 text-${info.color}-400`} />
            {info.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {info.description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {/* Strategy Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold">Risk Level</span>
              </div>
              <Badge
                variant="outline"
                className={`${getRiskColor(info.riskLevel)} border-current`}
              >
                {info.riskLevel}
              </Badge>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-blue-400" />
                <span className="font-semibold">Complexity</span>
              </div>
              <Badge
                variant="outline"
                className={`${getComplexityColor(info.complexity)} border-current`}
              >
                {info.complexity}
              </Badge>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-blue-950/30 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              How It Works
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              {info.howItWorks.map((step, index) => (
                <li key={index} className="text-blue-200">
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Advantages & Disadvantages */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-950/30 p-4 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Advantages
              </h4>
              <ul className="space-y-2 text-sm">
                {info.advantages.map((advantage, index) => (
                  <li
                    key={index}
                    className="text-green-200 flex items-start gap-2"
                  >
                    <span className="text-green-400 mt-1">•</span>
                    {advantage}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-950/30 p-4 rounded-lg">
              <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Disadvantages
              </h4>
              <ul className="space-y-2 text-sm">
                {info.disadvantages.map((disadvantage, index) => (
                  <li
                    key={index}
                    className="text-red-200 flex items-start gap-2"
                  >
                    <span className="text-red-400 mt-1">•</span>
                    {disadvantage}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="bg-amber-950/30 p-4 rounded-lg">
            <h4 className="font-semibold text-amber-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Risk Factors
            </h4>
            <ul className="space-y-2 text-sm">
              {info.riskFactors.map((risk, index) => (
                <li
                  key={index}
                  className="text-amber-200 flex items-start gap-2"
                >
                  <span className="text-amber-400 mt-1">⚠️</span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>

          {/* Best For */}
          <div className="bg-purple-950/30 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-400 mb-2">
              Best Suited For:
            </h4>
            <p className="text-purple-200 text-sm">{info.bestFor}</p>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => onOpenChange(false)}
              className={`bg-${info.color}-600 hover:bg-${info.color}-700`}
            >
              Got it! Let's simulate this strategy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
