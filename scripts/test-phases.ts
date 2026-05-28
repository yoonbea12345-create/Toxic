/**
 * Phase 1·2·3 통합 테스트
 * 실행: npx tsx scripts/test-phases.ts
 */
import handler from '../api/analyze.ts';

// ── 샘플 데이터 ────────────────────────────────────────────────────────
const BASE_RESULT = {
  toxicScore: 72,
  conflictType: '충돌형',
  conflictSummary: '감정 표현 방식의 근본적 차이로 인한 반복 갈등',
  tags: ['충(沖)', '감정소모', '음양충돌'],
  myYear: { stem: '壬', branch: '子' },
  myMonth: { stem: '甲', branch: '寅' },
  myDay: { stem: '丙', branch: '午' },
  myDayYin: false,
  myDangerBranches: ['子', '午'],
  myDangerOhaeng: ['水'],
  targetYear: { stem: '癸', branch: '丑' },
  targetMonth: { stem: '乙', branch: '卯' },
  targetDay: { stem: '壬', branch: '子' },
  targetDayYin: true,
  targetStem: '壬',
  conflicts: {
    chung: [{ name: '子午충' }],
    hyung: [{ name: '寅형' }],
    hae: [],
    pa: [],
    hap: [],
    geuk: { exists: true, direction: '나→상대' },
  },
  saengRelation: { myToTarget: false, targetToMe: true },
  analysis: { chungAnalysis: '', hyungAnalysis: '', geukAnalysis: '' },
};

const BASE_RESULT_NO_TARGET = {
  ...BASE_RESULT,
  targetYear: undefined,
  targetMonth: undefined,
  targetDay: undefined,
  targetDayYin: undefined,
  targetStem: undefined,
  conflicts: {
    chung: [],
    hyung: [],
    hae: [],
    pa: [],
    hap: [],
    geuk: { exists: false, direction: '' },
  },
  conflictType: '내면형',
  conflictSummary: '내 사주 기질의 자기 갈등 구조',
  toxicScore: 55,
};

const MY_DATA  = { name: '지민', gender: '여', birthdate: '1993-01-15', birthtime: '1300' };
const TG_FULL  = { name: '준혁', gender: '남', birthdate: '1990-07-22', birthtime: '0800' };
const TG_NAME  = { name: '준혁', gender: '남', birthdate: '', birthtime: '' };
const TG_NONE  = { name: '', gender: '남', birthdate: '', birthtime: '' };

// ── Mock req / res ─────────────────────────────────────────────────────
function makeReq(body: object) {
  return { method: 'POST', body };
}

class MockRes {
  statusCode = 200;
  private chunks: string[] = [];

  setHeader() {}
  flushHeaders() {}

  write(chunk: string) {
    this.chunks.push(chunk);
  }

  end() {}

  status(code: number) {
    this.statusCode = code;
    return this;
  }

  json(obj: unknown) {
    this.chunks.push(JSON.stringify(obj));
    return this;
  }

  // Phase 1 SSE → 마지막 done 이벤트 파싱
  parseSse(): { type: string; data?: unknown; pct?: number; message?: string }[] {
    const events: { type: string; data?: unknown; pct?: number; message?: string }[] = [];
    for (const chunk of this.chunks) {
      for (const line of chunk.split('\n')) {
        if (line.startsWith('data: ')) {
          try {
            events.push(JSON.parse(line.slice(6)));
          } catch {}
        }
      }
    }
    return events;
  }

  // Phase 2/3 JSON 응답
  parseJson(): unknown {
    try {
      return JSON.parse(this.chunks.join(''));
    } catch {
      return null;
    }
  }
}

// ── 결과 출력 헬퍼 ─────────────────────────────────────────────────────
function checkKeys(obj: Record<string, unknown>, keys: string[], label: string) {
  const missing = keys.filter(k => obj[k] === undefined || obj[k] === null);
  if (missing.length === 0) {
    console.log(`  ✓ ${label} — ${keys.length}개 필드 모두 존재`);
  } else {
    console.log(`  ✗ ${label} — 누락: [${missing.join(', ')}]`);
  }
}

