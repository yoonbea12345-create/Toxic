import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = window.scrollY;
      el.style.opacity = String(Math.max(0, 1 - y / 400));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="bg-[#0A0A0A] min-h-screen overflow-x-hidden relative">
      <div className="grain-overlay" aria-hidden />

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
          HERO
      ══════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center px-5 pt-28 pb-20 max-w-xl mx-auto">
        {/* 강한 글로우 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,45,85,0.13) 0%, transparent 65%)' }} />

        <div className="relative z-10">
          {/* 상단 레이블 */}
          <div className="flex items-center gap-2.5 mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D55] animate-pulse" />
            <span className="text-[#FF2D55] text-[10px] uppercase tracking-[0.3em] font-sans-kr">
              사주로 보는 관계의 본질
            </span>
          </div>

          {/* 메인 헤딩 */}
          <h1 className="font-display leading-[1.02] text-white mb-10"
            style={{ fontSize: 'clamp(3.2rem, 14vw, 6rem)' }}>
            지금 이 순간,<br />
            딱 한 명<br />
            <span className="text-[#FF2D55]">떠오르는</span><br />
            사람 있죠?
          </h1>

          {/* 서브 텍스트 */}
          <p className="font-sans-kr text-[#999] text-base leading-relaxed mb-2">
            그 사람이랑 왜 이렇게 안 맞는지.
          </p>
          <p className="font-sans-kr text-white text-base leading-relaxed mb-12">
            사주에 <span className="text-[#FF2D55] font-bold">이미 답이 있었습니다.</span>
          </p>

          {/* CTA */}
          <button
            onClick={() => navigate('/app')}
            className="w-full bg-[#FF2D55] text-white font-display text-xl py-5 tracking-wide hover:opacity-90 transition-opacity mb-4"
            style={{ boxShadow: '0 0 60px rgba(255,45,85,0.35)' }}
          >
            그 사람 생일 넣어보기 →
          </button>
          <p className="font-sans-kr text-[#555] text-xs text-center">
            무료 · 1분 · 전 연인 · 친구 · 직장 · 가족 다 가능
          </p>
        </div>

        {/* 스크롤 힌트 */}
        <div
          ref={heroRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[#444] text-[10px] uppercase tracking-[0.3em] font-sans-kr">scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-[#FF2D55]/60 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ══════════════════════════════════════
          PROBLEM — 잘 맞는 사람 vs 안 맞는 이유
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-24 border-t border-white/[0.06]">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(191,90,242,0.08) 0%, transparent 55%)' }} />
        <div className="max-w-xl mx-auto relative z-10">
          <p className="text-[#555] text-[10px] uppercase tracking-[0.3em] font-sans-kr mb-8">
            기존 사주앱과 다른 점
          </p>

          <h2 className="font-display leading-[1.08] text-white mb-2"
            style={{ fontSize: 'clamp(2.4rem, 10vw, 4rem)' }}>
            잘 맞는 사람 말고
          </h2>
          <h2 className="font-display leading-[1.08] mb-10"
            style={{ fontSize: 'clamp(2.4rem, 10vw, 4rem)' }}>
            <span className="text-[#FF2D55]">안 맞는 이유</span>를 봐요
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {/* 기존 앱 */}
            <div className="border border-[#1e1e1e] p-5 bg-[#0D0D0D]">
              <p className="text-[10px] uppercase tracking-widest text-[#444] font-sans-kr mb-6">기존 사주앱</p>
              <div className="space-y-3 mb-6">
                {['우리 잘 맞을까?', '더 잘 맞는 상대는?', '이상형 찾기'].map(t => (
                  <p key={t} className="font-sans-kr text-[#333] text-xs line-through">{t}</p>
                ))}
              </div>
              <p className="font-sans-kr text-[#444] text-[11px] leading-relaxed">
                미래의 좋은 관계를<br />찾아드립니다
              </p>
            </div>

            {/* TOXIC */}
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

          <p className="font-sans-kr text-center text-[#555] text-xs">
            힘든 관계의 <span className="text-[#888]">이유</span>와 <span className="text-[#FF2D55]">구조적 원인</span> 분석
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STORY 1 — 연인 (레이아웃 A: 텍스트 중심)
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
            <p className="font-sans-kr text-[#999] text-sm leading-relaxed mb-1">
              좋아했는데 자꾸 다쳤다면
            </p>
            <p className="font-sans-kr text-white text-sm leading-relaxed">
              사주에선 <span className="text-[#FF2D55] font-bold">충(沖)</span>일 수 있어요.
              서로 끌리지만 방향이 정반대인 구조.
            </p>
          </div>

          {/* 충 설명 카드 */}
          <div className="border border-[#1e1e1e] p-6 mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 font-display text-[120px] leading-none text-[#FF2D55]/[0.04] pointer-events-none select-none">
              沖
            </div>
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
          STORY 2 — 직장 (레이아웃 B: 숫자 강조)
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

          {/* 수치 강조 블록 */}
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
            <p className="font-sans-kr text-[#999] text-sm leading-relaxed mb-1">
              말투도 기준도 매번 어긋난다면
            </p>
            <p className="font-sans-kr text-white text-sm leading-relaxed">
              성격 차이가 아니라 <span className="text-[#BF5AF2] font-bold">구조 문제</span>일 수 있어요.
            </p>
          </div>

          <div className="border border-[#1e1e1e] p-6 mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 font-display text-[120px] leading-none text-[#BF5AF2]/[0.04] pointer-events-none select-none">
              刑
            </div>
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
          STORY 3 — 가족 (레이아웃 C: 풀 인용 스타일)
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-24 border-t border-white/[0.06]">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 70%, rgba(255,45,85,0.07) 0%, transparent 50%)' }} />
        <div className="max-w-xl mx-auto relative z-10">

          <div className="flex items-center gap-3 mb-10">
            <div className="w-6 h-px bg-[#FF2D55]" />
            <p className="text-[#FF2D55] text-[10px] uppercase tracking-[0.25em] font-sans-kr">가족</p>
          </div>

          <h2 className="font-display leading-[1.08] text-white mb-2"
            style={{ fontSize: 'clamp(2.8rem, 11vw, 4.5rem)' }}>
            엄마랑 나는
          </h2>
          <h2 className="font-display leading-[1.08] mb-12"
            style={{ fontSize: 'clamp(2.8rem, 11vw, 4.5rem)' }}>
            왜 맨날 <span className="text-[#FF2D55]">부딪힐까</span>
          </h2>

          {/* 풀 인용 블록 */}
          <div className="relative mb-10">
            <div className="font-display text-[6rem] text-[#FF2D55]/10 leading-none absolute -top-6 -left-2 select-none pointer-events-none">"</div>
            <div className="pl-8 pt-4">
              <p className="font-sans-kr text-white text-base leading-relaxed mb-2">
                사랑하는데 자꾸 상처받는 사이.
              </p>
              <p className="font-sans-kr text-[#888] text-base leading-relaxed">
                가족이라 <span className="text-white">더 어려운</span> 거예요.
                억압이 아니라 <span className="text-[#FF2D55] font-bold">오행의 흐름</span>입니다.
              </p>
            </div>
          </div>

          <div className="border border-[#1e1e1e] p-6 mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 font-display text-[120px] leading-none text-[#FF2D55]/[0.04] pointer-events-none select-none">
              剋
            </div>
            <div className="flex items-start gap-5 relative">
              <div className="border border-[#FF2D55] text-[#FF2D55] font-display text-lg px-3 py-2 flex-shrink-0 w-16 text-center">
                극<br /><span className="text-[10px] opacity-60">剋</span>
              </div>
              <div>
                <p className="font-sans-kr text-white text-sm font-bold mb-2">오행 극 — 에너지 소모 구조</p>
                <p className="font-sans-kr text-[#666] text-xs leading-relaxed">
                  한 사람의 기운이 다른 사람을 지속 소모.<br />
                  이건 성격이 아니라 구조입니다.
                </p>
              </div>
            </div>
          </div>

          <button onClick={() => navigate('/app')}
            className="w-full border border-[#FF2D55]/40 text-white font-sans-kr text-sm py-4 hover:bg-[#FF2D55]/10 transition-colors tracking-wide">
            가족 관계 분석하기 →
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SOCIAL PROOF — 숫자 + 후기
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-24 border-t border-white/[0.06]">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,45,85,0.06) 0%, transparent 50%)' }} />
        <div className="max-w-xl mx-auto relative z-10">

          <p className="text-[#555] text-[10px] uppercase tracking-[0.3em] font-sans-kr text-center mb-12">
            실제 반응
          </p>

          {/* 숫자 stats */}
          <div className="grid grid-cols-3 gap-px bg-[#1a1a1a] border border-[#1a1a1a] mb-12">
            {[
              { num: '4.9', unit: '/ 5', label: '평균 만족도' },
              { num: '1분', unit: '', label: '분석 소요 시간' },
              { num: '100%', unit: '', label: '무료' },
            ].map(({ num, unit, label }) => (
              <div key={label} className="bg-[#0A0A0A] py-7 text-center">
                <div className="flex items-end justify-center gap-1 mb-1">
                  <span className="font-display text-white text-3xl leading-none">{num}</span>
                  {unit && <span className="font-display text-[#555] text-sm mb-0.5">{unit}</span>}
                </div>
                <p className="font-sans-kr text-[#555] text-[10px]">{label}</p>
              </div>
            ))}
          </div>

          {/* 후기 */}
          <div className="space-y-3">
            {[
              { q: '전 남친이랑 왜 그렇게 싸웠는지 사주 보고 처음으로 이해됐어요', r: '20대 여성', tag: '연인' },
              { q: '팀장이랑 항상 부딪히는 이유가 인사형(刑) 충돌이었다는거 소름...', r: '직장인', tag: '직장' },
              { q: '엄마랑 나 오행이 정반대라고 나와서 오히려 마음이 편해졌어요', r: '30대 여성', tag: '가족' },
            ].map(({ q, r, tag }) => (
              <div key={r} className="border border-[#1a1a1a] p-6 relative">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] text-[#FF2D55] border border-[#FF2D55]/30 px-2 py-0.5 font-sans-kr">{tag}</span>
                  <div className="flex gap-0.5 ml-auto">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-[#FF2D55] text-[10px]">★</span>
                    ))}
                  </div>
                </div>
                <p className="font-sans-kr text-white text-sm leading-relaxed mb-3">"{q}"</p>
                <p className="font-sans-kr text-[#444] text-xs">— {r}</p>
              </div>
            ))}
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

          {/* Mock UI 카드 */}
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
                <span className="font-display text-[#FF2D55] text-6xl leading-none">97</span>
                <div className="mb-2">
                  <span className="font-display text-[#FF2D55] text-2xl">%</span>
                  <p className="font-sans-kr text-[#555] text-[10px]">독성 지수</p>
                </div>
                <div className="ml-auto bg-[#FF2D55]/10 border border-[#FF2D55]/40 text-[#FF2D55] text-[10px] px-3 py-1.5 font-bold font-sans-kr self-end mb-1">
                  위험도 MAX
                </div>
              </div>
              <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden mb-5">
                <div className="h-full rounded-full"
                  style={{ width: '97%', background: 'linear-gradient(90deg, #FF2D55 0%, #BF5AF2 100%)' }} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['#인신충', '#에너지소모', '#충돌구조', '#독성MAX'].map(tag => (
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
              바로 분석하기 →
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

          <p className="text-[#555] text-[10px] uppercase tracking-[0.3em] font-sans-kr mb-8">
            지금 바로
          </p>

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
            내 사주 분석하기 →
          </button>
          <p className="font-sans-kr text-[#444] text-xs">무료 · 1분 · 지금 바로</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] py-12 px-5">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-4">
          <img src="/logo.svg" alt="TOXIC" className="h-10 object-contain opacity-60" />
          <p className="font-sans-kr text-[#444] text-xs">사주로 보는 관계의 본질</p>
          <div className="w-px h-4 bg-[#222]" />
          <p className="font-sans-kr text-[#333] text-xs">© 2025 TOXIC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
