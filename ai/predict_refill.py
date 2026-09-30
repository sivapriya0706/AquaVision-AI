import joblib
import pandas as pd

model = joblib.load("ai/models/refill_model.pkl")

customer = pd.DataFrame([{
    "avg_days_between_refills": 7,
    "total_refills": 12,
    "days_since_last_refill": 8
}])

prediction = model.predict(customer)[0]

if prediction == 1:
    print("Refill Prediction: Refill likely needed soon")
else:
    print("Refill Prediction: Refill not needed yet")