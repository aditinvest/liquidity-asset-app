from fastapi import FastAPI, UploadFile, File
import shutil
import os

app = FastAPI()

@app.post("/test-upload")
async def test_upload(file: UploadFile = File(...)):
    try:
        # Read file content
        content = await file.read()
        print(f"File size: {len(content)} bytes")
        print(f"File name: {file.filename}")
        return {"message": "Success", "size": len(content)}
    except Exception as e:
        print(f"Error: {e}")
        raise
