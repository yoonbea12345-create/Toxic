// 천간 지지
export type Stem = '갑' | '을' | '병' | '정' | '무' | '기' | '경' | '신' | '임' | '계';
export type Branch = '자' | '축' | '인' | '묘' | '진' | '사' | '오' | '미' | '신' | '유' | '술' | '해';
export type Ohaeng = '목' | '화' | '토' | '금' | '수';
export type RelationType = '연인' | '친구' | '직장' | '가족' | '기타';

export interface PersonData {
  name: string;
  birthdate: string;   // YYYY-MM-DD
  birthtime: string;   // HH:MM or ''
  gender: '남' | '여';
}

export interface Pillar {
  stem: Stem;
  branch: Branch;
  ohaeng: Ohaeng;
  branchOhaeng: Ohaeng;
}

export interface ConflictDetail {
  name: string;
  pillars: string;
}

export interface SajuResult {
  myYear: Pillar;
  myMonth: Pillar | null;
  myDay: Pillar | null;
  myHour: Pillar | null;
  targetYear: Pillar;
  targetMonth: Pillar | null;
  targetDay: Pillar | null;
  conflicts: {
    chung: ConflictDetail[];
    hyung: ConflictDetail[];
    hae: ConflictDetail[];
    pa: ConflictDetail[];
    hap: ConflictDetail[];
    geuk: { exists: boolean; direction: string };
  };
  toxicScore: number;
  accuracyLevel: 'year' | 'month' | 'day' | 'full';
  myDangerBranches: Branch[];
  myDangerOhaeng: Ohaeng[];
  // legacy fields for UI compatibility
  myBranch: Branch;
  myStem: Stem;
  targetBranch: Branch;
  targetStem: Stem;
  chung: { exists: boolean; name: string };
  hyung: { exists: boolean; name: string };
  geuk: { exists: boolean; direction: string };
  conflictType: string;
  conflictSummary: string;
  analysis: { chungAnalysis: string; hyungAnalysis: string; geukAnalysis: string };
  tags: string[];
}

// ─── 기초 데이터 ────────────────────────────────────────────────
const STEMS: Stem[] = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const BRANCHES: Branch[] = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

const STEM_OHAENG: Record<Stem, Ohaeng> = {
  갑: '목', 을: '목', 병: '화', 정: '화',
  무: '토', 기: '토', 경: '금', 신: '금',
  임: '수', 계: '수',
};

const BRANCH_OHAENG: Record<Branch, Ohaeng> = {
  자: '수', 축: '토', 인: '목', 묘: '목',
  진: '토', 사: '화', 오: '화', 미: '토',
  신: '금', 유: '금', 술: '토', 해: '수',
};

// 오행 상극: key가 key2를 극함
const GEUK_MAP: Partial<Record<Ohaeng, Ohaeng>> = {
  목: '토', 토: '수', 수: '화', 화: '금', 금: '목',
};

