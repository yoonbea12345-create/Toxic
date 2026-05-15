import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0A0A0A] min-h-screen overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
          <img src="/logo.svg" alt="TOXIC" className="h-10 object-contain" />
          <button
            onClick={() => navigate('/app')}
            className="text-xs text-[#8E8E93] border border-[#2C2C2E] px-4 py-2 hover:border-[#FF2D55]/50 hover:text-white transition-all"
          >
            분석 시작하기
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════
          HOOK — 지금 딱 한 명 떠오르는 사람
      ════════════════════════════════ */}
      <section className="min-h-screen flex flex-col justify-center px-5 pt-20 pb-16 max-w-2xl mx-auto">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#FF2D55] mb-8 block">
            <span className="w-1 h-1 rounded-full bg-[#FF2D55] animate-pulse inline-block" />
            사주로 보는 관계의 본질
          </span>

          <h1 className="font-serif-kr font-black text-[clamp(2.6rem,10vw,4.5rem)] leading-[1.1] text-white mb-6">
            지금 이 순간,<br />
            딱 한 명<br />
            <span className="text-[#FF2D55]">떠오르는 사람</span><br />
            있죠?
          </h1>

          <div className="w-24 h-0.5 bg-[#FF2D55] mb-6" />

          <p className="text-[#8E8E93] text-lg leading-relaxed mb-2">
            그 사람이랑 왜 이렇게 안 맞는지.
          </p>
          <p className="text-white text-lg leading-relaxed mb-10">
            사주에 <span className="text-[#FF2D55]">이미 답이 있었습니다.</span>
          </p>
        </div>

        <button
          onClick={() => navigate('/app')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#FF2D55] text-white font-bold text-lg px-10 py-5 hover:bg-[#FF2D55]/90 transition-all"
          style={{ boxShadow: '0 0 40px rgba(255,45,85,0.25)' }}
        >
          그 사람 생일 넣어보기
          <span className="text-xl">→</span>
        </button>

        <p className="text-[#8E8E93] text-xs mt-4">
          무료 · 1분 · 전 연인 · 친구 · 직장 · 가족 다 가능
        </p>

        <div className="mt-16 pt-8 border-t border-[#2C2C2E]">
          <p className="text-[#8E8E93] text-xs uppercase tracking-widest mb-4">분석 가능한 관계</p>
          <div className="flex flex-wrap gap-2">
            {['💔 전 연인', '😤 직장 상사', '👥 친구', '👨‍👩‍👧 가족', '🌀 그냥 싫은 사람'].map(r => (
              <span key={r} className="text-sm text-[#8E8E93] border border-[#2C2C2E] px-3 py-1.5">{r}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          STORY 1 — 기존 앱과 다릅니다
      ════════════════════════════════ */}
      <section className="px-5 py-20 border-t border-[#2C2C2E]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[#8E8E93] text-xs uppercase tracking-widest mb-3">왜 TOXIC인가</p>
          <h2 className="font-serif-kr font-black text-[clamp(1.8rem,7vw,3rem)] text-white leading-tight mb-2">
            잘 맞는 사람 말고
          </h2>
          <h2 className="font-serif-kr font-black text-[clamp(1.8rem,7vw,3rem)] leading-tight mb-3">
            <span className="text-[#FF2D55]">안 맞는 이유</span>를 봐요
          </h2>
          <div className="w-20 h-0.5 bg-[#FF2D55] mb-8" />
          <p className="text-[#8E8E93] leading-relaxed mb-10">
            다른 사주앱은 궁합을 찾고,<br />
            TOXIC은 이미 힘든 관계를 해석해요.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* 기존 */}
            <div className="bg-[#111] border border-[#2C2C2E] p-5">
              <div className="text-[10px] uppercase tracking-widest text-[#8E8E93] border border-[#2C2C2E] inline-block px-2 py-1 mb-4">
                기존 사주앱
              </div>
              <div className="text-4xl mb-4 opacity-30">🤍</div>
              <p className="text-[#555] text-xs mb-3 font-medium">궁합 중심</p>
              <div className="space-y-2">
                {['우리 잘 맞을까요?', '더 잘 맞는 사람은?'].map(t => (
                  <div key={t} className="bg-[#1C1C1E] text-[#555] text-xs px-3 py-2">{t}</div>
                ))}
              </div>
            </div>

            {/* TOXIC */}
            <div className="bg-[#111] border border-[#FF2D55] p-5 relative" style={{ boxShadow: '0 0 30px rgba(255,45,85,0.1)' }}>
              <div className="text-[10px] uppercase tracking-widest text-white bg-[#FF2D55] inline-block px-2 py-1 mb-4 font-bold">
                TOXIC
              </div>
              <div className="text-4xl mb-4">💔</div>
              <p className="text-white text-xs mb-3 font-medium">관계 분석</p>
              <div className="space-y-1.5">
                {['어긋나는 이유', '반복되는 패턴', '관계 회복 / 정리 인사이트'].map(t => (
                  <div key={t} className="flex items-center gap-1.5 text-xs text-white">
                    <span className="text-[#FF2D55]">✓</span> {t}
                  </div>
                ))}
              </div>
              <div className="mt-4 border border-[#FF2D55]/30 text-center py-1">
                <span className="text-[#FF2D55] text-[10px] uppercase tracking-widest font-bold">CASE FILE</span>
              </div>
            </div>
          </div>

          <p className="text-center text-[#8E8E93] text-sm mt-6">
            힘든 관계의 <span className="text-white">이유</span>와 <span className="text-[#FF2D55]">해결 포인트</span> 분석
          </p>
        </div>
      </section>

      {/* ════════════════════════════════
          STORY 2 — 시나리오: 전 연인
      ════════════════════════════════ */}
      <section className="px-5 py-20 border-t border-[#2C2C2E]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[#FF2D55] text-xs uppercase tracking-widest mb-6">연인 / 전 연인</p>

          <h2 className="font-serif-kr font-black text-[clamp(2rem,8vw,3.5rem)] text-white leading-[1.15] mb-2">
            헤어진 이유를
          </h2>
          <h2 className="font-serif-kr font-black text-[clamp(2rem,8vw,3.5rem)] leading-[1.15] mb-6">
            <span className="text-[#FF2D55]">이제야 알았다</span>
          </h2>
          <div className="w-16 h-0.5 bg-[#FF2D55] mb-8" />

          <div className="border-l-2 border-[#FF2D55]/40 pl-4 mb-8">
            <p className="text-white text-base leading-relaxed">
              좋아했는데 자꾸 다쳤다면.
            </p>
            <p className="text-white text-base leading-relaxed">
              사주에선 <span className="text-[#FF2D55] font-semibold">충(沖)</span>일 수 있어요.
            </p>
          </div>

          <div className="bg-[#1C1C1E] border border-[#2C2C2E] p-5 mb-8">
            <div className="flex items-start gap-4">
              <div className="border-2 border-[#FF2D55] text-[#FF2D55] font-serif-kr font-bold px-3 py-2 text-sm flex-shrink-0">
                충(沖)
              </div>
              <div>
                <p className="text-white text-sm font-semibold mb-1">자오충(子午沖) — 강한 에너지 충돌</p>
                <p className="text-[#8E8E93] text-xs leading-relaxed">
                  서로 끌리지만 결국 폭발하는 구조. 처음엔 운명처럼 느껴지지만 근본적인 방향성이 반대입니다.
                </p>
              </div>
            </div>
          </div>

          <p className="text-[#555] text-sm mb-6">끝났는데도 자꾸 생각나는 그 관계</p>

          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-2 text-white font-semibold text-sm group"
          >
            <span>전연인 분석하기</span>
            <span className="text-[#FF2D55] group-hover:translate-x-1 transition-transform">→</span>
            <div className="absolute mt-6 w-24 h-px bg-[#BF5AF2]" style={{ position: 'relative', marginTop: 0 }} />
          </button>
          <div className="w-28 h-px bg-[#BF5AF2] mt-1" />
        </div>
      </section>

      {/* ════════════════════════════════
          STORY 3 — 시나리오: 직장
      ════════════════════════════════ */}
      <section className="px-5 py-20 border-t border-[#2C2C2E]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[#FF2D55] text-xs uppercase tracking-widest mb-6">직장 상사 / 동료</p>

          <h2 className="font-serif-kr font-black text-[clamp(2rem,8vw,3.5rem)] text-white leading-[1.15] mb-2">
            저 팀장이랑
          </h2>
          <h2 className="font-serif-kr font-black text-[clamp(2rem,8vw,3.5rem)] leading-[1.15] mb-6">
            왜 이렇게 <span className="text-[#FF2D55]">안 맞지?</span>
          </h2>
          <div className="w-16 h-0.5 bg-[#FF2D55] mb-8" />

          <div className="border-l-2 border-[#FF2D55]/40 pl-4 mb-8">
            <p className="text-white text-base leading-relaxed">말투도 기준도 매번 어긋난다면.</p>
            <p className="text-white text-base leading-relaxed">성격보다 <span className="text-[#FF2D55] font-semibold">구조 문제</span>일 수 있어요.</p>
          </div>

          <div className="bg-[#1C1C1E] border border-[#2C2C2E] p-5 mb-8">
            <div className="flex items-start gap-4">
              <div className="border-2 border-[#BF5AF2] text-[#BF5AF2] font-serif-kr font-bold px-3 py-2 text-sm flex-shrink-0">
                형(刑)
              </div>
              <div>
                <p className="text-white text-sm font-semibold mb-1">인사신형(寅巳申刑) — 누적 충돌</p>
                <p className="text-[#8E8E93] text-xs leading-relaxed">
                  갑자기 폭발하지 않아요. 서서히, 조용히, 그러나 확실하게 쌓이는 불편함. 이유를 말하기 어려운 게 형의 특징입니다.
                </p>
              </div>
            </div>
          </div>

          <p className="text-[#555] text-sm mb-6">월요일 아침만 되면 숨 막힌다면</p>

          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-2 text-white font-semibold text-sm group"
          >
            <span>직장 관계 보기</span>
            <span className="text-[#FF2D55] group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <div className="w-24 h-px bg-[#BF5AF2] mt-1" />
        </div>
      </section>

      {/* ════════════════════════════════
          STORY 4 — 시나리오: 가족
      ════════════════════════════════ */}
      <section className="px-5 py-20 border-t border-[#2C2C2E]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[#FF2D55] text-xs uppercase tracking-widest mb-6">가족</p>

          <h2 className="font-serif-kr font-black text-[clamp(2rem,8vw,3.5rem)] text-white leading-[1.15] mb-2">
            엄마랑 나는
          </h2>
          <h2 className="font-serif-kr font-black text-[clamp(2rem,8vw,3.5rem)] leading-[1.15] mb-6">
            왜 맨날 <span className="text-[#FF2D55]">부딪힐까</span>
          </h2>
          <div className="w-16 h-0.5 bg-[#FF2D55] mb-8" />

          <div className="border-l-2 border-[#FF2D55]/40 pl-4 mb-8">
            <p className="text-white text-base leading-relaxed">사랑하는데 자꾸 상처받는 사이.</p>
            <p className="text-white text-base leading-relaxed">가족이라 <span className="text-[#FF2D55] font-semibold">더 어려운</span> 거예요.</p>
          </div>

          <div className="bg-[#1C1C1E] border border-[#2C2C2E] p-5 mb-8">
            <div className="flex items-start gap-4">
              <div className="border-2 border-[#FF2D55] text-[#FF2D55] font-serif-kr font-bold px-3 py-2 text-sm flex-shrink-0">
                극(剋)
              </div>
              <div>
                <p className="text-white text-sm font-semibold mb-1">오행 극 — 에너지 소모 구조</p>
                <p className="text-[#8E8E93] text-xs leading-relaxed">
                  한 사람의 기운이 다른 사람을 지속적으로 소모시키는 구조. 억압이 아니라 오행의 흐름입니다.
                </p>
              </div>
            </div>
          </div>

          <p className="text-[#555] text-sm mb-1">가까워서 더 세게 부딪히는 관계</p>
          <div className="flex items-center gap-2 text-[#555] text-xs mb-6">
            <span className="text-[#FF2D55]">✦</span>
            <span>왜 우리는 서로에게 상처가 될까?</span>
          </div>

          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-2 text-white font-semibold text-sm group"
          >
            <span>가족 관계 보기</span>
            <span className="text-[#FF2D55] group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <div className="w-24 h-px bg-[#BF5AF2] mt-1" />
        </div>
      </section>

      {/* ════════════════════════════════
          OFFER — 그 사람 생일 넣어봐
      ════════════════════════════════ */}
      <section className="px-5 py-20 border-t border-[#2C2C2E]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-3">
            <p className="text-[#8E8E93] text-xs uppercase tracking-widest">TOXIC SAJU ANALYSIS</p>
          </div>
          <h2 className="font-serif-kr font-black text-[clamp(2.4rem,10vw,4rem)] text-white text-center leading-tight mb-2">
            그 사람
          </h2>
          <h2 className="font-serif-kr font-black text-[clamp(2.4rem,10vw,4rem)] text-center leading-tight mb-2">
            <span className="text-[#FF2D55]">생일 넣어봐</span>
          </h2>
          <div className="flex justify-center mb-2">
            <div className="w-16 h-0.5 bg-[#FF2D55]" />
          </div>
          <p className="text-center text-[#8E8E93] text-sm mb-10">
            딱 한 명 떠오른다면 지금.<br />
            결과 캡처해서 친구 태그하기.
          </p>

          {/* Mock UI */}
          <div className="bg-[#141414] border border-[#2C2C2E] p-5 mb-6" style={{ boxShadow: '0 0 60px rgba(255,45,85,0.08)' }}>
            <div className="flex items-center gap-2 text-[#8E8E93] text-xs mb-4">
              <span>📅</span> 생년월일 입력
            </div>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {['1995년', '07월', '21일', '00:00'].map(v => (
                <div key={v} className="bg-[#1C1C1E] border border-[#2C2C2E] px-2 py-2.5 text-[#8E8E93] text-xs flex items-center justify-between">
                  <span>{v}</span>
                  <span className="text-[#555]">∨</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#2C2C2E] pt-4 mb-4">
              <p className="text-[#8E8E93] text-xs mb-2">종합 관계 분석 결과</p>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[#8E8E93] text-sm">독성 지수</span>
                <span className="text-[#FF2D55] font-black text-4xl">97</span>
                <span className="text-[#FF2D55] text-xl font-bold">%</span>
                <span className="ml-auto bg-[#FF2D55]/10 border border-[#FF2D55] text-[#FF2D55] text-xs px-3 py-1 font-bold">
                  위험도 MAX ⚠
                </span>
              </div>
              <div className="w-full h-2 bg-[#2C2C2E] rounded-full overflow-hidden mb-4">
                <div className="h-full rounded-full" style={{ width: '97%', background: 'linear-gradient(90deg, #FF2D55, #BF5AF2)' }} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['#집착주의', '#감정소모', '#헤어나다후폭풍', '#미련주의'].map(tag => (
                  <span key={tag} className="text-[10px] text-[#FF2D55] bg-[#FF2D55]/10 border border-[#FF2D55]/20 px-2 py-0.5">{tag}</span>
                ))}
              </div>
            </div>

            <div className="border-2 border-[#FF2D55] p-px">
              <button
                onClick={() => navigate('/app')}
                className="w-full bg-[#FF2D55] text-white font-bold text-base py-4 flex items-center justify-center gap-3 hover:bg-[#FF2D55]/90 transition-opacity"
              >
                바로 분석하기
                <span className="text-xl">→</span>
              </button>
            </div>
          </div>

          <p className="text-center text-[#8E8E93] text-sm">
            전 연인 · 친구 · 상사 · 가족{' '}
            <span className="border border-[#8E8E93] rounded-full px-2 py-0.5 text-xs">다 가능</span>
          </p>
          <div className="flex justify-center mt-2">
            <span className="text-[#FF2D55] text-sm">✦</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════ */}
      <section className="px-5 py-16 border-t border-[#2C2C2E]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[#8E8E93] text-xs uppercase tracking-widest mb-8 text-center">실제 반응</p>
          <div className="space-y-4">
            {[
              { q: '"전 남친이랑 왜 그렇게 싸웠는지 사주 보고 처음으로 이해됐어요"', r: '20대 여성' },
              { q: '"팀장이랑 항상 부딪히는 이유가 인사형(刑) 충돌이었다는거 소름..."', r: '직장인' },
              { q: '"엄마랑 나 오행이 정반대라고 나와서 오히려 마음이 편해졌어요"', r: '30대 여성' },
            ].map(({ q, r }) => (
              <div key={r} className="bg-[#111] border border-[#2C2C2E] p-5">
                <p className="text-[#FF2D55] text-lg font-serif-kr mb-2">"</p>
                <p className="text-white text-sm leading-relaxed mb-3">{q.slice(1, -1)}</p>
                <p className="text-[#555] text-xs">— {r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          FINAL CTA
      ════════════════════════════════ */}
      <section className="px-5 py-20 border-t border-[#2C2C2E]" style={{ background: 'linear-gradient(180deg, #0A0A0A 0%, #150008 100%)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif-kr font-black text-[clamp(2rem,8vw,3.5rem)] text-white leading-tight mb-2">
            지금 바로
          </h2>
          <h2 className="font-serif-kr font-black text-[clamp(2rem,8vw,3.5rem)] text-[#FF2D55] leading-tight mb-6">
            분석해보세요
          </h2>
          <p className="text-[#8E8E93] mb-10 leading-relaxed">
            당신을 힘들게 한 그 사람,<br />
            사주에 이미 답이 있었습니다.
          </p>
          <button
            onClick={() => navigate('/app')}
            className="w-full bg-[#FF2D55] text-white font-bold text-lg py-5 hover:bg-[#FF2D55]/90 transition-opacity"
            style={{ boxShadow: '0 0 60px rgba(255,45,85,0.3)' }}
          >
            내 사주 분석하기 →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#2C2C2E] py-8 px-5">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-4">
          <img src="/logo.svg" alt="TOXIC" className="h-8 object-contain opacity-40" />
          <p className="text-[#555] text-xs text-center">
            사주로 보는 관계의 본질 · toxic.kr
          </p>
          <p className="text-[#333] text-xs">© 2025 TOXIC. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
