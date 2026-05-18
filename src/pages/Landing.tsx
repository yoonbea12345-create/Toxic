import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0D0D0D] min-h-screen overflow-x-hidden relative">

      {/* 그레인 텍스처 */}
      <div className="grain-overlay" aria-hidden />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/85 backdrop-blur-md border-b border-white/5">
        <div className="max-w-xl mx-auto px-5 py-3 flex items-center justify-between">
          <img src="/logo.svg" alt="TOXIC" className="h-16 object-contain" />
          <button
            onClick={() => navigate('/app')}
            className="text-xs text-[#888] border border-[#333] px-4 py-2 hover:border-[#FF2D55]/60 hover:text-white transition-all font-sans-kr tracking-wide"
          >
            분석 시작
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HOOK — 지금 딱 한 명 떠오르는 사람
      ══════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center px-5 pt-24 pb-16 max-w-xl mx-auto overflow-hidden">
        {/* 배경 글로우 */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,45,85,0.07) 0%, transparent 70%)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D55] animate-pulse" />
            <span className="text-[#FF2D55] text-[10px] uppercase tracking-[0.25em] font-sans-kr">
              사주로 보는 관계의 본질
            </span>
          </div>

          <h1 className="font-display text-[clamp(3rem,13vw,5.5rem)] leading-[1.05] text-white mb-2">
            지금 이 순간,
          </h1>
          <h1 className="font-display text-[clamp(3rem,13vw,5.5rem)] leading-[1.05] text-white mb-2">
            딱 한 명
          </h1>
          <h1 className="font-display text-[clamp(3rem,13vw,5.5rem)] leading-[1.05] mb-8">
            <span className="text-[#FF2D55]">떠오르는 사람</span>
            <br />
            <span className="text-white">있죠?</span>
          </h1>

          {/* 레드 브러시 라인 */}
          <div className="w-32 h-[3px] mb-8"
            style={{ background: '#FF2D55', transform: 'skewX(-8deg)', borderRadius: '2px' }} />

          <p className="font-sans-kr text-[#aaa] text-lg leading-relaxed mb-2">
            그 사람이랑 왜 이렇게 안 맞는지.
          </p>
          <p className="font-sans-kr text-white text-lg leading-relaxed mb-12">
            사주에 <span className="text-[#FF2D55] font-bold">이미 답이 있었습니다.</span>
          </p>

          <button
            onClick={() => navigate('/app')}
            className="w-full bg-[#FF2D55] text-white font-display text-2xl py-5 tracking-wide hover:opacity-90 transition-opacity"
            style={{ boxShadow: '0 0 50px rgba(255,45,85,0.3)' }}
          >
            그 사람 생일 넣어보기 →
          </button>

          <p className="font-sans-kr text-[#555] text-xs mt-4 text-center">
            무료 · 1분 · 전 연인 · 친구 · 직장 · 가족 다 가능
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STORY 1 — 기존 앱 vs TOXIC
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-20 border-t border-[#1e1e1e]">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(191,90,242,0.04) 0%, transparent 60%)' }} />
        <div className="max-w-xl mx-auto relative z-10">

          <h2 className="font-display text-[clamp(2.6rem,10vw,4.2rem)] leading-[1.1] text-white mb-1">
            잘 맞는 사람 말고
          </h2>
          <h2 className="font-display text-[clamp(2.6rem,10vw,4.2rem)] leading-[1.1] mb-2">
            <span className="text-[#FF2D55]">안 맞는 이유</span>를 봐요
          </h2>
          <div className="w-28 h-[3px] mb-8"
            style={{ background: 'linear-gradient(90deg, #FF2D55, transparent)', borderRadius: '2px' }} />

          <p className="font-sans-kr text-[#888] leading-relaxed mb-10">
            다른 사주앱은 궁합을 찾고,<br />
            <span className="text-white font-bold">TOXIC은 이미 힘든 관계를 해석해요.</span>
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* 기존 앱 */}
            <div className="bg-[#111] border border-[#222] p-4">
              <div className="text-[10px] uppercase tracking-widest text-[#555] border border-[#2a2a2a] inline-block px-2 py-1 mb-5 font-sans-kr">
                기존 사주앱
              </div>
              <div className="text-5xl mb-3 grayscale opacity-20">🤍</div>
              <p className="font-sans-kr text-[#444] text-xs font-bold mb-4">궁합 중심</p>
              <div className="space-y-2">
                {['우리 잘 맞을까요?', '더 잘 맞는 사람은?'].map(t => (
                  <div key={t} className="bg-[#1a1a1a] text-[#444] text-xs px-3 py-2.5 font-sans-kr">{t}</div>
                ))}
              </div>
            </div>

            {/* TOXIC */}
            <div className="bg-[#120008] border border-[#FF2D55] p-4 relative overflow-hidden"
              style={{ boxShadow: '0 0 30px rgba(255,45,85,0.12) inset' }}>
              <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle at top right, rgba(255,45,85,0.2), transparent)' }} />
              <div className="bg-[#FF2D55] text-white text-[10px] font-bold px-2 py-1 inline-block mb-5 font-sans-kr tracking-widest">
                TOXIC
              </div>
              <div className="text-5xl mb-3">💔</div>
              <p className="font-sans-kr text-white text-xs font-bold mb-4">관계 분석</p>
              <div className="space-y-2">
                {['어긋나는 이유', '반복되는 패턴', '회복 / 정리 인사이트'].map(t => (
                  <div key={t} className="flex items-center gap-2 text-xs text-white font-sans-kr">
                    <span className="text-[#FF2D55] font-bold">✓</span> {t}
                  </div>
                ))}
              </div>
              <div className="mt-4 border border-[#FF2D55]/30 py-1 text-center">
                <span className="text-[#FF2D55] text-[9px] uppercase tracking-widest font-bold">CASE FILE</span>
              </div>
            </div>
          </div>

          <p className="font-sans-kr text-center text-[#666] text-sm mt-5">
            힘든 관계의 <span className="text-white">이유</span>와 <span className="text-[#FF2D55]">해결 포인트</span> 분석
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STORY 2 — 전 연인
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-20 border-t border-[#1e1e1e]">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 20% 60%, rgba(255,45,85,0.05) 0%, transparent 55%)' }} />
        <div className="max-w-xl mx-auto relative z-10">

          <span className="text-[#FF2D55] text-[10px] uppercase tracking-[0.2em] font-sans-kr mb-6 block">
            💔 연인 / 전 연인
          </span>

          <h2 className="font-display text-[clamp(2.8rem,11vw,4.5rem)] leading-[1.1] text-white mb-1">
            헤어진 이유를
          </h2>
          <h2 className="font-display text-[clamp(2.8rem,11vw,4.5rem)] leading-[1.1] text-[#FF2D55] mb-2">
            이제야 알았다
          </h2>
          {/* 브러시 언더라인 효과 */}
          <div className="w-48 h-[3px] mb-8"
            style={{ background: '#FF2D55', transform: 'skewX(-6deg) scaleY(0.8)', borderRadius: '1px' }} />

          <div className="border-l-[3px] border-[#FF2D55]/50 pl-5 mb-8">
            <p className="font-sans-kr text-white text-base leading-relaxed">좋아했는데 자꾸 다쳤다면.</p>
            <p className="font-sans-kr text-white text-base leading-relaxed mt-1">
              사주에선 <span className="text-[#FF2D55] font-bold">충(沖)</span>일 수 있어요.
            </p>
          </div>

          {/* 충 배지 카드 */}
          <div className="bg-[#111] border border-[#222] p-5 mb-8">
            <div className="flex items-start gap-4">
              <div className="border-2 border-[#FF2D55] text-[#FF2D55] font-display text-xl px-3 py-2 flex-shrink-0">
                충(沖)
              </div>
              <div>
                <p className="font-sans-kr text-white text-sm font-bold mb-1">자오충(子午沖) — 강한 에너지 충돌</p>
                <p className="font-sans-kr text-[#888] text-xs leading-relaxed">
                  서로 끌리지만 결국 폭발하는 구조. 처음엔 운명처럼 느껴지지만 근본적인 방향성이 반대입니다.
                </p>
              </div>
            </div>
          </div>

          <p className="font-sans-kr text-[#555] text-sm mb-5">끝났는데도 자꾸 생각나는 그 관계</p>

          <button onClick={() => navigate('/app')}
            className="flex items-center gap-2 font-sans-kr text-white text-sm font-bold group">
            <span>전연인 분석하기</span>
            <span className="text-[#FF2D55] group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <div className="w-28 h-[2px] mt-1.5"
            style={{ background: 'linear-gradient(90deg, #BF5AF2, transparent)' }} />
        </div>
      </section>

      {/* ══════════════════════════════════════
          STORY 3 — 직장
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-20 border-t border-[#1e1e1e]">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 90% 40%, rgba(255,45,85,0.04) 0%, transparent 55%)' }} />
        <div className="max-w-xl mx-auto relative z-10">

          <span className="text-[#FF2D55] text-[10px] uppercase tracking-[0.2em] font-sans-kr mb-6 block">
            😤 직장 상사 / 동료
          </span>

          <h2 className="font-display text-[clamp(2.8rem,11vw,4.5rem)] leading-[1.1] text-white mb-1">
            저 팀장이랑
          </h2>
          <h2 className="font-display text-[clamp(2.8rem,11vw,4.5rem)] leading-[1.1] mb-2">
            왜 이렇게 <span className="text-[#FF2D55]">안 맞지?</span>
          </h2>
          <div className="w-40 h-[3px] mb-8"
            style={{ background: '#FF2D55', transform: 'skewX(-6deg)', borderRadius: '1px' }} />

          <div className="border-l-[3px] border-[#FF2D55]/50 pl-5 mb-8">
            <p className="font-sans-kr text-white text-base leading-relaxed">말투도 기준도 매번 어긋난다면.</p>
            <p className="font-sans-kr text-white text-base leading-relaxed mt-1">
              성격보다 <span className="text-[#FF2D55] font-bold">구조 문제</span>일 수 있어요.
            </p>
          </div>

          <div className="bg-[#111] border border-[#222] p-5 mb-8">
            <div className="flex items-start gap-4">
              <div className="border-2 border-[#BF5AF2] text-[#BF5AF2] font-display text-xl px-3 py-2 flex-shrink-0">
                형(刑)
              </div>
              <div>
                <p className="font-sans-kr text-white text-sm font-bold mb-1">인사신형(寅巳申刑) — 누적 충돌</p>
                <p className="font-sans-kr text-[#888] text-xs leading-relaxed">
                  갑자기 폭발하지 않아요. 서서히, 조용히, 확실하게 쌓이는 불편함.
                </p>
              </div>
            </div>
          </div>

          <p className="font-sans-kr text-[#555] text-sm mb-5">월요일 아침만 되면 숨 막힌다면</p>

          <button onClick={() => navigate('/app')}
            className="flex items-center gap-2 font-sans-kr text-white text-sm font-bold group">
            <span>직장 관계 보기</span>
            <span className="text-[#FF2D55] group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <div className="w-24 h-[2px] mt-1.5"
            style={{ background: 'linear-gradient(90deg, #BF5AF2, transparent)' }} />
        </div>
      </section>

      {/* ══════════════════════════════════════
          STORY 4 — 가족
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-20 border-t border-[#1e1e1e]">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 70%, rgba(191,90,242,0.05) 0%, transparent 55%)' }} />
        <div className="max-w-xl mx-auto relative z-10">

          <span className="text-[#FF2D55] text-[10px] uppercase tracking-[0.2em] font-sans-kr mb-6 block">
            👨‍👩‍👧 가족
          </span>

          <h2 className="font-display text-[clamp(2.8rem,11vw,4.5rem)] leading-[1.1] text-white mb-1">
            엄마랑 나는
          </h2>
          <h2 className="font-display text-[clamp(2.8rem,11vw,4.5rem)] leading-[1.1] mb-2">
            왜 맨날 <span className="text-[#FF2D55]">부딪힐까</span>
          </h2>
          <div className="w-44 h-[3px] mb-8"
            style={{ background: '#FF2D55', transform: 'skewX(-6deg)', borderRadius: '1px' }} />

          <div className="border-l-[3px] border-[#FF2D55]/50 pl-5 mb-8">
            <p className="font-sans-kr text-white text-base leading-relaxed">사랑하는데 자꾸 상처받는 사이.</p>
            <p className="font-sans-kr text-white text-base leading-relaxed mt-1">
              가족이라 <span className="text-[#FF2D55] font-bold">더 어려운</span> 거예요.
            </p>
          </div>

          <div className="bg-[#111] border border-[#222] p-5 mb-4">
            <div className="flex items-start gap-4">
              <div className="border-2 border-[#FF2D55] text-[#FF2D55] font-display text-xl px-3 py-2 flex-shrink-0">
                극(剋)
              </div>
              <div>
                <p className="font-sans-kr text-white text-sm font-bold mb-1">오행 극 — 에너지 소모 구조</p>
                <p className="font-sans-kr text-[#888] text-xs leading-relaxed">
                  한 사람의 기운이 다른 사람을 지속 소모. 억압이 아니라 오행의 흐름입니다.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#555] text-xs font-sans-kr mb-6">
            <span className="text-[#FF2D55]">✦</span>
            <span>가까워서 더 세게 부딪히는 관계</span>
          </div>

          <button onClick={() => navigate('/app')}
            className="flex items-center gap-2 font-sans-kr text-white text-sm font-bold group">
            <span>가족 관계 보기</span>
            <span className="text-[#FF2D55] group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <div className="w-24 h-[2px] mt-1.5"
            style={{ background: 'linear-gradient(90deg, #BF5AF2, transparent)' }} />
        </div>
      </section>

      {/* ══════════════════════════════════════
          OFFER — 그 사람 생일 넣어봐
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-20 border-t border-[#1e1e1e]">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,45,85,0.06) 0%, transparent 60%)' }} />
        <div className="max-w-xl mx-auto relative z-10">

          <p className="font-sans-kr text-[#888] text-[10px] uppercase tracking-[0.2em] text-center mb-2">
            TOXIC SAJU ANALYSIS
          </p>
          <h2 className="font-display text-[clamp(3rem,12vw,5rem)] leading-[1.05] text-white text-center mb-1">
            그 사람
          </h2>
          <h2 className="font-display text-[clamp(3rem,12vw,5rem)] leading-[1.05] text-[#FF2D55] text-center mb-4">
            생일 넣어봐
          </h2>
          <div className="flex justify-center mb-2">
            <div className="w-32 h-[3px]"
              style={{ background: '#FF2D55', transform: 'skewX(-6deg)', borderRadius: '1px' }} />
          </div>
          <p className="font-sans-kr text-center text-[#888] text-sm mb-10">
            딱 한 명 떠오른다면 지금.<br />
            <span style={{ textDecoration: 'underline', textDecorationColor: '#BF5AF2', textUnderlineOffset: '4px' }}>
              결과 캡처해서 친구 태그하기.
            </span>
          </p>

          {/* Mock UI 카드 */}
          <div className="bg-[#111] border border-[#2a2a2a] p-5 mb-6"
            style={{ boxShadow: '0 0 60px rgba(255,45,85,0.07)' }}>
            <div className="flex items-center gap-2 text-[#888] text-xs font-sans-kr mb-4">
              <span>📅</span>
              <span>생년월일 입력</span>
              <span className="ml-auto text-[#555] text-[10px] italic">Who's Next? ↗</span>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {['1995년', '07월', '21일', '00:00'].map(v => (
                <div key={v} className="bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-2.5 text-[#888] text-xs flex items-center justify-between font-sans-kr">
                  <span>{v}</span><span className="text-[#444]">∨</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#222] pt-4 mb-5">
              <p className="font-sans-kr text-[#888] text-xs mb-3">종합 궁합 분석 결과</p>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-sans-kr text-[#888] text-sm">독성 지수</span>
                <span className="font-display text-[#FF2D55] text-5xl leading-none ml-1">97</span>
                <span className="font-display text-[#FF2D55] text-2xl">%</span>
                <div className="ml-auto bg-[#FF2D55]/10 border border-[#FF2D55] text-[#FF2D55] text-[10px] px-2.5 py-1 font-bold font-sans-kr">
                  위험도 MAX ⚠
                </div>
              </div>
              <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden mb-4">
                <div className="h-full rounded-full"
                  style={{ width: '97%', background: 'linear-gradient(90deg, #FF2D55 0%, #BF5AF2 100%)' }} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['#집착주의', '#감정소모', '#헤어나다후폭풍', '#미련주의'].map(tag => (
                  <span key={tag} className="text-[10px] text-[#FF2D55] bg-[#FF2D55]/8 border border-[#FF2D55]/20 px-2 py-0.5 font-sans-kr">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-2 border-[#FF2D55] p-[2px]">
              <button
                onClick={() => navigate('/app')}
                className="w-full bg-[#FF2D55] text-white font-display text-2xl py-4 flex items-center justify-center gap-3 hover:opacity-90 transition-opacity tracking-wide"
              >
                바로 분석하기 →
              </button>
            </div>
          </div>

          <p className="font-sans-kr text-center text-[#666] text-sm">
            전 연인 · 친구 · 상사 · 가족{' '}
            <span className="border border-[#444] rounded-full px-2.5 py-0.5 text-xs">다 가능</span>
          </p>
          <div className="flex justify-center mt-3">
            <span className="text-[#FF2D55]">✦</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <section className="px-5 py-16 border-t border-[#1e1e1e]">
        <div className="max-w-xl mx-auto">
          <p className="font-sans-kr text-[#555] text-[10px] uppercase tracking-[0.2em] mb-8 text-center">실제 반응</p>
          <div className="space-y-3">
            {[
              { q: '전 남친이랑 왜 그렇게 싸웠는지 사주 보고 처음으로 이해됐어요', r: '20대 여성' },
              { q: '팀장이랑 항상 부딪히는 이유가 인사형(刑) 충돌이었다는거 소름...', r: '직장인' },
              { q: '엄마랑 나 오행이 정반대라고 나와서 오히려 마음이 편해졌어요', r: '30대 여성' },
            ].map(({ q, r }) => (
              <div key={r} className="bg-[#111] border border-[#1e1e1e] p-5">
                <p className="font-sans-kr text-white text-sm leading-relaxed mb-3">"{q}"</p>
                <p className="font-sans-kr text-[#555] text-xs">— {r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-24 border-t border-[#1e1e1e] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,45,85,0.1) 0%, transparent 60%)' }} />
        <div className="max-w-xl mx-auto text-center relative z-10">
          <h2 className="font-display text-[clamp(2.8rem,11vw,4.5rem)] leading-[1.1] text-white mb-1">
            지금 바로
          </h2>
          <h2 className="font-display text-[clamp(2.8rem,11vw,4.5rem)] leading-[1.1] text-[#FF2D55] mb-8">
            분석해보세요
          </h2>
          <p className="font-sans-kr text-[#888] leading-relaxed mb-10">
            당신을 힘들게 한 그 사람,<br />
            사주에 이미 답이 있었습니다.
          </p>
          <button
            onClick={() => navigate('/app')}
            className="w-full bg-[#FF2D55] text-white font-display text-2xl py-6 hover:opacity-90 transition-opacity tracking-wide"
            style={{ boxShadow: '0 0 80px rgba(255,45,85,0.35)' }}
          >
            내 사주 분석하기 →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1e1e1e] py-10 px-5">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-3">
          <img src="/logo.svg" alt="TOXIC" className="h-8 object-contain opacity-30" />
          <p className="font-sans-kr text-[#444] text-xs">사주로 보는 관계의 본질 · toxic.kr</p>
          <p className="font-sans-kr text-[#333] text-xs">© 2025 TOXIC. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
