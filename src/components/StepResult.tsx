import { useRef } from 'react';
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

export default function StepResult({ myData, targetData, result, onReset }: StepResultProps) {
  const shareCardRef = useRef<HTMLDivElement>(null);

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
          description: result.conflictSummary,
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
      <div className="text-center mb-8">
        <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">TOXIC 분석 결과</p>
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

        <ScoreGauge score={result.toxicScore} />
      </div>

      <div className="bg-card-bg border-l-2 border-accent-red rounded-sm p-5 mb-5">
        <p className="text-text-secondary text-xs mb-1">핵심 충돌 구조</p>
        <h3 className="font-serif-kr text-xl font-bold text-white mb-2">{result.conflictType}</h3>
        <p className="text-text-secondary text-sm leading-relaxed">{result.conflictSummary}</p>
      </div>

      <div className="space-y-3 mb-6">
        <AnalysisCard
          icon="⚡"
          title="충(沖) 분석 — 관계의 핵심 갈등 구조"
          content={result.analysis.chungAnalysis}
        />
        <AnalysisCard
          icon="🌑"
          title="형(刑) 분석 — 서서히 쌓이는 불편함"
          content={result.analysis.hyungAnalysis}
        />
        <AnalysisCard
          icon="🔥"
          title="오행 극(剋) — 에너지 빼앗기는 패턴"
          content={result.analysis.geukAnalysis}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {result.tags.map(tag => (
          <span key={tag} className="text-xs text-accent-red bg-accent-red/10 border border-accent-red/20 px-3 py-1 rounded-sm">
            {tag}
          </span>
        ))}
      </div>

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
      Share: {
        sendDefault: (options: object) => void;
      };
    };
  }
}
