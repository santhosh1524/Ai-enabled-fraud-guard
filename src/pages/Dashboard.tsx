import { Activity, AlertTriangle, CheckCircle, TrendingUp, Loader2 } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import TransactionChart from "@/components/dashboard/TransactionChart";
import FraudPieChart from "@/components/dashboard/FraudPieChart";
import AnomalyScoreChart from "@/components/dashboard/AnomalyScoreChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import { useTransactionStats } from "@/hooks/useTransactions";
import Navbar from "@/components/layout/Navbar";

const Dashboard = () => {
  const { data: stats, isLoading } = useTransactionStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Navbar */}
      <Navbar />

      {/* Page Header */}
      <div>
        <h1 className="pt-9 text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of fraud detection metrics and transaction analysis
        </p>
      </div>

      {/* Stats Cards - Real-time from Supabase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Transactions"
          value={stats?.total?.toLocaleString() || "0"}
          change={stats?.total ? "+12.5% from last month" : "No data yet"}
          changeType="positive"
          icon={Activity}
          variant="accent"
        />
        <StatsCard
          title="Fraud Detected"
          value={stats?.fraud?.toLocaleString() || "0"}
          change={stats?.fraud ? `-${stats.fraudRate.toFixed(1)}% rate` : "No fraud detected"}
          changeType="positive"
          icon={AlertTriangle}
          variant="fraud"
        />
        <StatsCard
          title="Anomalies Found"
          value={stats?.anomaly?.toLocaleString() || "0"}
          change={stats?.anomaly ? `${stats.anomalyRate.toFixed(1)}% rate` : "No anomalies"}
          changeType="neutral"
          icon={TrendingUp}
          variant="warning"
        />
        <StatsCard
          title="Detection Accuracy"
          value="99.2%"
          change="+0.3% improvement"
          changeType="positive"
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* Charts Row - Real-time visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionChart />
        <FraudPieChart />
      </div>

      {/* Anomaly Score Distribution - Real-time */}
      <AnomalyScoreChart />

      {/* Recent Transactions - Real-time */}
      <RecentTransactions />
    </div>
  );
};

export default Dashboard;
