import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AnomalyData {
  range: string;
  count: number;
  percentage: number;
}

const AnomalyScoreChart = () => {
  const [data, setData] = useState<AnomalyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    avgScore: 0,
    maxScore: 0,
    minScore: 0,
  });

  useEffect(() => {
    const fetchAnomalyData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch anomaly scores from Supabase
        const { data: transactions, error: fetchError } = await supabase
          .from("transactions")
          .select("anomaly_score");

        if (fetchError) throw fetchError;

        // Extract anomaly scores
        const scores = transactions
          ?.map((txn: any) => txn.anomaly_score || 0)
          .filter((score) => score !== null) as number[];

        if (!scores || scores.length === 0) {
          setData([]);
          setStats({ avgScore: 0, maxScore: 0, minScore: 0 });
          setIsLoading(false);
          return;
        }

        // Create score ranges (0-0.2, 0.2-0.4, 0.4-0.6, 0.6-0.8, 0.8-1.0)
        const ranges = [
          { label: "0.0-0.2", min: 0, max: 0.2 },
          { label: "0.2-0.4", min: 0.2, max: 0.4 },
          { label: "0.4-0.6", min: 0.4, max: 0.6 },
          { label: "0.6-0.8", min: 0.6, max: 0.8 },
          { label: "0.8-1.0", min: 0.8, max: 1.0 },
        ];

        const chartData: AnomalyData[] = ranges.map((range) => {
          const count = scores.filter(
            (score) => score >= range.min && score < range.max
          ).length;
          return {
            range: range.label,
            count,
            percentage: (count / scores.length) * 100,
          };
        });

        // Calculate stats
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);

        setData(chartData);
        setStats({
          avgScore: parseFloat(avgScore.toFixed(3)),
          maxScore: parseFloat(maxScore.toFixed(3)),
          minScore: parseFloat(minScore.toFixed(3)),
        });
      } catch (err: any) {
        console.error("Error fetching anomaly data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnomalyData();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel("transactions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
        },
        () => {
          fetchAnomalyData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center justify-center h-80">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card p-6 rounded-xl border shadow-sm">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  const getBarColor = (count: number, maxCount: number) => {
    const ratio = count / (maxCount || 1);
    if (ratio === 0) return "#d1d5db";
    if (ratio < 0.33) return "#10b981";
    if (ratio < 0.66) return "#f59e0b";
    return "#ef4444";
  };

  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        Anomaly Score Distribution
      </h3>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip
            formatter={(value) => [value, "Count"]}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.count, maxCount)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Average Score</p>
          <p className="text-2xl font-bold text-foreground">
            {stats.avgScore}
          </p>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Max Score</p>
          <p className="text-2xl font-bold text-foreground text-red-500">
            {stats.maxScore}
          </p>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Min Score</p>
          <p className="text-2xl font-bold text-foreground text-green-500">
            {stats.minScore}
          </p>
        </div>
      </div>

      {/* Score Range Legend */}
      <div className="mt-6 text-sm text-muted-foreground">
        <p className="font-medium mb-2 text-foreground">Score Range Guide:</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>0.0-0.4: Low Risk (Normal)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>0.4-0.7: Medium Risk (Anomaly)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>0.7-1.0: High Risk (Likely Fraud)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyScoreChart;
