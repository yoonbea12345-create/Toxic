import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { SajuResult, RelationType, PersonData } from '../utils/saju';
import StepResult from '../components/StepResult';

interface ShareData {
  myData: PersonData;
  targetData: PersonData;
  relationType: RelationType;
  result: SajuResult;
  aiPhase1: object | null;
  aiPhase2: object | null;
}

export default function ShareResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [shareData, setShareData] = useState<ShareData | null>(null);

  useEffect(() => {
    if (!id) { setError(true); setLoading(false); return; }
    fetch(`/api/share-load?id=${encodeURIComponent(id)}`)
      .then(r => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then(json => {
        if (!json.share) throw new Error('no data');
        const s = json.share;
        setShareData({
          myData: { name: s.my_name || '', birthdate: '', birthtime: '', gender: s.my_gender || '여' },
          targetData: { name: s.target_name || '', birthdate: '', birthtime: '', gender: s.target_gender || '여' },
          relationType: (s.relation_type || '연인') as RelationType,
          result: s.saju_result,
          aiPhase1: s.ai_phase1,
          aiPhase2: s.ai_phase2,
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-[#FF2D55]/20 border-t-[#FF2D55] rounded-full animate-spin" />
      <p className="text-[#555] text-sm font-sans-kr">분석 결과를 불러오는 중...</p>
    </div>
  );

  if (error || !shareData) return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 px-8 text-center">
      <p className="text-[#555] text-sm font-sans-kr leading-relaxed">
        결과를 찾을 수 없어요.<br />링크가 만료됐거나 잘못된 주소예요.
      </p>
      <button
        onClick={() => navigate('/')}
        className="mt-2 px-6 py-3 border border-[#FF2D55]/30 text-[#FF2D55] text-sm font-sans-kr hover:border-[#FF2D55]/60 transition-colors"
      >
        내 분석 해보기 →
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border pl-0 pr-4 flex items-center justify-between max-w-lg mx-auto overflow-hidden" style={{ height: '100px' }}>
        <button onClick={() => navigate('/')} className="hover:opacity-80 transition-opacity flex-shrink-0">
          <img src="/hero-title.svg" alt="TOXIC" className="h-[92px] w-auto block flex-shrink-0" style={{ marginLeft: '-12px' }} />
        </button>
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-[#444] text-[10px] tracking-[0.12em]">사주로 보는 관계의 본질</span>
          <button
            onClick={() => navigate('/app')}
            className="text-[#FF2D55] text-xs hover:opacity-80 transition-opacity font-sans-kr"
          >
            내 분석 해보기 →
          </button>
        </div>
      </header>
      <main>
        <StepResult
          myData={shareData.myData}
          targetData={shareData.targetData}
          relationType={shareData.relationType}
          result={shareData.result}
          shareMode
          preloadedPhase1={shareData.aiPhase1}
          preloadedPhase2={shareData.aiPhase2}
          onReset={() => navigate('/')}
        />
      </main>
    </div>
  );
}
