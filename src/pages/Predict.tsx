import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useEffect } from "react";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  Eye,
} from "lucide-react";

import { useFraudPrediction } from "../hooks/useFraudPrediction";
import Navbar from "../components/layout/Navbar.tsx";

const Predict = () => {
  const { user, readableUserId } = useAuth();
  const { predict, isLoading, result, reset } = useFraudPrediction();

  const [formData, setFormData] = useState({
    amount: "",
    location: "",
    deviceType: "",
    transactionType: "",
    merchantCategory: "",
  });
const [location, setLocation] = useState("");
const [ipAddress, setIpAddress] = useState("");
const fetchLocationFromIP = async () => {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();

    setLocation(`${data.city}, ${data.country_name}`);
  } catch (err) {
    console.error("Location error:", err);
  }
};

const fetchIP = async () => {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();

    setIpAddress(data.ip);
  } catch (err) {
    console.error("IP error:", err);
  }
};
useEffect(() => {
  fetchIP();
  fetchLocationFromIP();
}, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !formData.amount) return;

    const analysis = await predict({
      amount: parseFloat(formData.amount),
      user_id: user.id,
      location: formData.location || "Unknown",
      deviceType: formData.deviceType || "Unknown",
      transactionType: formData.transactionType || "purchase",
      merchantCategory: formData.merchantCategory || "Other",
    });

    if (analysis) {
      console.log("Prediction result:", analysis);
    }
  };

  const handleReset = () => {
    reset();
    setFormData({
      amount: "",
      location: "",
      deviceType: "",
      transactionType: "",
      merchantCategory: "",
    });
  };

  /* ---------------- UI HELPERS ---------------- */

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-orange-500";
      case "low":
        return "text-green-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case "high":
        return "bg-destructive/10 border-destructive/30";
      case "medium":
        return "bg-orange-500/10 border-orange-500/30";
      case "low":
        return "bg-green-500/10 border-green-500/30";
      default:
        return "bg-muted border-border";
    }
  };

  const handlePredict = async (formData) => {
  const response = await fetch('http://localhost:8000/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  const result = await response.json();
  console.log("AI Result:", result);
};




const handleAISubmit = async (formData) => {
  // 1. Manual mapping (must match your Python LabelEncoder)
  const locationMap = { "Mumbai": 0, "Chennai": 1, "Vellore": 2 }; 
  const deviceMap = { "Mobile": 0, "Desktop": 1, "Tablet": 2 };

  // 2. Prepare the data for the Python API
  const payload = {
    amount: parseFloat(formData.amount),

    ip_address: ipAddress,


    loc_enc: locationMap[formData.location] || 0,
    dev_enc: deviceMap[formData.device_type] || 0,
    cat_enc: 1 // Example category

  };

  // 3. Send to FastAPI
  try {
    const response = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    const result = await response.json();
    
    // 4. Show result on screen
    alert(`AI Prediction: ${result.status} (Probability: ${result.fraud_probability})`);
  } catch (error) {
    console.error("Error connecting to Python API:", error);
  }
};


  const getRiskIcon = (level: string) => {
    switch (level) {
      case "high":
        return <AlertTriangle className="h-8 w-8 text-destructive" />;
      case "medium":
        return <AlertCircle className="h-8 w-8 text-orange-500" />;
      case "low":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      default:
        return null;
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case "block":
        return <ShieldAlert className="h-5 w-5 text-destructive" />;
      case "review":
        return <Eye className="h-5 w-5 text-orange-500" />;
      case "approve":
        return <ShieldCheck className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  /* ---------------- JSX ---------------- */

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            AI Fraud Prediction
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyze your transaction for potential fraud risks using machine
            learning.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Transaction Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Logged-in User */}
              <div className="space-y-2">
                <Label>User</Label>
                <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                  {user?.email} ({readableUserId})
                </div>
              </div>

              {/* Amount + Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input
                    type="text"
                    placeholder="₹0"
                    value={
                      formData.amount
                        ? Number(formData.amount).toLocaleString("en-IN")
                        : ""
                    }
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, ""); // remove commas

                      if (!isNaN(Number(rawValue))) {
                        setFormData({ ...formData, amount: rawValue });
                      }
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) =>
                      setFormData({ ...formData, location: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New York, US">New York, US</SelectItem>
                      <SelectItem value="London, UK">London, UK</SelectItem>
                      <SelectItem value="Tokyo, JP">Tokyo, JP</SelectItem>
                      <SelectItem value="Mumbai, IN">Mumbai, IN</SelectItem>
                      <SelectItem value="Unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Device + Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Device Type</Label>
                  <Select
                    value={formData.deviceType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, deviceType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select device" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mobile">Mobile</SelectItem>
                      <SelectItem value="Desktop">Desktop</SelectItem>
                      <SelectItem value="Tablet">Tablet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Transaction Type</Label>
                  <Select
                    value={formData.transactionType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, transactionType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Merchant Category</Label>
                <Select
                  value={formData.merchantCategory}
                  onValueChange={(value) =>
                    setFormData({ ...formData, merchantCategory: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Electronics">
                      Electronics
                    </SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Entertainment">
                      Entertainment
                    </SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>


              {/*IP Location*/}
             <div className="space-y-2">
                <Label>IP Location</Label>
                <Input
                  value={location || "Detecting location..."}
                  readOnly
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  className="flex-1"
                  disabled={isLoading || !user}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Predict Fraud Risk
                    </>
                  )}
                </Button>

                {result && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handleReset}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Results Panel (UNCHANGED LOGIC BELOW) */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              AI Prediction Results
            </h2>

            {!result && !isLoading && (
              <div className="h-64 flex items-center justify-center text-center">
                <div>
                  <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Enter transaction details to analyze fraud risk
                  </p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Running ML models...
                  </p>
                </div>
              </div>
            )}

            {result && !isLoading && (
              <div className="space-y-6">
                <div
                  className={`p-6 rounded-xl border-2 ${getRiskBg(
                    result.riskLevel
                  )}`}
                >
                  <div className="flex items-center gap-4">
                    {getRiskIcon(result.riskLevel)}
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Risk Assessment
                      </p>
                      <p
                        className={`text-2xl font-bold capitalize ${getRiskColor(
                          result.riskLevel
                        )}`}
                      >
                        {result.riskLevel} Risk
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
                  {getRecommendationIcon(result.recommendation)}
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Action Recommended
                    </p>
                    <p className="font-medium text-foreground capitalize">
                      {result.recommendation} Transaction
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Probability
                    </p>
                    <p className="text-xl font-bold">
                      {(result.probability * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Confidence
                    </p>
                    <p className="text-xl font-bold">
                      {(result.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Anomaly
                    </p>
                    <p className="text-xl font-bold">
                      {(result.anomalyScore * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-3">
                    Key Risk Factors
                  </p>
                  <ul className="space-y-2">
                    {result.factors.map((factor, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 p-2 rounded"
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            result.riskLevel === "high"
                              ? "bg-destructive"
                              : "bg-orange-500"
                          }`}
                        />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predict;