// ─── 절기 데이터 (입춘·경칩·청명·입하·망종·소서·입추·백로·한로·입동·대설·소한) ───
// [year]: [Jan소한, Feb입춘, Mar경칩, Apr청명, May입하, Jun망종, Jul소서, Aug입추, Sep백로, Oct한로, Nov입동, Dec대설]
// 각 값은 해당 달의 절입일(일)
const JEOLGI: Record<number, number[]> = {
  1940: [6,5,6,5,6,6,7,8,8,8,7,7], 1941: [6,4,6,5,6,6,7,8,8,8,7,7],
  1942: [6,4,6,5,6,6,7,8,8,8,7,7], 1943: [6,5,6,6,6,6,7,8,8,8,8,7],
  1944: [6,5,6,5,5,6,7,7,8,8,7,7], 1945: [6,4,6,5,6,6,7,8,8,8,7,7],
  1946: [6,4,6,5,6,6,7,8,8,8,7,7], 1947: [6,5,6,6,6,6,7,8,8,8,8,7],
  1948: [6,5,6,5,5,6,7,7,8,8,7,7], 1949: [6,4,6,5,6,6,7,8,8,8,7,7],
  1950: [6,4,6,5,6,6,7,8,8,8,7,7], 1951: [6,5,6,6,6,6,7,8,8,8,8,7],
  1952: [6,5,6,5,5,6,7,7,8,8,7,7], 1953: [6,4,6,5,6,6,7,8,8,8,7,7],
  1954: [6,4,6,5,6,6,7,8,8,8,7,7], 1955: [6,5,6,6,6,6,7,8,8,8,8,7],
  1956: [6,5,6,5,5,6,7,7,8,8,7,7], 1957: [6,4,6,5,6,6,7,8,8,8,7,7],
  1958: [6,4,6,5,6,6,7,8,8,8,7,7], 1959: [6,5,6,6,6,6,7,8,8,8,8,7],
  1960: [6,5,6,5,5,6,7,7,8,8,7,7], 1961: [6,4,6,5,6,6,7,8,8,8,7,7],
  1962: [6,4,6,5,6,6,7,8,8,8,7,7], 1963: [6,5,6,6,6,6,7,8,8,8,8,7],
  1964: [6,5,6,5,5,6,7,7,8,8,7,7], 1965: [6,4,6,5,6,6,7,8,8,8,7,7],
  1966: [6,4,6,5,6,6,7,8,8,8,7,7], 1967: [6,5,6,6,6,6,7,8,8,8,8,7],
  1968: [6,5,6,5,5,6,7,7,8,8,7,7], 1969: [6,4,6,5,6,6,7,8,8,8,7,7],
  1970: [6,4,6,5,6,6,7,8,8,8,7,7], 1971: [6,5,6,6,6,6,7,8,8,8,8,7],
  1972: [6,5,6,5,5,6,7,7,8,8,7,7], 1973: [6,4,6,5,6,6,7,8,8,8,7,7],
  1974: [6,4,6,5,6,6,7,8,8,8,7,7], 1975: [6,4,6,5,6,6,7,8,8,8,7,7],
  1976: [6,5,6,5,5,6,7,7,8,8,7,7], 1977: [6,4,6,5,6,6,7,8,8,8,7,7],
  1978: [6,4,6,5,6,6,7,8,8,8,7,7], 1979: [6,4,6,5,6,6,7,8,8,8,7,7],
  1980: [6,5,6,5,5,6,7,7,8,8,7,7], 1981: [6,4,6,5,6,6,7,8,8,8,7,7],
  1982: [6,4,6,5,6,6,7,8,8,8,7,7], 1983: [6,4,6,5,6,6,7,8,8,8,7,7],
  1984: [6,5,6,5,5,6,7,7,8,8,7,7], 1985: [6,4,6,5,6,6,7,8,8,8,7,7],
  1986: [6,4,6,5,6,6,7,8,8,8,7,7], 1987: [6,4,6,5,6,6,7,8,8,8,7,7],
  1988: [6,4,6,4,5,6,7,7,8,8,7,7], 1989: [6,4,6,5,6,6,7,8,8,8,7,7],
  1990: [6,4,6,5,6,6,7,8,8,8,7,7], 1991: [6,4,6,5,6,6,7,8,8,8,7,7],
  1992: [6,4,6,4,5,6,7,7,8,8,7,7], 1993: [6,4,6,5,6,6,7,8,8,8,7,7],
  1994: [6,4,6,5,6,6,7,8,8,8,7,7], 1995: [6,4,6,5,6,6,7,8,8,8,7,7],
  1996: [6,4,6,4,5,6,7,7,8,8,7,7], 1997: [6,4,6,5,6,6,7,8,8,8,7,7],
  1998: [6,4,6,5,6,6,7,8,8,8,7,7], 1999: [6,4,6,5,6,6,7,8,8,8,7,7],
  2000: [6,4,6,4,5,6,7,7,8,8,7,7], 2001: [5,4,6,5,5,6,7,7,8,8,7,7],
  2002: [6,4,6,5,6,6,7,8,8,8,7,7], 2003: [6,4,6,5,6,6,7,8,8,8,7,7],
  2004: [6,4,6,4,5,6,7,7,8,8,7,7], 2005: [5,4,6,5,5,6,7,7,8,8,7,7],
  2006: [6,4,6,5,6,6,7,8,8,8,7,7], 2007: [6,4,6,5,6,6,7,8,8,8,7,7],
  2008: [6,4,6,4,5,6,7,7,8,8,7,7], 2009: [5,4,6,5,5,6,7,7,8,8,7,7],
  2010: [6,4,6,5,6,6,7,8,8,8,7,7], 2011: [6,4,6,5,6,6,7,8,8,8,7,7],
  2012: [6,4,6,4,5,6,7,7,8,8,7,7], 2013: [5,4,6,5,5,6,7,7,8,8,7,7],
  2014: [6,4,6,5,6,6,7,8,8,8,7,7], 2015: [6,4,6,5,6,6,7,8,8,8,7,7],
  2016: [6,4,6,4,5,6,7,7,8,8,7,7], 2017: [5,3,6,4,5,6,7,7,8,8,7,7],
  2018: [5,4,6,5,5,6,7,7,8,8,7,7], 2019: [5,4,6,5,6,6,7,8,8,8,7,7],
  2020: [6,4,5,4,5,5,7,7,8,8,7,7], 2021: [5,3,5,4,5,6,7,7,8,8,7,7],
  2022: [5,4,6,5,5,6,7,7,8,8,7,7], 2023: [5,4,6,5,6,6,7,8,8,8,7,7],
  2024: [6,4,5,4,5,5,7,7,8,8,7,7], 2025: [5,3,5,4,5,6,7,7,8,8,7,7],
  2026: [5,4,6,5,5,6,7,7,8,8,7,7], 2027: [5,4,6,5,6,6,7,8,8,8,7,7],
  2028: [6,4,5,4,5,5,7,7,8,8,7,7], 2029: [5,3,5,4,5,6,7,7,8,8,7,7],
  2030: [5,4,6,5,5,6,7,7,8,8,7,7],
};

