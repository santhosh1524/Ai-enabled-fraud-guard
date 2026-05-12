import { useState, useCallback } from 'react';

export interface LimeFeature {
  feature: string;
  weight: number;
  value: string;
}

export interface ExplanationResult {
  transaction: any;
  shap_image: string;
  lime_html: string;
  lime_features: LimeFeature[];
  fraud_probability: number;
  features: Record<string, any>;
}

export const useExplainability = () => {
  const [result, setResult] = useState<ExplanationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = useCallback(async (txnNo: string) => {
    if (!txnNo?.trim()) {
      setError('Please enter a valid transaction ID');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setResult(null);

      const apiUrl = `/api/explain/${encodeURIComponent(txnNo)}`;
      console.log(`[HOOK] Fetching: ${apiUrl}`);
      console.log(`[HOOK] URL: http://localhost:8000${apiUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`[HOOK] Response Status: ${response.status}`);
      console.log(`[HOOK] Response OK: ${response.ok}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[HOOK] Error Response: ${errorText}`);
        
        if (response.status === 404) {
          throw new Error(`Transaction ${txnNo} not found`);
        } else if (response.status === 500) {
          throw new Error('Server error - check if backend is running: python fraud-api/app_explainability.py');
        } else if (response.status === 0) {
          throw new Error('Cannot connect to backend. Is it running on port 8000?');
        } else {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('[HOOK] API Response:', {
        hasTransaction: !!data.transaction,
        hasShapImage: !!data.shap_image,
        hasLimeHtml: !!data.lime_html,
        hasLimeFeatures: !!data.lime_features,
        hasFeatures: !!data.features,
        transactionId: data.transaction?.transaction_id,
        fraudProbability: data.transaction?.fraud_probability,
      });

      if (!data.transaction) {
        throw new Error('Invalid response: missing transaction data');
      }

      setResult({
        transaction: data.transaction || {},
        shap_image: data.shap_image || '',
        lime_html: data.lime_html || '',
        lime_features: data.lime_features || [],
        fraud_probability: data.transaction?.fraud_probability || 0,
        features: data.features || {},
      });

      console.log('[HOOK] Result set successfully');

    } catch (err) {
      let msg = 'Unknown error occurred';
      
      if (err instanceof TypeError) {
        if (err.message.includes('Failed to fetch')) {
          msg = 'Cannot connect to backend. Make sure it\'s running: python fraud-api/app_explainability.py';
        } else {
          msg = `Network error: ${err.message}`;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }

      console.error(`[HOOK] Error caught:`, {
        message: msg,
        errorType: err instanceof Error ? err.constructor.name : typeof err,
        fullError: err,
      });
      
      setError(msg);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
    console.log('[HOOK] Reset called');
  }, []);

  return { 
    result, 
    isLoading, 
    error, 
    fetchExplanation, 
    reset 
  };
};
