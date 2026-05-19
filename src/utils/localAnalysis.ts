import type { SajuResult } from './saju';

// mirrors AIAnalysis in StepResult.tsx
export interface LocalAIAnalysis {
  toxicSummary?: string;
  coreConflict?: { title: string; description: string };
  conflictAnalysis?: { chung?: string | null; hyung?: string | null; hae?: string | null; geuk?: string | null };
  conflictScenarios?: Array<{ situation: string; whatHappens: string; whySaju: string }>;
  emotionalPattern?: { myPattern: string; targetPattern: string; cycle: string };
  energyDynamic?: { whoLoses: string; drainMechanism: string; longTermEffect: string };
  relationSpecific?: string;
  triggerPoints?: string[];
  hiddenDynamic?: string;
  realisticOutlook?: string;
  avoidanceGuide?: { mindset: string; practicalTips: string[]; boundaries: string };
  personalImpact?: { onMe: string; warningSignals: string[]; whatYouLose: string };
  continuationAssessment?: { structuralAnalysis: string; whatItTakes: string; redLine: string; verdict: string };
  myCharacter?: { core: string; strength: string; shadow: string };
  dangerTypes?: Array<{ type: string; years?: string; whyDangerous: string; realScenario: string }>;
  warningPattern?: string;
}

// ── 충(沖) 분석 ─────────────────────────────────────────────────
const CHUNG_CONTEXT: Record<string, { base: string; pattern: string }> = {
  '자오충': {
    base: '차가운 물(水) 기운과 뜨거운 불(火) 기운이 정면으로 부딪히는 충돌입니다.',
    pattern: '한 쪽이 논리적으로 상황을 분석하려 할 때, 다른 쪽은 감정적으로 반응해서 대화가 매번 엇나갑니다. 이성으로 접근하면 "왜 이렇게 냉정해"라는 말이 나오고, 감정으로 접근하면 "왜 이렇게 예민해"라는 말이 나오는 구조입니다. 둘이 한 방향을 보는 것이 구조적으로 어렵습니다.',
  },
  '사해충': {
    base: '이상과 현실이 근본적으로 충돌하는 구조입니다. 巳(사)의 불 기운은 꿈과 이상을, 亥(해)의 물 기운은 현실과 안정을 추구합니다.',
    pattern: '한 쪽이 가능성을 이야기할 때 다른 쪽은 리스크를 이야기합니다. "왜 이렇게 현실적으로만 봐"와 "왜 이렇게 비현실적이야"가 반복되며, 서로 상대방이 자신의 가능성을 짓누른다고 느낍니다.',
  },
  '인신충': {
    base: '자유로운 나무(木) 기운과 원칙을 중시하는 쇠(金) 기운이 충돌합니다.',
    pattern: '한 쪽은 자유롭고 유연하게 상황에 대응하려 하고, 다른 쪽은 원칙과 규칙을 중시합니다. "왜 이렇게 틀에 박혀 있어"와 "왜 이렇게 제멋대로야"가 반복됩니다. 서로의 방식이 근본적으로 달라 타협점을 찾기 어렵습니다.',
  },
  '묘유충': {
    base: '감성적인 목(木) 기운과 현실적인 금(金) 기운이 가치관 차원에서 충돌합니다.',
    pattern: '감성과 현실 사이의 간극이 모든 대화에서 드러납니다. 감성적인 쪽은 "이 사람이 내 마음을 이해 못 한다"고, 현실적인 쪽은 "왜 이렇게 감정적으로 반응하지"라고 느낍니다. 둘 사이에 항상 보이지 않는 벽이 있습니다.',
  },
  '축미충': {
    base: '같은 토(土) 기운이지만 방향이 다른 두 고집이 부딪히는 구조입니다.',
    pattern: '둘 다 자기 방식이 맞다고 확신하는 성향이어서, 서로 양보가 거의 없습니다. 겉으로는 비슷해 보이지만 핵심 가치관에서 절대 맞지 않는 부분이 있습니다. 작은 일도 누가 맞냐의 싸움이 됩니다.',
  },
  '진술충': {
    base: '두 개의 강한 토(土) 기운이 방향을 놓고 충돌합니다.',
    pattern: '둘 다 굉장히 고집이 세고 자기 방식을 쉽게 바꾸지 않습니다. 협의가 필요한 상황마다 누가 주도권을 쥐느냐의 싸움으로 변하며, 한 쪽이 밀리면 깊은 불만이 쌓입니다.',
  },
};

function getChungAnalysis(names: string[], base: string): string {
  const first = names[0];
  const ctx = CHUNG_CONTEXT[first];
  if (ctx) {
    return `${ctx.base} ${ctx.pattern} ${base ? `사주 분석상 ${base}` : ''}`.trim();
  }
  return `${names.join(', ')} 충돌이 작동합니다. 두 사람의 핵심 기운이 정반대 방향을 향하고 있어, 같은 상황을 완전히 다르게 해석합니다. ${base} 이 에너지 충돌은 성격의 문제가 아니라 사주 구조 자체의 문제입니다.`;
}

