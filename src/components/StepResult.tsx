import { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import type { SajuResult, PersonData, RelationType } from '../utils/saju';
import { fetchAIPhase1, fetchAIPhase2 } from '../utils/aiAnalysis';
import { trackEvent, endSession } from '../utils/analytics';
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
  continuationAssessment?: ContinuationAssessment;
  myCharacter?: { core: string; strength: string; shadow: string };
  dangerTypes?: DangerType[];
  warningPattern?: string;
}

const ACCURACY_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  full:  { label: '완전 분석', color: '#4CAF50', desc: '4주 8자 기반' },
  day:   { label: '정밀 분석', color: '#2196F3', desc: '년·월·일주 기반' },
  month: { label: '심화 분석', color: '#FF9800', desc: '년·월주 기반' },
  year:  { label: '기본 분석', color: '#9E9E9E', desc: '년주 기반' },
};

const LOADING_STEPS = [
  { pctStart: 0,  pctEnd: 20,  label: '사주 기본 정보 확인',    sub: '年柱 · 月柱 · 日柱 · 時柱',     hanja: '命' },
  { pctStart: 20, pctEnd: 40,  label: '충돌 구조 분석',          sub: '沖 · 刑 · 害 · 剋 계산',         hanja: '沖' },
  { pctStart: 40, pctEnd: 60,  label: '감정 패턴 해석',          sub: '두 사람의 기질 충돌 방식',        hanja: '氣' },
  { pctStart: 60, pctEnd: 80,  label: '갈등 시나리오 도출',      sub: '실제 터질 법한 상황 분석',        hanja: '刑' },
  { pctStart: 80, pctEnd: 100, label: '최종 분석 정리',          sub: '회피 전략 & 결론 도출',           hanja: '決' },
];

const EXPECTED_MS = 22000;

function AILoadingScreen({ hasTarget, score, done, result }: {
  hasTarget: boolean;
  score: number;
  done: boolean;
  result: SajuResult;
}) {
  const startRef = useRef(Date.now());
  const doneRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      if (doneRef.current) return;
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min((elapsed / EXPECTED_MS) * 95, 95);
      setProgress(pct);
      setStepIdx(Math.min(Math.floor((pct / 100) * LOADING_STEPS.length), LOADING_STEPS.length - 1));
    }, 100);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (done && !doneRef.current) {
      doneRef.current = true;
      setProgress(100);
      setStepIdx(LOADING_STEPS.length - 1);
    }
  }, [done]);

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

  const isDone = progress >= 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#0A0A0A' }}>

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

        {/* Center: hanja + pct */}
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
          {isDone ? (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="char-enter">
              <path d="M5 13l4 4L19 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <span
              key={step.hanja}
              className="font-display text-5xl leading-none char-enter"
              style={{ color }}
            >
              {step.hanja}
            </span>
          )}
          <span className="font-sans text-[#333] text-xs mt-2">
            {Math.round(progress)}<span className="text-[10px]">%</span>
          </span>
        </div>
      </div>

      {/* Status text */}
      <div className="text-center max-w-[240px]">
        <p key={step.label} className="text-white text-sm font-medium mb-1.5 char-enter">
          {isDone ? '분석 완료' : step.label}
        </p>
        <p className="text-[#333] text-xs leading-relaxed">
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

