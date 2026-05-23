import { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import type { SajuResult, PersonData, RelationType } from '../utils/saju';
import { fetchAIPhase1, fetchAIPhase2 } from '../utils/aiAnalysis';
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

const ACCURACY_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  full:  { label: '완전 분석', color: '#FF2D55', desc: '4주 8자 기반' },
  day:   { label: '정밀 분석', color: '#BF5AF2', desc: '년·월·일주 기반' },
  month: { label: '심화 분석', color: '#F59E0B', desc: '년·월주 기반' },
  year:  { label: '기본 분석', color: '#F59E0B', desc: '년주 기반' },
};

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

function AILoadingScreen({ hasTarget, score, result, progress }: {
  hasTarget: boolean;
  score: number;
  result: SajuResult;
  progress: number;
}) {
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * SAJU_QUOTES.length));

  useEffect(() => {
    const iv = setInterval(() => setQuoteIdx(i => (i + 1) % SAJU_QUOTES.length), 5000);
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#131313' }}>

      {/* Saju year cards — compact */}
      <div className="flex items-center gap-5 mb-10">
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-[#2a2a2a] text-[9px] tracking-[0.25em] uppercase">나</p>
          <div className="w-11 h-13 border border-[#181818] bg-[#080808] flex flex-col items-center justify-center px-2 py-2 gap-0.5">
            <span className="font-display text-lg leading-none" style={{ color }}>{result.myYear?.stem ?? '?'}</span>
            <span className="font-display text-lg leading-none text-[#555]">{result.myYear?.branch ?? '?'}</span>
          </div>
          <p className="text-[#1e1e1e] text-[8px]">年</p>
        </div>

        {hasTarget && result.targetYear && (
          <>
            <div className="flex flex-col gap-1 items-center">
              <div className="w-px h-5 bg-[#1a1a1a]" />
              <span className="font-display text-xs" style={{ color: `${color}60` }}>VS</span>
              <div className="w-px h-5 bg-[#1a1a1a]" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-[#2a2a2a] text-[9px] tracking-[0.25em] uppercase">상대</p>
              <div className="w-11 h-13 border border-[#181818] bg-[#080808] flex flex-col items-center justify-center px-2 py-2 gap-0.5">
                <span className="font-display text-lg leading-none" style={{ color: color2 }}>{result.targetYear.stem}</span>
                <span className="font-display text-lg leading-none text-[#555]">{result.targetYear.branch}</span>
              </div>
              <p className="text-[#1e1e1e] text-[8px]">年</p>
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
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: `${color}99` }}>
            분석 진행 중
          </span>
        </div>
      )}

      {/* Status text */}
      <div className="text-center max-w-[240px]">
        <p key={step.label} className="text-white text-sm font-medium mb-1.5 char-enter">
          {isDone ? '분석 완료' : step.label}
        </p>
        <p className="text-[#888] text-xs leading-relaxed">
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

      {/* Rotating saju quote */}
      {!isDone && (
        <div className="w-72 text-center px-4 mt-4">
          <p key={quoteIdx} className="char-enter" style={{ color: '#777', fontSize: '11px', lineHeight: '1.6' }}>
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

function ScoreGauge({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (score / 100) * circumference;
  const color = score >= 80 ? '#FF2D55' : score >= 60 ? '#BF5AF2' : '#F59E0B';
  const label = score >= 80 ? '강한 충돌' : score >= 60 ? '중간 충돌' : '경미한 충돌';
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#1a1a1a" strokeWidth="8" />
          <circle cx="60" cy="60" r={radius} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1.2s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white font-sans">{score}</span>
          <span className="text-[#555] text-xs">/ 100</span>
        </div>
      </div>
      <p className="text-sm font-medium mt-2" style={{ color }}>{label}</p>
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
    <div className="border border-[#1e1e1e] bg-[#0D0D0D] px-4 py-3">
      <p className="text-[#333] text-[9px] uppercase tracking-widest mb-2.5">6개 영역 분석 완료</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {areas.map((area, i) => (
          <div key={i} className="flex items-center gap-1.5 animate-fade-in"
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both', opacity: 0 }}>
            <span className="text-[#FF2D55] text-[9px]">✓</span>
            <span className="text-[#444] text-[10px] font-sans-kr">{area}</span>
          </div>
        ))}
      </div>
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
        <p className="text-[#555] text-[11px] pb-2 font-sans-kr border-l-2 border-[#FF2D55]/40 pl-3 ml-1 mb-1 italic">{teaser}</p>
      )}
      <div className="relative min-h-[140px]">
      <div className="select-none pointer-events-none"
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
            ₩{PRICE_ALL.toLocaleString()}으로 더 자세히 보기 →
          </span>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(255,255,255,0.07)' }} />
        </button>
      </div>
    </div>
    </>
  );
}

function Phase2Skeleton() {
  return (
    <div className="border border-[#1e1e1e] p-5 bg-[#0D0D0D] animate-pulse">
      <div className="h-3 bg-[#1a1a1a] rounded w-3/4 mb-3" />
      <div className="h-3 bg-[#1a1a1a] rounded w-1/2" />
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
const PRICE_ALL = 500;

// ── 결제 팝업 모달 ───────────────────────────────────────────────────
function PaywallModal({ myName, conflictType, onClose, onPay }: {
  myName: string;
  conflictType: string;
  onClose: () => void;
  onPay: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.96)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm animate-fade-in relative" style={{ background: '#080808' }}>
        <div className="h-0.5" style={{ background: 'linear-gradient(90deg, transparent 0%, #FF2D55 40%, #BF5AF2 70%, transparent 100%)' }} />

        <div className="border border-[#FF2D55]/20 border-t-0">
          <div className="px-6 pt-5 pb-6">

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <LockIcon size={13} />
                <span className="text-[9px] font-bold tracking-[0.2em] text-[#FF2D55] font-sans-kr">상세 분석 잠금</span>
              </div>
              <button onClick={onClose}
                className="w-7 h-7 flex items-center justify-center text-[#333] hover:text-[#555] text-lg transition-colors">
                ✕
              </button>
            </div>

            {/* Big headline */}
            <p className="font-display text-white leading-[1.05] mb-1"
              style={{ fontSize: 'clamp(1.75rem, 8vw, 2.3rem)' }}>
              지금 더 보면
            </p>
            <p className="font-display text-white leading-[1.05] mb-1"
              style={{ fontSize: 'clamp(1.75rem, 8vw, 2.3rem)' }}>
              관계가
            </p>
            <p className="font-display text-[#FF2D55] leading-[1.05] mb-4"
              style={{ fontSize: 'clamp(1.75rem, 8vw, 2.3rem)' }}>
              보입니다
            </p>

            {conflictType && (
              <p className="font-sans-kr text-[#3a3a3a] text-[11px] mb-5">
                → <span className="text-[#555]">{conflictType}</span> 구조 상세 분석
              </p>
            )}

            <div className="space-y-2 mb-5">
              {[
                '각 섹션 숨겨진 상세 분석 전체',
                '상황별 실전 행동 지침 — 갈등 전·중·후',
                '이 관계에서 당신이 잃어가는 것들',
                'AI 최종 판정 — 솔직하고 단호하게',
              ].map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#FF2D55] text-xs mt-0.5 flex-shrink-0">✓</span>
                  <p className="text-[#777] text-xs leading-relaxed font-sans-kr">{b}</p>
                </div>
              ))}
            </div>

            <div className="h-px bg-[#111] mb-4" />

            {/* Price */}
            <div className="flex items-center justify-between mb-4 px-1">
              <p className="font-sans-kr text-[#444] text-xs">전체 더보기 잠금 해제</p>
              <p className="text-[#2a2a2a] text-[9px] font-sans-kr mt-0.5">AI 분석 원가 ₩380 — 시장검증 특가</p>
              <div className="flex items-end gap-2">
                <span className="font-sans-kr text-[#2a2a2a] text-xs line-through">₩9,900</span>
                <span className="font-display text-white text-3xl leading-none">₩{PRICE_ALL.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={onPay}
              className="w-full py-4 text-white font-bold text-base tracking-wide mb-3 relative overflow-hidden group font-sans-kr"
              style={{
                background: 'linear-gradient(90deg, #FF2D55 0%, #BF5AF2 100%)',
                boxShadow: '0 0 40px rgba(255,45,85,0.45)',
              }}>
              <span className="relative z-10">
                {myName ? `${myName}님` : '지금'} ₩{PRICE_ALL.toLocaleString()}으로 전체 보기 →
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(255,255,255,0.08)' }} />
            </button>

            <div className="flex items-center justify-center gap-3 text-[#222] text-[9px] font-sans-kr">
              <span>🔒 즉시 잠금 해제</span>
              <span>·</span>
              <span>안전 결제</span>
              <span>·</span>
              <span>100% 환불</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── 잠금 해제 오버레이 ──────────────────────────────────────────────
function FreeSuccessOverlay({ visible, myName }: { visible: boolean; myName: string }) {
  if (!visible) return null;
  const name = myName || '고객';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.97)' }}>
      <div className="w-full max-w-xs text-center border border-[#FF2D55]/25 px-8 py-10 animate-fade-in"
        style={{ background: 'linear-gradient(160deg, #0E0003 0%, #0A0A0A 100%)' }}>
        <div className="w-16 h-16 border border-[#FF2D55]/40 flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(255,45,85,0.08)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#FF2D55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-[#FF2D55] text-[10px] uppercase tracking-[0.35em] mb-4 font-sans-kr">SPECIAL OFFER</p>
        <p className="text-white text-xl font-bold leading-snug mb-3 font-sans-kr">
          {name}님만을 위해<br />
          전체 분석<br />
          <span className="text-[#FF2D55]">100회 무료</span> 제공!
        </p>
        <p className="text-[#444] text-xs leading-relaxed font-sans-kr">잠금이 해제됩니다...</p>
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
export default function StepResult({ myData, targetData, result, relationType, onReset }: StepResultProps) {
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [aiPhase1, setAiPhase1] = useState<AIAnalysis | null>(null);
  const [aiPhase2, setAiPhase2] = useState<Partial<AIAnalysis> | null>(null);
  const [phase2Loading, setPhase2Loading] = useState(true);
  const [, setApiDone] = useState(false);
  // apiProgress: 실제 API 스트림 진행 (0-100)
  // displayProgress: 사용자에게 보이는 진행 (0→80 빠르게, 80→100 천천히)
  const [apiProgress, setApiProgress] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const apiProgressRef = useRef(0);
  const [showLoading, setShowLoading] = useState(true);
  const [aiError] = useState(false);
  const [toast, setToast] = useState('');
  const [conflictTooltip, setConflictTooltip] = useState<string | null>(null);
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [recentHistory] = useState(() => loadHistory().slice(1, 4));

  // 유료 전환 — 전체 단일 결제
  const [isAllUnlocked, setIsAllUnlocked] = useState(() => {
    try { return localStorage.getItem('toxic_unlocked_all') === '1'; } catch { return false; }
  });
  const [showPaywall, setShowPaywall] = useState(false);
  const [showFreeSuccess, setShowFreeSuccess] = useState(false);

  const ai: AIAnalysis = { ...aiPhase1, ...aiPhase2 };

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
  };

  const hasTarget = Boolean(targetData.birthdate);
  const accuracyInfo = ACCURACY_LABELS[result.accuracyLevel] ?? ACCURACY_LABELS.year;

  // MINT 방식 로딩: gap*coeff + 최소 floor → 수학적으로 절대 멈추지 않음
  useEffect(() => {
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
    const startedAt = Date.now();
    (async () => {
      try {
        const data = await fetchAIPhase1(myData, targetData, relationType, result, (pct) => {
          setApiProgress(pct);
          apiProgressRef.current = pct;
        });
        setAiPhase1(data);
      } catch {
        const localData = generateLocalAnalysis(result, relationType, hasTarget);
        setAiPhase1(localData as AIAnalysis);
      } finally {
        apiProgressRef.current = 100;
        setApiProgress(100);
        setApiDone(true);
        const elapsed = Date.now() - startedAt;
        const delay = Math.max(0, 3000 - elapsed) + 900;
        setTimeout(() => setShowLoading(false), delay);
      }
    })();
  }, []);

  // Phase 2: 로딩 화면 중 Phase 1과 병렬 실행
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAIPhase2(myData, targetData, relationType, result);
        setAiPhase2(data);
      } catch {
        const localData = generateLocalAnalysis(result, relationType, hasTarget);
        setAiPhase2({
          personalImpact: localData.personalImpact,
          howTheySeeMe: localData.howTheySeeMe,
          continuationAssessment: localData.continuationAssessment,
        });
      } finally {
        setPhase2Loading(false);
      }
    })();
  }, []);

  // 결과 화면 진입 시 세션 타임 기록 — 반드시 조건부 return 전에 위치해야 함
  useEffect(() => {
    if (!showLoading) {
      endSession();
      trackEvent('result_view', { toxicScore: result.toxicScore, relationType });
      trackEvent('paywall_impression');
    }
  }, [showLoading]);

  if (showLoading) {
    return <AILoadingScreen hasTarget={hasTarget} score={result.toxicScore} result={result} progress={displayProgress} />;
  }

  const handleSaveImage = async () => {
    if (!shareCardRef.current) return;
    trackEvent('share', { method: 'image' });
    const canvas = await html2canvas(shareCardRef.current, { backgroundColor: '#0A0A0A', scale: 2 });
    const link = document.createElement('a');
    link.download = 'toxic-result.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleCopyLink = () => {
    trackEvent('share', { method: 'link' });
    navigator.clipboard.writeText(window.location.href);
    showToast('링크가 복사되었습니다');
  };

  const handleKakaoShare = () => {
    trackEvent('share', { method: 'kakao' });
    if (window.Kakao?.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `TOXIC 분석: ${result.conflictType}`,
          description: ai.toxicSummary || result.conflictSummary,
          imageUrl: 'https://toxic.kr/og.png',
          link: { mobileWebUrl: 'https://toxic.kr', webUrl: 'https://toxic.kr' },
        },
        buttons: [{ title: '나도 분석하기', link: { mobileWebUrl: 'https://toxic.kr', webUrl: 'https://toxic.kr' } }],
      });
    } else {
      navigator.clipboard.writeText('https://toxic.kr').catch(() => {});
      showToast('카카오 미연결 — 링크를 복사했어요');
    }
  };

  const handleSubmitReview = async () => {
    if (reviewStars === 0) return;
    trackEvent('review_submit', { stars: reviewStars, relationType, score: result.toxicScore });
    fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stars: reviewStars, comment: reviewText, relationType, score: result.toxicScore }),
    }).catch(() => {});
    try {
      const raw = localStorage.getItem('toxic_user_reviews');
      const list = raw ? JSON.parse(raw) : [];
      list.push({ stars: reviewStars, comment: reviewText, ts: Date.now() });
      localStorage.setItem('toxic_user_reviews', JSON.stringify(list.slice(-50)));
    } catch {}
    setReviewSubmitted(true);
    showToast('후기 감사합니다!');
  };

  return (
    <div className="animate-fade-in max-w-lg mx-auto px-4 py-8 space-y-4 pb-24">

      {/* 결제 팝업 모달 */}
      {showPaywall && (
        <PaywallModal
          myName={myData.name || ''}
          conflictType={result.conflictType}
          onClose={() => setShowPaywall(false)}
          onPay={handlePayment}
        />
      )}

      {/* 하단 고정 CTA */}
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

      {/* 결제 성공 오버레이 */}
      <FreeSuccessOverlay visible={showFreeSuccess} myName={myData.name || ''} />

      {/* 6개 영역 분석 완료 리빌 */}
      {!showLoading && <CompletionReveal />}

      {/* 토스트 알림 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1a] border border-[#FF2D55]/40 text-white text-sm px-5 py-3 animate-fade-in whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* 헤더 */}
      <div className="text-center">
        <p className="text-[#555] text-[10px] uppercase tracking-[0.3em] mb-3">TOXIC 분석 결과</p>
        <div className="flex justify-center mb-4">
          <span className="text-[10px] px-3 py-1 rounded-full border font-medium"
            style={{ color: accuracyInfo.color, borderColor: `${accuracyInfo.color}40`, backgroundColor: `${accuracyInfo.color}15` }}>
            {accuracyInfo.label} · {accuracyInfo.desc}
          </span>
        </div>

        {hasTarget ? (
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-[#FF2D55]/20 border border-[#FF2D55]/30 flex items-center justify-center text-lg">
                {myData.gender === '남' ? '♂' : '♀'}
              </div>
              <span className="text-white text-xs">{myData.name || '나'}</span>
              <span className="text-[#555] text-xs">{result.myStem}{result.myBranch}년</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-px bg-[#FF2D55]" />
              <span className="text-[#FF2D55] text-xs font-bold">VS</span>
              <div className="w-8 h-px bg-[#FF2D55]" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-[#BF5AF2]/20 border border-[#BF5AF2]/30 flex items-center justify-center text-lg">
                {targetData.gender === '남' ? '♂' : '♀'}
              </div>
              <span className="text-white text-xs">{targetData.name || '상대'}</span>
              <span className="text-[#555] text-xs">{result.targetStem}{result.targetBranch}년</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#FF2D55]/20 border border-[#FF2D55]/30 flex items-center justify-center text-2xl mb-2">
              {myData.gender === '남' ? '♂' : '♀'}
            </div>
            <span className="text-white text-sm">{myData.name || '나'}</span>
            <span className="text-[#555] text-xs mt-1">내 위험 유형 분석</span>
          </div>
        )}

        <ScoreGauge score={result.toxicScore} />
      </div>

      {/* 빠른 공유 */}
      <div className="flex justify-center gap-2">
        <button onClick={handleKakaoShare}
          className="px-4 py-2 bg-[#FEE500] text-[#3C1E1E] text-xs font-bold hover:opacity-90 transition-opacity">
          카카오톡 공유
        </button>
        <button onClick={handleSaveImage}
          className="px-4 py-2 border border-[#1e1e1e] text-[#888] text-xs hover:border-[#FF2D55]/40 hover:text-white transition-colors">
          이미지 저장
        </button>
        <button onClick={handleCopyLink}
          className="px-4 py-2 border border-[#1e1e1e] text-[#888] text-xs hover:border-[#FF2D55]/40 hover:text-white transition-colors">
          링크 복사
        </button>
      </div>

      {/* 충돌 뱃지 + tooltip */}
      {(result.conflicts.chung.length > 0 || result.conflicts.hyung.length > 0 ||
        result.conflicts.hae.length > 0 || result.conflicts.pa.length > 0 || result.conflicts.hap.length > 0) && (
        <div>
          <p className="text-[#333] text-[9px] uppercase tracking-[0.2em] mb-2">사주 충돌 구조 — 탭하면 설명</p>
          <div className="flex flex-wrap gap-2">
            {result.conflicts.chung.map(c => (
              <button key={c.name}
                onClick={() => setConflictTooltip(conflictTooltip === `chung-${c.name}` ? null : `chung-${c.name}`)}
                className={`text-[11px] px-3 py-1.5 border transition-all ${conflictTooltip === `chung-${c.name}` ? 'border-[#FF2D55] bg-[#FF2D55]/15 text-[#FF2D55]' : 'border-[#FF2D55]/40 text-[#FF2D55] bg-[#FF2D55]/8'}`}>
                충 · {c.name}
              </button>
            ))}
            {result.conflicts.hyung.map(h => (
              <button key={h.name}
                onClick={() => setConflictTooltip(conflictTooltip === `hyung-${h.name}` ? null : `hyung-${h.name}`)}
                className={`text-[11px] px-3 py-1.5 border transition-all ${conflictTooltip === `hyung-${h.name}` ? 'border-[#BF5AF2] bg-[#BF5AF2]/15 text-[#BF5AF2]' : 'border-[#BF5AF2]/40 text-[#BF5AF2] bg-[#BF5AF2]/8'}`}>
                형 · {h.name}
              </button>
            ))}
            {result.conflicts.hae.map(h => (
              <button key={h.name}
                onClick={() => setConflictTooltip(conflictTooltip === `hae-${h.name}` ? null : `hae-${h.name}`)}
                className={`text-[11px] px-3 py-1.5 border transition-all ${conflictTooltip === `hae-${h.name}` ? 'border-[#F59E0B] bg-[#F59E0B]/15 text-[#F59E0B]' : 'border-[#F59E0B]/40 text-[#F59E0B] bg-[#F59E0B]/8'}`}>
                해 · {h.name}
              </button>
            ))}
            {result.conflicts.pa.map(p => (
              <button key={p.name}
                onClick={() => setConflictTooltip(conflictTooltip === `pa-${p.name}` ? null : `pa-${p.name}`)}
                className={`text-[11px] px-3 py-1.5 border transition-all ${conflictTooltip === `pa-${p.name}` ? 'border-[#F59E0B] bg-[#F59E0B]/15 text-[#F59E0B]' : 'border-[#F59E0B]/40 text-[#F59E0B] bg-[#F59E0B]/8'}`}>
                파 · {p.name}
              </button>
            ))}
            {result.conflicts.hap.length > 0 && (
              <button
                onClick={() => setConflictTooltip(conflictTooltip === 'hap' ? null : 'hap')}
                className={`text-[11px] px-3 py-1.5 border transition-all ${conflictTooltip === 'hap' ? 'border-[#BF5AF2] bg-[#BF5AF2]/15 text-[#BF5AF2]' : 'border-[#BF5AF2]/40 text-[#BF5AF2] bg-[#BF5AF2]/8'}`}>
                합 요소 있음
              </button>
            )}
          </div>

          {/* 인라인 tooltip 설명 */}
          {conflictTooltip && (() => {
            const type = conflictTooltip.split('-')[0];
            const name = conflictTooltip.includes('-') ? conflictTooltip.split('-').slice(1).join('-') : '';
            const COLOR: Record<string, string> = { chung: '#FF2D55', hyung: '#BF5AF2', hae: '#F59E0B', pa: '#F59E0B', hap: '#BF5AF2' };
            const DESC: Record<string, string> = {
              chung: `충(沖)은 두 기운이 정반대 방향으로 부딪히는 관계입니다. ${name ? `${name}은` : ''} 서로의 에너지가 충돌해 다툼이 잦고, 예상치 못한 변화가 갑자기 터질 수 있습니다.`,
              hyung: `형(刑)은 서로를 압박하고 자극하는 관계입니다. ${name ? `${name}은` : ''} 말하지 못한 긴장이 쌓이고, 관계가 점점 답답하게 짓눌리는 느낌이 납니다.`,
              hae: `해(害)는 서로의 기운을 갉아먹는 관계입니다. ${name ? `${name}은` : ''} 함께 있을수록 서로 지치고 약해지며, 눈에 띄지 않게 서서히 소모됩니다.`,
              pa: `파(破)는 서로 균열을 만드는 관계입니다. ${name ? `${name}은` : ''} 함께 세운 계획이나 약속이 자꾸 어긋나고, 안정감을 유지하기 어렵습니다.`,
              hap: '합(合) 요소가 있다는 건 서로 끌어당기는 기운이 있다는 뜻입니다. 매력과 친밀감이 생기지만, 합쳐질수록 오히려 독이 되는 관계일 수 있습니다.',
            };
            const c = COLOR[type] ?? '#888';
            return (
              <div className="mt-2 px-4 py-3 border animate-fade-in"
                style={{ borderColor: `${c}30`, background: `${c}08` }}>
                <p className="text-xs leading-relaxed" style={{ color: c }}>
                  {DESC[type] ?? ''}
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {/* AI 실패 알림 */}
      {aiError && (
        <div className="border border-[#1e1e1e] bg-[#0D0D0D] px-4 py-3 text-xs text-[#555] font-sans-kr">
          지금 서버가 바빠 사주 기본 구조 기반으로 분석을 표시합니다
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

            <BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall} teaser="감정 반응 패턴 · 에너지 역학 · 숨겨진 역학이 잠겨있습니다">
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

            <BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall} teaser="나머지 갈등 상황 · 갈등 트리거 · 관계별 특성이 잠겨있습니다">
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

                {ai.triggerPoints && ai.triggerPoints.length > 0 ? (
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
                ) : (
                  <Card>
                    <SubLabel text="갈등 트리거" />
                    <div className="space-y-2">
                      {result.tags.map((t, i) => (
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
            </BlurredPreview>

          {/* ════ 03 앞으로 이렇게 해보세요 ════ */}
          <SectionHeader number="03" title="앞으로 이렇게 해보세요" subtitle="상황별 실전 가이드 · 선긋기 · 현실적 전망" />

          {ai.avoidanceGuide ? (
            <Card accent="#FF2D55">
              <SubLabel text="마음가짐" />
              <p className="text-[#888] text-sm leading-relaxed">{ai.avoidanceGuide.mindset}</p>
            </Card>
          ) : phase2Loading ? (
            <Phase2Skeleton />
          ) : (
            <Card accent="#FF2D55">
              <SubLabel text="현실적 가이드" />
              <p className="text-[#888] text-sm leading-relaxed">
                이 관계의 충돌 구조는 구조적입니다. 상대를 바꾸려 하기보다, 충돌이 일어나는 상황 자체를 피하고 기대치를 조정하는 것이 현실적입니다.
              </p>
            </Card>
          )}

            {ai.avoidanceGuide ? (
              <BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall} teaser="실전 팁 · 선긋기 · 현실적 전망이 잠겨있습니다">
                <div className="space-y-3">
                  <Card>
                    <SubLabel text="실전 팁" />
                    <div className="space-y-3">
                      {ai.avoidanceGuide.practicalTips.map((tip, i) => (
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
                    <p className="text-[#888] text-sm leading-relaxed">{ai.avoidanceGuide.boundaries}</p>
                  </Card>
                  {ai.realisticOutlook && (
                    <div className="border border-[#FF2D55]/20 p-5 bg-[#FF2D55]/5">
                      <SubLabel text="현실적 전망" />
                      <p className="text-[#aaa] text-sm leading-relaxed">{ai.realisticOutlook}</p>
                    </div>
                  )}
                </div>
              </BlurredPreview>
            ) : phase2Loading ? <Phase2Skeleton /> : null}

          {/* ════ 04 이 관계가 나에게 주는 영향 ════ */}
          <SectionHeader number="04" title="이 관계가 나에게 주는 영향" subtitle="지금 이 관계가 나에게 하고 있는 것" />

          {phase2Loading ? (
            <Phase2Skeleton />
          ) : ai.personalImpact ? (
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

            {ai.personalImpact ? (
              <BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall} teaser="이 관계가 나를 갉아먹는 신호 · 잃어가고 있는 것이 잠겨있습니다">
                <div className="space-y-3">
                  {ai.personalImpact.warningSignals?.length > 0 && (
                    <Card>
                      <SubLabel text="이 관계가 나를 갉아먹는 신호" />
                      <div className="space-y-2">
                        {ai.personalImpact.warningSignals.map((signal, i) => (
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
                    <p className="text-[#aaa] text-sm leading-relaxed">{ai.personalImpact.whatYouLose}</p>
                  </div>
                </div>
              </BlurredPreview>
            ) : phase2Loading ? <Phase2Skeleton /> : null}

          {/* ════ 05 상대는 나를 어떻게 생각하는지 ════ */}
          <SectionHeader number="05" title="상대는 나를 어떻게 생각하는지" subtitle="상대방 눈에 비친 나의 모습" />

          {phase2Loading ? (
            <Phase2Skeleton />
          ) : ai.howTheySeeMe ? (
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

            {ai.howTheySeeMe ? (
              <BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall} teaser={`${result.targetStem}일(日) 기준 — 상대가 혼자 나를 평가하는 방식이 잠겨있습니다`}>
                <div className="space-y-3">
                  <Card>
                    <SubLabel text="상대방이 나 때문에 자극받는 것" />
                    <p className="text-[#888] text-sm leading-relaxed">{ai.howTheySeeMe.whatIrritates}</p>
                  </Card>
                  <Card>
                    <SubLabel text="그래도 나를 놓지 못하는 이유" />
                    <p className="text-[#888] text-sm leading-relaxed">{ai.howTheySeeMe.whatDrawsThem}</p>
                  </Card>
                  <Card>
                    <SubLabel text="상대방이 혼자 나를 평가하는 방식" />
                    <p className="text-[#888] text-sm leading-relaxed">{ai.howTheySeeMe.theirPrivateVerdict}</p>
                  </Card>
                  <div className="border border-[#F59E0B]/20 p-5 bg-[#F59E0B]/5">
                    <SubLabel text="상대방이 나에게 진짜로 원하는 것" />
                    <p className="text-[#aaa] text-sm leading-relaxed">{ai.howTheySeeMe.howTheyNeedMe}</p>
                  </div>
                </div>
              </BlurredPreview>
            ) : phase2Loading ? <Phase2Skeleton /> : null}

          {/* ════ 06 이 관계, 계속 가야 할까? ════ */}
          <SectionHeader number="06" title="이 관계, 계속 가야 할까?" subtitle="사주 구조로 보는 냉철한 판단" />

          {phase2Loading ? (
            <Phase2Skeleton />
          ) : ai.continuationAssessment ? (
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

            {ai.continuationAssessment ? (
              <BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall} teaser="구조적 분석 · 레드라인 · 관계 지속 가능성이 잠겨있습니다">
                <div className="space-y-3">
                  <Card>
                    <SubLabel text="구조적 분석" />
                    <p className="text-[#888] text-sm leading-relaxed">{ai.continuationAssessment.structuralAnalysis}</p>
                  </Card>
                  <Card>
                    <SubLabel text="계속하려면 필요한 것" />
                    <p className="text-[#888] text-sm leading-relaxed">{ai.continuationAssessment.whatItTakes}</p>
                  </Card>
                  <Card accent="#FF2D55">
                    <SubLabel text="이 신호가 보이면 재고하세요" />
                    <p className="text-[#888] text-sm leading-relaxed">{ai.continuationAssessment.redLine}</p>
                  </Card>
                </div>
              </BlurredPreview>
            ) : phase2Loading ? <Phase2Skeleton /> : null}
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

            <BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall} teaser="나의 위험 유형 · 숨겨진 패턴이 잠겨있습니다">
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

            <BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall} teaser="추가 갈등 상황 · 갈등 트리거 · 반복 패턴이 잠겨있습니다">
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
            </BlurredPreview>

          <SectionHeader number="03" title="앞으로 이렇게 해보세요" subtitle="내 패턴을 이해하고 충돌 줄이기" />

          {ai.avoidanceGuide ? (
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

            {ai.avoidanceGuide ? (
              <BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall}>
                <div className="space-y-3">
                  <Card>
                    <SubLabel text="실전 팁" />
                    <div className="space-y-3">
                      {ai.avoidanceGuide.practicalTips.map((tip, i) => (
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
                    <p className="text-[#888] text-sm leading-relaxed">{ai.avoidanceGuide.boundaries}</p>
                  </Card>
                </div>
              </BlurredPreview>
            ) : null}
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

      {/* 공유 이미지 카드 */}
      <div className="border border-[#1e1e1e] p-5 bg-[#0D0D0D]">
        <p className="text-[#555] text-[10px] uppercase tracking-[0.25em] mb-4">공유 카드</p>
        <div className="flex justify-center">
          <ShareCard ref={shareCardRef} myName={myData.name} result={result} />
        </div>
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
              <button onClick={handleSubmitReview}
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

      <button onClick={onReset}
        className="w-full py-4 border border-[#1e1e1e] text-[#555] hover:border-[#FF2D55]/40 hover:text-white transition-all text-sm">
        다른 관계도 분석해보기 →
      </button>
    </div>
  );
}

declare global {
  interface Window {
    Kakao: { isInitialized: () => boolean; Share: { sendDefault: (o: object) => void } };
  }
}
