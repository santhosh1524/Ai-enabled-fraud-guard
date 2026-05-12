import { useState, useCallback } from "react";

interface ExplanationResult {
  transaction: any;
  shap_plot: string;   // ✅ matches backend field name exactly
  lime_html: string;
  lime_features: Array<{ feature: string; weight: number; value: string }>;
  features: Record<string, any>;
}

interface UseExplainabilityReturn {
  result: ExplanationResult | null;
  isLoading: boolean;
  error: string | null;
  fetchExplanation: (txnNo: string) => Promise<void>;
  reset: () => void;
}

export const useExplainability = (): UseExplainabilityReturn => {
  const [result, setResult] = useState<ExplanationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = useCallback(async (txnNo: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`🔍 Fetching explanation for: ${txnNo}`);

      const response = await fetch(
        `http://127.0.0.1:8000/api/explain/${encodeURIComponent(txnNo)}`
      );

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Server didn't return JSON. Is the backend running?");
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.detail || `Server error: ${response.status}`);
      }

      // ✅ Prefix base64 so <img src> renders correctly
      const normalised: ExplanationResult = {
        ...data,
        shap_plot: data.shap_plot
          ? data.shap_plot.startsWith("data:")
            ? data.shap_plot
            : `data:image/png;base64,${data.shap_plot}`
          : "",
      };

      console.log("✅ Explanation loaded", {
        hasShap: !!normalised.shap_plot,
        limeFeatures: normalised.lime_features?.length ?? 0,
      });

      setResult(normalised);
    } catch (err: any) {
      console.error("❌ Explanation fetch error:", err);
      setError(err.message || "Failed to fetch explanation.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { result, isLoading, error, fetchExplanation, reset };
};