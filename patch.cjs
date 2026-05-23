const fs = require('fs');

// 07d638e (마지막 클린 버전) 복원
const { execSync } = require('child_process');
execSync('git checkout 07d638e -- src/components/StepResult.tsx');

let src = fs.readFileSync('src/components/StepResult.tsx', 'utf8').replace(/\r\n/g, '\n');

// ══════════════════════════════════════════════════════
// PART A: 유료 구조 재설계
// ══════════════════════════════════════════════════════

// A1. expandedSections 상태 제거
src = src.replace(
  '  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());\n',
  ''
);

// A2. 유료 전환 상태 + 핸들러 교체
src = src.replace(
  `  // 유료 전환 — 섹션별 개별 결제
  const [unlockedSections, setUnlockedSections] = useState<Set<string>>(() => {
    try {
      return new Set(['s01','s02','s03','s04','s05'].filter(k => localStorage.getItem(\`toxic_unlocked_\${k}\`) === '1'));
    } catch { return new Set<string>(); }
  });
  const [activePaywallSection, setActivePaywallSection] = useState<string | null>(null);
  const [showFreeSuccess, setShowFreeSuccess] = useState(false);

  const ai: AIAnalysis = { ...aiPhase1, ...aiPhase2 };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const isOpen = (id: string) => expandedSections.has(id);
  const isUnlocked = (id: string) => unlockedSections.has(id);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleOpenPaywall = (sectionId: string) => {
    trackEvent('paywall_click', { section: sectionId });
    setActivePaywallSection(sectionId);
  };

  const handlePayment = (sectionId: string) => {
    trackEvent('paywall_pay', { price: PRICE_ALL, section: sectionId });
    setActivePaywallSection(null);
    setShowFreeSuccess(true);
    try { localStorage.setItem(\`toxic_unlocked_\${sectionId}\`, '1'); } catch {}
    setTimeout(() => {
      setShowFreeSuccess(false);
      setUnlockedSections(prev => new Set([...prev, sectionId]));
    }, 3200);
  };`,
  `  // 유료 전환 — 전체 단일 결제
  const [isAllUnlocked, setIsAllUnlocked] = useState(() => {
    try { return localStorage.getItem('toxic_unlocked_all') === '1'; } catch { return false; }
  });
  const [showPaywall, setShowPaywall] = useState(false);
  const [showFreeSuccess, setShowFreeSuccess] = useState(false);

  const ai: AIAnalysis = { ...aiPhase1, ...aiPhase2 };

  const isOpen = (_id: string) => true;
  const toggleSection = (_id: string) => {};

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleOpenPaywall = () => {
    trackEvent('paywall_click', { section: 'all' });
    setShowPaywall(true);
  };

  const handlePayment = () => {
    trackEvent('paywall_pay', { price: PRICE_ALL, section: 'all' });
    setShowPaywall(false);
    setShowFreeSuccess(true);
    try { localStorage.setItem('toxic_unlocked_all', '1'); } catch {}
    setTimeout(() => {
      setShowFreeSuccess(false);
      setIsAllUnlocked(true);
    }, 3200);
  };`
);

// A3. PaywallModal 렌더 교체
src = src.replace(
  `      {/* 결제 팝업 모달 */}
      {activePaywallSection && (
        <PaywallModal
          myName={myData.name || ''}
          conflictType={result.conflictType}
          onClose={() => setActivePaywallSection(null)}
          onPay={() => handlePayment(activePaywallSection)}
        />
      )}`,
  `      {/* 결제 팝업 모달 */}
      {showPaywall && (
        <PaywallModal
          myName={myData.name || ''}
          conflictType={result.conflictType}
          onClose={() => setShowPaywall(false)}
          onPay={handlePayment}
        />
      )}`
);

// A4. 하단 고정 CTA 바 + 결제 성공 오버레이 앞에 삽입
src = src.replace(
  '      {/* 결제 성공 오버레이 */}',
  `      {/* 하단 고정 CTA */}
      {!isAllUnlocked && !showPaywall && (
        <div className="fixed bottom-0 left-0 right-0 z-40"
          style={{ background: 'rgba(6,6,6,0.97)', borderTop: '1px solid rgba(255,45,85,0.25)' }}>
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[#444] text-[9px] tracking-[0.15em] uppercase">한 번 결제 · 평생 다시 보기</p>
              <p className="text-white text-xs font-bold font-sans-kr mt-0.5">
                <span className="text-[#555] line-through text-[10px] mr-1.5">₩9,900</span>
                ₩{PRICE_ALL.toLocaleString()}
              </p>
            </div>
            <button onClick={handleOpenPaywall}
              className="flex-shrink-0 px-5 py-2.5 text-white text-sm font-bold font-sans-kr tracking-wide"
              style={{ background: 'linear-gradient(90deg, #FF2D55 0%, #BF5AF2 100%)', boxShadow: '0 0 20px rgba(255,45,85,0.35)' }}>
              지금 전체 보기 →
            </button>
          </div>
        </div>
      )}

      {/* 결제 성공 오버레이 */}`
);

