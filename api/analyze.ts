import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  defaultHeaders: { 'anthropic-beta': 'prompt-caching-2024-07-31' },
});

const MODEL_OPUS   = 'claude-opus-4-8';
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
7. 한국어 전용. 전문 용어는 괄호 안에 쉬운 설명 필수.
8. JSON 문자열 안에서 대화 예시를 쓸 때 큰따옴표(" ") 절대 사용 금지 — 반드시 작은따옴표(' ')로 대체. 큰따옴표가 필요하면 「 」 사용.`,
  cache_control: { type: 'ephemeral' },
};

async function callOpusNonStream(
  prompt: string,
  maxTokens: number,
  label: string,
  timeoutMs = 90000,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const msg = await client.messages.create(
      {
        model: MODEL_OPUS,
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
    console.log(`[USAGE] ${label}: input=${msg.usage.input_tokens} output=${msg.usage.output_tokens} cache_read=${(msg.usage as any).cache_read_input_tokens ?? 0}`);
    return c.text;
  } catch {
    clearTimeout(timer);
    return callSonnetFallback(prompt, maxTokens, label, 38000);
  }
}

async function callSonnetFallback(
  prompt: string,
  maxTokens: number,
  label: string,
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
    console.log(`[USAGE] ${label} Sonnet fallback: input=${msg.usage.input_tokens} output=${msg.usage.output_tokens}`);
    return c.text;
  } catch (err) {
    clearTimeout(timer);
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
  // Strip markdown code fences if present
  text = text.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '');

  const start = text.indexOf('{');
  if (start === -1) throw new Error('No JSON found');

  // Brace-balanced extraction — handles nested objects and escaped chars
  let depth = 0, inStr = false, esc = false, end = -1;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (esc) { esc = false; continue; }
    if (inStr) {
      if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') { inStr = true; continue; }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) { end = i; break; }
  }

  if (end === -1) throw new Error('Incomplete JSON');
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    // Last resort: greedy regex (may work if AI added trailing text)
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('No JSON');
    return JSON.parse(m[0]);
  }
}

// ─── Phase 1: 노출파트<1~6> + 디테일파트<1> ──────────────────────────
function buildPhase1Prompt(myData: any, targetData: any, relationType: string, result: any): string {
  const hasTarget = Boolean(targetData?.birthdate);
  const hasNameOnly = Boolean(targetData?.name && !targetData?.birthdate);

  if (hasNameOnly) return buildPhase1NameOnlyPrompt(myData, targetData, relationType, result);
  if (!hasTarget)  return buildPhase1NoTargetPrompt(myData, targetData, relationType, result);

  const chung = result.conflicts.chung.map((c: any) => c.name).join(', ') || '없음';
  const hyung = result.conflicts.hyung.map((h: any) => h.name).join(', ') || '없음';
  const hae   = result.conflicts.hae?.map((h: any) => h.name).join(', ') || '없음';
  const geuk  = result.conflicts.geuk?.exists ? result.conflicts.geuk.direction : '없음';
  const score = result.toxicScore;
  const myPillar = `${result.myYear?.stem}${result.myYear?.branch}년 ${result.myMonth ? result.myMonth.stem+result.myMonth.branch+'월' : ''} ${result.myDay ? result.myDay.stem+result.myDay.branch+'일' : ''}`.trim();
  const tgPillar = `${result.targetYear?.stem}${result.targetYear?.branch}년 ${result.targetMonth ? result.targetMonth.stem+result.targetMonth.branch+'월' : ''} ${result.targetDay ? result.targetDay.stem+result.targetDay.branch+'일' : ''}`.trim();
  const saeng = result.saengRelation;
  const saengInfo = saeng?.myToTarget && saeng?.targetToMe ? '쌍방 상생 — 끌림이 있지만 갈등도 공존'
    : saeng?.myToTarget ? '나→상대 상생(내가 더 소모)'
    : saeng?.targetToMe ? '상대→나 상생(의존성 발생 가능)'
    : '없음';
  const myYinYang = result.myDayYin ? '음간(陰干) — 감추고 내면화' : '양간(陽干) — 드러내고 직접';
  const tgYinYang = result.targetDayYin != null ? (result.targetDayYin ? '음간 — 감추고 내면화' : '양간 — 드러내고 직접') : '';
  const myDayPillar = result.myDay ? `${result.myDay.stem}${result.myDay.branch}` : `${result.myYear?.stem}${result.myYear?.branch}(년주대체)`;
  const tgDayPillar = result.targetDay ? `${result.targetDay.stem}${result.targetDay.branch}` : result.targetYear ? `${result.targetYear.stem}${result.targetYear.branch}(년주대체)` : '';
  const conflictRef = chung !== '없음' ? chung : geuk !== '없음' ? '극:'+geuk : '오행 불일치';

  return `[사주 데이터 — 일주(日柱)가 핵심]
