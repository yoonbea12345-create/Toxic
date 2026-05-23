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
  full:  { label: '?�전 분석', color: '#FF2D55', desc: '4�?8??기반' },
  day:   { label: '?��? 분석', color: '#BF5AF2', desc: '?�·월·?�주 기반' },
  month: { label: '?�화 분석', color: '#F59E0B', desc: '?�·월�?기반' },
  year:  { label: '기본 분석', color: '#F59E0B', desc: '?�주 기반' },
};

const LOADING_STEPS = [
  { pctStart: 0,  pctEnd: 20,  label: '?�주 기본 ?�보 ?�인',    sub: '年柱 · ?�柱 · ?�柱 · ?�柱',     hanja: '?? },
  { pctStart: 20, pctEnd: 40,  label: '충돌 구조 분석',          sub: '�?· ??· �?· ??계산',         hanja: '�? },
  { pctStart: 40, pctEnd: 60,  label: '감정 ?�턴 ?�석',          sub: '???�람??기질 충돌 방식',        hanja: '�? },
  { pctStart: 60, pctEnd: 80,  label: '갈등 ?�나리오 ?�출',      sub: '?�제 ?�질 법한 ?�황 분석',        hanja: '?? },
  { pctStart: 80, pctEnd: 100, label: '최종 분석 ?�리',          sub: '?�피 ?�략 & 결론 ?�출',           hanja: '�? },
];

const SAJU_QUOTES = [
  '?�주(?�柱)???�신???�명???�니?? ?�고??기질?�니??',
  '�?�????�다�??�쁜 관계�? ?�닙?�다. 갈등 방식???��? 뿐입?�다.',
  '?�주(?�柱)???�의 진짜 ?�아�??��? 기둥?�니??',
  '갑목(?�木)?�??�?�무처럼 꺾여???�시 ?�어?�니??',
  '?�오�?子午�??�?물과 불처??근본???�른 충돌?�니??',
  '?�주(年柱)???��? ?�아???�경???�적?�니??',
  '?�주?�서 �??? 기운??강하�??�칙�??�행?�이 ?�어?�니??',
  '??�???겉으�??�러?��? ?��?�??�서???�너지�?갉아먹습?�다.',
  '?�주(?�柱)???��? ?�회?�서 보여주는 ?�굴?�니??',
  '???? 기운??강하�?중심??굳건?��?�?고집???�????�습?�다.',
  '?????�?충보???�리�? ?��?�???깊이 관계�? ?�박?�니??',
  '??�? 기운??강하�??�연?�고 ?�찰?�이 ?�어?�니??',
  '?�주(?�柱)???�생 ?�반부?�??��? ?�을 ?�습?�다.',
  '???? 기운??강하�??�정?�이�??�현?�이 ?��??�니??',
  '???????�다�???�� 좋�? 관계는 ?�닙?�다.',
  '�??? 기운??강하�??�장�??�명?�이 ?�칩?�다.',
  '�????�??�쪽???�른 쪽을 ?�러?? 결국 ?�쪽 ???�모?�니??',
  '?�주 분석??목적?�??�명 ?�기가 ?�니?????�기?�니??',
  '겁재(?�財)가 강하�?경쟁?�이 강하�?주도�??�툼????��?�다.',
  '?�오??寅午?? ?��? 강한 불의 기운??만들?�냅?�다.',
  '?�성지?�는 ?�쁜 ?�람??구별?�는 지?��? ?�닙?�다.',
  '?�살(神�?)보다 ?�주???�이 관�??�체�?좌우?�니??',
  '?�주???�신???�떤 ?�황?�서 강해지?��?�??�려줍니??',
  '천간(天干)?�??�러???�너지, 지지(?�支)???�겨�??�너지?�니??',
  '충이 많다�?불행?��? ?�습?�다. ?�히???�극???�기???�니??',
  '진술축�?(辰戌丑未)?????? 기운??4가지 ?�굴?�니??',
  '?�행(五行) �?부족한 기운???�간관계에??채워지기도 ?�니??',
  '?�주?�서 ??�?가 ?�으�??�연?�이 부족할 ???�습?�다.',
  '??????충을 ?�소?�기???��?�? ??복잡?�게 만들기도 ?�니??',
  '기질?�?바�? ???�어?? 반응 방식?�?바�? ???�습?�다.',
  '비견(比肩)??강하�??�립?�이 강하�??�기 방식??고집?�니??',
  '?�해�?巳亥�??�??�상�??�실??충돌?�는 구조?�니??',
  '?�주??갈등???�인???�명?��?�? ?�결책�? ?�신??만듭?�다.',
  '?�신(食神)??강하�?창의?�이�??�현 ?�구가 ?��??�니??',
  '?�신�?寅申�??�??�유?�?규칙??부?�히??충돌?�니??',
  '공망(空亡)???�으�?�?분야?�서 ?�상�?못한 공백???�깁?�다.',
  '?�간(?�干)?�????�신???�행 ?�너지�??��??�니??',
  '묘유�???���??�?감성�??�실??충돌?�는 구조?�니??',
  '?�주?�서 ????가 ?�으�??�정�??�현?�이 부족할 ???�습?�다.',
  '?�재(正財)가 강하�??�정?�이�?계획?�인 ?�향?�니??',
  '축�?�?丑未�??�?같�? 방향처럼 보이지�??�제로는 반�??�니??',
  '?�행??균형보다 기운 간의 ?�름????중요?�니??',
  '?��?(?�官)??강하�?창의?�이지�?반항??기질???�습?�다.',
  '진술�?辰戌�??�???강한 ??기운??방향???�고 충돌?�니??',
  '?�주 분석?�?미래�??�측?�는 �??�니?? ?�턴???�식?�는 겁니??',
  '관??官�?)??강하�?책임감이 강하�??�박???��??�니??',
  '지지(?�支) 충돌???�어??천간(天干) ?�이 ?�으�?균형???�힙?�다.',
  '?�인(?�印)??강하�??�창?�이지�??�로?�???�끼�??�습?�다.',
  '?�주???�성지?�는 관계의 충돌 ?�너지�??�치?�한 것입?�다.',
  '가????맞는 ?�주???�습?�다. ?�떤 충돌??감당?????�는지가 중요?�니??',
  '?�양(?�陽)??균형??깨�?�?관계에????�� ?�쪽?????�모?�니??',
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

      {/* Saju year cards ??compact */}
      <div className="flex items-center gap-5 mb-10">
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-[#2a2a2a] text-[9px] tracking-[0.25em] uppercase">??/p>
          <div className="w-11 h-13 border border-[#181818] bg-[#080808] flex flex-col items-center justify-center px-2 py-2 gap-0.5">
            <span className="font-display text-lg leading-none" style={{ color }}>{result.myYear?.stem ?? '?'}</span>
            <span className="font-display text-lg leading-none text-[#555]">{result.myYear?.branch ?? '?'}</span>
          </div>
          <p className="text-[#1e1e1e] text-[8px]">�?/p>
        </div>

        {hasTarget && result.targetYear && (
          <>
            <div className="flex flex-col gap-1 items-center">
              <div className="w-px h-5 bg-[#1a1a1a]" />
              <span className="font-display text-xs" style={{ color: `${color}60` }}>VS</span>
              <div className="w-px h-5 bg-[#1a1a1a]" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-[#2a2a2a] text-[9px] tracking-[0.25em] uppercase">?��?</p>
              <div className="w-11 h-13 border border-[#181818] bg-[#080808] flex flex-col items-center justify-center px-2 py-2 gap-0.5">
                <span className="font-display text-lg leading-none" style={{ color: color2 }}>{result.targetYear.stem}</span>
                <span className="font-display text-lg leading-none text-[#555]">{result.targetYear.branch}</span>
              </div>
              <p className="text-[#1e1e1e] text-[8px]">�?/p>
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

      {/* 진행�??�시 ????�� ?�아?�는 ?�낌 */}
      {!isDone && (
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex gap-1">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-1 h-1 rounded-full"
                style={{ background: color, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </span>
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: `${color}99` }}>
            분석 진행 �?
          </span>
        </div>
      )}

      {/* Status text */}
      <div className="text-center max-w-[240px]">
        <p key={step.label} className="text-white text-sm font-medium mb-1.5 char-enter">
          {isDone ? '분석 ?�료' : step.label}
        </p>
        <p className="text-[#888] text-xs leading-relaxed">
          {isDone ? '결과�?불러?�는 �?..' : step.sub}
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
  const label = score >= 80 ? '강한 충돌' : score >= 60 ? '중간 충돌' : '경�???충돌';
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

function ToggleBtn({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full py-2.5 border border-[#1e1e1e] text-[#555] text-xs hover:border-[#FF2D55]/40 hover:text-[#FF2D55] transition-colors mt-1"
    >
      {open ? '?�기 ?? : '?�보�???}
    </button>
  );
}

function BlurredPreview({ children, unlocked, onUnlock }: {
  children: React.ReactNode;
  unlocked: boolean;
  onUnlock: () => void;
}) {
  if (unlocked) return <>{children}</>;
  return (
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
            ??PRICE_ALL.toLocaleString()}?�로 ???�세??보기 ??
          </span>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(255,255,255,0.07)' }} />
        </button>
      </div>
    </div>
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

// ?�?�??�금 ?�이�?SVG ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
function LockIcon({ size = 20, color = '#FF2D55' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="10" rx="1" stroke={color} strokeWidth="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="16" r="1.5" fill={color} />
    </svg>
  );
}

// ?�?�?가�??�수 ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
const PRICE_ALL = 500;

// ?�?�?결제 ?�업 모달 ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
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
                <span className="text-[9px] font-bold tracking-[0.2em] text-[#FF2D55] font-sans-kr">?�세 분석 ?�금</span>
              </div>
              <button onClick={onClose}
                className="w-7 h-7 flex items-center justify-center text-[#333] hover:text-[#555] text-lg transition-colors">
                ??
              </button>
            </div>

            {/* Big headline */}
            <p className="font-display text-white leading-[1.05] mb-1"
              style={{ fontSize: 'clamp(1.75rem, 8vw, 2.3rem)' }}>
              지�???보면
            </p>
            <p className="font-display text-white leading-[1.05] mb-1"
              style={{ fontSize: 'clamp(1.75rem, 8vw, 2.3rem)' }}>
              관계�?
            </p>
            <p className="font-display text-[#FF2D55] leading-[1.05] mb-4"
              style={{ fontSize: 'clamp(1.75rem, 8vw, 2.3rem)' }}>
              보입?�다
            </p>

            {conflictType && (
              <p className="font-sans-kr text-[#3a3a3a] text-[11px] mb-5">
                ??<span className="text-[#555]">{conflictType}</span> 구조 ?�세 분석
              </p>
            )}

            <div className="space-y-2 mb-5">
              {[
                '�??�션 ?�겨�??�세 분석 ?�체',
                '?�황�??�전 ?�동 지�???갈등 ?�·중·??,
                '??관계에???�신???�어가??것들',
                'AI 최종 ?�정 ???�직?�고 ?�호?�게',
              ].map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#FF2D55] text-xs mt-0.5 flex-shrink-0">??/span>
                  <p className="text-[#777] text-xs leading-relaxed font-sans-kr">{b}</p>
                </div>
              ))}
            </div>

            <div className="h-px bg-[#111] mb-4" />

            {/* Price */}
            <div className="flex items-center justify-between mb-4 px-1">
              <p className="font-sans-kr text-[#444] text-xs">?�체 ?�보�??�금 ?�제</p>
              <div className="flex items-end gap-2">
                <span className="font-sans-kr text-[#2a2a2a] text-xs line-through">??,900</span>
                <span className="font-display text-white text-3xl leading-none">??PRICE_ALL.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={onPay}
              className="w-full py-4 text-white font-bold text-base tracking-wide mb-3 relative overflow-hidden group font-sans-kr"
              style={{
                background: 'linear-gradient(90deg, #FF2D55 0%, #BF5AF2 100%)',
                boxShadow: '0 0 40px rgba(255,45,85,0.45)',
              }}>
              <span className="relative z-10">
                {myName ? `${myName}?? : '지�?} ??PRICE_ALL.toLocaleString()}?�로 ?�체 보기 ??
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(255,255,255,0.08)' }} />
            </button>

            <div className="flex items-center justify-center gap-3 text-[#222] text-[9px] font-sans-kr">
              <span>?�� 즉시 ?�금 ?�제</span>
              <span>·</span>
              <span>?�전 결제</span>
              <span>·</span>
              <span>100% ?�불</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ?�?�??�금 ?�제 ?�버?�이 ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
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
          {name}?�만???�해<br />
          ?�체 분석<br />
          <span className="text-[#FF2D55]">100??무료</span> ?�공!
        </p>
        <p className="text-[#444] text-xs leading-relaxed font-sans-kr">?�금???�제?�니??..</p>
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

// ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
// 메인 컴포?�트
// ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
export default function StepResult({ myData, targetData, result, relationType, onReset }: StepResultProps) {
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [aiPhase1, setAiPhase1] = useState<AIAnalysis | null>(null);
  const [aiPhase2, setAiPhase2] = useState<Partial<AIAnalysis> | null>(null);
  const [phase2Loading, setPhase2Loading] = useState(true);
  const [, setApiDone] = useState(false);
  // apiProgress: ?�제 API ?�트�?진행 (0-100)
  // displayProgress: ?�용?�에�?보이??진행 (0??0 빠르�? 80??00 천천??
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

  // ?�료 ?�환 ???�체 ?�일 결제
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
  };

  const hasTarget = Boolean(targetData.birthdate);
  const accuracyInfo = ACCURACY_LABELS[result.accuracyLevel] ?? ACCURACY_LABELS.year;

  // MINT 방식 로딩: gap*coeff + 최소 floor ???�학?�으�??��? 멈추지 ?�음
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

        // Phase 1: 3.5�??�에 4??2% (ease-out 빠른 초반)
        if (elapsed < 3500 && prev < 72) {
          const t = elapsed / 3500;
          return Math.max(prev, 4 + (1 - Math.pow(1 - t, 2.2)) * 68);
        }

        // Phase 2: API ?�제 진행 추적 + 최소 0.08/tick 보장 (?��? 멈추지 ?�음)
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

  // apiProgress ??ref ?�기??
  useEffect(() => { apiProgressRef.current = apiProgress; }, [apiProgress]);

  // Phase 1: 로딩 ?�면 �??�행 (최소 3�?보장)
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

  // Phase 2: 결과 ?�면???�는 ?�간 ?�작
  useEffect(() => {
    if (showLoading) return;
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
  }, [showLoading]);

  // 결과 ?�면 진입 ???�션 ?�??기록 ??반드??조건부 return ?�에 ?�치?�야 ??
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
    showToast('링크가 복사?�었?�니??);
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
        buttons: [{ title: '?�도 분석?�기', link: { mobileWebUrl: 'https://toxic.kr', webUrl: 'https://toxic.kr' } }],
      });
    } else {
      navigator.clipboard.writeText('https://toxic.kr').catch(() => {});
      showToast('카카??미연�???링크�?복사?�어??);
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
    showToast('?�기 감사?�니??');
  };

  return (
    <div className="animate-fade-in max-w-lg mx-auto px-4 py-8 space-y-4 pb-24">

      {/* 결제 ?�업 모달 */}
      {showPaywall && (
        <PaywallModal
          myName={myData.name || ''}
          conflictType={result.conflictType}
          onClose={() => setShowPaywall(false)}
          onPay={handlePayment}
        />
      )}

      {/* ?�단 고정 CTA ??미결???�태?�서 ??�� ?�출 */}
      {!isAllUnlocked && !showPaywall && (
        <div className="fixed bottom-0 left-0 right-0 z-40"
          style={{ background: 'rgba(6,6,6,0.97)', borderTop: '1px solid rgba(255,45,85,0.25)' }}>
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[#444] text-[9px] tracking-[0.15em] uppercase">?�체 분석 ?�금</p>
              <p className="text-white text-xs font-bold font-sans-kr mt-0.5">
                <span className="text-[#555] line-through text-[10px] mr-1.5">??,900</span>
                ??PRICE_ALL.toLocaleString()}
              </p>
            </div>
            <button onClick={handleOpenPaywall}
              className="flex-shrink-0 px-5 py-2.5 text-white text-sm font-bold font-sans-kr tracking-wide"
              style={{ background: 'linear-gradient(90deg, #FF2D55 0%, #BF5AF2 100%)', boxShadow: '0 0 20px rgba(255,45,85,0.35)' }}>
              지�??�체 보기 ??
            </button>
          </div>
        </div>
      )}

      {/* 결제 ?�공 ?�버?�이 */}
      <FreeSuccessOverlay visible={showFreeSuccess} myName={myData.name || ''} />

      {/* ?�스???�림 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1a] border border-[#FF2D55]/40 text-white text-sm px-5 py-3 animate-fade-in whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* ?�더 */}
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
                {myData.gender === '?? ? '?? : '?�?}
              </div>
              <span className="text-white text-xs">{myData.name || '??}</span>
              <span className="text-[#555] text-xs">{result.myStem}{result.myBranch}??/span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-px bg-[#FF2D55]" />
              <span className="text-[#FF2D55] text-xs font-bold">VS</span>
              <div className="w-8 h-px bg-[#FF2D55]" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-[#BF5AF2]/20 border border-[#BF5AF2]/30 flex items-center justify-center text-lg">
                {targetData.gender === '?? ? '?? : '?�?}
              </div>
              <span className="text-white text-xs">{targetData.name || '?��?'}</span>
              <span className="text-[#555] text-xs">{result.targetStem}{result.targetBranch}??/span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#FF2D55]/20 border border-[#FF2D55]/30 flex items-center justify-center text-2xl mb-2">
              {myData.gender === '?? ? '?? : '?�?}
            </div>
            <span className="text-white text-sm">{myData.name || '??}</span>
            <span className="text-[#555] text-xs mt-1">???�험 ?�형 분석</span>
          </div>
        )}

        <ScoreGauge score={result.toxicScore} />
      </div>

      {/* 빠른 공유 */}
      <div className="flex justify-center gap-2">
        <button onClick={handleKakaoShare}
          className="px-4 py-2 bg-[#FEE500] text-[#3C1E1E] text-xs font-bold hover:opacity-90 transition-opacity">
          카카?�톡 공유
        </button>
        <button onClick={handleSaveImage}
          className="px-4 py-2 border border-[#1e1e1e] text-[#888] text-xs hover:border-[#FF2D55]/40 hover:text-white transition-colors">
          ?��?지 ?�??
        </button>
        <button onClick={handleCopyLink}
          className="px-4 py-2 border border-[#1e1e1e] text-[#888] text-xs hover:border-[#FF2D55]/40 hover:text-white transition-colors">
          링크 복사
        </button>
      </div>

      {/* 충돌 뱃�? + tooltip */}
      {(result.conflicts.chung.length > 0 || result.conflicts.hyung.length > 0 ||
        result.conflicts.hae.length > 0 || result.conflicts.pa.length > 0 || result.conflicts.hap.length > 0) && (
        <div>
          <p className="text-[#333] text-[9px] uppercase tracking-[0.2em] mb-2">?�주 충돌 구조 ????���??�명</p>
          <div className="flex flex-wrap gap-2">
            {result.conflicts.chung.map(c => (
              <button key={c.name}
                onClick={() => setConflictTooltip(conflictTooltip === `chung-${c.name}` ? null : `chung-${c.name}`)}
                className={`text-[11px] px-3 py-1.5 border transition-all ${conflictTooltip === `chung-${c.name}` ? 'border-[#FF2D55] bg-[#FF2D55]/15 text-[#FF2D55]' : 'border-[#FF2D55]/40 text-[#FF2D55] bg-[#FF2D55]/8'}`}>
                �?· {c.name}
              </button>
            ))}
            {result.conflicts.hyung.map(h => (
              <button key={h.name}
                onClick={() => setConflictTooltip(conflictTooltip === `hyung-${h.name}` ? null : `hyung-${h.name}`)}
                className={`text-[11px] px-3 py-1.5 border transition-all ${conflictTooltip === `hyung-${h.name}` ? 'border-[#BF5AF2] bg-[#BF5AF2]/15 text-[#BF5AF2]' : 'border-[#BF5AF2]/40 text-[#BF5AF2] bg-[#BF5AF2]/8'}`}>
                ??· {h.name}
              </button>
            ))}
            {result.conflicts.hae.map(h => (
              <button key={h.name}
                onClick={() => setConflictTooltip(conflictTooltip === `hae-${h.name}` ? null : `hae-${h.name}`)}
                className={`text-[11px] px-3 py-1.5 border transition-all ${conflictTooltip === `hae-${h.name}` ? 'border-[#F59E0B] bg-[#F59E0B]/15 text-[#F59E0B]' : 'border-[#F59E0B]/40 text-[#F59E0B] bg-[#F59E0B]/8'}`}>
                ??· {h.name}
              </button>
            ))}
            {result.conflicts.pa.map(p => (
              <button key={p.name}
                onClick={() => setConflictTooltip(conflictTooltip === `pa-${p.name}` ? null : `pa-${p.name}`)}
                className={`text-[11px] px-3 py-1.5 border transition-all ${conflictTooltip === `pa-${p.name}` ? 'border-[#F59E0B] bg-[#F59E0B]/15 text-[#F59E0B]' : 'border-[#F59E0B]/40 text-[#F59E0B] bg-[#F59E0B]/8'}`}>
                ??· {p.name}
              </button>
            ))}
            {result.conflicts.hap.length > 0 && (
              <button
                onClick={() => setConflictTooltip(conflictTooltip === 'hap' ? null : 'hap')}
                className={`text-[11px] px-3 py-1.5 border transition-all ${conflictTooltip === 'hap' ? 'border-[#BF5AF2] bg-[#BF5AF2]/15 text-[#BF5AF2]' : 'border-[#BF5AF2]/40 text-[#BF5AF2] bg-[#BF5AF2]/8'}`}>
                ???�소 ?�음
              </button>
            )}
          </div>

          {/* ?�라??tooltip ?�명 */}
          {conflictTooltip && (() => {
            const type = conflictTooltip.split('-')[0];
            const name = conflictTooltip.includes('-') ? conflictTooltip.split('-').slice(1).join('-') : '';
            const COLOR: Record<string, string> = { chung: '#FF2D55', hyung: '#BF5AF2', hae: '#F59E0B', pa: '#F59E0B', hap: '#BF5AF2' };
            const DESC: Record<string, string> = {
              chung: `�?�??�???기운???�반?�?방향?�로 부?�히??관계입?�다. ${name ? `${name}?�? : ''} ?�로???�너지가 충돌???�툼????��, ?�상�?못한 변?��? 갑자�??�질 ???�습?�다.`,
              hyung: `?????�??�로�??�박?�고 ?�극?�는 관계입?�다. ${name ? `${name}?�? : ''} 말하지 못한 긴장???�이�? 관계�? ?�점 ?�답?�게 짓눌리는 ?�낌???�니??`,
              hae: `??�????�로??기운??갉아먹는 관계입?�다. ${name ? `${name}?�? : ''} ?�께 ?�을?�록 ?�로 지치고 ?�해지�? ?�에 ?��? ?�게 ?�서???�모?�니??`,
              pa: `???????�로 균열??만드??관계입?�다. ${name ? `${name}?�? : ''} ?�께 ?�운 계획?�나 ?�속???�꾸 ?�긋?�고, ?�정감을 ?��??�기 ?�렵?�니??`,
              hap: '???? ?�소가 ?�다??�??�로 ?�어?�기??기운???�다???�입?�다. 매력�?친�?감이 ?�기지�? ?�쳐질수�??�히???�이 ?�는 관계일 ???�습?�다.',
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

      {/* AI ?�패 ?�림 */}
      {aiError && (
        <div className="border border-[#1e1e1e] bg-[#0D0D0D] px-4 py-3 text-xs text-[#555] font-sans-kr">
          지�??�버가 바빠 ?�주 기본 구조 기반?�로 분석???�시?�니??
        </div>
      )}

      {/* ?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═
          결과 (?��? ?�을 ??
      ?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═ */}
      {hasTarget && (
        <div className="space-y-2">

          {/* ?�═?�═ 01 ?��? ?�맞???�유 ?�═?�═ */}
          <SectionHeader number="01" title="?��? ?�맞???�유" subtitle="?�주 구조?�서 비롯??근본?�인 충돌 ?�인" />

          <Card accent="#FF2D55">
            <SubLabel text="?�심 갈등 구조" />
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

          {isOpen('s01') && (
            <BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall}>
              <div className="space-y-3">
                {(ai.conflictAnalysis?.chung || ai.conflictAnalysis?.hyung ||
                  ai.conflictAnalysis?.geuk ||
                  result.analysis.chungAnalysis || result.analysis.hyungAnalysis) && (
                  <Card>
                    <SubLabel text="?�주 충돌 분석" />
                    <div className="space-y-4">
                      {(ai.conflictAnalysis?.chung || result.analysis.chungAnalysis) && (
                        <div>
                          <span className="text-[10px] border border-[#FF2D55]/40 text-[#FF2D55] px-2 py-0.5 inline-block mb-2">�?�?</span>
                          <p className="text-[#888] text-sm leading-relaxed">{ai.conflictAnalysis?.chung || result.analysis.chungAnalysis}</p>
                        </div>
                      )}
                      {(ai.conflictAnalysis?.hyung || result.analysis.hyungAnalysis) && (
                        <div className="border-t border-[#1a1a1a] pt-4">
                          <span className="text-[10px] border border-[#BF5AF2]/40 text-[#BF5AF2] px-2 py-0.5 inline-block mb-2">????</span>
                          <p className="text-[#888] text-sm leading-relaxed">{ai.conflictAnalysis?.hyung || result.analysis.hyungAnalysis}</p>
                        </div>
                      )}
                      {(ai.conflictAnalysis?.geuk || result.analysis.geukAnalysis) && (
                        <div className="border-t border-[#1a1a1a] pt-4">
                          <span className="text-[10px] border border-[#FF2D55]/40 text-[#FF2D55] px-2 py-0.5 inline-block mb-2">�???</span>
                          <p className="text-[#888] text-sm leading-relaxed">{ai.conflictAnalysis?.geuk || result.analysis.geukAnalysis}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {ai.emotionalPattern ? (
                  <Card>
                    <SubLabel text="감정 반응 ?�턴" />
                    <div className="space-y-4">
                      <div>
                        <p className="text-[#555] text-[11px] mb-1.5">?�의 반응 방식</p>
                        <p className="text-[#888] text-sm leading-relaxed">{ai.emotionalPattern.myPattern}</p>
                      </div>
                      <div className="border-t border-[#1a1a1a] pt-4">
                        <p className="text-[#555] text-[11px] mb-1.5">?��???반응 방식</p>
                        <p className="text-[#888] text-sm leading-relaxed">{ai.emotionalPattern.targetPattern}</p>
                      </div>
                      <div className="border-t border-[#1a1a1a] pt-4 bg-[#FF2D55]/5 -mx-5 px-5 py-4 -mb-5">
                        <p className="text-[#555] text-[11px] mb-1.5">반복?�는 ?�이??/p>
                        <p className="text-[#aaa] text-sm leading-relaxed">{ai.emotionalPattern.cycle}</p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card>
                    <SubLabel text="감정 반응 ?�턴" />
                    <p className="text-[#888] text-sm leading-relaxed">{result.conflictSummary}</p>
                  </Card>
                )}

                {ai.energyDynamic && (
                  <Card accent="#BF5AF2">
                    <SubLabel text="?�너지 ??��" />
                    <div className="space-y-3">
                      <div>
                        <p className="text-[#555] text-[11px] mb-1">?��? ???�모?�나</p>
                        <p className="text-[#888] text-sm leading-relaxed">{ai.energyDynamic.whoLoses}</p>
                      </div>
                      <div className="border-t border-[#1a1a1a] pt-3">
                        <p className="text-[#555] text-[11px] mb-1">?�모 방식</p>
                        <p className="text-[#888] text-sm leading-relaxed">{ai.energyDynamic.drainMechanism}</p>
                      </div>
                      <div className="border-t border-[#1a1a1a] pt-3">
                        <p className="text-[#555] text-[11px] mb-1">?�기 ?�망</p>
                        <p className="text-[#aaa] text-sm leading-relaxed">{ai.energyDynamic.longTermEffect}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {ai.hiddenDynamic && (
                  <div className="border border-[#FF2D55]/20 p-5 bg-[#FF2D55]/5">
                    <SubLabel text="?�겨�???��" />
                    <p className="text-[#aaa] text-sm leading-relaxed">{ai.hiddenDynamic}</p>
                  </div>
                )}
              </div>
            </BlurredPreview>
          )}

          {/* ?�═?�═ 02 ?�떤 ?�황?�서 ?�맞?��? ?�═?�═ */}
          <SectionHeader number="02" title="?�떤 ?�황?�서 ?�맞?��?" subtitle="?�제�?충돌???��???구체???�나리오" />

          {ai.conflictScenarios && ai.conflictScenarios.length > 0 ? (
            <Card>
              <div className="flex items-start gap-3">
                <span className="text-[#FF2D55] font-display text-2xl leading-none mt-0.5 flex-shrink-0">1</span>
                <div>
                  <p className="text-white text-sm font-bold mb-2">{ai.conflictScenarios[0].situation}</p>
                  <p className="text-[#777] text-xs leading-relaxed mb-3">{ai.conflictScenarios[0].whatHappens}</p>
                  <div className="border-t border-[#1a1a1a] pt-2">
                    <p className="text-[#FF2D55]/60 text-[11px]">?�주 구조 ??{ai.conflictScenarios[0].whySaju}</p>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <SubLabel text="충돌 ?�황" />
              <p className="text-[#888] text-sm leading-relaxed">{result.conflictSummary}</p>
            </Card>
          )}

          {isOpen('s02') && (
            <BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall}>
              <div className="space-y-3">
                {ai.conflictScenarios && ai.conflictScenarios.slice(1).map((s, i) => (
                  <Card key={i}>
                    <div className="flex items-start gap-3">
                      <span className="text-[#FF2D55] font-display text-2xl leading-none mt-0.5 flex-shrink-0">{i + 2}</span>
                      <div>
                        <p className="text-white text-sm font-bold mb-2">{s.situation}</p>
                        <p className="text-[#777] text-xs leading-relaxed mb-3">{s.whatHappens}</p>
                        <div className="border-t border-[#1a1a1a] pt-2">
                          <p className="text-[#FF2D55]/60 text-[11px]">?�주 구조 ??{s.whySaju}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {ai.triggerPoints && ai.triggerPoints.length > 0 ? (
                  <Card>
                    <SubLabel text="갈등 ?�리�? />
                    <div className="space-y-2">
                      {ai.triggerPoints.map((t, i) => (
                        <div key={i} className="flex items-start gap-3 py-2 border-b border-[#1a1a1a] last:border-0">
                          <span className="text-[#FF2D55] text-xs mt-0.5 flex-shrink-0">??/span>
                          <p className="text-[#888] text-sm">{t}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : (
                  <Card>
                    <SubLabel text="갈등 ?�리�? />
                    <div className="space-y-2">
                      {result.tags.map((t, i) => (
                        <div key={i} className="flex items-start gap-3 py-2 border-b border-[#1a1a1a] last:border-0">
                          <span className="text-[#FF2D55] text-xs mt-0.5 flex-shrink-0">??/span>
                          <p className="text-[#888] text-sm">{t}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {ai.relationSpecific && (
                  <Card>
                    <SubLabel text={`${relationType} 관계에???�히`} />
                    <p className="text-[#888] text-sm leading-relaxed">{ai.relationSpecific}</p>
                  </Card>
                )}
              </div>
            </BlurredPreview>
          )}

          {/* ?�═?�═ 03 ?�으�??�렇�??�보?�요 ?�═?�═ */}
          <SectionHeader number="03" title="?�으�??�렇�??�보?�요" subtitle="?�황�??�전 가?�드 · ?�긋�?· ?�실???�망" />

          {ai.avoidanceGuide ? (
            <Card accent="#FF2D55">
              <SubLabel text="마음가�? />
              <p className="text-[#888] text-sm leading-relaxed">{ai.avoidanceGuide.mindset}</p>
            </Card>
          ) : phase2Loading ? (
            <Phase2Skeleton />
          ) : (
            <Card accent="#FF2D55">
              <SubLabel text="?�실??가?�드" />
              <p className="text-[#888] text-sm leading-relaxed">
                ??관계의 충돌 구조??구조?�입?�다. ?��?�?바꾸???�기보다, 충돌???�어?�는 ?�황 ?�체�??�하�?기�?치�? 조정?�는 것이 ?�실?�입?�다.
              </p>
            </Card>
          )}

          {isOpen('s03') && (
            ai.avoidanceGuide ? (
              <BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall}>
                <div className="space-y-3">
                  <Card>
                    <SubLabel text="?�전 ?? />
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
                    <SubLabel text="?�긋�? />
                    <p className="text-[#888] text-sm leading-relaxed">{ai.avoidanceGuide.boundaries}</p>
                  </Card>
                  {ai.realisticOutlook && (
                    <div className="border border-[#FF2D55]/20 p-5 bg-[#FF2D55]/5">
                      <SubLabel text="?�실???�망" />
                      <p className="text-[#aaa] text-sm leading-relaxed">{ai.realisticOutlook}</p>
                    </div>
                  )}
                </div>
              </BlurredPreview>
            ) : phase2Loading ? <Phase2Skeleton /> : null
          )}

          {/* ?�═?�═ 04 ??관계�? ?�에�?주는 ?�향 ?�═?�═ */}
          <SectionHeader number="04" title="??관계�? ?�에�?주는 ?�향" subtitle="지�???관계�? ?�에�??�고 ?�는 �? />

          {phase2Loading ? (
            <Phase2Skeleton />
          ) : ai.personalImpact ? (
            <Card accent="#BF5AF2">
              <SubLabel text="지�??�에�?미치???�향" />
              <p className="text-[#888] text-sm leading-relaxed">{ai.personalImpact.onMe}</p>
            </Card>
          ) : (
            <Card accent="#BF5AF2">
              <SubLabel text="??관계의 ?�너지 ?�모" />
              <p className="text-[#888] text-sm leading-relaxed">
                충돌 구조가 강한 관계일?�록 ?��????�는 감정 비용???�니?? ??관계에??반복?�으�??�끼???�로감�? ?��???부족이 ?�니??구조??문제?�니??
              </p>
            </Card>
          )}

          {isOpen('s04') && (
            ai.personalImpact ? (
              <BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall}>
                <div className="space-y-3">
                  {ai.personalImpact.warningSignals?.length > 0 && (
                    <Card>
                      <SubLabel text="??관계�? ?��? 갉아먹는 ?�호" />
                      <div className="space-y-2">
                        {ai.personalImpact.warningSignals.map((signal, i) => (
                          <div key={i} className="flex items-start gap-3 py-2 border-b border-[#1a1a1a] last:border-0">
                            <span className="text-[#BF5AF2] text-xs mt-0.5 flex-shrink-0">??/span>
                            <p className="text-[#888] text-sm">{signal}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                  <div className="border border-[#BF5AF2]/20 p-5 bg-[#BF5AF2]/5">
                    <SubLabel text="?�어가�??�는 �? />
                    <p className="text-[#aaa] text-sm leading-relaxed">{ai.personalImpact.whatYouLose}</p>
                  </div>
                </div>
              </BlurredPreview>
            ) : phase2Loading ? <Phase2Skeleton /> : null
          )}

          {/* ?�═?�═ 05 ?��????��? ?�떻�??�각?�는지 ?�═?�═ */}
          <SectionHeader number="05" title="?��????��? ?�떻�??�각?�는지" subtitle="?��?�??�에 비친 ?�의 모습" />

          {phase2Loading ? (
            <Phase2Skeleton />
          ) : ai.howTheySeeMe ? (
            <Card accent="#F59E0B">
              <SubLabel text="?��?�??�주�??�히???�의 ?�너지" />
              <p className="text-[#888] text-sm leading-relaxed">{ai.howTheySeeMe.energyReading}</p>
            </Card>
          ) : (
            <Card accent="#F59E0B">
              <SubLabel text="?��?방이 ?��? 보는 ?�선" />
              <p className="text-[#888] text-sm leading-relaxed">
                ?��?방의 ?�주 기운?�??�의 ?�너지�??�특??방식?�로 ?�습?�다. 충돌 구조가 ?�을?�록 ?��?�??�에 ?�는 ??강렬?�게 각인?�니??
              </p>
            </Card>
          )}

          {isOpen('s05') && (
            ai.howTheySeeMe ? (
              <BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall}>
                <div className="space-y-3">
                  <Card>
                    <SubLabel text="?��?방이 ???�문???�극받는 �? />
                    <p className="text-[#888] text-sm leading-relaxed">{ai.howTheySeeMe.whatIrritates}</p>
                  </Card>
                  <Card>
                    <SubLabel text="그래???��? ?��? 못하???�유" />
                    <p className="text-[#888] text-sm leading-relaxed">{ai.howTheySeeMe.whatDrawsThem}</p>
                  </Card>
                  <Card>
                    <SubLabel text="?��?방이 ?�자 ?��? ?��??�는 방식" />
                    <p className="text-[#888] text-sm leading-relaxed">{ai.howTheySeeMe.theirPrivateVerdict}</p>
                  </Card>
                  <div className="border border-[#F59E0B]/20 p-5 bg-[#F59E0B]/5">
                    <SubLabel text="?��?방이 ?�에�?진짜�??�하??�? />
                    <p className="text-[#aaa] text-sm leading-relaxed">{ai.howTheySeeMe.howTheyNeedMe}</p>
                  </div>
                </div>
              </BlurredPreview>
            ) : phase2Loading ? <Phase2Skeleton /> : null
          )}

          {/* ?�═?�═ 06 ??관�? 계속 가???�까? ?�═?�═ */}
          <SectionHeader number="06" title="??관�? 계속 가???�까?" subtitle="?�주 구조�?보는 ?�철???�단" />

          {phase2Loading ? (
            <Phase2Skeleton />
          ) : ai.continuationAssessment ? (
            <div className="border border-[#FF2D55] p-5"
              style={{ background: 'linear-gradient(135deg, #0D0005 0%, #0A0A0A 100%)' }}>
              <p className="text-[#FF2D55] text-[10px] uppercase tracking-[0.25em] font-sans-kr mb-3">최종 ?�정</p>
              <p className="text-white text-base font-bold leading-snug font-sans-kr">
                {ai.continuationAssessment.verdict}
              </p>
            </div>
          ) : (
            <div className="border border-[#FF2D55] p-5"
              style={{ background: 'linear-gradient(135deg, #0D0005 0%, #0A0A0A 100%)' }}>
              <p className="text-[#FF2D55] text-[10px] uppercase tracking-[0.25em] font-sans-kr mb-3">구조???�단</p>
              <p className="text-white text-sm font-sans-kr leading-relaxed">
                충돌 구조??바뀌�? ?�습?�다. 바�????�는 �????�람??�?구조�??�떻�??�루?�냐?�니??
              </p>
            </div>
          )}

          {isOpen('s06') && (
            ai.continuationAssessment ? (
              <BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall}>
                <div className="space-y-3">
                  <Card>
                    <SubLabel text="구조??분석" />
                    <p className="text-[#888] text-sm leading-relaxed">{ai.continuationAssessment.structuralAnalysis}</p>
                  </Card>
                  <Card>
                    <SubLabel text="계속?�려�??�요??�? />
                    <p className="text-[#888] text-sm leading-relaxed">{ai.continuationAssessment.whatItTakes}</p>
                  </Card>
                  <Card accent="#FF2D55">
                    <SubLabel text="???�호가 보이�??�고?�세?? />
                    <p className="text-[#888] text-sm leading-relaxed">{ai.continuationAssessment.redLine}</p>
                  </Card>
                </div>
              </BlurredPreview>
            ) : phase2Loading ? <Phase2Skeleton /> : null
          )}
        </div>
      )}

      {/* ?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═
          결과 (??�� 모드)
      ?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═ */}
      {!hasTarget && (
        <div className="space-y-2">

          <SectionHeader number="01" title="???�주 기질" subtitle="충돌 구조??근원" />

          <Card accent="#FF2D55">
            <SubLabel text="?�의 ?�주 기질" />
            {ai.myCharacter ? (
              <>
                <p className="text-[#888] text-sm leading-relaxed mb-4">{ai.myCharacter.core}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-[#1a1a1a] p-3">
                    <p className="text-[#BF5AF2] text-[10px] mb-1.5">강점</p>
                    <p className="text-[#888] text-xs leading-relaxed">{ai.myCharacter.strength}</p>
                  </div>
                  <div className="border border-[#1a1a1a] p-3">
                    <p className="text-[#FF2D55] text-[10px] mb-1.5">그림??/p>
                    <p className="text-[#888] text-xs leading-relaxed">{ai.myCharacter.shadow}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-[#888] text-sm leading-relaxed">{result.conflictSummary}</p>
            )}
          </Card>

          {isOpen('s01') && (
            <BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall}>
              <div className="space-y-3">
                {ai.dangerTypes && ai.dangerTypes.length > 0 && (
                  <>
                    <SubLabel text="?�의 ?�험 ?�형" />
                    {ai.dangerTypes.map((dt, i) => (
                      <Card key={i}>
                        <div className="mb-3">
                          <p className="text-white text-sm font-bold mb-1">{dt.type}</p>
                          {dt.years && <p className="text-[#555] text-[11px]">{dt.years}</p>}
                        </div>
                        <p className="text-[#777] text-xs leading-relaxed mb-3">{dt.whyDangerous}</p>
                        <div className="bg-[#FF2D55]/5 border border-[#FF2D55]/15 px-3 py-2.5">
                          <p className="text-[#FF2D55]/80 text-[11px] mb-1">?�제 ?�황</p>
                          <p className="text-[#888] text-xs leading-relaxed">{dt.realScenario}</p>
                        </div>
                      </Card>
                    ))}
                  </>
                )}
                {ai.hiddenDynamic && (
                  <div className="border border-[#FF2D55]/20 p-5 bg-[#FF2D55]/5">
                    <SubLabel text="?�겨�??�턴" />
                    <p className="text-[#aaa] text-sm leading-relaxed">{ai.hiddenDynamic}</p>
                  </div>
                )}
              </div>
            </BlurredPreview>
          )}

          <SectionHeader number="02" title="?�떤 ?�황?�서 ?�맞?��?" subtitle="?��? ?�주 반복?�는 갈등 ?�턴" />

          {ai.conflictScenarios && ai.conflictScenarios.length > 0 ? (
            <Card>
              <div className="flex items-start gap-3">
                <span className="text-[#FF2D55] font-display text-2xl leading-none mt-0.5 flex-shrink-0">1</span>
                <div>
                  <p className="text-white text-sm font-bold mb-2">{ai.conflictScenarios[0].situation}</p>
                  <p className="text-[#777] text-xs leading-relaxed mb-2">{ai.conflictScenarios[0].whatHappens}</p>
                  <p className="text-[#FF2D55]/60 text-[11px] border-t border-[#1a1a1a] pt-2">?�주 구조 ??{ai.conflictScenarios[0].whySaju}</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <SubLabel text="반복 갈등 ?�턴" />
              <p className="text-[#888] text-sm leading-relaxed">{result.conflictSummary}</p>
            </Card>
          )}

          {isOpen('s02') && (
            <BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall}>
              <div className="space-y-3">
                {ai.conflictScenarios && ai.conflictScenarios.slice(1).map((s, i) => (
                  <Card key={i}>
                    <div className="flex items-start gap-3">
                      <span className="text-[#FF2D55] font-display text-2xl leading-none mt-0.5 flex-shrink-0">{i + 2}</span>
                      <div>
                        <p className="text-white text-sm font-bold mb-2">{s.situation}</p>
                        <p className="text-[#777] text-xs leading-relaxed mb-2">{s.whatHappens}</p>
                        <p className="text-[#FF2D55]/60 text-[11px] border-t border-[#1a1a1a] pt-2">?�주 구조 ??{s.whySaju}</p>
                      </div>
                    </div>
                  </Card>
                ))}
                {ai.triggerPoints && (
                  <Card>
                    <SubLabel text="?�의 갈등 ?�리�? />
                    <div className="space-y-2">
                      {ai.triggerPoints.map((t, i) => (
                        <div key={i} className="flex items-start gap-3 py-2 border-b border-[#1a1a1a] last:border-0">
                          <span className="text-[#FF2D55] text-xs mt-0.5 flex-shrink-0">??/span>
                          <p className="text-[#888] text-sm">{t}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
                {ai.warningPattern && (
                  <Card accent="#FF2D55">
                    <SubLabel text="반복?�는 갈등 ?�턴" />
                    <p className="text-[#aaa] text-sm leading-relaxed">{ai.warningPattern}</p>
                  </Card>
                )}
              </div>
            </BlurredPreview>
          )}

          <SectionHeader number="03" title="?�으�??�렇�??�보?�요" subtitle="???�턴???�해?�고 충돌 줄이�? />

          {ai.avoidanceGuide ? (
            <Card accent="#FF2D55">
              <SubLabel text="마음가�? />
              <p className="text-[#888] text-sm leading-relaxed">{ai.avoidanceGuide.mindset}</p>
            </Card>
          ) : (
            <Card accent="#FF2D55">
              <SubLabel text="?�실??가?�드" />
              <p className="text-[#888] text-sm leading-relaxed">
                ??충돌 ?�턴???�식?�는 �??�체가 �?번째 ?�계?�니?? 같�? ?�황?�서 반복?�서 반응?�는 방식??관찰하�? ?�동 반응 ?�에 ?�깐 멈추???�습???�세??
              </p>
            </Card>
          )}

          {isOpen('s03') && (
            ai.avoidanceGuide ? (
              <BlurredPreview unlocked={isAllUnlocked} onUnlock={handleOpenPaywall}>
                <div className="space-y-3">
                  <Card>
                    <SubLabel text="?�전 ?? />
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
                    <SubLabel text="?�긋�? />
                    <p className="text-[#888] text-sm leading-relaxed">{ai.avoidanceGuide.boundaries}</p>
                  </Card>
                </div>
              </BlurredPreview>
            ) : null
          )}
        </div>
      )}

      {/* ?�그 */}
      <div className="flex flex-wrap gap-2 pt-2">
        {result.tags.map(tag => (
          <span key={tag} className="text-xs text-[#FF2D55] bg-[#FF2D55]/8 border border-[#FF2D55]/20 px-3 py-1">
            {tag}
          </span>
        ))}
      </div>

      {/* 공유 ?��?지 카드 */}
      <div className="border border-[#1e1e1e] p-5 bg-[#0D0D0D]">
        <p className="text-[#555] text-[10px] uppercase tracking-[0.25em] mb-4">공유 카드</p>
        <div className="flex justify-center">
          <ShareCard ref={shareCardRef} myName={myData.name} result={result} />
        </div>
      </div>

      {/* 리뷰 */}
      {!reviewSubmitted ? (
        <div className="border border-[#1e1e1e] p-5 bg-[#0D0D0D]">
          <p className="text-[#555] text-[10px] uppercase tracking-[0.25em] mb-4">분석???��??�나??</p>
          <div className="flex justify-center gap-3 mb-4">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setReviewStars(n)}
                className={`text-2xl transition-colors ${n <= reviewStars ? 'text-[#FF2D55]' : 'text-[#2a2a2a] hover:text-[#555]'}`}>
                ??
              </button>
            ))}
          </div>
          {reviewStars > 0 && (
            <>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="??�??�기 (?�택)"
                className="w-full bg-[#111] border border-[#1e1e1e] text-white text-sm px-4 py-3 resize-none focus:outline-none focus:border-[#FF2D55]/40 mb-3 font-sans-kr"
                rows={2}
                maxLength={200}
              />
              <button onClick={handleSubmitReview}
                className="w-full py-3 gradient-red text-white text-sm font-medium">
                ?�기 ?�기�?
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="border border-[#1e1e1e] p-5 bg-[#0D0D0D] text-center">
          <p className="text-[#FF2D55] text-sm mb-1">감사?�니??/p>
          <p className="text-[#444] text-xs">?�기가 ?�비??개선?????��????�니??/p>
        </div>
      )}

      {/* ?�전 분석 ?�스?�리 */}
      {recentHistory.length > 0 && (
        <div className="border border-[#1e1e1e] p-5">
          <p className="text-[#333] text-[10px] uppercase tracking-[0.25em] mb-3">?�전 분석</p>
          <div className="space-y-0">
            {recentHistory.map(h => (
              <div key={h.id} className="flex items-center justify-between py-3 border-b border-[#111] last:border-0">
                <div>
                  <p className="text-[#666] text-xs">
                    {h.myName} {h.targetName ? `· ${h.targetName}` : '(??��)'} <span className="text-[#333]">??{h.relationType}</span>
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
        ?�른 관계도 분석?�보�???
      </button>
    </div>
  );
}

declare global {
  interface Window {
    Kakao: { isInitialized: () => boolean; Share: { sendDefault: (o: object) => void } };
  }
}