// 월지 배열: 인월(1월)부터 — 절기 기준 월
// 절기 순서에 맞는 월지: 인(1) 묘(2) 진(3) 사(4) 오(5) 미(6) 신(7) 유(8) 술(9) 해(10) 자(11) 축(12)
const MONTH_BRANCHES: Branch[] = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];

// 월간 계산: 년간에 따른 월간 기준
// 갑·기년: 1월=병인, 을·경년: 1월=무인, 병·신년: 1월=경인, 정·임년: 1월=임인, 무·계년: 1월=갑인
const MONTH_STEM_BASE: Record<number, number> = { 0: 2, 1: 4, 2: 6, 3: 8, 4: 0, 5: 2, 6: 4, 7: 6, 8: 8, 9: 0 };
// (갑=0,을=1,...) 갑기년→병(2), 을경년→무(4), 병신년→경(6), 정임년→임(8), 무계년→갑(0)
const YEAR_STEM_GROUP: Record<number, number> = { 0: 0, 5: 0, 1: 1, 6: 1, 2: 2, 7: 2, 3: 3, 8: 3, 4: 4, 9: 4 };

// ─── 년주 계산 ───────────────────────────────────────────────────
function getYearPillar(year: number, month: number, day: number): Pillar {
  // 입춘 전이면 전년도 간지 사용
  const jeolgi = JEOLGI[year] ?? JEOLGI[2000];
  const ipchunDay = jeolgi[1]; // 2월 입춘일
  let effectiveYear = year;
  if (month < 2 || (month === 2 && day < ipchunDay)) {
    effectiveYear = year - 1;
  }
  const stemIdx = ((effectiveYear - 4) % 10 + 10) % 10;
  const branchIdx = ((effectiveYear - 4) % 12 + 12) % 12;
  const stem = STEMS[stemIdx];
  const branch = BRANCHES[branchIdx];
  return { stem, branch, ohaeng: STEM_OHAENG[stem], branchOhaeng: BRANCH_OHAENG[branch] };
}

