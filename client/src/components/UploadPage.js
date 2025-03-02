import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Button, Form, Alert, Image, Row, Col, Card } from "react-bootstrap";
import "./LoadingDots.css"; // 로딩 애니메이션

const UploadPage = () => {
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 파일 선택 핸들러
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

  // 이미지 업로드 & 백엔드로 전송
  const handleUpload = async () => {
    if (!image) {
      setError("사진을 업로드해주세요!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await axios.post(`${process.env.REACT_APP_SERVER_URL}/upload`, formData);
      navigate("/result", { state: { ...res.data } });

    } catch (err) {
      console.error(err);
      setError("업로드 중 오류 발생");
    }

    setLoading(false);
  };

  return (
    <Container className="text-center mt-5">
      {/* 제목 */}
      <h2 className="fw-bold">🩺 모두바른 두피진단 자가프로그램</h2>
      <p className="text-muted">두피 상태를 분석하고 적절한 제품을 추천받으세요!</p>

      {/* 사용법 안내 */}
      <Row className="justify-content-center my-4">
        <Col md={5}>
          <Card>
            <Card.Img variant="top" src="/images/good_example.jpg" />
            <Card.Body>
              <Card.Title className="text-success">✅ 올바른 사진 예시</Card.Title>
              <Card.Text>진단받을 부위가 잘 보이도록 가까이 촬영</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={5}>
          <Card>
            <Card.Img variant="top" src="/images/bad_example.png" />
            <Card.Body>
              <Card.Title className="text-danger">❌ 잘못된 사진 예시</Card.Title>
              <Card.Text>어두운 조명, 흐릿한 사진, 먼 거리</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 파일 업로드 */}
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label><b>두피 사진을 업로드하세요</b></Form.Label>
        <Form.Control type="file" onChange={handleFileChange} accept="image/jpeg, image/png" />
      </Form.Group>

      {/* 이미지 미리보기 */}
      {image && (
        <div className="mb-3">
          <Image src={URL.createObjectURL(image)} alt="Uploaded preview" className="img-thumbnail" width={200} />
        </div>
      )}

      {/* 오류 메시지 */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* 진단 버튼 또는 로딩 화면 */}
      {!loading ? (
        <Button variant="primary" onClick={handleUpload}>
          🔍 진단받기
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
