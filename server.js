import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM에서 __dirname 만들기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 정적 파일(index.html, JS, CSS 등) 제공
app.use(express.static(__dirname));

// OpenAI 클라이언트
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 루트(/)로 오면 index.html 보내기
app.get('/', (req, res) => {
  console.log('GET / 요청 들어옴');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ====== 일본어 잔재 검사 API ======
const schemaDescription = `
출력 형식(JSON, 공백은 상관 없음):

{
  "items": [
    {
      "type": "loanword" | "translationese" | "bureaucratese",
      "start": number,
      "end": number,
      "span": string,
      "suggestion": string,
      "note": string,
      "confidence": number
    }
  ]
}

반드시 위 구조의 **순수 JSON만** 출력해.
설명 문장, 코드블럭, 주석은 절대 출력하지 마.
`;

app.post('/api/check', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }

  const userPrompt = `
너는 한국어 텍스트에서
1) 일본어 기원어(노가다, 유도리, 호치키스 등),
2) 일본식 번역투(~에 있어서, ~을 실시하다, ~에 의거하여 등),
3) 관청체/행정체(과도하게 딱딱한 공문투)
를 찾아낸다.

각 항목에 대해:
- type: "loanword" | "translationese" | "bureaucratese"
- start / end: 입력 받은 전체 문자열에서 글자가 시작하고 끝나는 인덱스 (0부터 시작, end는 포함하지 않음)
- span: 해당 표현 그대로
- suggestion: 가능하면 자연스러운 대체 표현(없으면 빈 문자열)
- note: 왜 문제가 되는지(없으면 빈 문자열)
- confidence: 신뢰도 (0~1 숫자)

주의:
- 확실할 때만 loanword로 표기하고, 애매하면 translationese로 분류해라.
- 인덱스를 반드시 원문 text 기준으로 정확히 계산해라.
- 출력은 ${schemaDescription} 에서 설명한 **JSON 하나만** 출력해라.
`;

  try {
    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        { role: 'system', content: '너는 한국어 문체·어휘 점검 도우미다.' },
        { role: 'user', content: userPrompt + '\n\n<텍스트>\n' + text + '\n</텍스트>' },
      ],
    });

    const raw = response.output[0].content[0].text;
    console.log('RAW AI OUTPUT:', raw);

    // 혹시 앞뒤에 공백 / 줄바꿈 있을 수 있으니 trim
    const jsonText = raw.trim();
    const data = JSON.parse(jsonText);

    console.log('PARSED:', data);
    if (!data.items) data.items = [];
    res.json(data);
  } catch (err) {
    console.error('ERROR in /api/check:', err);
    res.status(500).json({ error: 'analysis_failed' });
  }
});

// ====== 서버 시작 ======
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
