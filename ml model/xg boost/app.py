from fastapi import FastAPI
import numpy as np
import xgboost as xgb
from sklearn.ensemble import RandomForestClassifier
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from pydantic import BaseModel

app = FastAPI()


# ---------------------------
# Request schema
# ---------------------------

class Transaction(BaseModel):
    amount: float


# ---------------------------
# Dummy models (replace later)
# ---------------------------

# Random Forest
rf_model = RandomForestClassifier()
rf_model.fit([[1000], [60000]], [0, 1])


# XGBoost
xgb_model = xgb.XGBClassifier(use_label_encoder=False, eval_metric="logloss")
xgb_model.fit([[1000], [60000]], [0, 1])


# Neural Network
nn_model = Sequential([
    Dense(8, input_shape=(1,), activation="relu"),
    Dense(1, activation="sigmoid")
])

nn_model.compile(
    loss="binary_crossentropy",
    optimizer="adam"
)

# dummy training
nn_model.fit(np.array([[1000],[60000]]), np.array([0,1]), epochs=5, verbose=0)


# ---------------------------
# Health check
# ---------------------------

@app.get("/")
def home():
    return {"status": "Fraud Detection ML API running"}


# ---------------------------
# Prediction endpoint
# ---------------------------

@app.post("/predict")
def predict(transaction: Transaction):

    amount = transaction.amount

    features = np.array([[amount]])

    rf_prob = float(rf_model.predict_proba(features)[0][1])
    xgb_prob = float(xgb_model.predict_proba(features)[0][1])
    nn_prob = float(nn_model.predict(features)[0][0])

    return {
        "random_forest": rf_prob,
        "xgboost": xgb_prob,
        "neural_network": nn_prob
    }