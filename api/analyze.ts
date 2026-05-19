import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL_SONNET = 'claude-sonnet-4-6';
const MODEL_HAIKU  = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `당신은 사주명리학 전문가입니다. TOXIC 서비스 — "왜 안맞는지" — 를 사주로 날카롭고 구체적으로 설명합니다.
원칙: 추상적 설명 금지, 단정적으로, 완전한 JSON, 한국어`;

async function callModel(
  params: Omit<Anthropic.MessageCreateParamsNonStreaming, 'model'>,
  model: string,
  timeoutMs: number,
) {
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

// Phase 1: Sonnet (품질 중요) → Haiku fallback
async function callPhase1(params: Omit<Anthropic.MessageCreateParamsNonStreaming, 'model'>) {
  try {
    return await callModel(params, MODEL_SONNET, 40000);
  } catch {
    return await callModel(params, MODEL_HAIKU, 20000);
  }
}

// Phase 2: Haiku 직행 (04·05 섹션은 짧고 빠름이 우선)
async function callPhase2(params: Omit<Anthropic.MessageCreateParamsNonStreaming, 'model'>) {
  try {
    return await callModel(params, MODEL_HAIKU, 20000);
  } catch {
    return await callModel(params, MODEL_SONNET, 30000);
  }
}

function parseJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in response');
  return JSON.parse(match[0]);
}

function buildPhase1Prompt(myData: any, targetData: any, relationType: string, result: any): string {
  const hasTarget = Boolean(targetData?.birthdate);

  if (hasTarget) {
    const chung = result.conflicts.chung.map((c: any) => c.name).join(', ') || '없음';
    const hyung = result.conflicts.hyung.map((h: any) => h.name).join(', ') || '없음';
    const geuk  = result.conflicts.geuk?.direction || '없음';

    return `사주 관계 분석. 순수 JSON만 반환.

나: ${myData.gender}/${myData.birthdate} 년주${result.myYear.stem}${result.myYear.branch} 월주${result.myMonth ? result.myMonth.stem + result.myMonth.branch : '-'} 일주${result.myDay ? result.myDay.stem + result.myDay.branch : '-'}
상대: ${targetData.gender}/${targetData.birthdate} 년주${result.targetYear.stem}${result.targetYear.branch} 월주${result.targetMonth ? result.targetMonth.stem + result.targetMonth.branch : '-'} 일주${result.targetDay ? result.targetDay.stem + result.targetDay.branch : '-'}
관계:${relationType} 독성지수:${result.toxicScore} 충:${chung} 형:${hyung} 극:${geuk}

{
  "toxicSummary": "15자 이내 핵심",
  "coreConflict": {"title": "10자 이내", "description": "2문장"},
  "conflictAnalysis": {
    "chung": ${chung !== '없음' ? '"충 작동 방식 1문장"' : 'null'},
    "hyung": ${hyung !== '없음' ? '"형 작동 방식 1문장"' : 'null'},
    "geuk": ${geuk !== '없음' ? '"극 작동 방식 1문장"' : 'null'}
  },
  "conflictScenarios": [
    {"situation": "20자 장면", "whatHappens": "2문장", "whySaju": "1문장"},
    {"situation": "20자 장면", "whatHappens": "2문장", "whySaju": "1문장"}
  ],
  "emotionalPattern": {"myPattern": "1문장", "targetPattern": "1문장", "cycle": "1문장"},
  "triggerPoints": ["트리거1", "트리거2", "트리거3"],
  "hiddenDynamic": "1문장",
  "avoidanceGuide": {"mindset": "1문장", "practicalTips": ["팁1", "팁2", "팁3"], "boundaries": "1문장"}
}`;
  }

  // 역산 모드
  return `내 사주 위험 유형 분석. 순수 JSON만 반환.

나: ${myData.gender}/${myData.birthdate} 년주${result.myYear.stem}${result.myYear.branch} 월주${result.myMonth ? result.myMonth.stem + result.myMonth.branch : '-'} 일주${result.myDay ? result.myDay.stem + result.myDay.branch : '-'}
충유발:${result.myDangerBranches?.join(',') || '없음'} 극유발:${result.myDangerOhaeng?.join(',') || '없음'}

{
  "toxicSummary": "15자 이내",
  "myCharacter": {"core": "2문장", "strength": "1문장", "shadow": "1문장"},
  "dangerTypes": [
    {"type": "유형명", "years": "출생연도 힌트", "whyDangerous": "1문장", "realScenario": "2문장"},
    {"type": "유형명", "years": "출생연도 힌트", "whyDangerous": "1문장", "realScenario": "2문장"}
  ],
  "conflictScenarios": [
    {"situation": "20자", "whatHappens": "2문장", "whySaju": "1문장"},
    {"situation": "20자", "whatHappens": "2문장", "whySaju": "1문장"}
  ],
  "triggerPoints": ["트리거1", "트리거2", "트리거3"],
  "hiddenDynamic": "1문장",
  "avoidanceGuide": {"mindset": "1문장", "practicalTips": ["팁1", "팁2", "팁3"], "boundaries": "1문장"}
}`;
}

function buildPhase2Prompt(myData: any, targetData: any, relationType: string, result: any): string {
  const chung = result.conflicts.chung.map((c: any) => c.name).join(', ') || '없음';
  const geuk  = result.conflicts.geuk?.direction || '없음';

  return `사주 관계 영향 분석. 순수 JSON만 반환.

나:${myData.gender}/${myData.birthdate} 년주${result.myYear.stem}${result.myYear.branch} 일주${result.myDay ? result.myDay.stem + result.myDay.branch : '-'}
상대:${targetData.gender}/${targetData.birthdate} 년주${result.targetYear.stem}${result.targetYear.branch}
관계:${relationType} 독성:${result.toxicScore} 충:${chung} 극:${geuk}

{
  "personalImpact": {"onMe": "1-2문장", "warningSignals": ["신호1", "신호2", "신호3"], "whatYouLose": "1문장"},
  "continuationAssessment": {"structuralAnalysis": "1문장", "whatItTakes": "1문장", "redLine": "1문장", "verdict": "1문장"}
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

  const prompt = phase === 1
    ? buildPhase1Prompt(myData, targetData, relationType, result)
    : buildPhase2Prompt(myData, targetData, relationType, result);

  // Phase 1: 1500 토큰으로 축소 (기존 3000), Phase 2: 800
  const maxTokens = phase === 1 ? 1500 : 800;
  const caller = phase === 1 ? callPhase1 : callPhase2;

  try {
    const msg = await caller({
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = msg.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    const data = parseJson(content.text);
    return res.status(200).json({ data });
  } catch (err) {
    console.error('[TOXIC API] phase', phase, err);
    return res.status(500).json({ error: 'Analysis failed' });
  }
}
