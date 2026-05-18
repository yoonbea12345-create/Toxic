import { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import type { SajuResult, PersonData, RelationType } from '../utils/saju';
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
  // 역산 모드
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

function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-[#1e1e1e] rounded" style={{ width: `${[100, 82, 65][i % 3]}%` }} />
      ))}
    </div>
  );
}

export default function StepResult({ myData, targetData, result, relationType, onReset }: StepResultProps) {
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState(false);

  const hasTarget = Boolean(targetData.birthdate);
  const accuracyInfo = ACCURACY_LABELS[result.accuracyLevel] ?? ACCURACY_LABELS.year;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ myData, targetData, relationType, sajuResult: result }),
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        setAiAnalysis(data.analysis);
      } catch {
        setAiError(true);
      } finally {
        setAiLoading(false);
      }
    })();
  }, []);

  const handleSaveImage = async () => {
    if (!shareCardRef.current) return;
    const canvas = await html2canvas(shareCardRef.current, { backgroundColor: '#0A0A0A', scale: 2 });
    const link = document.createElement('a');
    link.download = 'toxic-result.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 복사되었습니다!');
  };

  const handleKakaoShare = () => {
    if (window.Kakao?.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `TOXIC 분석: ${result.conflictType}`,
          description: aiAnalysis?.toxicSummary || result.conflictSummary,
          imageUrl: 'https://toxic.kr/og.png',
          link: { mobileWebUrl: 'https://toxic.kr', webUrl: 'https://toxic.kr' },
        },
        buttons: [{ title: '나도 분석하기', link: { mobileWebUrl: 'https://toxic.kr', webUrl: 'https://toxic.kr' } }],
      });
    }
  };

  return (
    <div className="animate-fade-in max-w-lg mx-auto px-4 py-8 space-y-4">

      {/* ── 헤더 ── */}
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

      {/* ── 충돌 뱃지 ── */}
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

      {/* ── AI 한 줄 요약 ── */}
      {(aiLoading || aiAnalysis?.toxicSummary) && (
        <div className="border border-[#FF2D55]/30 bg-[#FF2D55]/5 p-4 text-center">
          {aiLoading
            ? <div className="h-4 bg-[#1e1e1e] rounded animate-pulse w-3/4 mx-auto" />
            : <p className="text-[#FF2D55] font-bold text-sm">"{aiAnalysis?.toxicSummary}"</p>
          }
        </div>
      )}

      {/* ══════════════════════════════════════
          3-SECTION ANALYSIS
      ══════════════════════════════════════ */}

      {aiLoading ? (
        <div className="space-y-4">
          <SectionHeader number="01" title="나와 안맞는 이유" />
          {[4, 3, 5].map((lines, i) => (
            <Card key={i}><div className="h-3 bg-[#1e1e1e] rounded w-1/3 mb-4 animate-pulse" /><Skeleton lines={lines} /></Card>
          ))}
          <SectionHeader number="02" title="어떤 상황에서 안맞는지" />
          {[3, 3].map((lines, i) => (
            <Card key={i}><Skeleton lines={lines} /></Card>
          ))}
          <SectionHeader number="03" title="앞으로 이렇게 해보세요" />
          <Card><Skeleton lines={4} /></Card>
        </div>
      ) : aiError ? (
        <div className="space-y-4">
          <SectionHeader number="01" title="나와 안맞는 이유" />
          <Card accent="#FF2D55">
            <SubLabel text="핵심 충돌 구조" />
            <p className="text-white text-sm font-bold mb-2">{result.conflictType}</p>
            <p className="text-[#888] text-sm leading-relaxed">{result.conflictSummary}</p>
          </Card>
          <Card><SubLabel text="충(沖) 분석" /><p className="text-[#888] text-sm leading-relaxed">{result.analysis.chungAnalysis}</p></Card>
          <Card><SubLabel text="형(刑) 분석" /><p className="text-[#888] text-sm leading-relaxed">{result.analysis.hyungAnalysis}</p></Card>
          <Card><SubLabel text="오행 극(剋)" /><p className="text-[#888] text-sm leading-relaxed">{result.analysis.geukAnalysis}</p></Card>
        </div>
      ) : hasTarget ? (
        /* ─── 상대 있을 때 ─── */
        <div className="space-y-4">

          {/* ════ SECTION 1 — 나와 안맞는 이유 ════ */}
          <SectionHeader
            number="01"
            title="나와 안맞는 이유"
            subtitle="사주 구조에서 비롯된 근본적인 충돌 원인"
          />

          {aiAnalysis?.coreConflict && (
            <Card accent="#FF2D55">
              <SubLabel text="핵심 갈등 구조" />
              <p className="text-white text-base font-bold mb-3">{aiAnalysis.coreConflict.title}</p>
              <p className="text-[#888] text-sm leading-relaxed">{aiAnalysis.coreConflict.description}</p>
            </Card>
          )}

          {aiAnalysis?.conflictAnalysis && (
            <Card>
              <SubLabel text="사주 충돌 분석" />
              <div className="space-y-4">
                {aiAnalysis.conflictAnalysis.chung && (
                  <div>
                    <span className="text-[10px] border border-[#FF2D55]/40 text-[#FF2D55] px-2 py-0.5 inline-block mb-2">충(沖)</span>
                    <p className="text-[#888] text-sm leading-relaxed">{aiAnalysis.conflictAnalysis.chung}</p>
                  </div>
                )}
                {aiAnalysis.conflictAnalysis.hyung && (
                  <div className={aiAnalysis.conflictAnalysis.chung ? 'border-t border-[#1a1a1a] pt-4' : ''}>
                    <span className="text-[10px] border border-[#BF5AF2]/40 text-[#BF5AF2] px-2 py-0.5 inline-block mb-2">형(刑)</span>
                    <p className="text-[#888] text-sm leading-relaxed">{aiAnalysis.conflictAnalysis.hyung}</p>
                  </div>
                )}
                {aiAnalysis.conflictAnalysis.hae && (
                  <div className="border-t border-[#1a1a1a] pt-4">
                    <span className="text-[10px] border border-[#FF9800]/40 text-[#FF9800] px-2 py-0.5 inline-block mb-2">해(害)</span>
                    <p className="text-[#888] text-sm leading-relaxed">{aiAnalysis.conflictAnalysis.hae}</p>
                  </div>
                )}
                {aiAnalysis.conflictAnalysis.geuk && (
                  <div className="border-t border-[#1a1a1a] pt-4">
                    <span className="text-[10px] border border-[#FF2D55]/40 text-[#FF2D55] px-2 py-0.5 inline-block mb-2">극(剋)</span>
                    <p className="text-[#888] text-sm leading-relaxed">{aiAnalysis.conflictAnalysis.geuk}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {aiAnalysis?.emotionalPattern && (
            <Card>
              <SubLabel text="감정 반응 패턴" />
              <div className="space-y-4">
                <div>
                  <p className="text-[#555] text-[11px] mb-1.5">나의 반응 방식</p>
                  <p className="text-[#888] text-sm leading-relaxed">{aiAnalysis.emotionalPattern.myPattern}</p>
                </div>
                <div className="border-t border-[#1a1a1a] pt-4">
                  <p className="text-[#555] text-[11px] mb-1.5">상대의 반응 방식</p>
                  <p className="text-[#888] text-sm leading-relaxed">{aiAnalysis.emotionalPattern.targetPattern}</p>
                </div>
                <div className="border-t border-[#1a1a1a] pt-4 bg-[#FF2D55]/5 -mx-5 px-5 py-4 -mb-5">
                  <p className="text-[#555] text-[11px] mb-1.5">반복되는 사이클</p>
                  <p className="text-[#aaa] text-sm leading-relaxed">{aiAnalysis.emotionalPattern.cycle}</p>
                </div>
              </div>
            </Card>
          )}

          {aiAnalysis?.energyDynamic && (
            <Card accent="#BF5AF2">
              <SubLabel text="에너지 역학" />
              <div className="space-y-3">
                <div>
                  <p className="text-[#555] text-[11px] mb-1">누가 더 소모되나</p>
                  <p className="text-[#888] text-sm leading-relaxed">{aiAnalysis.energyDynamic.whoLoses}</p>
                </div>
                <div className="border-t border-[#1a1a1a] pt-3">
                  <p className="text-[#555] text-[11px] mb-1">소모 방식</p>
                  <p className="text-[#888] text-sm leading-relaxed">{aiAnalysis.energyDynamic.drainMechanism}</p>
                </div>
                <div className="border-t border-[#1a1a1a] pt-3">
                  <p className="text-[#555] text-[11px] mb-1">장기 전망</p>
                  <p className="text-[#aaa] text-sm leading-relaxed">{aiAnalysis.energyDynamic.longTermEffect}</p>
                </div>
              </div>
            </Card>
          )}

          {aiAnalysis?.hiddenDynamic && (
            <div className="border border-[#FF2D55]/20 p-5 bg-[#FF2D55]/5">
              <SubLabel text="숨겨진 역학" />
              <p className="text-[#aaa] text-sm leading-relaxed">{aiAnalysis.hiddenDynamic}</p>
            </div>
          )}

          {/* ════ SECTION 2 — 어떤 상황에서 안맞는지 ════ */}
          <SectionHeader
            number="02"
            title="어떤 상황에서 안맞는지"
            subtitle="실제로 충돌이 터지는 구체적 시나리오"
          />

          {aiAnalysis?.conflictScenarios && aiAnalysis.conflictScenarios.length > 0 && (
            <div className="space-y-3">
              {aiAnalysis.conflictScenarios.map((s, i) => (
                <Card key={i}>
                  <div className="flex items-start gap-3">
                    <span className="text-[#FF2D55] font-display text-2xl leading-none mt-0.5 flex-shrink-0">
                      {i + 1}
                    </span>
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
            </div>
          )}

          {aiAnalysis?.triggerPoints && aiAnalysis.triggerPoints.length > 0 && (
            <Card>
              <SubLabel text="갈등 트리거" />
              <div className="space-y-2">
                {aiAnalysis.triggerPoints.map((t, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-[#1a1a1a] last:border-0">
                    <span className="text-[#FF2D55] text-xs mt-0.5 flex-shrink-0">▸</span>
                    <p className="text-[#888] text-sm">{t}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {aiAnalysis?.relationSpecific && (
            <Card>
              <SubLabel text={`${relationType} 관계에서 특히`} />
              <p className="text-[#888] text-sm leading-relaxed">{aiAnalysis.relationSpecific}</p>
            </Card>
          )}

          {/* ════ SECTION 3 — 앞으로 이렇게 해보세요 ════ */}
          <SectionHeader
            number="03"
            title="앞으로 이렇게 해보세요"
            subtitle="부딪히지 않기 위한 현실적 가이드"
          />

          {aiAnalysis?.avoidanceGuide ? (
            <div className="space-y-3">
              <Card accent="#FF2D55">
                <SubLabel text="마음가짐" />
                <p className="text-[#888] text-sm leading-relaxed">{aiAnalysis.avoidanceGuide.mindset}</p>
              </Card>

              <Card>
                <SubLabel text="실전 팁" />
                <div className="space-y-3">
                  {aiAnalysis.avoidanceGuide.practicalTips.map((tip, i) => (
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
                <p className="text-[#888] text-sm leading-relaxed">{aiAnalysis.avoidanceGuide.boundaries}</p>
              </Card>
            </div>
          ) : null}

          {aiAnalysis?.realisticOutlook && (
            <div className="border border-[#FF2D55]/20 p-5 bg-[#FF2D55]/5">
              <SubLabel text="현실적 전망" />
              <p className="text-[#aaa] text-sm leading-relaxed">{aiAnalysis.realisticOutlook}</p>
            </div>
          )}
        </div>
      ) : (
        /* ─── 역산 모드 ─── */
        <div className="space-y-4">

          {/* ════ SECTION 1 ════ */}
          <SectionHeader number="01" title="나와 안맞는 이유" subtitle="내 사주 기질과 충돌 구조" />

          {aiAnalysis?.myCharacter && (
            <Card accent="#FF2D55">
              <SubLabel text="나의 사주 기질" />
              <p className="text-[#888] text-sm leading-relaxed mb-4">{aiAnalysis.myCharacter.core}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-[#1a1a1a] p-3">
                  <p className="text-[#4CAF50] text-[10px] mb-1.5">강점</p>
                  <p className="text-[#888] text-xs leading-relaxed">{aiAnalysis.myCharacter.strength}</p>
                </div>
                <div className="border border-[#1a1a1a] p-3">
                  <p className="text-[#FF2D55] text-[10px] mb-1.5">그림자</p>
                  <p className="text-[#888] text-xs leading-relaxed">{aiAnalysis.myCharacter.shadow}</p>
                </div>
              </div>
            </Card>
          )}

          {aiAnalysis?.dangerTypes && aiAnalysis.dangerTypes.length > 0 && (
            <div className="space-y-3">
              <SubLabel text="나의 위험 유형" />
              {aiAnalysis.dangerTypes.map((dt, i) => (
                <Card key={i}>
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-white text-sm font-bold">{dt.type}</p>
                    {dt.years && <p className="text-[#555] text-[11px] flex-shrink-0 ml-2">{dt.years}</p>}
                  </div>
                  <p className="text-[#777] text-xs leading-relaxed mb-3">{dt.whyDangerous}</p>
                  <div className="bg-[#FF2D55]/5 border border-[#FF2D55]/15 px-3 py-2.5">
                    <p className="text-[#FF2D55]/80 text-[11px] mb-1">실제 상황</p>
                    <p className="text-[#888] text-xs leading-relaxed">{dt.realScenario}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {aiAnalysis?.hiddenDynamic && (
            <div className="border border-[#FF2D55]/20 p-5 bg-[#FF2D55]/5">
              <SubLabel text="숨겨진 패턴" />
              <p className="text-[#aaa] text-sm leading-relaxed">{aiAnalysis.hiddenDynamic}</p>
            </div>
          )}

          {/* ════ SECTION 2 ════ */}
          <SectionHeader number="02" title="어떤 상황에서 안맞는지" subtitle="내가 자주 반복하는 갈등 패턴" />

          {aiAnalysis?.conflictScenarios && aiAnalysis.conflictScenarios.length > 0 && (
            <div className="space-y-3">
              {aiAnalysis.conflictScenarios.map((s, i) => (
                <Card key={i}>
                  <div className="flex items-start gap-3">
                    <span className="text-[#FF2D55] font-display text-2xl leading-none mt-0.5 flex-shrink-0">{i + 1}</span>
                    <div>
                      <p className="text-white text-sm font-bold mb-2">{s.situation}</p>
                      <p className="text-[#777] text-xs leading-relaxed mb-2">{s.whatHappens}</p>
                      <p className="text-[#FF2D55]/60 text-[11px] border-t border-[#1a1a1a] pt-2">사주 구조 → {s.whySaju}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {aiAnalysis?.triggerPoints && (
            <Card>
              <SubLabel text="나의 갈등 트리거" />
              <div className="space-y-2">
                {aiAnalysis.triggerPoints.map((t, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-[#1a1a1a] last:border-0">
                    <span className="text-[#FF2D55] text-xs mt-0.5 flex-shrink-0">▸</span>
                    <p className="text-[#888] text-sm">{t}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {aiAnalysis?.warningPattern && (
            <Card accent="#FF2D55">
              <SubLabel text="반복되는 갈등 패턴" />
              <p className="text-[#aaa] text-sm leading-relaxed">{aiAnalysis.warningPattern}</p>
            </Card>
          )}

          {/* ════ SECTION 3 ════ */}
          <SectionHeader number="03" title="앞으로 이렇게 해보세요" subtitle="내 패턴을 이해하고 충돌 줄이기" />

          {aiAnalysis?.avoidanceGuide ? (
            <div className="space-y-3">
              <Card accent="#FF2D55">
                <SubLabel text="마음가짐" />
                <p className="text-[#888] text-sm leading-relaxed">{aiAnalysis.avoidanceGuide.mindset}</p>
              </Card>
              <Card>
                <SubLabel text="실전 팁" />
                <div className="space-y-3">
                  {aiAnalysis.avoidanceGuide.practicalTips.map((tip, i) => (
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
                <p className="text-[#888] text-sm leading-relaxed">{aiAnalysis.avoidanceGuide.boundaries}</p>
              </Card>
            </div>
          ) : null}
        </div>
      )}

      {/* ── 태그 ── */}
      <div className="flex flex-wrap gap-2 pt-2">
        {result.tags.map(tag => (
          <span key={tag} className="text-xs text-[#FF2D55] bg-[#FF2D55]/8 border border-[#FF2D55]/20 px-3 py-1">
            {tag}
          </span>
        ))}
      </div>

      {/* ── 공유 ── */}
      <div className="border border-[#1e1e1e] p-5 bg-[#0D0D0D]">
        <p className="text-[#555] text-[10px] uppercase tracking-[0.25em] mb-4">결과 공유하기</p>
        <div className="flex justify-center mb-4">
          <ShareCard ref={shareCardRef} myName={myData.name} result={result} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={handleKakaoShare}
            className="py-3 bg-[#FEE500] text-[#3C1E1E] text-xs font-bold hover:opacity-90 transition-opacity">
            카카오톡
          </button>
          <button onClick={handleSaveImage}
            className="py-3 border border-[#1e1e1e] text-[#888] text-xs hover:border-[#FF2D55]/40 hover:text-white transition-colors">
            이미지 저장
          </button>
          <button onClick={handleCopyLink}
            className="py-3 border border-[#1e1e1e] text-[#888] text-xs hover:border-[#FF2D55]/40 hover:text-white transition-colors">
            링크 복사
          </button>
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
