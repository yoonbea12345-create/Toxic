import { forwardRef } from 'react';
import type { SajuResult } from '../utils/saju';

interface ShareCardProps {
  myName: string;
  targetName?: string;
  result: SajuResult;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ myName, result }, ref) => {
  return (
    <div
      ref={ref}
      className="w-80 bg-[#0A0A0A] border border-[#2C2C2E] rounded-sm p-6"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="flex items-center gap-2 mb-6">
        <span className="text-white font-black text-xl tracking-widest">TOXIC</span>
        <span className="text-lg">🖤</span>
      </div>

      <p className="text-[#8E8E93] text-xs mb-1 uppercase tracking-widest">나의 천적 분석 결과</p>
      <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'Noto Serif KR, serif' }}>
        {result.conflictType}
      </h3>
      <p className="text-[#8E8E93] text-xs mb-5 leading-relaxed">{result.conflictSummary}</p>

      <div className="bg-[#1C1C1E] rounded-sm p-3 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#8E8E93] text-xs">독성 지수</span>
          <span className={`text-xs font-bold ${result.toxicScore >= 80 ? 'text-[#FF2D55]' : result.toxicScore >= 60 ? 'text-[#BF5AF2]' : 'text-yellow-400'}`}>
            {result.toxicScore >= 80 ? '위험도 HIGH' : result.toxicScore >= 60 ? '위험도 MID' : '위험도 LOW'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-[#2C2C2E] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${result.toxicScore}%`,
                background: 'linear-gradient(90deg, #FF2D55, #BF5AF2)',
              }}
            />
          </div>
          <span className="text-white font-bold text-sm">{result.toxicScore}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {result.tags.map(tag => (
          <span key={tag} className="text-[10px] text-[#FF2D55] bg-[#FF2D55]/10 px-2 py-0.5 rounded-sm">{tag}</span>
        ))}
      </div>

      <div className="border-t border-[#2C2C2E] pt-4 flex items-center justify-between">
        <span className="text-[#8E8E93] text-xs">{myName || '나'} · TOXIC 분석</span>
        <span className="text-[#8E8E93] text-xs">toxic.kr</span>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';
export default ShareCard;