// ── 형(刑) 분석 ─────────────────────────────────────────────────
const HYUNG_CONTEXT: Record<string, string> = {
  '인사신형': '인(寅)·사(巳)·신(申) 삼형살이 작동합니다. 이 세 기운이 서로를 자극하고 억누르는 구조로, 관계에 항상 보이지 않는 긴장이 흐릅니다. 뭔가를 말하기가 어렵고, 편하게 있는데도 미묘하게 불편한 감각이 계속됩니다.',
  '축술미형': '축(丑)·술(戌)·미(未) 삼형살이 작동합니다. 서로 자기 틀에서 벗어나지 않으려 하다 보니, 관계에 변화나 성장이 생기기 어렵습니다. 각자 원하는 것을 명확히 요구하지 못하면서 답답함이 쌓입니다.',
};

function getHyungAnalysis(names: string[], base: string): string {
  const first = names[0];
  const ctx = HYUNG_CONTEXT[first];
  const commonDesc = `${names.join(', ')} 형살이 작동합니다. 형살은 충처럼 폭발적이지 않지만, 관계를 서서히 압박합니다. 말하지 않아도 쌓이는 긴장이 있고, 편한 것 같다가도 갑자기 감정이 폭발하는 구조입니다. ${base || ''}`;
  return ctx || commonDesc;
}

// ── 해(害) 분석 ─────────────────────────────────────────────────
function getHaeAnalysis(names: string[]): string {
  return `${names.join(', ')} 해살이 작동합니다. 해(害)는 서로의 기운을 조용히 갉아먹는 관계입니다. 충돌이 겉으로 드러나지 않아 문제가 없는 것처럼 보이지만, 함께 있을수록 이유 없이 에너지가 빠지고 지쳐갑니다. 서로에게 나쁜 사람이 아닌데 왜 이렇게 힘드냐고 느끼게 되는 관계입니다.`;
}

// ── 극(剋) 분석 ─────────────────────────────────────────────────
function getGeukAnalysis(direction: string, base: string): string {
  const [from, to] = direction.split('→');
  return `${from || '나'}의 기운이 ${to || '상대'}의 기운을 억누르는 구조입니다. ${base ? base + ' ' : ''}극(剋) 관계에서는 억누르는 쪽도, 눌리는 쪽도 장기적으로 소모됩니다. 억누르는 쪽은 자신도 모르게 상대를 통제하려 하고, 눌리는 쪽은 자기 자신을 잃어가는 느낌을 받습니다. 이 관계를 오래 유지하면 한쪽이 완전히 무너지거나, 갑작스럽게 관계가 끊어집니다.`;
}

// ── 핵심 갈등 설명 ───────────────────────────────────────────────
function buildCoreDesc(result: SajuResult, _relationType: string, _scoreLabel: string): string {
  const chungNames = result.conflicts.chung.map(c => c.name);
  const hyungNames = result.conflicts.hyung.map(h => h.name);
  const hasChung = chungNames.length > 0;
  const hasHyung = hyungNames.length > 0;
  const hasGeuk = result.conflicts.geuk?.exists;

  const conflictSummary = result.conflictSummary || '두 사람의 사주 구조가 충돌합니다.';

  let structureDesc = '';
  if (hasChung) {
    structureDesc = `${chungNames.join(', ')} 충돌 구조가 있어, 두 사람의 에너지가 근본적으로 반대 방향을 향합니다.`;
  } else if (hasHyung) {
    structureDesc = `${hyungNames.join(', ')} 형살 구조가 있어, 관계에 말로 표현하기 어려운 긴장감이 지속됩니다.`;
  } else if (hasGeuk) {
    structureDesc = `오행 극(剋) 관계가 있어, 서로 의도하지 않아도 상대를 억누르거나 소모시킵니다.`;
  }

  const deepDesc = `이 갈등은 성격 차이나 노력 부족이 아니라, 태어날 때 결정된 기운 구조의 문제입니다. 서로 좋은 사람이고 마음이 있어도 이 구조 안에서는 갈등이 반복될 수밖에 없습니다.`;

  const scoreDesc = result.toxicScore >= 80
    ? `독성지수 ${result.toxicScore}점은 매우 강한 갈등 에너지를 의미합니다. 둘 사이에서는 작은 의견 차이도 큰 충돌로 번질 수 있습니다.`
    : result.toxicScore >= 60
    ? `독성지수 ${result.toxicScore}점은 상당한 갈등 에너지를 의미합니다. 특정 상황에서 반복적으로 마찰이 생기는 구조입니다.`
    : `독성지수 ${result.toxicScore}점은 중간 수준의 갈등 에너지를 의미합니다. 서로 노력하면 갈등을 줄일 수 있지만, 구조적 긴장은 계속 존재합니다.`;

  return [conflictSummary, structureDesc, deepDesc, scoreDesc].filter(Boolean).join(' ');
}

