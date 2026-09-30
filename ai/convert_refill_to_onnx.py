import joblib
import pandas as pd

from skl2onnx import to_onnx
from skl2onnx.common.data_types import FloatTensorType


# Load trained scikit-learn model
model = joblib.load(
    "ai/models/refill_model.pkl"
)


# Define input structure
initial_type = [
    (
        "float_input",
        FloatTensorType([None, 3])
    )
]


# Convert model to ONNX
onnx_model = to_onnx(
    model,
    initial_types=initial_type,
    target_opset=17
)


# Save ONNX model
with open(
    "ai/models/refill_model.onnx",
    "wb"
) as f:

    f.write(
        onnx_model.SerializeToString()
    )


print(
    "AquaVision Refill Model converted to ONNX successfully!"
)

print(
    "Saved: ai/models/refill_model.onnx"
)