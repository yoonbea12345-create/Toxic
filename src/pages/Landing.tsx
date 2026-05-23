import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { startSession } from '../utils/analytics';


const TRIGGERS = [
  { type: '연인', text: '6시간 읽씹하고 인스타는 올리고 있더라. 내가 예민한건가', color: '#FF2D55' },
  { type: '직장', text: '나한테만 유독 이러는 것 같은데 기분탓인지 진짜인지 모르겠음', color: '#BF5AF2' },
  { type: '가족', text: '엄마랑 말하면 꼭 싸움으로 끝남. 나만 이러나', color: '#FF9500' },
  { type: '연인', text: '헤어진지 반년 됐는데 자꾸 생각남. 미련인지 뭔지', color: '#FF2D55' },
  { type: '직장', text: '열심히 하는데 저 사람한텐 항상 지적만 받음. 내 잘못인가', color: '#BF5AF2' },
  { type: '가족', text: '가족인데 같이 있으면 왜 이렇게 힘드냐 진짜', color: '#FF9500' },
  { type: '연인', text: '맨날 같은 이유로 싸우고 화해하고 또 싸우고. 지침', color: '#FF2D55' },
  { type: '직장', text: '저 사람 때문에 퇴사하고 싶은데 내가 소심한건가 걔가 이상한건가', color: '#BF5AF2' },
  { type: '가족', text: '부모님한테 화내고 나면 죄책감드는데 근데 또 화남', color: '#FF9500' },
];

