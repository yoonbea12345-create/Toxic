import { useRef, useEffect, useState } from 'react';
import type { SajuResult, PersonData, RelationType } from '../utils/saju';
import { fetchAIPhase1, fetchAIPhase1b, fetchAIPhase2, fetchAIPhase3 } from '../utils/aiAnalysis';
import { generateLocalAnalysis } from '../utils/localAnalysis';
import { trackEvent, endSession } from '../utils/analytics';
import { loadHistory } from '../utils/history';
import ShareCard from './ShareCard';

interface StepResultProps {
  myData: PersonData;
  targetData: PersonData;
  relationType: RelationType;
  result: SajuResult;
  onReset: () => void;
  onResetTarget?: () => void;
  shareMode?: boolean;
  preloadedPhase1?: AIAnalysis | null;
  preloadedPhase2?: Partial<AIAnalysis> | null;
}

interface ConflictScenario {
  situation: string;
  whatHappens: string;
  whySaju: string;
}

interface DangerType {
  type: string;
  years?: string;
  whyDangerous: string;
  realScenario: string;
}

interface AvoidanceGuide {
  mindset: string;
  practicalTips: string[];
  boundaries: string;
}

interface PersonalImpact {
  onMe: string;
  warningSignals: string[];
  whatYouLose: string;
}

interface HowTheySeeMe {
  energyReading: string;
  whatIrritates: string;
  whatDrawsThem: string;
  theirPrivateVerdict: string;
  howTheyNeedMe: string;
}

interface ContinuationAssessment {
  structuralAnalysis: string;
  whatItTakes: string;
  redLine: string;
  verdict: string;
}

interface AIAnalysis {
  toxicSummary?: string;
  coreConflict?: { title: string; description: string };
  conflictAnalysis?: { chung?: string | null; hyung?: string | null; hae?: string | null; geuk?: string | null };
  conflictScenarios?: ConflictScenario[];
  emotionalPattern?: { myPattern: string; targetPattern: string; cycle: string };
  energyDynamic?: { whoLoses: string; drainMechanism: string; longTermEffect: string };
  relationSpecific?: string;
  triggerPoints?: string[];
  hiddenDynamic?: string;
  realisticOutlook?: string;
  avoidanceGuide?: AvoidanceGuide;
  personalImpact?: PersonalImpact;
  howTheySeeMe?: HowTheySeeMe;
  continuationAssessment?: ContinuationAssessment;
  myCharacter?: { core: string; strength: string; shadow: string };
  dangerTypes?: DangerType[];
  warningPattern?: string;
}

const LOADING_STEPS = [
  { pctStart: 0,  pctEnd: 20,  label: '사주 기본 정보 확인',    sub: '年柱 · 月柱 · 日柱 · 時柱',     hanja: '命' },
  { pctStart: 20, pctEnd: 40,  label: '충돌 구조 분석',          sub: '沖 · 刑 · 害 · 剋 계산',         hanja: '沖' },
  { pctStart: 40, pctEnd: 60,  label: '감정 패턴 해석',          sub: '두 사람의 기질 충돌 방식',        hanja: '氣' },
  { pctStart: 60, pctEnd: 80,  label: '갈등 시나리오 도출',      sub: '실제 터질 법한 상황 분석',        hanja: '刑' },
  { pctStart: 80, pctEnd: 100, label: '최종 분석 정리',          sub: '회피 전략 & 결론 도출',           hanja: '決' },
];

const SAJU_QUOTES = [
  '사주(四柱)는 당신의 운명이 아니라, 타고난 기질입니다.',
  '충(沖)이 있다고 나쁜 관계가 아닙니다. 갈등 방식이 다를 뿐입니다.',
  '일주(日柱)는 나의 진짜 자아를 담은 기둥입니다.',
  '갑목(甲木)은 대나무처럼 꺾여도 다시 일어납니다.',
  '자오충(子午沖)은 물과 불처럼 근본이 다른 충돌입니다.',
  '년주(年柱)는 내가 살아온 환경의 흔적입니다.',
  '사주에서 금(金) 기운이 강하면 원칙과 실행력이 뛰어납니다.',
  '해(害)는 겉으로 드러나지 않지만 서서히 에너지를 갉아먹습니다.',
  '월주(月柱)는 내가 사회에서 보여주는 얼굴입니다.',
  '토(土) 기운이 강하면 중심이 굳건하지만 고집이 셀 수 있습니다.',
  '형(刑)은 충보다 느리게, 하지만 더 깊이 관계를 압박합니다.',
  '수(水) 기운이 강하면 유연하고 통찰력이 뛰어납니다.',
  '시주(時柱)는 인생 후반부와 자녀 운을 담습니다.',
  '화(火) 기운이 강하면 열정적이고 표현력이 풍부합니다.',
  '합(合)이 있다고 항상 좋은 관계는 아닙니다.',
  '목(木) 기운이 강하면 성장과 생명력이 넘칩니다.',
  '극(剋)은 한쪽이 다른 쪽을 눌러도, 결국 양쪽 다 소모됩니다.',
  '사주 분석의 목적은 운명 알기가 아니라 나 알기입니다.',
  '겁재(劫財)가 강하면 경쟁심이 강하고 주도권 다툼이 잦습니다.',
  '인오술(寅午戌) 합은 강한 불의 기운을 만들어냅니다.',
  '독성지수는 나쁜 사람을 구별하는 지표가 아닙니다.',
  '신살(神殺)보다 일주의 힘이 관계 전체를 좌우합니다.',
  '사주는 당신이 어떤 상황에서 강해지는지를 알려줍니다.',
  '천간(天干)은 드러난 에너지, 지지(地支)는 숨겨진 에너지입니다.',
  '충이 많다고 불행하지 않습니다. 오히려 자극이 되기도 합니다.',
  '진술축미(辰戌丑未)는 토(土) 기운의 4가지 얼굴입니다.',
  '오행(五行) 중 부족한 기운이 인간관계에서 채워지기도 합니다.',
  '사주에서 수(水)가 없으면 유연성이 부족할 수 있습니다.',
  '합(合)이 충을 해소하기도 하지만, 더 복잡하게 만들기도 합니다.',
  '기질은 바꿀 수 없어도, 반응 방식은 바꿀 수 있습니다.',
  '비견(比肩)이 강하면 독립심이 강하고 자기 방식을 고집합니다.',
  '사해충(巳亥沖)은 이상과 현실이 충돌하는 구조입니다.',
  '사주는 갈등의 원인을 설명하지만, 해결책은 당신이 만듭니다.',
  '식신(食神)이 강하면 창의적이고 표현 욕구가 풍부합니다.',
  '인신충(寅申沖)은 자유와 규칙이 부딪히는 충돌입니다.',
  '공망(空亡)이 있으면 그 분야에서 예상치 못한 공백이 생깁니다.',
  '일간(日干)은 나 자신의 오행 에너지를 나타냅니다.',
  '묘유충(卯酉沖)은 감성과 현실이 충돌하는 구조입니다.',
  '사주에서 화(火)가 없으면 열정과 표현력이 부족할 수 있습니다.',
  '정재(正財)가 강하면 안정적이고 계획적인 성향입니다.',
  '축미충(丑未沖)은 같은 방향처럼 보이지만 실제로는 반대입니다.',
  '오행의 균형보다 기운 간의 흐름이 더 중요합니다.',
  '상관(傷官)이 강하면 창의적이지만 반항적 기질이 있습니다.',
  '진술충(辰戌沖)은 두 강한 토 기운이 방향을 놓고 충돌합니다.',
  '사주 분석은 미래를 예측하는 게 아니라, 패턴을 인식하는 겁니다.',
  '관살(官殺)이 강하면 책임감이 강하고 압박에 예민합니다.',
  '지지(地支) 충돌이 있어도 천간(天干) 합이 있으면 균형이 잡힙니다.',
  '편인(偏印)이 강하면 독창적이지만 외로움을 느끼기 쉽습니다.',
  '사주의 독성지수는 관계의 충돌 에너지를 수치화한 것입니다.',
  '가장 잘 맞는 사주는 없습니다. 어떤 충돌을 감당할 수 있는지가 중요합니다.',
  '음양(陰陽)의 균형이 깨지면 관계에서 항상 한쪽이 더 소모됩니다.',
];

