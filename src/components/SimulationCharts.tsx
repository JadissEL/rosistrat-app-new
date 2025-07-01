import React from "react";
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpinResult, calculateFrequencyData } from "@/lib/rouletteUtils";

interface SimulationChartsProps {
  results: SpinResult[];
}

export function SimulationCharts({ results }: SimulationChartsProps) {
  // Prepare data for cumulative earnings chart
  const cumulativeData = results.map((result) => ({
    spin: result.spin,
    earnings: result.cumulativeEarnings,
  }));

  // Prepare data for bet progression chart
  const betProgressionData = results.map((result) => ({
    spin: result.spin,
    zero: result.strategies.zero.currentBet,
    firstDozen: result.strategies.firstDozen.currentBet,
    secondDozen: result.strategies.secondDozen.currentBet,
    black: result.strategies.black.currentBet,
    even: result.strategies.even.currentBet,
  }));

  // Prepare frequency data
  const frequencyData = calculateFrequencyData(results);

  const cumulativeConfig: ChartConfig = {
    earnings: {
      label: "Cumulative Earnings",
      color: "hsl(var(--primary))",
    },
  };

  const betProgressionConfig: ChartConfig = {
    zero: {
      label: "Number 0",
      color: "hsl(var(--casino-green))",
    },
    firstDozen: {
      label: "1st Dozen (1-12)",
      color: "#3b82f6",
    },
    secondDozen: {
      label: "2nd Dozen (13-24)",
      color: "#8b5cf6",
    },
    black: {
      label: "Black",
      color: "#374151",
    },
    even: {
      label: "Even",
      color: "#f59e0b",
    },
  };

  const frequencyConfig: ChartConfig = {
    count: {
      label: "Frequency",
      color: "hsl(var(--primary))",
    },
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{`Spin ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const FrequencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = frequencyData.find((d) => d.number === parseInt(label));
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{`Number ${label}`}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            {`Count: ${payload[0].value}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {`Percentage: ${data?.percentage.toFixed(1)}%`}
          </p>
          <p className="text-sm text-muted-foreground">
            {`Color: ${data?.color}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-6">
      {/* Cumulative Earnings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Earnings Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={cumulativeConfig}
            className="h-[400px] w-full"
          >
            <LineChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="spin"
                className="text-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                className="text-muted-foreground"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="var(--color-earnings)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Bet Progression Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Bet Progression by Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={betProgressionConfig}
            className="h-[400px] w-full"
          >
            <LineChart data={betProgressionData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="spin"
                className="text-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                className="text-muted-foreground"
                tick={{ fontSize: 12 }}
                scale="log"
                domain={["dataMin", "dataMax"]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="zero"
                stroke="var(--color-zero)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="firstDozen"
                stroke="var(--color-firstDozen)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="secondDozen"
                stroke="var(--color-secondDozen)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="black"
                stroke="var(--color-black)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="even"
                stroke="var(--color-even)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Number Frequency Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Number Frequency Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={frequencyConfig} className="h-[400px] w-full">
            <BarChart data={frequencyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="number"
                className="text-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                className="text-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<FrequencyTooltip />} />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
