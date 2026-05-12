import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface TransactionData {
  date: string;
  total: number;
  fraud: number;
  normal: number;
}

const TransactionChart = () => {
  const [data, setData] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all transactions from Supabase
        const { data: transactions, error: fetchError } = await supabase
          .from("transactions")
          .select("created_at, fraud_status")
          .order("created_at", { ascending: true });

        if (fetchError) throw fetchError;

        // Group transactions by date
        const groupedData: Record<string, { total: number; fraud: number; normal: number }> = {};

        transactions?.forEach((txn: any) => {
          const date = new Date(txn.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          if (!groupedData[date]) {
            groupedData[date] = { total: 0, fraud: 0, normal: 0 };
          }

          groupedData[date].total += 1;

          if (txn.fraud_status === "fraud") {
            groupedData[date].fraud += 1;
          } else {
            groupedData[date].normal += 1;
          }
        });

        // Convert to array format for recharts
        const chartData: TransactionData[] = Object.entries(groupedData).map(
          ([date, counts]) => ({
            date,
            ...counts,
          })
        );

        setData(chartData);
      } catch (err: any) {
        console.error("Error fetching transaction data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionData();

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
          // Refetch data when changes occur
          fetchTransactionData();
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
        Transaction Trends
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Total Transactions"
            dot={{ fill: "#3b82f6", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="fraud"
            stroke="#ef4444"
            strokeWidth={2}
            name="Fraud Cases"
            dot={{ fill: "#ef4444", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="normal"
            stroke="#10b981"
            strokeWidth={2}
            name="Normal Transactions"
            dot={{ fill: "#10b981", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionChart;