나(${myData.gender}, ${myYinYang}): ${myPillar}
  → 일주(나 자신): ${myDayPillar}
상대(${targetData.gender}${tgYinYang ? ', ' + tgYinYang : ''}): ${tgPillar}
  → 일주(상대 자신): ${tgDayPillar}
관계: ${relationType} | 독성지수: ${score}점
충(沖): ${chung} | 형(刑): ${hyung} | 해(害): ${hae} | 극(剋): ${geuk}
상생(相生): ${saengInfo}
갈등요약: ${result.conflictSummary || ''} | 태그: ${result.tags?.join(',') || ''}

[목표] 6개 섹션 노출파트(핵심 요약)만 생성. 추상적 표현 절대 금지 — 구체적 장면·대화체·감정·속마음까지.
[출력 형식] 순수 JSON만. 주석·마크다운 없이.

{
  "toxicSummary": "20자 이내. 이 관계를 정의하는 날카로운 한마디.",
  "coreConflict": {
    "title": "12자 이내. 이 충돌의 이름.",
    "description": "3문장. ①사주 에너지를 일상 행동으로 번역해 왜 안 맞는지. ②갈등이 시작되는 구체적 생활 장면 + 양쪽 속마음. ③왜 노력해도 반복될 수밖에 없는지."
  },
  "conflictAnalysis": {
    "chung": ${chung !== '없음' ? `"1문장. 충 에너지를 실제 대화 장면으로('...라고 하면 ...라고 한다' 형식)."` : 'null'},
    "hyung": ${hyung !== '없음' ? `"1문장. 형의 압박이 일상에서 나타나는 방식."` : 'null'},
    "hae": ${hae !== '없음' ? `"1문장. 해의 소모가 체감되는 구체적 순간."` : 'null'},
    "geuk": ${geuk !== '없음' ? `"1문장. 극(${geuk} 방향)이 관계에서 작동하는 방식."` : 'null'}
  },
  "emotionalPattern": {
    "myPattern": "2문장. 갈등 시 나에게 꽂히는 상대방의 말·행동 + 그때 내 속마음.",
    "targetPattern": "2문장. 상대방의 갈등 반응 방식 + 왜 그러는지.",
    "cycle": "2문장. 두 사람이 반복하는 갈등 패턴 — 어떻게 시작해서 어떻게 굳어지는지."
  },
  "energyDynamic": {
    "whoLoses": "1문장. 에너지를 더 쓰는 쪽과 이유.",
    "drainMechanism": "1문장. 가장 지치는 순간.",
    "longTermEffect": "1문장. 1년 쌓이면 생기는 변화."
  },
  "hiddenDynamic": "2문장. 두 사람이 모르는 무의식 패턴 — 처음 끌린 이유가 갈등 이유가 되는 아이러니.",
  "conflictScenarios": [
    {
      "situation": "25자 이내. 실제 일어날 법한 구체적 생활 장면.",
      "whatHappens": "3문장. ①상대방 말·행동(대화체). ②그게 나에게 들리는 방식 + 속마음 독백. ③여운.",
      "whySaju": "1문장. 사주 구조적 이유."
    }
  ],
  "avoidanceGuide": {
    "mindset": "2문장. 이 관계에서 덜 소모되기 위한 핵심 마인드셋."
  }
}`;
}

// ─── Phase 1b: 섹션01 디테일파트 전용 (Phase 1 완료 후 백그라운드 생성) ───
function buildPhase1bPrompt(myData: any, targetData: any, relationType: string, result: any): string {
  const hasNameOnly = Boolean(targetData?.name && !targetData?.birthdate);
  if (hasNameOnly) return buildPhase1bNameOnlyPrompt(myData, targetData, relationType, result);

  const chung = result.conflicts.chung.map((c: any) => c.name).join(', ') || '없음';
  const geuk  = result.conflicts.geuk?.exists ? result.conflicts.geuk.direction : '없음';
  const conflictRef = chung !== '없음' ? chung : geuk !== '없음' ? '극:'+geuk : '오행 불일치';
  const myPillar = `${result.myYear?.stem}${result.myYear?.branch}년 ${result.myDay ? result.myDay.stem+result.myDay.branch+'일' : ''}`.trim();
  const tgPillar = `${result.targetYear?.stem}${result.targetYear?.branch}년 ${result.targetDay ? result.targetDay.stem+result.targetDay.branch+'일' : ''}`.trim();

  return `[사주 데이터]
나(${myData.gender}): ${myPillar} | 상대(${targetData.gender}): ${tgPillar}
관계: ${relationType} | 독성지수: ${result.toxicScore}점 | 충: ${chung} | 극: ${geuk}

[목표] 섹션01 디테일파트 3개 필드만 생성. 추상적 표현 절대 금지.
[출력 형식] 순수 JSON만.

