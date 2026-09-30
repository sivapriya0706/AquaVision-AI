import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

data = pd.read_csv("ai/payment_data.csv")

data["amount_pending"] = (
    data["total_bill"] - data["amount_paid"]
)

data["payment_risk"] = (
    (data["days_overdue"] > 7) |
    (data["amount_pending"] > 500)
).astype(int)

X = data[
    [
        "total_bill",
        "amount_paid",
        "amount_pending",
        "days_overdue"
    ]
]

y = data["payment_risk"]

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X, y)

joblib.dump(
    model,
    "ai/models/payment_model.pkl"
)

print("AquaVision Payment Intelligence Model")
print("--------------------------------------")
print("Model trained successfully!")
print("Model saved to ai/models/payment_model.pkl")