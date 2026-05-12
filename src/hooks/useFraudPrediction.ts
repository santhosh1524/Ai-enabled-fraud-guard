import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TransactionData {
  amount: number;
  user_id: string;
  transactionTime?: string;
  location: string;
  deviceType: string;
  transactionType: string;
  merchantCategory: string;
  velocity30min?: number;
}

interface BackendResponse {
  success: boolean;
  transaction_id: string;
  prediction: string;
  riskLevel: string;
  probability: number;
  anomalyScore: number;
  confidence: number;
  velocity_30min: number;
  impossible_travel: number;
  irregular_time: number;
  factors: string[];
}

interface PredictionResult {
  success: boolean;
  transaction_id: string;
  prediction: string;
  riskLevel: string;
  probability: number;
  anomalyScore: number;
  confidence: number;
  factors: string[];
  ml_response: BackendResponse;
}

export const useFraudPrediction = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const predict = async (transaction: TransactionData): Promise<PredictionResult> => {

    setIsLoading(true);
    setResult(null);

    try {
      // GET JWT TOKEN from current Supabase session
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Not authenticated — please log in again.");

      // CATEGORY AUTO FIX
      let finalCategory = transaction.merchantCategory;
      if (!finalCategory || finalCategory === "Unknown" || finalCategory === "Other") {
        const amt = Number(transaction.amount);
        if (amt > 200000)      finalCategory = "Luxury";
        else if (amt > 100000) finalCategory = "Electronics";
        else if (amt > 10000)  finalCategory = "Travel";
        else                   finalCategory = "Retail";
      }

      const payload = {
        user_id:          transaction.user_id,
        amount:           Number(transaction.amount),
        location:         transaction.location      || "Chennai, India",
        device_type:      transaction.deviceType    || "Mobile",
        transaction_type: transaction.transactionType || "withdrawal",
        category:         finalCategory,
      };

      console.log("🚀 Sending ML Payload:", payload);

      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Backend Error:", errorText);
        throw new Error(`Backend Error ${response.status}`);
      }

      const data: BackendResponse = await response.json();
      console.log("✅ ML Prediction:", data);

      const finalResult: PredictionResult = {
        success:        data.success,
        transaction_id: data.transaction_id,
        prediction:     data.prediction,
        riskLevel:      data.riskLevel,
        probability:    data.probability,
        anomalyScore:   data.anomalyScore,
        confidence:     data.confidence,
        factors:        data.factors ?? [],
        ml_response:    data,
      };

      setResult(finalResult);
      return finalResult;

    } catch (err: any) {
      console.error("🔥 Prediction Error:", err);
      throw new Error(err.message || "Prediction failed");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setIsLoading(false);
  };

  return { predict, isLoading, result, reset };
};