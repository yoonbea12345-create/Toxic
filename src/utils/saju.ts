export type Branch = '자' | '축' | '인' | '묘' | '진' | '사' | '오' | '미' | '신' | '유' | '술' | '해';
export type Stem = '갑' | '을' | '병' | '정' | '무' | '기' | '경' | '신' | '임' | '계';
export type Ohaeng = '목' | '화' | '토' | '금' | '수';

export type RelationType = '연인' | '친구' | '직장' | '가족' | '기타';

export interface PersonData {
  name: string;
  birthdate: string;
  birthtime: string;
  gender: '남' | '여';
}

export interface SajuResult {
  myBranch: Branch;
  myStem: Stem;
  targetBranch: Branch;
  targetStem: Stem;
  chung: { exists: boolean; name: string };
  hyung: { exists: boolean; name: string };
  geuk: { exists: boolean; direction: string };
  toxicScore: number;
  conflictType: string;
  conflictSummary: string;
  analysis: {
    chungAnalysis: string;
    hyungAnalysis: string;
    geukAnalysis: string;
  };
  tags: string[];
}

const BRANCHES: Branch[] = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
const STEMS: Stem[] = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

const BRANCH_OHAENG: Record<Branch, Ohaeng> = {
  자: '수', 축: '토', 인: '목', 묘: '목',
  진: '토', 사: '화', 오: '화', 미: '토',
  신: '금', 유: '금', 술: '토', 해: '수',
};

const STEM_OHAENG: Record<Stem, Ohaeng> = {
  갑: '목', 을: '목', 병: '화', 정: '화',
  무: '토', 기: '토', 경: '금', 신: '금',
  임: '수', 계: '수',
};

const CHUNG_PAIRS: [Branch, Branch][] = [
  ['자', '오'], ['축', '미'], ['인', '신'],
  ['묘', '유'], ['진', '술'], ['사', '해'],
];

const CHUNG_NAMES: Record<string, string> = {
  '자오': '자오충(子午沖)', '오자': '자오충(子午沖)',
  '축미': '축미충(丑未沖)', '미축': '축미충(丑未沖)',
  '인신': '인신충(寅申沖)', '신인': '인신충(寅申沖)',
  '묘유': '묘유충(卯酉沖)', '유묘': '묘유충(卯酉沖)',
  '진술': '진술충(辰戌沖)', '술진': '진술충(辰戌沖)',
  '사해': '사해충(巳亥沖)', '해사': '사해충(巳亥沖)',
};

const HYUNG_PAIRS: [Branch, Branch][] = [
  ['자', '묘'], ['묘', '자'],
  ['인', '사'], ['사', '인'],
  ['인', '신'], ['신', '인'],
  ['축', '술'], ['술', '축'],
  ['축', '미'], ['미', '축'],
  ['술', '미'], ['미', '술'],
];

const HYUNG_NAMES: Record<string, string> = {
  '자묘': '자묘형(子卯刑)', '묘자': '자묘형(子卯刑)',
  '인사': '인사신형(寅巳申刑)', '사인': '인사신형(寅巳申刑)',
  '인신': '인사신형(寅巳申刑)', '신인': '인사신형(寅巳申刑)',
  '사신': '인사신형(寅巳申刑)', '신사': '인사신형(寅巳申刑)',
  '축술': '축술미형(丑戌未刑)', '술축': '축술미형(丑戌未刑)',
  '축미': '축술미형(丑戌未刑)', '미축': '축술미형(丑戌未刑)',
  '술미': '축술미형(丑戌未刑)', '미술': '축술미형(丑戌未刑)',
};

const GEUK_PAIRS: [Ohaeng, Ohaeng][] = [
  ['목', '토'], ['토', '수'], ['수', '화'],
  ['화', '금'], ['금', '목'],
];

export function getBirthBranch(dateStr: string): Branch {
  const year = new Date(dateStr).getFullYear();
  const idx = ((year - 1924) % 12 + 12) % 12;
  return BRANCHES[idx];
}

export function getBirthStem(dateStr: string): Stem {
  const year = new Date(dateStr).getFullYear();
  const idx = ((year - 1924) % 10 + 10) % 10;
  return STEMS[idx];
}

export function getChung(b1: Branch, b2: Branch): { exists: boolean; name: string } {
  const key = b1 + b2;
  for (const [a, c] of CHUNG_PAIRS) {
    if ((a === b1 && c === b2) || (a === b2 && c === b1)) {
      return { exists: true, name: CHUNG_NAMES[key] || CHUNG_NAMES[b2 + b1] || '충(沖)' };
    }
  }
  return { exists: false, name: '' };
}

