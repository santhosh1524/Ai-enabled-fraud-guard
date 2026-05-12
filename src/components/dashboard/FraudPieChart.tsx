import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface FraudData {
  name: string;
  value: number;
  percentage: number;
}

const COLORS = {
  fraud: "#ef4444",      // Red
  normal: "#10b981",     // Green
  anomaly: "#f59e0b",    // Amber
};

const FraudPieChart = () => {
  const [data, setData] = useState<FraudData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFraudData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch fraud status counts from Supabase
        const { data: transactions, error: fetchError } = await supabase
          .from("transactions")
          .select("fraud_status");

        if (fetchError) throw fetchError;

        // Count fraud statuses
        const counts = {
          fraud: 0,
          normal: 0,
          anomaly: 0,
        };

        transactions?.forEach((txn: any) => {
          const status = txn.fraud_status || "normal";
          counts[status as keyof typeof counts] =
            (counts[status as keyof typeof counts] || 0) + 1;
        });

        const total = Object.values(counts).reduce((a, b) => a + b, 0);

        const chartData: FraudData[] = [
          {
            name: "Fraud",
            value: counts.fraud,
            percentage: total > 0 ? (counts.fraud / total) * 100 : 0,
          },
          {
            name: "Normal",
            value: counts.normal,
            percentage: total > 0 ? (counts.normal / total) * 100 : 0,
          },
          {
            name: "Anomaly",
            value: counts.anomaly,
            percentage: total > 0 ? (counts.anomaly / total) * 100 : 0,
          },
        ];

        setData(chartData);
      } catch (err: any) {
        console.error("Error fetching fraud data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFraudData();

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
          fetchFraudData();
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

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        Fraud Status Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) =>
              `${name}: ${percentage.toFixed(1)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            <Cell fill={COLORS.fraud} />
            <Cell fill={COLORS.normal} />
            <Cell fill={COLORS.anomaly} />
          </Pie>
          <Tooltip
            formatter={(value) => [value, "Count"]}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {data.map((item) => (
          <div key={item.name} className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">{item.name}</p>
            <p className="text-2xl font-bold text-foreground">{item.value}</p>
            <p className="text-xs text-muted-foreground">
              {item.percentage.toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FraudPieChart;
