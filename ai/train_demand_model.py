import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import joblib

data = pd.read_csv("ai/demand_data.csv")

X = data[
    [
        "orders",
        "festival",
        "temperature"
    ]
]

y = data["demand"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

score = model.score(X_test, y_test)

print("AquaVision Demand Forecast Model")
print("--------------------------------")
print("Model trained successfully!")
print("R² score:", round(score, 2))

joblib.dump(
    model,
    "ai/models/demand_model.pkl"
)

print("Model saved to ai/models/demand_model.pkl")