function AILoadingScreen({ hasTarget, hasDateData, score, result, progress }: {
  hasTarget: boolean;
  hasDateData: boolean;
  score: number;
  result: SajuResult;
  progress: number;
}) {
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * SAJU_QUOTES.length));
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setQuoteIdx(i => (i + 1) % SAJU_QUOTES.length), 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const start = Date.now();
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(iv);
  }, []);

  const stepIdx = Math.min(
    Math.floor((progress / 100) * LOADING_STEPS.length),
    LOADING_STEPS.length - 1
  );
  const isDone = progress >= 100;

  const color  = score >= 80 ? '#FF2D55' : score >= 60 ? '#BF5AF2' : '#F59E0B';
  const color2 = score >= 80 ? '#BF5AF2' : score >= 60 ? '#FF2D55' : '#F59E0B';
  const step   = LOADING_STEPS[stepIdx];

  // SVG ring math
  const R = 86;
  const circumference = 2 * Math.PI * R;
  const strokeDash = (progress / 100) * circumference;

  // Glowing dot position at arc tip
  const tipAngle = (progress / 100) * 2 * Math.PI - Math.PI / 2;
  const tipX = 100 + R * Math.cos(tipAngle);
  const tipY = 100 + R * Math.sin(tipAngle);

  return (
    <div className="flex flex-col items-center px-4 pt-8 pb-12"
      style={{ background: '#131313', minHeight: 'calc(100vh - 100px)' }}>

      {/* Saju year cards — compact */}
      <div className="flex items-center gap-6 mb-10">
        <div className="flex flex-col items-center gap-2">
          <p className="text-[#bbb] text-sm font-bold tracking-[0.25em] uppercase">나</p>
          <div className="w-14 h-16 border border-[#252525] bg-[#080808] flex flex-col items-center justify-center px-2 py-2 gap-1">
            <span className="font-display text-xl leading-none" style={{ color }}>{result.myYear?.stem ?? '?'}</span>
            <span className="font-display text-xl leading-none text-[#666]">{result.myYear?.branch ?? '?'}</span>
          </div>
          <p className="text-[#555] text-[11px]">年</p>
        </div>

        {hasTarget && hasDateData && result.targetYear && (
          <>
            <div className="flex flex-col gap-1 items-center">
              <div className="w-px h-5 bg-[#2a2a2a]" />
              <span className="font-display text-base font-bold" style={{ color: `${color}99` }}>VS</span>
              <div className="w-px h-5 bg-[#2a2a2a]" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-[#bbb] text-sm font-bold tracking-[0.25em] uppercase">상대</p>
              <div className="w-14 h-16 border border-[#252525] bg-[#080808] flex flex-col items-center justify-center px-2 py-2 gap-1">
                <span className="font-display text-xl leading-none" style={{ color: color2 }}>{result.targetYear.stem}</span>
                <span className="font-display text-xl leading-none text-[#666]">{result.targetYear.branch}</span>
              </div>
              <p className="text-[#555] text-[11px]">年</p>
            </div>
          </>
        )}
      </div>

      {/* Circular ring */}
      <div className="relative mb-8" style={{ width: 200, height: 200 }}>
        {/* Ambient glow behind ring */}
        <div className="absolute inset-0 rounded-full ring-glow"
          style={{ background: `radial-gradient(circle, ${color}18 0%, transparent 70%)` }} />

        <svg width="200" height="200" viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="arc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={color2} />
            </linearGradient>
          </defs>

          {/* Subtle outer tick ring */}
          {Array.from({ length: 48 }).map((_, i) => {
            const a = (i / 48) * Math.PI * 2 - Math.PI / 2;
            const r1 = 96, r2 = 98;
            return (
              <line key={i}
                x1={100 + r1 * Math.cos(a)} y1={100 + r1 * Math.sin(a)}
                x2={100 + r2 * Math.cos(a)} y2={100 + r2 * Math.sin(a)}
                stroke={i % 4 === 0 ? '#222' : '#141414'} strokeWidth={i % 4 === 0 ? 1.5 : 1} />
            );
          })}

          {/* Track */}
          <circle cx="100" cy="100" r={R} fill="none" stroke="#111" strokeWidth="2.5" />

          {/* Progress arc */}
          <circle cx="100" cy="100" r={R} fill="none"
            stroke="url(#arc-grad)" strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
            transform="rotate(-90 100 100)"
            style={{
              transition: isDone ? 'stroke-dasharray 0.6s ease' : 'stroke-dasharray 0.15s linear',
            }}
          />

          {/* Glowing tip dot */}
          {progress > 3 && !isDone && (
            <circle cx={tipX} cy={tipY} r={4} fill={color}
              style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
          )}

          {/* Done checkmark circle */}
          {isDone && (
            <circle cx="100" cy="100" r={R} fill="none"
              stroke={color} strokeWidth="3" opacity="0.6" />
          )}
        </svg>

        {/* Center: percentage */}
        <div className="absolute inset-0 flex items-center justify-center select-none">
          {isDone ? (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="char-enter">
              <path d="M5 13l4 4L19 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <span className="font-sans font-bold leading-none" style={{ color, fontSize: '2.25rem' }}>
              {Math.round(progress)}<span style={{ fontSize: '1.25rem' }}>%</span>
            </span>
          )}
        </div>
      </div>

      {/* 진행중 표시 — 항상 살아있는 느낌 */}
      {!isDone && (
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex gap-1">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-1 h-1 rounded-full"
                style={{ background: color, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </span>
          <span className="text-xs tracking-[0.2em] uppercase font-semibold" style={{ color: `${color}cc` }}>
            분석 진행 중{elapsed > 0 ? ` · ${elapsed}초` : ''}
          </span>
        </div>
      )}

      {/* Status text */}
      <div className="text-center max-w-[280px]">
        <p key={step.label} className="text-white text-base font-semibold mb-2 char-enter">
          {isDone ? '분석 완료' : step.label}
        </p>
        <p className="text-[#aaa] text-sm leading-relaxed">
          {isDone ? '결과를 불러오는 중...' : step.sub}
        </p>

        {/* Step progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {LOADING_STEPS.map((_, i) => (
            <div key={i}
              className="h-px rounded-full transition-all duration-500"
              style={{
                width: i === stepIdx ? 20 : 8,
                background: i < stepIdx ? color : i === stepIdx ? color : '#1a1a1a',
                opacity: i > stepIdx ? 0.3 : 1,
              }}
            />
          ))}
        </div>
      </div>

      {/* 오래 걸릴 때 안내 */}
      {!isDone && elapsed >= 10 && (
        <div className="mt-4 px-5 py-3 border border-[#2a2a2a] bg-[#0e0e0e] max-w-[280px] text-center animate-fade-in">
          <p className="text-[#888] text-xs font-sans-kr leading-relaxed">
            {elapsed < 25
              ? '사주 데이터를 AI가 해석하고 있어요'
              : elapsed < 45
                ? '거의 다 됐어요. 조금만 더 기다려 주세요'
                : <>AI 분석이 조금 더 걸리고 있어요.<br /><span className="text-[#555]">({elapsed}초)</span></>
            }
          </p>
        </div>
      )}

      {/* Rotating saju quote */}
      {!isDone && (
        <div className="w-80 text-center px-4 mt-5">
          <p key={quoteIdx} className="char-enter" style={{ color: '#999', fontSize: '13px', lineHeight: '1.65' }}>
            {SAJU_QUOTES[quoteIdx]}
          </p>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}


function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-4 py-6 border-t border-white/[0.06]">
      <span className="font-display text-[#FF2D55]/40 text-4xl leading-none flex-shrink-0 mt-1">{number}</span>
      <div>
        <h3 className="font-display text-white text-xl leading-tight">{title}</h3>
        {subtitle && <p className="font-sans-kr text-[#555] text-xs mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

function SubLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-3 h-px bg-[#FF2D55]" />
      <p className="text-[#FF2D55] text-[10px] uppercase tracking-[0.25em] font-sans-kr">{text}</p>
    </div>
  );
}

function Card({ children, accent, className = '' }: { children: React.ReactNode; accent?: string; className?: string }) {
  return (
    <div
      className={`border border-[#1e1e1e] p-5 bg-[#0D0D0D] ${className}`}
      style={accent ? { borderLeftColor: accent, borderLeftWidth: 2 } : {}}
    >
      {children}
    </div>
  );
}

function CompletionReveal() {
  const areas = ['나와 안맞는 이유', '충돌 상황 분석', '실전 가이드', '관계 영향', '상대방 시선', '최종 판정'];
  return (
    <div className="border border-[#FF2D55]/25 bg-[#0D0D0D] px-4 py-4">
      <p className="text-[#FF2D55] text-xs font-bold tracking-wider mb-3 font-sans-kr">✓ 6개 영역 분석 완료</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {areas.map((area, i) => (
          <div key={i} className="flex items-center gap-2 animate-fade-in"
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both', opacity: 0 }}>
            <span className="text-[#FF2D55] text-xs font-bold flex-shrink-0">✓</span>
            <span className="text-[#e8e8e8] text-[13px] font-medium font-sans-kr">{area}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScrollHint() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible) return null;
  return (
    <div className="fixed bottom-36 right-3 z-30 flex flex-col items-center gap-1 pointer-events-none animate-fade-in">
      <span className="text-[#555] text-[9px] uppercase tracking-[0.25em] [writing-mode:vertical-rl] rotate-180">scroll</span>
      <div className="w-px h-8" style={{ background: 'linear-gradient(to bottom, transparent, #FF2D55)' }} />
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        style={{ color: '#FF2D55', animation: 'scroll-bounce 1.6s ease-in-out infinite' }}>
        <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <style>{`@keyframes scroll-bounce { 0%, 100% { transform: translateY(0); opacity: 1 } 50% { transform: translateY(4px); opacity: 0.5 } }`}</style>
    </div>
  );
}

function BlurredPreview({ children, unlocked, onUnlock, teaser }: {
  children: React.ReactNode;
  unlocked: boolean;
  onUnlock: () => void;
  teaser?: string;
}) {
  if (unlocked) return <>{children}</>;
  return (
    <>
      {teaser && (
        <p className="text-[#cfcfcf] text-[13px] leading-snug pb-2 font-sans-kr border-l-2 border-[#FF2D55]/70 pl-3 ml-1 mb-1 font-medium">{teaser}</p>
      )}
      <div className="relative min-h-[140px]" data-blur-wrapper="true">
      <div className="select-none pointer-events-none" data-blur-locked="true"
        style={{ filter: 'blur(3px)', opacity: 0.82 }}>
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 px-4">
        <div className="w-9 h-9 border border-[#FF2D55]/40 flex items-center justify-center"
          style={{ background: 'rgba(255,45,85,0.08)' }}>
          <LockIcon size={15} />
        </div>
        <button
          onClick={onUnlock}
          className="py-3.5 px-6 text-white font-bold text-sm tracking-wide relative overflow-hidden group font-sans-kr"
          style={{
            background: 'linear-gradient(90deg, #FF2D55 0%, #BF5AF2 100%)',
            boxShadow: '0 0 28px rgba(255,45,85,0.4)',
          }}
        >
          <span className="relative z-10 flex items-center gap-2">
            <LockIcon size={12} color="white" />
            ₩{PRICE_SECTION.toLocaleString()}으로 이 섹션 보기 →
          </span>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(255,255,255,0.07)' }} />
        </button>
      </div>
    </div>
    </>
  );
}


function DetailLoadingBanner({ name }: { name: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(iv);
  }, []);
  const TOTAL_SEC = 38;
  const pct = Math.min(Math.round((elapsed / TOTAL_SEC) * 100), 99);
  const remaining = Math.max(TOTAL_SEC - elapsed, 1);
  return (
    <div className="border border-[#FF2D55]/30 bg-[#0a0003] p-4 animate-fade-in">
      <p className="text-white text-sm font-bold mb-1 font-sans-kr">
        {name || '고객'}님 거의 다 왔어요!
      </p>
      <p className="text-[#888] text-xs mb-3 font-sans-kr leading-relaxed">
        상세 분석 생성 중이에요. 그 사이 위 섹션 먼저 읽어보세요 😅
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #FF2D55 0%, #BF5AF2 100%)' }} />
        </div>
        <span className="text-[#555] text-[10px] whitespace-nowrap font-sans-kr">{pct}% · ~{remaining}초</span>
      </div>
    </div>
  );
}

function SectionDetailPlaceholder() {
  return (
    <div className="space-y-3">
      <Card>
        <p className="text-[#888] text-sm leading-relaxed">사주 구조에서 비롯된 심층 갈등 패턴이 여기에 표시됩니다. AI가 두 사람의 일주 에너지를 분석하여 충돌이 발생하는 구체적인 상황과 감정 반응을 제공합니다.</p>
      </Card>
      <Card>
        <p className="text-[#888] text-sm leading-relaxed">오행 에너지가 실제 관계에서 어떻게 나타나는지 구체적인 대화체와 감정 묘사로 분석합니다. 어떤 말에 폭발하는지, 속으로 무슨 생각을 하는지까지.</p>
      </Card>
      <div className="border border-[#FF2D55]/20 p-5 bg-[#FF2D55]/5">
        <p className="text-[#aaa] text-sm leading-relaxed">사주 기반 관계 분석의 핵심 통찰이 이 영역에 포함됩니다. 결제 후 즉시 확인할 수 있습니다.</p>
      </div>
    </div>
  );
}

// ── 잠금 아이콘 SVG ─────────────────────────────────────────────────
function LockIcon({ size = 20, color = '#FF2D55' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="10" rx="1" stroke={color} strokeWidth="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="16" r="1.5" fill={color} />
    </svg>
  );
}

// ── 가격 상수 ─────────────────────────────────────────────────────────
const PRICE_SECTION = 700;
const PRICE_ALL = 2500;
const PRICE_ALL_ORIGINAL = 4200;

const FAQ_ITEMS: { q: string; a: React.ReactNode }[] = [
  {
    q: '2,500원을 결제하면 모든 관계와의 분석이 잠금해제 되나요?',
    a: '네 맞습니다. 결제한 기기로 24시간 동안은 모든 사용자님의 모든 관계의 분석에서 보이지 않던 부분이 잠금해제 됩니다.',
  },
  {
    q: '섹션 결제랑 묶음 결제가 무엇이 다른건가요?',
    a: '섹션 결제는 해당 개별 섹션에서 보이지 않던 부분만 잠금해제 됩니다. 묶음결제와 섹션 결제 모두 24시간 / 같은 기기 접속이라는 조건에서 유지됩니다.',
  },
  {
    q: '24시간이 지나면 어떻게 되나요?',
    a: '24시간이 지나면 잠금이 다시 설정됩니다. 재결제 시 동일하게 24시간 이용 가능합니다.',
  },
  {
    q: '결제 취소나 환불 문의는 어디서 하나요?',
    a: <>결제 취소 및 환불 관련 문의는{' '}
      <a href="https://open.kakao.com/o/swegKZwi" target="_blank" rel="noopener noreferrer"
        className="text-[#FF2D55] underline underline-offset-2">카카오톡 오픈채팅</a>
      에서 해주세요.
    </>,
  },
];

// ── 결제 팝업 모달 ───────────────────────────────────────────────────
function PaywallModal({ mode, targetName, onClose, onPaySection, onPayAll }: {
  conflictType: string;
  mode: 'all' | 'section';
  targetName: string;
  onClose: () => void;
  onPaySection: () => void;
  onPayAll: () => void;
}) {
  const isSection = mode === 'section';
  const [showFAQ, setShowFAQ] = useState(false);
  const nameLabel = targetName?.trim() ? `${targetName.trim()}님과의 관계를` : '당신의 관계를';

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center animate-fade-in"
        style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(4px)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* FAQ 버튼 — 모달 상단 중앙 */}
        <button
          onClick={e => { e.stopPropagation(); setShowFAQ(true); }}
          className="mb-3 text-[#555] text-[11px] font-sans-kr hover:text-[#888] transition-colors underline underline-offset-2">
          자주 묻는 질문
        </button>

        <div className="w-full max-w-sm relative max-h-[94vh] overflow-y-auto"
          style={{ background: '#0a0a0a', boxShadow: '0 -20px 60px rgba(255,45,85,0.18)' }}
          onClick={e => e.stopPropagation()}>

          {/* 상단 액센트 라인 */}
          <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #FF2D55 0%, #BF5AF2 100%)' }} />

          {/* 닫기 */}
          <button onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center text-[#666] hover:text-white text-xl transition-colors z-20">
            ✕
          </button>

          {/* ════════════════════════════════════════════════════
              ALL MODE — 전체 결제 단일
          ════════════════════════════════════════════════════ */}
          {!isSection && (
            <div className="px-6 pt-5 pb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#FF2D55]/35 rounded-full mb-3"
                style={{ background: 'rgba(255,45,85,0.06)' }}>
                <LockIcon size={11} />
                <span className="text-[10px] font-bold tracking-[0.15em] text-[#FF2D55] font-sans-kr">상세 분석 잠금</span>
              </div>

              <p className="text-[#999] text-[11px] font-bold tracking-[0.15em] uppercase font-sans-kr mb-3">24시간 무료 분석</p>

              <p className="font-display text-white leading-[1.05] mb-2"
                style={{ fontSize: 'clamp(1.6rem, 7vw, 2rem)' }}>
                {nameLabel}
              </p>
              <p className="font-display leading-[1.05] mb-5"
                style={{ fontSize: 'clamp(1.6rem, 7vw, 2rem)' }}>
                <span className="text-[#FF2D55]">완벽히 분석하세요</span>
              </p>

              <button onClick={onPayAll}
                className="w-full py-4 px-4 text-white font-sans-kr flex items-center justify-between hover:opacity-95 active:scale-[0.99] transition-all"
                style={{
                  background: 'linear-gradient(90deg, #FF2D55 0%, #BF5AF2 100%)',
                  boxShadow: '0 0 32px rgba(255,45,85,0.4)',
                }}>
                <div className="text-left">
                  <p className="text-white text-[13px] font-bold">6개 전체 해제</p>
                  <p className="text-white/75 text-[10px] mt-0.5">24시간 · 모든 관계 무제한</p>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-white/55 text-xs line-through">₩{PRICE_ALL_ORIGINAL.toLocaleString()}</span>
                  <span className="font-display text-2xl font-bold">₩{PRICE_ALL.toLocaleString()}</span>
                </div>
              </button>

              <div className="flex items-center justify-center gap-2.5 text-[#666] text-[10px] font-sans-kr mt-3">
                <span>즉시 해제</span>
                <span className="text-[#333]">·</span>
                <span>안전 결제</span>
                <span className="text-[#333]">·</span>
                <span>24시간 유효</span>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              SECTION MODE — CTA 2개
          ════════════════════════════════════════════════════ */}
          {isSection && (
            <div className="px-6 pt-5 pb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#FF2D55]/35 rounded-full mb-3"
                style={{ background: 'rgba(255,45,85,0.06)' }}>
                <LockIcon size={11} />
                <span className="text-[10px] font-bold tracking-[0.15em] text-[#FF2D55] font-sans-kr">상세 분석 잠금</span>
              </div>

              <p className="text-[#999] text-[11px] font-bold tracking-[0.15em] uppercase font-sans-kr mb-3">24시간 무료 분석</p>

              <p className="font-display text-white leading-[1.05] mb-2"
                style={{ fontSize: 'clamp(1.6rem, 7vw, 2rem)' }}>
                지금 보면
              </p>
              <p className="font-display leading-[1.05] mb-5"
                style={{ fontSize: 'clamp(1.6rem, 7vw, 2rem)' }}>
                <span className="text-[#FF2D55]">관계의 본질이 보입니다</span>
              </p>

              <button onClick={onPaySection}
                className="w-full py-3 px-4 mb-2 border border-[#FF2D55]/25 hover:border-[#FF2D55]/60 transition-colors font-sans-kr flex items-center justify-between"
                style={{ background: 'rgba(255,45,85,0.05)' }}>
                <div className="text-left">
                  <p className="text-white text-[13px] font-bold">이 섹션만 보기</p>
                  <p className="text-[#666] text-[10px] mt-0.5">24시간 · 이 영역 1개</p>
                </div>
                <span className="font-display text-white text-xl font-bold">₩{PRICE_SECTION.toLocaleString()}</span>
              </button>

              <button onClick={onPayAll}
                className="w-full py-3 px-4 text-white font-sans-kr flex items-center justify-between hover:opacity-95 active:scale-[0.99] transition-all"
                style={{
                  background: 'linear-gradient(90deg, #FF2D55 0%, #BF5AF2 100%)',
                  boxShadow: '0 0 28px rgba(255,45,85,0.35)',
                }}>
                <div className="text-left">
                  <p className="text-white text-[13px] font-bold">6개 전체 해제</p>
                  <p className="text-white/75 text-[10px] mt-0.5">24시간 · 모든 관계 무제한</p>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-white/55 text-xs line-through">₩{PRICE_ALL_ORIGINAL.toLocaleString()}</span>
                  <span className="font-display text-xl font-bold">₩{PRICE_ALL.toLocaleString()}</span>
                </div>
              </button>

              <div className="flex items-center justify-center gap-2.5 text-[#666] text-[10px] font-sans-kr mt-3">
                <span>즉시 해제</span>
                <span className="text-[#333]">·</span>
                <span>안전 결제</span>
                <span className="text-[#333]">·</span>
                <span>24시간 유효</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAQ 팝업 */}
      {showFAQ && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowFAQ(false)}>
          <div className="w-full max-w-sm relative max-h-[85vh] overflow-y-auto"
            style={{ background: '#0a0a0a', boxShadow: '0 -20px 60px rgba(255,45,85,0.15)' }}
            onClick={e => e.stopPropagation()}>
            <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #FF2D55 0%, #BF5AF2 100%)' }} />
            <button onClick={() => setShowFAQ(false)}
              className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center text-[#666] hover:text-white text-xl transition-colors">
              ✕
            </button>
            <div className="px-6 pt-5 pb-7">
              <p className="text-[#999] text-[10px] uppercase tracking-widest mb-6 font-sans-kr">자주 묻는 질문</p>
              <div className="space-y-6">
                {FAQ_ITEMS.map((item, i) => (
                  <div key={i}>
                    <p className="text-white text-[13px] font-bold font-sans-kr mb-2">Q. {item.q}</p>
                    <p className="text-[#777] text-[13px] leading-relaxed font-sans-kr">A. {item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


// ── 리뷰 팝업 ────────────────────────────────────────────────────────
function ReviewPopup({ onClose, onSubmit, submitted }: {
  onClose: () => void;
  onSubmit: (stars: number, text: string) => void;
  submitted: boolean;
}) {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm relative bg-[#0a0a0a]"
        style={{ boxShadow: '0 -20px 60px rgba(255,45,85,0.18)' }}
        onClick={e => e.stopPropagation()}>

        <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #FF2D55 0%, #BF5AF2 100%)' }} />

        <button onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center text-[#555] hover:text-white transition-colors text-xl z-10">
          ✕
        </button>

        {submitted ? (
          <div className="px-6 pt-8 pb-10 text-center">
            <p className="text-[#FF2D55] text-4xl mb-4">★</p>
            <p className="text-white font-bold text-lg mb-2 font-sans-kr">감사합니다!</p>
            <p className="text-[#555] text-sm font-sans-kr">소중한 후기가 서비스 개선에 큰 도움이 됩니다</p>
          </div>
        ) : (
          <div className="px-6 pt-5 pb-7">
            <p className="text-[#666] text-[10px] uppercase tracking-[0.2em] mb-1 font-sans-kr">분석 후기</p>
            <p className="font-display text-white text-xl leading-tight mb-1">이 분석이 도움됐나요?</p>
            <p className="text-[#444] text-xs mb-7 font-sans-kr">별점을 선택해주세요</p>

            <div className="flex justify-center gap-4 mb-6">
              {[1,2,3,4,5].map(n => (
                <button key={n}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setStars(n)}
                  className="transition-all duration-100 active:scale-90 select-none"
                  style={{
                    fontSize: '2.4rem',
                    color: n <= (hovered || stars) ? '#FF2D55' : '#1e1e1e',
                    filter: n <= (hovered || stars) ? 'drop-shadow(0 0 10px rgba(255,45,85,0.6))' : 'none',
                    transform: n <= (hovered || stars) ? 'scale(1.12)' : 'scale(1)',
                    lineHeight: 1,
                  }}>
                  ★
                </button>
              ))}
            </div>

            {stars > 0 && (
              <div className="animate-fade-in">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="어떤 점이 도움됐나요? (선택)"
                  className="w-full bg-[#111] border border-[#1e1e1e] text-white text-sm px-4 py-3 resize-none focus:outline-none focus:border-[#FF2D55]/40 mb-3 font-sans-kr"
                  rows={2}
                  maxLength={200}
                />
                <button onClick={() => onSubmit(stars, text)}
                  className="w-full py-3.5 text-white font-bold font-sans-kr tracking-wide"
                  style={{ background: 'linear-gradient(90deg, #FF2D55 0%, #BF5AF2 100%)', boxShadow: '0 0 24px rgba(255,45,85,0.35)' }}>
                  후기 남기기
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 잠금 해제 오버레이 ──────────────────────────────────────────────
function FreeSuccessOverlay({ visible, myName, onClose }: { visible: boolean; myName: string; onClose: () => void }) {
  if (!visible) return null;
  const name = myName || '고객';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.97)' }}
      onClick={onClose}>
      <div className="w-full max-w-xs text-center border border-[#FF2D55]/25 px-8 py-10 animate-fade-in relative"
        style={{ background: 'linear-gradient(160deg, #0E0003 0%, #0A0A0A 100%)' }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-[#555] hover:text-white transition-colors text-lg">
          ✕
        </button>
        <div className="w-16 h-16 border border-[#FF2D55]/40 flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(255,45,85,0.08)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#FF2D55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-[#FF2D55] text-[10px] uppercase tracking-[0.35em] mb-4 font-sans-kr">UNLOCK</p>
        <p className="text-white text-xl font-bold leading-snug mb-3 font-sans-kr">
          <span className="text-[#FF2D55]">{name}</span>님의<br />
          관계 분석<br />
          <span className="text-[#FF2D55]">완성!</span>
        </p>
        <p className="text-[#444] text-xs leading-relaxed font-sans-kr">모든 콘텐츠가 준비되었습니다</p>
        <div className="mt-5 w-full h-px bg-[#1a1a1a] overflow-hidden">
          <div className="h-full bg-[#FF2D55]"
            style={{ width: '100%', animation: 'progress-fill 2.8s linear forwards' }} />
        </div>
      </div>
      <style>{`
        @keyframes progress-fill {
          from { width: 0% }
          to { width: 100% }
        }
      `}</style>
    </div>
  );
}

// ───────────────────────────────────────────
// 메인 컴포넌트
// ───────────────────────────────────────────
export default function StepResult({ myData, targetData, result, relationType, onReset, onResetTarget, shareMode, preloadedPhase1, preloadedPhase2 }: StepResultProps) {
  const shareCardRef = useRef<HTMLDivElement>(null);
  const resultContainerRef = useRef<HTMLDivElement>(null);
  const [aiPhase1, setAiPhase1] = useState<AIAnalysis | null>(shareMode ? (preloadedPhase1 ?? null) : null);
  const [aiS01Detail, setAiS01Detail] = useState<Partial<AIAnalysis> | null>(null);
  // On-demand detail states — loaded only after payment
  const [aiDetail23, setAiDetail23] = useState<Partial<AIAnalysis> | null>(
    shareMode ? (preloadedPhase2 as Partial<AIAnalysis> ?? null) : null
  );
  const [aiDetail456, setAiDetail456] = useState<Partial<AIAnalysis> | null>(
    shareMode ? (preloadedPhase2 as Partial<AIAnalysis> ?? null) : null
  );
  const [detail23Loading, setDetail23Loading] = useState(false);
  const [detail456Loading, setDetail456Loading] = useState(false);
  const detail23LoadingRef = useRef(false);
  const detail456LoadingRef = useRef(false);
  const [, setApiDone] = useState(false);
  // apiProgress: 실제 API 스트림 진행 (0-100)
  // displayProgress: 사용자에게 보이는 진행 (0→80 빠르게, 80→100 천천히)
  const [apiProgress, setApiProgress] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const apiProgressRef = useRef(0);
  const [showLoading, setShowLoading] = useState(!shareMode);
  const [toast, setToast] = useState('');
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [recentHistory] = useState(() => loadHistory().slice(1, 4));

  // 유료 전환 — 섹션별 결제
  const [unlockedSections, setUnlockedSections] = useState<Set<string>>(() => {
    try {
      const now = Date.now();
      const allExp = Number(localStorage.getItem('toxic_unlocked_all') || 0);
      if (allExp > now) {
        return new Set(['s01', 's02', 's03', 's04', 's05', 's06']);
      }
      if (allExp > 0 && allExp <= now) localStorage.removeItem('toxic_unlocked_all');
      const s = new Set<string>();
      ['s01', 's02', 's03', 's04', 's05', 's06'].forEach(id => {
        const exp = Number(localStorage.getItem(`toxic_unlocked_${id}`) || 0);
        if (exp > now) s.add(id);
        else if (exp > 0) localStorage.removeItem(`toxic_unlocked_${id}`);
      });
      return s;
    } catch { return new Set(); }
  });
  const isAllUnlocked = unlockedSections.size >= 6;
  const [activeSection, setActiveSection] = useState<string>('s01');
  const [showPaywall, setShowPaywall] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [paywallMode, setPaywallMode] = useState<'all' | 'section'>('all');
  const [showFreeSuccess, setShowFreeSuccess] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);

  const ai: AIAnalysis = {
    ...aiPhase1,
    ...aiS01Detail,
    ...aiDetail23,
    ...aiDetail456,
    avoidanceGuide: {
      ...(aiPhase1?.avoidanceGuide),
      ...(aiDetail23?.avoidanceGuide),
    } as any,
    conflictScenarios: [
      ...(aiPhase1?.conflictScenarios ?? []),
      ...(aiDetail23?.conflictScenarios ?? []),
    ],
    personalImpact: {
      ...(aiS01Detail?.personalImpact),
      ...(aiDetail456?.personalImpact),
    } as any,
    howTheySeeMe: {
      ...(aiS01Detail?.howTheySeeMe),
      ...(aiDetail456?.howTheySeeMe),
    } as any,
    continuationAssessment: {
      ...(aiS01Detail?.continuationAssessment),
      ...(aiDetail456?.continuationAssessment),
    } as any,
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // 섹션 미리보기 잠금 → '섹션 + 전체 업셀' 모달
  const handleOpenPaywall = (sectionId: string) => {
    setActiveSection(sectionId);
    setPaywallMode('section');
    trackEvent('paywall_click', { section: sectionId, mode: 'section' });
    setShowPaywall(true);
  };

  // 하단 고정 CTA → '전체 결제 단일' 모달
  const handleOpenAllPaywall = () => {
    setPaywallMode('all');
    trackEvent('paywall_click', { section: 'all', mode: 'all' });
    setShowPaywall(true);
  };

  const UNLOCK_TTL_MS = 24 * 60 * 60 * 1000; // 24시간

  const triggerDetail23 = async () => {
    if (detail23LoadingRef.current || aiDetail23) return;
    detail23LoadingRef.current = true;
    setDetail23Loading(true);
    try {
      const data = await fetchAIPhase2(myData, targetData, relationType, result);
      setAiDetail23(data);
    } catch {
      // silent — placeholder remains visible
    } finally {
      detail23LoadingRef.current = false;
      setDetail23Loading(false);
    }
  };

  const triggerDetail456 = async () => {
    if (detail456LoadingRef.current || aiDetail456 || !hasTarget) return;
    detail456LoadingRef.current = true;
    setDetail456Loading(true);
    try {
      const data = await fetchAIPhase3(myData, targetData, relationType, result);
      setAiDetail456(data);
    } catch {
      // silent — placeholder remains visible
    } finally {
      detail456LoadingRef.current = false;
      setDetail456Loading(false);
    }
  };

  const handleUnlockSection = () => {
    trackEvent('paywall_pay', { price: PRICE_SECTION, section: activeSection, type: 'section' });
    setShowPaywall(false);
    setShowFreeSuccess(true);
    try { localStorage.setItem(`toxic_unlocked_${activeSection}`, String(Date.now() + UNLOCK_TTL_MS)); } catch {}
    if (activeSection === 's02' || activeSection === 's03') triggerDetail23();
    else if (activeSection === 's04' || activeSection === 's05' || activeSection === 's06') triggerDetail456();
    setTimeout(() => {
      setUnlockedSections(prev => new Set([...prev, activeSection]));
      setShowFreeSuccess(false);
    }, 3200);
  };

  const handleUnlockAll = () => {
    trackEvent('paywall_pay', { price: PRICE_ALL, type: 'all' });
    setShowPaywall(false);
    setShowFreeSuccess(true);
    try { localStorage.setItem('toxic_unlocked_all', String(Date.now() + UNLOCK_TTL_MS)); } catch {}
    triggerDetail23();
    if (hasTarget) triggerDetail456();
    setTimeout(() => {
      setUnlockedSections(new Set(['s01', 's02', 's03', 's04', 's05', 's06']));
      setShowFreeSuccess(false);
    }, 3200);
  };

  const hasTarget = Boolean(targetData.birthdate || targetData.name);
  const hasDateData = Boolean(targetData.birthdate);

  // MINT 방식 로딩: gap*coeff + 최소 floor → 수학적으로 절대 멈추지 않음
  useEffect(() => {
    if (shareMode) return;
    const startTime = Date.now();
    setDisplayProgress(4);

    const iv = setInterval(() => {
      if (apiProgressRef.current >= 100) {
        setDisplayProgress(100);
        return;
      }
      setDisplayProgress(prev => {
        if (prev >= 99) return prev;
        const elapsed = Date.now() - startTime;

        // Phase 1: 3.5초 안에 4→72% (ease-out 빠른 초반)
        if (elapsed < 3500 && prev < 72) {
          const t = elapsed / 3500;
          return Math.max(prev, 4 + (1 - Math.pow(1 - t, 2.2)) * 68);
        }

        // Phase 2: API 실제 진행 추적 + 최소 0.08/tick 보장 (절대 멈추지 않음)
        const apiTarget = apiProgressRef.current * 0.9;
        if (apiTarget > prev) {
          return prev + Math.min((apiTarget - prev) * 0.3, 3);
        }
        const gap = 93 - prev;
        return prev + Math.max(gap > 0 ? gap * 0.05 : 0, 0.08);
      });
    }, 250);

    return () => clearInterval(iv);
  }, []);

  // apiProgress → ref 동기화
  useEffect(() => { apiProgressRef.current = apiProgress; }, [apiProgress]);

  // Phase 1: 로딩 화면 중 실행 (최소 3초 보장)
  useEffect(() => {
    if (shareMode) return;
    const startedAt = Date.now();
    (async () => {
      try {
        const data = await fetchAIPhase1(myData, targetData, relationType, result, (pct) => {
          setApiProgress(pct);
          apiProgressRef.current = pct;
        });
        setAiPhase1(data);
        // Phase 1 완료 즉시 s01 상세 백그라운드 선제 생성 (결제 전에 미리 준비)
        fetchAIPhase1b(myData, targetData, relationType, result)
          .then(detail => { if (detail) setAiS01Detail(detail); })
          .catch(() => {});
      } catch {
        const localData = generateLocalAnalysis(result, relationType, hasTarget);
        setAiPhase1(localData as AIAnalysis);
      } finally {
        apiProgressRef.current = 100;
        setApiProgress(100);
        setApiDone(true);
        const elapsed = Date.now() - startedAt;
        const delay = Math.max(0, 3000 - elapsed) + 300;
        setTimeout(() => setShowLoading(false), delay);
      }
    })();
  }, []);

  // Phase 2+3 are on-demand (triggered on payment) — no auto-call

  const paywallImpressionFired = useRef(false);
  useEffect(() => {
    if (!showLoading && !paywallImpressionFired.current) {
      paywallImpressionFired.current = true;
      endSession();
      trackEvent('result_view', { toxicScore: result.toxicScore, relationType });
      trackEvent('paywall_impression');
    }
  }, [showLoading]);

  // 45초 체류 + 스크롤 30% 이상 시 리뷰 팝업
  useEffect(() => {
    if (showLoading || reviewSubmitted || shareMode) return;
    try { if (sessionStorage.getItem('toxic_review_shown')) return; } catch {}

    let timerFired = false;
    let scrollFired = false;

    const doShow = () => {
      if (!timerFired || !scrollFired) return;
      try { sessionStorage.setItem('toxic_review_shown', '1'); } catch {}
      setShowReviewPopup(true);
      trackEvent('review_popup_shown');
    };

    const timer = setTimeout(() => { timerFired = true; doShow(); }, 45000);

    const onScroll = () => {
      if (scrollFired) return;
      const el = document.documentElement;
      const pct = (el.scrollTop + el.clientHeight) / el.scrollHeight;
      if (pct >= 0.3) {
        scrollFired = true;
        window.removeEventListener('scroll', onScroll);
        doShow();
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [showLoading, reviewSubmitted]);

  if (showLoading) {
    return <AILoadingScreen hasTarget={hasTarget} hasDateData={hasDateData} score={result.toxicScore} result={result} progress={displayProgress} />;
  }

  const handleKakaoImageShare = async () => {
    if (!resultContainerRef.current) return;
    trackEvent('share', { method: 'kakao_image' });
    try {
      const { default: html2canvas } = await import('html2canvas');
      const el = resultContainerRef.current;

      // 스크롤 위치 무관하게 전체 캡쳐: 엘리먼트 최상단으로 이동 후 복원
      const savedScrollY = window.scrollY;
      window.scrollTo({ top: el.offsetTop, behavior: 'instant' as ScrollBehavior });
      await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));

      const canvas = await html2canvas(el, {
        backgroundColor: '#0A0A0A',
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: el.offsetWidth,
        height: el.scrollHeight,
        windowWidth: window.innerWidth,
        windowHeight: el.scrollHeight,
        onclone: (doc, clonedEl) => {
          clonedEl.querySelectorAll('[data-blur-wrapper="true"]').forEach(node => {
            const wrapper = node as HTMLElement;
            const locked = wrapper.querySelector('[data-blur-locked="true"]') as HTMLElement | null;
            if (locked) {
              locked.innerHTML = '';
              locked.style.filter = 'none';
              locked.style.background = '#0f0f0f';
              locked.style.minHeight = '80px';
            }
          });
          doc.querySelectorAll('.fixed').forEach(node => {
            (node as HTMLElement).style.display = 'none';
          });
        },
      });

      window.scrollTo({ top: savedScrollY, behavior: 'instant' as ScrollBehavior });

      // toBlob을 Promise로 래핑 — user activation 컨텍스트 유지
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) { showToast('이미지 변환 실패'); return; }
      showToast('캡쳐완료!');
      const file = new File([blob], 'toxic-result.png', { type: 'image/png' });
      try {
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: 'TOXIC 분석 결과' });
        } else {
          const link = document.createElement('a');
          link.download = 'toxic-result.png';
          link.href = URL.createObjectURL(blob);
          link.click();
        }
      } catch (shareErr: any) {
        if (shareErr?.name !== 'AbortError') showToast('공유에 실패했습니다');
      }
    } catch (err: any) {
      console.error('[capture]', err);
      showToast(`캡쳐 실패: ${err?.message ?? '알 수 없는 오류'}`);
    }
  };

  const handleInstallApp = async () => {
    trackEvent('share', { method: 'install' });
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    const prompt = (window as any).__installPrompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        showToast('홈 화면에 추가되었습니다');
        (window as any).__installPrompt = null;
      }
    } else {
      showToast('브라우저 주소창 오른쪽 설치 버튼을 눌러주세요');
    }
  };



  const handleSubmitReview = async (stars = reviewStars, text = reviewText) => {
    if (stars === 0) return;
    trackEvent('review_submit', { stars, relationType, score: result.toxicScore });
    try {
      const reviewRes = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars, comment: text, relationType, score: result.toxicScore }),
      });
      if (!reviewRes.ok) throw new Error(`HTTP ${reviewRes.status}`);
      try {
        const raw = localStorage.getItem('toxic_user_reviews');
        const list = raw ? JSON.parse(raw) : [];
        list.push({ stars, comment: text, ts: Date.now() });
        localStorage.setItem('toxic_user_reviews', JSON.stringify(list.slice(-50)));
      } catch {}
      setReviewSubmitted(true);
      setReviewStars(stars);
      setReviewText(text);
      showToast('후기 감사합니다!');
    } catch {
      showToast('전송 실패 — 다시 시도해 주세요');
    }
  };

  return (
    <>
    {showIOSGuide && (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center" onClick={() => setShowIOSGuide(false)}>
        <div className="bg-[#111] border border-[#222] px-6 pt-6 pb-10 w-full max-w-lg rounded-t-2xl" onClick={e => e.stopPropagation()}>
          <p className="text-white font-bold text-base mb-1">홈 화면에 추가하기</p>
          <p className="text-[#555] text-xs mb-5">앱처럼 바로 실행할 수 있습니다</p>
          <ol className="space-y-4 text-sm text-[#aaa]">
            <li className="flex gap-3 items-start">
              <span className="text-[#FF2D55] font-bold shrink-0">1</span>
              <span>하단 메뉴바의 <span className="text-white">공유 버튼 ↑</span> 을 탭하세요</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-[#FF2D55] font-bold shrink-0">2</span>
              <span>스크롤해서 <span className="text-white">홈 화면에 추가</span> 를 선택하세요</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-[#FF2D55] font-bold shrink-0">3</span>
              <span>오른쪽 위 <span className="text-white">추가</span> 를 탭하면 완료!</span>
            </li>
          </ol>
          <button onClick={() => setShowIOSGuide(false)}
            className="mt-6 w-full py-3 bg-[#FF2D55] text-white font-bold text-sm">
            확인
          </button>
        </div>
      </div>
    )}
    <div ref={resultContainerRef} className="animate-fade-in max-w-lg mx-auto px-4 pt-3 pb-24 space-y-4">

      {/* 결제 팝업 모달 */}
      {showPaywall && (
        <PaywallModal
          conflictType={result.conflictType}
          mode={paywallMode}
          targetName={targetData?.name || ''}
          onClose={() => setShowPaywall(false)}
          onPaySection={handleUnlockSection}
          onPayAll={handleUnlockAll}
        />
      )}

      {/* 하단 고정 결제 CTA */}
      {!isAllUnlocked && !showPaywall && (
        <div className="fixed bottom-0 left-0 right-0 z-40"
          style={{ background: 'rgba(6,6,6,0.97)', borderTop: '1px solid rgba(255,45,85,0.25)' }}>
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[#FF2D55] text-[11px] font-bold tracking-wide font-sans-kr">24시간 모든 관계 6개 영역 잠금 해제</p>
              <p className="text-white text-xs font-bold font-sans-kr mt-0.5">
                6개 전체
                <span className="text-[#555] line-through text-[10px] mx-1.5">₩{PRICE_ALL_ORIGINAL.toLocaleString()}</span>
                <span className="text-[#FF2D55]">₩{PRICE_ALL.toLocaleString()}</span>
              </p>
            </div>
            <button onClick={handleOpenAllPaywall}
              className="flex-shrink-0 px-5 py-2.5 text-white text-sm font-bold font-sans-kr tracking-wide"
              style={{ background: 'linear-gradient(90deg, #FF2D55 0%, #BF5AF2 100%)', boxShadow: '0 0 20px rgba(255,45,85,0.35)' }}>
              지금 전체 보기 →
            </button>
          </div>
        </div>
      )}

      {/* 결제 성공 오버레이 */}
      <FreeSuccessOverlay visible={showFreeSuccess} myName={myData.name || ''} onClose={() => setShowFreeSuccess(false)} />

      {/* 리뷰 팝업 (20초 체류 후) */}
      {showReviewPopup && (
        <ReviewPopup
          submitted={reviewSubmitted}
          onClose={() => setShowReviewPopup(false)}
          onSubmit={async (stars, text) => {
            await handleSubmitReview(stars, text);
            setTimeout(() => setShowReviewPopup(false), 2000);
          }}
        />
      )}

      {/* 6개 영역 분석 완료 리빌 */}
      {!showLoading && <CompletionReveal />}

      {/* 토스트 알림 */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1a] border border-[#FF2D55]/40 text-white text-sm px-5 py-3 animate-fade-in whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* 스크롤 유도 화살표 — 좌측 floating */}
      <ScrollHint />

      {/* ── 상단 액션 버튼 3개 ── */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={handleKakaoImageShare}
          className="py-2 text-[#3C1E1E] text-[10px] font-bold font-sans-kr hover:opacity-90 active:scale-[0.98] transition-all leading-tight text-center"
          style={{ background: '#FEE500' }}>
          카톡으로<br />결과 공유
        </button>
        <button onClick={handleInstallApp}
          className="py-2 border border-[#0A84FF]/40 text-[#0A84FF] text-[10px] font-sans-kr hover:border-[#0A84FF]/80 hover:bg-[#0A84FF]/10 transition-colors leading-tight text-center">
          앱으로<br />설치
        </button>
        <button onClick={() => setShowShareCard(true)}
          className="py-2 border border-[#FF2D55]/40 text-[#FF2D55] text-[10px] font-sans-kr hover:border-[#FF2D55]/80 hover:bg-[#FF2D55]/10 transition-colors leading-tight text-center">
          Toxic<br />총정리
        </button>
      </div>

      {/* Toxic 총정리 팝업 */}
      {showShareCard && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowShareCard(false)}>
          <div className="w-full max-w-sm relative max-h-[90vh] overflow-y-auto"
            style={{ background: '#0a0a0a' }}
            onClick={e => e.stopPropagation()}>
            <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #FF2D55 0%, #BF5AF2 100%)' }} />
            <button onClick={() => setShowShareCard(false)}
              className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center text-[#666] hover:text-white text-xl transition-colors z-10">
              ✕
            </button>
            <div className="px-4 pt-5 pb-6">
              <p className="text-[#555] text-[10px] uppercase tracking-[0.25em] mb-4 font-sans-kr">Toxic 총정리</p>
              <ShareCard ref={shareCardRef} myName={myData.name} result={result} />
            </div>
          </div>
        </div>
      )}


      {/* ══════════════════════════════════════
          결과 (상대 있을 때)
      ══════════════════════════════════════ */}
      {hasTarget && (
        <div className="space-y-2">

          {/* ════ 01 나와 안맞는 이유 ════ */}
          <SectionHeader number="01" title="나와 안맞는 이유" subtitle="사주 구조에서 비롯된 근본적인 충돌 원인" />

          <Card accent="#FF2D55">
            <SubLabel text="핵심 갈등 구조" />
            {ai.coreConflict ? (
              <>
                <p className="text-white text-base font-bold mb-3">{ai.coreConflict.title}</p>
                <p className="text-[#888] text-sm leading-relaxed">{ai.coreConflict.description}</p>
              </>
            ) : (
              <>
                <p className="text-white text-base font-bold mb-3">{result.conflictType}</p>
                <p className="text-[#888] text-sm leading-relaxed">{result.conflictSummary}</p>
              </>
            )}
          </Card>

            <BlurredPreview unlocked={unlockedSections.has('s01')} onUnlock={() => handleOpenPaywall('s01')} teaser="감정 반응 패턴 · 에너지 역학 · 숨겨진 역학이 잠겨있습니다">
              <div className="space-y-3">
                {(ai.conflictAnalysis?.chung || ai.conflictAnalysis?.hyung ||
                  ai.conflictAnalysis?.geuk ||
                  result.analysis.chungAnalysis || result.analysis.hyungAnalysis) && (
                  <Card>
                    <SubLabel text="사주 충돌 분석" />
                    <div className="space-y-4">
                      {(ai.conflictAnalysis?.chung || result.analysis.chungAnalysis) && (
                        <div>
                          <span className="text-[10px] border border-[#FF2D55]/40 text-[#FF2D55] px-2 py-0.5 inline-block mb-2">충(沖)</span>
                          <p className="text-[#888] text-sm leading-relaxed">{ai.conflictAnalysis?.chung || result.analysis.chungAnalysis}</p>
                        </div>
                      )}
                      {(ai.conflictAnalysis?.hyung || result.analysis.hyungAnalysis) && (
                        <div className="border-t border-[#1a1a1a] pt-4">
                          <span className="text-[10px] border border-[#BF5AF2]/40 text-[#BF5AF2] px-2 py-0.5 inline-block mb-2">형(刑)</span>
                          <p className="text-[#888] text-sm leading-relaxed">{ai.conflictAnalysis?.hyung || result.analysis.hyungAnalysis}</p>
                        </div>
                      )}
                      {(ai.conflictAnalysis?.geuk || result.analysis.geukAnalysis) && (
                        <div className="border-t border-[#1a1a1a] pt-4">
                          <span className="text-[10px] border border-[#FF2D55]/40 text-[#FF2D55] px-2 py-0.5 inline-block mb-2">극(剋)</span>
                          <p className="text-[#888] text-sm leading-relaxed">{ai.conflictAnalysis?.geuk || result.analysis.geukAnalysis}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {ai.emotionalPattern ? (
                  <Card>
                    <SubLabel text="감정 반응 패턴" />
                    <div className="space-y-4">
                      <div>
                        <p className="text-[#555] text-[11px] mb-1.5">나의 반응 방식</p>
                        <p className="text-[#888] text-sm leading-relaxed">{ai.emotionalPattern.myPattern}</p>
                      </div>
                      <div className="border-t border-[#1a1a1a] pt-4">
                        <p className="text-[#555] text-[11px] mb-1.5">상대의 반응 방식</p>
                        <p className="text-[#888] text-sm leading-relaxed">{ai.emotionalPattern.targetPattern}</p>
                      </div>
                      <div className="border-t border-[#1a1a1a] pt-4 bg-[#FF2D55]/5 -mx-5 px-5 py-4 -mb-5">
                        <p className="text-[#555] text-[11px] mb-1.5">반복되는 사이클</p>
                        <p className="text-[#aaa] text-sm leading-relaxed">{ai.emotionalPattern.cycle}</p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card>
                    <SubLabel text="감정 반응 패턴" />
                    <p className="text-[#888] text-sm leading-relaxed">{result.conflictSummary}</p>
                  </Card>
                )}

                {ai.energyDynamic && (
                  <Card accent="#BF5AF2">
                    <SubLabel text="에너지 역학" />
                    <div className="space-y-3">
                      <div>
                        <p className="text-[#555] text-[11px] mb-1">누가 더 소모되나</p>
                        <p className="text-[#888] text-sm leading-relaxed">{ai.energyDynamic.whoLoses}</p>
                      </div>
                      <div className="border-t border-[#1a1a1a] pt-3">
                        <p className="text-[#555] text-[11px] mb-1">소모 방식</p>
                        <p className="text-[#888] text-sm leading-relaxed">{ai.energyDynamic.drainMechanism}</p>
                      </div>
                      <div className="border-t border-[#1a1a1a] pt-3">
                        <p className="text-[#555] text-[11px] mb-1">장기 전망</p>
                        <p className="text-[#aaa] text-sm leading-relaxed">{ai.energyDynamic.longTermEffect}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {ai.hiddenDynamic && (
                  <div className="border border-[#FF2D55]/20 p-5 bg-[#FF2D55]/5">
                    <SubLabel text="숨겨진 역학" />
                    <p className="text-[#aaa] text-sm leading-relaxed">{ai.hiddenDynamic}</p>
                  </div>
                )}
              </div>
            </BlurredPreview>

          {/* ════ 02 어떤 상황에서 안맞는지 ════ */}
          <SectionHeader number="02" title="어떤 상황에서 안맞는지" subtitle="실제로 충돌이 터지는 구체적 시나리오" />

          {ai.conflictScenarios && ai.conflictScenarios.length > 0 ? (
            <Card>
              <div className="flex items-start gap-3">
                <span className="text-[#FF2D55] font-display text-2xl leading-none mt-0.5 flex-shrink-0">1</span>
                <div>
                  <p className="text-white text-sm font-bold mb-2">{ai.conflictScenarios[0].situation}</p>
                  <p className="text-[#777] text-xs leading-relaxed mb-3">{ai.conflictScenarios[0].whatHappens}</p>
                  <div className="border-t border-[#1a1a1a] pt-2">
                    <p className="text-[#FF2D55]/60 text-[11px]">사주 구조 → {ai.conflictScenarios[0].whySaju}</p>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <SubLabel text="충돌 상황" />
              <p className="text-[#888] text-sm leading-relaxed">{result.conflictSummary}</p>
            </Card>
          )}

            {unlockedSections.has('s02') && detail23Loading ? (
              <DetailLoadingBanner name={myData.name} />
            ) : (
              <BlurredPreview unlocked={unlockedSections.has('s02')} onUnlock={() => handleOpenPaywall('s02')} teaser="나머지 갈등 상황 · 갈등 트리거 · 관계별 특성이 잠겨있습니다">
                {aiDetail23 ? (
                  <div className="space-y-3">
                    {ai.conflictScenarios && ai.conflictScenarios.slice(1).map((s, i) => (
                      <Card key={i}>
                        <div className="flex items-start gap-3">
                          <span className="text-[#FF2D55] font-display text-2xl leading-none mt-0.5 flex-shrink-0">{i + 2}</span>
                          <div>
                            <p className="text-white text-sm font-bold mb-2">{s.situation}</p>
                            <p className="text-[#777] text-xs leading-relaxed mb-3">{s.whatHappens}</p>
                            <div className="border-t border-[#1a1a1a] pt-2">
                              <p className="text-[#FF2D55]/60 text-[11px]">사주 구조 → {s.whySaju}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {ai.triggerPoints && ai.triggerPoints.length > 0 && (
                      <Card>
                        <SubLabel text="갈등 트리거" />
                        <div className="space-y-2">
                          {ai.triggerPoints.map((t, i) => (
                            <div key={i} className="flex items-start gap-3 py-2 border-b border-[#1a1a1a] last:border-0">
                              <span className="text-[#FF2D55] text-xs mt-0.5 flex-shrink-0">▸</span>
                              <p className="text-[#888] text-sm">{t}</p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                    {ai.relationSpecific && (
                      <Card>
                        <SubLabel text={`${relationType} 관계에서 특히`} />
                        <p className="text-[#888] text-sm leading-relaxed">{ai.relationSpecific}</p>
                      </Card>
                    )}
                  </div>
                ) : (
                  <SectionDetailPlaceholder />
                )}
              </BlurredPreview>
            )}

          {/* ════ 03 앞으로 이렇게 해보세요 ════ */}
          <SectionHeader number="03" title="앞으로 이렇게 해보세요" subtitle="상황별 실전 가이드 · 선긋기 · 현실적 전망" />

          {ai.avoidanceGuide?.mindset ? (
            <Card accent="#FF2D55">
              <SubLabel text="마음가짐" />
              <p className="text-[#888] text-sm leading-relaxed">{ai.avoidanceGuide.mindset}</p>
            </Card>
          ) : (
            <Card accent="#FF2D55">
              <SubLabel text="현실적 가이드" />
              <p className="text-[#888] text-sm leading-relaxed">
                이 관계의 충돌 구조는 구조적입니다. 상대를 바꾸려 하기보다, 충돌이 일어나는 상황 자체를 피하고 기대치를 조정하는 것이 현실적입니다.
              </p>
            </Card>
          )}

            {unlockedSections.has('s03') && detail23Loading ? (
              <DetailLoadingBanner name={myData.name} />
            ) : (
              <BlurredPreview unlocked={unlockedSections.has('s03')} onUnlock={() => handleOpenPaywall('s03')} teaser="실전 팁 · 선긋기 · 현실적 전망이 잠겨있습니다">
                {aiDetail23?.avoidanceGuide?.practicalTips ? (
                  <div className="space-y-3">
                    <Card>
                      <SubLabel text="실전 팁" />
                      <div className="space-y-3">
                        {ai.avoidanceGuide!.practicalTips!.map((tip, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full border border-[#FF2D55]/40 text-[#FF2D55] text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-[#888] text-sm leading-relaxed">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                    <Card>
                      <SubLabel text="선긋기" />
                      <p className="text-[#888] text-sm leading-relaxed">{ai.avoidanceGuide!.boundaries}</p>
                    </Card>
                    {ai.realisticOutlook && (
                      <div className="border border-[#FF2D55]/20 p-5 bg-[#FF2D55]/5">
                        <SubLabel text="현실적 전망" />
                        <p className="text-[#aaa] text-sm leading-relaxed">{ai.realisticOutlook}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <SectionDetailPlaceholder />
                )}
              </BlurredPreview>
            )}

          {/* ════ 04 이 관계가 나에게 주는 영향 ════ */}
          <SectionHeader number="04" title="이 관계가 나에게 주는 영향" subtitle="지금 이 관계가 나에게 하고 있는 것" />

          {ai.personalImpact?.onMe ? (
            <Card accent="#BF5AF2">
              <SubLabel text="지금 나에게 미치는 영향" />
              <p className="text-[#888] text-sm leading-relaxed">{ai.personalImpact.onMe}</p>
            </Card>
          ) : (
            <Card accent="#BF5AF2">
              <SubLabel text="이 관계의 에너지 소모" />
              <p className="text-[#888] text-sm leading-relaxed">
                충돌 구조가 강한 관계일수록 유지에 드는 감정 비용이 큽니다. 이 관계에서 반복적으로 느끼는 피로감은 의지력 부족이 아니라 구조의 문제입니다.
              </p>
            </Card>
          )}

            {unlockedSections.has('s04') && detail456Loading ? (
              <DetailLoadingBanner name={myData.name} />
            ) : (
              <BlurredPreview unlocked={unlockedSections.has('s04')} onUnlock={() => handleOpenPaywall('s04')} teaser="이 관계가 나를 갉아먹는 신호 · 잃어가고 있는 것이 잠겨있습니다">
                {aiDetail456?.personalImpact?.warningSignals ? (
                  <div className="space-y-3">
                    {ai.personalImpact!.warningSignals!.length > 0 && (
                      <Card>
                        <SubLabel text="이 관계가 나를 갉아먹는 신호" />
                        <div className="space-y-2">
                          {ai.personalImpact!.warningSignals!.map((signal, i) => (
                            <div key={i} className="flex items-start gap-3 py-2 border-b border-[#1a1a1a] last:border-0">
                              <span className="text-[#BF5AF2] text-xs mt-0.5 flex-shrink-0">⚠</span>
                              <p className="text-[#888] text-sm">{signal}</p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                    <div className="border border-[#BF5AF2]/20 p-5 bg-[#BF5AF2]/5">
                      <SubLabel text="잃어가고 있는 것" />
                      <p className="text-[#aaa] text-sm leading-relaxed">{ai.personalImpact!.whatYouLose}</p>
                    </div>
                  </div>
                ) : (
                  <SectionDetailPlaceholder />
                )}
              </BlurredPreview>
            )}

          {/* ════ 05 상대는 나를 어떻게 생각하는지 ════ */}
          <SectionHeader number="05" title="상대는 나를 어떻게 생각하는지" subtitle="상대방 눈에 비친 나의 모습" />

          {ai.howTheySeeMe?.energyReading ? (
            <Card accent="#F59E0B">
              <SubLabel text="상대방 사주로 읽히는 나의 에너지" />
              <p className="text-[#888] text-sm leading-relaxed">{ai.howTheySeeMe.energyReading}</p>
            </Card>
          ) : (
            <Card accent="#F59E0B">
              <SubLabel text="상대방이 나를 보는 시선" />
              <p className="text-[#888] text-sm leading-relaxed">
                상대방의 사주 기운은 나의 에너지를 독특한 방식으로 읽습니다. 충돌 구조가 있을수록 상대방 눈에 나는 더 강렬하게 각인됩니다.
              </p>
            </Card>
          )}

            {unlockedSections.has('s05') && detail456Loading ? (
              <DetailLoadingBanner name={myData.name} />
            ) : (
              <BlurredPreview unlocked={unlockedSections.has('s05')} onUnlock={() => handleOpenPaywall('s05')} teaser={hasDateData ? `${result.targetStem}일(日) 기준 — 상대가 혼자 나를 평가하는 방식이 잠겨있습니다` : `${targetData.name || '상대방'}이 혼자 나를 평가하는 방식이 잠겨있습니다`}>
                {aiDetail456?.howTheySeeMe?.whatIrritates ? (
                  <div className="space-y-3">
                    <Card>
                      <SubLabel text="상대방이 나 때문에 자극받는 것" />
                      <p className="text-[#888] text-sm leading-relaxed">{ai.howTheySeeMe!.whatIrritates}</p>
                    </Card>
                    <Card>
                      <SubLabel text="그래도 나를 놓지 못하는 이유" />
                      <p className="text-[#888] text-sm leading-relaxed">{ai.howTheySeeMe!.whatDrawsThem}</p>
                    </Card>
                    <Card>
                      <SubLabel text="상대방이 혼자 나를 평가하는 방식" />
                      <p className="text-[#888] text-sm leading-relaxed">{ai.howTheySeeMe!.theirPrivateVerdict}</p>
                    </Card>
                    <div className="border border-[#F59E0B]/20 p-5 bg-[#F59E0B]/5">
                      <SubLabel text="상대방이 나에게 진짜로 원하는 것" />
                      <p className="text-[#aaa] text-sm leading-relaxed">{ai.howTheySeeMe!.howTheyNeedMe}</p>
                    </div>
                  </div>
                ) : (
                  <SectionDetailPlaceholder />
                )}
              </BlurredPreview>
            )}

          {/* ════ 06 이 관계, 계속 가야 할까? ════ */}
          <SectionHeader number="06" title="이 관계, 계속 가야 할까?" subtitle="사주 구조로 보는 냉철한 판단" />

          {ai.continuationAssessment?.verdict ? (
            <div className="border border-[#FF2D55] p-5"
              style={{ background: 'linear-gradient(135deg, #0D0005 0%, #0A0A0A 100%)' }}>
              <p className="text-[#FF2D55] text-[10px] uppercase tracking-[0.25em] font-sans-kr mb-3">최종 판정</p>
              <p className="text-white text-base font-bold leading-snug font-sans-kr">
                {ai.continuationAssessment.verdict}
              </p>
            </div>
          ) : (
            <div className="border border-[#FF2D55] p-5"
              style={{ background: 'linear-gradient(135deg, #0D0005 0%, #0A0A0A 100%)' }}>
              <p className="text-[#FF2D55] text-[10px] uppercase tracking-[0.25em] font-sans-kr mb-3">구조적 판단</p>
              <p className="text-white text-sm font-sans-kr leading-relaxed">
                충돌 구조는 바뀌지 않습니다. 바뀔 수 있는 건 두 사람이 그 구조를 어떻게 다루느냐입니다.
              </p>
            </div>
          )}

            {unlockedSections.has('s06') && detail456Loading ? (
              <DetailLoadingBanner name={myData.name} />
            ) : (
              <BlurredPreview unlocked={unlockedSections.has('s06')} onUnlock={() => handleOpenPaywall('s06')} teaser="구조적 분석 · 레드라인 · 관계 지속 가능성이 잠겨있습니다">
                {aiDetail456?.continuationAssessment?.structuralAnalysis ? (
                  <div className="space-y-3">
                    <Card>
                      <SubLabel text="구조적 분석" />
                      <p className="text-[#888] text-sm leading-relaxed">{ai.continuationAssessment!.structuralAnalysis}</p>
                    </Card>
                    <Card>
                      <SubLabel text="계속하려면 필요한 것" />
                      <p className="text-[#888] text-sm leading-relaxed">{ai.continuationAssessment!.whatItTakes}</p>
                    </Card>
                    <Card accent="#FF2D55">
                      <SubLabel text="이 신호가 보이면 재고하세요" />
                      <p className="text-[#888] text-sm leading-relaxed">{ai.continuationAssessment!.redLine}</p>
                    </Card>
                  </div>
                ) : (
                  <SectionDetailPlaceholder />
                )}
              </BlurredPreview>
            )}
        </div>
      )}

      {/* ══════════════════════════════════════
          결과 (역산 모드)
      ══════════════════════════════════════ */}
      {!hasTarget && (
        <div className="space-y-2">

          <SectionHeader number="01" title="내 사주 기질" subtitle="충돌 구조의 근원" />

          <Card accent="#FF2D55">
            <SubLabel text="나의 사주 기질" />
            {ai.myCharacter ? (
              <>
                <p className="text-[#888] text-sm leading-relaxed mb-4">{ai.myCharacter.core}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-[#1a1a1a] p-3">
                    <p className="text-[#BF5AF2] text-[10px] mb-1.5">강점</p>
                    <p className="text-[#888] text-xs leading-relaxed">{ai.myCharacter.strength}</p>
                  </div>
                  <div className="border border-[#1a1a1a] p-3">
                    <p className="text-[#FF2D55] text-[10px] mb-1.5">그림자</p>
                    <p className="text-[#888] text-xs leading-relaxed">{ai.myCharacter.shadow}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-[#888] text-sm leading-relaxed">{result.conflictSummary}</p>
            )}
          </Card>

            <BlurredPreview unlocked={unlockedSections.has('s01')} onUnlock={() => handleOpenPaywall('s01')} teaser="나의 위험 유형 · 숨겨진 패턴이 잠겨있습니다">
              <div className="space-y-3">
                {ai.dangerTypes && ai.dangerTypes.length > 0 && (
                  <>
                    <SubLabel text="나의 위험 유형" />
                    {ai.dangerTypes.map((dt, i) => (
                      <Card key={i}>
                        <div className="mb-3">
                          <p className="text-white text-sm font-bold mb-1">{dt.type}</p>
                          {dt.years && <p className="text-[#555] text-[11px]">{dt.years}</p>}
                        </div>
                        <p className="text-[#777] text-xs leading-relaxed mb-3">{dt.whyDangerous}</p>
                        <div className="bg-[#FF2D55]/5 border border-[#FF2D55]/15 px-3 py-2.5">
                          <p className="text-[#FF2D55]/80 text-[11px] mb-1">실제 상황</p>
                          <p className="text-[#888] text-xs leading-relaxed">{dt.realScenario}</p>
                        </div>
                      </Card>
                    ))}
                  </>
                )}
                {ai.hiddenDynamic && (
                  <div className="border border-[#FF2D55]/20 p-5 bg-[#FF2D55]/5">
                    <SubLabel text="숨겨진 패턴" />
                    <p className="text-[#aaa] text-sm leading-relaxed">{ai.hiddenDynamic}</p>
                  </div>
                )}
              </div>
            </BlurredPreview>

          <SectionHeader number="02" title="어떤 상황에서 안맞는지" subtitle="내가 자주 반복하는 갈등 패턴" />

          {ai.conflictScenarios && ai.conflictScenarios.length > 0 ? (
            <Card>
              <div className="flex items-start gap-3">
                <span className="text-[#FF2D55] font-display text-2xl leading-none mt-0.5 flex-shrink-0">1</span>
                <div>
                  <p className="text-white text-sm font-bold mb-2">{ai.conflictScenarios[0].situation}</p>
                  <p className="text-[#777] text-xs leading-relaxed mb-2">{ai.conflictScenarios[0].whatHappens}</p>
                  <p className="text-[#FF2D55]/60 text-[11px] border-t border-[#1a1a1a] pt-2">사주 구조 → {ai.conflictScenarios[0].whySaju}</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <SubLabel text="반복 갈등 패턴" />
              <p className="text-[#888] text-sm leading-relaxed">{result.conflictSummary}</p>
            </Card>
          )}

            {unlockedSections.has('s02') && detail23Loading ? (
              <DetailLoadingBanner name={myData.name} />
            ) : (
              <BlurredPreview unlocked={unlockedSections.has('s02')} onUnlock={() => handleOpenPaywall('s02')} teaser="추가 갈등 상황 · 갈등 트리거 · 반복 패턴이 잠겨있습니다">
                {aiDetail23 ? (
                  <div className="space-y-3">
                    {ai.conflictScenarios && ai.conflictScenarios.slice(1).map((s, i) => (
                      <Card key={i}>
                        <div className="flex items-start gap-3">
                          <span className="text-[#FF2D55] font-display text-2xl leading-none mt-0.5 flex-shrink-0">{i + 2}</span>
                          <div>
                            <p className="text-white text-sm font-bold mb-2">{s.situation}</p>
                            <p className="text-[#777] text-xs leading-relaxed mb-2">{s.whatHappens}</p>
                            <p className="text-[#FF2D55]/60 text-[11px] border-t border-[#1a1a1a] pt-2">사주 구조 → {s.whySaju}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {ai.triggerPoints && (
                      <Card>
                        <SubLabel text="나의 갈등 트리거" />
                        <div className="space-y-2">
                          {ai.triggerPoints.map((t, i) => (
                            <div key={i} className="flex items-start gap-3 py-2 border-b border-[#1a1a1a] last:border-0">
                              <span className="text-[#FF2D55] text-xs mt-0.5 flex-shrink-0">▸</span>
                              <p className="text-[#888] text-sm">{t}</p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                    {ai.warningPattern && (
                      <Card accent="#FF2D55">
                        <SubLabel text="반복되는 갈등 패턴" />
                        <p className="text-[#aaa] text-sm leading-relaxed">{ai.warningPattern}</p>
                      </Card>
                    )}
                  </div>
                ) : (
                  <SectionDetailPlaceholder />
                )}
              </BlurredPreview>
            )}

          <SectionHeader number="03" title="앞으로 이렇게 해보세요" subtitle="내 패턴을 이해하고 충돌 줄이기" />

          {ai.avoidanceGuide?.mindset ? (
            <Card accent="#FF2D55">
              <SubLabel text="마음가짐" />
              <p className="text-[#888] text-sm leading-relaxed">{ai.avoidanceGuide.mindset}</p>
            </Card>
          ) : (
            <Card accent="#FF2D55">
              <SubLabel text="현실적 가이드" />
              <p className="text-[#888] text-sm leading-relaxed">
                내 충돌 패턴을 인식하는 것 자체가 첫 번째 단계입니다. 같은 상황에서 반복해서 반응하는 방식을 관찰하고, 자동 반응 전에 잠깐 멈추는 연습을 하세요.
              </p>
            </Card>
          )}

            {unlockedSections.has('s03') && detail23Loading ? (
              <DetailLoadingBanner name={myData.name} />
            ) : (
              <BlurredPreview unlocked={unlockedSections.has('s03')} onUnlock={() => handleOpenPaywall('s03')} teaser="실전 팁 · 선긋기 · 내 갈등 패턴 해소법이 잠겨있습니다">
                {aiDetail23?.avoidanceGuide?.practicalTips ? (
                  <div className="space-y-3">
                    <Card>
                      <SubLabel text="실전 팁" />
                      <div className="space-y-3">
                        {ai.avoidanceGuide!.practicalTips!.map((tip, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full border border-[#FF2D55]/40 text-[#FF2D55] text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-[#888] text-sm leading-relaxed">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                    <Card>
                      <SubLabel text="선긋기" />
                      <p className="text-[#888] text-sm leading-relaxed">{ai.avoidanceGuide!.boundaries}</p>
                    </Card>
                  </div>
                ) : (
                  <SectionDetailPlaceholder />
                )}
              </BlurredPreview>
            )}
        </div>
      )}

      {/* 태그 */}
      <div className="flex flex-wrap gap-2 pt-2">
        {result.tags.map(tag => (
          <span key={tag} className="text-xs text-[#FF2D55] bg-[#FF2D55]/8 border border-[#FF2D55]/20 px-3 py-1">
            {tag}
          </span>
        ))}
      </div>


      {/* 리뷰 */}
      {!reviewSubmitted ? (
        <div className="border border-[#1e1e1e] p-5 bg-[#0D0D0D]">
          <p className="text-[#555] text-[10px] uppercase tracking-[0.25em] mb-4">분석이 도움됐나요?</p>
          <div className="flex justify-center gap-3 mb-4">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setReviewStars(n)}
                className={`text-2xl transition-colors ${n <= reviewStars ? 'text-[#FF2D55]' : 'text-[#2a2a2a] hover:text-[#555]'}`}>
                ★
              </button>
            ))}
          </div>
          {reviewStars > 0 && (
            <>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="한 줄 후기 (선택)"
                className="w-full bg-[#111] border border-[#1e1e1e] text-white text-sm px-4 py-3 resize-none focus:outline-none focus:border-[#FF2D55]/40 mb-3 font-sans-kr"
                rows={2}
                maxLength={200}
              />
              <button onClick={() => handleSubmitReview()}
                className="w-full py-3 gradient-red text-white text-sm font-medium">
                후기 남기기
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="border border-[#1e1e1e] p-5 bg-[#0D0D0D] text-center">
          <p className="text-[#FF2D55] text-sm mb-1">감사합니다</p>
          <p className="text-[#444] text-xs">후기가 서비스 개선에 큰 도움이 됩니다</p>
        </div>
      )}

      {/* 이전 분석 히스토리 */}
      {recentHistory.length > 0 && (
        <div className="border border-[#1e1e1e] p-5">
          <p className="text-[#333] text-[10px] uppercase tracking-[0.25em] mb-3">이전 분석</p>
          <div className="space-y-0">
            {recentHistory.map(h => (
              <div key={h.id} className="flex items-center justify-between py-3 border-b border-[#111] last:border-0">
                <div>
                  <p className="text-[#666] text-xs">
                    {h.myName} {h.targetName ? `· ${h.targetName}` : '(역산)'} <span className="text-[#333]">— {h.relationType}</span>
                  </p>
                  <p className="text-[#2a2a2a] text-[10px] mt-0.5">{new Date(h.date).toLocaleDateString('ko-KR')}</p>
                </div>
                <span className="font-bold text-sm" style={{ color: h.score >= 80 ? '#FF2D55' : h.score >= 60 ? '#BF5AF2' : '#F59E0B' }}>
                  {h.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {onResetTarget && (
        <button onClick={onResetTarget}
          className="w-full py-4 border border-[#FF2D55]/20 text-[#FF2D55]/70 hover:border-[#FF2D55]/50 hover:text-[#FF2D55] transition-all text-sm font-sans-kr mb-2">
          내 사주 유지 · 상대방만 다시 입력하기 →
        </button>
      )}
      <button onClick={onReset}
        className="w-full py-4 border border-[#1e1e1e] text-[#555] hover:border-[#FF2D55]/40 hover:text-white transition-all text-sm">
        처음부터 다시 분석하기 →
      </button>
    </div>
    </>
  );
}

declare global {
  interface Window {
    Kakao: { isInitialized: () => boolean; Share: { sendDefault: (o: object) => void } };
  }
}
