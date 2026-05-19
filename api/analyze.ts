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
  text: `당신은 사주명리학 전문가입니다. TOXIC — "왜 안맞는지" — 사주로 날카롭고 구체적으로 설명합니다.
원칙: 추상적 설명 금지, 실제 상황/대화/감정으로 묘사, 단정적으로, 완전한 JSON, 한국어`,
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

// ─── Phase 1A: 핵심 요약 ─────────────────────────────────────────
function buildPhase1APrompt(myData: any, targetData: any, relationType: string, result: any): string {
  const hasTarget = Boolean(targetData?.birthdate);
  const chung = result.conflicts.chung.map((c: any) => c.name).join(',') || '없음';
  const hyung = result.conflicts.hyung.map((h: any) => h.name).join(',') || '없음';
  const geuk  = result.conflicts.geuk?.direction || '없음';

  if (hasTarget) {
    return `사주 핵심 갈등 분석. 순수 JSON만 출력. 모든 설명은 쉬운 한국어로, 전문 용어 없이, 일반인이 바로 이해할 수 있게.

나:${myData.gender}/${myData.birthdate} 년${result.myYear.stem}${result.myYear.branch} 월${result.myMonth ? result.myMonth.stem+result.myMonth.branch : '-'} 일${result.myDay ? result.myDay.stem+result.myDay.branch : '-'}
상대:${targetData.gender}/${targetData.birthdate} 년${result.targetYear.stem}${result.targetYear.branch} 월${result.targetMonth ? result.targetMonth.stem+result.targetMonth.branch : '-'} 일${result.targetDay ? result.targetDay.stem+result.targetDay.branch : '-'}
관계:${relationType} 독성:${result.toxicScore} 충:${chung} 형:${hyung} 극:${geuk}

{
  "toxicSummary": "20자 이내, 이 관계를 한마디로 정의",
  "coreConflict": {
    "title": "12자 이내 충돌 유형명",
    "description": "4문장. 왜 이 두 사람이 구조적으로 안 맞는지, 어떤 상황에서 충돌이 생기는지, 상대방 입장에서 나는 어떻게 보이는지, 이 갈등이 왜 반복되는지. 구체적이고 단정적으로."
  },
  "conflictAnalysis": {
    "chung": ${chung !== '없음' ? `"충(沖)이 이 관계에서 실제로 어떻게 작동하는지 3문장. 첫째, 어떤 에너지 충돌인지. 둘째, 실생활에서 어떤 상황으로 터지는지(대화 예시 포함). 셋째, 왜 반복될 수밖에 없는지."` : 'null'},
    "hyung": ${hyung !== '없음' ? `"형(刑)이 이 관계에서 실제로 어떻게 작동하는지 3문장. 구체적 상황과 감정 묘사 포함."` : 'null'},
    "hae": null,
    "geuk": ${geuk !== '없음' ? `"극(剋)이 이 관계에서 실제로 어떻게 작동하는지 3문장. 누가 누구를 억누르는지, 어떻게 체감되는지."` : 'null'}
  },
  "emotionalPattern": {
    "myPattern": "내가 이 관계에서 주로 어떻게 감정적으로 반응하는지 2-3문장. 어떤 말이나 행동에 특히 상처받는지, 속으로 무슨 생각을 하는지 구체적으로.",
    "targetPattern": "상대가 이 관계에서 주로 어떻게 감정적으로 반응하는지 2-3문장. 상대의 특유한 반응 패턴을 구체적으로.",
    "cycle": "두 사람이 반복하는 갈등 사이클 2-3문장. 어떻게 시작해서 어떻게 끝나고 왜 또 반복되는지 실제 상황처럼."
  },
  "hiddenDynamic": "겉으로 보이지 않는 숨겨진 역학 2-3문장. 두 사람이 인식하지 못하는 패턴, 무의식적으로 서로에게 하는 일."
}`;
  }

  return `내 사주 기질 분석. 순수 JSON만 출력. 쉬운 한국어, 전문 용어 없이.

나:${myData.gender}/${myData.birthdate} 년${result.myYear.stem}${result.myYear.branch} 월${result.myMonth ? result.myMonth.stem+result.myMonth.branch : '-'} 일${result.myDay ? result.myDay.stem+result.myDay.branch : '-'}
충유발:${result.myDangerBranches?.join(',') || '없음'} 극유발:${result.myDangerOhaeng?.join(',') || '없음'}

{
  "toxicSummary": "20자 이내, 내 갈등 성향 핵심",
  "myCharacter": {
    "core": "3-4문장. 내 사주 기질의 핵심. 어떤 상황에서 어떻게 반응하는 사람인지, 인간관계에서 어떤 패턴이 반복되는지 구체적으로.",
    "strength": "2문장. 이 기질의 강점. 어떤 상황에서 빛나는지 구체적으로.",
    "shadow": "2문장. 이 기질의 그림자. 어떤 상황에서 독이 되는지 구체적으로."
  },
  "hiddenDynamic": "2-3문장. 내가 스스로 잘 모르는 무의식적 패턴. 남들 눈에는 보이지만 나는 모르는 것."
}`;
}

