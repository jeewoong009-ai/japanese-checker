// server.js

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

// ====== ESM에서 __dirname 만들기 ======
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== 기본 설정 ======
const app = express();
app.use(cors());
app.use(express.json());

// 정적 파일(index.html 등) 제공
app.use(express.static(__dirname));

// ====== OpenAI 클라이언트 ======
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ====== 일본어 잔재 사전 ======
const dictionary = {
  // 음식·요리·식생활
  "오뎅": {
    type: "loanword",
    suggestion: "어묵",
    note: "일본어 おでん(oden)에서 온 말. ‘어묵’으로 순화 권장됨."
  },
  "다마": {
    type: "loanword",
    suggestion: "당구 실력 또는 당구 공",
    note: "일본어 '타마(たま, 玉)'에서 온 말"
  }
  "다마네기": {
    type: "loanword",
    suggestion: "양파",
    note: "일본어 たまねぎ에서 온 말."
  },
  "다꾸앙": {
    type: "loanword",
    suggestion: "단무지",
    note: "일본어 たくあん에서 온 무절임."
  },
  "다꽝": {
    type: "loanword",
    suggestion: "단무지",
    note: "‘다꾸앙’의 변형 표기."
  },
  "다대기": {
    type: "loanword",
    suggestion: "다진 양념, 다진 고추",
    note: "일본어 たたき에서 온 것으로 보는 속어."
  },
  "고로케": {
    type: "loanword",
    suggestion: "감자고로케, 감자완자튀김",
    note: "일본어 コロッケ에서 온 말."
  },
  "우동": {
    type: "loanword",
    suggestion: "가락국수",
    note: "일본식 국수 ‘うどん’에서 온 말."
  },
  "짬뽕": {
    type: "loanword",
    suggestion: "해물 얼큰 국수",
    note: "일본식 ‘ちゃんぽん’에서 들어온 말로 알려짐."
  },
  "와사비": {
    type: "loanword",
    suggestion: "고추냉이",
    note: "일본어 わさび에서 온 말."
  },
  "사시미": {
    type: "loanword",
    suggestion: "회, 생선회",
    note: "일본어 さしみ에서 온 말."
  },
  "쓰키다시": {
    type: "loanword",
    suggestion: "곁들이 안주",
    note: "일본어 つきだし(突き出し)에서 온 말."
  },
  "소보로빵": {
    type: "loanword",
    suggestion: "곰보빵",
    note: "일본어 そぼろパン에서 온 제과 용어."
  },
  "야끼만두": {
    type: "loanword",
    suggestion: "군만두",
    note: "일본어 ‘焼き(やき)’의 영향을 받은 표현."
  },
  "낑깡": {
    type: "loanword",
    suggestion: "금귤, 동귤",
    note: "일본어 きんかん에서 온 말."
  },
  "간식": {
    type: "loanword",
    suggestion: "새참",
    note: "일본어 かんしょく(間食)에서 온 말로 보는 견해."
  },
  "소라색": {
    type: "loanword",
    suggestion: "하늘색",
    note: "일본어 空色(そらいろ)의 영향."
  },

  // 일상 속 속어·구어
  "간지": {
    type: "loanword",
    suggestion: "느낌, 멋, 맵시",
    note: "일본어 感じ(かんじ)에서 온 속어."
  },
  "노가다": {
    type: "loanword",
    suggestion: "막일, 현장 노동",
    note: "일본어 속어 ‘どかた’(토목 노동자)에서 온 비하적 표현."
  },
  "무데뽀": {
    type: "loanword",
    suggestion: "막무가내",
    note: "일본어 無鉄砲(むてっぽう)에서 온 표현."
  },
  "유도리": {
    type: "loanword",
    suggestion: "여유, 여유분, 융통성",
    note: "일본어 ゆとり에서 온 말."
  },
  "찌라시": {
    type: "loanword",
    suggestion: "전단지, 광고지",
    note: "일본어 チラシ(ちらし)에서 온 말."
  },
  "가오": {
    type: "loanword",
    suggestion: "체면, 얼굴",
    note: "일본어 顔(かお)에서 온 속어."
  },
  "단도리": {
    type: "loanword",
    suggestion: "준비, 채비, 사전 조율",
    note: "일본어 段取り(だんどり)에서 온 말."
  },
  "만땅": {
    type: "loanword",
    suggestion: "가득, 가득 참",
    note: "일본어 満タン(まんたん)에서 온 말."
  },
  "와리깡": {
    type: "loanword",
    suggestion: "각자 계산, N빵",
    note: "일본어 割り勘(わりかん)에서 온 말."
  },
  "뗑깡": {
    type: "loanword",
    suggestion: "생떼, 투정",
    note: "일본어 癲癇(てんかん)에서 온 속어로 보는 견해."
  },
  "기스": {
    type: "loanword",
    suggestion: "흠집, 상처",
    note: "일본어 傷(きず)의 음이 변형된 표현으로 보는 견해."
  },
  "쇼부": {
    type: "loanword",
    suggestion: "승부, 결판",
    note: "일본어 勝負(しょうぶ)에서 온 말."
  },
  "곤조": {
    type: "loanword",
    suggestion: "고집, 근성",
    note: "일본어 根性(こんじょう)의 변형."
  },
  "나가리": {
    type: "loanword",
    suggestion: "취소, 유찰, 허사",
    note: "일본어 流れ(ながれ)에서 온 말."
  },
  "뽀록나다": {
    type: "loanword",
    suggestion: "들통나다, 드러나다",
    note: "일본어 露見(ろけん) 등에서 온 속어로 보는 견해."
  },
  "후까시": {
    type: "loanword",
    suggestion: "허세, 허풍",
    note: "일본어 ふかし(부풀리기)에서 온 말."
  },
  "이빠이": {
    type: "loanword",
    suggestion: "가득, 잔뜩",
    note: "일본어 一杯(いっぱい)에서 온 말."
  },
  "구라": {
    type: "loanword",
    suggestion: "거짓말",
    note: "일본 속어에서 들어온 표현으로 보는 견해."
  },
  "야미": {
    type: "loanword",
    suggestion: "암거래, 불법 거래",
    note: "일본어 闇(やみ, 어둠·암시장)에서 온 말."
  },
  "똔똔": {
    type: "loanword",
    suggestion: "본전, 득실 없음",
    note: "일본 상업 속어에서 온 말로 보는 견해."
  },
  "레자": {
    type: "loanword",
    suggestion: "인조가죽",
    note: "영어 leather의 일본식 발음 レザー에서 온 말."
  },
  "함바": {
    type: "loanword",
    suggestion: "현장 식당",
    note: "일본어 飯場(はんば)에서 온 건설 현장 용어."
  },
  "시마이": {
    type: "loanword",
    suggestion: "마무리, 끝, 정리",
    note: "일본어 仕舞い(しまい)에서 온 말."
  },

  // 생활용품·기타
  "호치키스": {
    type: "loanword",
    suggestion: "스테이플러",
    note: "일본에서 상표명이 일반명사화된 ‘ホッチキス’에서 온 말."
  },
  "구루마": {
    type: "loanword",
    suggestion: "손수레, 수레",
    note: "일본어 車(くるま)에서 온 표현."
  },
  "잉꼬부부": {
    type: "loanword",
    suggestion: "원앙부부",
    note: "일본어 鸚哥(いんこ, 잉꼬)에서 온 말."
  },
  "곤색": {
    type: "loanword",
    suggestion: "감색",
    note: "일본어 紺(こん) 발음에서 온 말."
  },

  // 공문서·행정·한자식 표현 (translationese)
  "시말서": {
    type: "translationese",
    suggestion: "경위서",
    note: "일본어 始末書(しまつしょ)에서 온 행정 용어."
  },
  "거래선": {
    type: "translationese",
    suggestion: "거래처",
    note: "일본식 한자어 取引先(とりひきさき)의 영향을 받은 표현."
  },
  "수입선": {
    type: "translationese",
    suggestion: "수입처",
    note: "일본어 輸入先(ゆにゅうさき)의 영향을 받은 표현."
  },
  "비상구": {
    type: "translationese",
    suggestion: "비상출구, 대피구",
    note: "일본어 非常口(ひじょうぐち)에서 온 한자식 조합."
  },
  "가건물": {
    type: "translationese",
    suggestion: "임시 건물",
    note: "일본어 仮建物에서 온 표현으로 보는 견해."
  },
  "가계약": {
    type: "translationese",
    suggestion: "임시 계약",
    note: "일본어 仮契約에서 온 말."
  },
  "가불": {
    type: "translationese",
    suggestion: "선지급, 미리 지급",
    note: "일본어 仮払(かりばらい)와 연관된 표현으로 보는 견해."
  },
  "대합실": {
    type: "translationese",
    suggestion: "맞이방, 대기실",
    note: "일본어 待合室(まちあいしつ)의 구조를 따른 말로 보는 견해."
  },
  "숙박계": {
    type: "translationese",
    suggestion: "숙박 신고서, 숙박부",
    note: "일본식 ‘~계(屆)’ 서식어(宿泊届)의 영향."
  },
  "게양": {
    type: "translationese",
    suggestion: "올리다, 달다",
    note: "국어 순화 대상인 일본식 한자어 揭揚의 영향으로 지적되는 표현."
  }
};

