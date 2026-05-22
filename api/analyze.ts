import Anthropic from '@anthropic-ai/sdk';

// prompt-caching-2024-07-31 beta header required for cache_control support
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  defaultHeaders: { 'anthropic-beta': 'prompt-caching-2024-07-31' },
});

const MODEL_SONNET = 'claude-sonnet-4-6';
const MODEL_HAIKU  = 'claude-haiku-4-5-20251001';

const SYSTEM_CACHED: Anthropic.TextBlockParam & { cache_control: { type: 'ephemeral' } } = {
  type: 'text',
  text: `당신은 수십 년 경력의 사주명리학 상담사입니다. 사람들이 당신의 분석을 듣고 "어?? 어떻게 알았지?!" 하고 소름 돋는 반응을 보이는 게 당신의 강점입니다.

[핵심 원칙]
1. 추상적 표현 절대 금지. "갈등이 생깁니다" X → "상대가 '왜 이렇게 예민해'라고 하면 속에서 뭔가 올라오면서 말이 끊어집니다" O
2. 반드시 실제 대화체·감정·신체 반응을 포함하여 묘사. "억울한 느낌이 든다" X → "입은 '아니야 괜찮아'라고 하지만 그날 밤 혼자 그 말을 몇 번이나 되새깁니다" O
3. 상대방의 말투·행동 방식을 특정하여 묘사. 상대가 어떤 식으로 반응하는지 콕 집어냄.
4. 사주 에너지 설명은 반드시 일상 행동으로 번역. "화(火) 기운" X → "감정이 즉각 표면으로 올라와 참지 못하고 말해버리는 성향" O
5. 한 문장 안에 구체적 상황·감정·결과가 다 들어가도록. 단정적으로, 반복 표현 없이.
6. 완전한 JSON만 출력. 주석 없이. 마크다운 없이. 설명 없이.
7. 한국어 전용. 전문 용어는 괄호 안에 쉬운 설명 필수.`,
  cache_control: { type: 'ephemeral' },
};

async function callSonnet(
  prompt: string,
  maxTokens: number,
  timeoutMs = 38000,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const msg = await client.messages.create(
      {
        model: MODEL_SONNET,
        max_tokens: maxTokens,
        system: [SYSTEM_CACHED],
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      },
      { signal: controller.signal } as never,
    );
    clearTimeout(timer);
    const c = msg.content[0];
    if (c.type !== 'text') throw new Error('Not text');
    return c.text;
  } catch (err) {
    clearTimeout(timer);
    // Haiku 폴백 (Sonnet 실패 시에만)
    const ctrl2 = new AbortController();
    const t2 = setTimeout(() => ctrl2.abort(), 20000);
    try {
      const msg2 = await client.messages.create(
        {
          model: MODEL_HAIKU,
          max_tokens: maxTokens,
          system: [SYSTEM_CACHED],
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        },
        { signal: ctrl2.signal } as never,
      );
      clearTimeout(t2);
      const c2 = msg2.content[0];
      if (c2.type !== 'text') throw new Error('Not text');
      return c2.text;
    } catch (err2) {
      clearTimeout(t2);
      throw err2;
    }
  }
}

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON');
  return JSON.parse(match[0]);
}