// ─── Phase 1B: 상세 시나리오 (병렬 실행) ─────────────────────────
function buildPhase1BPrompt(myData: any, targetData: any, relationType: string, result: any): string {
  const hasTarget = Boolean(targetData?.birthdate);
  const chung = result.conflicts.chung.map((c: any) => c.name).join(',') || '없음';
  const geuk  = result.conflicts.geuk?.direction || '없음';

  if (hasTarget) {
    return `사주 갈등 시나리오·회피 가이드. 순수 JSON만. 쉬운 한국어, 전문 용어 없이, 실생활 예시 중심.

나:${myData.gender}/${myData.birthdate} 년${result.myYear.stem}${result.myYear.branch}
상대:${targetData.gender}/${targetData.birthdate} 년${result.targetYear.stem}${result.targetYear.branch}
관계:${relationType} 독성:${result.toxicScore} 충:${chung} 극:${geuk}

{
  "conflictScenarios": [
    {
      "situation": "30자 이내 구체적 생활 장면 (예: '카페에서 진로 이야기를 하다가')",
      "whatHappens": "4문장. 그 상황에서 구체적으로 어떤 대화가 오가고, 어떤 감정이 올라오고, 어떻게 폭발하거나 냉각되는지. 마치 그 자리에 있는 것처럼 생생하게.",
      "whySaju": "2문장. 이게 단순한 성격 차이가 아니라 사주 구조상 왜 이렇게 될 수밖에 없는지."
    },
    {
      "situation": "30자 이내 다른 생활 장면",
      "whatHappens": "4문장. 구체적 대화·감정·결말.",
      "whySaju": "2문장."
    },
    {
      "situation": "30자 이내 또 다른 생활 장면",
      "whatHappens": "4문장. 구체적 대화·감정·결말.",
      "whySaju": "2문장."
    }
  ],
  "triggerPoints": ["구체적 트리거1 (어떤 말/행동/상황)", "트리거2", "트리거3", "트리거4", "트리거5"],
  "relationSpecific": "${relationType} 관계에서 특히 부각되는 갈등 패턴 2-3문장. 이 관계 유형이기 때문에 생기는 특수한 긴장.",
  "realisticOutlook": "앞으로 이 관계가 어떻게 흘러갈 가능성이 높은지 2-3문장. 솔직하고 직접적으로.",
  "energyDynamic": {
    "whoLoses": "2문장. 누가 더 에너지를 소모하고, 어떤 방식으로 소모되는지.",
    "drainMechanism": "2문장. 에너지가 빠져나가는 구체적인 메커니즘. 어떤 대화·상황에서 특히 소모되는지.",
    "longTermEffect": "2문장. 이 관계를 오래 유지했을 때 장기적으로 나타나는 영향."
  },
  "avoidanceGuide": {
    "mindset": "3문장. 이 관계에서 덜 상처받고 살아남기 위해 가져야 할 핵심 마음가짐. 현실적이고 직접적으로.",
    "practicalTips": [
      "구체적 행동 팁1 — 어떤 상황에서 어떻게 행동하면 되는지",
      "팁2",
      "팁3",
      "팁4",
      "팁5"
    ],
    "boundaries": "2-3문장. 이 관계에서 반드시 지켜야 할 선. 어떤 상황에서 어떻게 선을 그어야 하는지."
  }
}`;
  }

  return `내 사주 위험 유형·갈등 패턴. 순수 JSON만. 쉬운 한국어, 실생활 예시 중심.

나:${myData.gender}/${myData.birthdate} 년${result.myYear.stem}${result.myYear.branch}
충유발:${result.myDangerBranches?.join(',') || '없음'} 극유발:${result.myDangerOhaeng?.join(',') || '없음'}

{
  "dangerTypes": [
    {
      "type": "위험 유형명 (예: 통제형, 회피형)",
      "years": "이런 유형이 많은 출생연도대 힌트",
      "whyDangerous": "3문장. 이 유형과 왜 안 맞는지, 어떤 방식으로 서로 힘들게 하는지 구체적으로.",
      "realScenario": "3문장. 실제로 이런 유형과 만났을 때 어떤 상황이 벌어지는지 생생하게."
    },
    {
      "type": "두 번째 위험 유형명",
      "years": "출생연도대 힌트",
      "whyDangerous": "3문장.",
      "realScenario": "3문장."
    }
  ],
  "conflictScenarios": [
    {
      "situation": "30자 이내 구체적 장면",
      "whatHappens": "4문장. 실제로 어떻게 충돌이 벌어지는지 생생하게.",
      "whySaju": "2문장."
    },
    {
      "situation": "30자 이내 다른 장면",
      "whatHappens": "4문장.",
      "whySaju": "2문장."
    }
  ],
  "triggerPoints": ["구체적 트리거1", "트리거2", "트리거3", "트리거4", "트리거5"],
  "warningPattern": "3문장. 내가 반복하는 갈등 패턴. 왜 같은 실수를 반복하는지, 어떻게 빠져나올 수 있는지.",
  "avoidanceGuide": {
    "mindset": "3문장. 핵심 마음가짐.",
    "practicalTips": ["구체적 팁1", "팁2", "팁3", "팁4", "팁5"],
    "boundaries": "2-3문장. 지켜야 할 선."
  }
}`;
}

