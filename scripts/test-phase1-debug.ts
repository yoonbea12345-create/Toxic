/**
 * Phase 1 hasTarget 디버그 — raw 출력 캡처
 */
import handler from '../api/analyze.ts';

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

const MY_DATA = { name: '지민', gender: '여', birthdate: '1993-01-15', birthtime: '1300' };
const TG_FULL = { name: '준혁', gender: '남', birthdate: '1990-07-22', birthtime: '0800' };

class DebugRes {
  chunks: string[] = [];
  setHeader() {}
  flushHeaders() {}
  write(c: string) { this.chunks.push(c); }
  end() {}
  status(code: number) { return this; }
  json(obj: unknown) { this.chunks.push(JSON.stringify(obj)); return this; }
}

const res = new DebugRes();
await handler(
  { method: 'POST', body: { phase: 1, myData: MY_DATA, targetData: TG_FULL, relationType: '연인', result: BASE_RESULT } } as any,
  res as any
);

// SSE에서 raw text 추출
let rawText = '';
for (const chunk of res.chunks) {
  for (const line of chunk.split('\n')) {
    if (line.startsWith('data: ')) {
      try {
        const evt = JSON.parse(line.slice(6));
        if (evt.type === 'done' && evt.data) {
          console.log('✓ JSON 파싱 성공');
          console.log(JSON.stringify(evt.data, null, 2).slice(0, 3000));
          process.exit(0);
        } else if (evt.type === 'error') {
          console.log('✗ error event:', evt.message);
        }
      } catch {}
    }
  }
}

// done 이벤트가 없으면 raw SSE 출력
console.log('=== RAW SSE chunks ===');
const allSse = res.chunks.join('');
// 마지막 data 라인들만
const lines = allSse.split('\n').filter(l => l.startsWith('data: ')).slice(-5);
for (const l of lines) {
  console.log(l.slice(0, 300));
}