// ─── Phase 1A: 핵심 갈등 + 감정 패턴 ───────────────────────────────
function buildPhase1APrompt(myData: any, targetData: any, relationType: string, result: any): string {
  const hasTarget = Boolean(targetData?.birthdate);
  const chung = result.conflicts.chung.map((c: any) => c.name).join(', ') || '없음';
  const hyung = result.conflicts.hyung.map((h: any) => h.name).join(', ') || '없음';
  const hae   = result.conflicts.hae?.map((h: any) => h.name).join(', ') || '없음';
  const geuk  = result.conflicts.geuk?.exists ? result.conflicts.geuk.direction : '없음';
  const score = result.toxicScore;
  const myPillar = `${result.myYear?.stem}${result.myYear?.branch}년 ${result.myMonth ? result.myMonth.stem+result.myMonth.branch+'월' : ''} ${result.myDay ? result.myDay.stem+result.myDay.branch+'일' : ''}`.trim();
  const tgPillar = hasTarget ? `${result.targetYear?.stem}${result.targetYear?.branch}년 ${result.targetMonth ? result.targetMonth.stem+result.targetMonth.branch+'월' : ''} ${result.targetDay ? result.targetDay.stem+result.targetDay.branch+'일' : ''}`.trim() : '';

  if (hasTarget) {
    return `[사주 데이터]
나(${myData.gender}): ${myPillar} / 상대(${targetData.gender}): ${tgPillar}
관계: ${relationType} | 독성지수: ${score}점
충(沖): ${chung} | 형(刑): ${hyung} | 해(害): ${hae} | 극(剋): ${geuk}
갈등요약: ${result.conflictSummary || ''} | 태그: ${result.tags?.join(',') || ''}

[출력 형식] 순수 JSON만. 주석·마크다운 없이.

{
  "toxicSummary": "20자 이내. 이 관계를 정의하는 날카로운 한마디. 예: '서로를 조금씩 갉아먹는 구조'",
  "coreConflict": {
    "title": "12자 이내. 이 충돌의 이름. 예: '방향이 다른 두 에너지'",
    "description": "5문장. ①이 두 사람이 왜 구조적으로 안 맞는지 — 사주 에너지를 일상 행동으로 번역해 설명. ②어떤 순간에 갈등이 시작되는지 — 구체적인 생활 장면. ③그 순간 나와 상대방이 각각 무슨 생각을 하는지 — 내면의 독백까지. ④상대방 눈에 나는 어떤 사람으로 보이는지, 나 눈에 상대는 어떤 사람인지. ⑤이 갈등이 왜 노력해도 반복될 수밖에 없는지 — 구조 차원의 이유."
  },
  "conflictAnalysis": {
    "chung": ${chung !== '없음' ? `"충(沖·정면충돌 에너지)이 이 관계에서 어떻게 작동하는지 4문장. ①이 충 이름(${chung})이 어떤 에너지 충돌인지 — 물/불/나무/쇠 등 기운을 실제 성향으로 번역. ②일상에서 어떤 상황으로 터지는지 — 실제 대화 예시('...라고 하면 상대는 ...라고 한다' 형식). ③그 순간 양쪽이 각각 느끼는 감정과 속마음. ④왜 이 충돌이 해결되지 않고 반복되는지."` : 'null'},
    "hyung": ${hyung !== '없음' ? `"형(刑·압박 에너지)이 이 관계에서 어떻게 작동하는지 3문장. 충처럼 폭발하지 않지만 관계를 서서히 압박하는 방식 — 어떤 상황에서 말못할 긴장이 생기는지, 그 긴장이 어떻게 쌓이는지, 결국 어떻게 터지는지."` : 'null'},
    "hae": ${hae !== '없음' ? `"해(害·에너지 소모 구조)가 어떻게 작동하는지 3문장. 겉으로는 문제없어 보이지만 함께 있을수록 에너지가 빠지는 구체적인 방식 — 어떤 대화·상황에서 이유없이 지치는지."` : 'null'},
    "geuk": ${geuk !== '없음' ? `"극(剋·억압 구조)이 어떻게 작동하는지 3문장. 누가 누구를 억누르는지(${geuk} 방향) — 억누르는 쪽은 어떤 행동으로 나타나는지, 눌리는 쪽은 어떻게 체감하는지, 장기적으로 어떻게 되는지."` : 'null'}
  },
  "emotionalPattern": {
    "myPattern": "3문장. 내가 이 관계에서 갈등이 생겼을 때 어떻게 반응하는지 — 어떤 말·행동에 특히 상처받는지, 그 순간 속으로 무슨 말이 올라오는지, 어떻게 처리하는지(참는지/터뜨리는지/냉각되는지).",
    "targetPattern": "3문장. 상대방이 갈등 상황에서 어떻게 반응하는지 — 상대 특유의 말투·행동 방식, 그게 나에게 어떻게 느껴지는지, 왜 상대는 그렇게 반응할 수밖에 없는지.",
    "cycle": "3문장. 두 사람이 반복하는 갈등 사이클 — 어떤 사소한 일에서 시작되는지, 어떤 방식으로 커지는지, 어떻게 가라앉고 왜 또 반복되는지. 읽으면서 '맞아, 딱 이래' 싶게 구체적으로."
  },
  "hiddenDynamic": "3문장. 두 사람이 스스로는 인식 못하는 숨겨진 역학 — 처음에 끌린 이유가 지금 갈등의 이유가 되는 아이러니, 서로 무의식적으로 상대방에게 하는 일, 그 패턴이 왜 쉽게 바뀌지 않는지."
}`;
  }

  return `[사주 데이터]
나(${myData.gender}): ${myPillar}
충 유발 지지: ${result.myDangerBranches?.join(',') || '없음'} | 극 유발 오행: ${result.myDangerOhaeng?.join(',') || '없음'}
갈등 성향: ${result.conflictType || ''} | 독성지수: ${score}

[출력 형식] 순수 JSON만.

{
  "toxicSummary": "20자 이내. 내 갈등 기질의 핵심을 날카롭게.",
  "myCharacter": {
    "core": "4문장. ①내 사주 기질의 핵심 에너지를 일상 행동으로 번역. ②인간관계에서 어떤 패턴이 반복되는지 — 특정 유형과 왜 자꾸 충돌하는지. ③내가 모르는 내 모습 — 남들 눈에는 어떻게 보이는지. ④이 기질이 만들어내는 관계 패턴.",
    "strength": "2문장. 이 기질이 빛나는 구체적 상황과 그 이유.",
    "shadow": "2문장. 이 기질이 독이 되는 구체적 상황 — 어떤 말·행동이 나도 모르게 상대를 힘들게 하는지."
  },
  "hiddenDynamic": "3문장. 내가 스스로 잘 모르는 무의식적 갈등 패턴 — 왜 같은 유형의 사람과 반복적으로 문제가 생기는지, 내 어떤 행동이 원인인지, 그걸 알아채는 방법."
}`;
}

