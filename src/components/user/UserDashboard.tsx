import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import {
  SimulationService,
  SimulationResult,
} from "@/services/simulationService";
import { formatCurrency as formatCurrencyWithSymbol } from "@/components/simulation/CurrencySelector";
import {
  User,
  Calendar,
  TrendingUp,
  TrendingDown,
  Trash2,
  Download,
  BarChart3,
} from "lucide-react";
import { format } from "date-fns";

export function UserDashboard() {
  const { currentUser, userProfile, logout } = useAuth();
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSimulations();
  }, [currentUser, userProfile]);

  const loadSimulations = async () => {
    if (!currentUser && !userProfile) return;

    try {
      setLoading(true);
      if (currentUser) {
        const userSimulations = await SimulationService.getUserSimulations(
          currentUser.uid,
        );
        setSimulations(userSimulations);
      } else {
        // Load local simulations for demo users
        const localData = SimulationService.getLocalData();
        setSimulations(localData.simulations);
      }
    } catch (error) {
      console.error("Failed to load simulations:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSimulation = async (simulationId: string) => {
    try {
      await SimulationService.deleteSimulation(simulationId);
      setSimulations((prev) => prev.filter((sim) => sim.id !== simulationId));
    } catch (error) {
      console.error("Failed to delete simulation:", error);
    }
  };

  const downloadSimulationData = () => {
    const csvContent = [
      [
        "Strategy",
        "Starting Investment",
        "Final Earnings",
        "Final Portfolio",
        "Total Spins",
        "Date",
      ].join(","),
      ...simulations.map((sim) =>
        [
          sim.strategy,
          sim.startingInvestment,
          sim.finalEarnings,
          sim.finalPortfolio,
          sim.totalSpins,
          format(sim.timestamp, "yyyy-MM-dd HH:mm:ss"),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rosistrat-simulations-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString()} Dhs`;
  };

  const getStrategyName = (strategy: string) => {
    return strategy
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const calculateStats = () => {
    if (simulations.length === 0) return null;

    const totalEarnings = simulations.reduce(
      (sum, sim) => sum + sim.finalEarnings,
      0,
    );
    const averageEarnings = totalEarnings / simulations.length;
    const profitable = simulations.filter((sim) => sim.finalEarnings > 0);
    const winRate = (profitable.length / simulations.length) * 100;

    return {
      totalSimulations: simulations.length,
      averageEarnings,
      winRate,
      totalEarnings,
      bestResult: Math.max(...simulations.map((sim) => sim.finalEarnings)),
      worstResult: Math.min(...simulations.map((sim) => sim.finalEarnings)),
    };
  };

  const stats = calculateStats();

  if (!currentUser && !userProfile) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* User Profile Section */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-6 h-6 text-blue-400" />
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 flex items-center justify-center gap-2">
                {userProfile.displayName}
                {!currentUser && (
                  <Badge variant="secondary" className="text-xs">
                    Demo
                  </Badge>
                )}
              </div>
              <div className="text-sm text-slate-400">Display Name</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {formatCurrencyWithSymbol(
                  userProfile.startingInvestment,
                  "USD",
                )}
              </div>
              <div className="text-sm text-slate-400">Default Investment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {stats?.totalSimulations || 0}
              </div>
              <div className="text-sm text-slate-400">Total Simulations</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400 flex items-center gap-2 justify-center">
                <Calendar className="w-4 h-4" />
                Member since {format(userProfile.createdAt, "MMM dd, yyyy")}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="mt-2"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Section */}
      {stats && (
        <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-green-400" />
              Performance Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    stats.averageEarnings >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {stats.averageEarnings >= 0 ? "+" : ""}
                  {formatCurrency(Math.round(stats.averageEarnings))}
                </div>
                <div className="text-sm text-slate-400">Average Earnings</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    stats.winRate >= 50 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {stats.winRate.toFixed(1)}%
                </div>
                <div className="text-sm text-slate-400">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  +{formatCurrency(stats.bestResult)}
                </div>
                <div className="text-sm text-slate-400">Best Result</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {formatCurrency(stats.worstResult)}
                </div>
                <div className="text-sm text-slate-400">Worst Result</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simulations History */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Simulation History</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSimulationData}
                disabled={simulations.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-slate-400">Loading simulations...</div>
            </div>
          ) : simulations.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-400">
                No simulations yet. Run your first simulation to see results
                here!
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Investment</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Final Portfolio</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {simulations.map((simulation) => (
                    <TableRow key={simulation.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {getStrategyName(simulation.strategy)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(simulation.startingInvestment)}
                      </TableCell>
                      <TableCell className="font-mono">
                        <div className="flex items-center gap-2">
                          {simulation.finalEarnings >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                          <span
                            className={
                              simulation.finalEarnings >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {simulation.finalEarnings >= 0 ? "+" : ""}
                            {formatCurrency(simulation.finalEarnings)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(simulation.finalPortfolio)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-400">
                        {format(simulation.timestamp, "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSimulation(simulation.id!)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