// ─── 월주 계산 ───────────────────────────────────────────────────
function getMonthPillar(year: number, month: number, day: number): Pillar {
  // month: 1~12 (양력)
  const jeolgi = JEOLGI[year] ?? JEOLGI[2000];
  // 절기 기준으로 사주 월 결정 (절입일 이후부터 해당 월)
  // 절기 배열 인덱스: 0=1월소한, 1=2월입춘, ...
  const monthIdx = month - 1;
  const jeolDay = jeolgi[monthIdx];
  let sajuMonth: number;
  if (day >= jeolDay) {
    sajuMonth = monthIdx; // 0-based: 0=인월
  } else {
    sajuMonth = monthIdx - 1;
    if (sajuMonth < 0) sajuMonth = 11;
  }

  const branch = MONTH_BRANCHES[sajuMonth];

  // 년간으로 월간 결정
  const yearPillar = getYearPillar(year, month, day);
  const yearStemIdx = STEMS.indexOf(yearPillar.stem);
  const group = YEAR_STEM_GROUP[yearStemIdx];
  const monthStemBase = MONTH_STEM_BASE[group * 2] ?? 0;
  const stemIdx = (monthStemBase + sajuMonth) % 10;
  const stem = STEMS[stemIdx];
  return { stem, branch, ohaeng: STEM_OHAENG[stem], branchOhaeng: BRANCH_OHAENG[branch] };
}

// ─── 일주 계산 ───────────────────────────────────────────────────
// 기준일: 1900년 1월 1일 = 갑술일 (간지 index: 갑=0, 술=10 → 60갑자 index = 0*12+10 = 10... )
// 60갑자 순서: 갑자(0), 을축(1), ..., 계해(59)
// 1900-01-01: 갑술 → stem=갑(0), branch=술(10) → 60갑자 idx = stem*6 + ... 아래 공식 사용
// 정확한 기준: 1900-01-01은 60갑자 중 갑술일
// 갑술: stem=0(갑), branch=10(술) → cycle index = (0*1 + (10-0+60)%60...
// 60갑자 index: stem과 branch 동시에 나열하므로 ganzhi = stemIdx*?
// 실제로는: 갑자=0, 을축=1, 병인=2, ... 계해=59
// index = (stemIdx*1)%60 where both increase together
// 갑술: stemIdx=0, branchIdx=10 → 간지idx = (0 + 10*(10-0)/...
// 더 간단하게: ref날짜의 60갑자 index를 구하고 날짜 차이를 더해 %60

// 1900-01-01 = 갑술일
// 갑=0, 술=10 → 60갑자에서 갑자=0 기준, 갑술은 몇번째?
// 갑자(0), 을축(1), 병인(2), 정묘(3), 무진(4), 기사(5), 경오(6), 신미(7), 임신(8), 계유(9),
// 갑술(10), 을해(11), ...
// 갑술 = index 10

const REF_DATE = new Date(Date.UTC(1900, 0, 1));
const REF_GANZHI = 10; // 갑술

function getDayPillar(dateStr: string): Pillar {
  const d = new Date(dateStr + 'T00:00:00Z');
  const diffMs = d.getTime() - REF_DATE.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  const ganzhiIdx = ((REF_GANZHI + diffDays) % 60 + 60) % 60;
  const stemIdx = ganzhiIdx % 10;
  const branchIdx = ganzhiIdx % 12;
  const stem = STEMS[stemIdx];
  const branch = BRANCHES[branchIdx];
  return { stem, branch, ohaeng: STEM_OHAENG[stem], branchOhaeng: BRANCH_OHAENG[branch] };
}

// ─── 시주 계산 ───────────────────────────────────────────────────
// 시지: 자(23~1), 축(1~3), 인(3~5), 묘(5~7), 진(7~9), 사(9~11), 오(11~13), 미(13~15), 신(15~17), 유(17~19), 술(19~21), 해(21~23)
const HOUR_BRANCHES: Branch[] = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
// 시간 기준: 자시=23~1시
function getHourBranchIdx(hour: number): number {
  if (hour === 23) return 0;
  return Math.floor((hour + 1) / 2);
}

