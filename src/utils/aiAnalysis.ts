import Anthropic from '@anthropic-ai/sdk';
import type { SajuResult, PersonData, RelationType } from './saju';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

const MODEL_SONNET = 'claude-sonnet-4-6';
const MODEL_HAIKU  = 'claude-haiku-4-5-20251001';

async function callModel(
  params: Omit<Anthropic.MessageCreateParamsNonStreaming, 'model'>,
  model: string,
  timeoutMs: number,
): Promise<Anthropic.Message> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const result = await client.messages.create(
      { ...params, model, stream: false },
      { signal: controller.signal } as never,
    );
    clearTimeout(timer);
    return result;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// Sonnet 먼저, 접속 불안정 시 Haiku로 자동 전환
async function callWithFallback(
  params: Omit<Anthropic.MessageCreateParamsNonStreaming, 'model'>,
): Promise<Anthropic.Message> {
  try {
    return await callModel(params, MODEL_SONNET, 35000);
  } catch (sonnetErr) {
    console.warn('[TOXIC] Sonnet 실패 → Haiku 전환:', sonnetErr);
    return await callModel(params, MODEL_HAIKU, 30000);
  }
}

function parseJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in response');
  return JSON.parse(match[0]);
}

const SYSTEM_PROMPT = `당신은 사주명리학 전문가입니다. TOXIC 서비스 — "왜 안맞는지" — 를 사주로 날카롭고 구체적으로 설명합니다.

원칙:
- 추상적 설명 금지. 실제 상황, 대화, 감정으로 묘사합니다
- "~할 수 있습니다" 같은 표현 금지. 단정적으로 씁니다
- 반드시 완전한 유효한 JSON을 반환합니다
- 한국어로 작성합니다`;

