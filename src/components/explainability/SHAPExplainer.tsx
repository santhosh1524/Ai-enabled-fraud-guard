import { Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { useState } from "react";

interface SHAPExplainerProps {
  imageSrc?: string;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

const SHAPExplainer = ({
  imageSrc,
  isLoading = false,
  title = "SHAP Feature Importance",
  description = "SHAP (SHapley Additive exPlanations) values show how much each feature contributed to the fraud prediction.",
}: SHAPExplainerProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
      {/* Header with Icon */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        // Loading State
        <div className="bg-muted/20 rounded-lg border border-border/50 min-h-96 flex flex-col items-center justify-center gap-4 py-12">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Generating SHAP visualization...
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Computing feature contributions (1-2 seconds)
            </p>
          </div>
        </div>
      ) : imageSrc && !imageError ? (
        // Image Display with Enhanced Container
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg border border-border/50 p-6 overflow-auto max-h-[600px] flex items-center justify-center">
            <img
              src={imageSrc}
              alt="SHAP Feature Importance Waterfall"
              className="w-full h-auto object-contain max-w-full"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          </div>

          {/* Guide Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg hover:border-red-500/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <p className="font-semibold text-sm text-red-600">
                  Increases Risk
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Red bars push prediction toward fraud
              </p>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:border-blue-500/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <p className="font-semibold text-sm text-blue-600">
                  Decreases Risk
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Blue bars push prediction toward normal
              </p>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-amber-500 rounded"></div>
                <p className="font-semibold text-sm text-amber-600">
                  Base Value
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Model's baseline starting point
              </p>
            </div>
          </div>

          {/* How to Read */}
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-lg flex-shrink-0">📊</div>
              <div>
                <p className="font-semibold text-sm text-foreground mb-2">
                  How to Read This Chart
                </p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">▸</span>
                    <span>
                      <strong>Horizontal bars</strong> = Each feature's impact
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">▸</span>
                    <span>
                      <strong>Bar length</strong> = Magnitude of influence
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">▸</span>
                    <span>
                      <strong>Red vs Blue</strong> = Direction (fraud vs normal)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">▸</span>
                    <span>
                      <strong>Final arrow</strong> = Predicted fraud probability
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">▸</span>
                    <span>
                      <strong>Top features</strong> = Most influential factors
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Empty State
        <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-dashed border-border min-h-96 flex flex-col items-center justify-center gap-4 p-6">
          <div className="text-4xl">🔍</div>
          <div className="text-center space-y-2">
            <p className="text-foreground font-semibold">
              No SHAP Visualization Yet
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Search for a transaction ID above to view its SHAP waterfall plot
            </p>
          </div>

          {/* Quick Tips */}
          <div className="w-full max-w-sm mt-4 p-4 bg-card border border-border/50 rounded-lg">
            <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>💡</span> What SHAP Shows:
            </p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Which features mattered most</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>How they affected the prediction</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Direction of influence (fraud risk increase/decrease)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Final predicted fraud probability</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Error State */}
      {imageError && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-destructive">
              Failed to Load SHAP Image
            </p>
            <p className="text-xs text-destructive/70 mt-1">
              The SHAP visualization could not be displayed. This may be a temporary issue.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SHAPExplainer;
