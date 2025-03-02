require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai"); // ✅ OpenAI 라이브러리 호출 수정

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// ✅ 업로드 폴더 자동 생성
const uploadDir = path.join(__dirname, process.env.UPLOADS_DIR || "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer 설정 (파일 업로드 저장)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, "_")),
});
const upload = multer({ storage });

const PUBLIC_SERVER_URL = process.env.PUBLIC_SERVER_URL || "http://localhost:5000";
app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "true");
  next();
});


app.post("/upload", upload.single("file"), async (req, res) => {
  const imageUrl = `${PUBLIC_SERVER_URL}/${process.env.UPLOADS_DIR}/${req.file.filename}`;
  console.log("🔍 업로드된 이미지 URL:", imageUrl); // ✅ 디버깅용 로그
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", content: `
         두피상태를 분석하되 아래의 내용을 읽고 응답해주세요. 응답시에는 반드시 적절한 json형태를 따라 응답해야합니다.
         당신의 두피 진단이 정말 누가봐도 정상적인 두피라면, 정상이라고 솔직하게 판단하면 됩니다.
         
         진단이 불가하더라도 반드시 일반 텍스트를 보내지말고 반드시 아래의 json형태에따라 보내주세요.
          1. 사진을 보고 두피사진에 대해 한국어로 진단을 내려주세요. 단, 사진이 너무 어둡거나 혹은 두피가 너무 멀리 찍혀 있어서 진단이 어렵다면, '진단불가'를 판단하세요.
          2. 진단 가능한 경우, bounding box를 위해 각 박스별 x, y, width, height 값을 {x,y,width,height} object로 배열 안에 담아 보내주세요. 여러개 발견되면 여러개 보내도 됩니다.
          진단 가능한대로 전부 보내주세요.
          3. 진단 근거 설명도 함께 제공하세요.
          4. 추천하는 제품들을 배열에 담아 보내주세요. 단 제품 이름은 다음 배열 중 하나에 포함되어야 합니다.
            [키즈샴푸, 틴에이저샴푸, 트리트먼트, 바디로션, 바디워시, 페이셜폼, 선크림]
            아래는 각 상품별 특징 및  성분입니다.
- 키즈샴푸 : 특허받은 추출공법*으로 추출한 '일라이트 추출물'은 항염·항균 효과가 연약하고 민감한 두피를 건강하게 보호해 주며, 청결한 두피를 유지, 덱스판테놀 외부 유해환경으로부터 손상된 두피와 모발을 회복, 두피건조 예방에 도움, 세라마이드엔피 모발에 윤기와 광택을 부여하여 손상되지 않도록 보호, 정수리 냄새 없앰, 모발건조함 예방
- 틴에이저샴푸: 살리실릭애씨드 탈모증상완화 기능성원료 두피 속 과도한 피지와 각질을 제거해, 두피 트러블 방지에 도움, 엘-멘톨 탈모증상완화 기능성원료 두피에 발생하는 열을 빠르게 낮처줌, 살리실릭애씨드 *탈모증상완화 기능성원료 두피 속 과도한 피지와 각질을 제거해, 두피 트러블 방지에 도움
- 트리트먼트 : 어린이부터 성인까지 사용 가능한 논-실리콘 트리트먼트, 두피의 모공을 막아 트러블을 유발하는 실리콘(사이클로테트라실록산, 디메치콘, 아모다이메티콘 등)을 함유하지 않아, 연약한 모발과 두피에 안심하고 사용가능,피마자씨에서 추출한 식물성 오일과 코코넛 유래 보습 성분들이 즉각적인 부드러움을 부여, 어린이도 사용 가능, (두피의 모공을 막는 실리콘, 피부자극을 유발하는 합성계면활성제,유해성 논란이 있는 파라벤 , 화학적 방부제인 페녹시에탄올 , 알레르기 유발가능성이 있는 인공색소 등이 없음)
- 바디로션 : 봇브에 좋음, 피부 예민한사람한테 좋음, 아이가 닿아도 안전한 성분, 자극없이 촉촉 , 일라이트 추출물 함유, 세라마이드 ,판테놀, 알란토인, 글리세린, 히알루론산으로 5중 보습, 5가지 자연 유래 오일 사용
- 바디워시, 선크림, 페이셜폼도 비슷한 맥락임
          5. 제품 추천 이유를 두피 상태에 기반하여 제공하세요. 당연히 진단불가면 추천을 안 해야합니다.
          6. JSON 형식으로 응답하세요:
            - result : 1 or 0 (진단 가능하면 1, 그렇지 않으면 0)
            - yoloBoxes : [{ x, y, width, height }]
            - analysis : 분석 결과
            - analysis_reason : 분석 근거
            - recommendation : [{ product_name, reason }]
    7. 제품 추천 근거는, 제가 보낸 우리 제품의 제품별 장점 내에서 찾아서 부풀려줘야합니다.        
` },
        {
          role: "user",
          content: [
            { type: "text", text: `이 사진을 분석해줘.` },
            { type: "image_url", image_url: { url: imageUrl } } // ✅ 올바른 객체 형태로 변경
          ]
        }
      ],
    });

   
    let aiResponse = response.choices[0].message.content.trim();
    console.log("🛠️ GPT 응답 원본:", aiResponse);

    // 🔥 JSON 코드 블록(````json ... ````) 제거
    if (aiResponse.startsWith("```json")) {
      aiResponse = aiResponse.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (aiResponse.startsWith("```")) {
      aiResponse = aiResponse.replace(/^```/, "").replace(/```$/, "").trim();
    }

    console.log("✅ JSON 변환 전:", aiResponse);

    // JSON 응답이 아니면 "진단 불가" 처리
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (error) {
      console.error("🚨 JSON 파싱 오류: 응답이 JSON 형식이 아님");
      parsedResponse = {
        result: 0,
        yoloBoxes: [],
        analysis: "",
        analysis_reason: "두피를 인식할 수 없습니다. 조금 더 가까이 찍어주시거나 보다 밝은 곳에서 찍어주세요.",
        recommendation: []
      };
    }

    res.json({ imageUrl, ...parsedResponse });
  } catch (err) {
    console.error("OpenAI API 오류:", err);
    res.status(500).json({ error: "AI 분석 실패" });
  }
});


// ✅ 업로드된 이미지 제공 (정적 파일 서빙)
app.use(`/${process.env.UPLOADS_DIR}`, express.static(uploadDir));

// ✅ 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 서버 실행 중: http://localhost:${PORT}`));