export function getHyung(b1: Branch, b2: Branch): { exists: boolean; name: string } {
  const key = b1 + b2;
  for (const [a, c] of HYUNG_PAIRS) {
    if (a === b1 && c === b2) {
      return { exists: true, name: HYUNG_NAMES[key] || '형(刑)' };
    }
  }
  return { exists: false, name: '' };
}

export function getGeuk(s1: Stem, s2: Stem): { exists: boolean; direction: string } {
  const o1 = STEM_OHAENG[s1];
  const o2 = STEM_OHAENG[s2];
  for (const [dominant, subdued] of GEUK_PAIRS) {
    if (dominant === o1 && subdued === o2) {
      return { exists: true, direction: `${o1}이 ${o2}를 극함` };
    }
    if (dominant === o2 && subdued === o1) {
      return { exists: true, direction: `${o2}가 ${o1}를 극함` };
    }
  }
  return { exists: false, direction: '' };
}

export function getToxicScore(
  myBranch: Branch, myStem: Stem,
  targetBranch: Branch, targetStem: Stem
): number {
  let score = 30;
  const chung = getChung(myBranch, targetBranch);
  const hyung = getHyung(myBranch, targetBranch);
  const geuk = getGeuk(myStem, targetStem);

  if (chung.exists) score += 35;
  if (hyung.exists) score += 25;
  if (geuk.exists) score += 20;

  const myOhaeng = BRANCH_OHAENG[myBranch];
  const targetOhaeng = BRANCH_OHAENG[targetBranch];
  if (myOhaeng === targetOhaeng) score -= 10;

  return Math.min(Math.max(score, 20), 99);
}

interface ConflictTypeInfo {
  name: string;
  summary: string;
}

function getConflictType(
  chung: { exists: boolean; name: string },
  hyung: { exists: boolean; name: string },
  score: number,
  myBranch: Branch,
  targetBranch: Branch
): ConflictTypeInfo {
  if (chung.exists) {
    const name = chung.name;
    const summaries: Record<string, string> = {
      '인신충(寅申沖)': '서로 끌리지만 결국 폭발하는 관계입니다. 처음엔 운명처럼 느껴지지만 근본적인 방향성이 정반대입니다.',
      '자오충(子午沖)': '에너지가 강하게 부딪히는 관계입니다. 함께할 때 활력이 넘치지만 지속되면 소진됩니다.',
      '묘유충(卯酉沖)': '가치관과 스타일이 충돌하는 관계입니다. 서로의 방식을 인정하기 어렵습니다.',
      '진술충(辰戌沖)': '고집과 고집이 부딪히는 관계입니다. 양보 없는 평행선을 달립니다.',
      '축미충(丑未沖)': '안정 vs 변화의 충돌입니다. 서로의 페이스를 방해합니다.',
      '사해충(巳亥沖)': '이상과 현실이 충돌합니다. 서로를 이해하기 어렵습니다.',
    };
    return { name, summary: summaries[name] || '강한 에너지 충돌이 있는 관계입니다.' };
  }
  if (hyung.exists) {
    return {
      name: hyung.name,
      summary: '겉으로는 괜찮아 보이지만 서서히 쌓이는 불편함이 있는 관계입니다. 소리 없이 갈등이 깊어집니다.',
    };
  }
  if (score > 60) {
    return {
      name: `${myBranch}${targetBranch} 충돌`,
      summary: '오행의 에너지가 서로를 소모시키는 관계입니다. 함께할수록 지칩니다.',
    };
  }
  return {
    name: `${myBranch}${targetBranch} 불화`,
    summary: '근본적인 기질 차이로 인해 마찰이 생기는 관계입니다.',
  };
}

