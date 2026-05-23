import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_KEY = '1229';
const EVENTS_KEY = 'toxic_events';
const LOADING_STATES = { idle: 'idle', loading: 'loading', error: 'error' } as const;

interface EventRecord {
  event: string;
  props?: Record<string, unknown>;
  ts: number;
}

interface Stats {
  totalSessions: number;
  landingViews: number;
  step1Complete: number;
  step2Complete: number;
  step3Complete: number;
  resultViews: number;
  skipTarget: number;
  resets: number;
  avgToxicScore: number;
  relationBreakdown: Record<string, number>;
  shareAttempts: number;
  completionRate: number;
  dropoff: { landing: number; step1: number; step2: number; step3: number };
  paywallImpressions: number;
  paywallClicks: number;
  sectionPays: number;
  allPays: number;
  sectionRevenue: number;
  allRevenue: number;
  totalRevenue: number;
  paywallCTR: number;
  paywallConversion: number;
  reviewSubmits: number;
  avgReviewStars: string;
}

function computeStats(events: EventRecord[]): Stats {
  const count = (name: string) => events.filter(e => e.event === name).length;
  const reviewSubmits = count('review_submit');
  const avgReviewStars = (() => {
    const rs = events.filter(e => e.event === 'review_submit').map(e => Number(e.props?.stars)).filter(n => n > 0);
    return rs.length ? (rs.reduce((a, b) => a + b, 0) / rs.length).toFixed(1) : '—';
  })();

  const landing = count('page_view_landing');
  const s1 = count('step_complete_my-info');
  const s2 = count('step_complete_relation');
  const s3 = count('step_complete_target-info') + count('step_complete_skip-target');
  const results = s3;
  const skips = count('step_complete_skip-target');
  const resets = count('reset');
  const shares = count('share');
  const paywallImpressions = count('paywall_impression');
  const paywallClicks = count('paywall_click');
  const sectionPays = events.filter(e => e.event === 'paywall_pay' && e.props?.type === 'section').length;
  const allPays = events.filter(e => e.event === 'paywall_pay' && e.props?.type === 'all').length;
  const sectionRevenue = sectionPays * 500;
  const allRevenue = allPays * 1900;
  const totalRevenue = sectionRevenue + allRevenue;
  const paywallPays = sectionPays + allPays;

  const scores = events
    .filter(e => e.event === 'step_complete_target-info' || e.event === 'step_complete_skip-target')
    .map(e => Number(e.props?.toxicScore))
    .filter(n => !isNaN(n) && n > 0);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const relationBreakdown: Record<string, number> = {};
  events
    .filter(e => e.event === 'step_complete_relation')
    .forEach(e => {
      const r = String(e.props?.relationType || '기타');
      relationBreakdown[r] = (relationBreakdown[r] || 0) + 1;
    });

  const total = Math.max(landing, 1);

  return {
    totalSessions: landing,
    landingViews: landing,
    step1Complete: s1,
    step2Complete: s2,
    step3Complete: s3,
    resultViews: results,
    skipTarget: skips,
    resets,
    avgToxicScore: avgScore,
    relationBreakdown,
    shareAttempts: shares,
    completionRate: results ? Math.round((results / total) * 100) : 0,
    paywallImpressions,
    paywallClicks,
    sectionPays,
    allPays,
    sectionRevenue,
    allRevenue,
    totalRevenue,
    paywallCTR: paywallImpressions ? Math.round((paywallClicks / paywallImpressions) * 100) : 0,
    paywallConversion: paywallClicks ? Math.round((paywallPays / paywallClicks) * 100) : 0,
    reviewSubmits,
    avgReviewStars,
    dropoff: {
      landing: 100,
      step1: landing ? Math.round((s1 / landing) * 100) : 0,
      step2: s1 ? Math.round((s2 / s1) * 100) : 0,
      step3: s2 ? Math.round((s3 / s2) * 100) : 0,
    },
  };
}

