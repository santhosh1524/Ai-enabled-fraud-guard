import { useEffect, useState } from "react";
import { AlertCircle, Info, Loader2, BarChart3, Zap } from "lucide-react";

interface FeatureRow {
  feature: string;
  weight: number;
  value: string;
}

interface LIMEExplainerProps {
  featureRows?: FeatureRow[];
  htmlContent?: string;
  isLoading?: boolean;
  title?: string;
  description?: string;
  error?: string | null;
}

const LIMEExplainer = ({
  featureRows = [],
  htmlContent,
  isLoading = false,
  title = "LIME Feature Contribution",
  description = "LIME (Local Interpretable Model-agnostic Explanations) explains the prediction by showing which features pushed the decision toward fraud or normal.",
  error = null,
}: LIMEExplainerProps) => {
  const [renderError, setRenderError] = useState<string | null>(null);
  const [htmlSize, setHtmlSize] = useState(0);
  const tableRows = featureRows || [];

  // Debug logging
  useEffect(() => {
    console.log(`[LIME] featureRows received: ${tableRows.length} features`);
    if (tableRows.length > 0) {
      console.log(`[LIME] First feature:`, tableRows[0]);
      console.log(`[LIME] All features:`, tableRows.map(row => row.feature));
    }
  }, [tableRows]);

  useEffect(() => {
    if (!htmlContent || htmlContent.trim().length === 0) {
      setHtmlSize(0);
      setRenderError(null);
      return;
    }

    setHtmlSize(Math.round(htmlContent.length / 1024)); // KB

    try {
      setRenderError(null);
    } catch (err) {
      console.error("LIME parsing error:", err);
    }
  }, [htmlContent]);

  // Convert technical feature names to plain English
  const getPlainEnglishFeature = (feature: string): string => {
    console.log(`[LIME] Converting feature: "${feature}"`);
    
    // Handle LIME format: "feature_name > value" or "feature_name <= value"
    const parts = feature.split(/\s*(>|<|=|<=|>=)\s*/);
    if (parts.length >= 2) {
      const featureName = parts[0].trim();
      const operator = parts[1].trim();
      const value = parts.slice(2).join('').trim();
      
      console.log(`[LIME] Parsed: feature="${featureName}", operator="${operator}", value="${value}"`);
      
      // Convert feature names to readable format
      let readableFeature = featureName;
      if (featureName === 'anomaly_score') {
        readableFeature = 'Anomaly score';
      } else if (featureName === 'fraud_probability') {
        readableFeature = 'Fraud probability';
      } else if (featureName === 'amount') {
        readableFeature = 'Transaction amount';
      } else if (featureName === 'confidence') {
        readableFeature = 'Confidence score';
      } else if (featureName === 'device_type') {
        readableFeature = 'Device type';
      } else if (featureName === 'location') {
        readableFeature = 'Transaction location';
      } else if (featureName === 'transaction_type') {
        readableFeature = 'Transaction type';
      } else if (featureName === 'category') {
        readableFeature = 'Transaction category';
      } else if (featureName === 'irregular_time') {
        readableFeature = 'Irregular timing';
      } else if (featureName === 'impossible_travel') {
        readableFeature = 'Impossible travel';
      } else if (featureName === 'velocity_30min') {
        readableFeature = 'Transaction velocity (30min)';
      }
      
      // Convert operators and values to readable format
      if (operator === '>' && featureName === 'anomaly_score') {
        if (parseFloat(value) >= 0.76) return 'High anomaly score (above 0.76)';
        if (parseFloat(value) >= 0.5) return 'Moderate anomaly score (above 0.5)';
        return `${readableFeature} above ${value}`;
      }
      
      if (operator === '>' && featureName === 'fraud_probability') {
        if (parseFloat(value) >= 0.65) return 'High fraud probability (above 65%)';
        if (parseFloat(value) >= 0.5) return 'Moderate fraud probability (above 50%)';
        return `${readableFeature} above ${(parseFloat(value) * 100).toFixed(0)}%`;
      }
      
      if (operator === '<' && featureName === 'amount') {
        if (parseFloat(value) <= 140000) return 'Transaction amount less than ₹1,40,000';
        return `${readableFeature} less than ₹${parseFloat(value).toLocaleString("en-IN")}`;
      }
      
      if (operator === '>' && featureName === 'amount') {
        if (parseFloat(value) >= 66068) return 'Very high transaction amount (above ₹66,068)';
        if (parseFloat(value) >= 50000) return 'High transaction amount (above ₹50,000)';
        return `${readableFeature} above ₹${parseFloat(value).toLocaleString("en-IN")}`;
      }
      
      if (operator === '>' && featureName === 'confidence') {
        if (parseFloat(value) >= 0.85) return 'High confidence score (above 85%)';
        if (parseFloat(value) >= 0.7) return 'Moderate confidence score (above 70%)';
        return `${readableFeature} above ${(parseFloat(value) * 100).toFixed(0)}%`;
      }
      
      // Handle categorical features
      if (featureName === 'device_type') {
        if (operator === '<=' && parseFloat(value) <= 1.00) return 'Desktop or laptop device';
        if (operator === '>' && parseFloat(value) >= 1.00 && parseFloat(value) < 2.00) return 'Tablet device';
        if (operator === '>' && parseFloat(value) >= 2.00) return 'Mobile device';
        return readableFeature;
      }
      
      if (featureName === 'location') {
        if (operator === '<=' && parseFloat(value) <= 1.00) return 'London, UK location';
        if (operator === '>' && parseFloat(value) >= 1.00 && parseFloat(value) < 2.00) return 'New York, USA location';
        return readableFeature;
      }
      
      if (featureName === 'transaction_type') {
        if (operator === '<=' && parseFloat(value) <= 1.00) return 'Transfer transaction';
        if (operator === '>' && parseFloat(value) >= 1.00 && parseFloat(value) < 2.00) return 'Payment transaction';
        return readableFeature;
      }
      
      if (featureName === 'category') {
        if (operator === '>' && parseFloat(value) >= 3.00) return 'Unknown category';
        if (operator === '<=' && parseFloat(value) <= 1.00) return 'Food & Dining category';
        if (operator === '>' && parseFloat(value) >= 1.00 && parseFloat(value) < 2.00) return 'Shopping category';
        if (operator === '>' && parseFloat(value) >= 2.00 && parseFloat(value) < 3.00) return 'Entertainment category';
        return readableFeature;
      }
      
      // Default readable format
      return `${readableFeature} ${operator} ${value}`;
    }
    
    // Fallback: clean up the technical name
    return feature.replace(/_/g, ' ').replace(/<=/g, '≤').replace(/>=/g, '≥');
  };
  const getWeightDescription = (weight: number): { label: string; explanation: string } => {
    const absWeight = Math.abs(weight);
    
    if (absWeight > 0.3) {
      return {
        label: weight > 0 ? "🔴 STRONG FRAUD SIGNAL" : "🟢 STRONG PROTECTIVE FACTOR",
        explanation: weight > 0 
          ? `Strongly pushes toward FRAUD (${(absWeight * 100).toFixed(1)}% impact)`
          : `Strongly suggests this is NORMAL (${(absWeight * 100).toFixed(1)}% impact)`
      };
    } else if (absWeight > 0.15) {
      return {
        label: weight > 0 ? "🟠 MODERATE FRAUD SIGNAL" : "🟡 MODERATE PROTECTIVE FACTOR",
        explanation: weight > 0
          ? `Moderately suggests FRAUD (${(absWeight * 100).toFixed(1)}% impact)`
          : `Moderately suggests this is NORMAL (${(absWeight * 100).toFixed(1)}% impact)`
      };
    } else if (absWeight > 0.05) {
      return {
        label: weight > 0 ? "🟡 WEAK FRAUD SIGNAL" : "🟢 WEAK PROTECTIVE FACTOR",
        explanation: weight > 0
          ? `Slightly suggests FRAUD (${(absWeight * 100).toFixed(1)}% impact)`
          : `Slightly suggests NORMAL (${(absWeight * 100).toFixed(1)}% impact)`
      };
    } else {
      return {
        label: "⚪ MINIMAL IMPACT",
        explanation: `Very small effect (${(absWeight * 100).toFixed(2)}% impact)`
      };
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          {htmlSize > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">HTML Size</p>
              <p className="text-sm font-semibold text-foreground">
                {htmlSize > 1024 ? `${(htmlSize / 1024).toFixed(1)}MB` : `${htmlSize}KB`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Warning for large HTML */}
      {htmlSize > 500 && (
        <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <Zap className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-amber-600">
              Optimized for Large HTML
            </p>
            <p className="text-xs text-amber-600/80">
              Parsing {(htmlSize / 1024).toFixed(1)}MB LIME HTML - extracting features only
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {(error || renderError) && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-destructive">
              LIME Explanation Error
            </p>
            <p className="text-xs text-destructive/70 mt-1">
              {error || renderError}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {isLoading ? (
        <div className="bg-muted/20 rounded-lg border border-border/50 min-h-96 flex flex-col items-center justify-center gap-4 py-12">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Generating LIME explanation...
            </p>
          </div>
        </div>
      ) : tableRows.length > 0 ? (
        <div className="space-y-4">
          {/* Feature Table */}
          <div className="bg-muted/30 rounded-lg border border-border/50 overflow-x-auto p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-3 font-semibold">How It Affects Fraud Probability</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((item, idx) => {
                  const desc = getWeightDescription(item.weight);
                  const contribution = item.weight > 0 ? "+" : "";
                  const plainFeature = getPlainEnglishFeature(item.feature);
                  return (
                    <tr
                      key={idx}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3 px-3 text-sm">
                        <div className="space-y-1">
                          <p className="font-medium">
                            <span className="text-foreground">"{plainFeature}"</span>
                            <span className="text-muted-foreground mx-2">contributes</span>
                            <span className={item.weight > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                              {contribution}{item.weight.toFixed(2)}
                            </span>
                            <span className="text-muted-foreground mx-2">to</span>
                            <span className="font-semibold text-foreground">
                              {item.weight > 0 ? "fraud" : "normal"} probability
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground pl-2 border-l-2 border-accent/30">
                            {desc.label} — {desc.explanation}
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🔴</span>
                <p className="font-semibold text-sm text-red-600">
                  Fraud Signals
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Features that increase fraud risk
              </p>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🟢</span>
                <p className="font-semibold text-sm text-green-600">
                  Protective Factors
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Features that indicate normal transaction
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg flex items-start gap-3">
            <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-foreground mb-2">
                Understanding the Impact:
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">▸</span>
                  <span>
                    <strong>🔴 STRONG FRAUD SIGNAL:</strong> Feature strongly suggests this is fraud (over 30% impact)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">▸</span>
                  <span>
                    <strong>🟠 MODERATE SIGNAL:</strong> Feature moderately indicates fraud (15-30% impact)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">▸</span>
                  <span>
                    <strong>🟢 PROTECTIVE FACTOR:</strong> Feature suggests this is a normal transaction
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">▸</span>
                  <span>
                    <strong>Impact %:</strong> How much this feature contributes to the final decision
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        // Empty State
        <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-dashed border-border min-h-96 flex flex-col items-center justify-center gap-4 p-6">
          <div className="text-4xl">📊</div>
          <div className="text-center space-y-2">
            <p className="text-foreground font-semibold">
              No LIME Explanation Available
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Search for a transaction ID to view its LIME explanation
            </p>
          </div>

          <div className="w-full max-w-sm mt-4 p-4 bg-card border border-border/50 rounded-lg">
            <p className="text-xs font-semibold text-foreground mb-3">
              💡 What LIME shows:
            </p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Which features affected the prediction</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Weight/importance of each feature</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Direction of influence (+ or -)</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default LIMEExplainer;