// ── 감정 패턴 ────────────────────────────────────────────────────
function buildEmotionalPattern(result: SajuResult, _relationType: string) {
  const hasChung = result.conflicts.chung.length > 0;
  const hasHyung = result.conflicts.hyung.length > 0;

  const myPattern = hasChung
    ? `충돌이 생겼을 때 내 반응은 즉각적입니다. 상황이 나빠지면 말이 많아지거나, 반대로 완전히 말이 없어지는 양극단으로 흐릅니다. 상대방이 이해를 못 한다는 느낌에 지쳐서, 결국 혼자 삭이는 경우가 많습니다.`
    : hasHyung
    ? `억눌린 감정이 쌓이는 패턴입니다. 즉각적으로 표현하지 못하고 속으로 삭이다가, 어느 순간 예상치 못하게 감정이 터집니다. 상대방은 갑자기 왜 이러냐고 당황하지만, 나는 이미 오래 참아왔던 상태입니다.`
    : `상대방이 예상과 다르게 행동할 때 실망감이 크게 올라옵니다. 기대치를 조정하지 못하고 같은 패턴에서 반복적으로 상처를 받습니다.`;

  const targetPattern = hasChung
    ? `상대방도 충돌이 생기면 자기 방식대로 반응합니다. 나와 반대 방향으로 에너지가 흐르다 보니, 내가 다가갈 때 상대는 물러나고, 내가 물러날 때 상대가 다가오는 식의 어긋남이 생깁니다. 타이밍이 맞지 않는 관계입니다.`
    : `상대방은 자신만의 방어 방식이 있습니다. 갈등 상황에서 그 방어 방식이 나에게는 차갑거나 무관심하게 느껴질 수 있습니다. 상대도 상처받고 있지만, 그 표현 방식이 나와 너무 달라 오해가 생깁니다.`;

  const cycle = `두 사람의 갈등 사이클은 이렇습니다: 어떤 사소한 일이 발단이 됩니다 → 서로 완전히 다른 방식으로 반응합니다 → 각자 상대가 이해 안 된다는 느낌을 받습니다 → 관계가 잠시 차가워집니다 → 다시 가까워지지만 근본 문제는 그대로입니다 → 같은 상황에서 또 터집니다. 이 사이클이 계속 반복됩니다.`;

  return { myPattern, targetPattern, cycle };
}

// ── 시나리오 ─────────────────────────────────────────────────────
const RELATION_SCENARIOS: Record<string, Array<{ situation: string; prefix: string }>> = {
  '연인': [
    { situation: '사소한 약속이 어긋났을 때', prefix: '처음엔 괜찮다고 했지만 실제로는 아닙니다.' },
    { situation: '서로 미래 이야기를 할 때', prefix: '방향이 완전히 달라서 대화가 겉돕니다.' },
    { situation: '상대방 친구와 만났을 때', prefix: '평소와 다른 모습에 불안해집니다.' },
    { situation: '피곤한 날 작은 말 한마디가', prefix: '평소라면 넘어갈 말이 이날은 폭발합니다.' },
  ],
  '친구': [
    { situation: '여행 계획을 함께 짤 때', prefix: '취향 차이가 갈등으로 번집니다.' },
    { situation: '한쪽이 힘든 일을 털어놓을 때', prefix: '위로 방식이 달라 오히려 상처가 됩니다.' },
    { situation: '다른 친구 앞에서 의견이 갈릴 때', prefix: '체면 때문에 더 심해집니다.' },
  ],
  '직장': [
    { situation: '프로젝트 방향 회의에서', prefix: '업무 스타일 차이가 노골적으로 드러납니다.' },
    { situation: '실수가 생겼을 때 처리 방식이', prefix: '책임 소재와 해결 방식을 다르게 봅니다.' },
    { situation: '마감 직전 의사소통이 안 될 때', prefix: '스트레스 상황에서 최악이 나옵니다.' },
  ],
  '가족': [
    { situation: '명절이나 중요한 자리에서', prefix: '평소 쌓인 것이 한꺼번에 터집니다.' },
    { situation: '돈이나 미래 계획 이야기가 나올 때', prefix: '가치관 차이가 선명하게 드러납니다.' },
    { situation: '서로 다른 기대를 가지고 있는 상황에서', prefix: '기대와 현실의 괴리가 갈등이 됩니다.' },
  ],
  '기타': [
    { situation: '의견을 맞춰야 하는 상황에서', prefix: '접근 방식이 달라 충돌이 생깁니다.' },
    { situation: '중요한 결정을 앞두고', prefix: '우선순위가 달라 합의가 안 됩니다.' },
    { situation: '감정적으로 예민한 상황에서', prefix: '서로의 반응이 완전히 엇갑니다.' },
  ],
};

