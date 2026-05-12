import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  useTransactions,
  useCreateTransaction,
} from "@/hooks/useTransactions";
import Navbar from "@/components/layout/Navbar";

/* ===========================================
   STATUS STYLES
=========================================== */
const statusStyles: Record<string, string> = {
  normal: "bg-green-500/10 text-green-500 border-green-500/20",
  fraud: "bg-red-500/10 text-red-500 border-red-500/20",
  anomaly: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  pending: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

/* ===========================================
   SMART CATEGORY FUNCTION 🔥
=========================================== */
const getCategory = (txn: any) => {
  const category = txn.category;

  // ✅ If valid category exists
  if (
    category &&
    category !== "Other" &&
    category !== "Unknown"
  ) {
    return category;
  }

  // ✅ Intelligent fallback (based on amount)
  const amount = Number(txn.amount);

  if (amount > 200000) return "Luxury";
  if (amount > 100000) return "High Value";
  if (amount > 50000) return "Electronics";
  if (amount > 10000) return "Retail";
  if (amount > 2000) return "Groceries";

  return "General";
};

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");

  const {
    data: transactions = [],
    isPending,
    isError,
    refetch,
  } = useTransactions();

  const createTransaction = useCreateTransaction();

  /* ===========================================
     ERROR STATE
  =========================================== */
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Failed to load transactions</p>
      </div>
    );
  }

  /* ===========================================
     FILTER LOGIC
  =========================================== */
  const filteredTransactions = transactions.filter((txn: any) => {
    const transactionId = String(txn.transaction_id ?? "");
    const merchant = String(txn.merchant ?? "");
    const fraudStatus = String(txn.fraud_status ?? "pending");
    const amountInInr = Number(txn.amount);

    const matchesSearch =
      transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || fraudStatus === statusFilter;

    const matchesAmount =
      amountFilter === "all" ||
      (amountFilter === "low" && amountInInr < 70000) ||
      (amountFilter === "medium" &&
        amountInInr >= 70000 &&
        amountInInr < 150000) ||
      (amountFilter === "high" && amountInInr >= 150000);

    return matchesSearch && matchesStatus && matchesAmount;
  });

  /* ===========================================
     UI
  =========================================== */
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto space-y-6 p-6 pt-24">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Transaction Monitoring
            </h1>
            <p className="text-muted-foreground">
              Analyze transactions and fraud detection status in ₹ (INR)
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  isPending ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>

            <Button variant="default" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-card p-4 rounded-xl border shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ID or Merchant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="fraud">Fraud</SelectItem>
                  <SelectItem value="anomaly">Anomaly</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select value={amountFilter} onValueChange={setAmountFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Amounts</SelectItem>
                  <SelectItem value="low">Under ₹70,000</SelectItem>
                  <SelectItem value="medium">
                    ₹70,000 - ₹1,50,000
                  </SelectItem>
                  <SelectItem value="high">Over ₹1,50,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          {isPending ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Search className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="py-4 px-4 text-left">Transaction ID</th>
                    <th className="py-4 px-4 text-left">Category</th>
                    <th className="py-4 px-4 text-left">Amount (INR)</th>
                    <th className="py-4 px-4 text-left">Date</th>
                    <th className="py-4 px-4 text-left">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredTransactions.map((txn: any) => {
                    const fraudStatus = String(txn.fraud_status ?? "pending");

                    return (
                      <tr key={txn.id}>
                        <td className="py-4 px-4 font-mono text-xs">
                          {txn.transaction_id || "—"}
                        </td>

                        {/* 🔥 FIXED CATEGORY */}
                        <td className="py-4 px-4">
                          <Badge variant="secondary">
                            {getCategory(txn)}
                          </Badge>
                        </td>

                        <td className="py-4 px-4 font-semibold">
                          ₹{Number(txn.amount).toLocaleString("en-IN")}
                        </td>

                        <td className="py-4 px-4 text-muted-foreground">
                          {new Date(txn.created_at).toLocaleDateString()}
                        </td>

                        <td className="py-4 px-4">
                          <Badge
                            variant="outline"
                            className={
                              statusStyles[fraudStatus] ||
                              statusStyles.pending
                            }
                          >
                            {fraudStatus.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Transactions;