const CheckIcon = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5">
    <circle cx="7" cy="7" r="6.5" stroke={color} strokeOpacity="0.4"/>
    <path d="M4 7l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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
        <div className="max-w-xl mx-auto pl-0 pr-4 h-[100px] flex items-center justify-between">
          <img src="/hero-title.svg" alt="TOXIC" className="h-[92px] w-auto block" />
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
          <p className="font-sans-kr text-[#FF2D55] text-xs font-bold tracking-widest mb-5">
            사주로 보는 관계의 본질
          </p>

          <h1 className="font-display leading-[1.02] text-white mb-6"
            style={{ fontSize: 'clamp(3.2rem, 14vw, 6rem)' }}>
            그 사람이랑<br />
            왜 이렇게<br />
            <span className="text-[#FF2D55]">안 맞는 걸까</span>
          </h1>

          {/* 감정 트리거 rotator */}
          <div className="mb-1 min-h-[2.2rem]">
            <div key={triggerIdx} className="animate-fade-in">
              <p className="font-sans-kr text-[#777] text-sm leading-relaxed">
                {trigger.text}
              </p>
            </div>
          </div>

          <p className="font-sans-kr text-white text-base leading-relaxed mb-8">
            사주에 <span className="text-[#FF2D55] font-bold">모든 답이 있습니다.</span>
          </p>

          <button onClick={goToApp}
            className="w-full bg-[#FF2D55] text-white font-display text-xl py-5 tracking-wide hover:opacity-90 active:scale-95 transition-all cta-glow-red">
            이름이랑 생일 넣어보기 →
          </button>

          {userCount > 0 && (
            <p className="font-sans-kr text-[#444] text-xs text-center mt-3">
              지금까지 <span className="text-[#666]">{userCount.toLocaleString()}번</span>의 사주 분석을 완료했어요
            </p>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          01b. 연인 — 카카오톡 폰 목업
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-20 border-t border-white/[0.06] fade-section">
        <div className="max-w-xl mx-auto">
          <p className="font-sans-kr text-[#FF2D55] section-label mb-3">연인</p>
          <p className="font-display text-white mb-8" style={{ fontSize: 'clamp(1.6rem, 6.5vw, 2.4rem)' }}>
            연인과의 반복되는 갈등엔<br /><span className="text-[#FF2D55]">숨은 이유가 있습니다.</span>
          </p>
          <div className="max-w-[300px] mx-auto">
            <div className="rounded-[2.4rem] overflow-hidden" style={{ border: '1.5px solid #2A2A2A', background: '#111', boxShadow: '0 32px 80px rgba(0,0,0,0.9)' }}>
              <div className="flex justify-center pt-3 pb-1.5 bg-[#111]"><div className="w-20 h-[3px] bg-[#222] rounded-full" /></div>
              <img src="/chat-lover.png" alt="연인 대화" className="w-full block" />
              <div className="flex justify-center py-2.5 bg-[#111]"><div className="w-14 h-[3px] bg-[#222] rounded-full" /></div>
            </div>
          </div>
          <p className="font-sans-kr text-[#555] text-sm text-center mt-6">노력 부족이 아니에요<br />애초에 충돌할 수 밖에 없는 사주 구조일 수 있어요.</p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          01c. 친구 — 카카오톡 폰 목업
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-20 border-t border-white/[0.06] fade-section">
        <div className="max-w-xl mx-auto">
          <p className="font-sans-kr text-[#30D158] section-label mb-3">친구</p>
          <p className="font-display text-white mb-8" style={{ fontSize: 'clamp(1.6rem, 6.5vw, 2.4rem)' }}>
            친구와의 반복되는 갈등엔<br /><span className="text-[#30D158]">숨은 사주가 있습니다.</span>
          </p>
          <div className="max-w-[300px] mx-auto">
            <div className="rounded-[2.4rem] overflow-hidden" style={{ border: '1.5px solid #2A2A2A', background: '#111', boxShadow: '0 32px 80px rgba(0,0,0,0.9)' }}>
              <div className="flex justify-center pt-3 pb-1.5 bg-[#111]"><div className="w-20 h-[3px] bg-[#222] rounded-full" /></div>
              <img src="/chat-friend.png" alt="친구 대화" className="w-full block" />
              <div className="flex justify-center py-2.5 bg-[#111]"><div className="w-14 h-[3px] bg-[#222] rounded-full" /></div>
            </div>
          </div>
          <p className="font-sans-kr text-[#555] text-sm text-center mt-6">노력 부족이 아니에요<br />애초에 충돌할 수 밖에 없는 사주 구조일 수 있어요.</p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          01d. 직장 — 카카오톡 폰 목업
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-20 border-t border-white/[0.06] fade-section">
        <div className="max-w-xl mx-auto">
          <p className="font-sans-kr text-[#BF5AF2] section-label mb-3">직장</p>
          <p className="font-display text-white mb-8" style={{ fontSize: 'clamp(1.6rem, 6.5vw, 2.4rem)' }}>
            팀장님의 반복되는 질책엔<br /><span className="text-[#BF5AF2]">숨은 구조가 있습니다.</span>
          </p>
          <div className="max-w-[300px] mx-auto">
            <div className="rounded-[2.4rem] overflow-hidden" style={{ border: '1.5px solid #2A2A2A', background: '#111', boxShadow: '0 32px 80px rgba(0,0,0,0.9)' }}>
              <div className="flex justify-center pt-3 pb-1.5 bg-[#111]"><div className="w-20 h-[3px] bg-[#222] rounded-full" /></div>
              <img src="/chat-work.png" alt="직장 대화" className="w-full block" />
              <div className="flex justify-center py-2.5 bg-[#111]"><div className="w-14 h-[3px] bg-[#222] rounded-full" /></div>
            </div>
          </div>
          <p className="font-sans-kr text-[#555] text-sm text-center mt-6">노력 부족이 아니에요<br />애초에 충돌할 수 밖에 없는 사주 구조일 수 있어요.</p>
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
            {/* 연인 */}
            <button onClick={goToApp}
              className="w-full text-left border border-[#1e1e1e] p-5 bg-[#0D0D0D] hover:border-[#FF2D55]/40 card-hover group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[#FF2D55] text-[10px] font-bold border border-[#FF2D55]/30 px-2.5 py-1 rounded-full font-sans-kr tracking-wide">연인</span>
                  </div>
                  <p className="font-sans-kr text-white text-sm font-bold mb-1.5">왜 자꾸 싸우기만 하는지</p>
                  <p className="font-sans-kr text-[#555] text-xs leading-relaxed">
                    헤어진 이유 · 반복되는 싸움 패턴 · 미련이 안 없어지는 이유
                  </p>
                </div>
                <span className="text-[#333] group-hover:text-[#FF2D55] transition-colors text-lg ml-3 flex-shrink-0 mt-1">→</span>
              </div>
            </button>

            {/* 친구·지인 */}
            <button onClick={goToApp}
              className="w-full text-left border border-[#1e1e1e] p-5 bg-[#0D0D0D] hover:border-[#30D158]/40 card-hover group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[#30D158] text-[10px] font-bold border border-[#30D158]/30 px-2.5 py-1 rounded-full font-sans-kr tracking-wide">친구 · 지인</span>
                  </div>
                  <p className="font-sans-kr text-white text-sm font-bold mb-1.5">친구인데 왜 이렇게 자꾸 상처받는지</p>
                  <p className="font-sans-kr text-[#555] text-xs leading-relaxed">
                    반복되는 다툼 · 일방적인 관계 패턴 · 미묘한 불편함의 원인
                  </p>
                </div>
                <span className="text-[#333] group-hover:text-[#30D158] transition-colors text-lg ml-3 flex-shrink-0 mt-1">→</span>
              </div>
            </button>

            {/* 직장·상사·동료 */}
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

            {/* 가족·부모·형제 */}
            <button onClick={goToApp}
              className="w-full text-left border border-[#1e1e1e] p-5 bg-[#0D0D0D] hover:border-[#FF9500]/40 card-hover group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[#FF9500] text-[10px] font-bold border border-[#FF9500]/30 px-2.5 py-1 rounded-full font-sans-kr tracking-wide">가족 · 부모 · 형제</span>
                  </div>
                  <p className="font-sans-kr text-white text-sm font-bold mb-1.5">가족인데 왜 이렇게 안 맞는지</p>
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
          <h2 className="font-display leading-[1.08] text-white text-center mb-1"
            style={{ fontSize: 'clamp(2.4rem, 10vw, 4rem)' }}>
            쉽고 빠른
          </h2>
          <h2 className="font-display leading-[1.08] text-[#FF2D55] text-center mb-3"
            style={{ fontSize: 'clamp(2.4rem, 10vw, 4rem)' }}>
            정확한 분석
          </h2>
          <p className="font-sans-kr text-[#555] text-center text-sm mb-10">
            다양한 상황에 맞는 분석결과를 직접 보세요
          </p>

          {/* 폰 목업 1개씩 세로 나열 */}
          <div className="flex flex-col gap-10 mb-10">
            {[
              { src: '/result-slide-1.png', label: '충돌 원인', desc: '사주 구조에서 비롯된 근본적인 갈등 원인' },
              { src: '/result-slide-3.png', label: '갈등 패턴', desc: '반복되는 싸움 패턴과 충돌 상황 분석' },
              { src: '/result-slide-5.png', label: '관계 구조', desc: '두 사람의 오행 관계와 앞으로의 방향' },
            ].map(({ src, label, desc }) => (
              <div key={label} className="flex flex-col items-center">
                <p className="font-sans-kr text-white text-sm font-bold mb-1 text-center">{label}</p>
                <p className="font-sans-kr text-[#555] text-xs mb-5 text-center">{desc}</p>
                <div className="max-w-[280px] w-full mx-auto rounded-[2rem] overflow-hidden"
                  style={{ background: '#111', border: '1.5px solid #2A2A2A', boxShadow: '0 32px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04)' }}>
                  <div className="flex justify-center pt-3 pb-1"><div className="w-16 h-[3px] bg-[#222] rounded-full" /></div>
                  <img src={src} alt={label} className="w-full block" />
                  <div className="flex justify-center pt-1 pb-2.5"><div className="w-12 h-[3px] bg-[#222] rounded-full" /></div>
                </div>
              </div>
            ))}
          </div>

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
          05. STORY — 친구·지인
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-24 border-t border-white/[0.06] fade-section">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 85% 40%, rgba(48,209,88,0.07) 0%, transparent 50%)' }} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="step-badge bg-[#30D158] text-white font-sans-kr tracking-widest">STORY 02</span>
          </div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-6 h-px bg-[#30D158]" />
            <p className="text-[#30D158] section-label font-sans-kr">친구 · 지인</p>
          </div>

          <h2 className="font-display leading-[1.08] text-white mb-2"
            style={{ fontSize: 'clamp(2.8rem, 11vw, 4.5rem)', wordBreak: 'keep-all' }}>
            친구인데 자꾸
          </h2>
          <h2 className="font-display leading-[1.08] mb-6"
            style={{ fontSize: 'clamp(2.4rem, 9.5vw, 4.5rem)', wordBreak: 'keep-all' }}>
            왜 <span className="text-[#30D158]">상처받지?</span>
          </h2>

          <p className="font-sans-kr text-[#666] text-sm leading-relaxed mb-10">
            내 잘못인지, 친구가 나쁜 건지 판단하기 전에.<br />
            오래된 관계일수록 더 깊이 파고드는 불편함.<br />
            <span className="text-[#888]">사주 구조를 먼저 보세요.</span>
          </p>

          <div className="space-y-3 mb-10">
            {[
              '별거 아닌 말에 자꾸 상처받는다면',
              '친구가 나만 다르게 대하는 것 같다면',
              '오래된 친구인데 이유 없이 불편하다면',
            ].map(text => (
              <div key={text} className="flex items-center gap-3 border border-[#1a1a1a] px-4 py-3 bg-[#0D0D0D]">
                <CheckIcon color="#30D158" />
                <p className="font-sans-kr text-[#777] text-sm">{text}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#0D0D0D] border-l-[2px] border-[#30D158] pl-6 py-5 mb-8">
            <p className="font-sans-kr text-[#999] text-sm leading-relaxed mb-1">서로 좋아하면서도 자꾸 어긋난다면</p>
            <p className="font-sans-kr text-white text-sm leading-relaxed">
              성격 차이가 아니라 <span className="text-[#30D158] font-bold">해(害) 구조</span>일 수 있어요.
              끌리지만 반복적으로 상처주는 사주의 패턴입니다.
            </p>
          </div>

          <div className="border border-[#1e1e1e] p-6 mb-8 relative overflow-hidden">
            <div className="flex items-start gap-5 relative">
              <div className="border border-[#30D158] text-[#30D158] font-display text-lg px-3 py-2 flex-shrink-0 w-16 text-center">
                해<br /><span className="text-[10px] opacity-60">害</span>
              </div>
              <div>
                <p className="font-sans-kr text-white text-sm font-bold mb-2">자미해(子未害) — 반복 상처 구조</p>
                <p className="font-sans-kr text-[#666] text-xs leading-relaxed">
                  나쁜 의도가 없어도 계속 상처를 줍니다.<br />
                  친하기 때문에 더 깊이 파고드는 갈등.<br />
                  <span className="text-[#444]">이 구조를 알면 기대치 자체가 달라집니다.</span>
                </p>
              </div>
            </div>
          </div>

          <div className="border border-[#1a1a1a] p-4 mb-8 bg-[#0A0A0A]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-[#30D158] border border-[#30D158]/30 px-2.5 py-1 rounded-full font-sans-kr font-bold">친구</span>
              <div className="flex gap-0.5">{[1,2,3,4,5].map(i=><span key={i} className="text-[10px] text-[#FF2D55]">★</span>)}</div>
            </div>
            <p className="font-sans-kr text-[#888] text-xs leading-relaxed">
              "10년 친구인데 왜 서로 상처를 주는 건지 몰랐는데, 사주 구조로 나오니까 이해가 됐어요."
            </p>
            <p className="font-sans-kr text-[#444] text-[10px] mt-1">— 26세 여성</p>
          </div>

          <button onClick={goToApp}
            className="w-full border border-[#30D158]/40 text-white font-sans-kr text-sm py-4 hover:bg-[#30D158]/10 active:scale-95 transition-all tracking-wide">
            친구 관계 분석하기 →
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          06. STORY — 직장인
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-24 border-t border-white/[0.06] fade-section">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 85% 40%, rgba(191,90,242,0.08) 0%, transparent 50%)' }} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="step-badge bg-[#BF5AF2] text-white font-sans-kr tracking-widest">STORY 03</span>
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
              '팀장이 나만 콕 찍어서 지적하는 것 같다면',
              '회의 때마다 같은 사람이랑 의견 충돌한다면',
              '퇴사하고 싶은데 그 사람 때문인지 내 탓인지 모르겠다면',
            ].map(text => (
              <div key={text} className="flex items-center gap-3 border border-[#1a1a1a] px-4 py-3 bg-[#0D0D0D]">
                <CheckIcon color="#FF2D55" />
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
          07. STORY — 가족
      ══════════════════════════════════════ */}
      <section className="relative border-t border-white/[0.06] overflow-hidden fade-section">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,149,0,0.06) 0%, transparent 60%)' }} />

        <div className="max-w-xl mx-auto px-5 py-24 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="step-badge bg-[#FF9500] text-white font-sans-kr tracking-widest">STORY 04</span>
          </div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-6 h-px bg-[#FF9500]" />
            <p className="text-[#FF9500] section-label font-sans-kr">가족</p>
          </div>

          <h2 className="font-display leading-[1.08] text-white mb-2"
            style={{ fontSize: 'clamp(2.8rem, 11vw, 4.5rem)' }}>
            가족인데
          </h2>
          <h2 className="font-display leading-[1.08] mb-6"
            style={{ fontSize: 'clamp(2.4rem, 9.5vw, 4.5rem)' }}>
            <span className="text-[#FF9500]">왜 이렇게 안맞을까</span>
          </h2>
          <p className="font-sans-kr text-[#666] text-sm leading-relaxed mb-10">
            억압이 아니에요. 오행의 흐름입니다.<br />
            <span className="text-[#888]">성격 문제로 봤던 것이 구조로 보이기 시작합니다.</span>
          </p>

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
            <p className="font-sans-kr text-[#999] text-sm leading-relaxed mb-1">가족이라 더 어렵고, 더 안맞지 않나요?</p>
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
          08. 기존 앱 vs TOXIC
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
          09. HOW IT WORKS — 3단계
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-24 border-t border-white/[0.06] fade-section">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,45,85,0.05) 0%, transparent 60%)' }} />
        <div className="max-w-xl mx-auto relative z-10">
          <h2 className="font-display text-white text-center mb-16"
            style={{ fontSize: 'clamp(2rem, 8vw, 3.2rem)' }}>
            딱 <span className="text-[#FF2D55]">1분</span>이면 됩니다
          </h2>

          {/* Step 1 */}
          <div className="mb-4">
            <span className="step-badge bg-[#FF2D55] text-white font-sans-kr">STEP 1</span>
            <p className="font-sans-kr text-white text-sm font-bold mb-1">내 정보 입력</p>
            <p className="font-sans-kr text-[#555] text-xs leading-relaxed mb-6">이름과 생년월일을 입력해요. 이름만 알아도 시작 가능해요.</p>
            <div className="max-w-[260px] mx-auto">
              <div className="rounded-[2.2rem] overflow-hidden" style={{ border: '1.5px solid #2A2A2A', background: '#111', boxShadow: '0 24px 70px rgba(0,0,0,0.85)' }}>
                <div className="flex justify-center pt-2.5 pb-1 bg-[#111]"><div className="w-16 h-[3px] bg-[#222] rounded-full" /></div>
                <img src="/step-1.png" alt="STEP 1 내 정보 입력" className="w-full block" />
                <div className="flex justify-center py-2 bg-[#111]"><div className="w-12 h-[3px] bg-[#222] rounded-full" /></div>
              </div>
            </div>
          </div>

          {/* 연결선 */}
          <div className="flex justify-center my-6">
            <div className="w-px h-10" style={{ background: 'linear-gradient(to bottom, rgba(255,45,85,0.5), transparent)' }} />
          </div>

          {/* Step 2 */}
          <div className="mb-4">
            <span className="step-badge bg-[#FF2D55] text-white font-sans-kr">STEP 2</span>
            <p className="font-sans-kr text-white text-sm font-bold mb-1">관계 유형 선택</p>
            <p className="font-sans-kr text-[#555] text-xs leading-relaxed mb-6">연인, 친구, 직장, 가족 — 분석 결과가 관계에 맞게 해석됩니다.</p>
            <div className="max-w-[260px] mx-auto">
              <div className="rounded-[2.2rem] overflow-hidden" style={{ border: '1.5px solid #2A2A2A', background: '#111', boxShadow: '0 24px 70px rgba(0,0,0,0.85)' }}>
                <div className="flex justify-center pt-2.5 pb-1 bg-[#111]"><div className="w-16 h-[3px] bg-[#222] rounded-full" /></div>
                <img src="/step-2.png" alt="STEP 2 관계 유형 선택" className="w-full block" />
                <div className="flex justify-center py-2 bg-[#111]"><div className="w-12 h-[3px] bg-[#222] rounded-full" /></div>
              </div>
            </div>
          </div>

          {/* 연결선 */}
          <div className="flex justify-center my-6">
            <div className="w-px h-10" style={{ background: 'linear-gradient(to bottom, rgba(255,45,85,0.5), transparent)' }} />
          </div>

          {/* Step 3 */}
          <div className="mb-4">
            <span className="step-badge bg-[#FF2D55] text-white font-sans-kr">STEP 3</span>
            <p className="font-sans-kr text-white text-sm font-bold mb-1">상대방 정보 입력</p>
            <p className="font-sans-kr text-[#555] text-xs leading-relaxed mb-6">아는 만큼만 입력해도 분석 가능. 이름만 있어도 시작할 수 있어요.</p>
            <div className="max-w-[260px] mx-auto">
              <div className="rounded-[2.2rem] overflow-hidden" style={{ border: '1.5px solid #2A2A2A', background: '#111', boxShadow: '0 24px 70px rgba(0,0,0,0.85)' }}>
                <div className="flex justify-center pt-2.5 pb-1 bg-[#111]"><div className="w-16 h-[3px] bg-[#222] rounded-full" /></div>
                <img src="/step-3.png" alt="STEP 3 상대방 정보 입력" className="w-full block" />
                <div className="flex justify-center py-2 bg-[#111]"><div className="w-12 h-[3px] bg-[#222] rounded-full" /></div>
              </div>
            </div>
          </div>

          {/* 결과 */}
          <div className="flex justify-center my-6">
            <div className="w-px h-10" style={{ background: 'linear-gradient(to bottom, rgba(255,45,85,0.5), transparent)' }} />
          </div>

          <div className="mb-10">
            <span className="step-badge font-sans-kr" style={{ background: '#1a0a0a', border: '1px solid #FF2D55', color: '#FF2D55' }}>RESULT</span>
            <p className="font-sans-kr text-white text-sm font-bold mb-1">갈등 구조 분석 완료</p>
            <p className="font-sans-kr text-[#555] text-xs leading-relaxed mb-6">충·형·해·극 구조로 왜 안 맞는지, 어떤 패턴인지 상세히 나옵니다.</p>
            <div className="max-w-[260px] mx-auto">
              <div className="rounded-[2.2rem] overflow-hidden" style={{ border: '1.5px solid #FF2D55', background: '#111', boxShadow: '0 24px 70px rgba(0,0,0,0.85), 0 0 40px rgba(255,45,85,0.15)' }}>
                <div className="flex justify-center pt-2.5 pb-1 bg-[#111]"><div className="w-16 h-[3px] bg-[#222] rounded-full" /></div>
                <img src="/step-result.png" alt="분석 결과" className="w-full block" />
                <div className="flex justify-center py-2 bg-[#111]"><div className="w-12 h-[3px] bg-[#222] rounded-full" /></div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════
          10. FINAL CTA
      ══════════════════════════════════════ */}
      <section className="relative px-5 py-28 border-t border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,45,85,0.15) 0%, transparent 55%)' }} />
        <div className="max-w-xl mx-auto text-center relative z-10">
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
            <p className="font-sans-kr text-[#444] text-xs">
              지금까지 <span className="text-[#666]">{userCount.toLocaleString()}번</span>의 사주 분석을 완료했어요
            </p>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] py-12 px-5">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-4">
          <img src="/hero-title.svg" alt="TOXIC" className="h-[47px] object-contain opacity-60" />
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