function buildScenarios(result: SajuResult, relationType: string) {
  const templates = RELATION_SCENARIOS[relationType] ?? RELATION_SCENARIOS['기타'];
  const hasChung = result.conflicts.chung.length > 0;
  const hasHyung = result.conflicts.hyung.length > 0;
  const chungNames = result.conflicts.chung.map(c => c.name);

  return templates.slice(0, 3).map((t, i) => {
    const whatHappens = i === 0
      ? `${t.prefix} 처음에는 작은 의견 차이로 시작합니다. 그런데 서로 반응 방식이 달라서 대화가 건설적이지 않고 방어적이 됩니다. 한 쪽은 "왜 이렇게 예민하게 굴어"라고 느끼고, 다른 쪽은 "왜 내 말을 이해 못 해"라고 느낍니다. 결국 둘 다 상처받은 채로 대화가 끝납니다.`
      : i === 1
      ? `${t.prefix} 둘 중 하나가 감정적으로 반응합니다. 상대방은 그 반응이 과하다고 느끼지만 사실 이미 오래 쌓인 것이 터진 겁니다. 서로 "왜 이 상황에서 저렇게 반응하지"라고 이해하지 못하면서, 문제 해결보다 서로의 반응을 탓하는 방향으로 흐릅니다.`
      : `${t.prefix} 표면적으로는 사소한 문제이지만, 그 안에는 근본적인 기대와 가치관의 차이가 있습니다. 이 상황에서 생긴 상처는 쉽게 잊히지 않고 다음 갈등에서 다시 불거집니다.`;

    const whySaju = hasChung
      ? `${chungNames[0] || '충'} 충돌 구조가 있어, 에너지가 반대 방향으로 흐르는 이 두 사람은 같은 상황을 근본적으로 다르게 해석합니다. 이는 노력으로 고쳐지는 것이 아니라 사주 구조에서 비롯된 것입니다.`
      : hasHyung
      ? `형살 구조가 이 상황을 더 악화시킵니다. 형살은 억압과 긴장을 만들어, 평소라면 넘어갈 일이 이 관계에서는 더 크게 느껴지게 합니다.`
      : `오행 기운의 차이로 인해 두 사람의 해석 방식 자체가 다릅니다. 같은 상황을 봐도 전혀 다른 의미로 받아들이기 때문에, 소통 자체가 어렵습니다.`;

    return { situation: t.situation, whatHappens, whySaju };
  });
}

// ── 트리거 포인트 ────────────────────────────────────────────────
function buildTriggers(result: SajuResult, _relationType: string): string[] {
  const base = result.tags.length > 0 ? result.tags : [];
  const extra = [
    '서로 의견이 갈릴 때 한쪽이 단정적으로 말할 때',
    '기대한 반응이 나오지 않을 때',
    '상대방이 자신의 방식을 고집할 때',
    '피곤하거나 스트레스를 받은 상태일 때',
    '제3자(다른 사람들) 앞에서 의견 충돌이 생길 때',
  ];
  return [...base, ...extra].slice(0, 5);
}

// ── 에너지 역학 ──────────────────────────────────────────────────
function buildEnergyDynamic(result: SajuResult) {
  const score = result.toxicScore;
  const hasGeuk = result.conflicts.geuk?.exists;
  const geukDir = result.conflicts.geuk?.direction;

  const whoLoses = hasGeuk && geukDir
    ? `극(剋) 관계에서는 눌리는 쪽이 더 많이 소모됩니다. ${geukDir.split('→')[1] || '한쪽'}의 에너지가 이 관계에서 더 빠르게 소진됩니다. 억누르는 쪽도 유지하는 데 에너지를 씁니다.`
    : score >= 75
    ? `독성지수가 높은 관계일수록 더 공감하거나 노력하는 쪽이 먼저 지칩니다. 이 관계에서는 더 이해하려고 애쓰는 사람이 감정적으로 더 많이 소모됩니다.`
    : `두 사람 모두 이 관계를 유지하는 데 상당한 에너지를 씁니다. 겉으로는 별 문제 없어 보여도, 속으로는 계속 긴장 상태입니다.`;

  const drainMechanism = `대화할 때마다 서로 이해받지 못하는 느낌이 쌓입니다. 갈등이 해결되지 않은 채 넘어가는 일이 반복되고, 그 찜찜함이 다음 만남에 영향을 줍니다. 상대방과 있을 때 편하지 않은 순간이 점점 많아집니다.`;

  const longTermEffect = score >= 75
    ? `이 관계를 오래 유지할수록 자기 자신의 에너지가 줄어듭니다. 나중에는 상대방을 만나기 전부터 피로감을 느끼거나, 관계 자체를 회피하게 될 수 있습니다.`
    : `장기적으로 이 관계 안에서 자기다운 모습이 줄어들 수 있습니다. 상대에게 맞추거나 갈등을 피하기 위해 스스로를 조금씩 억제하게 됩니다.`;

  return { whoLoses, drainMechanism, longTermEffect };
}

