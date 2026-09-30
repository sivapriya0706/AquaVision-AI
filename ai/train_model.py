import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load training data
data = pd.read_csv("ai/refill_data.csv")

# Features
X = data[
    [
        "avg_days_between_refills",
        "total_refills",
        "days_since_last_refill"
    ]
]

# Target
y = data["refill_needed"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Train model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

# Accuracy
accuracy = model.score(X_test, y_test)

print("AquaVision Refill Prediction Model")
print("----------------------------------")
print("Model trained successfully!")
print("Test accuracy:", round(accuracy * 100, 2), "%")

# Save model
joblib.dump(model, "ai/models/refill_model.pkl")

print("Model saved to ai/models/refill_model.pkl")