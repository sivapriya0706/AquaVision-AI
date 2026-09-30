import joblib
import pandas as pd

model = joblib.load("ai/models/demand_model.pkl")

future_data = pd.DataFrame([{
    "orders": 65,
    "festival": 0,
    "temperature": 34
}])

prediction = model.predict(future_data)[0]

print("AquaVision Demand Forecast")
print("---------------------------")
print("Predicted Water Can Demand:", round(prediction), "cans")