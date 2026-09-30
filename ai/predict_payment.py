import joblib
import pandas as pd

model = joblib.load("ai/models/payment_model.pkl")

customer = pd.DataFrame([{
    "total_bill": 2200,
    "amount_paid": 800,
    "amount_pending": 1400,
    "days_overdue": 20
}])

prediction = model.predict(customer)[0]

print("AquaVision Payment Intelligence")
print("--------------------------------")

if prediction == 1:
    print("Payment Insight: High payment risk")
    print("Action: Payment reminder recommended")
else:
    print("Payment Insight: Payment appears normal")