{
  "personalImpact": {
    "onMe": "4문장. 이 관계가 지금 나에게 주는 실제 영향. ①에너지·체력 — 이 사람 만난 날 vs 안 만난 날. ②감정·자존감 — 이 관계 안에서 나는 어떤 버전의 나인지. ③일상 영향 — 다른 것들에 어떤 영향이 가는지. ④내가 의식하지 못했던 것."
  },
  "howTheySeeMe": {
    "energyReading": "4문장. 상대방 사주 기운이 나를 어떻게 읽는지. ①처음 느꼈을 때 — 끌렸는지 경계했는지 구체적으로. ②충·극 구조(${conflictRef})가 상대 감각에 어떻게 체감되는지. ③상대방이 나를 어떤 '유형'으로 분류했는지. ④시간이 지나면서 그 인식이 굳어진 방식."
  },
  "continuationAssessment": {
    "verdict": "3문장. 사주 구조 기반 최종 판정 — 솔직하고 단호하되 잔인하지 않게. 이 관계가 나에게 어떤 의미인지, 계속 가야 한다면 어떤 전제가 필요한지, 읽는 사람에게 전하는 마지막 한마디."
  }
}`;
}

function buildPhase1bNameOnlyPrompt(myData: any, targetData: any, relationType: string, result: any): string {
  const myPillar = `${result.myYear?.stem}${result.myYear?.branch}년 ${result.myDay ? result.myDay.stem+result.myDay.branch+'일' : ''}`.trim();

  return `[사주 데이터]
나(${myData.gender}): ${myPillar} | 상대: ${targetData.name}(${targetData.gender}, 생년월일 미입력)
관계: ${relationType} | 독성지수: ${result.toxicScore}점

[목표] 섹션01 디테일파트 3개 필드만 생성. "${targetData.name}"을 직접 사용해 개인화. 추상적 표현 절대 금지.
[출력 형식] 순수 JSON만.

{
  "personalImpact": {
    "onMe": "4문장. ${targetData.name}과의 관계가 나에게 주는 실제 영향 — 에너지·감정·일상·무의식."
  },
  "howTheySeeMe": {
    "energyReading": "4문장. 내 사주 기질이 ${targetData.name} 눈에 어떻게 읽히는지 — 처음 인상·자극하는 것·유형 분류·굳어진 인식."
  },
  "continuationAssessment": {
    "verdict": "3문장. ${targetData.name}과의 ${relationType} 관계 최종 판정 — 솔직하고 단호하게."
  }
}`;
}

function buildPhase1NameOnlyPrompt(myData: any, targetData: any, relationType: string, result: any): string {
  const score = result.toxicScore;
  const myPillar = `${result.myYear?.stem}${result.myYear?.branch}년 ${result.myMonth ? result.myMonth.stem+result.myMonth.branch+'월' : ''} ${result.myDay ? result.myDay.stem+result.myDay.branch+'일' : ''}`.trim();

  return `[사주 데이터]
나(${myData.gender}): ${myPillar}
위험 지지: ${result.myDangerBranches?.join(',') || '없음'} | 위험 오행: ${result.myDangerOhaeng?.join(',') || '없음'}
독성지수: ${score}점

[관계 맥락]
상대방: ${targetData.name}(${targetData.gender}) | 관계: ${relationType} | 생년월일 미입력

[목표] 6개 섹션 노출파트만 생성. "${targetData.name}"을 모든 문장에 직접 사용해 개인화. 추상적 표현 절대 금지.
[출력 형식] 순수 JSON만.

