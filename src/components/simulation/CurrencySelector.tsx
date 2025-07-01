import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Globe } from "lucide-react";

interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SAR", symbol: "﷼ ", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham", flag: "🇲🇦" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
];

interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

export function CurrencySelector({
  selectedCurrency,
  onCurrencyChange,
}: CurrencySelectorProps) {
  const selectedCurrencyInfo = CURRENCIES.find(
    (c) => c.code === selectedCurrency,
  );

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-400" />
          Currency Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">Current Currency:</div>
          <Badge
            variant="outline"
            className="text-purple-400 border-purple-400"
          >
            {selectedCurrencyInfo?.flag} {selectedCurrencyInfo?.symbol}{" "}
            {selectedCurrencyInfo?.name}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {CURRENCIES.map((currency) => (
            <Button
              key={currency.code}
              onClick={() => onCurrencyChange(currency.code)}
              variant={
                selectedCurrency === currency.code ? "default" : "outline"
              }
              size="sm"
              className={`flex items-center gap-2 ${
                selectedCurrency === currency.code
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "hover:bg-slate-700"
              }`}
            >
              <span>{currency.flag}</span>
              <span className="font-mono text-xs">{currency.symbol}</span>
              <span className="text-xs">{currency.code}</span>
            </Button>
          ))}
        </div>

        <div className="text-xs text-slate-500 bg-slate-800/50 p-3 rounded">
          <DollarSign className="w-4 h-4 inline mr-1" />
          <strong>Note:</strong> All amounts are virtual currency for
          educational purposes only. Currency selection affects display
          formatting only.
        </div>
      </CardContent>
    </Card>
  );
}

// Export currency utilities
export function formatCurrency(value: number, currencyCode: string): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  if (!currency) return value.toLocaleString();

  return `${currency.symbol}${value.toLocaleString()}`;
}

export { CURRENCIES };
