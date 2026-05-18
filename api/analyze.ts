import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { myData, targetData, relationType, sajuResult } = req.body;
  if (!myData || !sajuResult) return res.status(400).json({ error: 'Missing required fields' });

  const hasTarget = targetData && targetData.birthdate;

  const systemPrompt = `당신은 20년 경력의 사주명리학 전문가입니다. TOXIC 서비스의 핵심 철학 — "왜 안맞는지" — 을 사주로 깊이 있게 설명합니다.

핵심 원칙:
- 기존 궁합 서비스와 달리 갈등과 충돌의 구조적 이유를 날카롭게 파고듭니다
- 추상적인 설명이 아니라 일상의 구체적인 상황으로 풀어냅니다
- 공감 가는 언어로, 직접적으로, 때로는 불편한 진실도 말합니다
- 위로보다 명확한 해석을 우선합니다
- 한국어로 작성합니다`;

  let userPrompt: string;

  if (hasTarget) {
    userPrompt = `두 사람의 사주 분석 결과를 바탕으로 심층 갈등 분석을 작성해주세요.

[나] ${myData.name || '나'} / ${myData.gender} / ${myData.birthdate}
- 년주: ${sajuResult.myYear.stem}${sajuResult.myYear.branch} (${sajuResult.myYear.ohaeng})
- 월주: ${sajuResult.myMonth ? sajuResult.myMonth.stem + sajuResult.myMonth.branch : '미입력'}
- 일주: ${sajuResult.myDay ? sajuResult.myDay.stem + sajuResult.myDay.branch : '미입력'}
- 시주: ${sajuResult.myHour ? sajuResult.myHour.stem + sajuResult.myHour.branch : '미입력'}

[상대] ${targetData.name || '상대'} / ${targetData.gender || '미입력'} / ${targetData.birthdate}
- 년주: ${sajuResult.targetYear.stem}${sajuResult.targetYear.branch} (${sajuResult.targetYear.ohaeng})
- 월주: ${sajuResult.targetMonth ? sajuResult.targetMonth.stem + sajuResult.targetMonth.branch : '미입력'}
- 일주: ${sajuResult.targetDay ? sajuResult.targetDay.stem + sajuResult.targetDay.branch : '미입력'}

[관계] ${relationType} | [독성 지수] ${sajuResult.toxicScore}점 | [정확도] ${sajuResult.accuracyLevel}

[충돌 구조]
- 충(沖): ${sajuResult.conflicts.chung.map((c: {name:string}) => c.name).join(', ') || '없음'}
- 형(刑): ${sajuResult.conflicts.hyung.map((h: {name:string}) => h.name).join(', ') || '없음'}
- 해(害): ${sajuResult.conflicts.hae.map((h: {name:string}) => h.name).join(', ') || '없음'}
- 파(破): ${sajuResult.conflicts.pa.map((p: {name:string}) => p.name).join(', ') || '없음'}
- 합(合): ${sajuResult.conflicts.hap.map((h: {name:string}) => h.name).join(', ') || '없음'}
- 오행 극: ${sajuResult.conflicts.geuk.direction || '없음'}

다음 JSON 형식으로 반환해주세요. 각 항목은 충분히 구체적이고 날카롭게 작성하세요:

{
  "toxicSummary": "한 줄 핵심 요약 (20자 이내, SNS 공유용)",

  "coreConflict": {
    "title": "핵심 갈등 구조 이름 (예: '끌림이 파국이 되는 구조')",
    "description": "이 관계의 근본적인 충돌 구조 설명 (3-4문장, 날카롭게)"
  },

  "conflictAnalysis": {
    "chung": "충(沖) 관계 상세 해석 (없으면 null) — 왜 충돌하는지 구조적 원인",
    "hyung": "형(刑) 관계 상세 해석 (없으면 null)",
    "hae": "해(害) 관계 상세 해석 (없으면 null)",
    "geuk": "오행 극 상세 해석 (없으면 null)"
  },

  "conflictScenarios": [
    {
      "situation": "갈등이 터지는 구체적 상황 (예: '카톡 답장이 늦었을 때', '의견 차이가 생긴 회의에서')",
      "whatHappens": "어떻게 충돌이 전개되는지 구체적 묘사 (2문장)",
      "whySaju": "사주적으로 왜 이 상황에서 충돌하는지 (1문장)"
    },
    {
      "situation": "두 번째 갈등 상황",
      "whatHappens": "전개 묘사",
      "whySaju": "사주적 이유"
    },
    {
      "situation": "세 번째 갈등 상황",
      "whatHappens": "전개 묘사",
      "whySaju": "사주적 이유"
    }
  ],

  "emotionalPattern": {
    "myPattern": "나의 감정 반응 패턴 (이 관계에서 내가 주로 느끼는 감정과 행동)",
    "targetPattern": "상대의 감정 반응 패턴",
    "cycle": "두 사람이 반복하는 갈등 사이클 묘사 (2-3문장)"
  },

  "energyDynamic": {
    "whoLoses": "누가 더 에너지를 소모하는지, 왜 그런지",
    "drainMechanism": "어떤 방식으로 에너지가 소모되는지 구체적 묘사",
    "longTermEffect": "이 관계를 오래 유지하면 어떻게 되는지"
  },

  "relationSpecific": "${relationType} 관계에서 이 충돌 구조가 어떻게 나타나는지 구체적으로 (3-4문장)",

  "triggerPoints": [
    "갈등 트리거 1 (구체적인 말이나 행동)",
    "갈등 트리거 2",
    "갈등 트리거 3"
  ],

  "hiddenDynamic": "표면에 드러나지 않는 이 관계의 숨겨진 역학 (2-3문장, 가장 날카로운 통찰)",

  "realisticOutlook": "이 관계의 현실적 전망 — 희망적이지 않게, 구조적으로 분석 (2-3문장)"
}`;
  } else {
    userPrompt = `이 사주를 가진 사람의 "내 위험 유형" 역산 분석을 해주세요.

[나] ${myData.name || '나'} / ${myData.gender} / ${myData.birthdate}
- 년주: ${sajuResult.myYear.stem}${sajuResult.myYear.branch} (${sajuResult.myYear.ohaeng})
- 월주: ${sajuResult.myMonth ? sajuResult.myMonth.stem + sajuResult.myMonth.branch : '미입력'}
- 일주: ${sajuResult.myDay ? sajuResult.myDay.stem + sajuResult.myDay.branch : '미입력'}
- 충 유발 지지: ${sajuResult.myDangerBranches?.join(', ') || '분석 중'}
- 극 유발 오행: ${sajuResult.myDangerOhaeng?.join(', ') || '분석 중'}

{
  "toxicSummary": "나의 독성 패턴 한 줄 요약 (20자 이내)",

  "myCharacter": {
    "core": "나의 사주 핵심 기질 (2-3문장)",
    "strength": "이 기질의 강점",
    "shadow": "이 기질의 그림자 — 관계에서 문제가 되는 부분"
  },

  "dangerTypes": [
    {
      "type": "충돌 유형 이름 (예: '자오충형 — 에너지 폭발형')",
      "years": "주로 어떤 해에 태어난 사람인지",
      "whyDangerous": "왜 이 유형과 충돌하는지 (2문장)",
      "realScenario": "실제로 어떤 상황에서 충돌이 터지는지 구체적 묘사"
    },
    {
      "type": "두 번째 위험 유형",
      "years": "출생 연도 힌트",
      "whyDangerous": "충돌 이유",
      "realScenario": "구체적 시나리오"
    }
  ],

  "conflictScenarios": [
    {
      "situation": "내가 자주 겪는 갈등 상황",
      "whatHappens": "어떻게 전개되는지",
      "whySaju": "사주적 이유"
    },
    {
      "situation": "두 번째 반복 갈등 상황",
      "whatHappens": "전개",
      "whySaju": "이유"
    }
  ],

  "warningPattern": "내가 반복하는 갈등 패턴 — 자각하지 못하는 부분 포함 (3문장)",

  "triggerPoints": [
    "내가 가장 예민하게 반응하는 트리거 1",
    "트리거 2",
    "트리거 3"
  ],

  "hiddenDynamic": "내 사주 구조에서 관계에 영향을 주는 숨겨진 패턴 (2문장)"
}`;
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const analysis = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ analysis });
  } catch (err) {
    console.error('Claude API error:', err);
    return res.status(500).json({ error: 'Analysis failed' });
  }
}
