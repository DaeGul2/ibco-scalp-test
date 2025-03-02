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

app.post("/upload", upload.single("file"), async (req, res) => {
  const imageUrl = `${PUBLIC_SERVER_URL}/${process.env.UPLOADS_DIR}/${req.file.filename}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "이 사진의 두피 상태를 분석하고 제품을 추천해줘." },
        {
          role: "user",
          content: [
            { type: "text", text: "이 사진을 분석해줘." },
            { type: "image_url", image_url: { url: imageUrl } } // ✅ 올바른 객체 형태로 변경
          ]
        }
      ],
    });

    res.json({ imageUrl, analysis: response.choices[0].message.content });
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
