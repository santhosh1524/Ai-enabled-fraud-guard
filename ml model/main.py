from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow your React app to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Load your saved model from the exact location
MODEL_PATH = r'C:\Users\ELCOT\Desktop\project\ml model\fraud_model.joblib'
model = joblib.load(MODEL_PATH)

# Define what a transaction looks like
class Transaction(BaseModel):
    amount: float
    loc_enc: int
    dev_enc: int
    cat_enc: int

@app.post("/predict")
def predict_fraud(data: Transaction):
    # Convert incoming JSON to a DataFrame for the model
    input_data = pd.DataFrame([data.dict()])
    
    # Get prediction and probability
    prediction = model.predict(input_data)[0]
    probability = model.predict_proba(input_data)[0][1]
    
    return {
        "is_fraud": int(prediction),
        "fraud_probability": round(float(probability), 4),
        "status": "High Risk" if probability > 0.7 else "Low Risk"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)