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

interface AIAnalysis {
  mainAnalysis?: string;
  chungAnalysis?: string | null;
  hyungAnalysis?: string | null;
  haeAnalysis?: string | null;
  geukAnalysis?: string | null;
  relationshipDynamic?: string;
  escapeAdvice?: string;
  toxicSummary?: string;
  // 내 위험 유형 역산 모드
  myCharacter?: string;
  dangerTypes?: Array<{ type: string; description: string; realExample: string }>;
  warningPattern?: string;
}

const ACCURACY_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  full: { label: '완전 분석', color: '#4CAF50', desc: '4주 8자 기반' },
  day:  { label: '정밀 분석', color: '#2196F3', desc: '년·월·일주 기반' },
  month:{ label: '심화 분석', color: '#FF9800', desc: '년·월주 기반' },
  year: { label: '기본 분석', color: '#9E9E9E', desc: '년주 기반' },
};

function ScoreGauge({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (score / 100) * circumference;
  const color = score >= 80 ? '#FF2D55' : score >= 60 ? '#BF5AF2' : '#F59E0B';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#2C2C2E" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={radius} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white font-sans">{score}</span>
          <span className="text-text-secondary text-xs">/ 100</span>
        </div>
      </div>
      <p className="text-sm font-medium mt-2" style={{ color }}>
        {score >= 80 ? '강한 충돌 관계' : score >= 60 ? '중간 충돌 관계' : '경미한 충돌'}
      </p>
    </div>
  );
}

function AnalysisCard({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <div className="bg-card-bg border border-border rounded-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h4 className="font-semibold text-white text-sm">{title}</h4>
      </div>
      <p className="text-text-secondary text-sm leading-relaxed">{content}</p>
    </div>
  );
}

