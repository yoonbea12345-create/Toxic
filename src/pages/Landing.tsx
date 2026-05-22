import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { startSession } from '../utils/analytics';

const TRIGGERS = [
  { type: '연인', text: '좋아했는데 자꾸 상처만 받는다면', color: '#FF2D55' },
  { type: '직장', text: '저 팀장이 왜 나만 싫어하는지 모르겠다면', color: '#BF5AF2' },
  { type: '가족', text: '부모님이랑 항상 부딪히는 이유를 모르겠다면', color: '#FF9500' },
  { type: '연인', text: '헤어졌는데 자꾸 그 사람이 생각난다면', color: '#FF2D55' },
  { type: '직장', text: '회의 때마다 같은 사람이랑 또 충돌했다면', color: '#BF5AF2' },
  { type: '가족', text: '가족인데 왜 이렇게 불편한지 이해 안 된다면', color: '#FF9500' },
  { type: '연인', text: '맨날 같은 이유로 싸운다면', color: '#FF2D55' },
  { type: '직장', text: '퇴사하고 싶은데 그 사람 때문인지 내 탓인지 모르겠다면', color: '#BF5AF2' },
  { type: '가족', text: '사랑하는데 왜 이렇게 아픈지 모르겠다면', color: '#FF9500' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [triggerIdx, setTriggerIdx] = useState(0);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => { startSession(); }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('fade-visible'); obs.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.fade-section').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTriggerIdx(i => (i + 1) % TRIGGERS.length), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch('/api/count')
      .then(r => r.json())
      .then(d => { if (d.count > 0) setUserCount(d.count); })
      .catch(() => setUserCount(1247));
  }, []);

  const goToApp = () => {
    try { sessionStorage.removeItem('toxic_session'); } catch {}
    navigate('/app');
  };

  const trigger = TRIGGERS[triggerIdx];

  return (
    <div className="bg-[#0A0A0A] min-h-screen overflow-x-hidden relative">
      <div className="grain-overlay" aria-hidden />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-xl mx-auto px-5 h-14 flex items-center justify-between">
          <img src="/hero-title.svg" alt="TOXIC" className="h-8 w-auto" style={{ objectFit: 'contain', objectPosition: 'left center' }} />
          <button onClick={goToApp}
            className="text-[11px] text-white bg-[#FF2D55] px-5 py-2.5 rounded-full hover:opacity-90 active:scale-95 transition-all font-sans-kr tracking-wider font-bold">
            분석 시작 →
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          01. HERO
      ══════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center px-5 pt-28 pb-20 max-w-xl mx-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,45,85,0.13) 0%, transparent 65%)' }} />

        <div className="relative z-10">
          <h1 className="font-display leading-[1.02] text-white mb-6"
            style={{ fontSize: 'clamp(3.2rem, 14vw, 6rem)' }}>
            그 사람이랑<br />
            왜 이렇게<br />
            <span className="text-[#FF2D55]">안 맞는 걸까</span>
          </h1>

          {/* 감정 트리거 rotator */}
          <div className="mb-3 min-h-[2.2rem]">
            <div key={triggerIdx} className="flex items-center gap-2 animate-fade-in">
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 font-sans-kr tracking-wide"
                style={{
                  color: trigger.color,
                  border: `1px solid ${trigger.color}50`,
                  background: `${trigger.color}12`,
                }}
              >
                {trigger.type}
              </span>
              <p className="font-sans-kr text-[#777] text-sm leading-relaxed">
                {trigger.text}
              </p>
            </div>
          </div>

          <p className="font-sans-kr text-white text-base leading-relaxed mb-8">
            사주에 <span className="text-[#FF2D55] font-bold">이미 답이 있습니다.</span>
          </p>

          <div className="flex items-center gap-3 mb-8">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <span key={i} className={`text-xs ${i <= 4 ? 'text-[#FF2D55]' : 'text-[#333]'}`}>★</span>)}
            </div>
            <p className="font-sans-kr text-[#555] text-[11px]">4.4점 · 54개 리뷰</p>
          </div>

          <button onClick={goToApp}
            className="w-full bg-[#FF2D55] text-white font-display text-xl py-5 tracking-wide hover:opacity-90 active:scale-95 transition-all mb-4 cta-glow-red">
            이름이랑 생일 넣어보기 →
          </button>

          {userCount > 0 && (
            <p className="font-sans-kr text-[#444] text-xs text-center mb-2">
              지금까지 <span className="text-[#666]">{userCount.toLocaleString()}명</span>이 TOXIC을 이용했어요
            </p>
          )}

          <p className="font-sans-kr text-[#333] text-xs text-center">
            사주로 보는 관계의 본질
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          01b. 공감 — 카카오톡 대화 목업
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-20 border-t border-white/[0.06] fade-section">
        <div className="max-w-xl mx-auto">
          <p className="font-sans-kr text-[#FF2D55] section-label text-center mb-2">FAMILIAR?</p>
          <p className="font-sans-kr text-[#555] text-[10px] text-center mb-8">이 대화, 익숙하지 않나요?</p>

          <div className="overflow-hidden max-w-[320px] mx-auto mb-10 rounded-[20px]"
            style={{ background: '#1D1D1D', boxShadow: '0 24px 70px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.07)' }}>

            <div className="relative flex items-center justify-center h-12"
              style={{ background: '#252525', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="absolute left-3 flex items-center">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" className="opacity-55">
                  <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="font-sans-kr text-white text-[13.5px] font-bold">지훈</p>
              <div className="absolute right-3 flex items-center gap-3.5 opacity-50">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2"/>
                  <path d="M21 21l-4-4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="5" r="1.5" fill="white"/>
                  <circle cx="12" cy="12" r="1.5" fill="white"/>
                  <circle cx="12" cy="19" r="1.5" fill="white"/>
                </svg>
              </div>
            </div>

            <div className="pt-3.5 pb-2.5 text-center">
              <span className="font-sans-kr text-[#505050] text-[10px] bg-[#2A2A2A] px-3 py-1 rounded-full">2025년 3월 14일 금요일</span>
            </div>

            <div className="px-3 pb-4 space-y-2">
              <div className="flex justify-end">
                <div className="flex items-end gap-1.5">
                  <p className="font-sans-kr text-[#454545] text-[9.5px] mb-0.5 flex-shrink-0">오후 11:12</p>
                  <div className="px-3 py-2 max-w-[175px]"
                    style={{ background: '#FEE500', borderRadius: '14px 2px 14px 14px' }}>
                    <p className="font-sans-kr text-[#1A1A1A] text-[12px] leading-[1.5] font-medium">6시간째 읽씹이네</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 items-end">
                <div className="w-8 h-8 rounded-[8px] flex-shrink-0 overflow-hidden flex items-center justify-center text-base"
                  style={{ background: 'linear-gradient(135deg, #B8D4F0 0%, #8FB8E8 100%)' }}>
                  🐻
                </div>
                <div>
                  <p className="font-sans-kr text-[#686868] text-[10.5px] mb-1">지훈</p>
                  <div className="flex items-end gap-1.5">
                    <div className="px-3 py-2 max-w-[175px]"
                      style={{ background: '#3A3A3A', borderRadius: '2px 14px 14px 14px' }}>
                      <p className="font-sans-kr text-[#F0F0F0] text-[12px] leading-[1.5]">일하느라 못봤어</p>
                    </div>
                    <p className="font-sans-kr text-[#454545] text-[9.5px] mb-0.5 flex-shrink-0">오후 11:31</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="flex items-end gap-1.5">
                  <p className="font-sans-kr text-[#454545] text-[9.5px] mb-0.5 flex-shrink-0">오후 11:32</p>
                  <div className="px-3 py-2 max-w-[185px]"
                    style={{ background: '#FEE500', borderRadius: '14px 2px 14px 14px' }}>
                    <p className="font-sans-kr text-[#1A1A1A] text-[12px] leading-[1.5] font-medium">일하는데 인스타는 올렸더라</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 items-end">
                <div className="w-8 flex-shrink-0" />
                <div className="flex items-end gap-1.5">
                  <div className="px-3 py-2"
                    style={{ background: '#3A3A3A', borderRadius: '2px 14px 14px 14px' }}>
                    <p className="font-sans-kr text-[#F0F0F0] text-[12px] leading-[1.5]">…</p>
                  </div>
                  <p className="font-sans-kr text-[#454545] text-[9.5px] mb-0.5 flex-shrink-0">오후 11:47</p>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="flex items-end gap-1.5">
                  <p className="font-sans-kr text-[#454545] text-[9.5px] mb-0.5 flex-shrink-0">오후 11:48</p>
                  <div className="px-3 py-2 max-w-[175px]"
                    style={{ background: '#FEE500', borderRadius: '14px 2px 14px 14px' }}>
                    <p className="font-sans-kr text-[#1A1A1A] text-[12px] leading-[1.5] font-medium">할 말 없지</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1.5">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <p className="font-sans-kr text-[#FF2D55] text-[10px] px-1">사주에 이미 이유가 있었습니다</p>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="font-display text-white mb-3" style={{ fontSize: 'clamp(1.8rem, 7vw, 2.6rem)' }}>
              반복되는 갈등엔<br /><span className="text-[#FF2D55]">구조가 있습니다</span>
            </p>
            <p className="font-sans-kr text-[#555] text-sm">노력 부족이 아니에요. 애초에 충돌할 수밖에 없는 사주 구조였습니다.</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          02. 페르소나 퀵 셀렉트
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-16 border-t border-white/[0.06] fade-section">
        <div className="max-w-xl mx-auto">
          <p className="font-sans-kr text-[#FF2D55] section-label text-center mb-1">어떤 관계든 분석 가능</p>
          <h2 className="font-display text-white text-center mb-8"
            style={{ fontSize: 'clamp(1.8rem, 7vw, 2.8rem)' }}>
            지금 머릿속에 떠오르는<br />
            <span className="text-[#FF2D55]">딱 그 한 명</span>
          </h2>

          <div className="space-y-3">
            <button onClick={goToApp}
              className="w-full text-left border border-[#1e1e1e] p-5 bg-[#0D0D0D] hover:border-[#FF2D55]/40 card-hover group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[#FF2D55] text-[10px] font-bold border border-[#FF2D55]/30 px-2.5 py-1 rounded-full font-sans-kr tracking-wide">연인</span>
                  </div>
                  <p className="font-sans-kr text-white text-sm font-bold mb-1.5">끌렸는데 왜 이렇게 자꾸 다쳤는지</p>
                  <p className="font-sans-kr text-[#555] text-xs leading-relaxed">
                    헤어진 이유 · 반복되는 싸움 패턴 · 미련이 안 없어지는 이유
                  </p>
                </div>
                <span className="text-[#333] group-hover:text-[#FF2D55] transition-colors text-lg ml-3 flex-shrink-0 mt-1">→</span>
              </div>
            </button>

            <button onClick={goToApp}
              className="w-full text-left border border-[#1e1e1e] p-5 bg-[#0D0D0D] hover:border-[#BF5AF2]/40 card-hover group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[#BF5AF2] text-[10px] font-bold border border-[#BF5AF2]/30 px-2.5 py-1 rounded-full font-sans-kr tracking-wide">직장 · 상사 · 동료</span>
                  </div>
                  <p className="font-sans-kr text-white text-sm font-bold mb-1.5">내 잘못인지 그 사람 문제인지</p>
                  <p className="font-sans-kr text-[#555] text-xs leading-relaxed">
                    팀장이 나만 미워하는 이유 · 회의 때 충돌 · 퇴사 전 구조 파악
                  </p>
                </div>
                <span className="text-[#333] group-hover:text-[#BF5AF2] transition-colors text-lg ml-3 flex-shrink-0 mt-1">→</span>
              </div>
            </button>

            <button onClick={goToApp}
              className="w-full text-left border border-[#1e1e1e] p-5 bg-[#0D0D0D] hover:border-[#FF9500]/40 card-hover group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[#FF9500] text-[10px] font-bold border border-[#FF9500]/30 px-2.5 py-1 rounded-full font-sans-kr tracking-wide">가족 · 부모 · 형제</span>
                  </div>
                  <p className="font-sans-kr text-white text-sm font-bold mb-1.5">사랑하는데 왜 이렇게 아픈지</p>
                  <p className="font-sans-kr text-[#555] text-xs leading-relaxed">
                    성격 차이 아님 · 오행 구조 충돌 · 평생 반복되는 패턴의 원인
                  </p>
                </div>
                <span className="text-[#333] group-hover:text-[#FF9500] transition-colors text-lg ml-3 flex-shrink-0 mt-1">→</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          03. 실제 결과 프리뷰
      ══════════════════════════════════════ */}
      <section className="relative py-20 border-t border-white/[0.06] overflow-hidden fade-section">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,45,85,0.14) 0%, transparent 55%)' }} />

        <div className="max-w-xl mx-auto px-5 relative z-10">
          <p className="text-[#FF2D55] section-label font-sans-kr text-center mb-1">REAL RESULT</p>
          <p className="text-[#555] text-[10px] font-sans-kr text-center mb-2">실제 분석 결과</p>
          <h2 className="font-display leading-[1.08] text-white text-center mb-1"
            style={{ fontSize: 'clamp(2.4rem, 10vw, 4rem)' }}>
            생일과 이름만으로
          </h2>
          <h2 className="font-display leading-[1.08] text-[#FF2D55] text-center mb-3"
            style={{ fontSize: 'clamp(2.4rem, 10vw, 4rem)' }}>
            다 나와요
          </h2>
          <p className="font-sans-kr text-[#555] text-center text-sm mb-10">
            소름 돋는다는 반응이 나오는 이유 — 직접 보세요
          </p>
        </div>

        <div className="max-w-[360px] mx-auto px-5 relative">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08]"
            style={{ boxShadow: '0 0 0 1px rgba(255,45,85,0.18), 0 40px 100px rgba(0,0,0,0.9), 0 0 80px rgba(255,45,85,0.1)' }}>

            <img src="/result-preview-1.png" alt="TOXIC 사주 분석 결과 — 독성 지수 99점"
              className="w-full block"
              style={{ maxHeight: '520px', objectFit: 'cover', objectPosition: 'top' }} />

            <img src="/result-preview-2.png" alt="TOXIC 사주 분석 — 상세 내용"
              className="w-full block"
              style={{ maxHeight: '300px', objectFit: 'cover', objectPosition: 'top' }} />

            <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end pt-48"
              style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(10,0,5,0.85) 35%, #0A0005 60%)' }}>
              <div className="px-5 pb-6 pt-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="w-1 h-1 rounded-full bg-[#FF2D55] animate-pulse" />
                  <p className="font-sans-kr text-[#FF2D55] text-[10px] uppercase tracking-[0.25em]">내 결과는 다릅니다</p>
                </div>
                <button onClick={goToApp}
                  className="w-full bg-[#FF2D55] text-white font-display text-lg py-5 hover:opacity-90 active:scale-95 transition-all tracking-wide cta-glow-red">
                  이름이랑 생일 넣어보기 →
                </button>
              </div>
            </div>
          </div>

          <div className="absolute -inset-8 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,45,85,0.08) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-xl mx-auto px-5 mt-6">
          <p className="font-sans-kr text-center text-[#444] text-[11px]">
            이름만 알아도 시작 가능 · 1분
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          04. STORY — 연인
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-24 border-t border-white/[0.06] fade-section">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 15% 60%, rgba(255,45,85,0.09) 0%, transparent 50%)' }} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="step-badge bg-[#FF2D55] text-white font-sans-kr tracking-widest">STORY 01</span>
          </div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-6 h-px bg-[#FF2D55]" />
            <p className="text-[#FF2D55] section-label font-sans-kr">연인</p>
          </div>

          <h2 className="font-display leading-[1.08] text-white mb-2"
            style={{ fontSize: 'clamp(2.8rem, 11vw, 4.5rem)' }}>
            헤어진 이유를
          </h2>
          <h2 className="font-display leading-[1.08] text-[#FF2D55] mb-6"
            style={{ fontSize: 'clamp(2.8rem, 11vw, 4.5rem)' }}>
            이제야 알았다
          </h2>

          <p className="font-sans-kr text-[#666] text-sm leading-relaxed mb-10">
            좋아했는데 왜 자꾸 다쳤는지.<br />
            노력했는데 왜 계속 같은 자리인지.<br />
            <span className="text-[#888]">그 답이 사주에 있었습니다.</span>
          </p>

          <div className="bg-[#0D0D0D] border-l-[2px] border-[#FF2D55] pl-6 py-5 mb-8">
            <p className="font-sans-kr text-[#999] text-sm leading-relaxed mb-1">끌렸는데 자꾸 다쳤다면</p>
            <p className="font-sans-kr text-white text-sm leading-relaxed">
              사주에선 <span className="text-[#FF2D55] font-bold">충(沖)</span>일 수 있어요.
              서로 끌리지만 방향이 정반대인 구조. 노력해도 해결이 안 되는 이유가 여기 있습니다.
            </p>
          </div>

          <div className="border border-[#1e1e1e] p-6 mb-10 relative overflow-hidden">
            <div className="flex items-start gap-5 relative">
              <div className="border border-[#FF2D55] text-[#FF2D55] font-display text-lg px-3 py-2 flex-shrink-0 w-16 text-center">
                충<br /><span className="text-[10px] opacity-60">沖</span>
              </div>
              <div>
                <p className="font-sans-kr text-white text-sm font-bold mb-2">자오충(子午沖) — 강한 에너지 충돌</p>
                <p className="font-sans-kr text-[#666] text-xs leading-relaxed">
                  서로 끌리지만 결국 폭발하는 구조.<br />
                  처음엔 운명처럼 느껴지지만 근본 방향이 반대입니다.<br />
                  <span className="text-[#444]">싸움이 반복되는 건 당신 잘못이 아닙니다.</span>
                </p>
              </div>
            </div>
          </div>

          <div className="border border-[#1a1a1a] p-4 mb-8 bg-[#0A0A0A]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-[#FF2D55] border border-[#FF2D55]/30 px-2.5 py-1 rounded-full font-sans-kr font-bold">연인</span>
              <div className="flex gap-0.5">{[1,2,3,4,5].map(i=><span key={i} className="text-[10px] text-[#FF2D55]">★</span>)}</div>
            </div>
            <p className="font-sans-kr text-[#888] text-xs leading-relaxed">
              "연애 3년 내내 왜 싸웠는지 1분 만에 나왔어요. 이걸 3년 전에 알았더라면..."
            </p>
            <p className="font-sans-kr text-[#444] text-[10px] mt-1">— 24세 여성</p>
          </div>

          <button onClick={goToApp}
            className="w-full border border-[#FF2D55]/40 text-white font-sans-kr text-sm py-4 hover:bg-[#FF2D55]/10 active:scale-95 transition-all tracking-wide">
            연인 분석하기 →
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          05. STORY — 직장인
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-24 border-t border-white/[0.06] fade-section">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 85% 40%, rgba(191,90,242,0.08) 0%, transparent 50%)' }} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="step-badge bg-[#BF5AF2] text-white font-sans-kr tracking-widest">STORY 02</span>
          </div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-6 h-px bg-[#BF5AF2]" />
            <p className="text-[#BF5AF2] section-label font-sans-kr">직장 상사 · 동료</p>
          </div>

          <h2 className="font-display leading-[1.08] text-white mb-2"
            style={{ fontSize: 'clamp(2.8rem, 11vw, 4.5rem)', wordBreak: 'keep-all' }}>
            저 팀장이랑
          </h2>
          <h2 className="font-display leading-[1.08] mb-6"
            style={{ fontSize: 'clamp(2.4rem, 9.5vw, 4.5rem)', wordBreak: 'keep-all' }}>
            왜 이렇게 <span className="text-[#FF2D55]">안 맞지?</span>
          </h2>

          <p className="font-sans-kr text-[#666] text-sm leading-relaxed mb-10">
            내 성격 문제인지, 그 사람이 이상한 건지.<br />
            회의 때마다 충돌, 칭찬은 없고 지적만 있고.<br />
            <span className="text-[#888]">퇴사 전에 구조부터 파악해보세요.</span>
          </p>

          <div className="space-y-3 mb-10">
            {[
              { icon: '⚡', text: '팀장이 나만 콕 찍어서 지적하는 것 같다면' },
              { icon: '🔁', text: '회의 때마다 같은 사람이랑 의견 충돌한다면' },
              { icon: '🚪', text: '퇴사하고 싶은데 그 사람 때문인지 내 탓인지 모르겠다면' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 border border-[#1a1a1a] px-4 py-3 bg-[#0D0D0D]">
                <span className="text-base flex-shrink-0">{icon}</span>
                <p className="font-sans-kr text-[#777] text-sm">{text}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#0D0D0D] border-l-[2px] border-[#BF5AF2] pl-6 py-5 mb-8">
            <p className="font-sans-kr text-[#999] text-sm leading-relaxed mb-1">말투도 기준도 매번 어긋난다면</p>
            <p className="font-sans-kr text-white text-sm leading-relaxed">
              성격 차이가 아니라 <span className="text-[#BF5AF2] font-bold">사주 구조 문제</span>일 수 있어요.
              이건 노력으로 바꿀 수 없는 기질의 충돌입니다.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
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

          <div className="border border-[#1e1e1e] p-6 mb-8 relative overflow-hidden">
            <div className="flex items-start gap-5 relative">
              <div className="border border-[#BF5AF2] text-[#BF5AF2] font-display text-lg px-3 py-2 flex-shrink-0 w-16 text-center">
                형<br /><span className="text-[10px] opacity-60">刑</span>
              </div>
              <div>
                <p className="font-sans-kr text-white text-sm font-bold mb-2">인사신형(寅巳申刑) — 누적 충돌</p>
                <p className="font-sans-kr text-[#666] text-xs leading-relaxed">
                  갑자기 폭발하지 않아요.<br />
                  서서히, 조용히, 확실하게 쌓이는 불편함.<br />
                  <span className="text-[#444]">이 구조를 알면 대응 방식이 달라집니다.</span>
                </p>
              </div>
            </div>
          </div>

          <div className="border border-[#1a1a1a] p-4 mb-8 bg-[#0A0A0A]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-[#BF5AF2] border border-[#BF5AF2]/30 px-2.5 py-1 rounded-full font-sans-kr font-bold">직장</span>
              <div className="flex gap-0.5">{[1,2,3,4,5].map(i=><span key={i} className="text-[10px] text-[#FF2D55]">★</span>)}</div>
            </div>
            <p className="font-sans-kr text-[#888] text-xs leading-relaxed">
              "퇴사 고민 중인데 팀장이랑 분석해봤어요. 결과 보고 퇴사 결심이 서버렸음 ㅋㅋ 면죄부 받은 느낌"
            </p>
            <p className="font-sans-kr text-[#444] text-[10px] mt-1">— 28세 여성</p>
          </div>

          <button onClick={goToApp}
            className="w-full border border-[#BF5AF2]/40 text-white font-sans-kr text-sm py-4 hover:bg-[#BF5AF2]/10 active:scale-95 transition-all tracking-wide">
            직장 관계 분석하기 →
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          06. STORY — 가족
      ══════════════════════════════════════ */}
      <section className="relative border-t border-white/[0.06] overflow-hidden fade-section">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,149,0,0.06) 0%, transparent 60%)' }} />

        <div className="max-w-xl mx-auto px-5 py-24 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="step-badge bg-[#FF9500] text-white font-sans-kr tracking-widest">STORY 03</span>
          </div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-6 h-px bg-[#FF9500]" />
            <p className="text-[#FF9500] section-label font-sans-kr">가족</p>
          </div>

          <div className="text-center mb-10">
            <p className="font-display leading-[1.08] text-white mb-3"
              style={{ fontSize: 'clamp(2.4rem, 10vw, 4rem)' }}>
              사랑하는데
            </p>
            <p className="font-display leading-[1.08] mb-3"
              style={{ fontSize: 'clamp(2.4rem, 10vw, 4rem)' }}>
              <span className="text-[#FF9500]">왜 이렇게 아플까</span>
            </p>
            <p className="font-sans-kr text-[#777] text-sm mt-6 leading-relaxed">
              억압이 아니에요. 오행의 흐름입니다.<br />
              <span className="text-[#555]">성격 문제로 봤던 것이 구조로 보이기 시작합니다.</span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-10">
            {[
              { hanja: '剋', name: '극', desc: '에너지 소모' },
              { hanja: '沖', name: '충', desc: '방향 충돌' },
              { hanja: '刑', name: '형', desc: '누적 갈등' },
            ].map(({ hanja, name, desc }) => (
              <div key={hanja} className="border border-[#1e1e1e] p-4 text-center bg-[#0A0A0A]">
                <span className="font-display text-[#FF9500]/60 text-3xl leading-none block mb-2">{hanja}</span>
                <p className="font-sans-kr text-white text-xs font-bold">{name}</p>
                <p className="font-sans-kr text-[#555] text-[10px] mt-1">{desc}</p>
              </div>
            ))}
          </div>

          <div className="border-l-[2px] border-[#FF9500] pl-6 py-4 bg-[#0D0D0D] mb-8">
            <p className="font-sans-kr text-[#999] text-sm leading-relaxed mb-1">가족이라 더 어렵고, 더 오래 아파요</p>
            <p className="font-sans-kr text-white text-sm leading-relaxed">
              이건 성격 문제가 아니라 <span className="text-[#FF9500] font-bold">구조의 문제</span>입니다.
            </p>
          </div>

          <div className="border border-[#1a1a1a] p-4 mb-8 bg-[#0A0A0A]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-[#FF9500] border border-[#FF9500]/30 px-2.5 py-1 rounded-full font-sans-kr font-bold">가족</span>
              <div className="flex gap-0.5">{[1,2,3,4,5].map(i=><span key={i} className="text-[10px] text-[#FF2D55]">★</span>)}</div>
            </div>
            <p className="font-sans-kr text-[#888] text-xs leading-relaxed">
              "엄마랑 나 오행이 정반대라고 나와서 오히려 마음이 편해졌어요. 내 탓이 아니었구나"
            </p>
            <p className="font-sans-kr text-[#444] text-[10px] mt-1">— 32세 여성</p>
          </div>

          <button onClick={goToApp}
            className="w-full border border-[#FF9500]/40 text-white font-sans-kr text-sm py-4 hover:bg-[#FF9500]/10 active:scale-95 transition-all tracking-wide">
            가족 관계 분석하기 →
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          07. 기존 앱 vs TOXIC
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-24 border-t border-white/[0.06] fade-section">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(191,90,242,0.08) 0%, transparent 55%)' }} />
        <div className="max-w-xl mx-auto relative z-10">
          <p className="text-[#FF2D55] section-label font-sans-kr mb-1">WHY TOXIC?</p>
          <p className="text-[#555] text-[10px] font-sans-kr mb-6">기존 사주앱과 다른 점</p>

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
                  <div key={t} className="flex items-start gap-2">
                    <span className="text-[#444] text-xs mt-0.5">✕</span>
                    <p className="font-sans-kr text-[#555] text-xs line-through">{t}</p>
                  </div>
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
          08. HOW IT WORKS — 3단계
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-24 border-t border-white/[0.06] fade-section">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,45,85,0.05) 0%, transparent 60%)' }} />
        <div className="max-w-xl mx-auto relative z-10">
          <p className="text-[#FF2D55] section-label font-sans-kr text-center mb-1">HOW IT WORKS</p>
          <p className="text-[#555] text-[10px] font-sans-kr text-center mb-3">어떻게 작동하나요</p>
          <h2 className="font-display text-white text-center mb-12"
            style={{ fontSize: 'clamp(2rem, 8vw, 3.2rem)' }}>
            딱 <span className="text-[#FF2D55]">1분</span>이면 됩니다
          </h2>

          <div className="flex flex-col items-center gap-0">
            {[
              {
                step: 'STEP 1',
                title: '이름 · 생년월일 입력',
                desc: '내 정보와 그 사람의 이름, 생년월일을 입력해요. 이름만 알아도 시작 가능하고, 생일은 몰라도 괜찮아요.',
                sub: '이름만 OK · 생일 몰라도 가능',
              },
              {
                step: 'STEP 2',
                title: '사주 분석',
                desc: '사주팔자를 기반으로 충(沖)·형(刑)·해(害)·극(剋) 관계를 계산하고 실제 갈등 패턴을 도출합니다.',
                sub: '전통 사주 해석',
              },
              {
                step: 'STEP 3',
                title: '갈등 구조 결과',
                desc: '왜 안 맞는지, 어떤 상황에서 충돌하는지, 앞으로 어떻게 해야 하는지 — 구체적인 가이드가 나옵니다.',
                sub: '5개 섹션 · 상세 분석',
              },
            ].map(({ step, title, desc, sub }, idx, arr) => (
              <div key={step} className="w-full text-center">
                <span className="step-badge bg-[#FF2D55] text-white font-sans-kr">{step}</span>
                <p className="font-sans-kr text-white text-sm font-bold mb-1.5">{title}</p>
                <p className="font-sans-kr text-[#666] text-xs leading-relaxed mb-3">{desc}</p>
                <span className="text-[#444] text-[10px] border border-[#222] px-2.5 py-1 rounded-full font-sans-kr">{sub}</span>
                {idx < arr.length - 1 && (
                  <div className="w-px h-8 mx-auto mt-6 mb-2"
                    style={{ background: 'linear-gradient(to bottom, rgba(255,45,85,0.6), transparent)' }} />
                )}
                {idx < arr.length - 1 && <div className="mb-6" />}
              </div>
            ))}
          </div>

          <button onClick={goToApp}
            className="w-full mt-10 bg-[#FF2D55] text-white font-display text-xl py-5 hover:opacity-90 active:scale-95 transition-all tracking-wide cta-glow-red">
            지금 바로 분석하기 →
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          09. FINAL OFFER — mock UI
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-24 border-t border-white/[0.06] fade-section">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,45,85,0.08) 0%, transparent 55%)' }} />
        <div className="max-w-xl mx-auto relative z-10">
          <p className="text-[#FF2D55] section-label font-sans-kr text-center mb-1">TOXIC SAJU ANALYSIS</p>
          <p className="text-[#444] text-[10px] font-sans-kr text-center mb-2">독성 지수 분석</p>
          <h2 className="font-display leading-[1.05] text-white text-center mb-1"
            style={{ fontSize: 'clamp(3rem, 12vw, 5rem)' }}>그 사람</h2>
          <h2 className="font-display leading-[1.05] text-[#FF2D55] text-center mb-10"
            style={{ fontSize: 'clamp(3rem, 12vw, 5rem)' }}>이름이랑 생일 넣어봐</h2>

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
              <p className="font-sans-kr text-[#555] text-[11px] uppercase tracking-wider mb-4">종합 궁합 분석 결과</p>
              <div className="flex items-end gap-2 mb-3">
                <span className="font-display text-[#FF2D55] text-6xl leading-none">97</span>
                <div className="mb-2">
                  <span className="font-display text-[#FF2D55] text-2xl">%</span>
                  <p className="font-sans-kr text-[#777] text-[10px]">독성 지수</p>
                </div>
                <div className="ml-auto bg-[#FF2D55] text-white text-[10px] px-3 py-1.5 font-bold font-sans-kr self-end mb-1">
                  ⚠ 위험도 MAX
                </div>
              </div>
              <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden mb-5">
                <div className="h-full rounded-full"
                  style={{ width: '97%', background: 'linear-gradient(90deg, #FF2D55 0%, #BF5AF2 80%, #FF2D55 100%)', boxShadow: '0 0 8px rgba(255,45,85,0.6)' }} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['#집착주의', '#감정소모', '#헤어나다후폭풍', '#미련주의'].map(tag => (
                  <span key={tag} className="text-[10px] text-[#FF2D55] bg-[#FF2D55]/8 border border-[#FF2D55]/20 px-2 py-0.5 font-sans-kr">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <button onClick={goToApp}
              className="w-full bg-[#FF2D55] text-white font-display text-xl py-5 hover:opacity-90 active:scale-95 transition-all tracking-wide cta-glow-red">
              지금 분석하기 →
            </button>
          </div>

          <p className="font-sans-kr text-center text-[#444] text-xs">
            연인 · 친구 · 상사 · 가족{' '}
            <span className="border border-[#333] px-2.5 py-0.5 rounded-full">모두 가능</span>
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          10. FINAL CTA
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-28 border-t border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,45,85,0.15) 0%, transparent 55%)' }} />
        <div className="max-w-xl mx-auto text-center relative z-10">
          <p className="text-[#FF2D55] section-label font-sans-kr mb-2">지금 바로</p>

          <h2 className="font-display leading-[1.05] text-white mb-2"
            style={{ fontSize: 'clamp(3rem, 12vw, 5rem)' }}>
            당신을 힘들게 한
          </h2>
          <h2 className="font-display leading-[1.05] text-[#FF2D55] mb-8"
            style={{ fontSize: 'clamp(3rem, 12vw, 5rem)' }}>
            그 사람의 이유
          </h2>

          <p className="font-sans-kr text-[#666] leading-relaxed mb-10">
            사주에 이미 답이 있었습니다.
          </p>

          <button onClick={goToApp}
            className="w-full bg-[#FF2D55] text-white font-display text-2xl py-6 hover:opacity-90 active:scale-95 transition-all tracking-wide mb-5 cta-glow-red">
            지금 분석하기 →
          </button>

          {userCount > 0 && (
            <p className="font-sans-kr text-[#444] text-xs mb-4">
              지금까지 <span className="text-[#666]">{userCount.toLocaleString()}명</span>이 TOXIC을 이용했어요
            </p>
          )}
          <p className="font-sans-kr text-[#444] text-xs">1분 · 지금 바로</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] py-12 px-5">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-4">
          <img src="/hero-title.svg" alt="TOXIC" className="h-10 object-contain opacity-60" />
          <p className="font-sans-kr text-[#555] text-xs">사주로 보는 관계의 본질</p>
          <div className="w-px h-4 bg-[#222]" />
          <div className="flex items-center gap-4">
            <button onClick={() => setShowPrivacy(true)}
              className="font-sans-kr text-[#444] text-xs hover:text-[#666] transition-colors">
              개인정보처리방침
            </button>
            <span className="text-[#222] text-xs">·</span>
            <p className="font-sans-kr text-[#333] text-xs">© 2025 TOXIC. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 개인정보처리방침 모달 */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-end sm:items-center justify-center px-4 pb-0 sm:pb-4 animate-fade-in"
          onClick={() => setShowPrivacy(false)}>
          <div className="bg-[#0D0D0D] border border-[#222] w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 sm:rounded-sm"
            onClick={e => e.stopPropagation()}>
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
            <button onClick={() => setShowPrivacy(false)}
              className="mt-6 w-full py-3 border border-[#333] text-[#666] text-sm hover:border-[#555] hover:text-white transition-colors">
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
