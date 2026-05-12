import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from supabase import create_client, Client

# 1. Supabase Connection
URL = "https://dwqgopgljgdlsffqsioj.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3cWdvcGdsamdkbHNmZnFzaW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2OTA4MzAsImV4cCI6MjA4NDI2NjgzMH0.eryK5bg7dT5gcdT8vyYffc7q8UjyP6TgcCv9G19KA7o" # Ensure this is correct!
supabase: Client = create_client(URL, KEY)

def train_and_save():
    print("⏳ Fetching data from Supabase...")
    response = supabase.table("transactions").select("*").execute()
    df = pd.DataFrame(response.data)

    if df.empty:
        print("❌ Error: Supabase table is empty.")
        return

    # 2. Target Encoding (Convert "fraud" to 1, others to 0)
    # This fixes the KeyError: 'is_fraud'
    df['target'] = df['fraud_status'].apply(lambda x: 1 if x == 'fraud' else 0)

    # 3. Feature Encoding
    encoders = {}
    # Based on your CSV: location, device_type, transaction_type, category
    categorical_cols = ["location", "device_type", "transaction_type", "category"]
    
    for col in categorical_cols:
        le = LabelEncoder()
        # Handle potential missing values by converting to string
        df[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
    
    # 4. Define Features (X) and Target (y)
    # We drop ID, Timestamp, and any string/JSON columns the model can't read
    drop_cols = [
        'id', 'auth_id', 'transaction_id', 'fraud_status', 
        'risk_level', 'created_at', 'transaction_time', 
        'prediction_factors', 'status', 'target'
    ]
    X = df.drop(columns=drop_cols, errors='ignore')
    y = df['target']

    print(f"✅ Training on features: {X.columns.tolist()}")

    # 5. Train and Save
    print("🤖 Training Fraud Detection Model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)

    joblib.dump(model, "fraud_model.pkl")
    joblib.dump(encoders, "encoders.pkl")
    print("✨ Success! 'fraud_model.pkl' and 'encoders.pkl' are ready.")

if __name__ == "__main__":
    train_and_save()