{
  "toxicSummary": "20자 이내. ${targetData.name}과의 ${relationType} 관계를 꿰뚫는 한마디.",
  "coreConflict": {
    "title": "12자 이내. 이 충돌의 이름.",
    "description": "3문장. ①내 기질이 ${targetData.name}과 왜 구조적으로 안 맞는지. ②갈등 시작 장면 + 양쪽 속마음. ③왜 반복될 수밖에 없는지."
  },
  "conflictAnalysis": {
    "chung": "1문장. 내 위험 지지가 ${targetData.name}과 만드는 충돌 — 대화체 예시.",
    "hyung": null,
    "hae": null,
    "geuk": ${result.myDangerOhaeng?.length > 0 ? `"1문장. 내 오행이 ${targetData.name}과의 관계에서 소모하는 방식."` : 'null'}
  },
  "emotionalPattern": {
    "myPattern": "2문장. 갈등 시 나에게 꽂히는 ${targetData.name}의 말·행동 + 내 속마음.",
    "targetPattern": "2문장. ${targetData.name}의 갈등 반응 방식 + 왜 그러는지.",
    "cycle": "2문장. 두 사람이 반복하는 갈등 패턴."
  },
  "energyDynamic": {
    "whoLoses": "1문장. ${targetData.name}과의 관계에서 에너지를 더 쓰는 쪽.",
    "drainMechanism": "1문장. 가장 지치는 순간.",
    "longTermEffect": "1문장. 1년 쌓이면 생기는 변화."
  },
  "hiddenDynamic": "2문장. ${targetData.name}과의 관계에서 두 사람이 모르는 무의식 패턴.",
  "conflictScenarios": [
    {
      "situation": "25자 이내. ${targetData.name}과의 ${relationType} 관계에서 실제 장면.",
      "whatHappens": "3문장. ①${targetData.name}의 말·행동(대화체). ②내게 들리는 방식 + 속마음. ③여운.",
      "whySaju": "1문장. 사주 구조적 이유."
    }
  ],
  "avoidanceGuide": {
    "mindset": "2문장. ${targetData.name}과의 관계에서 덜 소모되기 위한 핵심 마인드셋."
  }
}`;
}

function buildPhase1NoTargetPrompt(myData: any, targetData: any, relationType: string, result: any): string {
  const score = result.toxicScore;
  const myPillar = `${result.myYear?.stem}${result.myYear?.branch}년 ${result.myMonth ? result.myMonth.stem+result.myMonth.branch+'월' : ''} ${result.myDay ? result.myDay.stem+result.myDay.branch+'일' : ''}`.trim();

  return `[사주 데이터]
나(${myData.gender}): ${myPillar}
충 유발 지지: ${result.myDangerBranches?.join(',') || '없음'} | 극 유발 오행: ${result.myDangerOhaeng?.join(',') || '없음'}
갈등 성향: ${result.conflictType || ''} | 독성지수: ${score}

[목표] 내 사주 기질 분석 + 3개 섹션 노출파트만 생성. 추상적 표현 절대 금지.
[출력 형식] 순수 JSON만.

{
  "toxicSummary": "20자 이내. 내 갈등 기질의 핵심을 날카롭게.",
  "myCharacter": {
    "core": "3문장. ①내 사주 기질의 핵심 에너지를 일상 행동으로. ②인간관계에서 반복되는 패턴. ③남들 눈에 나는 어떤 사람인지.",
    "strength": "1문장. 이 기질이 빛나는 순간.",
    "shadow": "2문장. 이 기질이 독이 되는 순간 + 어떤 말·행동이 상대를 힘들게 하는지."
  },
  "dangerTypes": [
    {
      "type": "위험 유형명 (예: 통제형, 감정폭발형)",
      "years": "출생연대 힌트",
      "whyDangerous": "2문장. 왜 구조적으로 소모되는지.",
      "realScenario": "2문장. 실제 반복되는 장면 — 대화체."
    },
    {
      "type": "두 번째 위험 유형명",
      "years": "출생연대 힌트",
      "whyDangerous": "2문장.",
      "realScenario": "2문장."
    }
  ],
  "hiddenDynamic": "2문장. 내가 모르는 무의식적 갈등 패턴.",
  "conflictScenarios": [
    {
      "situation": "25자 이내. 내가 자주 겪는 갈등 장면.",
      "whatHappens": "3문장. ①갈등 장면 대화체. ②내 속마음. ③여운.",
      "whySaju": "1문장. 사주 구조적 이유."
    }
  ],
  "avoidanceGuide": {
    "mindset": "2문장. 핵심 마인드셋."
  }
}`;
}

// ─── Phase 2: 디테일파트<2,3> (on-demand) ─────────────────────────────
function buildPhase2DetailPrompt(myData: any, targetData: any, relationType: string, result: any): string {
  const hasTarget = Boolean(targetData?.birthdate);
  const hasNameOnly = Boolean(targetData?.name && !targetData?.birthdate);

  if (hasNameOnly) return buildPhase2DetailNameOnlyPrompt(myData, targetData, relationType, result);
  if (!hasTarget)  return buildPhase2DetailNoTargetPrompt(myData, targetData, relationType, result);

  const chung = result.conflicts.chung.map((c: any) => c.name).join(', ') || '없음';
  const geuk  = result.conflicts.geuk?.exists ? result.conflicts.geuk.direction : '없음';
  const score = result.toxicScore;
  const myYr  = `${result.myYear?.stem}${result.myYear?.branch}`;
  const tgYr  = `${result.targetYear?.stem}${result.targetYear?.branch}`;

  return `[사주 데이터]
나(${myData.gender}): ${myYr}년 | 상대(${targetData.gender}): ${tgYr}년
관계: ${relationType} | 독성지수: ${score}점 | 충: ${chung} | 극: ${geuk}
갈등패턴: ${result.conflictSummary || ''} | 태그: ${result.tags?.join(',') || ''}

[목표] 섹션02(갈등 상황 나머지)·섹션03(실전 가이드 상세) 디테일파트 생성. "어?? 어떻게 알았지?!" 반응이 나오게.
[출력 형식] 순수 JSON만.