function printSummary(data: Record<string, unknown>) {
  const preview = (v: unknown): string => {
    if (typeof v === 'string') return v.slice(0, 60) + (v.length > 60 ? '…' : '');
    if (Array.isArray(v)) return `[${v.length}개]`;
    if (v && typeof v === 'object') return `{${Object.keys(v as object).join(', ')}}`;
    return String(v);
  };
  for (const [k, v] of Object.entries(data)) {
    console.log(`    ${k}: ${preview(v)}`);
  }
}

// ── Phase 1 테스트 ─────────────────────────────────────────────────────
async function testPhase1(label: string, targetData: typeof TG_FULL, result: typeof BASE_RESULT) {
  console.log(`\n┌─ Phase 1 · ${label}`);
  const t0 = Date.now();
  const res = new MockRes();
  await handler(makeReq({ phase: 1, myData: MY_DATA, targetData, relationType: '연인', result }), res as any);

  const events = res.parseSse();
  const progressEvents = events.filter(e => e.type === 'progress');
  const doneEvent = events.find(e => e.type === 'done');
  const errorEvent = events.find(e => e.type === 'error');

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  if (errorEvent) {
    console.log(`  ✗ ERROR: ${errorEvent.message}`);
    return;
  }
  if (!doneEvent?.data) {
    console.log(`  ✗ done 이벤트 없음 (progress 수신: ${progressEvents.length}개)`);
    return;
  }

  const d = doneEvent.data as Record<string, unknown>;
  console.log(`  ✓ 완료 (${elapsed}s) — progress 이벤트: ${progressEvents.length}개`);

  if (targetData.birthdate) {
    // hasTarget 케이스
    checkKeys(d, ['toxicSummary', 'coreConflict', 'conflictAnalysis', 'emotionalPattern',
      'energyDynamic', 'hiddenDynamic', 'conflictScenarios',
      'avoidanceGuide', 'personalImpact', 'howTheySeeMe', 'continuationAssessment'], 'hasTarget 필드');
  } else if (targetData.name) {
    // hasNameOnly 케이스
    checkKeys(d, ['toxicSummary', 'coreConflict', 'conflictScenarios',
      'avoidanceGuide', 'personalImpact', 'howTheySeeMe', 'continuationAssessment'], 'nameOnly 필드');
  } else {
    // noTarget 케이스
    checkKeys(d, ['toxicSummary', 'myCharacter', 'dangerTypes',
      'hiddenDynamic', 'conflictScenarios', 'avoidanceGuide'], 'noTarget 필드');
  }

  console.log('  샘플 출력:');
  printSummary(d);
  console.log(`└─ Phase 1 · ${label} 완료`);
}

// ── Phase 2 테스트 ─────────────────────────────────────────────────────
async function testPhase2(label: string, targetData: typeof TG_FULL, result: typeof BASE_RESULT) {
  console.log(`\n┌─ Phase 2 · ${label}`);
  const t0 = Date.now();
  const res = new MockRes();
  await handler(makeReq({ phase: 2, myData: MY_DATA, targetData, relationType: '연인', result }), res as any);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const parsed = res.parseJson() as { data?: Record<string, unknown>; error?: string } | null;

  if (!parsed || parsed.error) {
    console.log(`  ✗ ERROR: ${parsed?.error ?? '파싱 실패'}`);
    return;
  }
  const d = parsed.data as Record<string, unknown>;
  if (!d) { console.log('  ✗ data 없음'); return; }

  console.log(`  ✓ 완료 (${elapsed}s)`);
  checkKeys(d, ['conflictScenarios', 'triggerPoints', 'avoidanceGuide'], 'Phase2 공통 필드');

  if (targetData.birthdate || targetData.name) {
    checkKeys(d, ['relationSpecific', 'realisticOutlook'], 'hasTarget/nameOnly 필드');
  }

  const scenarios = d.conflictScenarios as unknown[];
  console.log(`  conflictScenarios 개수: ${scenarios?.length ?? 0} (예상 2)`);
  console.log('  샘플 출력:');
  printSummary(d);
  console.log(`└─ Phase 2 · ${label} 완료`);
}

