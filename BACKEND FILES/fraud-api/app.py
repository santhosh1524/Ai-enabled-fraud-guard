import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel

# Load trained model
model = joblib.load("fraud_model.pkl")
encoders = joblib.load("encoders.pkl")

app = FastAPI()

class Transaction(BaseModel):
    amount: float
    location: str
    device_type: str
    transaction_type: str
    category: str
    irregular_time: int
    impossible_travel: int
    velocity_30min: int

@app.post("/predict")
def predict(transaction: Transaction):

    data = pd.DataFrame([transaction.dict()])

    # Encode categorical features
    for col in ["location", "device_type", "transaction_type", "category"]:
        data[col] = encoders[col].transform(data[col])

    prediction = model.predict(data)[0]
    probability = model.predict_proba(data)[0][1]

    return {
        "fraud_prediction": int(prediction),
        "fraud_probability": float(probability)
    }