{
  "conflictScenarios": [
    {
      "situation": "25자 이내. 두 번째 갈등 장면 — 첫 번째와 다른 맥락.",
      "whatHappens": "5문장. ①대화체. ②어떻게 들리는지. ③내면 독백. ④내 반응 + 상대에게 어떻게 보이는지. ⑤여운.",
      "whySaju": "2문장."
    },
    {
      "situation": "25자 이내. 세 번째 장면 — 누적된 감정이 터지는 상황.",
      "whatHappens": "5문장. 앞 두 상황이 쌓인 결과로 생기는 더 큰 갈등.",
      "whySaju": "2문장."
    }
  ],
  "triggerPoints": [
    "상대방이 이 말을 하면 무조건 올라오는 것 — 직접 인용 형식",
    "이 행동을 보면 폭발하는 것 — 구체적 행동",
    "이 상황이 되면 방어적이 되는 것",
    "상대방이 이 태도를 보이면 대화가 안 되는 것",
    "이 패턴이 반복되면 관계 전체에 회의감이 드는 것"
  ],
  "relationSpecific": "3문장. ${relationType} 관계이기 때문에 특히 더 아픈 갈등 — 다른 관계였다면 넘어갈 수 있는 것이 왜 이 관계에서 더 크게 느껴지는지.",
  "realisticOutlook": "3문장. 솔직한 전망 — 인식 못하면 어떻게 되는지, 인식하면 어떤 가능성이 있는지, 노력으로 변할 수 없는 것.",
  "avoidanceGuide": {
    "practicalTips": [
      "갈등 징조가 보일 때 구체적으로 어떻게 행동할지",
      "상대방이 특정 반응 보일 때 해야 할 것 — 행동 지침",
      "이 관계에서 절대 하면 안 되는 것 — 왜 역효과인지 포함",
      "이 갈등 후 나 자신 회복을 위해 할 것",
      "이 관계를 오래 유지하려면 만들어야 할 루틴"
    ],
    "boundaries": "3문장. 지켜야 할 선 — ①이 상황이 되면 대화 멈춰야 함. ②이 패턴 반복되면 관계 형태 바꿔야 함. ③이 신호 보이면 관계 자체 재고해야 함."
  }
}`;
}

function buildPhase2DetailNameOnlyPrompt(myData: any, targetData: any, relationType: string, result: any): string {
  const score = result.toxicScore;
  const myYr = `${result.myYear?.stem}${result.myYear?.branch}`;

  return `[사주 데이터]
나(${myData.gender}): ${myYr}년
위험 지지: ${result.myDangerBranches?.join(',') || '없음'} | 위험 오행: ${result.myDangerOhaeng?.join(',') || '없음'}
관계: ${relationType} | 상대: ${targetData.name}(${targetData.gender}) | 독성지수: ${score}점

[목표] "${targetData.name}"과의 갈등 상황 나머지 + 실전 가이드 상세. "${targetData.name}"을 계속 사용해 개인화.
[출력 형식] 순수 JSON만.

{
  "conflictScenarios": [
    {
      "situation": "25자 이내. ${targetData.name}과의 두 번째 갈등 장면.",
      "whatHappens": "5문장. 대화체·감정·속마음·반응·여운.",
      "whySaju": "2문장."
    },
    {
      "situation": "25자 이내. 누적된 감정이 터지는 세 번째 장면.",
      "whatHappens": "5문장.",
      "whySaju": "2문장."
    }
  ],
  "triggerPoints": [
    "${targetData.name}이 이 말을 하면 무조건 올라오는 것 — 직접 인용",
    "${targetData.name}이 이 행동을 하면 방어적이 되는 것",
    "이 상황이 되면 나도 모르게 반응하는 것",
    "${targetData.name}이 이 태도를 보이면 대화가 안 되는 것",
    "이 패턴이 반복되면 관계 전체에 회의감이 드는 것"
  ],
  "relationSpecific": "3문장. ${relationType} 관계이기 때문에 ${targetData.name}과의 갈등이 특히 더 아픈 이유.",
  "realisticOutlook": "3문장. ${targetData.name}과의 갈등 구조 인식 못하면 어떻게 되는지, 인식하면 어떤 가능성이 있는지, 노력으로 바꿀 수 없는 것.",
  "avoidanceGuide": {
    "practicalTips": [
      "${targetData.name}과 갈등 징조 보일 때 구체적으로 어떻게 행동할지",
      "${targetData.name}이 특정 반응 보일 때 해야 하는 것",
      "${targetData.name}과의 관계에서 절대 하면 안 되는 것 — 왜 역효과인지",
      "${targetData.name}과 갈등 후 나 자신 회복을 위해 할 것",
      "${targetData.name}과의 관계를 오래 유지하려면 만들어야 할 루틴"
    ],
    "boundaries": "3문장. ${targetData.name}과의 관계에서 지켜야 할 선."
  }
}`;
}

function buildPhase2DetailNoTargetPrompt(myData: any, targetData: any, relationType: string, result: any): string {
  const score = result.toxicScore;
  const myYr = `${result.myYear?.stem}${result.myYear?.branch}`;

  return `[사주 데이터]