// ── 관계별 특이점 ────────────────────────────────────────────────
function buildRelationSpecific(relationType: string, score: number, _chungNames: string[]): string {
  const scoreWord = score >= 75 ? '특히 심한' : '지속적인';
  switch (relationType) {
    case '연인':
      return `연인 관계에서 이 사주 충돌은 ${scoreWord} 갈등으로 나타납니다. 가장 가까이 있어야 하는 사람인데 가장 이해받지 못하는 느낌을 받습니다. 사랑은 있지만 갈등 구조가 그 사랑을 계속 시험합니다. 싸우고 나서 화해해도 같은 문제가 반복되는 이유가 여기 있습니다.`;
    case '친구':
      return `친구 관계에서는 이 갈등이 오해나 섭섭함으로 쌓입니다. 친구니까 괜찮겠지 하고 넘기다가, 어느 날 갑자기 멀어지는 경우가 많습니다. 서로 직접적으로 이야기하지 않은 감정들이 관계를 서서히 무너뜨립니다.`;
    case '직장':
      return `직장 관계에서는 업무 스타일과 소통 방식의 차이가 생산성에도 영향을 줍니다. 함께 일하는 것 자체가 스트레스가 되고, 상대방과 엮이는 상황을 피하게 됩니다. 이 갈등을 해결하지 않으면 업무 효율이 계속 떨어집니다.`;
    case '가족':
      return `가족 관계에서 이 사주 충돌은 가장 쉽게 표출됩니다. 피할 수 없는 관계이기 때문에 갈등이 더 날카롭게 느껴집니다. 가족이니까 참고 참다가 한꺼번에 터지는 일이 반복됩니다.`;
    default:
      return `이 갈등 구조는 두 사람이 어떤 관계든 영향을 미칩니다. 가까워질수록 충돌 에너지가 더 선명하게 드러나며, 초기에는 이해와 맞춤으로 감출 수 있지만 시간이 지날수록 피하기 어렵습니다.`;
  }
}

// ── 현실적 전망 ──────────────────────────────────────────────────
function buildOutlook(score: number, _hasChung: boolean, _hasHyung: boolean): string {
  if (score >= 85) return `사주 구조상 이 관계는 장기적으로 유지하기 매우 어렵습니다. 두 사람 모두 선한 의도가 있어도, 갈등 에너지가 너무 강해서 관계 자체가 소모전이 됩니다. 유지한다면 매우 명확한 규칙과 경계가 필요합니다.`;
  if (score >= 65) return `이 관계는 노력 없이는 유지하기 어렵습니다. 서로의 갈등 패턴을 인식하고 의도적으로 다루지 않으면, 같은 갈등이 반복됩니다. 두 사람 모두 변화하려는 의지가 있을 때만 관계가 나아집니다.`;
  return `갈등 구조가 존재하지만, 서로 인식하고 조율하면 공존이 가능합니다. 충돌이 생기는 패턴을 파악하고, 그 상황에서 각자의 반응을 조금씩 조정하면 관계가 개선될 수 있습니다.`;
}

// ── 숨겨진 역학 ──────────────────────────────────────────────────
function buildHiddenDynamic(result: SajuResult): string {
  const hasChung = result.conflicts.chung.length > 0;
  const hasGeuk = result.conflicts.geuk?.exists;

  if (hasGeuk) return `두 사람은 서로 억압하고 억압받는 관계인데, 이걸 서로 인식하지 못하는 경우가 많습니다. 억누르는 쪽은 자신이 상대를 힘들게 한다는 걸 모르고, 눌리는 쪽은 왜 이렇게 자신감이 없어지는지 이유를 모릅니다. 관계 안에서 자기 자신이 줄어드는 것을 알아채지 못하는 것이 가장 큰 위험입니다.`;
  if (hasChung) return `두 사람은 서로에게 끌리는 동시에 충돌합니다. 처음에 끌린 이유가 나중에 갈등의 이유가 되는 구조입니다. "처음엔 그게 좋았는데 이제는 그게 너무 싫어"라는 말이 나오는 관계입니다. 이 역설적인 끌림과 반발이 반복되면서 관계가 소모됩니다.`;
  return `두 사람은 서로 상대방이 왜 그런 행동을 하는지 이해하지 못합니다. 그 이해 불가능함이 시간이 지나면서 지침과 피로감으로 바뀝니다. 서로 노력하는데 왜 안 되지라는 막막함 속에서 관계가 흘러갑니다.`;
}