// 일간에 따른 시간 천간 기준 (갑·기일=자시갑, 을·경일=자시병, 병·신일=자시무, 정·임일=자시경, 무·계일=자시임)
const HOUR_STEM_BASE: Record<number, number> = { 0: 0, 5: 0, 1: 2, 6: 2, 2: 4, 7: 4, 3: 6, 8: 6, 4: 8, 9: 8 };

function getHourPillar(timeStr: string, dayStem: Stem): Pillar | null {
  if (!timeStr) return null;
  const [h] = timeStr.split(':').map(Number);
  if (isNaN(h)) return null;
  const branchIdx = getHourBranchIdx(h);
  const branch = HOUR_BRANCHES[branchIdx];
  const dayStemIdx = STEMS.indexOf(dayStem);
  const group = dayStemIdx % 5;
  const stemBase = HOUR_STEM_BASE[group * 2] ?? 0;
  const stemIdx = (stemBase + branchIdx) % 10;
  const stem = STEMS[stemIdx];
  return { stem, branch, ohaeng: STEM_OHAENG[stem], branchOhaeng: BRANCH_OHAENG[branch] };
}

// ─── 충(沖) ──────────────────────────────────────────────────────
const CHUNG_MAP: Partial<Record<Branch, Branch>> = {
  자: '오', 오: '자',
  축: '미', 미: '축',
  인: '신', 신: '인',
  묘: '유', 유: '묘',
  진: '술', 술: '진',
  사: '해', 해: '사',
};
const CHUNG_NAMES: Partial<Record<Branch, string>> = {
  자: '자오충(子午沖)', 오: '자오충(子午沖)',
  축: '축미충(丑未沖)', 미: '축미충(丑未沖)',
  인: '인신충(寅申沖)', 신: '인신충(寅申沖)',
  묘: '묘유충(卯酉沖)', 유: '묘유충(卯酉沖)',
  진: '진술충(辰戌沖)', 술: '진술충(辰戌沖)',
  사: '사해충(巳亥沖)', 해: '사해충(巳亥沖)',
};

// ─── 형(刑) ──────────────────────────────────────────────────────
// 삼형: 인사신(무은지형), 축술미(지세지형)
// 자묘형(무례지형), 자형: 진진·오오·유유·해해
const HYUNG_PAIRS: Array<[Branch, Branch, string]> = [
  ['자', '묘', '자묘형(子卯刑)'],
  ['인', '사', '인사신형(寅巳申刑)'],
  ['사', '신', '인사신형(寅巳申刑)'],
  ['인', '신', '인사신형(寅巳申刑)'],
  ['축', '술', '축술미형(丑戌未刑)'],
  ['술', '미', '축술미형(丑戌未刑)'],
  ['축', '미', '축술미형(丑戌未刑)'],
];
// 자형(自刑)
const SELF_HYUNG: Branch[] = ['진', '오', '유', '해'];

// ─── 해(害) ──────────────────────────────────────────────────────
const HAE_PAIRS: Array<[Branch, Branch, string]> = [
  ['자', '미', '자미해(子未害)'],
  ['축', '오', '축오해(丑午害)'],
  ['인', '사', '인사해(寅巳害)'],  // 인사는 해이기도 함 (형과 중복 가능)
  ['묘', '진', '묘진해(卯辰害)'],
  ['신', '해', '신해해(申亥害)'],
  ['유', '술', '유술해(酉戌害)'],
];

// ─── 파(破) ──────────────────────────────────────────────────────
const PA_PAIRS: Array<[Branch, Branch, string]> = [
  ['자', '유', '자유파(子酉破)'],
  ['축', '진', '축진파(丑辰破)'],
  ['인', '해', '인해파(寅亥破)'],
  ['묘', '오', '묘오파(卯午破)'],
  ['사', '신', '사신파(巳申破)'],
  ['미', '술', '미술파(未戌破)'],
];