나(${myData.gender}): ${myYr}년
충 유발: ${result.myDangerBranches?.join(',') || '없음'} | 극 유발: ${result.myDangerOhaeng?.join(',') || '없음'}
갈등 유형: ${result.conflictType || ''} | 독성지수: ${score}

[목표] 갈등 상황 나머지 + 실전 가이드 상세.
[출력 형식] 순수 JSON만.

{
  "conflictScenarios": [
    {
      "situation": "25자 이내. 두 번째 갈등 장면.",
      "whatHappens": "4문장. 대화·감정·속마음·여운.",
      "whySaju": "2문장."
    },
    {
      "situation": "25자 이내. 세 번째 장면.",
      "whatHappens": "4문장.",
      "whySaju": "2문장."
    }
  ],
  "triggerPoints": [
    "이 말을 들으면 반응하는 것 — 직접 인용형",
    "이 행동을 보면 방어적이 되는 것",
    "이 상황이 되면 감정이 올라오는 것",
    "이 패턴이 반복될 때 무력감을 느끼는 것",
    "이 신호가 보이면 마음이 닫히는 것"
  ],
  "warningPattern": "3문장. 내가 반복하는 갈등 패턴 — 어떤 상황에서 같은 실수를 반복하는지, 왜 그러는지, 어떻게 다르게 할 수 있는지.",
  "avoidanceGuide": {
    "practicalTips": [
      "갈등 시작 전 할 수 있는 것",
      "갈등 중 해야 하는 것",
      "갈등 후 회복 방법",
      "이 기질과 함께 살아가는 방법",
      "에너지를 충전하는 방법"
    ],
    "boundaries": "3문장. 나를 지키기 위한 관계별 선 긋기 방법."
  }
}`;
}

// ─── Phase 3: 디테일파트<4,5,6> (on-demand, hasTarget/hasNameOnly 전용) ──
function buildPhase3DetailPrompt(myData: any, targetData: any, relationType: string, result: any): string {
  const hasNameOnly = Boolean(targetData?.name && !targetData?.birthdate);
  if (hasNameOnly) return buildPhase3DetailNameOnlyPrompt(myData, targetData, relationType, result);

  const chung = result.conflicts.chung.map((c: any) => c.name).join(', ') || '없음';
  const hyung = result.conflicts.hyung?.map((h: any) => h.name).join(', ') || '없음';
  const hae   = result.conflicts.hae?.map((h: any) => h.name).join(', ') || '없음';
  const geuk  = result.conflicts.geuk?.exists ? result.conflicts.geuk.direction : '없음';
  const score = result.toxicScore;
  const myPillar  = `${result.myYear?.stem}${result.myYear?.branch}년 ${result.myMonth ? result.myMonth.stem+result.myMonth.branch+'월' : ''} ${result.myDay ? result.myDay.stem+result.myDay.branch+'일' : ''}`.trim();
  const tgPillar  = `${result.targetYear?.stem}${result.targetYear?.branch}년 ${result.targetMonth ? result.targetMonth.stem+result.targetMonth.branch+'월' : ''} ${result.targetDay ? result.targetDay.stem+result.targetDay.branch+'일' : ''}`.trim();
  const saeng = result.saengRelation;
  const saengInfo = saeng?.myToTarget && saeng?.targetToMe ? '쌍방 상생' : saeng?.myToTarget ? '나→상대 상생' : saeng?.targetToMe ? '상대→나 상생' : '없음';
  const myDayPillar = result.myDay ? `${result.myDay.stem}${result.myDay.branch}` : `${result.myYear?.stem}${result.myYear?.branch}`;
  const tgDayPillar = result.targetDay ? `${result.targetDay.stem}${result.targetDay.branch}` : `${result.targetYear?.stem}${result.targetYear?.branch}`;
  const myYinYang = result.myDayYin ? '음간' : '양간';
  const tgYinYang = result.targetDayYin != null ? (result.targetDayYin ? '음간' : '양간') : '';

  return `[사주 데이터 — 일주 중심]
나(${myData.gender}, ${myYinYang}): ${myPillar} | 일주: ${myDayPillar}
상대(${targetData.gender}${tgYinYang ? ', ' + tgYinYang : ''}): ${tgPillar} | 일주: ${tgDayPillar}
관계: ${relationType} | 독성지수: ${score}점
충: ${chung} | 형: ${hyung} | 해: ${hae} | 극: ${geuk} | 상생: ${saengInfo}
갈등요약: ${result.conflictSummary || ''}