// ── 회피 가이드 ──────────────────────────────────────────────────
function buildAvoidanceGuide(_relationType: string, score: number, _chungNames: string[]) {
  const mindset = score >= 75
    ? `이 관계에서 상대를 바꾸려는 시도는 효과가 없습니다. 사주 구조는 변하지 않기 때문입니다. 대신, 충돌이 생기는 패턴을 인식하고, 그 패턴 안에서 내 반응을 다르게 할 수 있는지 집중하세요. 상대방을 이해하려는 에너지보다, 자신을 지키는 에너지에 집중하는 것이 현실적입니다.`
    : `이 관계에서 갈등을 완전히 없애는 것은 불가능합니다. 하지만 갈등이 생기는 상황을 미리 파악하고, 그 상황에서 어떻게 반응할지 준비해두면 충돌의 강도를 줄일 수 있습니다. 기대치를 현실적으로 낮추는 것이 관계를 오래 유지하는 핵심입니다.`;

  const tips = [
    `감정이 올라올 때 즉각 반응하지 말고, 최소 5분 간격을 두세요. 충돌 구조가 있는 관계에서는 즉각 반응이 거의 항상 상황을 악화시킵니다.`,
    `이 관계에서 상대를 이해시키려는 긴 대화는 역효과가 납니다. 핵심만 짧게 말하고, 상대가 받아들이든 말든 기다리는 연습을 하세요.`,
    `충돌이 생기는 특정 주제나 상황이 있을 겁니다. 그 주제를 대화에서 의도적으로 피하거나, 꼭 해야 한다면 감정이 안정된 상태에서만 하세요.`,
    `상대방이 나를 이해 못 해도 괜찮다는 내면의 기준을 만들어 두세요. 이 관계에서 완전한 이해는 불가능하지만, 그래도 관계를 유지할 수 있는 기준을 찾으세요.`,
    `혼자만의 시간과 공간을 의도적으로 확보하세요. 이 관계에서 소모된 에너지를 충전할 공간이 없으면 번아웃이 옵니다.`,
  ];

  const boundaries = score >= 75
    ? `이 관계에서 명확한 선이 없으면 반드시 소모됩니다. 갈등이 생길 때마다 참는 것이 아니라, 어디까지는 받아들이고 어디서부터는 단호하게 멈추는 기준을 미리 정해두세요. 그 선을 어기는 상황이 반복되면, 그것은 관계를 재고해야 한다는 신호입니다.`
    : `이 관계에서도 나만의 선이 필요합니다. 갈등이 반복되는 특정 패턴에서 내 반응 방식을 미리 정해두고, 그 방식을 일관되게 유지하세요. 상대방이 이해하든 말든, 내 선을 지키는 것이 장기적으로 이 관계를 덜 소모적으로 만듭니다.`;

  return { mindset, practicalTips: tips, boundaries };
}

// ── 개인 영향 (Phase 2) ──────────────────────────────────────────
function buildPersonalImpact(result: SajuResult, _relationType: string) {
  const score = result.toxicScore;

  const onMe = score >= 75
    ? `이 관계는 지금 당신의 에너지를 상당히 소모시키고 있습니다. 이 사람과 있거나, 만남 이후에 이유 없이 지치는 느낌이 든다면 그게 신호입니다. 상대방이 나쁜 사람이 아닌데 왜 이렇게 힘들지라는 의문이 드는 관계입니다. 충돌 구조가 강할수록 감정 소모가 크고, 장기적으로 자신감과 에너지 수준에 영향을 줍니다.`
    : `이 관계에서 반복되는 갈등 패턴이 당신에게 누적되고 있습니다. 한 번의 갈등이야 회복할 수 있지만, 같은 패턴이 반복되면 그 관계 자체에 대한 피로감이 쌓입니다. 지금 당장은 버틸 수 있어도, 나중을 위해 이 패턴을 인식하는 것이 중요합니다.`;

  const warningSignals = [
    `이 사람을 만나기 전에 괜히 긴장되거나, 만남이 부담스럽게 느껴지기 시작했다`,
    `갈등 후에 자기 자신이 잘못했나 과도하게 돌아보는 일이 많아졌다`,
    `이 관계에서 나다운 모습이 줄어들고, 상대방 눈치를 보는 일이 많아졌다`,
    `비슷한 갈등이 반복되면서 변하지 않는다는 무력감이 생겼다`,
    `이 사람과의 관계가 다른 생활 영역(일, 다른 관계)에도 영향을 주기 시작했다`,
  ];

  const whatYouLose = score >= 75
    ? `이 관계를 유지하면서 자신에게 쓸 에너지, 자신을 믿는 마음, 그리고 나다운 방식으로 사는 능력이 조금씩 줄어들 수 있습니다. 관계를 유지하는 비용이 얻는 것보다 커지는 시점이 오면, 그때는 진지하게 관계의 형태를 재고해야 합니다.`
    : `이 관계에서 반복되는 갈등이 계속되면, 상대방과의 관계에서 편안함을 느끼는 능력이 줄어들 수 있습니다. 갈등을 피하기 위해 자신을 억제하다 보면, 어느 순간 이 관계 안에서의 나는 나답지 않게 됩니다.`;

  return { onMe, warningSignals, whatYouLose };
}

