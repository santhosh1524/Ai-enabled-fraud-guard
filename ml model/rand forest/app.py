from sklearn.ensemble import RandomForestClassifier

# Training the Random Forest
rf_model = RandomForestClassifier(n_estimators=100, max_features='sqrt', random_state=42)
rf_model.fit(X_train, y_train)

# Confidence Score logic: How many trees agreed on the classification?
# If 90/100 trees say 'Normal', your confidence is 90%.
probs = rf_model.predict_proba(X)
df['confidence'] = [max(p) for p in probs]

print("Random Forest Accuracy:", rf_model.score(X_test, y_test))