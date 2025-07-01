import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { SpinResult, getRouletteNumber } from "@/lib/rouletteUtils";
import { cn } from "@/lib/utils";

interface SimulationDataTableProps {
  results: SpinResult[];
  maxRows?: number;
}

export function SimulationDataTable({
  results,
  maxRows = 50,
}: SimulationDataTableProps) {
  const displayResults = useMemo(() => {
    return results.slice(0, maxRows);
  }, [results, maxRows]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getNumberBadge = (number: number) => {
    const rouletteNumber = getRouletteNumber(number);
    const colorClass =
      rouletteNumber.color === "red"
        ? "roulette-red"
        : rouletteNumber.color === "black"
          ? "roulette-black"
          : "roulette-green";

    return <div className={cn("roulette-number", colorClass)}>{number}</div>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Simulation Results</span>
          <Badge variant="secondary">
            Showing {displayResults.length} of {results.length} spins
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
                <TableHead className="text-right">Net Result</TableHead>
                <TableHead className="text-right">Cumulative</TableHead>
                <TableHead className="text-right">Bet on 0</TableHead>
                <TableHead className="text-right">Bet 1-12</TableHead>
                <TableHead className="text-right">Bet 13-24</TableHead>
                <TableHead className="text-right">Bet Black</TableHead>
                <TableHead className="text-right">Bet Even</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayResults.map((result) => (
                <TableRow key={result.spin} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{result.spin}</TableCell>
                  <TableCell>{getNumberBadge(result.drawnNumber)}</TableCell>
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
                  <TableCell className="text-right font-mono text-sm">
                    {result.strategies.zero.currentBet}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {result.strategies.firstDozen.currentBet}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {result.strategies.secondDozen.currentBet}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {result.strategies.black.currentBet}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {result.strategies.even.currentBet}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