// ─── 합(合) ──────────────────────────────────────────────────────
// 지지삼합, 육합
const HAP_PAIRS: Array<[Branch, Branch, string]> = [
  // 육합
  ['자', '축', '자축합(子丑合)'],
  ['인', '해', '인해합(寅亥合)'],
  ['묘', '술', '묘술합(卯戌合)'],
  ['진', '유', '진유합(辰酉合)'],
  ['사', '신', '사신합(巳申合)'],
  ['오', '미', '오미합(午未合)'],
];

// ─── 관계 계산 ───────────────────────────────────────────────────
function checkPairs<T extends [Branch, Branch, string]>(
  branches1: Branch[], branches2: Branch[], pairs: T[], label: string
): ConflictDetail[] {
  const results: ConflictDetail[] = [];
  const seen = new Set<string>();
  for (const b1 of branches1) {
    for (const b2 of branches2) {
      for (const [a, c, name] of pairs) {
        if ((a === b1 && c === b2) || (a === b2 && c === b1)) {
          const key = name + label;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({ name, pillars: label });
          }
        }
      }
    }
  }
  return results;
}

function checkChung(branches1: Branch[], branches2: Branch[]): ConflictDetail[] {
  const results: ConflictDetail[] = [];
  const seen = new Set<string>();
  for (const b1 of branches1) {
    for (const b2 of branches2) {
      if (CHUNG_MAP[b1] === b2) {
        const name = CHUNG_NAMES[b1] || '충';
        if (!seen.has(name)) {
          seen.add(name);
          results.push({ name, pillars: `${b1}↔${b2}` });
        }
      }
    }
  }
  return results;
}

function checkSelfHyung(branches: Branch[]): ConflictDetail[] {
  const results: ConflictDetail[] = [];
  const seen = new Set<Branch>();
  for (const b of branches) {
    if (SELF_HYUNG.includes(b) && !seen.has(b)) {
      seen.add(b);
      results.push({ name: `${b}${b}자형(自刑)`, pillars: `${b}↔${b}` });
    }
  }
  return results;
}

function getGeuk(stem1: Stem, stem2: Stem): { exists: boolean; direction: string } {
  const o1 = STEM_OHAENG[stem1];
  const o2 = STEM_OHAENG[stem2];
  if (GEUK_MAP[o1] === o2) return { exists: true, direction: `${o1}(${stem1})이 ${o2}(${stem2})를 극함` };
  if (GEUK_MAP[o2] === o1) return { exists: true, direction: `${o2}(${stem2})이 ${o1}(${stem1})를 극함` };
  return { exists: false, direction: '' };
}

function collectBranches(pillars: (Pillar | null)[]): Branch[] {
  return pillars.filter((p): p is Pillar => p !== null).map(p => p.branch);
}

function collectStems(pillars: (Pillar | null)[]): Stem[] {
  return pillars.filter((p): p is Pillar => p !== null).map(p => p.stem);
}

// ─── 충돌 점수 계산 ──────────────────────────────────────────────
function calcToxicScore(conflicts: SajuResult['conflicts']): number {
  let score = 30;
  score += conflicts.chung.length * 25;
  score += conflicts.hyung.length * 20;
  score += conflicts.hae.length * 10;
  score += conflicts.pa.length * 8;
  if (conflicts.geuk.exists) score += 15;
  // 합이 많으면 점수 감소 (궁합이 있다는 의미)
  score -= conflicts.hap.length * 10;
  return Math.min(Math.max(score, 15), 99);
}

// ─── 위험 지지·오행 계산 (내 위험 유형 역산용) ───────────────────
function getMyDangerBranches(myBranches: Branch[]): Branch[] {
  const danger: Branch[] = [];
  for (const b of myBranches) {
    if (CHUNG_MAP[b]) danger.push(CHUNG_MAP[b]!);
  }
  return [...new Set(danger)];
}

function getMyDangerOhaeng(myStems: Stem[]): Ohaeng[] {
  const danger: Ohaeng[] = [];
  for (const s of myStems) {
    const o = STEM_OHAENG[s];
    if (GEUK_MAP[o]) danger.push(GEUK_MAP[o]!);
  }
  return [...new Set(danger)];
}

