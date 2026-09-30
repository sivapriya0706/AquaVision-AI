import onnxruntime as ort
import numpy as np


model_path = "ai/models/refill_model.onnx"


# Load ONNX model
session = ort.InferenceSession(
    model_path,
    providers=["CPUExecutionProvider"]
)


# Test customer data
input_data = np.array(
    [[7, 12, 8]],
    dtype=np.float32
)


# Get input name
input_name = session.get_inputs()[0].name


# Run prediction
result = session.run(
    None,
    {
        input_name: input_data
    }
)


print("AquaVision ONNX Inference")
print("-------------------------")
print("Input:", input_data.tolist())
print("Prediction:", result[0])
print("ONNX model executed successfully!")