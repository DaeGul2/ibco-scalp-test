import React from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Image, ListGroup, Alert, ProgressBar } from "react-bootstrap";
import "./BoundingBox.css"; // YOLO 박스 스타일 추가

// 🔥 추천 제품 URL & 썸네일 매핑
const productInfo = {
  "키즈샴푸": {
    url: "https://modoobr.kr/product/%EB%AA%A8%EB%91%90%EB%B0%94%EB%A5%B8-%ED%82%A4%EC%A6%88-%EC%83%B4%ED%91%B8-400ml/29/category/55/display/1/",
    thumbnail: "/images/키즈샴푸.png"
  },
  "틴에이저샴푸": {
    url: "https://modoobr.kr/product/%EB%AA%A8%EB%91%90%EB%B0%94%EB%A5%B8-%ED%8B%B4%EC%97%90%EC%9D%B4%EC%A0%80-%EC%83%B4%ED%91%B8-400ml/20/category/54/display/1/",
    thumbnail: "/images/틴에이저.png"
  },
  "트리트먼트": {
    url: "https://modoobr.kr/product/%EB%AA%A8%EB%91%90%EB%B0%94%EB%A5%B8-non-%EC%8B%A4%EB%A6%AC%EC%BD%98-%ED%8A%B8%EB%A6%AC%ED%8A%B8%EB%A8%BC%ED%8A%B8-200ml/39/category/54/display/1/",
    thumbnail: "/images/트리트먼트.png"
  },
  "바디워시": {
    url: "https://modoobr.kr/product/%EB%AA%A8%EB%91%90%EB%B0%94%EB%A5%B8-%ED%82%A4%EC%A6%88%EB%A7%98-%EC%95%84%ED%86%A0-%EB%B0%94%EB%94%94%EC%9B%8C%EC%8B%9C-480ml-%EB%AC%B4%ED%96%A5/56/category/56/display/1/",
    thumbnail: "/images/바디워시.png"
  }
};

// 🔥 점수에 따라 색상 변경
const getScoreVariant = (score) => {
  if (score >= 80) return "success"; // 건강한 상태 (초록)
  if (score >= 50) return "warning"; // 보통 (주황)
  return "danger"; // 문제 있음 (빨강)
};

const ResultPage = () => {
  const { state } = useLocation();
  console.log("📷 결과 페이지에서 받은 데이터:", state);

  if (!state || !state.imageUrl) {
    return <div className="text-center mt-5 text-danger">❌ 진단 결과를 찾을 수 없습니다.</div>;
  }

  return (
    <Container className="mt-5">
      <h2 className="text-center">🩺 두피 진단 결과</h2>

      {/* 🔥 진단 불가 시 메시지 출력 */}
      {state.result === 0 ? (
        <Alert variant="danger" className="text-center">
          ❌ <b>진단 불가</b>: 사진이 너무 어둡거나 두피가 제대로 보이지 않습니다. 다시 촬영해주세요.
        </Alert>
      ) : (
        <>
          <Row>
            {/* 🔥 좌측: 분석된 이미지 */}
            <Col md={6} className="d-flex flex-column align-items-center">
              <div className="image-container">
                <Image src={state.imageUrl} className="yolo-image" alt="Uploaded scalp image" />
                {state.yoloBoxes && state.yoloBoxes.length > 0 && state.yoloBoxes.map((box, index) => (
                  <div
                    key={index}
                    className="yolo-box"
                    style={{
                      left: `${box.x}px`,
                      top: `${box.y}px`,
                      width: `${box.width}px`,
                      height: `${box.height}px`
                    }}
                  ></div>
                ))}
              </div>
            </Col>

            {/* 🔥 우측: AI 분석 결과 + 점수 */}
            <Col md={6}>
              <Card className="p-3 mb-3 text-start">
                <h5>🔍 AI 분석 결과</h5>
                <p>{state.analysis}</p>
              </Card>

              <Card className="p-3 text-start">
                <h5>📖 분석 근거</h5>
                <p>{state.analysis_reason}</p>
              </Card>

              {/* 🔥 평가 항목 점수 */}
              <Card className="p-3 mt-3 text-start">
                <h5>📊 두피 평가 점수 (0~100)</h5>
                <ListGroup>
                  <ListGroup.Item>
                    <b>유분 상태:</b> {state.scores.sebum}점
                    <ProgressBar variant={getScoreVariant(state.scores.sebum)} now={state.scores.sebum} />
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <b>각질 상태:</b> {state.scores.flaking}점
                    <ProgressBar variant={getScoreVariant(state.scores.flaking)} now={state.scores.flaking} />
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <b>두피 수분 상태:</b> {state.scores.moisture}점
                    <ProgressBar variant={getScoreVariant(state.scores.moisture)} now={state.scores.moisture} />
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <b>두피 염증 여부:</b> {state.scores.inflammation}점
                    <ProgressBar variant={getScoreVariant(state.scores.inflammation)} now={state.scores.inflammation} />
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>

          {/* 🔥 추천 제품 섹션 */}
          <h4 className="mt-5 text-center">🛍️ 추천 제품</h4>
          <Row>
            {state.recommendation && state.recommendation.length > 0 ? (
              state.recommendation.map((product, index) => {
                const productData = productInfo[product.product_name]; // 🔥 제품 정보 가져오기
                return (
                  <Col md={3} key={index} className="d-flex justify-content-center">
                    <Card className="p-3 text-start w-100">
                      {productData && (
                        <Image src={productData.thumbnail} alt={product.product_name} width={100} height={100} className="mx-auto d-block" />
                      )}
                      <div className="mt-3">
                        <h6><b>{product.product_name}</b></h6>
                        <p className="text-muted">{product.reason}</p>
                        {productData && (
                          <a href={productData.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                            제품 상세 보기 →
                          </a>
                        )}
                      </div>
                    </Card>
                  </Col>
                );
              })
            ) : (
              <p className="text-muted text-center">추천할 제품이 없습니다.</p>
            )}
          </Row>

          {/* 🔥 주의사항 추가 */}
          <Alert variant="secondary" className="mt-4 text-center">
            ⚠️ 본 자가진단 프로그램은 부정확할 수 있습니다.  
            실제 자세한 진단은 반드시 전문 의료인을 찾아가시거나 병원에서 받으시기 바랍니다.
          </Alert>
        </>
      )}
    </Container>
  );
};

export default ResultPage;
