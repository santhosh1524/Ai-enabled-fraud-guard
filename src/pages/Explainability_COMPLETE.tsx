import { useState, useCallback } from "react";
import {
  Info,
  ArrowUp,
  ArrowDown,
  Brain,
  Lightbulb,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ExplainabilitySearch from "@/components/explainability/ExplainabilitySearch";
import SHAPExplainer from "@/components/explainability/SHAPExplainer";
import LIMEExplainer from "@/components/explainability/LIMEExplainer";
import { useExplainability } from "@/hooks/useExplainability";
import { Button } from "@/components/ui/button";

interface TransactionDetailsProps {
  transaction: any;
  fraudProbability?: number;
}

/**
 * Transaction Details Card
 * Displays transaction metadata in a clean grid
 */
const TransactionDetailsCard = ({
  transaction,
  fraudProbability,
}: TransactionDetailsProps) => {
  const fraudStatus = transaction?.fraud_status || "pending";
  const probability = fraudProbability || transaction?.fraud_probability || 0;

  // Determine status color and styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case "fraud":
        return "bg-destructive/10 border-destructive/30 text-destructive";
      case "anomaly":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-600";
      case "normal":
        return "bg-green-500/10 border-green-500/30 text-green-600";
      default:
        return "bg-muted/10 border-muted/30 text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "fraud":
        return (
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
        );
      case "anomaly":
        return (
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
        );
      case "normal":
        return (
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
      {/* Header with Status */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Transaction Details
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            ID: {transaction?.transaction_id || "Unknown"}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(
            fraudStatus
          )}`}
        >
          {getStatusIcon(fraudStatus)}
          <div>
            <p className="text-xs font-medium opacity-75">Status</p>
            <p className="text-sm font-bold capitalize">{fraudStatus}</p>
          </div>
        </div>
      </div>

      {/* Probability Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            Fraud Probability
          </p>
          <p className="text-sm font-semibold text-destructive">
            {(probability * 100).toFixed(1)}%
          </p>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              probability > 0.7
                ? "bg-destructive"
                : probability > 0.4
                  ? "bg-yellow-500"
                  : "bg-green-500"
            }`}
            style={{ width: `${probability * 100}%` }}
          />
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground font-medium">Amount</p>
          <p className="text-sm font-semibold text-foreground mt-1">
            ₹{Number(transaction?.amount || 0).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground font-medium">Location</p>
          <p className="text-sm font-semibold text-foreground mt-1">
            {transaction?.location || "Unknown"}
          </p>
        </div>

        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground font-medium">Device</p>
          <p className="text-sm font-semibold text-foreground mt-1">
            {transaction?.device_type || "Unknown"}
          </p>
        </div>

        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground font-medium">Category</p>
          <p className="text-sm font-semibold text-foreground mt-1">
            {transaction?.category || "Other"}
          </p>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="pt-4 border-t border-border space-y-2">
        <p className="text-xs font-medium text-foreground">Risk Factors:</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-xs text-muted-foreground">
            <span className="font-mono">
              irregular_time: {transaction?.irregular_time || 0}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-mono">
              impossible_travel: {transaction?.impossible_travel || 0}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-mono">
              velocity_30min: {transaction?.velocity_30min || 0}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-mono">
              Risk Level: {transaction?.risk_level || "Low"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Explainability Page Component
 * Integrates SHAP and LIME explanations with search functionality
 */
const Explainability = () => {
  const { result, isLoading, error, fetchExplanation, reset } =
    useExplainability();
  const [shaLoading, setShaLoading] = useState(false);

  const handleSearch = useCallback(
    async (txnNo: string) => {
      setShaLoading(true);
      try {
        await fetchExplanation(txnNo);
      } catch (err) {
        console.error("Search failed:", err);
        // Error is handled by useExplainability hook
      } finally {
        setShaLoading(false);
      }
    },
    [fetchExplanation]
  );

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="space-y-6 animate-fade-in pb-12 min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Page Header */}
      <div className="px-6 space-y-2">
        <h1 className="pt-9 text-3xl font-bold text-foreground">
          Model Explainability
        </h1>
        <p className="text-muted-foreground">
          Understand how our AI makes fraud detection decisions using advanced
          explainability techniques (SHAP & LIME)
        </p>
      </div>

      {/* Info Banner */}
      <div className="mx-6 bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-start gap-4">
        <Info className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            What is Explainable AI?
          </h3>
          <p className="text-sm text-muted-foreground">
            <strong>SHAP</strong> (SHapley Additive exPlanations) uses game
            theory to show the contribution of each feature to the prediction.{" "}
            <strong>LIME</strong> (Local Interpretable Model-agnostic
            Explanations) creates local interpretable models to explain
            individual predictions.
          </p>
        </div>
      </div>

      {/* Key Insights Section */}
      <div className="mx-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* How SHAP Works */}
        <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="h-5 w-5 text-accent flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                How SHAP Works
              </h2>
              <p className="text-sm text-muted-foreground">
                Feature contribution visualization
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              SHAP waterfall plots show how each feature pushes the prediction
              toward fraud (red) or normal (blue). The x-axis shows the
              magnitude of impact, and features are ordered by importance.
            </p>

            <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-destructive rounded-full" />
                <span className="text-sm text-foreground">
                  <strong>Red bars</strong> - Increase fraud risk
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm text-foreground">
                  <strong>Blue bars</strong> - Decrease fraud risk
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-border rounded-full" />
                <span className="text-sm text-muted-foreground">
                  <strong>Base value</strong> - Model baseline prediction
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Risk Indicators */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <h2 className="text-lg font-semibold text-foreground">
              Key Indicators
            </h2>
          </div>

          <div className="space-y-4">
            {/* Risk Factors */}
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUp className="h-4 w-4 text-destructive" />
                <span className="font-semibold text-sm text-destructive">
                  Risk Factors
                </span>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• High transaction amounts</li>
                <li>• Unknown/unusual locations</li>
                <li>• Off-hours transactions</li>
                <li>• Impossible travel distances</li>
                <li>• High transaction velocity</li>
              </ul>
            </div>

            {/* Trust Signals */}
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <ArrowDown className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-sm text-green-600">
                  Trust Signals
                </span>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Trusted devices</li>
                <li>• Known locations</li>
                <li>• Regular business hours</li>
                <li>• Low velocity</li>
                <li>• Consistent patterns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="mx-6">
        <ExplainabilitySearch
          onSearch={handleSearch}
          isLoading={isLoading || shaLoading}
          error={error}
        />
      </div>

      {/* Results Section - Only show when result exists */}
      {result && (
        <div className="mx-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Transaction Details */}
          <TransactionDetailsCard
            transaction={result.transaction}
            fraudProbability={result.transaction?.fraud_probability}
          />

          {/* SHAP Explainer */}
          <SHAPExplainer
            imageSrc={result.shap_image}
            isLoading={false}
            title="SHAP Waterfall Plot"
            description="Shows how each feature contributes to the fraud prediction. Positive values increase fraud risk, negative values decrease it."
          />

          {/* LIME Explainer */}
          <LIMEExplainer
            htmlContent={result.lime_html}
            isLoading={false}
            title="LIME Local Explanation"
            description="Interactive explanation of features and their impact on this specific transaction's prediction."
          />

          {/* Features Used */}
          {result.features && Object.keys(result.features).length > 0 && (
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Feature Values (Encoded)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(result.features).map(([key, value]) => (
                  <div key={key} className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground font-medium truncate">
                      {key}
                    </p>
                    <p className="text-sm font-mono font-semibold text-foreground mt-1">
                      {typeof value === "number"
                        ? value.toFixed(2)
                        : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-3">
            <Button onClick={handleReset} variant="outline" size="lg">
              Search Another Transaction
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              size="lg"
              className="hidden md:flex"
            >
              Print / Export
            </Button>
          </div>
        </div>
      )}

      {/* Empty State - No Results Yet */}
      {!result && !isLoading && !shaLoading && (
        <div className="mx-6">
          <div className="bg-muted/20 rounded-xl border border-dashed border-border p-12 text-center space-y-4">
            <Brain className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <div>
              <p className="text-foreground font-medium mb-1">
                No Transaction Selected
              </p>
              <p className="text-muted-foreground">
                Search for a transaction above to view detailed SHAP and LIME
                explanations
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Explanation Reference Card */}
      <div className="mx-6 bg-card p-6 rounded-xl border border-border shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Understanding the Explanations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SHAP Explanation */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Brain className="h-4 w-4 text-accent" />
              SHAP Waterfall
            </h4>
            <p className="text-sm text-muted-foreground">
              The waterfall plot starts at the base value (model baseline) and
              shows each feature pushing the prediction left (toward normal) or
              right (toward fraud). The final arrow shows the predicted
              probability.
            </p>
            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
              <strong>Example:</strong> If Amount feature adds +0.25 to fraud
              probability, that bar extends right by 0.25
            </div>
          </div>

          {/* LIME Explanation */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              LIME Table
            </h4>
            <p className="text-sm text-muted-foreground">
              The interactive table shows which feature values contributed most
              to the prediction. The table is sorted by impact. Features can be
              in the format "feature > threshold" or "feature = value".
            </p>
            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
              <strong>Example:</strong> "Amount > 140,000" contributes +0.45 to
              fraud probability
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mx-6 text-center text-xs text-muted-foreground pb-6">
        <p>
          Explanations are generated using SHAP v0.44.1 and LIME v0.2.141 •
          Model: XGBoost Classifier
        </p>
      </div>
    </div>
  );
};

export default Explainability;