// ── 지속 판단 (Phase 2) ──────────────────────────────────────────
function buildContinuationAssessment(result: SajuResult, _relationType: string, score: number) {
  const hasChung = result.conflicts.chung.length > 0;
  const hasGeuk = result.conflicts.geuk?.exists;

  const structuralAnalysis = `이 관계의 갈등 구조는 ${hasChung ? '충(沖) 에너지로 인해 근본적으로 반대 방향의 기운이 충돌합니다.' : hasGeuk ? '극(剋) 구조로 인해 한쪽이 다른 쪽을 억누르는 구조가 있습니다.' : '사주 오행 불일치로 인해 지속적인 긴장이 존재합니다.'} 이 구조는 두 사람이 아무리 노력해도 완전히 없어지지 않습니다. 노력으로 갈등의 강도를 줄일 수는 있지만, 근본적인 에너지 충돌 자체는 그대로입니다. 서로의 차이를 인정하고 갈등을 최소화하는 방식을 찾는 것이 현실적인 접근입니다.`;

  const whatItTakes = score >= 75
    ? `이 관계를 계속 이어가려면, 두 사람 모두 갈등 구조를 인식하고 의도적으로 다루는 노력이 필요합니다. 서로 충돌하는 상황을 미리 파악하고, 그 상황에서의 반응 방식을 사전에 약속하는 것이 도움이 됩니다. 어느 한쪽만 노력하는 구조로는 오래 유지되기 어렵습니다.`
    : `서로 갈등 패턴을 인식하고, 충돌이 생기는 상황에서 이전과 다르게 반응해보는 실험이 필요합니다. 완벽한 이해보다는, 서로의 차이를 있는 그대로 인정하는 성숙함이 이 관계의 핵심입니다.`;

  const redLine = `같은 갈등이 3번 이상 반복되는데도 두 사람 중 누구도 행동을 바꾸지 않는다면, 이 관계의 방향을 다시 생각해야 합니다. 한쪽만 계속 참고 맞춰가는 구조가 고착된다면, 그것도 관계를 재고해야 할 신호입니다. 이 관계 안에서 자기 자신을 완전히 잃어가는 느낌이 든다면, 그것이 가장 명확한 레드라인입니다.`;

  const verdict = score >= 80
    ? `사주 구조로 보면 이 관계는 유지하기 위해 매우 많은 에너지가 필요합니다. 계속 이어갈지는 선택이지만, 그 선택에는 구조적인 어려움을 받아들이겠다는 결심이 함께 있어야 합니다. 두 사람 모두의 의지와 구체적인 변화 없이는 같은 패턴이 반복됩니다.`
    : score >= 60
    ? `이 관계는 노력 여부에 따라 결과가 크게 달라집니다. 갈등 구조가 있지만 함께 인식하고 다루면 공존이 가능합니다. 단, 한쪽이 일방적으로 모든 걸 부담하는 구조는 장기적으로 지속되기 어렵습니다.`
    : `갈등 구조가 있지만, 서로 인식하고 노력하면 충분히 좋은 관계를 만들 수 있습니다. 갈등 자체보다 갈등을 어떻게 다루느냐가 이 관계의 핵심입니다.`;

  return { structuralAnalysis, whatItTakes, redLine, verdict };
}

// ── 역산 모드 (상대 없음) ────────────────────────────────────────
function buildMyCharacter(result: SajuResult) {
  const myBranch = result.myBranch;
  const myStem = result.myStem;

  const core = `당신의 사주 기질은 독특한 에너지 패턴을 갖고 있습니다. ${myStem}${myBranch}의 기운은 인간관계에서 특정 패턴을 반복하게 만드는 경향이 있습니다. 이 기운을 가진 사람은 자신만의 뚜렷한 방식으로 세상을 이해하고, 그 방식이 맞지 않는 상대와는 구조적으로 갈등이 생깁니다. 본인이 원하든 원하지 않든, 특정 유형의 사람과 반복적으로 부딪히는 이유가 여기에 있습니다.`;
  const strength = `이 기질의 강점은 자신만의 원칙과 방향이 뚜렷하다는 것입니다. 어떤 상황에서도 자신을 잃지 않는 힘이 있고, 한번 결심하면 끝까지 밀어붙이는 추진력이 있습니다.`;
  const shadow = `반면 이 기질은 자신의 방식을 타인에게도 기대하는 경향이 있습니다. 상대가 나와 다른 방식으로 반응하면 이해가 안 되거나, 답답함을 느끼는 경우가 많습니다. 이 그림자를 인식하는 것이 관계 개선의 첫 걸음입니다.`;

  return { core, strength, shadow };
}

// ── 위험 유형 ────────────────────────────────────────────────────
function buildDangerTypes(_result: SajuResult) {
  const type1 = {
    type: '통제형',
    years: '갑목(甲木), 경금(庚金) 기운이 강한 사람',
    whyDangerous: `이 유형은 자신의 방식과 기준이 매우 강해서, 관계에서도 주도권을 갖고 싶어합니다. 당신의 기운과 부딪히면 서로 자기 방식이 맞다는 충돌이 생기고, 어느 쪽도 양보하지 않는 구조가 됩니다. 겉으로는 강해 보이지만 관계 안에서 당신이 서서히 소모됩니다.`,
    realScenario: `처음엔 자신감 있고 능력 있어 보여서 끌립니다. 그런데 관계가 깊어질수록 상대의 기준에 맞춰야 한다는 압박이 생깁니다. "왜 이렇게 해야 해?"와 "내가 더 잘 알아"의 반복으로 관계가 지쳐갑니다.`,
  };

  const type2 = {
    type: '회피형',
    years: '임수(壬水), 계수(癸水) 기운이 강한 사람',
    whyDangerous: `이 유형은 직접적인 갈등을 피하고 불명확한 방식으로 감정을 표현합니다. 당신이 명확한 답을 원할 때 상대는 흐릿하게 대응해서, 관계가 답답하게 흐릅니다. 문제를 해결하려 해도 상대가 대화를 회피해서 계속 같은 자리를 맴돌게 됩니다.`,
    realScenario: `처음엔 부드럽고 갈등이 없어서 편안합니다. 그런데 시간이 지나면 상대의 진심이 무엇인지 파악이 안 됩니다. 나 혼자 에너지를 쏟는 느낌이 들고, 관계가 성장하지 않는다는 답답함이 생깁니다.`,
  };

  return [type1, type2];
}

