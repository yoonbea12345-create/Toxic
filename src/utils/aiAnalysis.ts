import Anthropic from '@anthropic-ai/sdk';
import type { SajuResult, PersonData, RelationType } from './saju';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function fetchAIAnalysis(
  myData: PersonData,
  targetData: PersonData,
  relationType: RelationType,
  result: SajuResult,
) {
  const hasTarget = Boolean(targetData.birthdate);

  const systemPrompt = `당신은 20년 경력의 사주명리학 전문가이자 관계 심리 상담가입니다. TOXIC 서비스의 핵심 — "왜 안맞는지" — 을 사주로 날카롭고 구체적으로 설명합니다.

핵심 원칙:
- 추상적·교과서적 설명 금지. 실제 살아있는 대화, 상황, 감정으로 풀어냅니다
- "~할 수 있습니다", "~경향이 있습니다" 같은 AI 답변투 금지. 직접적으로 단언합니다
- 두 사람이 실제로 나눴을 법한 구체적인 말투와 상황을 묘사합니다
- 위로보다 명확한 진단을 우선합니다
- 갈등 회피 조언은 현실적으로, 관계 개선을 장담하지 않습니다
- 한국어로 작성합니다`;

  let userPrompt: string;

  if (hasTarget) {
    userPrompt = `두 사람의 사주 분석 결과를 바탕으로 심층 갈등 분석을 작성해주세요.

[나] ${myData.name || '나'} / ${myData.gender} / ${myData.birthdate}
- 년주: ${result.myYear.stem}${result.myYear.branch} (${result.myYear.ohaeng})
- 월주: ${result.myMonth ? result.myMonth.stem + result.myMonth.branch : '미입력'}
- 일주: ${result.myDay ? result.myDay.stem + result.myDay.branch : '미입력'}
- 시주: ${result.myHour ? result.myHour.stem + result.myHour.branch : '미입력'}

[상대] ${targetData.name || '상대'} / ${targetData.gender} / ${targetData.birthdate}
- 년주: ${result.targetYear.stem}${result.targetYear.branch} (${result.targetYear.ohaeng})
- 월주: ${result.targetMonth ? result.targetMonth.stem + result.targetMonth.branch : '미입력'}
- 일주: ${result.targetDay ? result.targetDay.stem + result.targetDay.branch : '미입력'}

[관계] ${relationType} | [독성 지수] ${result.toxicScore}점 | [정확도] ${result.accuracyLevel}

[충돌 구조]
- 충(沖): ${result.conflicts.chung.map(c => c.name).join(', ') || '없음'}
- 형(刑): ${result.conflicts.hyung.map(h => h.name).join(', ') || '없음'}
- 해(害): ${result.conflicts.hae.map(h => h.name).join(', ') || '없음'}
- 파(破): ${result.conflicts.pa.map(p => p.name).join(', ') || '없음'}
- 합(合): ${result.conflicts.hap.map(h => h.name).join(', ') || '없음'}
- 오행 극: ${result.conflicts.geuk.direction || '없음'}

다음 JSON 형식으로 반환해주세요 (코드블록 없이 순수 JSON). 내용은 실제 인물이 겪는 구체적 상황처럼 생동감 있게 작성하세요:

{
  "toxicSummary": "한 줄 핵심 요약 (20자 이내, 직접적이고 날카롭게)",

  "coreConflict": {
    "title": "핵심 갈등 구조 이름 (예: '끌리는 방향이 정반대인 구조')",
    "description": "이 관계의 근본적인 충돌 구조를 3-4문장으로. 두 사람이 왜 반복해서 부딪히는지 구조적 원인을 날카롭게 설명. '~수 있습니다' 금지, 단정적으로 작성"
  },

  "conflictAnalysis": {
    "chung": "충(沖) 있을 때만. 이 충이 두 사람 사이에서 어떻게 작동하는지 구체적 상황으로 (없으면 null)",
    "hyung": "형(刑) 있을 때만 (없으면 null)",
    "hae": "해(害) 있을 때만 (없으면 null)",
    "geuk": "오행 극 있을 때만 — 어떤 오행이 어떤 오행을 극하고, 실제 관계에서 어떻게 드러나는지 (없으면 null)"
  },

  "conflictScenarios": [
    {
      "situation": "갈등이 터지는 구체적 상황 — 실제 일어나는 장면 (예: '카톡을 2시간째 읽씹 당했을 때')",
      "whatHappens": "두 사람이 실제로 어떻게 반응하는지. 구체적인 말투, 행동, 감정을 2-3문장으로",
      "whySaju": "이 충돌이 사주 구조에서 왜 필연적인지 1문장으로"
    },
    {
      "situation": "두 번째 갈등 상황",
      "whatHappens": "구체적 묘사",
      "whySaju": "사주적 이유"
    },
    {
      "situation": "세 번째 갈등 상황",
      "whatHappens": "구체적 묘사",
      "whySaju": "사주적 이유"
    }
  ],

  "emotionalPattern": {
    "myPattern": "나는 이 관계에서 어떤 감정을 주로 느끼고 어떻게 행동하는지 — 구체적인 감정 반응과 행동 패턴",
    "targetPattern": "상대는 이 관계에서 어떤 사람인지, 어떤 방식으로 갈등에 반응하는지 — 상대의 성향을 구체적으로",
    "cycle": "두 사람이 반복하는 갈등 사이클을 스토리처럼 묘사 (2-3문장)"
  },

  "energyDynamic": {
    "whoLoses": "이 관계에서 누가 더 감정·에너지를 소모하는지, 그 이유는 무엇인지 (구체적으로)",
    "drainMechanism": "어떤 방식으로 에너지가 빠져나가는지 — 눈에 안 보이는 소모 방식을 구체적으로 묘사",
    "longTermEffect": "이 관계를 1년, 3년, 5년 이어가면 어떻게 되는지 현실적으로"
  },

  "relationSpecific": "${relationType} 관계에서 이 충돌 구조가 어떻게 나타나는지 구체적으로 (3-4문장)",

  "triggerPoints": [
    "가장 폭발하기 쉬운 트리거 1 — 상대가 하는 구체적인 말이나 행동",
    "트리거 2 — 나도 모르게 터지게 되는 상황",
    "트리거 3 — 피하기 가장 어려운 트리거"
  ],

  "hiddenDynamic": "표면에 드러나지 않는 이 관계의 가장 날카로운 통찰. 두 사람이 의식하지 못하는 숨겨진 역학을 2-3문장으로",

  "realisticOutlook": "이 관계의 현실적 전망 — 희망적이지 않게, 구조적으로 (2-3문장)",

  "avoidanceGuide": {
    "mindset": "이 관계에서 앞으로 갖춰야 할 마음가짐 (2문장, 현실적으로)",
    "practicalTips": [
      "실제로 써먹을 수 있는 충돌 회피 팁 1 — 구체적인 행동으로",
      "실제로 써먹을 수 있는 충돌 회피 팁 2 — 구체적인 행동으로",
      "실제로 써먹을 수 있는 충돌 회피 팁 3 — 구체적인 행동으로"
    ],
    "boundaries": "이 관계에서 절대 기대하면 안 되는 것과 타협 가능한 것 (2문장)"
  },

  "personalImpact": {
    "onMe": "이 관계가 현재 나에게 실제로 하고 있는 일 — 감정적·심리적 영향을 날카롭게 (2-3문장)",
    "warningSignals": [
      "이 관계가 나를 갉아먹고 있다는 신호 1 — 실제로 느낄 수 있는 구체적 증상",
      "신호 2",
      "신호 3"
    ],
    "whatYouLose": "이 관계 때문에 잃어가고 있는 것 (2문장)"
  },

  "continuationAssessment": {
    "structuralAnalysis": "이 관계가 구조적으로 개선 가능한지 — 냉철한 분석 (2-3문장)",
    "whatItTakes": "만약 이 관계를 이어가려면 실제로 필요한 것 (2문장)",
    "redLine": "이 신호가 보이면 관계를 진지하게 재고해야 한다 — 구체적이고 명확하게",
    "verdict": "최종 한 줄 판정 — 가장 직접적이고 날카롭게"
  }
}`;
  } else {
    userPrompt = `이 사주를 가진 사람의 "내 위험 유형" 역산 분석을 해주세요. AI 답변투 금지, 단정적이고 직접적으로 작성.

[나] ${myData.name || '나'} / ${myData.gender} / ${myData.birthdate}
- 년주: ${result.myYear.stem}${result.myYear.branch} (${result.myYear.ohaeng})
- 월주: ${result.myMonth ? result.myMonth.stem + result.myMonth.branch : '미입력'}
- 일주: ${result.myDay ? result.myDay.stem + result.myDay.branch : '미입력'}
- 충 유발 지지: ${result.myDangerBranches?.join(', ') || '없음'}
- 극 유발 오행: ${result.myDangerOhaeng?.join(', ') || '없음'}

다음 JSON 형식으로만 반환하세요 (코드블록 없이 순수 JSON):

{
  "toxicSummary": "나의 독성 패턴 한 줄 요약 (20자 이내, 직접적으로)",

  "myCharacter": {
    "core": "나의 사주 핵심 기질을 2-3문장으로. 관계에서 어떤 사람인지 구체적으로",
    "strength": "이 기질의 강점 — 관계에서 무기가 되는 부분",
    "shadow": "이 기질의 그림자 — 관계에서 문제가 되는 부분. 내가 인식 못하는 것 포함"
  },

  "dangerTypes": [
    {
      "type": "충돌 유형 이름 (예: '자오충형 — 에너지 폭발형')",
      "years": "주로 어떤 해에 태어난 사람인지 (예: '1996년·2008년생')",
      "whyDangerous": "왜 이 유형과 충돌하는지 — 구체적인 상호작용 방식으로 (2문장)",
      "realScenario": "실제로 이런 사람과 어떤 상황에서 충돌이 터지는지 생동감 있게 묘사"
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
      "situation": "내가 자주 겪는 갈등 상황 (구체적인 장면)",
      "whatHappens": "어떻게 전개되는지 — 내가 어떻게 반응하는지 포함",
      "whySaju": "사주 구조적 이유"
    },
    {
      "situation": "두 번째 반복 갈등 상황",
      "whatHappens": "전개",
      "whySaju": "이유"
    }
  ],

  "triggerPoints": [
    "내가 가장 예민하게 반응하는 트리거 1 — 구체적인 말이나 상황",
    "트리거 2",
    "트리거 3"
  ],

  "warningPattern": "내가 반복하는 갈등 패턴을 3문장으로. 내가 자각 못하는 부분 포함. 직접적으로 단언",

  "hiddenDynamic": "내 사주 구조에서 관계에 영향을 주는 숨겨진 패턴 (2문장)",

  "avoidanceGuide": {
    "mindset": "내 기질을 이해하고 관계에서 어떤 마음가짐으로 접근해야 하는지 (2문장)",
    "practicalTips": [
      "내 충돌 패턴을 줄이기 위한 구체적인 행동 팁 1",
      "구체적인 행동 팁 2",
      "구체적인 행동 팁 3"
    ],
    "boundaries": "내가 관계에서 절대 타협하면 안 되는 것과, 어디까지 유연해질 수 있는지 (2문장)"
  }
}`;
  }

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');

  return JSON.parse(jsonMatch[0]);
}
