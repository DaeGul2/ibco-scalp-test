// src/components/ResultPage.js
import React from "react";
import { useLocation } from "react-router-dom";
import { Image, Card } from "react-bootstrap";

const ResultPage = () => {
  const { state } = useLocation();
  if (!state) return <div>진단 결과가 없습니다.</div>;

  return (
    <div className="container text-center mt-5">
      <h2>진단 결과</h2>
      <Image src={state.imageUrl} fluid rounded className="border mb-3" />
      
      <Card className="p-3">
        <h5>🔍 AI 분석 결과</h5>
        <p>{state.analysis}</p>
      </Card>
    </div>
  );
};

export default ResultPage;