// ─── Phase 1B: 시나리오·회피 가이드 (병렬 실행) ──────────────────
function buildPhase1BPrompt(myData: any, targetData: any, relationType: string, result: any): string {
  const hasTarget = Boolean(targetData?.birthdate);
  const chung = result.conflicts.chung.map((c: any) => c.name).join(', ') || '없음';
  const geuk  = result.conflicts.geuk?.exists ? result.conflicts.geuk.direction : '없음';
  const score = result.toxicScore;
  const myYr  = `${result.myYear?.stem}${result.myYear?.branch}`;
  const tgYr  = hasTarget ? `${result.targetYear?.stem}${result.targetYear?.branch}` : '';

  if (hasTarget) {
    return `[사주 데이터]
나(${myData.gender}): ${myYr}년 | 상대(${targetData.gender}): ${tgYr}년
관계: ${relationType} | 독성지수: ${score}점 | 충: ${chung} | 극: ${geuk}
갈등패턴: ${result.conflictSummary || ''} | 태그: ${result.tags?.join(',') || ''}

[목표] 사용자가 읽으면서 "어?? 어떻게 알았지?!" 하고 소름 돋게 만드는 갈등 시나리오와 실용적 가이드.
[출력 형식] 순수 JSON만.

{
  "conflictScenarios": [
    {
      "situation": "25자 이내. ${relationType} 관계에서 실제로 일어날 법한 구체적인 생활 장면. 예: '피곤한 저녁에 계획을 바꾸자고 했을 때', '중요한 결정 앞두고 의견을 물었을 때'",
      "whatHappens": "5문장. ①그 상황에서 상대방이 정확히 어떻게 말하거나 행동하는지(대화체로). ②그 말·행동이 나에게 어떻게 들리고 느껴지는지. ③그 순간 나 안에서 어떤 감정이 올라오는지 — 속마음 독백까지. ④내가 어떻게 반응하고, 그게 상대방에게 어떻게 보이는지. ⑤그날 이후 어떤 식으로 남는지(냉각·후회·반복).",
      "whySaju": "2문장. 이게 단순 성격 차이가 아니라 사주 구조상 왜 이런 패턴이 생기는지 — 쉬운 말로."
    },
    {
      "situation": "25자 이내. 다른 장면 (첫 번째와 다른 맥락)",
      "whatHappens": "5문장. 같은 형식으로. 대화·감정·속마음·반응·여운.",
      "whySaju": "2문장."
    },
    {
      "situation": "25자 이내. 세 번째 장면 (누적된 감정이 터지는 상황)",
      "whatHappens": "5문장. 앞의 두 상황이 쌓인 결과로 생기는 더 큰 갈등 장면.",
      "whySaju": "2문장."
    }
  ],
  "triggerPoints": [
    "상대방이 이 말을 하면 무조건 올라오는 것 — 어떤 말인지 직접 인용 형식",
    "이 행동을 보면 뭔가 폭발하는 것 — 구체적인 행동",
    "이런 상황이 되면 나도 모르게 방어적이 되는 것",
    "상대방이 이 태도를 보이면 더 이상 대화가 안 되는 것",
    "이 패턴이 반복되면 관계 전체에 회의감이 드는 것"
  ],
  "relationSpecific": "3문장. ${relationType} 관계이기 때문에 특히 더 아픈 갈등 — 다른 관계 유형이었다면 넘어갈 수 있는 것이 왜 이 관계에서는 더 크게 느껴지는지, 이 관계 특유의 긴장 구조.",
  "realisticOutlook": "3문장. 솔직한 전망 — 이 갈등 구조를 인식하지 못한 채 계속 가면 어떻게 되는지, 인식한다면 어떤 가능성이 있는지, 어떤 것은 노력으로 변할 수 없는지.",
  "energyDynamic": {
    "whoLoses": "2문장. 이 관계에서 에너지를 더 많이 쓰는 쪽과 그 이유 — 어떤 방식으로 소모되는지 구체적으로.",
    "drainMechanism": "2문장. 에너지가 빠져나가는 정확한 메커니즘 — 어떤 대화 직후, 어떤 상황 이후에 특히 지치는지.",
    "longTermEffect": "2문장. 이 패턴이 6개월, 1년 쌓이면 나에게 어떤 변화가 생기는지 — 구체적인 변화."
  },
  "avoidanceGuide": {
    "mindset": "3문장. 이 관계에서 덜 소모되기 위한 핵심 마인드셋 — 상대를 바꾸려는 것을 포기하고 무엇에 집중해야 하는지, 왜 그게 현실적인지.",
    "practicalTips": [
      "갈등이 시작되려고 할 때(징조가 보일 때) 구체적으로 어떻게 행동하면 되는지",
      "상대방이 특정 반응을 보일 때 나는 무엇을 해야 하는지 — 행동 지침",
      "이 관계에서 절대 하면 안 되는 것 — 왜 역효과가 나는지 포함",
      "이 갈등 후 회복을 위해 나 자신에게 해줘야 할 것",
      "이 관계를 오래 유지하려면 반드시 만들어야 할 루틴이나 규칙"
    ],
    "boundaries": "3문장. 이 관계에서 지켜야 할 선 — ①이 상황이 되면 대화를 멈춰야 한다. ②이 패턴이 반복되면 관계 형태를 바꿔야 한다. ③이 신호가 보이면 관계 자체를 재고해야 한다."
  }
}`;
  }

  return `[사주 데이터]
나(${myData.gender}): ${myYr}년
충 유발: ${result.myDangerBranches?.join(',') || '없음'} | 극 유발: ${result.myDangerOhaeng?.join(',') || '없음'}
갈등 유형: ${result.conflictType || ''} | 독성지수: ${score}

[출력 형식] 순수 JSON만.

{
  "dangerTypes": [
    {
      "type": "위험 유형명 (예: 통제형)",
      "years": "이 유형이 많이 나타나는 출생연대 힌트",
      "whyDangerous": "3문장. 이 유형과 왜 구조적으로 안 맞는지 — 어떤 방식으로 서로를 소모시키는지, 처음엔 왜 끌렸다가 나중에 힘들어지는지.",
      "realScenario": "3문장. 이 유형과 실제로 관계를 맺었을 때 반복되는 장면 — 대화체·감정·결말 포함."
    },
    {
      "type": "두 번째 위험 유형명",
      "years": "출생연대 힌트",
      "whyDangerous": "3문장.",
      "realScenario": "3문장."
    }
  ],
  "conflictScenarios": [
    {
      "situation": "25자 이내 구체적 장면",
      "whatHappens": "4문장. 어떤 갈등이 어떻게 터지는지 생생하게 — 대화·감정·속마음.",
      "whySaju": "2문장."
    },
    {
      "situation": "25자 이내 다른 장면",
      "whatHappens": "4문장.",
      "whySaju": "2문장."
    }
  ],
  "triggerPoints": ["이 말을 들으면 반응하는 것 — 직접 인용형", "이 행동을 보면 방어적이 되는 것", "이 상황이 되면 감정이 올라오는 것", "이 패턴이 반복될 때 무력감을 느끼는 것", "이 신호가 보이면 마음이 닫히는 것"],
  "warningPattern": "3문장. 내가 반복하는 갈등 패턴 — 어떤 상황에서 같은 실수를 반복하는지, 왜 그러는지, 어떻게 다르게 할 수 있는지.",
  "avoidanceGuide": {
    "mindset": "3문장. 핵심 마인드셋 — 나의 갈등 기질을 알고 어떻게 다르게 반응할 것인지.",
    "practicalTips": ["갈등 시작 전 할 수 있는 것", "갈등 중 해야 하는 것", "갈등 후 회복 방법", "이 기질과 함께 살아가는 방법", "에너지를 충전하는 방법"],
    "boundaries": "3문장. 나를 지키기 위한 관계별 선 긋기 방법."
  }
}`;
}