function StatCard({ label, value, sub, color = '#FF2D55' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="border border-[#1e1e1e] bg-[#0D0D0D] p-5">
      <p className="text-[#444] text-[10px] uppercase tracking-widest mb-2">{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-[#444] text-xs mt-1">{sub}</p>}
    </div>
  );
}

function FunnelBar({ label, pct, count }: { label: string; pct: number; count: number }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-[#555] mb-1">
        <span>{label}</span>
        <span>{count}명 ({pct}%)</span>
      </div>
      <div className="w-full h-2 bg-[#1a1a1a]">
        <div className="h-full bg-[#FF2D55]" style={{ width: `${pct}%`, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [sessionTimes, setSessionTimes] = useState<number[]>([]);
  const [fetchState, setFetchState] = useState<keyof typeof LOADING_STATES>('idle');

  useEffect(() => {
    if (sessionStorage.getItem('toxic_admin_auth') === '1') setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;

    setFetchState('loading');
    fetch('/api/events', { headers: { 'x-admin-key': ADMIN_KEY } })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        setEvents(data.events || []);
        setSessionTimes(data.times || []);
        setFetchState('idle');
      })
      .catch(() => {
        // 서버 실패 시 localStorage 폴백
        try {
          const raw = localStorage.getItem(EVENTS_KEY);
          if (raw) setEvents(JSON.parse(raw));
          const timesRaw = localStorage.getItem('toxic_session_times');
          if (timesRaw) setSessionTimes(JSON.parse(timesRaw));
        } catch {}
        setFetchState('error');
      });
  }, [authed]);

  const handleLogin = () => {
    if (pw === ADMIN_KEY) {
      sessionStorage.setItem('toxic_admin_auth', '1');
      setAuthed(true);
    } else {
      alert('잘못된 비밀번호입니다');
    }
  };

  const handleClear = () => {
    if (confirm('모든 분석 데이터 + 유료 잠금 상태를 초기화할까요?')) {
      localStorage.removeItem(EVENTS_KEY);
      localStorage.removeItem('toxic_session_times');
      localStorage.removeItem('toxic_unlocked_all');
      ['s01', 's02', 's03', 's04', 's05', 's06'].forEach(id => localStorage.removeItem(`toxic_unlocked_${id}`));
      setEvents([]);
      setSessionTimes([]);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="w-full max-w-xs">
          <p className="text-[#FF2D55] text-xs uppercase tracking-widest mb-6 text-center">TOXIC ADMIN</p>
          <input
            type="password"
            placeholder="관리자 비밀번호"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full bg-[#0D0D0D] border border-[#1e1e1e] px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF2D55] mb-3"
          />
          <button onClick={handleLogin}
            className="w-full py-3 gradient-red text-white text-sm font-semibold">
            로그인
          </button>
        </div>
      </div>
    );
  }

  const stats = computeStats(events);
  const avgSession = sessionTimes.length
    ? Math.round(sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length / 1000)
    : 0;

  const relationTotal = Object.values(stats.relationBreakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="min-h-screen bg-bg max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[#FF2D55] text-[10px] uppercase tracking-widest mb-1">TOXIC ADMIN</p>
          <h1 className="text-white text-2xl font-bold">시장검증 대시보드</h1>
          {fetchState === 'loading' && <p className="text-[#444] text-xs mt-1">데이터 불러오는 중...</p>}
          {fetchState === 'error' && <p className="text-[#F59E0B] text-xs mt-1">서버 연결 실패 — 로컬 데이터 표시 중 (Vercel에 ADMIN_SECRET=1229 env 설정 필요)</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={handleClear}
            className="px-3 py-2 border border-[#1e1e1e] text-[#444] text-xs hover:border-[#FF2D55]/40 hover:text-[#FF2D55] transition-colors">
            초기화
          </button>
          <button onClick={() => navigate('/')}
            className="px-3 py-2 border border-[#1e1e1e] text-[#444] text-xs hover:text-white transition-colors">
            홈
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="border border-[#1e1e1e] p-10 text-center">
          <p className="text-[#333] text-sm">아직 수집된 데이터가 없습니다</p>
          <p className="text-[#222] text-xs mt-2">유저가 서비스를 이용하면 자동으로 집계됩니다</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* 핵심 지표 */}
          <div>
            <p className="text-[#333] text-[10px] uppercase tracking-widest mb-3">핵심 지표</p>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="전체 방문" value={stats.landingViews} sub="랜딩 페이지 진입" color="#fff" />
              <StatCard label="분석 완료율" value={`${stats.completionRate}%`} sub={`${stats.resultViews}명 완료`} />
              <StatCard label="평균 체류시간" value={`${avgSession}초`} sub="분석 완료 기준" color="#BF5AF2" />
              <StatCard label="평균 독성지수" value={stats.avgToxicScore} sub="/ 100점" color="#F59E0B" />
            </div>
          </div>

          {/* 퍼널 */}
          <div className="border border-[#1e1e1e] bg-[#0D0D0D] p-5">
            <p className="text-[#333] text-[10px] uppercase tracking-widest mb-4">전환 퍼널</p>
            <FunnelBar label="랜딩 진입" pct={100} count={stats.landingViews} />
            <FunnelBar label="내 정보 입력 완료" pct={stats.dropoff.step1} count={stats.step1Complete} />
            <FunnelBar label="관계 선택 완료" pct={stats.dropoff.step2} count={stats.step2Complete} />
            <FunnelBar label="결과 확인" pct={stats.dropoff.step3} count={stats.step3Complete} />
          </div>

          {/* 관계 유형 */}
          {Object.keys(stats.relationBreakdown).length > 0 && (
            <div className="border border-[#1e1e1e] bg-[#0D0D0D] p-5">
              <p className="text-[#333] text-[10px] uppercase tracking-widest mb-4">관계 유형 분포</p>
              {Object.entries(stats.relationBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([rel, cnt]) => (
                  <FunnelBar
                    key={rel}
                    label={rel}
                    pct={Math.round((cnt / relationTotal) * 100)}
                    count={cnt}
                  />
                ))}
            </div>
          )}

          {/* 유료 전환 검증 */}
          <div>
            <p className="text-[#333] text-[10px] uppercase tracking-widest mb-3">유료 전환 검증</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <StatCard label="페이월 노출" value={stats.paywallImpressions} sub="결과 화면 진입 수" color="#fff" />
              <StatCard label="페이월 클릭" value={stats.paywallClicks} sub="잠금 해제 버튼" color="#F59E0B" />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <StatCard label="개별 결제" value={`${stats.sectionPays}회`} sub={`₩${stats.sectionRevenue.toLocaleString()}`} color="#FF2D55" />
              <StatCard label="전체 결제" value={`${stats.allPays}회`} sub={`₩${stats.allRevenue.toLocaleString()}`} color="#BF5AF2" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="총 매출" value={`₩${stats.totalRevenue.toLocaleString()}`} sub="개별+전체 합산" color="#FF2D55" />
              <StatCard label="CTR" value={`${stats.paywallCTR}%`} sub="노출→클릭" color="#BF5AF2" />
              <StatCard label="전환율" value={`${stats.paywallConversion}%`} sub="클릭→결제" color="#F59E0B" />
            </div>
          </div>

          {/* 기타 행동 */}
          <div>
            <p className="text-[#333] text-[10px] uppercase tracking-widest mb-3">기타 행동</p>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="상대 생략" value={stats.skipTarget} sub="역산 모드" color="#888" />
              <StatCard label="공유 시도" value={stats.shareAttempts} sub="카카오·링크·이미지" color="#BF5AF2" />
              <StatCard label="재분석" value={stats.resets} sub="처음부터 다시" color="#888" />
            </div>
          </div>

          {/* 후기 */}
          <div>
            <p className="text-[#333] text-[10px] uppercase tracking-widest mb-3">유저 후기</p>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="후기 제출" value={stats.reviewSubmits} sub="결과 페이지 제출 수" color="#BF5AF2" />
              <StatCard label="평균 별점" value={stats.avgReviewStars} sub="/ 5.0" color="#F59E0B" />
            </div>
          </div>

          {/* 최근 이벤트 로그 */}
          <div className="border border-[#1e1e1e] bg-[#0D0D0D] p-5">
            <p className="text-[#333] text-[10px] uppercase tracking-widest mb-4">최근 이벤트 (최신순)</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...events].reverse().slice(0, 50).map((e, i) => (
                <div key={i} className="flex items-center gap-3 text-xs border-b border-[#111] pb-2 last:border-0">
                  <span className="text-[#333] flex-shrink-0">{new Date(e.ts).toLocaleTimeString('ko-KR')}</span>
                  <span className="text-[#FF2D55] flex-shrink-0">{e.event}</span>
                  {e.props && <span className="text-[#444] truncate">{JSON.stringify(e.props)}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
