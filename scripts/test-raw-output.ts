/**
 * Phase 1 hasTarget 원시 출력 직접 확인
 */
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  defaultHeaders: { 'anthropic-beta': 'prompt-caching-2024-07-31' },
});

const SYSTEM = `당신은 수십 년 경력의 사주명리학 상담사입니다. 사람들이 당신의 분석을 듣고 "어?? 어떻게 알았지?!" 하고 소름 돋는 반응을 보이는 게 당신의 강점입니다.

[핵심 원칙]
1. 추상적 표현 절대 금지.
2. 반드시 실제 대화체·감정·신체 반응을 포함하여 묘사.
3. 상대방의 말투·행동 방식을 특정하여 묘사.
4. 사주 에너지 설명은 반드시 일상 행동으로 번역.
5. 한 문장 안에 구체적 상황·감정·결과가 다 들어가도록.
6. 완전한 JSON만 출력. 주석 없이. 마크다운 없이. 설명 없이.
7. 한국어 전용.
8. JSON 문자열 안에서 대화 예시를 쓸 때 큰따옴표(" ") 절대 사용 금지 — 반드시 작은따옴표(' ')로 대체.`;

// 최소한의 프롬프트로 테스트 (hasTarget 케이스)
const PROMPT = `[사주 데이터]
나(여, 양간): 壬子년 甲寅월 丙午일 | 일주: 丙午
상대(남, 음간): 癸丑년 乙卯월 壬子일 | 일주: 壬子
관계: 연인 | 독성지수: 72점
충(沖): 子午충 | 형(刑): 寅형 | 극(剋): 나→상대

[목표] 테스트용 최소 JSON 생성
{
  "toxicSummary": "20자 이내.",
  "conflictAnalysis": {
    "chung": "子午충 작동 방식 2문장. 실제 대화 예시 포함('...라고 하면 ...'형식).",
    "hyung": null,
    "hae": null,
    "geuk": "극 작동 방식 1문장."
  }
}`;

console.log('=== Phase 1 hasTarget 원시 출력 테스트 ===\n');

const msg = await client.messages.create({
  model: 'claude-opus-4-7',
  max_tokens: 500,
  system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
  messages: [{ role: 'user', content: PROMPT }],
  stream: false,
});

const raw = msg.content[0].type === 'text' ? msg.content[0].text : '';
console.log('[RAW OUTPUT]:');
console.log(raw);
console.log('\n[USAGE]:', msg.usage);

// JSON 파싱 시도
console.log('\n[JSON 파싱 시도]:');

// 방법 1: 현재 방식 (greedy regex)
try {
  const m = raw.match(/\{[\s\S]*\}/);
  if (m) JSON.parse(m[0]);
  console.log('  greedy regex: ✓ OK');
} catch (e: any) {
  console.log('  greedy regex: ✗', e.message);
}

// 방법 2: 브레이스 카운팅
try {
  const start = raw.indexOf('{');
  let depth = 0, inStr = false, esc = false, end = -1;
  for (let i = start; i < raw.length; i++) {
    const c = raw[i];
    if (esc) { esc = false; continue; }
    if (inStr) { if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') { inStr = true; continue; }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) { end = i; break; }
  }
  if (end !== -1) JSON.parse(raw.slice(start, end + 1));
  console.log('  brace counting:', end !== -1 ? '✓ OK' : '✗ end not found');
} catch (e: any) {
  console.log('  brace counting: ✗', e.message);
}

// 어느 위치에서 파싱이 깨지는지 확인
if (raw) {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    const slice = raw.slice(start, end + 1);
    try {
      JSON.parse(slice);
      console.log('  first{..last}: ✓ OK');
    } catch (e: any) {
      console.log('  first{..last}: ✗', e.message);
      // 어디서 깨지는지
      const pos = parseInt(e.message.match(/position (\d+)/)?.[1] ?? '0');
      if (pos) {
        console.log('  실패 위치 컨텍스트:', JSON.stringify(slice.slice(Math.max(0, pos - 50), pos + 50)));
      }
    }
  }
}
