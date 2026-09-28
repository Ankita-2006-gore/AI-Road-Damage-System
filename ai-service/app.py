from fastapi import FastAPI, File, UploadFile
from ultralytics import YOLO
import shutil
from pathlib import Path

app = FastAPI(title="RoadGuard AI")

# Load the trained road damage model
model = YOLO("best.pt")


@app.get("/")
def root():
    return {
        "message": "RoadGuard AI AI service is running!"
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # Create temporary upload folder
    upload_dir = Path("temp_uploads")
    upload_dir.mkdir(exist_ok=True)

    # Save uploaded image
    file_path = upload_dir / file.filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run YOLO detection
    results = model(str(file_path), conf=0.25)

    detections = []

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            detections.append({
                "damage_type": model.names[class_id],
                "confidence": round(confidence * 100, 2)
            })

    return {
        "message": "Detection completed",
        "detections": detections
    }