// ====== 사전 기반 매칭 함수 ======
function findDictionaryMatches(text) {
  const items = [];

  for (const [word, info] of Object.entries(dictionary)) {
    let idx = text.indexOf(word);
    while (idx !== -1) {
      items.push({
        type: info.type,
        start: idx,
        end: idx + word.length,
        span: word,
        suggestion: info.suggestion || "",
        note: info.note || "",
        confidence: 0.99,
      });
      idx = text.indexOf(word, idx + word.length);
    }
  }

  return items;
}

// ====== GPT에게 줄 출력 형식 설명 ======
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

// ====== 루트(/)로 오면 index.html 보내기 ======
app.get('/', (req, res) => {
  console.log('GET / 요청 들어옴');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ====== 일본어 잔재 검사 API ======
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
    // 1) 사전 기반 매칭
    const dictItems = findDictionaryMatches(text);

    // 2) GPT에게 추가 표현 탐지 요청
    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        { role: 'system', content: '너는 한국어 문체·어휘 점검 도우미다.' },
        { role: 'user', content: userPrompt + '\n\n<텍스트>\n' + text + '\n</텍스트>' },
      ],
    });

    const raw = response.output[0].content[0].text;
    console.log('RAW AI OUTPUT:', raw);

    const jsonText = raw.trim();
    const data = JSON.parse(jsonText);

    const modelItems = Array.isArray(data.items) ? data.items : [];

    // 3) 사전 결과 + GPT 결과 합치기 (중복 제거)
    const mergedItems = [...dictItems];

    for (const item of modelItems) {
      const duplicate = mergedItems.some(
        (d) =>
          d.start === item.start &&
          d.end === item.end &&
          d.span === item.span &&
          d.type === item.type
      );
      if (!duplicate) {
        mergedItems.push(item);
      }
    }

    const result = { items: mergedItems };
    console.log('PARSED + MERGED:', result);
    res.json(result);
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