function getAnalysisText(
  chung: { exists: boolean; name: string },
  hyung: { exists: boolean; name: string },
  geuk: { exists: boolean; direction: string },
  relationType: RelationType,
  score: number
): { chungAnalysis: string; hyungAnalysis: string; geukAnalysis: string } {
  const templates: Record<RelationType, Record<string, string[]>> = {
    연인: {
      chung: [
        '첫 만남부터 강렬한 끌림이 있었을 거예요. 그 끌림의 정체가 바로 충(沖)입니다. 반대 에너지라 서로에게 강하게 끌리지만, 같이 있으면 결국 폭발합니다.',
        '연인 사이에서 충은 가장 아픈 형태로 나타납니다. 사랑하지만 상처를 주는 패턴이 반복된 이유가 여기 있습니다.',
        '충 관계가 없어도 두 사람의 기운이 서로 다른 방향을 향하고 있어 기본적인 마찰이 있습니다.',
      ],
      hyung: [
        '처음엔 사소한 것들이 쌓였을 거예요. 형(刑)은 갑자기 폭발하지 않습니다. 서서히, 조용히, 그러나 확실하게 관계를 갉아먹습니다.',
        '형의 관계에서는 "왜 이렇게 불편하지?"라는 느낌이 정확합니다. 이유를 설명하기 어려운 불쾌함이 형의 특징입니다.',
        '직접적인 충돌보다 누적된 피로가 두 사람의 관계를 힘들게 만든 원인입니다.',
      ],
      geuk: [
        '오행의 극(剋) 관계에 있다는 건 한 사람의 에너지가 다른 사람을 지속적으로 소모시킨다는 의미입니다. 사랑하는데 왜 항상 지치는지 이제 이해되실 거예요.',
        '극 관계가 없어도 두 사람의 오행이 서로를 편하게 두지 못하는 구조입니다.',
      ],
    },
    친구: {
      chung: [
        '친했던 친구와 멀어지게 된 데는 이유가 있습니다. 충(沖)은 초반에는 자극이 되지만, 시간이 지나면 서로를 피로하게 만듭니다.',
        '이 친구와의 갈등이 유독 크게 느껴졌던 이유가 충 때문입니다. 서로의 에너지가 정면 충돌합니다.',
        '큰 충돌은 없어 보여도 기운의 방향이 달라 함께할수록 어색함이 쌓입니다.',
      ],
      hyung: [
        '이유를 정확히 설명하기 어렵지만 점점 불편해지는 느낌, 그게 형(刑)입니다. 친구 관계에서 형은 서서히 거리를 만듭니다.',
        '형의 관계는 다투지 않아도 자연스럽게 멀어집니다. 노력해도 좁혀지지 않는 이유입니다.',
        '뚜렷한 형은 없지만 기질 차이로 인한 불편함이 관계를 어렵게 만들고 있습니다.',
      ],
      geuk: [
        '한 사람의 기운이 다른 사람을 압도하는 구조입니다. 같이 있으면 에너지를 빼앗기는 느낌이 드는 이유입니다.',
        '극 관계가 뚜렷하지 않아도 오행의 흐름이 편하지 않습니다.',
      ],
    },
    직장: {
      chung: [
        '충(沖) 관계의 상사/동료는 업무 방식이 근본적으로 다릅니다. 무엇을 해도 맞지 않는 느낌의 원인이 바로 이것입니다.',
        '충 관계는 직장에서 유독 두드러집니다. 판단 기준, 우선순위, 소통 방식이 모두 반대로 작동합니다.',
        '직접적인 충돌은 없어도 근본적인 업무 철학 차이로 계속 마찰이 생깁니다.',
      ],
      hyung: [
        '형(刑)의 관계는 직장에서 가스라이팅처럼 느껴질 수 있습니다. 분명히 뭔가 이상한데 꼬집어 말하기 어려운 그 불편함입니다.',
        '갑자기 폭발하지 않고 서서히 쌓이는 형의 특성 때문에 퇴직을 고민하게 되는 경우도 많습니다.',
        '형이 없어도 기운의 구조상 직장 내에서 지속적인 마찰이 불가피합니다.',
      ],
      geuk: [
        '오행 극(剋) 관계의 상사는 의도하지 않아도 부하의 에너지를 소진시킵니다. 열심히 해도 인정받지 못하는 구조적 이유입니다.',
        '극 관계는 아니지만 두 사람의 오행이 직장 환경에서 충분히 마찰을 만들어냅니다.',
      ],
    },
    가족: {
      chung: [
        '가족 간의 충(沖)은 가장 아픈 형태입니다. 사랑하는데 왜 항상 상처를 주고받는지, 그 구조적 이유가 충입니다.',
        '사랑받고 싶어서 더 집착하고, 집착하니까 더 충돌하는 패턴. 충 관계의 가족에게서 흔히 나타납니다.',
        '큰 충돌은 없어도 기운의 방향이 달라 항상 약간의 어긋남이 있습니다.',
      ],
      hyung: [
        '가족 사이에서 형(刑)은 "왜 이 사람이랑 있으면 항상 지치지?"로 나타납니다. 사랑인데 왜 힘든지 설명이 안 됐던 이유입니다.',
        '형의 관계에서는 노력할수록 더 복잡해지는 경우가 많습니다. 서로의 선의가 충돌하기 때문입니다.',
        '형이 뚜렷하지 않아도 기질 차이로 인해 가족 내에서 계속적인 마찰이 생깁니다.',
      ],
      geuk: [
        '부모와 자녀 사이의 극(剋) 관계는 "왜 부모님 말을 들으면 기운이 빠지지?"를 설명합니다. 억압이 아니라 오행 구조입니다.',
        '극 관계가 없어도 두 사람의 오행 흐름이 가족 관계에서 자연스러운 긴장을 만듭니다.',
      ],
    },
    기타: {
      chung: [
        '이유 없이 불편한 그 사람. 충(沖)이 있다면 첫 만남부터 이미 에너지가 충돌하고 있었습니다.',
        '본능적으로 피하게 되는 사람과의 충(沖) 관계는 매우 흔합니다. 직감이 틀리지 않았습니다.',
        '뚜렷한 충은 없어도 두 사람의 기운이 서로를 불편하게 만드는 방향입니다.',
      ],
      hyung: [
        '말투 하나, 행동 하나가 유독 거슬린다면 형(刑)의 가능성이 높습니다. 논리가 아닌 기운의 문제입니다.',
        '형의 관계는 이유 없이 싫다는 느낌으로 나타납니다. 당신의 감각이 맞습니다.',
        '직접적인 형은 없어도 기운의 결이 달라 자연스럽게 불편함이 생깁니다.',
      ],
      geuk: [
        '만날 때마다 에너지가 빠진다면 오행 극(剋) 관계일 수 있습니다. 그 사람 자체가 나쁜 게 아니라 구조의 문제입니다.',
        '극 관계가 뚜렷하지 않아도 두 사람의 오행이 소모적인 방향으로 작용합니다.',
      ],
    },
  };

  const t = templates[relationType];

  const chungIdx = chung.exists ? 0 : score > 70 ? 1 : 2;
  const hyungIdx = hyung.exists ? 0 : score > 60 ? 1 : 2;
  const geukIdx = geuk.exists ? 0 : 1;

  return {
    chungAnalysis: t.chung[Math.min(chungIdx, t.chung.length - 1)],
    hyungAnalysis: t.hyung[Math.min(hyungIdx, t.hyung.length - 1)],
    geukAnalysis: t.geuk[Math.min(geukIdx, t.geuk.length - 1)],
  };
}

