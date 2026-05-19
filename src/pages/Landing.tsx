import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { startSession } from '../utils/analytics';

const ALL_REVIEWS = [
  { q: '전 남친이랑 왜 그렇게 싸웠는지 사주 보고 처음으로 이해됐어요. 충(沖) 구조라고 나왔는데 우리 싸움 패턴이랑 너무 똑같았어요', r: '26세 여성', tag: '연인', stars: 5 },
  { q: '팀장이랑 항상 부딪히는 이유가 인사형(刑) 충돌이었다는 거 소름. 이제 그냥 내 스타일대로 거리 둡니다', r: '직장인 남성', tag: '직장', stars: 5 },
  { q: '엄마랑 나 오행이 정반대라고 나와서 오히려 마음이 편해졌어요. 내 탓이 아니었구나', r: '32세 여성', tag: '가족', stars: 5 },
  { q: '연애 3년 내내 왜 싸웠는지 1분 만에 나왔어요. 이걸 3년 전에 알았더라면...', r: '24세 여성', tag: '연인', stars: 5 },
  { q: '이 정도면 거의 상담 수준인데 무료라는게 신기함. 결과 두 번 읽었어요', r: '29세 남성', tag: '연인', stars: 5 },
  { q: '갈등 시나리오 읽다가 소름돋음. 실제 우리 상황이랑 너무 똑같아서 화면 캡처했어요', r: '31세 여성', tag: '직장', stars: 5 },
  { q: '친구한테 이거 보내줬더니 우리 관계 얘기 하기 훨씬 편해졌다고 하더라고요', r: '22세 여성', tag: '친구', stars: 4 },
  { q: '막연하게 안맞는다고 느꼈던 게 이유가 있었구나 싶었어요. 분석 내용이 꽤 구체적이에요', r: '35세 남성', tag: '직장', stars: 4 },
  { q: '전 연인 생년월일 넣었는데 헤어진 이유가 다 나와서 좀 무서웠음. 정확해서 오히려 당황', r: '28세 여성', tag: '연인', stars: 5 },
  { q: '아빠랑 왜 이렇게 안맞나 했더니 오행 충돌이 심각하게 나왔음 ㅋㅋㅋ 설명 읽고 빵 터짐', r: '19세 여성', tag: '가족', stars: 4 },
  { q: '직장 동료랑 의견 충돌이 잦아서 해봤는데 충(沖) 관계라고 나왔어요. 이제 그냥 거리 두기로 했어요', r: '38세 남성', tag: '직장', stars: 4 },
  { q: '재미로 해봤는데 생각보다 깊은 내용이 나와서 놀랐어요. 저장해두고 종종 다시 읽어요', r: '27세 여성', tag: '연인', stars: 5 },
  { q: '남편이랑 항상 반복되는 싸움 패턴이 사주로 설명이 되니까 신기하고 좀 위로됐어요', r: '40대 여성', tag: '연인', stars: 5 },
  { q: '역산 모드가 좀 더 보완됐으면 좋겠어요. 생년월일 없는 상대 분석은 좀 아쉬웠음', r: '25세 남성', tag: '연인', stars: 3 },
  { q: '완전 믿지는 않지만 갈등 트리거 부분이 실제로 맞아서 신기했음. 나만 아는 내 패턴이 나와있음', r: '30세 여성', tag: '직장', stars: 4 },
  { q: '오빠랑 맨날 싸우는 이유 봤는데 너무 정확해서 오빠한테도 보내줬어요. 오빠가 읽고 아무 말도 못했대요 ㅋ', r: '23세 여성', tag: '가족', stars: 5 },
  { q: '상대방 생년월일 대략만 알아도 분석이 가능한 게 좋았어요. 실용적이에요', r: '33세 여성', tag: '연인', stars: 4 },
  { q: '결과 캡처해서 친구들이랑 같이 서로 봤는데 분위기 확 풀렸어요. 아이스브레이킹용 굿', r: '21세 여성', tag: '친구', stars: 4 },
  { q: '솔직히 사주는 반신반의인데 갈등 구조를 다르게 보게 해줘서 유익했어요. 갈등=구조 관점이 신선했어요', r: '44세 남성', tag: '직장', stars: 4 },
  { q: '1년 넘게 이유 모르고 힘들었는데 구조적 이유가 있었다는 게 오히려 편하게 받아들여져요', r: '29세 여성', tag: '연인', stars: 5 },
  { q: '앱이 깔끔하고 빠르게 나와서 좋은데 내용이 이렇게 많을 줄 몰랐어요. 다 읽는 데 한참 걸렸어요', r: '26세 남성', tag: '직장', stars: 3 },
  { q: '사주 잘 모르는 사람도 쉽게 이해할 수 있게 풀어줘서 좋아요. 어렵지 않아요', r: '31세 여성', tag: '친구', stars: 4 },
  { q: '퇴사 고민 중인데 팀장이랑 분석해봤어요. 결과 보고 퇴사 결심이 서버렸음 ㅋㅋ 면죄부 받은 느낌', r: '28세 여성', tag: '직장', stars: 5 },
  { q: '어머니랑 제 오행 관계 보고 많이 이해됐어요. 미움이 아니라 구조가 문제였던 거더라고요', r: '37세 남성', tag: '가족', stars: 5 },
  { q: '결과 내용이 좀 길긴 한데 다 읽을 만해요. 구체적이어서 좋아요. 이런 구체성은 처음 봤어요', r: '22세 여성', tag: '연인', stars: 4 },
  { q: '처음엔 그냥 재미용이었는데 내용이 너무 구체적으로 우리 상황을 설명해서 당황했어요. 찝찝하게 정확해요', r: '34세 여성', tag: '연인', stars: 5 },
  { q: '친구 관계도 사주로 보니까 진짜 이해가 되는 부분이 있음. 신박했어요. 인간관계 전반에 적용 가능할 듯', r: '20세 여성', tag: '친구', stars: 4 },
  { q: '연애 상담이랑 비슷한 느낌인데 훨씬 직접적으로 말해줘서 좋았어요. 돌려 말하지 않아서 시원함', r: '30세 여성', tag: '연인', stars: 5 },
  { q: '내용이 좀 AI스럽긴 한데 틀린 말은 없어서 그냥 인정함. 갈등 구조 분석 부분은 꽤 날카로움', r: '27세 남성', tag: '직장', stars: 3 },
  { q: '갈등 시나리오 부분이 소름이었어요. 실제로 있었던 상황이랑 너무 비슷해서 스크린샷 찍었어요', r: '25세 여성', tag: '연인', stars: 5 },
  { q: '남동생이랑 왜 항상 같은 패턴으로 싸우는지 알 것 같아졌어요. 충(沖)이 있었음', r: '33세 여성', tag: '가족', stars: 4 },
  { q: '이 서비스 보고 관계에서 기대치를 조정하게 됐어요. 구조적으로 무리한 기대를 했던 거더라고요', r: '41세 여성', tag: '연인', stars: 5 },
  { q: '단순 운세 앱이랑은 차원이 달라요. 왜 안맞는지 이유를 분석해줘서 실용적이에요', r: '36세 남성', tag: '직장', stars: 5 },
  { q: '점만 보는 거랑 달리 갈등 패턴을 분석해주니까 실생활에 적용해볼 수 있어서 좋아요', r: '28세 여성', tag: '가족', stars: 4 },
  { q: '솔직히 이 정도면 유료로 해도 낼 것 같음. 무료인 이유가 뭔지 모르겠어요', r: '32세 여성', tag: '연인', stars: 5 },
  { q: '일부 내용은 좀 과하게 느껴지기도 했지만 전반적으로 도움됐어요. 이해의 폭이 넓어진 느낌', r: '25세 남성', tag: '친구', stars: 3 },
  { q: '오랫동안 정리 못한 감정이 이 분석 보고 좀 정리됐어요. 카타르시스 있었어요', r: '29세 여성', tag: '연인', stars: 5 },
  { q: '전 남자친구 분석했더니 그 관계가 좀 이해됐어요. 미련보다 후련함이 남았어요', r: '27세 여성', tag: '연인', stars: 5 },
  { q: '팀장님이 왜 저만 싫어하는 것 같은지 구조적으로 나오니까 나름 위안이 됐어요', r: '31세 남성', tag: '직장', stars: 4 },
  { q: '용어들이 처음에 낯설었는데 설명이 잘 되어 있어서 이해하는 데 무리 없었어요', r: '23세 여성', tag: '친구', stars: 4 },
  { q: '부모님과의 관계를 다시 생각해보는 계기가 됐어요. 성격 문제가 아닌 구조 문제로 보게 됨', r: '38세 여성', tag: '가족', stars: 5 },
  { q: '연인 분석하고 나서 직장 관계도 궁금해졌어요. 다 돌려봤습니다. 중독성 있음', r: '30세 남성', tag: '연인', stars: 4 },
  { q: '사주로 보는 충돌 구조가 이렇게 구체적일 줄 몰랐어요. 이론이 아니라 실제 상황으로 나오네요', r: '24세 여성', tag: '연인', stars: 5 },
  { q: '친구한테 보내줬더니 우리 사이 얘기를 드디어 꺼낼 수 있었어요. 고마운 서비스', r: '22세 여성', tag: '친구', stars: 5 },
  { q: '현실적 전망 부분이 너무 날카로워서 당황함. 좋은 말 해줄 줄 알았는데 직접적이에요', r: '35세 여성', tag: '연인', stars: 4 },
  { q: '사주에 이렇게 구체적인 갈등 분석이 있는지 몰랐어요. 전통 사주를 현대적으로 잘 해석했네요', r: '43세 남성', tag: '가족', stars: 4 },
  { q: '무료인데 내용이 이 정도면 진짜 잘 만든 서비스예요. 광고도 없고 깔끔해서 더 신뢰가 가요', r: '26세 여성', tag: '연인', stars: 5 },
  { q: '앱이 깔끔해서 스크린샷 찍어 친구들한테 공유했어요. 다들 자기 것도 해보겠다고 했음', r: '21세 여성', tag: '친구', stars: 4 },
  { q: '그냥 재미로 하려다가 너무 현실적으로 정확해서 좀 슬퍼짐. 위로는 없고 팩트만 있음', r: '28세 여성', tag: '연인', stars: 5 },
  { q: '사주 전통 방식과 현대적 해석을 잘 조합한 것 같아요. 이런 서비스가 있다는 게 신기해요', r: '39세 남성', tag: '직장', stars: 4 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 천간지지 한자 배경 워터마크
const HANJA_ITEMS = [
  { char: '甲', x: 6,  y: 3,  size: '6.5rem', opacity: 0.10, rotate: -12, red: false },
  { char: '子', x: 83, y: 2,  size: '8.5rem', opacity: 0.07, rotate: 7,   red: true  },
  { char: '壬', x: 48, y: 8,  size: '5.5rem', opacity: 0.09, rotate: -4,  red: false },
  { char: '午', x: 68, y: 14, size: '7rem',   opacity: 0.08, rotate: 11,  red: true  },
  { char: '辰', x: 18, y: 19, size: '10rem',  opacity: 0.06, rotate: -8,  red: false },
  { char: '乙', x: 91, y: 22, size: '6rem',   opacity: 0.10, rotate: -16, red: false },
  { char: '丙', x: 4,  y: 32, size: '7.5rem', opacity: 0.08, rotate: 5,   red: true  },
  { char: '戌', x: 76, y: 36, size: '6rem',   opacity: 0.09, rotate: -13, red: false },
  { char: '癸', x: 40, y: 43, size: '9rem',   opacity: 0.07, rotate: 8,   red: false },
  { char: '寅', x: 89, y: 49, size: '5.5rem', opacity: 0.10, rotate: -3,  red: true  },
  { char: '庚', x: 14, y: 55, size: '11rem',  opacity: 0.05, rotate: 13,  red: false },
  { char: '丑', x: 58, y: 58, size: '5rem',   opacity: 0.11, rotate: -6,  red: false },
  { char: '巳', x: 30, y: 64, size: '7rem',   opacity: 0.09, rotate: 9,   red: true  },
  { char: '己', x: 72, y: 68, size: '6.5rem', opacity: 0.09, rotate: -10, red: false },
  { char: '酉', x: 5,  y: 73, size: '8rem',   opacity: 0.07, rotate: 4,   red: false },
  { char: '丁', x: 88, y: 76, size: '5.5rem', opacity: 0.11, rotate: 14,  red: true  },
  { char: '亥', x: 48, y: 82, size: '9.5rem', opacity: 0.06, rotate: -7,  red: false },
  { char: '辛', x: 22, y: 86, size: '6rem',   opacity: 0.09, rotate: 6,   red: false },
  { char: '卯', x: 78, y: 90, size: '7.5rem', opacity: 0.08, rotate: -11, red: true  },
  { char: '未', x: 10, y: 93, size: '5rem',   opacity: 0.10, rotate: 16,  red: false },
  { char: '戊', x: 62, y: 96, size: '8rem',   opacity: 0.07, rotate: -5,  red: false },
  { char: '申', x: 38, y: 98, size: '6rem',   opacity: 0.09, rotate: 9,   red: true  },
];

function HanjaWatermark() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden>
      {HANJA_ITEMS.map((item, i) => (
        <span
          key={i}
          className="absolute font-display leading-none"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: item.size,
            opacity: item.opacity,
            color: item.red ? '#FF2D55' : '#ffffff',
            transform: `rotate(${item.rotate}deg)`,
            lineHeight: 1,
          }}
        >
          {item.char}
        </span>
      ))}
    </div>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-[10px] ${i <= count ? 'text-[#FF2D55]' : 'text-[#333]'}`}>★</span>
      ))}
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const [reviews] = useState(() => shuffle(ALL_REVIEWS));
  const [reviewPage, setReviewPage] = useState(0);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const totalPages = Math.ceil(reviews.length / 5);

  useEffect(() => { startSession(); }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = window.scrollY;
      el.style.opacity = String(Math.max(0, 1 - y / 150));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setReviewPage(p => (p + 1) % totalPages), 30000);
    return () => clearInterval(t);
  }, [totalPages]);

  return (
    <div className="bg-[#0A0A0A] min-h-screen overflow-x-hidden relative">
      <div className="grain-overlay" aria-hidden />
      <HanjaWatermark />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-xl mx-auto px-5 h-14 flex items-center justify-between">
          <img src="/logo.svg" alt="TOXIC" className="h-16 object-contain" />
          <button
            onClick={() => navigate('/app')}
            className="text-[11px] text-white bg-[#FF2D55] px-5 py-2.5 hover:opacity-90 transition-opacity font-sans-kr tracking-wider font-bold"
          >
            분석 시작 →
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HERO — "왜 안맞는지" FIRST
      ══════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center px-5 pt-28 pb-20 max-w-xl mx-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,45,85,0.13) 0%, transparent 65%)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D55] animate-pulse" />
            <span className="text-[#FF2D55] text-[10px] uppercase tracking-[0.3em] font-sans-kr">
              사주로 보는 관계의 본질
            </span>
          </div>

          {/* 메인 훅 — 안맞는 이유가 FIRST */}
          <h1 className="font-display leading-[1.02] text-white mb-6"
            style={{ fontSize: 'clamp(3.2rem, 14vw, 6rem)' }}>
            그 사람이랑<br />
            왜 이렇게<br />
            <span className="text-[#FF2D55]">안 맞는 걸까</span>
          </h1>

          <p className="font-sans-kr text-[#888] text-sm leading-relaxed mb-1">
            지금 떠오르는 그 한 명 — 전 연인, 상사, 가족 누구든.
          </p>
          <p className="font-sans-kr text-white text-base leading-relaxed mb-12">
            사주에 <span className="text-[#FF2D55] font-bold">이미 답이 있었습니다.</span>
          </p>

          <button
            onClick={() => navigate('/app')}
            className="w-full bg-[#FF2D55] text-white font-display text-xl py-5 tracking-wide hover:opacity-90 transition-opacity mb-4"
            style={{ boxShadow: '0 0 60px rgba(255,45,85,0.35)' }}
          >
            그 사람 생일 넣어보기 →
          </button>
          <p className="font-sans-kr text-[#555] text-xs text-center mb-2">
            무료 · 1분 · 전 연인 · 친구 · 직장 · 가족 다 가능
          </p>
          <p className="font-sans-kr text-[#444] text-xs text-center">
            생일 몰라도 괜찮아요 — <span className="text-[#666]">대략적인 나이만 알아도 분석 가능해요</span>
          </p>
        </div>

        <div
          ref={heroRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[#444] text-[10px] uppercase tracking-[0.3em] font-sans-kr">scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-[#FF2D55]/60 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ══════════════════════════════════════
          PROBLEM — 기존 앱 vs TOXIC
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-24 border-t border-white/[0.06]">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(191,90,242,0.08) 0%, transparent 55%)' }} />
        <div className="max-w-xl mx-auto relative z-10">
          <p className="text-[#555] text-[10px] uppercase tracking-[0.3em] font-sans-kr mb-8">기존 사주앱과 다른 점</p>

          <h2 className="font-display leading-[1.08] text-white mb-2"
            style={{ fontSize: 'clamp(2.4rem, 10vw, 4rem)' }}>
            잘 맞는 사람 말고
          </h2>
          <h2 className="font-display leading-[1.08] mb-10"
            style={{ fontSize: 'clamp(2.4rem, 10vw, 4rem)' }}>
            <span className="text-[#FF2D55]">안 맞는 이유</span>를 봐요
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="border border-[#1e1e1e] p-5 bg-[#0D0D0D]">
              <p className="text-[10px] uppercase tracking-widest text-[#666] font-sans-kr mb-6">기존 사주앱</p>
              <div className="space-y-3 mb-6">
                {['우리 잘 맞을까?', '더 잘 맞는 상대는?', '이상형 찾기'].map(t => (
                  <p key={t} className="font-sans-kr text-[#666] text-xs line-through">{t}</p>
                ))}
              </div>
              <p className="font-sans-kr text-[#777] text-[11px] leading-relaxed">미래의 좋은 관계를<br />찾아드립니다</p>
            </div>

            <div className="border border-[#FF2D55]/40 p-5 relative overflow-hidden"
              style={{ background: '#0D0005', boxShadow: '0 0 40px rgba(255,45,85,0.1) inset' }}>
              <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                style={{ background: 'radial-gradient(circle at top right, rgba(255,45,85,0.25), transparent)' }} />
              <p className="text-[10px] uppercase tracking-widest text-[#FF2D55] font-bold font-sans-kr mb-6">TOXIC</p>
              <div className="space-y-3 mb-6">
                {['왜 어긋났는지', '반복되는 패턴', '충돌 구조 해석'].map(t => (
                  <div key={t} className="flex items-center gap-2">
                    <span className="text-[#FF2D55] text-xs">✓</span>
                    <p className="font-sans-kr text-white text-xs">{t}</p>
                  </div>
                ))}
              </div>
              <p className="font-sans-kr text-[#888] text-[11px] leading-relaxed">
                지금 힘든 관계의<br /><span className="text-white">이유를 파고듭니다</span>
              </p>
            </div>
          </div>

          <p className="font-sans-kr text-center text-[#777] text-xs">
            힘든 관계의 <span className="text-[#999]">이유</span>와 <span className="text-[#FF2D55]">구조적 원인</span> 분석
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STORY 1 — 연인
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-24 border-t border-white/[0.06]">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 15% 60%, rgba(255,45,85,0.09) 0%, transparent 50%)' }} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-6 h-px bg-[#FF2D55]" />
            <p className="text-[#FF2D55] text-[10px] uppercase tracking-[0.25em] font-sans-kr">연인 · 전 연인</p>
          </div>

          <h2 className="font-display leading-[1.08] text-white mb-2"
            style={{ fontSize: 'clamp(2.8rem, 11vw, 4.5rem)' }}>
            헤어진 이유를
          </h2>
          <h2 className="font-display leading-[1.08] text-[#FF2D55] mb-12"
            style={{ fontSize: 'clamp(2.8rem, 11vw, 4.5rem)' }}>
            이제야 알았다
          </h2>

          <div className="bg-[#0D0D0D] border-l-[2px] border-[#FF2D55] pl-6 py-5 mb-10">
            <p className="font-sans-kr text-[#999] text-sm leading-relaxed mb-1">좋아했는데 자꾸 다쳤다면</p>
            <p className="font-sans-kr text-white text-sm leading-relaxed">
              사주에선 <span className="text-[#FF2D55] font-bold">충(沖)</span>일 수 있어요.
              서로 끌리지만 방향이 정반대인 구조.
            </p>
          </div>

          <div className="border border-[#1e1e1e] p-6 mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 font-display text-[120px] leading-none text-[#FF2D55]/[0.04] pointer-events-none select-none">沖</div>
            <div className="flex items-start gap-5 relative">
              <div className="border border-[#FF2D55] text-[#FF2D55] font-display text-lg px-3 py-2 flex-shrink-0 w-16 text-center">
                충<br /><span className="text-[10px] opacity-60">沖</span>
              </div>
              <div>
                <p className="font-sans-kr text-white text-sm font-bold mb-2">자오충(子午沖) — 강한 에너지 충돌</p>
                <p className="font-sans-kr text-[#666] text-xs leading-relaxed">
                  서로 끌리지만 결국 폭발하는 구조.<br />
                  처음엔 운명처럼 느껴지지만 근본 방향이 반대입니다.
                </p>
              </div>
            </div>
          </div>

          <button onClick={() => navigate('/app')}
            className="w-full border border-[#FF2D55]/40 text-white font-sans-kr text-sm py-4 hover:bg-[#FF2D55]/10 transition-colors tracking-wide">
            전 연인 분석하기 →
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STORY 2 — 직장
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-24 border-t border-white/[0.06]">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 85% 40%, rgba(191,90,242,0.08) 0%, transparent 50%)' }} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-6 h-px bg-[#BF5AF2]" />
            <p className="text-[#BF5AF2] text-[10px] uppercase tracking-[0.25em] font-sans-kr">직장 상사 · 동료</p>
          </div>

          <h2 className="font-display leading-[1.08] text-white mb-2"
            style={{ fontSize: 'clamp(2.8rem, 11vw, 4.5rem)' }}>
            저 팀장이랑
          </h2>
          <h2 className="font-display leading-[1.08] mb-12"
            style={{ fontSize: 'clamp(2.8rem, 11vw, 4.5rem)' }}>
            왜 이렇게 <span className="text-[#FF2D55]">안 맞지?</span>
          </h2>

          <div className="grid grid-cols-3 gap-3 mb-10">
            {[
              { num: '3', unit: '개월', desc: '평균 갈등 인지 시점' },
              { num: '78', unit: '%', desc: '직장 스트레스 = 관계 문제' },
              { num: '1', unit: '분', desc: '분석 소요 시간' },
            ].map(({ num, unit, desc }) => (
              <div key={desc} className="border border-[#1e1e1e] p-4 text-center">
                <div className="flex items-end justify-center gap-0.5 mb-1">
                  <span className="font-display text-[#FF2D55] text-3xl leading-none">{num}</span>
                  <span className="font-display text-[#FF2D55] text-sm mb-0.5">{unit}</span>
                </div>
                <p className="font-sans-kr text-[#555] text-[10px] leading-tight">{desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#0D0D0D] border-l-[2px] border-[#BF5AF2] pl-6 py-5 mb-10">
            <p className="font-sans-kr text-[#999] text-sm leading-relaxed mb-1">말투도 기준도 매번 어긋난다면</p>
            <p className="font-sans-kr text-white text-sm leading-relaxed">
              성격 차이가 아니라 <span className="text-[#BF5AF2] font-bold">구조 문제</span>일 수 있어요.
            </p>
          </div>

          <div className="border border-[#1e1e1e] p-6 mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 font-display text-[120px] leading-none text-[#BF5AF2]/[0.04] pointer-events-none select-none">刑</div>
            <div className="flex items-start gap-5 relative">
              <div className="border border-[#BF5AF2] text-[#BF5AF2] font-display text-lg px-3 py-2 flex-shrink-0 w-16 text-center">
                형<br /><span className="text-[10px] opacity-60">刑</span>
              </div>
              <div>
                <p className="font-sans-kr text-white text-sm font-bold mb-2">인사신형(寅巳申刑) — 누적 충돌</p>
                <p className="font-sans-kr text-[#666] text-xs leading-relaxed">
                  갑자기 폭발하지 않아요.<br />
                  서서히, 조용히, 확실하게 쌓이는 불편함.
                </p>
              </div>
            </div>
          </div>

          <button onClick={() => navigate('/app')}
            className="w-full border border-[#BF5AF2]/40 text-white font-sans-kr text-sm py-4 hover:bg-[#BF5AF2]/10 transition-colors tracking-wide">
            직장 관계 분석하기 →
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STORY 3 — 가족 (차별화 레이아웃)
      ══════════════════════════════════════ */}
      <section className="relative border-t border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,45,85,0.06) 0%, transparent 60%)' }} />

        {/* 대형 한자 배경 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden>
          <span className="font-display text-[28vw] leading-none text-white/[0.018]">家</span>
        </div>

        <div className="max-w-xl mx-auto px-5 py-24 relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-6 h-px bg-[#FF2D55]" />
            <p className="text-[#FF2D55] text-[10px] uppercase tracking-[0.25em] font-sans-kr">가족</p>
          </div>

          {/* 중앙 인용구 포맷 */}
          <div className="text-center mb-14">
            <p className="font-display leading-[1.08] text-white mb-3"
              style={{ fontSize: 'clamp(2.4rem, 10vw, 4rem)' }}>
              사랑하는데
            </p>
            <p className="font-display leading-[1.08] mb-3"
              style={{ fontSize: 'clamp(2.4rem, 10vw, 4rem)' }}>
              <span className="text-[#FF2D55]">왜 이렇게 아플까</span>
            </p>
            <p className="font-sans-kr text-[#777] text-sm mt-6 leading-relaxed">
              억압이 아니에요. 오행의 흐름입니다.
            </p>
          </div>

          {/* 세 가지 오행 관계 카드 (가로 나열) */}
          <div className="grid grid-cols-3 gap-2 mb-12">
            {[
              { hanja: '剋', name: '극', desc: '에너지 소모' },
              { hanja: '沖', name: '충', desc: '방향 충돌' },
              { hanja: '刑', name: '형', desc: '누적 갈등' },
            ].map(({ hanja, name, desc }) => (
              <div key={hanja} className="border border-[#1e1e1e] p-4 text-center bg-[#0A0A0A]">
                <span className="font-display text-[#FF2D55]/60 text-3xl leading-none block mb-2">{hanja}</span>
                <p className="font-sans-kr text-white text-xs font-bold">{name}</p>
                <p className="font-sans-kr text-[#555] text-[10px] mt-1">{desc}</p>
              </div>
            ))}
          </div>

          <div className="border-l-[2px] border-[#FF2D55] pl-6 py-4 bg-[#0D0D0D] mb-10">
            <p className="font-sans-kr text-[#999] text-sm leading-relaxed mb-1">가족이라 더 어렵고, 더 오래 아파요</p>
            <p className="font-sans-kr text-white text-sm leading-relaxed">
              이건 성격 문제가 아니라 <span className="text-[#FF2D55] font-bold">구조의 문제</span>입니다.
            </p>
          </div>

          <button onClick={() => navigate('/app')}
            className="w-full border border-[#FF2D55]/40 text-white font-sans-kr text-sm py-4 hover:bg-[#FF2D55]/10 transition-colors tracking-wide">
            가족 관계 분석하기 →
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SOCIAL PROOF — 후기 슬라이드 (5개씩, 30초)
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-24 border-t border-white/[0.06]">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,45,85,0.06) 0%, transparent 50%)' }} />
        <div className="max-w-xl mx-auto relative z-10">

          <p className="text-[#555] text-[10px] uppercase tracking-[0.3em] font-sans-kr text-center mb-3">실제 반응</p>
          <h2 className="font-display text-white text-center mb-12"
            style={{ fontSize: 'clamp(2rem, 8vw, 3rem)' }}>
            사람들이 뭐라 했냐면
          </h2>

          {/* 숫자 stats */}
          <div className="grid grid-cols-3 gap-px bg-[#1a1a1a] border border-[#1a1a1a] mb-12">
            {[
              { num: '4.4', unit: '/ 5', label: '평균 만족도', sub: '실제 리뷰 54개 기준' },
              { num: '1분', unit: '', label: '분석 소요 시간', sub: '입력 후 AI 분석' },
              { num: '100%', unit: '', label: '무료', sub: '광고 없음' },
            ].map(({ num, unit, label, sub }) => (
              <div key={label} className="bg-[#0A0A0A] py-7 text-center">
                <div className="flex items-end justify-center gap-1 mb-1">
                  <span className="font-display text-white text-3xl leading-none">{num}</span>
                  {unit && <span className="font-display text-[#666] text-sm mb-0.5">{unit}</span>}
                </div>
                <p className="font-sans-kr text-[#777] text-[10px]">{label}</p>
                <p className="font-sans-kr text-[#444] text-[9px] mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* 후기 슬라이드 — 5개씩 */}
          <div key={reviewPage} className="animate-fade-in space-y-3 mb-8">
            {reviews.slice(reviewPage * 5, reviewPage * 5 + 5).map((review, i) => (
              <div key={i} className="border border-[#1a1a1a] p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-[#FF2D55] border border-[#FF2D55]/30 px-2 py-0.5 font-sans-kr">
                    {review.tag}
                  </span>
                  <Stars count={review.stars} />
                </div>
                <p className="font-sans-kr text-white text-sm leading-relaxed mb-2">"{review.q}"</p>
                <p className="font-sans-kr text-[#444] text-xs">— {review.r}</p>
              </div>
            ))}
          </div>

          {/* 페이지 인디케이터 + 수동 이동 */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setReviewPage(p => (p - 1 + totalPages) % totalPages)}
              className="text-[#555] hover:text-[#FF2D55] transition-colors text-base px-4 py-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="이전 리뷰"
            >
              ←
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setReviewPage(i)}
                  className={`rounded-full transition-all duration-300 min-w-[16px] min-h-[16px] flex items-center justify-center ${i === reviewPage ? 'bg-[#FF2D55] w-4 h-2' : 'bg-[#444] w-2 h-2'}`}
                  aria-label={`${i + 1}번째 페이지`}
                />
              ))}
            </div>
            <button
              onClick={() => setReviewPage(p => (p + 1) % totalPages)}
              className="text-[#555] hover:text-[#FF2D55] transition-colors text-base px-4 py-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="다음 리뷰"
            >
              →
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          OFFER — Mock UI
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-24 border-t border-white/[0.06]">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,45,85,0.08) 0%, transparent 55%)' }} />
        <div className="max-w-xl mx-auto relative z-10">

          <p className="text-[#555] text-[10px] uppercase tracking-[0.3em] font-sans-kr text-center mb-3">
            TOXIC SAJU ANALYSIS
          </p>
          <h2 className="font-display leading-[1.05] text-white text-center mb-1"
            style={{ fontSize: 'clamp(3rem, 12vw, 5rem)' }}>
            그 사람
          </h2>
          <h2 className="font-display leading-[1.05] text-[#FF2D55] text-center mb-10"
            style={{ fontSize: 'clamp(3rem, 12vw, 5rem)' }}>
            생일 넣어봐
          </h2>

          <p className="font-sans-kr text-center text-[#666] text-sm mb-10">
            딱 한 명 떠오른다면 지금.<br />
            <span className="text-[#888]">결과 캡처해서 친구 태그하기.</span>
          </p>

          <div className="border border-[#222] p-6 mb-6"
            style={{ background: '#0D0D0D', boxShadow: '0 0 80px rgba(255,45,85,0.08)' }}>
            <div className="flex items-center gap-2 text-[#555] text-[11px] font-sans-kr mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D55]" />
              <span>생년월일 입력</span>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-7">
              {['1995년', '07월', '21일', '미입력'].map(v => (
                <div key={v} className="border border-[#222] px-2 py-3 text-[#666] text-xs flex items-center justify-between font-sans-kr">
                  <span>{v}</span><span className="text-[#333]">∨</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#1a1a1a] pt-5 mb-5">
              <p className="font-sans-kr text-[#555] text-[11px] uppercase tracking-wider mb-4">충돌 분석 결과</p>
              <div className="flex items-end gap-2 mb-3">
                <span className="font-display text-[#FF2D55] text-6xl leading-none">72</span>
                <div className="mb-2">
                  <span className="font-display text-[#FF2D55] text-2xl">%</span>
                  <p className="font-sans-kr text-[#777] text-[10px]">독성 지수</p>
                </div>
                <div className="ml-auto bg-[#FF2D55]/10 border border-[#FF2D55]/40 text-[#FF2D55] text-[10px] px-3 py-1.5 font-bold font-sans-kr self-end mb-1">
                  위험도 HIGH
                </div>
              </div>
              <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden mb-5">
                <div className="h-full rounded-full"
                  style={{ width: '72%', background: 'linear-gradient(90deg, #FF2D55 0%, #BF5AF2 100%)' }} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['#인신충', '#에너지소모', '#충돌구조', '#중간위험'].map(tag => (
                  <span key={tag} className="text-[10px] text-[#FF2D55] bg-[#FF2D55]/8 border border-[#FF2D55]/20 px-2 py-0.5 font-sans-kr">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/app')}
              className="w-full bg-[#FF2D55] text-white font-display text-xl py-5 hover:opacity-90 transition-opacity tracking-wide"
              style={{ boxShadow: '0 0 40px rgba(255,45,85,0.3)' }}
            >
              지금 분석하기 →
            </button>
          </div>

          <p className="font-sans-kr text-center text-[#444] text-xs">
            전 연인 · 친구 · 상사 · 가족{' '}
            <span className="border border-[#333] px-2.5 py-0.5 rounded-full">모두 가능</span>
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-28 border-t border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,45,85,0.15) 0%, transparent 55%)' }} />
        <div className="max-w-xl mx-auto text-center relative z-10">

          <p className="text-[#555] text-[10px] uppercase tracking-[0.3em] font-sans-kr mb-8">지금 바로</p>

          <h2 className="font-display leading-[1.05] text-white mb-2"
            style={{ fontSize: 'clamp(3rem, 12vw, 5rem)' }}>
            당신을 힘들게 한
          </h2>
          <h2 className="font-display leading-[1.05] text-[#FF2D55] mb-10"
            style={{ fontSize: 'clamp(3rem, 12vw, 5rem)' }}>
            그 사람의 이유
          </h2>

          <p className="font-sans-kr text-[#666] leading-relaxed mb-12">
            사주에 이미 답이 있었습니다.
          </p>

          <button
            onClick={() => navigate('/app')}
            className="w-full bg-[#FF2D55] text-white font-display text-2xl py-6 hover:opacity-90 transition-opacity tracking-wide mb-4"
            style={{ boxShadow: '0 0 100px rgba(255,45,85,0.4)' }}
          >
            지금 분석하기 →
          </button>
          <p className="font-sans-kr text-[#444] text-xs">무료 · 1분 · 지금 바로</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] py-12 px-5">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-4">
          <img src="/logo.svg" alt="TOXIC" className="h-10 object-contain opacity-60" />
          <p className="font-sans-kr text-[#555] text-xs">사주로 보는 관계의 본질</p>
          <div className="w-px h-4 bg-[#222]" />
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPrivacy(true)}
              className="font-sans-kr text-[#444] text-xs hover:text-[#666] transition-colors"
            >
              개인정보처리방침
            </button>
            <span className="text-[#222] text-xs">·</span>
            <p className="font-sans-kr text-[#333] text-xs">© 2025 TOXIC. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 개인정보처리방침 모달 */}
      {showPrivacy && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-end sm:items-center justify-center px-4 pb-0 sm:pb-4 animate-fade-in"
          onClick={() => setShowPrivacy(false)}
        >
          <div
            className="bg-[#0D0D0D] border border-[#222] w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 sm:rounded-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-white text-xl">개인정보처리방침</h2>
              <button onClick={() => setShowPrivacy(false)} className="text-[#555] hover:text-white text-xl px-2">✕</button>
            </div>
            <div className="space-y-5 font-sans-kr text-[#888] text-sm leading-relaxed">
              <div>
                <p className="text-white text-xs font-bold mb-2 uppercase tracking-wider">수집하는 정보</p>
                <p>TOXIC은 사주 분석을 위해 생년월일, 출생 시간, 성별을 입력받습니다. 이름은 선택 사항입니다. 수집된 정보는 서버에 저장되지 않으며, 분석 완료 후 즉시 파기됩니다.</p>
              </div>
              <div>
                <p className="text-white text-xs font-bold mb-2 uppercase tracking-wider">정보 이용 목적</p>
                <p>입력된 생년월일 정보는 사주 분석 결과 생성에만 사용됩니다. 마케팅, 제3자 제공, 프로파일링 등의 목적으로 사용되지 않습니다.</p>
              </div>
              <div>
                <p className="text-white text-xs font-bold mb-2 uppercase tracking-wider">정보 보관 및 파기</p>
                <p>TOXIC은 개인정보를 별도의 데이터베이스에 저장하지 않습니다. AI 분석 요청 시 Anthropic API에 전송되며, Anthropic의 개인정보처리방침을 따릅니다.</p>
              </div>
              <div>
                <p className="text-white text-xs font-bold mb-2 uppercase tracking-wider">문의</p>
                <p>개인정보 관련 문의사항은 서비스 내 문의 채널을 통해 접수해주세요.</p>
              </div>
            </div>
            <button
              onClick={() => setShowPrivacy(false)}
              className="mt-6 w-full py-3 border border-[#333] text-[#666] text-sm hover:border-[#555] hover:text-white transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
