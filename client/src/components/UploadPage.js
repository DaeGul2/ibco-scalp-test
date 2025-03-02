import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Button, Form, Alert, Spinner } from "react-bootstrap";
import "./LoadingDots.css";  // 🔥 로딩 애니메이션 스타일 추가

const UploadPage = () => {
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);  // ✅ 로딩 상태 추가
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("JPG 또는 PNG 파일만 업로드 가능합니다.");
      return;
    }

    setError("");
    setImage(file);
  };

  const handleUpload = async () => {
    if (!image) {
      setError("사진을 업로드해주세요!");
      return;
    }

    setLoading(true);  // ✅ 로딩 시작
    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await axios.post(`${process.env.REACT_APP_SERVER_URL}/upload`, formData);
      navigate("/result", { state: { imageUrl: res.data.imageUrl, analysis: res.data.analysis } });
    } catch (err) {
      console.error(err);
      setError("업로드 중 오류 발생");
    }
    
    setLoading(false);  // ✅ 로딩 종료
  };

  return (
    <Container className="text-center mt-5">
      <h2 className="mb-4">모두바른 두피진단 자가프로그램</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label><b>두피 사진을 업로드하세요</b></Form.Label>
        <Form.Control type="file" onChange={handleFileChange} accept="image/jpeg, image/png" />
      </Form.Group>

      {image && (
        <div className="mb-3">
          <img src={URL.createObjectURL(image)} alt="Uploaded preview" className="img-thumbnail" width={200} />
        </div>
      )}

      {!loading ? (
        <Button variant="primary" onClick={handleUpload}>
          진단받기
        </Button>
      ) : (
        <div className="loading-container">
          <p>🔍 분석 중...</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
    </Container>
  );
};

export default UploadPage;
