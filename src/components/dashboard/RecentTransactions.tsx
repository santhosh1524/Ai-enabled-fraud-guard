import { Badge } from "@/components/ui/badge";
import { useTransactions } from "@/hooks/useTransactions";
import { Loader2 } from "lucide-react";

const statusStyles: Record<string, string> = {
  normal: "bg-success/10 text-success border-success/20",
  fraud: "bg-fraud/10 text-fraud border-fraud/20",
  anomaly: "bg-anomaly/10 text-anomaly border-anomaly/20",
  pending: "bg-muted text-muted-foreground border-border",
};

const RecentTransactions = () => {
  const { data: transactions, isLoading } = useTransactions();
  const recentTransactions = (transactions || []).slice(0, 5);

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Recent Transactions
        </h3>
        <p className="text-sm text-muted-foreground">
          Latest analyzed transactions
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : recentTransactions.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No transactions yet
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Transaction ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Merchant
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Timestamp
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {recentTransactions.map((txn) => {
                const fraudStatus =
                  typeof txn.fraud_status === "string"
                    ? txn.fraud_status
                    : "pending";

                return (
                  <tr
                    key={txn.id}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-mono text-foreground">
                      {txn.transaction_id}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {txn.category || "—"}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-foreground">
                      ₹{Number(txn.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(txn.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={
                          statusStyles[fraudStatus] || statusStyles.pending
                        }
                      >
                        {fraudStatus.charAt(0).toUpperCase() +
                          fraudStatus.slice(1)}
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
  );
};

export default RecentTransactions;