// ─── 정확도 레벨 ──────────────────────────────────────────────────
function getAccuracyLevel(
  myDay: Pillar | null, myHour: Pillar | null,
  targetDay: Pillar | null
): 'year' | 'month' | 'day' | 'full' {
  if (myHour && targetDay) return 'full';
  if (myDay && targetDay) return 'day';
  if (targetDay) return 'month';
  return 'year';
}

// ─── 레거시 호환 텍스트 생성 ─────────────────────────────────────
function getLegacyConflictType(conflicts: SajuResult['conflicts'], myBranch: Branch, targetBranch: Branch): string {
  if (conflicts.chung.length > 0) return conflicts.chung[0].name;
  if (conflicts.hyung.length > 0) return conflicts.hyung[0].name;
  return `${myBranch}${targetBranch} 기질충돌`;
}

function getLegacySummary(conflicts: SajuResult['conflicts'], score: number): string {
  if (conflicts.chung.length > 0) {
    const name = conflicts.chung[0].name;
    const summaries: Record<string, string> = {
      '인신충(寅申沖)': '서로 끌리지만 결국 폭발하는 관계입니다. 처음엔 운명처럼 느껴지지만 근본적인 방향성이 정반대입니다.',
      '자오충(子午沖)': '에너지가 강하게 부딪히는 관계입니다. 함께할 때 활력이 넘치지만 지속되면 서로를 소진시킵니다.',
      '묘유충(卯酉沖)': '가치관과 스타일이 충돌하는 관계입니다. 서로의 방식을 인정하기 어렵습니다.',
      '진술충(辰戌沖)': '고집과 고집이 부딪히는 관계입니다. 양보 없는 평행선을 달립니다.',
      '축미충(丑未沖)': '안정 vs 변화의 충돌입니다. 서로의 페이스를 계속 방해합니다.',
      '사해충(巳亥沖)': '이상과 현실이 충돌합니다. 서로를 이해하기 구조적으로 어렵습니다.',
    };
    return summaries[name] || '강한 에너지 충돌이 있는 관계입니다.';
  }
  if (conflicts.hyung.length > 0) {
    return '겉으로는 괜찮아 보이지만 서서히 쌓이는 불편함이 있는 관계입니다. 소리 없이 갈등이 깊어집니다.';
  }
  if (score >= 60) return '오행의 에너지가 서로를 소모시키는 관계입니다. 함께할수록 지칩니다.';
  return '근본적인 기질 차이로 인해 마찰이 생기는 관계입니다.';
}

function getLegacyTags(score: number, conflicts: SajuResult['conflicts']): string[] {
  const tags: string[] = [];
  if (score >= 90) tags.push('#독성MAX');
  if (score >= 70) tags.push('#에너지소모');
  if (conflicts.chung.length > 0) tags.push('#충돌구조');
  if (conflicts.hyung.length > 0) tags.push('#누적피로');
  if (conflicts.hae.length > 0) tags.push('#해악관계');
  if (conflicts.geuk.exists) tags.push('#기운고갈');
  if (score >= 60 && score < 80) tags.push('#마찰반복');
  if (score < 60) tags.push('#기질차이');
  tags.push('#사주분석');
  return tags.slice(0, 4);
}