// ─── Phase 2: 관계 영향 + 지속 판단 ─────────────────────────────
function buildPhase2Prompt(myData: any, targetData: any, relationType: string, result: any): string {
  const chung = result.conflicts.chung.map((c: any) => c.name).join(', ') || '없음';
  const hyung = result.conflicts.hyung?.map((h: any) => h.name).join(', ') || '없음';
  const hae   = result.conflicts.hae?.map((h: any) => h.name).join(', ') || '없음';
  const geuk  = result.conflicts.geuk?.exists ? result.conflicts.geuk.direction : '없음';
  const score = result.toxicScore;
  const myPillar  = `${result.myYear?.stem}${result.myYear?.branch}년 ${result.myMonth ? result.myMonth.stem+result.myMonth.branch+'월' : ''} ${result.myDay ? result.myDay.stem+result.myDay.branch+'일' : ''}`.trim();
  const tgPillar  = `${result.targetYear?.stem}${result.targetYear?.branch}년 ${result.targetMonth ? result.targetMonth.stem+result.targetMonth.branch+'월' : ''} ${result.targetDay ? result.targetDay.stem+result.targetDay.branch+'일' : ''}`.trim();

  return `[사주 데이터]
나(${myData.gender}): ${myPillar}
상대(${targetData.gender}): ${tgPillar}
관계: ${relationType} | 독성지수: ${score}점
충(沖): ${chung} | 형(刑): ${hyung} | 해(害): ${hae} | 극(剋): ${geuk}
갈등요약: ${result.conflictSummary || ''} | 태그: ${result.tags?.join(',') || ''}

[목표] 04번 섹션: "이 관계가 나에게 주는 영향"을 거울처럼 보여줘서 소름 돋게. 05번 섹션: 상대방 사주 기운으로 "상대방이 나를 어떻게 인식하는지" — 상대방의 오행·충돌구조를 뒤집어서 나를 바라보는 시선 분석. 추상적 표현 절대 금지, 구체적 장면·대화체·상대방 내면 독백까지. 06번 섹션: 계속 가야 할지 사주로 판정.
[출력 형식] 순수 JSON만.

{
  "personalImpact": {
    "onMe": "4문장. 이 관계가 지금 나에게 실제로 주는 영향. ①에너지·체력 측면에서 — 이 사람과 만난 날과 만나지 않은 날이 어떻게 다른지. ②감정·자존감 측면에서 — 이 관계 안에서 나는 어떤 버전의 나인지. ③일상 영향 — 이 관계 때문에 다른 것에 어떤 영향이 가는지. ④내가 의식하지 못하고 있었던 것.",
    "warningSignals": [
      "이 관계가 나를 갉아먹고 있다는 신호 — 신체 반응으로 나타나는 것 (예: 연락 오면 몸이 먼저 반응하는 것)",
      "감정 측면에서 나타나는 신호 — 이전과 달라진 나의 감정 패턴",
      "행동 측면에서 나타나는 신호 — 내가 이 관계 때문에 하게 된 행동 변화",
      "생각 측면에서 나타나는 신호 — 이 사람에 대해 반복되는 생각 패턴",
      "관계 외부에서 나타나는 신호 — 다른 관계나 일에 생기는 영향"
    ],
    "whatYouLose": "3문장. 이 관계를 유지하면서 내가 서서히 포기하거나 잃어가는 것들 — ①내 에너지의 어느 부분. ②내 어떤 모습이나 능력. ③내가 원래 가지고 싶었던 어떤 것."
  },
  "howTheySeeMe": {
    "energyReading": "4문장. 상대방의 사주(${tgPillar}) 기운이 나의 사주(${myPillar}) 에너지를 어떻게 읽는지 — ①상대방 오행 기질로 봤을 때 내 에너지가 처음 어떻게 느껴졌는지 — 끌렸는지 경계했는지 구체적으로. ②충·극 구조(${chung !== '없음' ? chung : geuk !== '없음' ? '극: '+geuk : '오행 불일치'})가 상대방의 감각에 어떻게 체감되는지 — '이 사람이 뭔가 나를 건드린다'는 느낌이 어떤 순간에 생기는지. ③상대방이 나를 속으로 어떤 '유형의 사람'으로 분류했는지 — 사주 기운이 만드는 프레임. ④시간이 지나면서 그 인식이 어떻게 굳어졌는지.",
    "whatIrritates": "4문장. 내가 전혀 의도하지 않았는데 상대방의 사주 기질을 긁는 말·행동·태도 — ①내 어떤 특성이 상대방의 오행 에너지와 구조적으로 충돌하는지 — 실제 대화 장면('내가 이렇게 말하면 상대방은 속으로 이런 생각을 한다' 형식). ②상대방이 '또 시작이다' 싶어하는 순간 — 내가 하는 패턴이지만 본인은 잘 모르는 것. ③그 순간 상대방 안에서 어떤 감정이 올라오는지 — 상대방의 내면 독백. ④상대방이 나한테 거리를 두거나 차갑게 반응하는 진짜 사주 구조적 이유.",
    "whatDrawsThem": "3문장. 갈등이 있는데도 상대방이 나를 놓지 못하는 사주적 이유 — 충(沖)이 동시에 끌림이기도 한 구조적 아이러니, 상대방이 나에게서 무의식적으로 채우려는 오행 에너지, 상대방 자신도 설명 못하는 나에 대한 집착이나 신경 쓰임.",
    "theirPrivateVerdict": "4문장. 상대방이 혼자 있을 때 나를 어떻게 평가하는지 — ①나에 대해 반복적으로 하는 생각 — 긍정 한 가지, 부정 한 가지 (대화체로). ②상대방의 기억에 박혀 있는 나의 특정 장면이나 말 — 상대방이 그 장면을 어떻게 해석하고 있는지. ③나에 대한 상대방의 속 판단 — '결국 얘는 이런 사람이야' 싶은 것. ④상대방이 나한테 직접 말하지 못한 채 품고 있는 것.",
    "howTheyNeedMe": "3문장. 상대방이 이 관계에서 나에게 실제로 원하는 것 — 말로 표현하지 않지만 행동으로 드러나는 욕구, 내가 이걸 해줄 때 상대방이 안도하거나 만족하는 것, 이게 채워지지 않을 때 상대방이 구체적으로 어떻게 반응하는지."
  },
  "continuationAssessment": {
    "structuralAnalysis": "4문장. 이 관계의 구조적 분석. ①사주 구조상 이 갈등의 뿌리 — 두 사람의 에너지가 어떤 식으로 충돌하는지. ②노력으로 바꿀 수 있는 것 vs 구조적으로 변하지 않는 것을 명확히 구분. ③지금까지 어떤 패턴이 반복됐을지 — 이미 경험했을 법한 것. ④이 구조를 알고 관계를 이어간다는 것이 어떤 의미인지.",
    "whatItTakes": "3문장. 이 관계를 계속 이어가기로 결심했다면 — ①두 사람 모두에게 현실적으로 필요한 변화. ②어느 한쪽만 노력하는 구조가 왜 지속되기 어려운지. ③이게 가능하려면 어떤 조건이 충족되어야 하는지.",
    "redLine": "3문장. 이 신호가 보이면 관계를 반드시 재고해야 하는 레드라인 — ①이 행동·패턴이 반복될 때. ②나에게 이런 변화가 생겼을 때. ③관계 안에서 이것이 느껴질 때. 모두 추상적이지 않고 구체적으로.",
    "verdict": "3문장. 사주 구조 기반 최종 판정 — 솔직하고 단호하되 잔인하지 않게. 이 관계가 나에게 어떤 의미인지, 계속 가야 한다면 어떤 전제가 필요한지, 이 판정을 읽는 사람에게 전하는 마지막 한마디."
  }
}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phase, myData, targetData, relationType, result } = req.body;

  if (phase === 2 && !targetData?.birthdate) {
    return res.status(200).json({ data: null });
  }

  if (phase === 1) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (obj: object) => res.write('data: ' + JSON.stringify(obj) + '\n\n');

    let charsA = 0;
    let charsB = 0;
    const MAX_A = 9000;
    const MAX_B = 12000;

    try {
      const streamA = client.messages.stream({
        model: MODEL_SONNET,
        max_tokens: 6000,
        system: [SYSTEM_CACHED],
        messages: [{ role: 'user', content: buildPhase1APrompt(myData, targetData, relationType, result) }],
      });
      const streamB = client.messages.stream({
        model: MODEL_SONNET,
        max_tokens: 8000,
        system: [SYSTEM_CACHED],
        messages: [{ role: 'user', content: buildPhase1BPrompt(myData, targetData, relationType, result) }],
      });

      streamA.on('text', text => {
        charsA += text.length;
        const pct = Math.min(5 + Math.round((charsA / MAX_A) * 42 + (charsB / MAX_B) * 43), 90);
        send({ type: 'progress', pct });
      });
      streamB.on('text', text => {
        charsB += text.length;
        const pct = Math.min(5 + Math.round((charsA / MAX_A) * 42 + (charsB / MAX_B) * 43), 90);
        send({ type: 'progress', pct });
      });

      const [msgA, msgB] = await Promise.all([streamA.finalMessage(), streamB.finalMessage()]);

      const cA = msgA.content[0];
      const cB = msgB.content[0];
      if (cA.type !== 'text') throw new Error('Not text A');
      if (cB.type !== 'text') throw new Error('Not text B');

      const dataA = extractJson(cA.text);
      const dataB = extractJson(cB.text);
      send({ type: 'done', data: { ...dataA, ...dataB } });
    } catch (err) {
      console.error('[TOXIC API] phase 1 stream', err);
      send({ type: 'error', message: 'failed' });
    }
    res.end();
    return;
  }

  try {
    // Phase 2: Sonnet
    const text = await callSonnet(
      buildPhase2Prompt(myData, targetData, relationType, result),
      5000,
    );
    return res.status(200).json({ data: extractJson(text) });
  } catch (err) {
    console.error('[TOXIC API] phase', phase, err);
    return res.status(500).json({ error: 'Analysis failed' });
  }
}