// ─────────────────────────────────────────────────
// Phase 1: 섹션 01·02·03 (로딩 화면 중 계산)
// ─────────────────────────────────────────────────
export async function fetchAIPhase1(
  myData: PersonData,
  targetData: PersonData,
  relationType: RelationType,
  result: SajuResult,
) {
  const hasTarget = Boolean(targetData.birthdate);

  const prompt = hasTarget ? `두 사람의 사주로 01~03 섹션 분석을 해주세요.

[나] ${myData.name || '나'} / ${myData.gender} / ${myData.birthdate}
- 년주: ${result.myYear.stem}${result.myYear.branch}(${result.myYear.ohaeng})
- 월주: ${result.myMonth ? result.myMonth.stem + result.myMonth.branch : '미입력'}
- 일주: ${result.myDay ? result.myDay.stem + result.myDay.branch : '미입력'}
- 시주: ${result.myHour ? result.myHour.stem + result.myHour.branch : '미입력'}

[상대] ${targetData.name || '상대'} / ${targetData.gender} / ${targetData.birthdate}
- 년주: ${result.targetYear.stem}${result.targetYear.branch}(${result.targetYear.ohaeng})
- 월주: ${result.targetMonth ? result.targetMonth.stem + result.targetMonth.branch : '미입력'}
- 일주: ${result.targetDay ? result.targetDay.stem + result.targetDay.branch : '미입력'}

[관계] ${relationType} | [독성지수] ${result.toxicScore}점 | [정확도] ${result.accuracyLevel}
[충돌] 충: ${result.conflicts.chung.map(c => c.name).join(', ') || '없음'} / 형: ${result.conflicts.hyung.map(h => h.name).join(', ') || '없음'} / 해: ${result.conflicts.hae.map(h => h.name).join(', ') || '없음'} / 오행극: ${result.conflicts.geuk.direction || '없음'}

순수 JSON으로만 반환 (코드블록 없이):

{
  "toxicSummary": "15자 이내 핵심 한 줄",
  "coreConflict": {
    "title": "갈등 구조 이름 (10자 이내)",
    "description": "근본 충돌 이유 2문장. 단정적으로"
  },
  "conflictAnalysis": {
    "chung": "충 있을 때: 두 사람 사이 작동 방식 1문장 (없으면 null)",
    "hyung": "형 있을 때 1문장 (없으면 null)",
    "hae": "해 있을 때 1문장 (없으면 null)",
    "geuk": "극 있을 때 1문장 (없으면 null)"
  },
  "conflictScenarios": [
    { "situation": "실제 갈등 장면 20자", "whatHappens": "두 사람 반응 2문장", "whySaju": "사주 이유 1문장" },
    { "situation": "두 번째 장면", "whatHappens": "반응 2문장", "whySaju": "이유 1문장" },
    { "situation": "세 번째 장면", "whatHappens": "반응 2문장", "whySaju": "이유 1문장" }
  ],
  "emotionalPattern": {
    "myPattern": "내 감정 반응 1문장",
    "targetPattern": "상대 반응 1문장",
    "cycle": "반복 사이클 1-2문장"
  },
  "energyDynamic": {
    "whoLoses": "누가 더 소모되는지 1문장",
    "drainMechanism": "소모 방식 1문장",
    "longTermEffect": "장기 전망 1문장"
  },
  "relationSpecific": "${relationType} 관계에서 특히 드러나는 점 2문장",
  "triggerPoints": ["트리거1 (구체적 상황)", "트리거2", "트리거3"],
  "hiddenDynamic": "숨겨진 역학 1-2문장",
  "realisticOutlook": "현실적 전망 1문장",
  "avoidanceGuide": {
    "mindset": "마음가짐 1-2문장",
    "practicalTips": ["팁1 (구체적 행동)", "팁2", "팁3"],
    "boundaries": "절대 기대하면 안 되는 것 1문장"
  }
}` : `이 사주의 "내 위험 유형" 분석 (01~03 섹션). 단정적으로.

[나] ${myData.name || '나'} / ${myData.gender} / ${myData.birthdate}
- 년주: ${result.myYear.stem}${result.myYear.branch}(${result.myYear.ohaeng})
- 월주: ${result.myMonth ? result.myMonth.stem + result.myMonth.branch : '미입력'}
- 일주: ${result.myDay ? result.myDay.stem + result.myDay.branch : '미입력'}
- 충 유발 지지: ${result.myDangerBranches?.join(', ') || '없음'}
- 극 유발 오행: ${result.myDangerOhaeng?.join(', ') || '없음'}

순수 JSON으로만 반환:

{
  "toxicSummary": "내 독성 패턴 15자 이내",
  "myCharacter": {
    "core": "핵심 기질 2문장",
    "strength": "관계에서 강점 1문장",
    "shadow": "관계에서 그림자 1문장"
  },
  "dangerTypes": [
    { "type": "충돌 유형 이름", "years": "출생연도 힌트", "whyDangerous": "충돌 이유 1-2문장", "realScenario": "실제 충돌 장면 2문장" },
    { "type": "두 번째 유형", "years": "출생연도", "whyDangerous": "이유", "realScenario": "장면" }
  ],
  "conflictScenarios": [
    { "situation": "자주 겪는 갈등 장면 20자", "whatHappens": "전개 2문장", "whySaju": "이유 1문장" },
    { "situation": "두 번째 장면", "whatHappens": "전개", "whySaju": "이유" }
  ],
  "triggerPoints": ["트리거1", "트리거2", "트리거3"],
  "warningPattern": "반복 갈등 패턴 2문장",
  "hiddenDynamic": "숨겨진 패턴 1-2문장",
  "avoidanceGuide": {
    "mindset": "마음가짐 1-2문장",
    "practicalTips": ["팁1", "팁2", "팁3"],
    "boundaries": "타협하면 안 되는 것 1문장"
  }
}`;

  const msg = await callWithFallback({
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = msg.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');
  return parseJson(content.text);
}

// ─────────────────────────────────────────────────
// Phase 2: 섹션 04·05 (결과 화면 뜨는 순간부터 계산)
// ─────────────────────────────────────────────────
export async function fetchAIPhase2(
  myData: PersonData,
  targetData: PersonData,
  relationType: RelationType,
  result: SajuResult,
) {
  const hasTarget = Boolean(targetData.birthdate);
  if (!hasTarget) return null; // 역산 모드엔 04·05 없음

  const prompt = `두 사람의 사주로 04·05 섹션만 분석해주세요.

[나] ${myData.name || '나'} / ${myData.gender} / ${myData.birthdate}
- 년주: ${result.myYear.stem}${result.myYear.branch}(${result.myYear.ohaeng})
- 일주: ${result.myDay ? result.myDay.stem + result.myDay.branch : '미입력'}

[상대] ${targetData.name || '상대'} / ${targetData.gender} / ${targetData.birthdate}
- 년주: ${result.targetYear.stem}${result.targetYear.branch}(${result.targetYear.ohaeng})

[관계] ${relationType} | [독성지수] ${result.toxicScore}점
[충돌] 충: ${result.conflicts.chung.map(c => c.name).join(', ') || '없음'} / 오행극: ${result.conflicts.geuk.direction || '없음'}

순수 JSON으로만 반환:

{
  "personalImpact": {
    "onMe": "이 관계가 나에게 하는 일 1-2문장",
    "warningSignals": ["신호1 (구체적 증상)", "신호2", "신호3"],
    "whatYouLose": "잃어가는 것 1문장"
  },
  "continuationAssessment": {
    "structuralAnalysis": "구조적으로 개선 가능한지 1-2문장",
    "whatItTakes": "이어가려면 필요한 것 1문장",
    "redLine": "재고해야 할 신호 1문장",
    "verdict": "최종 판정 1문장. 가장 직접적으로"
  }
}`;

  const msg = await callWithFallback({
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = msg.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');
  return parseJson(content.text);
}