// ─── 메인 분석 함수 ──────────────────────────────────────────────
export function analyzeSaju(
  myData: PersonData,
  targetData: PersonData,
  _relationType: RelationType
): SajuResult {
  const [myY, myM, myD] = myData.birthdate.split('-').map(Number);
  const myYear = getYearPillar(myY, myM, myD);
  const myMonth = getMonthPillar(myY, myM, myD);
  const myDay = getDayPillar(myData.birthdate);
  const myHour = getHourPillar(myData.birthtime, myDay.stem);

  const hasTarget = targetData.birthdate && targetData.birthdate.length >= 4;
  let targetYear: Pillar;
  let targetMonth: Pillar | null = null;
  let targetDay: Pillar | null = null;

  if (hasTarget) {
    const [tY, tM, tD] = targetData.birthdate.split('-').map(Number);
    targetYear = getYearPillar(tY, tM, tD);
    if (targetData.birthdate.length >= 7) {
      targetMonth = getMonthPillar(tY, tM, tD);
    }
    if (targetData.birthdate.length >= 10) {
      targetDay = getDayPillar(targetData.birthdate);
    }
  } else {
    // 상대 정보 없으면 더미 (내 위험 유형 역산 모드)
    targetYear = myYear;
  }

  const myBranches = collectBranches([myYear, myMonth, myDay, myHour]);
  const myStems = collectStems([myYear, myMonth, myDay, myHour]);
  const targetBranches = collectBranches([targetYear, targetMonth, targetDay]);

  const chung = checkChung(myBranches, targetBranches);
  const hyung = [
    ...checkPairs(myBranches, targetBranches, HYUNG_PAIRS, '쌍방'),
    ...checkSelfHyung([...myBranches, ...targetBranches]),
  ];
  const hae = checkPairs(myBranches, targetBranches, HAE_PAIRS, '쌍방');
  const pa = checkPairs(myBranches, targetBranches, PA_PAIRS, '쌍방');
  const hap = checkPairs(myBranches, targetBranches, HAP_PAIRS, '쌍방');

  // 일간끼리 천간 극 계산
  const geuk = myDay && targetDay
    ? getGeuk(myDay.stem, targetDay.stem)
    : getGeuk(myYear.stem, targetYear.stem);

  const conflicts = { chung, hyung, hae, pa, hap, geuk };
  const toxicScore = calcToxicScore(conflicts);
  const accuracyLevel = getAccuracyLevel(myDay, myHour, targetDay);

  const myDangerBranches = getMyDangerBranches(myBranches);
  const myDangerOhaeng = getMyDangerOhaeng(myStems);

  // 레거시 호환
  const conflictType = getLegacyConflictType(conflicts, myYear.branch, targetYear.branch);
  const conflictSummary = getLegacySummary(conflicts, toxicScore);
  const tags = getLegacyTags(toxicScore, conflicts);

  const mainChung = chung[0];
  const mainHyung = hyung[0];

  return {
    myYear, myMonth, myDay, myHour,
    targetYear, targetMonth, targetDay,
    conflicts,
    toxicScore,
    accuracyLevel,
    myDangerBranches,
    myDangerOhaeng,
    // legacy
    myBranch: myYear.branch,
    myStem: myYear.stem,
    targetBranch: targetYear.branch,
    targetStem: targetYear.stem,
    chung: { exists: chung.length > 0, name: mainChung?.name || '' },
    hyung: { exists: hyung.length > 0, name: mainHyung?.name || '' },
    geuk,
    conflictType,
    conflictSummary,
    analysis: {
      chungAnalysis: chung.length > 0
        ? `${mainChung.name} 관계입니다. 지지의 정면 충돌로 에너지 방향이 완전히 반대입니다.`
        : '직접적인 충 관계는 없으나 기질 차이로 마찰이 발생합니다.',
      hyungAnalysis: hyung.length > 0
        ? `${mainHyung.name} 관계입니다. 겉으로 드러나지 않는 누적 갈등 구조입니다.`
        : '형 관계는 없으나 다른 충돌 구조가 존재합니다.',
      geukAnalysis: geuk.exists
        ? `${geuk.direction} — 오행 극 관계로 한쪽이 지속적으로 에너지를 소모당합니다.`
        : '오행 극 관계는 없습니다.',
    },
    tags,
  };
}

// 단일 사주 추출 (내 위험 유형 역산용)
export function getMySaju(data: PersonData) {
  const [y, m, d] = data.birthdate.split('-').map(Number);
  const yearPillar = getYearPillar(y, m, d);
  const monthPillar = getMonthPillar(y, m, d);
  const dayPillar = getDayPillar(data.birthdate);
  const hourPillar = getHourPillar(data.birthtime, dayPillar.stem);
  return { yearPillar, monthPillar, dayPillar, hourPillar };
}