function buildWarningPattern(_result: SajuResult): string {
  return `당신의 사주 기질 패턴에서 반복되는 갈등은, 상대방이 당신의 기대 방식대로 반응하지 않을 때 시작됩니다. 무의식적으로 상대방이 나처럼 느끼고, 나처럼 반응하길 기대하는 경향이 있습니다. 이 기대가 어긋날 때마다 실망과 갈등이 생깁니다. 이 패턴을 인식하는 것이 같은 갈등을 반복하지 않는 첫걸음입니다.`;
}

function buildMyAvoidanceGuide(_result: SajuResult) {
  return {
    mindset: `나의 갈등 기질을 인식하는 것 자체가 가장 강력한 변화입니다. 상대방이 문제인 경우도 있지만, 내가 반복적으로 같은 유형의 갈등을 경험한다면 내 기질이 작동하고 있다는 신호입니다. 상대를 바꾸려 하기보다, 내 반응 패턴을 먼저 들여다보세요.`,
    practicalTips: [
      `갈등이 생길 것 같은 상황에서, 즉각 반응하기 전에 "이건 내 사주 기질이 작동하는 건가?"라고 한 번 물어보세요.`,
      `상대방이 나와 다르게 행동할 때, 그게 나쁜 것이 아니라 그냥 다른 것일 수 있다는 가능성을 열어두세요.`,
      `에너지가 소모되는 관계 유형을 파악하고, 그 유형의 사람과는 의도적으로 거리를 조금 두는 것이 현명합니다.`,
      `갈등 후에 스스로를 탓하거나 상대를 탓하기 전에, "이 구조에서는 어쩔 수 없었다"는 인식을 먼저 해보세요.`,
      `나의 에너지를 채워주는 사람과의 관계에 더 많은 시간을 투자하세요. 소모적인 관계를 줄이는 것도 하나의 전략입니다.`,
    ],
    boundaries: `나를 반복적으로 지치게 만드는 관계에서는 선을 그어야 합니다. 이 선은 상대방을 거부하는 게 아니라, 나를 지키기 위한 것입니다. 어떤 상황이 반복되면 거리를 두겠다는 기준을 미리 정해두고, 그 기준이 어겨지면 의도적으로 거리를 만드세요.`,
  };
}

// ── 메인 생성 함수 ────────────────────────────────────────────────
export function generateLocalAnalysis(
  result: SajuResult,
  relationType: string,
  hasTarget: boolean,
): LocalAIAnalysis {
  const score = result.toxicScore;
  const chungs = result.conflicts.chung;
  const hyungs = result.conflicts.hyung;
  const haes = result.conflicts.hae;
  const geukDir = result.conflicts.geuk;
  const scoreLabel = score >= 80 ? '극도로 강한' : score >= 60 ? '상당한' : '중간 수준의';

  if (hasTarget) {
    return {
      toxicSummary: result.conflictType,
      coreConflict: {
        title: result.conflictType,
        description: buildCoreDesc(result, relationType, scoreLabel),
      },
      conflictAnalysis: {
        chung: chungs.length > 0 ? getChungAnalysis(chungs.map(c => c.name), result.analysis.chungAnalysis) : null,
        hyung: hyungs.length > 0 ? getHyungAnalysis(hyungs.map(h => h.name), result.analysis.hyungAnalysis) : null,
        hae: haes.length > 0 ? getHaeAnalysis(haes.map(h => h.name)) : null,
        geuk: geukDir?.exists ? getGeukAnalysis(geukDir.direction, result.analysis.geukAnalysis) : null,
      },
      emotionalPattern: buildEmotionalPattern(result, relationType),
      hiddenDynamic: buildHiddenDynamic(result),
      conflictScenarios: buildScenarios(result, relationType),
      triggerPoints: buildTriggers(result, relationType),
      relationSpecific: buildRelationSpecific(relationType, score, chungs.map(c => c.name)),
      realisticOutlook: buildOutlook(score, chungs.length > 0, hyungs.length > 0),
      energyDynamic: buildEnergyDynamic(result),
      avoidanceGuide: buildAvoidanceGuide(relationType, score, chungs.map(c => c.name)),
      personalImpact: buildPersonalImpact(result, relationType),
      continuationAssessment: buildContinuationAssessment(result, relationType, score),
    };
  }

  return {
    toxicSummary: result.conflictType || '내 갈등 기질',
    myCharacter: buildMyCharacter(result),
    hiddenDynamic: buildHiddenDynamic(result),
    conflictScenarios: buildScenarios(result, relationType),
    triggerPoints: buildTriggers(result, relationType),
    warningPattern: buildWarningPattern(result),
    avoidanceGuide: buildMyAvoidanceGuide(result),
    dangerTypes: buildDangerTypes(result),
  };
}
