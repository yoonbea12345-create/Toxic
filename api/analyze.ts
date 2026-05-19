import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL_SONNET = 'claude-sonnet-4-6';
const MODEL_HAIKU  = 'claude-haiku-4-5-20251001';

// 시스템 프롬프트는 캐싱 적용 (5분 TTL, 반복 호출 시 입력 처리 시간 단축)
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

// ─── Phase 1A: 핵심 요약 (빠른 필드) ─────────────────────────────
function buildPhase1APrompt(myData: any, targetData: any, relationType: string, result: any): string {
  const hasTarget = Boolean(targetData?.birthdate);
  const chung = result.conflicts.chung.map((c: any) => c.name).join(',') || '없음';
  const hyung = result.conflicts.hyung.map((h: any) => h.name).join(',') || '없음';
  const geuk  = result.conflicts.geuk?.direction || '없음';

  if (hasTarget) {
    return `사주 핵심 갈등 분석. 순수 JSON만.

나:${myData.gender}/${myData.birthdate} 년${result.myYear.stem}${result.myYear.branch} 월${result.myMonth ? result.myMonth.stem+result.myMonth.branch : '-'} 일${result.myDay ? result.myDay.stem+result.myDay.branch : '-'}
상대:${targetData.gender}/${targetData.birthdate} 년${result.targetYear.stem}${result.targetYear.branch} 월${result.targetMonth ? result.targetMonth.stem+result.targetMonth.branch : '-'} 일${result.targetDay ? result.targetDay.stem+result.targetDay.branch : '-'}
관계:${relationType} 독성:${result.toxicScore} 충:${chung} 형:${hyung} 극:${geuk}

{
  "toxicSummary": "15자 이내 핵심",
  "coreConflict": {"title": "10자 이내", "description": "2문장, 단정적"},
  "conflictAnalysis": {
    "chung": ${chung !== '없음' ? '"충 작동 방식 1문장"' : 'null'},
    "hyung": ${hyung !== '없음' ? '"형 작동 방식 1문장"' : 'null'},
    "hae": null,
    "geuk": ${geuk !== '없음' ? '"극 작동 방식 1문장"' : 'null'}
  },
  "emotionalPattern": {"myPattern": "1문장", "targetPattern": "1문장", "cycle": "1문장"},
  "hiddenDynamic": "1문장"
}`;
  }

  return `내 사주 기질 분석. 순수 JSON만.

나:${myData.gender}/${myData.birthdate} 년${result.myYear.stem}${result.myYear.branch} 월${result.myMonth ? result.myMonth.stem+result.myMonth.branch : '-'} 일${result.myDay ? result.myDay.stem+result.myDay.branch : '-'}
충유발:${result.myDangerBranches?.join(',') || '없음'} 극유발:${result.myDangerOhaeng?.join(',') || '없음'}

{
  "toxicSummary": "15자 이내",
  "myCharacter": {"core": "2문장", "strength": "1문장", "shadow": "1문장"},
  "hiddenDynamic": "1문장"
}`;
}

// ─── Phase 1B: 상세 시나리오 (병렬 실행) ─────────────────────────
function buildPhase1BPrompt(myData: any, targetData: any, relationType: string, result: any): string {
  const hasTarget = Boolean(targetData?.birthdate);
  const chung = result.conflicts.chung.map((c: any) => c.name).join(',') || '없음';
  const geuk  = result.conflicts.geuk?.direction || '없음';

  if (hasTarget) {
    return `사주 갈등 시나리오·회피 가이드 분석. 순수 JSON만.

나:${myData.gender}/${myData.birthdate} 년${result.myYear.stem}${result.myYear.branch}
상대:${targetData.gender}/${targetData.birthdate} 년${result.targetYear.stem}${result.targetYear.branch}
관계:${relationType} 독성:${result.toxicScore} 충:${chung} 극:${geuk}

{
  "conflictScenarios": [
    {"situation": "20자 장면", "whatHappens": "2문장", "whySaju": "1문장"},
    {"situation": "20자 장면", "whatHappens": "2문장", "whySaju": "1문장"},
    {"situation": "20자 장면", "whatHappens": "2문장", "whySaju": "1문장"}
  ],
  "triggerPoints": ["트리거1", "트리거2", "트리거3"],
  "relationSpecific": "${relationType} 관계 특이점 1-2문장",
  "realisticOutlook": "현실적 전망 1문장",
  "energyDynamic": {"whoLoses": "1문장", "drainMechanism": "1문장", "longTermEffect": "1문장"},
  "avoidanceGuide": {"mindset": "1-2문장", "practicalTips": ["팁1", "팁2", "팁3"], "boundaries": "1문장"}
}`;
  }

  return `내 사주 위험 유형·갈등 패턴 분석. 순수 JSON만.

나:${myData.gender}/${myData.birthdate} 년${result.myYear.stem}${result.myYear.branch}
충유발:${result.myDangerBranches?.join(',') || '없음'} 극유발:${result.myDangerOhaeng?.join(',') || '없음'}

{
  "dangerTypes": [
    {"type": "유형명", "years": "출생연도 힌트", "whyDangerous": "1-2문장", "realScenario": "2문장"},
    {"type": "유형명", "years": "출생연도 힌트", "whyDangerous": "1-2문장", "realScenario": "2문장"}
  ],
  "conflictScenarios": [
    {"situation": "20자", "whatHappens": "2문장", "whySaju": "1문장"},
    {"situation": "20자", "whatHappens": "2문장", "whySaju": "1문장"}
  ],
  "triggerPoints": ["트리거1", "트리거2", "트리거3"],
  "warningPattern": "2문장",
  "avoidanceGuide": {"mindset": "1-2문장", "practicalTips": ["팁1", "팁2", "팁3"], "boundaries": "1문장"}
}`;
}

// ─── Phase 2 ─────────────────────────────────────────────────────
function buildPhase2Prompt(myData: any, targetData: any, relationType: string, result: any): string {
  const chung = result.conflicts.chung.map((c: any) => c.name).join(',') || '없음';
  const geuk  = result.conflicts.geuk?.direction || '없음';

  return `사주 관계 영향·지속 판단 분석. 순수 JSON만.

나:${myData.gender}/${myData.birthdate} 년${result.myYear.stem}${result.myYear.branch} 일${result.myDay ? result.myDay.stem+result.myDay.branch : '-'}
상대:${targetData.gender}/${targetData.birthdate} 년${result.targetYear.stem}${result.targetYear.branch}
관계:${relationType} 독성:${result.toxicScore} 충:${chung} 극:${geuk}

{
  "personalImpact": {"onMe": "1-2문장", "warningSignals": ["신호1", "신호2", "신호3"], "whatYouLose": "1문장"},
  "continuationAssessment": {"structuralAnalysis": "1-2문장", "whatItTakes": "1문장", "redLine": "1문장", "verdict": "1문장, 직접적으로"}
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
        callSonnet(buildPhase1APrompt(myData, targetData, relationType, result), 700),
        callSonnet(buildPhase1BPrompt(myData, targetData, relationType, result), 900),
      ]);
      const dataA = extractJson(textA);
      const dataB = extractJson(textB);
      return res.status(200).json({ data: { ...dataA, ...dataB } });
    } else {
      // Phase 2: Sonnet, 800 토큰
      const text = await callSonnet(
        buildPhase2Prompt(myData, targetData, relationType, result),
        800,
      );
      return res.status(200).json({ data: extractJson(text) });
    }
  } catch (err) {
    console.error('[TOXIC API] phase', phase, err);
    return res.status(500).json({ error: 'Analysis failed' });
  }
}
