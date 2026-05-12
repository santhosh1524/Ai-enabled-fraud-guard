import pandas as pd
import xgboost as xgb
import joblib
import numpy as np
import matplotlib.pyplot as plt
import shap

from math import radians, sin, cos, sqrt, atan2
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, roc_auc_score

# ---------------------------------------------------
# LOAD DATA
# ---------------------------------------------------

df = pd.read_csv("transactions.csv")
df["transaction_time"] = pd.to_datetime(df["transaction_time"])

# ---------------------------------------------------
# LOCATION COORDINATES
# ---------------------------------------------------

location_coords = {
    "Paris, FR": (48.8566, 2.3522),
    "Tokyo, JP": (35.6762, 139.6503),
    "New York, US": (40.7128, -74.0060),
    "London, UK": (51.5074, -0.1278),
    "Unknown": (0, 0)
}

# ---------------------------------------------------
# TIME FEATURE
# ---------------------------------------------------

df["hour"] = df["transaction_time"].dt.hour
df["irregular_time"] = ((df["hour"] < 8) | (df["hour"] > 22)).astype(int)

# ---------------------------------------------------
# SORT FOR SEQUENTIAL FEATURES
# ---------------------------------------------------

df = df.sort_values(by=["user_id", "transaction_time"])

df["prev_location"] = df.groupby("user_id")["location"].shift(1)
df["prev_time"] = df.groupby("user_id")["transaction_time"].shift(1)

df["time_diff_minutes"] = (
    (df["transaction_time"] - df["prev_time"])
    .dt.total_seconds() / 60
)

# ---------------------------------------------------
# HAVERSINE DISTANCE FUNCTION
# ---------------------------------------------------

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

# ---------------------------------------------------
# TRAVEL SPEED CALCULATION
# ---------------------------------------------------

def calculate_speed(row):
    if pd.isna(row["prev_location"]) or row["location"] == row["prev_location"]:
        return 0

    loc1 = location_coords.get(row["prev_location"], (0, 0))
    loc2 = location_coords.get(row["location"], (0, 0))

    distance = haversine(loc1[0], loc1[1], loc2[0], loc2[1])
    hours = row["time_diff_minutes"] / 60 if row["time_diff_minutes"] > 0 else 0

    if hours == 0:
        return 0

    return distance / hours

df["travel_speed_kmh"] = df.apply(calculate_speed, axis=1)
df["impossible_travel"] = (df["travel_speed_kmh"] > 900).astype(int)
df["impossible_travel"] = df["impossible_travel"].fillna(0)

# ---------------------------------------------------
# VELOCITY FEATURE (transactions in last 30 mins)
# ---------------------------------------------------

df["velocity_30min"] = 0

for user in df["user_id"].unique():
    user_df = df[df["user_id"] == user]

    for idx in user_df.index:
        current_time = df.loc[idx, "transaction_time"]
        window_start = current_time - pd.Timedelta(minutes=30)

        count = user_df[
            (user_df["transaction_time"] >= window_start) &
            (user_df["transaction_time"] <= current_time)
        ].shape[0]

        df.loc[idx, "velocity_30min"] = count

# ---------------------------------------------------
# GENERATE REALISTIC FRAUD LABEL
# ---------------------------------------------------

np.random.seed(42)

base_prob = df["amount"] / 150000
random_noise = np.random.rand(len(df)) * 0.3

location_risk = df["location"].isin(["Unknown", "Tokyo, JP"]) * 0.25
device_risk = (df["device_type"] == "Desktop") * 0.15
type_risk = (df["transaction_type"] == "transfer") * 0.2
time_risk = df["irregular_time"] * 0.2
travel_risk = df["impossible_travel"] * 0.3
velocity_risk = (df["velocity_30min"] > 3) * 0.25

final_prob = (
    base_prob
    + random_noise
    + location_risk
    + device_risk
    + type_risk
    + time_risk
    + travel_risk
    + velocity_risk
)

df["fraud_label"] = (final_prob > 0.65).astype(int)

# ---------------------------------------------------
# ENCODE CATEGORICAL FEATURES
# ---------------------------------------------------

categorical_cols = ["location", "device_type", "transaction_type", "category"]
encoders = {}

for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le

# ---------------------------------------------------
# SELECT FEATURES
# ---------------------------------------------------

X = df[
    [
        "amount",
        "location",
        "device_type",
        "transaction_type",
        "category",
        "irregular_time",
        "impossible_travel",
        "velocity_30min"
    ]
]

y = df["fraud_label"]

# ---------------------------------------------------
# TRAIN / TEST SPLIT
# ---------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# ---------------------------------------------------
# TRAIN XGBOOST
# ---------------------------------------------------

model = xgb.XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    eval_metric="logloss"
)

model.fit(X_train, y_train)

# ---------------------------------------------------
# EVALUATION
# ---------------------------------------------------

y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("ROC-AUC:", roc_auc_score(y_test, y_prob))
print("Impossible travel count:", df["impossible_travel"].sum())
print("Velocity bursts (>3 in 30min):", (df["velocity_30min"] > 3).sum())

# ---------------------------------------------------
# FEATURE IMPORTANCE
# ---------------------------------------------------

xgb.plot_importance(model)
plt.title("Feature Importance")
plt.show()
# ---------------------------------------------------
# SHAP EXPLAINABILITY (COMPATIBLE VERSION)
# ---------------------------------------------------

import shap

# Use smaller sample for speed
X_sample = X_test.sample(min(20, len(X_test)), random_state=42)

# Create prediction function
def predict_fn(data):
    return model.predict_proba(data)[:, 1]

explainer = shap.KernelExplainer(predict_fn, X_sample)

shap_values = explainer.shap_values(X_sample)

shap.summary_plot(shap_values, X_sample)

# ---------------------------------------------------
# SAVE MODEL
# ---------------------------------------------------

joblib.dump(model, "fraud_model.pkl")
joblib.dump(encoders, "encoders.pkl")

print("\nModel saved successfully.")