import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { SimulationService } from "@/services/simulationService";
import {
  formatCurrency,
  CURRENCIES,
} from "@/components/simulation/CurrencySelector";
import { DollarSign, Wallet } from "lucide-react";

interface StartingInvestmentInputProps {
  value: number;
  onChange: (amount: number) => void;
  selectedCurrency: string;
  disabled?: boolean;
}

export function StartingInvestmentInput({
  value,
  onChange,
  selectedCurrency,
  disabled,
}: StartingInvestmentInputProps) {
  const { currentUser, updateStartingInvestment } = useAuth();
  const [inputValue, setInputValue] = useState(value.toString());
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const validateAmount = (amount: number): boolean => {
    return amount >= 1000 && amount <= 1000000; // Between 1,000 and 1,000,000 in selected currency
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const numericValue = parseInt(newValue.replace(/,/g, ""));
    if (!isNaN(numericValue)) {
      setIsValid(validateAmount(numericValue));
    } else {
      setIsValid(false);
    }
  };

  const handleApply = async () => {
    const numericValue = parseInt(inputValue.replace(/,/g, ""));

    if (isNaN(numericValue) || !validateAmount(numericValue)) {
      setIsValid(false);
      return;
    }

    onChange(numericValue);

    // Save to appropriate storage
    if (currentUser) {
      await updateStartingInvestment(numericValue);
    } else {
      SimulationService.updateLocalStartingInvestment(numericValue);
    }
  };

  const formatNumber = (num: number): string => {
    return formatCurrency(num, selectedCurrency);
  };

  const getCurrencySymbol = (): string => {
    const currency = CURRENCIES.find((c) => c.code === selectedCurrency);
    return currency?.symbol || "$";
  };

  const presetAmounts = [5000, 10000, 25000, 50000, 100000];

  return (
    <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-green-400" />
          Starting Investment Amount
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="starting-investment">
              Investment Amount ({selectedCurrency})
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-3 h-4 w-4 flex items-center justify-center text-gray-400 text-xs font-bold">
                {getCurrencySymbol()}
              </div>
              <Input
                id="starting-investment"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                disabled={disabled}
                className={`pl-10 ${!isValid ? "border-red-500" : ""}`}
                placeholder="Enter amount (1,000 - 1,000,000)"
              />
            </div>
            {!isValid && (
              <p className="text-sm text-red-500">
                Amount must be between 1,000 and 1,000,000 {selectedCurrency}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Quick Presets</Label>
            <div className="grid grid-cols-3 gap-1">
              {presetAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={() => {
                    setInputValue(amount.toString());
                    setIsValid(true);
                  }}
                  className="text-xs"
                >
                  {formatNumber(amount)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <p>
              Current:{" "}
              <span className="font-bold text-green-400">
                {formatNumber(value)}
              </span>
            </p>
            {currentUser ? (
              <p className="text-xs">Saved to your account</p>
            ) : (
              <p className="text-xs">Saved locally for this session</p>
            )}
          </div>

          <Button
            onClick={handleApply}
            disabled={disabled || !isValid || inputValue === value.toString()}
            className="bg-green-600 hover:bg-green-700"
          >
            Apply Amount
          </Button>
        </div>

        <div className="rounded-lg bg-blue-950/50 p-3 text-sm">
          <h4 className="font-medium text-blue-300 mb-1">
            Investment Guidelines:
          </h4>
          <ul className="space-y-1 text-blue-200 text-xs">
            <li>• Higher amounts allow for more resilient strategies</li>
            <li>• Lower amounts increase risk but show strategy limits</li>
            <li>
              • Recommended: 10,000 - 50,000 {selectedCurrency} for balanced
              testing
            </li>
            <li>• All amounts are virtual - no real money involved</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
