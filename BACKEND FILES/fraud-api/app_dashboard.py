import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

# ---------------- CONFIG ----------------
SUPABASE_URL = "https://dwqgopgljgdlsffqsioj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3cWdvcGdsamdkbHNmZnFzaW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2OTA4MzAsImV4cCI6MjA4NDI2NjgzMH0.eryK5bg7dT5gcdT8vyYffc7q8UjyP6TgcCv9G19KA7o"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- ROOT ----------------
@app.get("/")
def root():
    return {"message": "Dashboard API running"}

# ---------------- DASHBOARD API ----------------
@app.get("/api/dashboard")
def dashboard():

    res = supabase.table("transactions").select("*").execute()
    data = res.data

    if not data:
        return {
            "total": 0,
            "fraud": 0,
            "anomaly": 0,
            "monthly": [],
            "distribution": {},
            "anomaly_dist": []
        }

    df = pd.DataFrame(data)

    # ---------------- BASIC STATS ----------------
    total = len(df)
    fraud = len(df[df["fraud_probability"] > 0.7])
    anomaly = len(df[df["anomaly_score"] > 0.6])

    # ---------------- MONTHLY ----------------
    df["created_at"] = pd.to_datetime(df["created_at"])
    df["month"] = df["created_at"].dt.strftime("%b")

    monthly = df.groupby("month").size().reset_index(name="count")

    # ---------------- PIE ----------------
    distribution = {
        "legit": total - fraud,
        "fraud": fraud,
        "anomaly": anomaly
    }

    # ---------------- ANOMALY DISTRIBUTION ----------------
    bins = pd.cut(df["anomaly_score"], bins=[0,0.2,0.4,0.6,0.8,1.0])
    dist = bins.value_counts().sort_index()

    anomaly_dist = [
        {"range": str(k), "count": int(v)}
        for k, v in dist.items()
    ]

    return {
        "total": total,
        "fraud": fraud,
        "anomaly": anomaly,
        "monthly": monthly.to_dict(orient="records"),
        "distribution": distribution,
        "anomaly_dist": anomaly_dist
    }