// A5. isUnlocked → isAllUnlocked, handleOpenPaywall 인자 제거
src = src.replace(/unlocked=\{isUnlocked\('[a-z0-9]+'\)\}/g, 'unlocked={isAllUnlocked}');
src = src.replace(/onUnlock=\{\(\) => handleOpenPaywall\('[a-z0-9]+'\)\}/g, 'onUnlock={handleOpenPaywall}');

// A6. isOpen gate 제거: {isOpen('sXX') && ( 줄 제거
src = src.replace(/[ \t]*\{isOpen\('[a-z0-9]+'\) && \(\n/g, '');
// isOpen gate 닫는 )} + ToggleBtn 줄 제거 ()} 줄 다음에 ToggleBtn 이 있는 패턴)
src = src.replace(/[ \t]*\)\}\n[ \t]*<ToggleBtn[^\n]+\n/g, '');
// 남은 ToggleBtn 제거
src = src.replace(/[ \t]*<ToggleBtn[^\n]+\n/g, '');

// A7. 본문 하단 패딩
src = src.replace(
  '<div className="animate-fade-in max-w-lg mx-auto px-4 py-8 space-y-4">',
  '<div className="animate-fade-in max-w-lg mx-auto px-4 py-8 space-y-4 pb-24">'
);

// ══════════════════════════════════════════════════════
// PART B: 5가지 Opus 개선
// ══════════════════════════════════════════════════════

// B1. CompletionReveal 컴포넌트 추가 (BlurredPreview 앞에)
const completionReveal = `
function CompletionReveal() {
  const areas = ['나와 안맞는 이유', '충돌 상황 분석', '실전 가이드', '관계 영향', '상대방 시선', '최종 판정'];
  return (
    <div className="border border-[#1e1e1e] bg-[#0D0D0D] px-4 py-3">
      <p className="text-[#333] text-[9px] uppercase tracking-widest mb-2.5">6개 영역 분석 완료</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {areas.map((area, i) => (
          <div key={i} className="flex items-center gap-1.5 animate-fade-in"
            style={{ animationDelay: \`\${i * 100}ms\`, animationFillMode: 'both', opacity: 0 }}>
            <span className="text-[#FF2D55] text-[9px]">✓</span>
            <span className="text-[#444] text-[10px] font-sans-kr">{area}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
`;
src = src.replace('\nfunction BlurredPreview(', completionReveal + '\nfunction BlurredPreview(');

// B2. BlurredPreview teaser prop 추가
// Fragment(<>) 로 감싸서 div 구조 변경 없이 teaser를 위에 노출
src = src.replace(
  `function BlurredPreview({ children, unlocked, onUnlock }: {
  children: React.ReactNode;
  unlocked: boolean;
  onUnlock: () => void;
}) {
  if (unlocked) return <>{children}</>;
  return (
    <div className="relative min-h-[140px]">`,
  `function BlurredPreview({ children, unlocked, onUnlock, teaser }: {
  children: React.ReactNode;
  unlocked: boolean;
  onUnlock: () => void;
  teaser?: string;
}) {
  if (unlocked) return <>{children}</>;
  return (
    <>
      {teaser && (
        <p className="text-[#555] text-[11px] pb-2 font-sans-kr border-l-2 border-[#FF2D55]/40 pl-3 ml-1 mb-1 italic">{teaser}</p>
      )}
      <div className="relative min-h-[140px]">`
);

// BlurredPreview 닫는 Fragment 추가
src = src.replace(
  `    </div>
  );
}

function LockIcon`,
  `    </div>
    </>
  );
}

function LockIcon`
);

// B3. PaywallModal AI 원가 추가
src = src.replace(
  '              <p className="font-sans-kr text-[#444] text-xs">전체 더보기 잠금 해제</p>',
  `              <p className="font-sans-kr text-[#444] text-xs">전체 더보기 잠금 해제</p>
              <p className="text-[#2a2a2a] text-[9px] font-sans-kr mt-0.5">AI 분석 원가 ₩380 — 시장검증 특가</p>`
);