function AISkeletonCard() {
  return (
    <div className="bg-card-bg border border-border rounded-sm p-5 animate-pulse">
      <div className="h-3 bg-border rounded w-1/3 mb-3" />
      <div className="space-y-2">
        <div className="h-3 bg-border rounded w-full" />
        <div className="h-3 bg-border rounded w-4/5" />
        <div className="h-3 bg-border rounded w-3/5" />
      </div>
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
    async function fetchAI() {
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
    }
    fetchAI();
  }, []);

  const handleSaveImage = async () => {
    if (!shareCardRef.current) return;
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: '#0A0A0A',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = 'toxic-result.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (e) {
      console.error('이미지 저장 실패:', e);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 복사되었습니다!');
  };

  const handleKakaoShare = () => {
    if (window.Kakao && window.Kakao.isInitialized()) {
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
    } else {
      alert('카카오 공유를 위해 카카오 SDK를 설정해야 합니다.');
    }
  };

  return (
    <div className="animate-fade-in max-w-lg mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">TOXIC 분석 결과</p>

        {/* 정확도 레벨 뱃지 */}
        <div className="flex justify-center mb-4">
          <span
            className="text-xs px-3 py-1 rounded-full border font-medium"
            style={{ color: accuracyInfo.color, borderColor: accuracyInfo.color + '40', backgroundColor: accuracyInfo.color + '15' }}
          >
            {accuracyInfo.label} · {accuracyInfo.desc}
          </span>
        </div>

        {hasTarget ? (
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-accent-red/20 border border-accent-red/30 flex items-center justify-center text-lg">
                {myData.gender === '남' ? '♂' : '♀'}
              </div>
              <span className="text-white text-xs">{myData.name || '나'}</span>
              <span className="text-text-secondary text-xs">{result.myStem}{result.myBranch}년</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-px bg-accent-red" />
              <span className="text-accent-red text-xs font-bold">VS</span>
              <div className="w-8 h-px bg-accent-red" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center text-lg">
                {targetData.gender === '남' ? '♂' : '♀'}
              </div>
              <span className="text-white text-xs">{targetData.name || '상대'}</span>
              <span className="text-text-secondary text-xs">{result.targetStem}{result.targetBranch}년</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-accent-red/20 border border-accent-red/30 flex items-center justify-center text-2xl mb-2">
              {myData.gender === '남' ? '♂' : '♀'}
            </div>
            <span className="text-white text-sm">{myData.name || '나'}</span>
            <span className="text-text-secondary text-xs mt-1">내 위험 유형 분석</span>
          </div>
        )}

        <ScoreGauge score={result.toxicScore} />
      </div>

      {/* 핵심 충돌 구조 */}
      <div className="bg-card-bg border-l-2 border-accent-red rounded-sm p-5 mb-5">
        <p className="text-text-secondary text-xs mb-1">핵심 충돌 구조</p>
        <h3 className="font-serif-kr text-xl font-bold text-white mb-2">{result.conflictType}</h3>
        <p className="text-text-secondary text-sm leading-relaxed">{result.conflictSummary}</p>
      </div>

      {/* 충·형·해·파 뱃지 */}
      {(result.conflicts.chung.length > 0 || result.conflicts.hyung.length > 0 ||
        result.conflicts.hae.length > 0 || result.conflicts.pa.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-5">
          {result.conflicts.chung.map(c => (
            <span key={c.name} className="text-xs px-2 py-1 bg-[#FF2D55]/10 border border-[#FF2D55]/30 text-[#FF2D55] rounded-sm">
              ⚡ {c.name}
            </span>
          ))}
          {result.conflicts.hyung.map(h => (
            <span key={h.name} className="text-xs px-2 py-1 bg-[#BF5AF2]/10 border border-[#BF5AF2]/30 text-[#BF5AF2] rounded-sm">
              🌑 {h.name}
            </span>
          ))}
          {result.conflicts.hae.map(h => (
            <span key={h.name} className="text-xs px-2 py-1 bg-[#FF9800]/10 border border-[#FF9800]/30 text-[#FF9800] rounded-sm">
              ⚠️ {h.name}
            </span>
          ))}
          {result.conflicts.pa.map(p => (
            <span key={p.name} className="text-xs px-2 py-1 bg-[#607D8B]/10 border border-[#607D8B]/30 text-[#607D8B] rounded-sm">
              💔 {p.name}
            </span>
          ))}
          {result.conflicts.hap.length > 0 && (
            <span className="text-xs px-2 py-1 bg-[#4CAF50]/10 border border-[#4CAF50]/30 text-[#4CAF50] rounded-sm">
              ✨ 합 요소 있음
            </span>
          )}
        </div>
      )}

      {/* AI 분석 섹션 */}
      <div className="space-y-3 mb-6">
        {aiLoading ? (
          <>
            <AISkeletonCard />
            <AISkeletonCard />
            <AISkeletonCard />
          </>
        ) : aiError ? (
          // AI 실패 시 기본 분석으로 폴백
          <>
            <AnalysisCard icon="⚡" title="충(沖) 분석" content={result.analysis.chungAnalysis} />
            <AnalysisCard icon="🌑" title="형(刑) 분석" content={result.analysis.hyungAnalysis} />
            <AnalysisCard icon="🔥" title="오행 극(剋)" content={result.analysis.geukAnalysis} />
          </>
        ) : hasTarget ? (
          // 상대 있을 때 — 관계 분석 모드
          <>
            {aiAnalysis?.mainAnalysis && (
              <AnalysisCard icon="🎯" title="핵심 갈등 원인" content={aiAnalysis.mainAnalysis} />
            )}
            {aiAnalysis?.chungAnalysis && (
              <AnalysisCard icon="⚡" title="충(沖) 분석" content={aiAnalysis.chungAnalysis} />
            )}
            {aiAnalysis?.hyungAnalysis && (
              <AnalysisCard icon="🌑" title="형(刑) 분석" content={aiAnalysis.hyungAnalysis} />
            )}
            {aiAnalysis?.haeAnalysis && (
              <AnalysisCard icon="⚠️" title="해(害) 분석" content={aiAnalysis.haeAnalysis} />
            )}
            {aiAnalysis?.geukAnalysis && (
              <AnalysisCard icon="🔥" title="오행 극(剋)" content={aiAnalysis.geukAnalysis} />
            )}
            {aiAnalysis?.relationshipDynamic && (
              <AnalysisCard icon="💬" title={`${relationType} 관계에서의 충돌 패턴`} content={aiAnalysis.relationshipDynamic} />
            )}
            {aiAnalysis?.escapeAdvice && (
              <AnalysisCard icon="🚪" title="이 관계 대처법" content={aiAnalysis.escapeAdvice} />
            )}
          </>
        ) : (
          // 상대 없을 때 — 내 위험 유형 역산 모드
          <>
            {aiAnalysis?.myCharacter && (
              <AnalysisCard icon="🪞" title="나의 사주 기질" content={aiAnalysis.myCharacter} />
            )}
            {aiAnalysis?.dangerTypes?.map((dt, i) => (
              <div key={i} className="bg-card-bg border border-border rounded-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">⚡</span>
                  <h4 className="font-semibold text-white text-sm">{dt.type}</h4>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mb-2">{dt.description}</p>
                <p className="text-xs text-[#FF9800] bg-[#FF9800]/10 border border-[#FF9800]/20 px-3 py-2 rounded-sm">
                  예시: {dt.realExample}
                </p>
              </div>
            ))}
            {aiAnalysis?.warningPattern && (
              <AnalysisCard icon="🔄" title="내가 반복하는 갈등 패턴" content={aiAnalysis.warningPattern} />
            )}
          </>
        )}
      </div>

      {/* AI 한 줄 요약 */}
      {aiAnalysis?.toxicSummary && (
        <div className="bg-accent-red/10 border border-accent-red/30 rounded-sm p-4 mb-5 text-center">
          <p className="text-accent-red font-bold text-sm">"{aiAnalysis.toxicSummary}"</p>
        </div>
      )}

      {/* 태그 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {result.tags.map(tag => (
          <span key={tag} className="text-xs text-accent-red bg-accent-red/10 border border-accent-red/20 px-3 py-1 rounded-sm">
            {tag}
          </span>
        ))}
      </div>

      {/* 공유 */}
      <div className="bg-card-bg border border-border rounded-sm p-5 mb-5">
        <p className="text-text-secondary text-xs mb-3 uppercase tracking-wider">결과 공유하기</p>
        <div className="flex justify-center mb-4">
          <ShareCard ref={shareCardRef} myName={myData.name} result={result} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleKakaoShare}
            className="py-3 bg-[#FEE500] rounded-sm text-[#3C1E1E] text-xs font-bold hover:opacity-90 transition-opacity"
          >
            카카오톡
          </button>
          <button
            onClick={handleSaveImage}
            className="py-3 bg-card-bg border border-border rounded-sm text-white text-xs hover:border-accent-red/50 transition-colors"
          >
            이미지 저장
          </button>
          <button
            onClick={handleCopyLink}
            className="py-3 bg-card-bg border border-border rounded-sm text-white text-xs hover:border-accent-red/50 transition-colors"
          >
            링크 복사
          </button>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full py-4 border border-border rounded-sm text-text-secondary hover:border-accent-red/50 hover:text-white transition-all text-sm"
      >
        다른 관계도 분석해보기 →
      </button>
    </div>
  );
}

declare global {
  interface Window {
    Kakao: {
      isInitialized: () => boolean;
      Share: { sendDefault: (options: object) => void };
    };
  }
}
