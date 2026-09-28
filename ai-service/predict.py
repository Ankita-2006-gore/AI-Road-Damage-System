from ultralytics import YOLO

# Load the RDD2022 road damage model
model = YOLO("best.pt")

# Run detection
results = model("road_test.jpg", conf=0.25)

print("\nRoad Damage Detection Results")
print("--------------------------------")

for result in results:
    boxes = result.boxes

    if len(boxes) == 0:
        print("No road damage detected.")
        continue

    for box in boxes:
        class_id = int(box.cls[0])
        confidence = float(box.conf[0])

        class_name = model.names[class_id]

        print(f"Damage Type: {class_name}")
        print(f"Confidence: {confidence * 100:.2f}%")
        print()