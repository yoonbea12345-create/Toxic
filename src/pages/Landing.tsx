import { useNavigate } from 'react-router-dom';

const relationCards = [
  { emoji: '💔', label: '연인 / 전 연인', desc: '왜 그렇게 터졌는지' },
  { emoji: '😤', label: '직장 상사', desc: '왜 저 사람이랑만 안맞는지' },
  { emoji: '👥', label: '친구', desc: '왜 멀어졌는지 모르겠는' },
  { emoji: '👨‍👩‍👧', label: '가족', desc: '사랑하는데 왜 항상 상처받는지' },
  { emoji: '🌀', label: '그냥 싫은 사람', desc: '이유도 모르게 불편한 그 사람' },
];

const testimonials = [
  { quote: '전 남친이랑 왜 그렇게 싸웠는지 사주 보고 처음으로 이해됐어요', role: '20대 여성' },
  { quote: '팀장이랑 항상 부딪히는 이유가 인사형(刑) 충돌이었다는거 소름...', role: '직장인' },
  { quote: '엄마랑 나 오행이 정반대라고 나와서 오히려 마음이 편해졌어요', role: '30대 여성' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-bg min-h-screen">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-bg/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-serif-kr font-black text-xl text-white tracking-widest">TOXIC</span>
          <button
            onClick={() => navigate('/app')}
            className="text-sm text-text-secondary hover:text-white transition-colors border border-border px-4 py-2 rounded-sm hover:border-accent-red/50"
          >
            분석 시작하기
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-10 overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden
        >
          <span
            className="font-serif-kr font-black text-[22vw] leading-none"
            style={{ color: 'rgba(255,255,255,0.03)' }}
          >
            TOXIC
          </span>
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,45,85,0.06) 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(191,90,242,0.06) 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-accent-red/30 bg-accent-red/5 rounded-sm px-4 py-2 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse" />
            <span className="text-accent-red text-xs uppercase tracking-widest">사주 기반 관계 충돌 분석</span>
          </div>

          <h1 className="font-serif-kr font-black text-4xl md:text-6xl text-white leading-tight mb-4">
            잘 맞는 사람이 아니라,
            <br />
            <span className="gradient-text">왜 안맞는지를</span>
            <br />
            알려드립니다
          </h1>

          <p className="text-text-secondary text-lg md:text-xl mb-10 max-w-lg mx-auto leading-relaxed">
            당신을 힘들게 하는 그 사람.<br className="md:hidden" /> 사주에 이미 답이 있었습니다.
          </p>

          <button
            onClick={() => navigate('/app')}
            className="gradient-red glow-red px-10 py-5 text-white font-bold text-lg rounded-sm hover:opacity-90 transition-all w-full sm:w-auto"
          >
            내 사주 분석하기 →
          </button>

          <p className="text-text-secondary text-xs mt-4">무료 · 1분 소요 · 전 연인, 친구, 직장, 가족 모두 가능</p>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-text-secondary to-transparent mx-auto" />
        </div>
      </section>

      {/* PROBLEM — 핵심 차별성 */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-text-secondary text-xs uppercase tracking-widest mb-3">차별점</p>
            <h2 className="font-serif-kr font-bold text-3xl md:text-4xl text-white">기존 사주 앱과 다릅니다</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* 기존 */}
            <div className="bg-card-bg border border-border rounded-sm p-6 opacity-70">
              <div className="inline-block bg-border text-text-secondary text-xs px-3 py-1 rounded-sm mb-5">
                기존 사주 궁합 서비스
              </div>
              <div className="space-y-3">
                {['우리 잘 맞을까?', '나의 이상형 찾기', '좋은 궁합 분석', '잘 될 사람 예측'].map(item => (
                  <div key={item} className="flex items-center gap-3 text-text-secondary">
                    <span className="w-4 h-4 rounded-full border border-border flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TOXIC */}
            <div className="bg-card-bg border border-accent-red rounded-sm p-6 glow-red relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
                style={{ background: 'radial-gradient(circle at top right, rgba(255,45,85,0.15) 0%, transparent 70%)' }} />
              <div className="inline-block gradient-red text-white text-xs px-3 py-1 rounded-sm mb-5 font-bold tracking-widest">
                TOXIC
              </div>
              <div className="space-y-3">
                {['왜 우리 이렇게 안맞지?', '나를 힘들게 하는 사람 분석', '관계가 틀어진 이유 해석', '사주로 보는 충돌의 원인'].map(item => (
                  <div key={item} className="flex items-center gap-3 text-white">
                    <span className="w-4 h-4 rounded-full bg-accent-red/20 border border-accent-red flex items-center justify-center flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-red" />
                    </span>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RELATION TYPES */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-text-secondary text-xs uppercase tracking-widest mb-3">대상</p>
            <h2 className="font-serif-kr font-bold text-3xl md:text-4xl text-white">모든 관계에 적용됩니다</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {relationCards.map(({ emoji, label, desc }) => (
              <button
                key={label}
                onClick={() => navigate('/app')}
                className="bg-card-bg border border-border rounded-sm p-4 text-left hover:border-accent-red/50 hover:bg-accent-red/5 transition-all group"
              >
                <div className="text-2xl mb-3">{emoji}</div>
                <div className="font-medium text-white text-sm mb-1 group-hover:text-accent-red transition-colors">{label}</div>
                <div className="text-text-secondary text-xs leading-snug">{desc}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-text-secondary text-xs uppercase tracking-widest mb-3">작동 원리</p>
            <h2 className="font-serif-kr font-bold text-3xl md:text-4xl text-white">어떻게 작동하나요</h2>
          </div>

          <div className="space-y-0">
            {[
              {
                num: '01',
                title: '내 생년월일 입력',
                desc: '사주팔자 & 일주 추출 — 갑을병정 천간, 자축인묘 지지를 계산합니다',
                icon: '📅',
              },
              {
                num: '02',
                title: '상대 생년월일 입력',
                desc: '충(沖) / 형(刑) / 극(剋) 관계를 계산합니다',
                icon: '🔍',
              },
              {
                num: '03',
                title: '충돌 분석 결과',
                desc: '왜 안맞는지 관계 유형별 언어로 해석합니다',
                icon: '⚡',
              },
            ].map(({ num, title, desc, icon }, idx) => (
              <div key={num} className="flex gap-5 relative">
                {idx < 2 && (
                  <div className="absolute left-6 top-14 bottom-0 w-px bg-border" />
                )}
                <div className="w-12 h-12 rounded-full bg-card-bg border border-border flex items-center justify-center flex-shrink-0 text-lg z-10">
                  {icon}
                </div>
                <div className="pb-8 flex-1">
                  <p className="text-text-secondary text-xs mb-1 font-sans">{num}</p>
                  <h3 className="text-white font-semibold mb-1">{title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-text-secondary text-xs uppercase tracking-widest mb-3">후기</p>
            <h2 className="font-serif-kr font-bold text-3xl md:text-4xl text-white">이런 분들이 씁니다</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map(({ quote, role }) => (
              <div key={role} className="bg-card-bg border border-border rounded-sm p-5">
                <div className="text-accent-red text-2xl mb-3 font-serif-kr">"</div>
                <p className="text-white text-sm leading-relaxed mb-4">{quote}</p>
                <p className="text-text-secondary text-xs">— {role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif-kr font-black text-3xl md:text-5xl text-white mb-4">
            지금 바로<br />
            <span className="gradient-text">분석해보세요</span>
          </h2>
          <p className="text-text-secondary mb-10 leading-relaxed">
            당신을 힘들게 한 그 사람,<br />사주에 이미 답이 있었습니다
          </p>
          <button
            onClick={() => navigate('/app')}
            className="gradient-red glow-red px-12 py-5 text-white font-bold text-lg rounded-sm hover:opacity-90 transition-all w-full sm:w-auto"
          >
            내 사주 분석하기 →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-serif-kr font-black text-lg text-text-secondary tracking-widest">TOXIC</span>
          <p className="text-text-secondary text-xs text-center">
            사주로 보는 관계의 본질 · toxic.kr
          </p>
          <p className="text-text-secondary text-xs">
            © 2025 TOXIC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
