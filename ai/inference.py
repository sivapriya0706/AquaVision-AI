from datetime import date, timedelta

print("AquaVision AI Engine Started")
print("-" * 40)

# Sample customer order history
previous_refills = [7, 6, 8, 7, 6]

average_days = sum(previous_refills) / len(previous_refills)

last_refill = date.today() - timedelta(days=average_days)

predicted_next_refill = last_refill + timedelta(days=average_days)

print("Average refill interval:", round(average_days, 1), "days")
print("Predicted next refill:", predicted_next_refill)