// ── Phase 3 테스트 ─────────────────────────────────────────────────────
async function testPhase3(label: string, targetData: typeof TG_FULL, result: typeof BASE_RESULT) {
  console.log(`\n┌─ Phase 3 · ${label}`);
  const t0 = Date.now();
  const res = new MockRes();
  await handler(makeReq({ phase: 3, myData: MY_DATA, targetData, relationType: '연인', result }), res as any);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const parsed = res.parseJson() as { data?: Record<string, unknown> | null; error?: string } | null;

  if (!parsed || parsed.error) {
    console.log(`  ✗ ERROR: ${parsed?.error ?? '파싱 실패'}`);
    return;
  }

  // noTarget은 data: null 이 정상
  if (!targetData.birthdate && !targetData.name) {
    if (parsed.data === null) {
      console.log(`  ✓ 완료 (${elapsed}s) — noTarget → data: null (정상)`);
    } else {
      console.log(`  ✗ noTarget인데 data가 null이 아님`);
    }
    console.log(`└─ Phase 3 · ${label} 완료`);
    return;
  }

  const d = parsed.data as Record<string, unknown>;
  if (!d) { console.log('  ✗ data 없음'); return; }

  console.log(`  ✓ 완료 (${elapsed}s)`);
  checkKeys(d, ['personalImpact', 'howTheySeeMe', 'continuationAssessment'], 'Phase3 필드');

  const pi = d.personalImpact as Record<string, unknown>;
  const htsm = d.howTheySeeMe as Record<string, unknown>;
  const ca = d.continuationAssessment as Record<string, unknown>;
  if (pi) checkKeys(pi, ['warningSignals', 'whatYouLose'], 'personalImpact');
  if (htsm) checkKeys(htsm, ['whatIrritates', 'whatDrawsThem', 'theirPrivateVerdict', 'howTheyNeedMe'], 'howTheySeeMe');
  if (ca) checkKeys(ca, ['structuralAnalysis', 'whatItTakes', 'redLine'], 'continuationAssessment');

  console.log('  샘플 출력:');
  printSummary(d);
  console.log(`└─ Phase 3 · ${label} 완료`);
}

// ── 메인 ───────────────────────────────────────────────────────────────
async function main() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  TOXIC Phase 1·2·3 통합 테스트  (Opus 4.7)');
  console.log('══════════════════════════════════════════════════════');

  // ── Phase 1 (3가지 케이스) ──
  console.log('\n▶ Phase 1 — 노출파트<1~6> + 디테일파트<1>');
  await testPhase1('hasTarget (생년월일 둘 다)', TG_FULL, BASE_RESULT as any);
  await testPhase1('hasNameOnly (이름만)', TG_NAME, BASE_RESULT as any);
  await testPhase1('noTarget (혼자)', TG_NONE, BASE_RESULT_NO_TARGET as any);

  // ── Phase 2 (3가지 케이스) ──
  console.log('\n▶ Phase 2 — 디테일파트<2,3> (on-demand)');
  await testPhase2('hasTarget', TG_FULL, BASE_RESULT as any);
  await testPhase2('hasNameOnly', TG_NAME, BASE_RESULT as any);
  await testPhase2('noTarget', TG_NONE, BASE_RESULT_NO_TARGET as any);

  // ── Phase 3 (3가지 케이스) ──
  console.log('\n▶ Phase 3 — 디테일파트<4,5,6> (on-demand)');
  await testPhase3('hasTarget', TG_FULL, BASE_RESULT as any);
  await testPhase3('hasNameOnly', TG_NAME, BASE_RESULT as any);
  await testPhase3('noTarget → data:null 기대', TG_NONE, BASE_RESULT_NO_TARGET as any);

  console.log('\n══════════════════════════════════════════════════════');
  console.log('  테스트 완료');
  console.log('══════════════════════════════════════════════════════\n');
}

main().catch(console.error);