// ─── Phase 2 ─────────────────────────────────────────────────────
function buildPhase2Prompt(myData: any, targetData: any, relationType: string, result: any): string {
  const chung = result.conflicts.chung.map((c: any) => c.name).join(',') || '없음';
  const geuk  = result.conflicts.geuk?.direction || '없음';

  return `사주 관계 영향·지속 판단. 순수 JSON만. 쉬운 한국어, 직접적이고 솔직하게.

나:${myData.gender}/${myData.birthdate} 년${result.myYear.stem}${result.myYear.branch} 일${result.myDay ? result.myDay.stem+result.myDay.branch : '-'}
상대:${targetData.gender}/${targetData.birthdate} 년${result.targetYear.stem}${result.targetYear.branch}
관계:${relationType} 독성:${result.toxicScore} 충:${chung} 극:${geuk}

{
  "personalImpact": {
    "onMe": "3-4문장. 이 관계가 지금 나에게 실제로 하고 있는 일. 내 감정, 자존감, 에너지, 일상에 어떤 영향을 미치는지 구체적으로.",
    "warningSignals": [
      "이 관계가 나를 갉아먹고 있다는 구체적 신호1 (어떤 증상/감정/행동 변화)",
      "신호2",
      "신호3",
      "신호4",
      "신호5"
    ],
    "whatYouLose": "2-3문장. 이 관계를 유지하면서 내가 서서히 잃어가고 있는 것들. 구체적으로."
  },
  "continuationAssessment": {
    "structuralAnalysis": "3-4문장. 이 관계의 구조적 문제. 노력으로 해결 가능한 부분과 사주 구조상 변하지 않는 부분을 솔직하게.",
    "whatItTakes": "2-3문장. 이 관계를 계속 이어가려면 현실적으로 무엇이 필요한지. 가능한지 여부도 포함.",
    "redLine": "2-3문장. 이 신호가 보이면 관계를 재고해야 하는 구체적인 레드라인. 추상적이지 않게.",
    "verdict": "2-3문장. 사주 구조로 보는 최종 판정. 솔직하고 단호하게."
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

  try {
    if (phase === 1) {
      // Phase 1A + 1B 병렬 실행 (40s → ~20s)
      const [textA, textB] = await Promise.all([
        callSonnet(buildPhase1APrompt(myData, targetData, relationType, result), 1200),
        callSonnet(buildPhase1BPrompt(myData, targetData, relationType, result), 1600),
      ]);
      const dataA = extractJson(textA);
      const dataB = extractJson(textB);
      return res.status(200).json({ data: { ...dataA, ...dataB } });
    } else {
      // Phase 2: Sonnet, 800 토큰
      const text = await callSonnet(
        buildPhase2Prompt(myData, targetData, relationType, result),
        1200,
      );
      return res.status(200).json({ data: extractJson(text) });
    }
  } catch (err) {
    console.error('[TOXIC API] phase', phase, err);
    return res.status(500).json({ error: 'Analysis failed' });
  }
}
