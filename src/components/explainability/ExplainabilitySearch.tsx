import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2, AlertCircle } from "lucide-react";

interface ExplainabilitySearchProps {
  onSearch: (txnNo: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const ExplainabilitySearch = ({
  onSearch,
  isLoading = false,
  error = null,
}: ExplainabilitySearchProps) => {
  const [txnNo, setTxnNo] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!txnNo.trim()) {
      setLocalError("Transaction number is required");
      return;
    }

    try {
      await onSearch(txnNo.trim());
    } catch (err: any) {
      setLocalError(err.message || "Failed to fetch explanation");
    }
  };

  return (
    <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
      <div className="max-w-md">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Search Transaction
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Enter a transaction number to view SHAP and LIME explanations
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="txn-no">Transaction Number</Label>
            <Input
              id="txn-no"
              type="text"
              placeholder="e.g., TXN123456789"
              value={txnNo}
              onChange={(e) => setTxnNo(e.target.value)}
              disabled={isLoading}
              className="placeholder:text-muted-foreground/40"
            />
          </div>

          {(error || localError) && (
            <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                {error || localError}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !txnNo.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Explanations...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search & Explain
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ExplainabilitySearch;
