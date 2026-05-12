from sklearn.ensemble import IsolationForest
import pandas as pd

# Selecting features similar to your DB: Amount, Location Risk, etc.
features = ['amount', 'location_risk', 'device_score', 'hour_of_day']
X = df[features]

# contamination=0.05 assumes roughly 5% of transactions are anomalies
iso_forest = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
df['anomaly_prediction'] = iso_forest.fit_predict(X)

# Convert -1 (anomaly) and 1 (normal) to your 0-1 scale
df['anomaly_score'] = iso_forest.decision_function(X) 
print(df[['transaction_id', 'anomaly_score']].head())