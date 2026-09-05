import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import io
from PIL import Image

from app.main import app
from app.services.face_service import face_service

client = TestClient(app)

def create_dummy_image(format="JPEG", size=(100, 100)):
    img = Image.new("RGB", size, color="white")
    buf = io.BytesIO()
    img.save(buf, format=format)
    buf.seek(0)
    return buf.read()

class DummyFace:
    def __init__(self):
        import numpy as np
        self.embedding = np.random.rand(512).astype(np.float32)

@pytest.fixture
def mock_insightface():
    with patch("app.services.face_service.FaceAnalysis.get") as mock_get:
        yield mock_get

def test_encode_face_valid(mock_insightface):
    mock_insightface.return_value = [DummyFace()]
    
    img_bytes = create_dummy_image()
    response = client.post(
        "/api/face/encode",
        files={"image": ("test.jpg", img_bytes, "image/jpeg")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["detected"] is True
    assert data["face_count"] == 1
    assert data["selected_face"] == 0
    assert data["embedding_generated"] is True

def test_encode_face_no_face(mock_insightface):
    mock_insightface.return_value = []
    
    img_bytes = create_dummy_image()
    response = client.post(
        "/api/face/encode",
        files={"image": ("test.jpg", img_bytes, "image/jpeg")}
    )
    
    assert response.status_code == 400
    data = response.json()
    assert data["error_code"] == "NO_FACE"

def test_encode_face_multiple_faces(mock_insightface):
    mock_insightface.return_value = [DummyFace(), DummyFace()]
    
    img_bytes = create_dummy_image()
    response = client.post(
        "/api/face/encode",
        files={"image": ("test.jpg", img_bytes, "image/jpeg")}
    )
    
    assert response.status_code == 400
    data = response.json()
    assert data["error_code"] == "MULTIPLE_FACES"

def test_encode_face_multiple_faces_selected(mock_insightface):
    mock_insightface.return_value = [DummyFace(), DummyFace()]
    
    img_bytes = create_dummy_image()
    response = client.post(
        "/api/face/encode",
        data={"selected_face_index": 1},
        files={"image": ("test.jpg", img_bytes, "image/jpeg")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["face_count"] == 2
    assert data["selected_face"] == 1

def test_invalid_extension():
    img_bytes = create_dummy_image(format="BMP")
    response = client.post(
        "/api/face/encode",
        files={"image": ("test.bmp", img_bytes, "image/bmp")}
    )
    
    assert response.status_code == 400
    assert response.json()["error_code"] == "INVALID_IMAGE"

def test_corrupt_image():
    response = client.post(
        "/api/face/encode",
        files={"image": ("test.jpg", b"not_an_image", "image/jpeg")}
    )
    
    assert response.status_code == 400
    assert response.json()["error_code"] == "INVALID_IMAGE"