// B4. 섹션별 teaser 추가
const teasers = [
  // hasTarget s01
  [
    '<BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall}>\n              <div className="space-y-3">\n                {(ai.conflictAnalysis',
    '<BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall} teaser="감정 반응 패턴 · 에너지 역학 · 숨겨진 역학이 잠겨있습니다">\n              <div className="space-y-3">\n                {(ai.conflictAnalysis'
  ],
  // hasTarget s02
  [
    '<BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall}>\n              <div className="space-y-3">\n                {ai.conflictScenarios && ai.conflictScenarios.slice(1).map',
    '<BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall} teaser="나머지 갈등 상황 · 갈등 트리거 · 관계별 특성이 잠겨있습니다">\n              <div className="space-y-3">\n                {ai.conflictScenarios && ai.conflictScenarios.slice(1).map'
  ],
  // hasTarget s03 (w/ avoidanceGuide.practicalTips)
  [
    '<BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall}>\n                <div className="space-y-3">\n                  <Card>\n                    <SubLabel text="실전 팁" />\n                    <div className="space-y-3">\n                      {ai.avoidanceGuide.practicalTips.map((tip, i) => (\n                        <div key={i} className="flex items-start gap-3">\n                          <span className="w-5 h-5 rounded-full border border-[#FF2D55]/40 text-[#FF2D55]',
    '<BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall} teaser="실전 팁 · 선긋기 · 현실적 전망이 잠겨있습니다">\n                <div className="space-y-3">\n                  <Card>\n                    <SubLabel text="실전 팁" />\n                    <div className="space-y-3">\n                      {ai.avoidanceGuide.practicalTips.map((tip, i) => (\n                        <div key={i} className="flex items-start gap-3">\n                          <span className="w-5 h-5 rounded-full border border-[#FF2D55]/40 text-[#FF2D55]'
  ],
  // hasTarget s04
  [
    '<BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall}>\n                <div className="space-y-3">\n                  {ai.personalImpact.warningSignals',
    '<BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall} teaser="이 관계가 나를 갉아먹는 신호 · 잃어가고 있는 것이 잠겨있습니다">\n                <div className="space-y-3">\n                  {ai.personalImpact.warningSignals'
  ],
  // hasTarget s05 — 상대 일간 teaser
  [
    '<BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall}>\n                <div className="space-y-3">\n                  <Card>\n                    <SubLabel text="상대방이 나 때문에',
    '<BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall} teaser={`${result.targetStem}일(日) 기준 — 상대가 혼자 나를 평가하는 방식이 잠겨있습니다`}>\n                <div className="space-y-3">\n                  <Card>\n                    <SubLabel text="상대방이 나 때문에'
  ],
  // hasTarget s06
  [
    '<BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall}>\n                <div className="space-y-3">\n                  <Card>\n                    <SubLabel text="구조적 분석"',
    '<BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall} teaser="구조적 분석 · 레드라인 · 관계 지속 가능성이 잠겨있습니다">\n                <div className="space-y-3">\n                  <Card>\n                    <SubLabel text="구조적 분석"'
  ],
  // !hasTarget s01
  [
    '<BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall}>\n              <div className="space-y-3">\n                {ai.dangerTypes',
    '<BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall} teaser="나의 위험 유형 · 숨겨진 패턴이 잠겨있습니다">\n              <div className="space-y-3">\n                {ai.dangerTypes'
  ],
  // !hasTarget s02
  [
    '<BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall}>\n              <div className="space-y-3">\n                {ai.conflictScenarios && ai.conflictScenarios.slice(1).map',
    '<BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall} teaser="추가 갈등 상황 · 갈등 트리거 · 반복 패턴이 잠겨있습니다">\n              <div className="space-y-3">\n                {ai.conflictScenarios && ai.conflictScenarios.slice(1).map'
  ],
];

for (const [from, to] of teasers) {
  if (src.includes(from)) {
    src = src.replace(from, to);
  } else {
    console.warn('⚠ teaser match failed:', from.slice(0, 80));
  }
}

// B5. CompletionReveal 렌더 삽입
src = src.replace(
  '      {/* 결제 성공 오버레이 */}\n      <FreeSuccessOverlay visible={showFreeSuccess} myName={myData.name || \'\'} />',
  `      {/* 결제 성공 오버레이 */}
      <FreeSuccessOverlay visible={showFreeSuccess} myName={myData.name || ''} />

      {/* 6개 영역 분석 완료 리빌 */}
      {!showLoading && <CompletionReveal />}`
);

// ── 저장 ──
fs.writeFileSync('src/components/StepResult.tsx', src, 'utf8');
console.log('\n✓ 저장 완료');

// ── 검증 ──
const v = fs.readFileSync('src/components/StepResult.tsx', 'utf8');
const checks = {
  'isAllUnlocked state': v.includes("localStorage.getItem('toxic_unlocked_all')"),
  'handleOpenPaywall no-arg': v.includes('const handleOpenPaywall = () => {'),
  '한 번 결제 평생 보기': v.includes('한 번 결제 · 평생 다시 보기'),
  'AI 원가': v.includes('AI 분석 원가 ₩380'),
  'CompletionReveal def': v.includes('function CompletionReveal'),
  'CompletionReveal render': v.includes('<CompletionReveal />'),
  'teaser prop (Fragment)': v.includes('<>') && v.includes('teaser?: string'),
  's05 targetStem': v.includes('result.targetStem') && v.includes('일(日)'),
  'pb-24': v.includes('pb-24'),
  'ToggleBtns removed': !v.includes('<ToggleBtn open='),
  'isUnlocked removed': !v.includes('isUnlocked('),
  'isOpen gates removed': !v.includes('{isOpen('),
  'teasers count': (v.match(/teaser=/g) || []).length,
};
console.log('\n=== 검증 결과 ===');
Object.entries(checks).forEach(([k, val]) => console.log(`${val ? '✓' : '✗'} ${k}`));