[목표]
섹션04 디테일: 이 관계가 나를 갉아먹는 신호 + 잃어가는 것.
섹션05 디테일: 상대방이 나 때문에 자극받는 것, 놓지 못하는 이유, 혼자 평가하는 방식, 진짜로 원하는 것.
섹션06 디테일: 관계 구조 분석 + 계속하려면 필요한 것 + 레드라인.
모두 구체적 장면·대화체·상대방 내면 독백까지. 추상 표현 금지.
[출력 형식] 순수 JSON만.

{
  "personalImpact": {
    "warningSignals": [
      "이 관계가 나를 갉아먹는 신호 — 신체 반응으로 (연락 오면 몸이 먼저 반응하는 방식)",
      "감정 측면에서 나타나는 신호 — 이전과 달라진 감정 패턴",
      "행동 측면에서 나타나는 신호 — 이 관계 때문에 바뀐 행동"
    ],
    "whatYouLose": "3문장. 이 관계를 유지하면서 서서히 잃어가는 것들 — ①에너지 어느 부분. ②내 어떤 모습·능력. ③원래 가지고 싶었던 것."
  },
  "howTheySeeMe": {
    "whatIrritates": "4문장. 내가 의도 없이 상대방 사주 기질을 긁는 것들. ①내 어떤 특성이 구조적으로 충돌하는지(대화 장면 형식). ②상대방이 '또 시작이다' 싶어하는 내 패턴. ③그 순간 상대방 내면 독백. ④상대방이 거리를 두는 진짜 이유.",
    "whatDrawsThem": "3문장. 갈등이 있는데도 상대방이 나를 놓지 못하는 이유 — 충이 동시에 끌림인 아이러니, 무의식적으로 채우려는 오행 에너지, 설명 못하는 집착·신경 쓰임.",
    "theirPrivateVerdict": "4문장. 상대방이 혼자 나를 평가하는 방식. ①반복적으로 하는 생각 — 긍정 하나·부정 하나(대화체). ②기억에 박힌 내 특정 장면·말과 해석. ③나에 대한 속 판단 '결국 얘는 이런 사람이야'. ④직접 말 못하고 품고 있는 것.",
    "howTheyNeedMe": "3문장. 상대방이 말로 안 하지만 행동으로 드러나는 욕구 — 내가 해줄 때 안도하는 것, 채워지지 않으면 어떻게 반응하는지."
  },
  "continuationAssessment": {
    "structuralAnalysis": "4문장. 구조적 분석. ①충돌 에너지 뿌리. ②노력으로 바꿀 수 있는 것 vs 구조적으로 변하지 않는 것. ③지금까지 반복됐을 패턴. ④구조를 알고 이어간다는 것의 의미.",
    "whatItTakes": "2문장. 계속하기로 했다면 — ①현실적으로 필요한 변화. ②가능하려면 어떤 조건이 필요한지.",
    "redLine": "3문장. 관계를 반드시 재고해야 할 레드라인 — ①이 행동·패턴 반복될 때. ②나에게 이 변화 생겼을 때. ③관계 안에서 이것이 느껴질 때. 모두 구체적으로."
  }
}`;
}

function buildPhase3DetailNameOnlyPrompt(myData: any, targetData: any, relationType: string, result: any): string {
  const score = result.toxicScore;
  const myPillar = `${result.myYear?.stem}${result.myYear?.branch}년 ${result.myMonth ? result.myMonth.stem+result.myMonth.branch+'월' : ''} ${result.myDay ? result.myDay.stem+result.myDay.branch+'일' : ''}`.trim();

  return `[사주 데이터]
나(${myData.gender}): ${myPillar}
위험 지지: ${result.myDangerBranches?.join(',') || '없음'} | 위험 오행: ${result.myDangerOhaeng?.join(',') || '없음'}
갈등 성향: ${result.conflictType || ''} | 독성지수: ${score}점

[관계 맥락]
상대방: ${targetData.name}(${targetData.gender}) | 관계: ${relationType} | 생년월일 미입력

[목표] "${targetData.name}"과의 관계에서 섹션04·05·06 디테일파트 생성. "${targetData.name}"을 직접 사용해 개인화. 추상 표현 금지.
[출력 형식] 순수 JSON만.

