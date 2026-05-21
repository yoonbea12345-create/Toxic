import { useEffect, useState } from 'react';

const CHARS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const MESSAGES = ['사주팔자 추출 중...', '충(沖) 관계 분석 중...', '형(刑) 패턴 계산 중...', '관계 패턴 해석 중...', '결과 생성 중...'];

export default function StepLoading() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [visibleChars, setVisibleChars] = useState<{ char: string; x: number; y: number; id: number }[]>([]);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIdx(i => (i + 1) % MESSAGES.length);
    }, 600);
    return () => clearInterval(msgInterval);
  }, []);

  useEffect(() => {
    let id = 0;
    const charInterval = setInterval(() => {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const x = Math.random() * 80 + 10;
      const y = Math.random() * 60 + 20;
      id++;
      const newChar = { char, x, y, id };
      setVisibleChars(prev => [...prev.slice(-8), newChar]);
    }, 300);
    return () => clearInterval(charInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-bg flex flex-col items-center justify-center z-50 overflow-hidden">
      {visibleChars.map(({ char, x, y, id }) => (
        <span
          key={id}
          className="absolute font-display text-3xl font-bold char-animate pointer-events-none select-none"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            color: Math.random() > 0.5 ? '#FF2D55' : '#BF5AF2',
            opacity: 0,
          }}
        >
          {char}
        </span>
      ))}

      <div className="relative z-10 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full gradient-red flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <span className="font-display text-2xl font-black text-white">☯</span>
          </div>
        </div>

        <div className="w-48 h-1 bg-border rounded-full mx-auto overflow-hidden mb-6">
          <div className="h-full gradient-red rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>

        <p className="text-text-secondary text-sm font-sans transition-all duration-300">{MESSAGES[msgIdx]}</p>
      </div>
    </div>
  );
}