function getTags(score: number, chung: boolean, hyung: boolean, geuk: boolean): string[] {
  const tags: string[] = [];
  if (score >= 90) tags.push('#독성MAX');
  if (score >= 70) tags.push('#에너지소모');
  if (chung) tags.push('#충돌구조');
  if (hyung) tags.push('#누적피로');
  if (geuk) tags.push('#기운고갈');
  if (score >= 60 && score < 80) tags.push('#마찰반복');
  if (score < 60) tags.push('#기질차이');
  tags.push('#사주분석');
  return tags.slice(0, 4);
}

export function analyzeSaju(
  myData: PersonData,
  targetData: PersonData,
  relationType: RelationType
): SajuResult {
  const myBranch = getBirthBranch(myData.birthdate);
  const myStem = getBirthStem(myData.birthdate);
  const targetBranch = getBirthBranch(targetData.birthdate);
  const targetStem = getBirthStem(targetData.birthdate);

  const chung = getChung(myBranch, targetBranch);
  const hyung = getHyung(myBranch, targetBranch);
  const geuk = getGeuk(myStem, targetStem);

  const toxicScore = getToxicScore(myBranch, myStem, targetBranch, targetStem);
  const conflictInfo = getConflictType(chung, hyung, toxicScore, myBranch, targetBranch);
  const analysis = getAnalysisText(chung, hyung, geuk, relationType, toxicScore);
  const tags = getTags(toxicScore, chung.exists, hyung.exists, geuk.exists);

  return {
    myBranch,
    myStem,
    targetBranch,
    targetStem,
    chung,
    hyung,
    geuk,
    toxicScore,
    conflictType: conflictInfo.name,
    conflictSummary: conflictInfo.summary,
    analysis,
    tags,
  };
}