function ToggleBtn({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full py-2.5 border border-[#1e1e1e] text-[#555] text-xs hover:border-[#FF2D55]/40 hover:text-[#FF2D55] transition-colors mt-1"
    >
      {open ? '접기 ↑' : '더보기 ↓'}
    </button>
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

// ── 결제 팝업 모달 ───────────────────────────────────────────────────
function PaywallModal({ onClose, onPay }: { onClose: () => void; onPay: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.96)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm mx-4 mb-safe relative animate-fade-in"
        style={{ background: 'linear-gradient(160deg, #0E0003 0%, #0A0A0A 60%, #080810 100%)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-[#333] hover:text-[#666] transition-colors text-base leading-none z-10"
        >
          ✕
        </button>

        <div className="border border-[#FF2D55]/20 p-6">
          {/* Lock icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 border border-[#FF2D55]/40 flex items-center justify-center"
              style={{ background: 'rgba(255,45,85,0.08)' }}
            >
              <LockIcon size={24} />
            </div>
          </div>

          {/* Title */}
          <p className="text-center text-[#FF2D55] text-[10px] uppercase tracking-[0.35em] mb-2">PREMIUM ANALYSIS</p>
          <h2 className="text-center text-white text-xl font-bold leading-tight mb-2">
            사주 AI 심층 분석
          </h2>
          <p className="text-center text-[#444] text-xs leading-relaxed mb-6 px-2">
            가장 많은 사람들이 보고 싶어하는 분석입니다.<br />
            이 관계, 당신에게 무슨 일이 일어나고 있나요?
          </p>

          {/* What you get */}
          <div className="border border-[#1a1a1a] bg-[#080808] divide-y divide-[#111] mb-5">
            <div className="flex items-start gap-3 p-4">
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 border border-[#FF2D55]/50 text-[#FF2D55] flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(255,45,85,0.08)' }}
              >
                04
              </span>
              <div>
                <p className="text-white text-sm font-semibold mb-0.5">이 관계가 나에게 하는 일</p>
                <p className="text-[#444] text-[11px] leading-relaxed">
                  경고 신호 3가지 · 내가 잃어가는 것 · 감정 소모 분석
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4">
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 border border-[#FF2D55]/50 text-[#FF2D55] flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(255,45,85,0.08)' }}
              >
                05
              </span>
              <div>
                <p className="text-white text-sm font-semibold mb-0.5">이 관계, 계속 가야 할까?</p>
                <p className="text-[#444] text-[11px] leading-relaxed">
                  구조적 판단 · 레드라인 · AI 최종 판정
                </p>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="h-px flex-1 bg-[#1a1a1a]" />
            <p className="text-[#333] text-[10px] whitespace-nowrap">
              87%가 이 두 섹션을 가장 많이 공유했습니다
            </p>
            <div className="h-px flex-1 bg-[#1a1a1a]" />
          </div>

          {/* Price */}
          <div className="text-center mb-5">
            <div className="inline-flex items-baseline gap-2 mb-1">
              <span className="text-[#2a2a2a] text-sm line-through">₩500</span>
              <span className="text-white text-[2.5rem] font-bold tracking-tight leading-none">₩100</span>
            </div>
            <p className="text-[#FF2D55] text-[10px] uppercase tracking-[0.2em] mt-1">출시 기념 80% 할인</p>
          </div>

          {/* CTA */}
          <button
            onClick={onPay}
            className="w-full py-4 gradient-red text-white font-bold text-sm tracking-[0.05em] mb-3 relative overflow-hidden group"
          >
            <span className="relative z-10">₩100으로 지금 확인하기</span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            />
          </button>
          <p className="text-center text-[#222] text-[10px]">
            안전한 결제 · 즉시 잠금 해제 · 100% 환불 보장
          </p>
        </div>
      </div>
    </div>
  );
}

// ── 잠긴 섹션 티저 ───────────────────────────────────────────────────
function LockedPremium({ teaser, onUnlock }: { teaser: string; onUnlock: () => void }) {
  return (
    <div
      className="border border-[#FF2D55]/15 overflow-hidden relative"
      style={{ background: 'linear-gradient(160deg, #0D0003 0%, #0A0A0A 100%)' }}
    >
      {/* Blurred preview content */}
      <div
        className="px-5 pt-5 pb-3 select-none pointer-events-none"
        style={{ filter: 'blur(5px)', opacity: 0.2 }}
      >
        <p className="text-[#888] text-sm leading-relaxed mb-3">{teaser}</p>
        <div className="space-y-2">
          <div className="h-2.5 bg-[#2a2a2a] rounded w-full" />
          <div className="h-2.5 bg-[#2a2a2a] rounded w-4/5" />
          <div className="h-2.5 bg-[#2a2a2a] rounded w-3/5" />
        </div>
      </div>

      {/* Fade gradient */}
      <div
        className="h-10 -mt-10 relative z-10"
        style={{ background: 'linear-gradient(to bottom, transparent, #0A0A0A)' }}
      />

      {/* Lock CTA */}
      <div className="px-5 pb-5 relative z-10">
        <div className="text-center mb-4">
          <div
            className="inline-flex items-center justify-center w-10 h-10 border border-[#FF2D55]/40 mb-3"
            style={{ background: 'rgba(255,45,85,0.08)' }}
          >
            <LockIcon size={18} />
          </div>
          <p className="text-white text-sm font-bold mb-1.5">잠긴 심층 분석</p>
          <p className="text-[#444] text-xs leading-relaxed">
            사주 AI가 가장 날카롭게 분석한 구간입니다<br />
            ₩100으로 잠금을 해제할 수 있습니다
          </p>
        </div>

        <button
          onClick={onUnlock}
          className="w-full py-3.5 gradient-red text-white text-xs font-bold tracking-[0.08em] relative overflow-hidden group"
        >
          <span className="relative z-10">잠금 해제하기 — ₩100</span>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />
        </button>
      </div>
    </div>
  );
}

// ── 결제 성공 오버레이 ───────────────────────────────────────────────
function FreeSuccessOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.97)' }}
    >
      <div
        className="w-full max-w-xs text-center border border-[#FF2D55]/25 px-8 py-10 animate-fade-in"
        style={{ background: 'linear-gradient(160deg, #0E0003 0%, #0A0A0A 100%)' }}
      >
        <div
          className="w-16 h-16 border border-[#FF2D55]/40 flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(255,45,85,0.08)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#FF2D55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-[#FF2D55] text-[10px] uppercase tracking-[0.35em] mb-4">SPECIAL OFFER</p>
        <p className="text-white text-xl font-bold leading-snug mb-3">
          사용자님만을 위해<br />
          100회 무료로<br />
          해드릴게요!
        </p>
        <p className="text-[#444] text-xs leading-relaxed">
          잠금이 해제됩니다...
        </p>
        <div className="mt-5 w-full h-px bg-[#1a1a1a] overflow-hidden">
          <div
            className="h-full bg-[#FF2D55]"
            style={{ width: '100%', animation: 'progress-fill 2.8s linear forwards' }}
          />
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [apiDone, setApiDone] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [aiError, setAiError] = useState(false);
  const [toast, setToast] = useState('');

  // 유료 전환 검증 상태
  const [paywallUnlocked, setPaywallUnlocked] = useState(() => {
    try { return localStorage.getItem('toxic_premium') === '1'; } catch { return false; }
  });
  const [showPaywall, setShowPaywall] = useState(false);
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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleOpenPaywall = () => {
    trackEvent('paywall_click');
    setShowPaywall(true);
  };

  const handlePayment = () => {
    trackEvent('paywall_pay');
    setShowPaywall(false);
    setShowFreeSuccess(true);
    try { localStorage.setItem('toxic_premium', '1'); } catch {}
    setTimeout(() => {
      setShowFreeSuccess(false);
      setPaywallUnlocked(true);
    }, 3200);
  };

  const hasTarget = Boolean(targetData.birthdate);
  const accuracyInfo = ACCURACY_LABELS[result.accuracyLevel] ?? ACCURACY_LABELS.year;

  // Phase 1: 로딩 화면 중 실행
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAIPhase1(myData, targetData, relationType, result);
        setAiPhase1(data);
      } catch {
        setAiError(true);
      } finally {
        setApiDone(true);
        setTimeout(() => setShowLoading(false), 800);
      }
    })();
  }, []);

  // Phase 2: 결과 화면이 뜨는 순간 시작
  useEffect(() => {
    if (showLoading) return;
    (async () => {
      try {
        const data = await fetchAIPhase2(myData, targetData, relationType, result);
        setAiPhase2(data);
      } catch {
        // 조용히 처리
      } finally {
        setPhase2Loading(false);
      }
    })();
  }, [showLoading]);

  if (showLoading) {
    return <AILoadingScreen hasTarget={hasTarget} score={result.toxicScore} done={apiDone} result={result} />;
  }

  // 결과 화면 진입 시 세션 타임 기록
  useEffect(() => {
    if (!showLoading) {
      endSession();
      trackEvent('result_view', { toxicScore: result.toxicScore, relationType });
      trackEvent('paywall_impression');
    }
  }, [showLoading]);

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
    }
  };

  return (
    <div className="animate-fade-in max-w-lg mx-auto px-4 py-8 space-y-4">

      {/* 결제 팝업 모달 */}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} onPay={handlePayment} />}

      {/* 결제 성공 오버레이 */}
      <FreeSuccessOverlay visible={showFreeSuccess} />

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
          카카오 공유
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

      {/* 충돌 뱃지 */}
      {(result.conflicts.chung.length > 0 || result.conflicts.hyung.length > 0 ||
        result.conflicts.hae.length > 0 || result.conflicts.pa.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {result.conflicts.chung.map(c => (
            <span key={c.name} className="text-[11px] px-3 py-1 border border-[#FF2D55]/40 text-[#FF2D55] bg-[#FF2D55]/8">충 · {c.name}</span>
          ))}
          {result.conflicts.hyung.map(h => (
            <span key={h.name} className="text-[11px] px-3 py-1 border border-[#BF5AF2]/40 text-[#BF5AF2] bg-[#BF5AF2]/8">형 · {h.name}</span>
          ))}
          {result.conflicts.hae.map(h => (
            <span key={h.name} className="text-[11px] px-3 py-1 border border-[#FF9800]/40 text-[#FF9800] bg-[#FF9800]/8">해 · {h.name}</span>
          ))}
          {result.conflicts.pa.map(p => (
            <span key={p.name} className="text-[11px] px-3 py-1 border border-[#607D8B]/40 text-[#607D8B] bg-[#607D8B]/8">파 · {p.name}</span>
          ))}
          {result.conflicts.hap.length > 0 && (
            <span className="text-[11px] px-3 py-1 border border-[#4CAF50]/40 text-[#4CAF50] bg-[#4CAF50]/8">합 요소 있음</span>
          )}
        </div>
      )}

      {/* 한눈에 보기 요약 */}
      <div className="border border-[#FF2D55]/30 p-5" style={{ background: 'linear-gradient(135deg, #0D0005, #0A0A0A)' }}>
        <p className="text-[#FF2D55] text-[10px] uppercase tracking-[0.25em] font-sans-kr mb-3">한눈에 보기</p>
        <p className="text-white font-bold text-base leading-snug mb-2">
          {ai.coreConflict?.title || result.conflictType}
        </p>
        <p className="text-[#888] text-sm leading-relaxed">
          {ai.toxicSummary || result.conflictSummary}
        </p>
      </div>

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

          {isOpen('s01') && (
            <div className="space-y-3">
              {(ai.conflictAnalysis?.chung || ai.conflictAnalysis?.hyung ||
                ai.conflictAnalysis?.hae || ai.conflictAnalysis?.geuk ||
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
                    {ai.conflictAnalysis?.hae && (
                      <div className="border-t border-[#1a1a1a] pt-4">
                        <span className="text-[10px] border border-[#FF9800]/40 text-[#FF9800] px-2 py-0.5 inline-block mb-2">해(害)</span>
                        <p className="text-[#888] text-sm leading-relaxed">{ai.conflictAnalysis.hae}</p>
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
          )}
          <ToggleBtn open={isOpen('s01')} onToggle={() => toggleSection('s01')} />

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

          {isOpen('s02') && (
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
          )}
          <ToggleBtn open={isOpen('s02')} onToggle={() => toggleSection('s02')} />

          {/* ════ 03 앞으로 이렇게 해보세요 ════ */}
          <SectionHeader number="03" title="앞으로 이렇게 해보세요" subtitle="부딪히지 않기 위한 현실적 가이드" />

          {ai.avoidanceGuide ? (
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

          {isOpen('s03') && ai.avoidanceGuide && (
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
          )}
          {ai.avoidanceGuide && <ToggleBtn open={isOpen('s03')} onToggle={() => toggleSection('s03')} />}

          {/* ════ 04 이 관계가 나에게 하는 일 ════ */}
          <SectionHeader number="04" title="이 관계가 나에게 하는 일" subtitle="지금 이 순간 당신에게 일어나고 있는 것" />

          {!paywallUnlocked ? (
            <LockedPremium
              teaser="지금 이 관계에서 당신은 조금씩 자신을 잃어가고 있습니다. AI가 발견한 경고 신호와 당신이 이 관계로 인해 잃어가고 있는 것들—"
              onUnlock={handleOpenPaywall}
            />
          ) : phase2Loading ? (
            <>
              <Phase2Skeleton />
              <p className="text-center text-[#333] text-[11px] font-sans-kr animate-pulse py-1">
                04·05 섹션 분석 중 — 잠시만 기다려주세요
              </p>
            </>
          ) : (
            <>
              {ai.personalImpact ? (
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

              {isOpen('s04') && ai.personalImpact && (
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
              )}
              {ai.personalImpact && <ToggleBtn open={isOpen('s04')} onToggle={() => toggleSection('s04')} />}
            </>
          )}

          {/* ════ 05 이 관계, 계속 가야 할까? ════ */}
          <SectionHeader number="05" title="이 관계, 계속 가야 할까?" subtitle="사주 구조로 보는 냉철한 판단" />

          {!paywallUnlocked ? (
            <LockedPremium
              teaser="사주 구조는 이 관계에 대해 분명한 신호를 보내고 있습니다. 계속할 때 반드시 넘어야 할 레드라인과 AI 최종 판정—"
              onUnlock={handleOpenPaywall}
            />
          ) : phase2Loading ? (
            <Phase2Skeleton />
          ) : (
            <>
              {ai.continuationAssessment ? (
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

              {isOpen('s05') && ai.continuationAssessment && (
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
              )}
              {ai.continuationAssessment && <ToggleBtn open={isOpen('s05')} onToggle={() => toggleSection('s05')} />}
            </>
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
                    <p className="text-[#4CAF50] text-[10px] mb-1.5">강점</p>
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

          {isOpen('s01') && (
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
          )}
          <ToggleBtn open={isOpen('s01')} onToggle={() => toggleSection('s01')} />

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

          {isOpen('s02') && (
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
          )}
          <ToggleBtn open={isOpen('s02')} onToggle={() => toggleSection('s02')} />

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

          {isOpen('s03') && ai.avoidanceGuide && (
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
          )}
          {ai.avoidanceGuide && <ToggleBtn open={isOpen('s03')} onToggle={() => toggleSection('s03')} />}
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