{
  "personalImpact": {
    "warningSignals": [
      "${targetData.name}에게 연락 오면 몸이 먼저 반응하는 방식 — 신체 감각으로",
      "${targetData.name}을 만난 날 감정 상태 변화 — 이전과 달라진 것",
      "${targetData.name} 때문에 바뀐 내 행동 패턴"
    ],
    "whatYouLose": "3문장. ${targetData.name}과의 관계를 유지하면서 서서히 잃어가는 것들 — 에너지, 내 어떤 모습, 원래 원했던 것."
  },
  "howTheySeeMe": {
    "whatIrritates": "4문장. 내가 의도 없이 ${targetData.name}의 심기를 건드리는 것들 — 대화 장면·패턴·내면 독백·거리 두는 이유.",
    "whatDrawsThem": "3문장. 갈등이 있는데도 ${targetData.name}이 나를 놓지 못하는 이유.",
    "theirPrivateVerdict": "4문장. ${targetData.name}이 혼자 나를 평가하는 방식 — 대화체로.",
    "howTheyNeedMe": "3문장. ${targetData.name}이 나에게 진짜로 원하는 것 — 말 안 해도 행동으로 드러나는 것."
  },
  "continuationAssessment": {
    "structuralAnalysis": "4문장. ${targetData.name}과의 관계 구조 분석 — 충돌 뿌리, 바꿀 수 있는 것 vs 없는 것, 반복됐을 패턴, 구조 알고 이어간다는 의미.",
    "whatItTakes": "2문장. ${targetData.name}과 계속하기로 했다면 현실적으로 필요한 변화.",
    "redLine": "3문장. ${targetData.name}과의 관계에서 재고해야 할 레드라인 — 구체적 행동·패턴·신호로."
  }
}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phase, myData, targetData, relationType, result } = req.body;

  // ── Phase 1: 스트리밍 (노출파트<1~6> + 디테일파트<1>) ─────────────
  if (phase === 1) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (obj: object) => res.write('data: ' + JSON.stringify(obj) + '\n\n');

    let chars = 0;
    const MAX_CHARS = 8000;

    try {
      const stream = client.messages.stream({
        model: MODEL_SONNET,
        max_tokens: 1800,
        system: [SYSTEM_CACHED],
        messages: [{ role: 'user', content: buildPhase1Prompt(myData, targetData, relationType, result) }],
      });

      stream.on('text', text => {
        chars += text.length;
        const pct = Math.min(5 + Math.round((chars / MAX_CHARS) * 85), 90);
        send({ type: 'progress', pct });
      });

      const msg = await stream.finalMessage();
      const c = msg.content[0];
      const u = msg.usage;
      console.log(`[USAGE] Phase1: input=${u.input_tokens} output=${u.output_tokens} cache_read=${(u as any).cache_read_input_tokens ?? 0}`);

      if (c.type !== 'text') {
        send({ type: 'error', message: 'failed' });
      } else {
        try {
          const data = extractJson(c.text);
          send({ type: 'done', data });
        } catch (parseErr) {
          console.error('[TOXIC API] phase 1 parse_error:', (parseErr as any).message);
          send({ type: 'error', message: 'parse_error' });
        }
      }
    } catch (err) {
      console.error('[TOXIC API] phase 1 stream', err);
      send({ type: 'error', message: 'failed' });
    }
    res.end();
    return;
  }

  // ── Phase 1b: 섹션01 디테일파트 전용 (백그라운드 선제 생성) ──────────
  if (phase === '1b') {
    const hasTarget = Boolean(targetData?.birthdate);
    if (!hasTarget && !targetData?.name) {
      return res.status(200).json({ data: null });
    }
    try {
      const prompt = buildPhase1bPrompt(myData, targetData, relationType, result);
      const text = await callSonnetFallback(prompt, 1200, 'Phase1b-S01Detail', 50000);
      return res.status(200).json({ data: extractJson(text) });
    } catch (err) {
      console.error('[TOXIC API] phase 1b', err);
      return res.status(500).json({ error: 'Phase1b failed' });
    }
  }

  // ── Phase 2: 디테일파트<2,3> (on-demand) ──────────────────────────
  if (phase === 2) {
    try {
      const prompt = buildPhase2DetailPrompt(myData, targetData, relationType, result);
      const text = await callSonnetFallback(prompt, 5000, 'Phase2Detail', 90000);
      return res.status(200).json({ data: extractJson(text) });
    } catch (err) {
      console.error('[TOXIC API] phase 2', err);
      return res.status(500).json({ error: 'Analysis failed' });
    }
  }

  // ── Phase 3: 디테일파트<4,5,6> (on-demand, hasTarget/hasNameOnly) ──
  if (phase === 3) {
    if (!targetData?.birthdate && !targetData?.name) {
      return res.status(200).json({ data: null });
    }
    try {
      const prompt = buildPhase3DetailPrompt(myData, targetData, relationType, result);
      const text = await callOpusNonStream(prompt, 5000, 'Phase3Detail', 90000);
      return res.status(200).json({ data: extractJson(text) });
    } catch (err) {
      console.error('[TOXIC API] phase 3', err);
      return res.status(500).json({ error: 'Analysis failed' });
    }
  }

  return res.status(400).json({ error: 'Invalid phase' });
}
