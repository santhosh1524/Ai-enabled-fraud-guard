import os
import warnings
import uuid
warnings.filterwarnings("ignore")

import io
import base64
import joblib
import shap
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from supabase import create_client, Client
from lime import lime_tabular

# =====================================================
# SUPABASE
# =====================================================
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://dwqgopgljgdlsffqsioj.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3cWdvcGdsamdkbHNmZnFzaW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2OTA4MzAsImV4cCI6MjA4NDI2NjgzMH0.eryK5bg7dT5gcdT8vyYffc7q8UjyP6TgcCv9G19KA7o")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# =====================================================
# LOAD MODEL
# =====================================================
try:
    model = joblib.load("fraud_model.pkl")
    encoders = joblib.load("encoders.pkl")
    print("✅ Model Loaded Successfully")
except Exception as e:
    print("❌ Model Load Error:", e)
    model = None
    encoders = None

# EXACT feature order the model was trained with
FEATURE_ORDER = [
    "amount", "category", "location", "device_type",
    "anomaly_score", "confidence", "fraud_probability", "transaction_type"
]

app = FastAPI(title="Fraud Detection API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    user_id: str
    amount: float
    location: str
    device_type: str
    transaction_type: str
    category: str

# =====================================================
# HELPERS
# =====================================================
def indian_currency(value):
    try:
        value = int(float(value))
        return f"₹{value:,}"
    except:
        return "₹0"

def fetch_transaction(txn_id):
    result = supabase.table("transactions").select("*").eq("transaction_id", txn_id).single().execute()
    if not result.data:
        raise Exception("Transaction not found")
    return result.data

def generate_shap(X):
    explainer = shap.TreeExplainer(model)
    shap_values = explainer(X)
    try:
        explanation = shap_values[0, :, 1] if len(shap_values.shape) == 3 else shap_values[0]
    except:
        explanation = shap_values[0]

    plt.figure(figsize=(12, 6))
    shap.plots.waterfall(explanation, show=False)
    buffer = io.BytesIO()
    plt.savefig(buffer, format="png", bbox_inches="tight")
    plt.close()
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode("utf-8")

def generate_lime(X, feature_names):
    try:
        bg = supabase.table("transactions").select("*").limit(100).execute()
        bg_df = pd.DataFrame(bg.data)
        if bg_df.empty:
            bg_df = pd.DataFrame(np.random.rand(100, len(feature_names)), columns=feature_names)

        categorical_cols = ["location", "device_type", "transaction_type", "category"]
        for col in categorical_cols:
            if col in bg_df.columns and col in encoders:
                try:
                    bg_df[col] = encoders[col].transform(bg_df[col].astype(str))
                except:
                    bg_df[col] = 0

        for col in feature_names:
            if col not in bg_df.columns:
                bg_df[col] = 0

        training_data = bg_df[feature_names].values
        explainer = lime_tabular.LimeTabularExplainer(
            training_data=training_data,
            feature_names=feature_names,
            class_names=["Normal", "Fraud"],
            mode="classification"
        )
        exp = explainer.explain_instance(X.iloc[0].values, model.predict_proba)
        lime_features = [{"feature": str(f), "weight": float(w), "value": str(w)} for f, w in exp.as_list()]
        return exp.as_html(), lime_features
    except Exception as e:
        print("❌ LIME Error:", e)
        return "", []

# =====================================================
# DEBUG
# =====================================================
@app.get("/debug/features")
def debug_features():
    return {"feature_names_in": model.feature_names_in_.tolist()}

# =====================================================
# PREDICT
# =====================================================
@app.post("/predict")
async def predict_transaction(data: PredictionRequest, request: Request):
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")

        # FETCH USER HISTORY
        history = supabase.table("transactions").select("*").eq("auth_id", data.user_id).order("created_at", desc=True).limit(20).execute()
        history_data = history.data or []

        # CALCULATE CUSTOM FEATURES (used for risk logic, not model input)
        current_time = pd.Timestamp.now()
        current_hour = current_time.hour
        irregular_time = int(current_hour < 8 or current_hour > 22)

        count_30min = 0
        for row in history_data:
            try:
                ts = pd.to_datetime(row["created_at"])
                if (abs((current_time - ts).total_seconds()) / 60) <= 30:
                    count_30min += 1
            except:
                pass
        velocity_30min = count_30min

        # IMPOSSIBLE TRAVEL — detects rapid location switching across recent history
        impossible_travel = 0
        location_switches = 0
        unique_locations_1hr = set()
        unique_locations_1hr.add(data.location)

        for i, row in enumerate(history_data):
            try:
                ts = pd.to_datetime(row["created_at"])
                diff_mins = abs((current_time - ts).total_seconds()) / 60
                row_loc = row.get("location", "")

                # Collect unique locations in last 1 hour
                if diff_mins <= 60 and row_loc:
                    unique_locations_1hr.add(row_loc)

                # Count back-and-forth switches across last 6 hours
                if diff_mins <= 360 and i < len(history_data) - 1:
                    next_loc = history_data[i + 1].get("location", "")
                    if row_loc and next_loc and row_loc != next_loc:
                        location_switches += 1
            except:
                pass

        if len(unique_locations_1hr) >= 3:
            impossible_travel = 2   # 3+ locations in 1hr = definitely impossible
        elif len(unique_locations_1hr) == 2:
            impossible_travel = 1   # 2 locations in 1hr = suspicious
        elif location_switches >= 3:
            impossible_travel = 1   # frequent back-and-forth over 6hrs

        # BUILD MODEL INPUT
        X = pd.DataFrame([{
            "amount": data.amount,
            "category": data.category,
            "location": data.location,
            "device_type": data.device_type,
            "anomaly_score": 0.0,
            "confidence": 0.95,
            "fraud_probability": 0.0,
            "transaction_type": data.transaction_type,
        }])

        # ENCODE CATEGORICALS
        categorical_cols = ["location", "device_type", "transaction_type", "category"]
        for col in categorical_cols:
            try:
                X[col] = encoders[col].transform(X[col].astype(str))
            except:
                X[col] = 0

        # REORDER TO MATCH TRAINING
        X = X[FEATURE_ORDER]

        # PREDICT
        probabilities = model.predict_proba(X)[0]
        model_score = float(probabilities[1])

        # RISK FACTORS + RULE-BASED SCORE BOOST
        # The model sees anomaly_score/fraud_probability as 0 at inference
        # time (unknown), so we compensate with explicit business rules.
        risk_factors = []
        rule_boost = 0.0

        if data.amount >= 200000:
            risk_factors.append("Extremely high transaction amount")
            rule_boost += 0.55
        elif data.amount >= 100000:
            risk_factors.append("Very high transaction amount")
            rule_boost += 0.40
        elif data.amount >= 50000:
            risk_factors.append("High transaction amount")
            rule_boost += 0.20
        elif data.amount >= 25000:
            risk_factors.append("Elevated transaction amount")
            rule_boost += 0.10

        if velocity_30min >= 5:
            risk_factors.append("Very high transaction velocity")
            rule_boost += 0.25
        elif velocity_30min >= 3:
            risk_factors.append("High transaction velocity")
            rule_boost += 0.15

        if impossible_travel == 2:
            risk_factors.append("Impossible travel detected (multiple locations in 1 hour)")
            rule_boost += 0.45
        elif impossible_travel == 1:
            risk_factors.append("Suspicious location switching detected")
            rule_boost += 0.30

        if irregular_time:
            risk_factors.append("Irregular transaction time")
            rule_boost += 0.10

        # Combine: model score + rule boost, capped at 1.0
        fraud_probability = min(model_score + rule_boost, 1.0)

        fraud_status = "normal"
        risk_level = "low"
        if fraud_probability >= 0.75:
            fraud_status, risk_level = "fraud", "high"
        elif fraud_probability >= 0.45:
            fraud_status, risk_level = "anomaly", "medium"

        # SAVE TO SUPABASE
        transaction_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"
        insert_data = {
            "transaction_id": transaction_id,
            "amount": data.amount,
            "category": data.category,
            "location": data.location,
            "device_type": data.device_type,
            "transaction_type": data.transaction_type,
            "fraud_status": fraud_status,
            "risk_level": risk_level,
            "fraud_probability": fraud_probability,
            "anomaly_score": fraud_probability,
            "confidence": 0.95,
            "prediction_factors": risk_factors,
            "status": "completed",
            "auth_id": data.user_id,
            "transaction_time": current_time.isoformat(),  # ✅ NOT NULL column
        }
        # Use user's JWT so RLS allows the insert
        token = request.headers.get("Authorization", "").replace("Bearer ", "").strip()
        if token:
            authed_client = create_client(SUPABASE_URL, SUPABASE_KEY)
            authed_client.postgrest.auth(token)
        else:
            authed_client = supabase

        print("💾 Inserting to Supabase:", insert_data)
        db_response = authed_client.table("transactions").insert(insert_data).execute()
        print("✅ Supabase insert response:", db_response.data)
        if not db_response.data:
            print("⚠️ Insert returned no data — possible RLS policy block or schema mismatch")
        print(f"🔍 model_score={model_score}, rule_boost={rule_boost}, fraud_probability={fraud_probability}, amount={data.amount}")
        return {
            "success": True,
            "transaction_id": transaction_id,
            "prediction": fraud_status,
            "riskLevel": risk_level,
            "probability": round(fraud_probability, 4),
            "anomalyScore": round(fraud_probability, 4),
            "confidence": 0.95,
            "velocity_30min": velocity_30min,
            "impossible_travel": impossible_travel,
            "irregular_time": irregular_time,
            "factors": risk_factors,
        }
    except Exception as e:
        print("❌ Prediction Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================
# DB TEST
# =====================================================
@app.get("/debug/db-test")
async def db_test():
    import uuid
    test_id = f"TEST-{uuid.uuid4().hex[:6].upper()}"
    try:
        res = supabase.table("transactions").insert({
            "transaction_id": test_id,
            "amount": 999.0,
            "category": "Retail",
            "location": "Test City",
            "device_type": "Mobile",
            "transaction_type": "purchase",
            "fraud_status": "normal",
            "risk_level": "low",
            "fraud_probability": 0.01,
            "anomaly_score": 0.01,
            "confidence": 0.95,
            "prediction_factors": [],
            "status": "completed",
            "auth_id": "00000000-0000-0000-0000-000000000000",
        }).execute()
        return {"success": True, "inserted": res.data, "error": None}
    except Exception as e:
        return {"success": False, "inserted": None, "error": str(e)}

# =====================================================
# EXPLAINABILITY
# =====================================================
@app.get("/api/explain/{txn_no}")
async def explain_transaction(txn_no: str):
    try:
        txn = fetch_transaction(txn_no)

        X = pd.DataFrame([{
            "amount": float(txn.get("amount", 0)),
            "category": txn.get("category", "Other"),
            "location": txn.get("location", "Unknown"),
            "device_type": txn.get("device_type", "Unknown"),
            "anomaly_score": float(txn.get("anomaly_score", 0)),
            "confidence": float(txn.get("confidence", 0.95)),
            "fraud_probability": float(txn.get("fraud_probability", 0)),
            "transaction_type": txn.get("transaction_type", "payment"),
        }])

        categorical_cols = ["location", "device_type", "transaction_type", "category"]
        for col in categorical_cols:
            try:
                X[col] = encoders[col].transform(X[col].astype(str))
            except:
                X[col] = 0

        # REORDER TO MATCH TRAINING
        X = X[FEATURE_ORDER]

        shap_plot = generate_shap(X)
        lime_html, lime_features = generate_lime(X, feature_names=X.columns.tolist())

        return {
            "success": True,
            "transaction": txn,
            "shap_plot": shap_plot,
            "lime_html": lime_html,
            "lime_features": lime_features,
        }
    except Exception as e:
        print("❌ Explainability Error:", e)
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, h11_max_incomplete_event_size=65536)