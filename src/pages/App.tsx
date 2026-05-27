import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';
import { saveHistory } from '../utils/history';
import type { PersonData, RelationType, SajuResult } from '../utils/saju';
import { analyzeSaju } from '../utils/saju';
import StepInput from '../components/StepInput';
import StepRelation from '../components/StepRelation';
import StepResult from '../components/StepResult';

type Step = 'my-info' | 'relation' | 'target-info' | 'result';

const SESSION_KEY = 'toxic_session';

function saveSession(data: object) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch {}
}
function loadSession() {
  try { const raw = sessionStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export default function AppPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const saved = loadSession();
  const locationRelation = (location.state as any)?.relationType as RelationType | undefined;
  const [step, setStep] = useState<Step>(saved?.step ?? 'my-info');
  const [myData, setMyData] = useState<PersonData | null>(saved?.myData ?? null);
  const [relationType, setRelationType] = useState<RelationType>(saved?.relationType ?? locationRelation ?? '연인');
  const [targetData, setTargetData] = useState<PersonData | null>(saved?.targetData ?? null);
  const [result, setResult] = useState<SajuResult | null>(saved?.result ?? null);

  // ?share= 파라미터로 진입 시 결과 바로 복원
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareParam = params.get('share');
    if (!shareParam || saved) return;
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(shareParam))));
      const my: PersonData = { name: decoded.m.n ?? '', birthdate: decoded.m.b ?? '', birthtime: decoded.m.bt ?? '', gender: decoded.m.g ?? '여' };
      const target: PersonData = { name: decoded.t.n ?? '', birthdate: decoded.t.b ?? '', birthtime: decoded.t.bt ?? '', gender: decoded.t.g ?? '여' };
      const rel = (decoded.r ?? '연인') as RelationType;
      const res = analyzeSaju(my, target, rel);
      setMyData(my);
      setTargetData(target);
      setRelationType(rel);
      setResult(res);
      setStep('result');
      // URL에서 share 파라미터 제거
      window.history.replaceState({}, '', window.location.pathname);
    } catch {}
  }, []);

  const handleMyInfo = (data: PersonData) => {
    setMyData(data);
    setStep(locationRelation ? 'target-info' : 'relation');
    trackEvent('step_complete_my-info');
  };

  const handleRelation = (rel: RelationType) => {
    setRelationType(rel);
    setStep('target-info');
    trackEvent('step_complete_relation', { relationType: rel });
  };

  const handleTargetInfo = (data: PersonData) => {
    if (!myData) return;
    setTargetData(data);
    const res = analyzeSaju(myData, data, relationType);
    setResult(res);
    setStep('result');
    saveSession({ step: 'result', myData, relationType, targetData: data, result: res });
    saveHistory({
      myName: myData.name || '나',
      targetName: data.name || '상대',
      score: res.toxicScore,
      relationType,
      conflictType: res.conflictType,
    });
    trackEvent('step_complete_target-info', { toxicScore: res.toxicScore });
  };

  const handleSkipTarget = () => {
    if (!myData) return;
    const emptyTarget: PersonData = { name: '', birthdate: '', birthtime: '', gender: '여' };
    setTargetData(emptyTarget);
    const res = analyzeSaju(myData, emptyTarget, relationType);
    setResult(res);
    setStep('result');
    saveSession({ step: 'result', myData, relationType, targetData: emptyTarget, result: res });
    saveHistory({
      myName: myData.name || '나',
      targetName: '',
      score: res.toxicScore,
      relationType,
      conflictType: res.conflictType,
    });
    trackEvent('step_complete_skip-target', { toxicScore: res.toxicScore });
  };

  const handleBack = () => {
    if (step === 'relation') setStep('my-info');
    else if (step === 'target-info') setStep(locationRelation ? 'my-info' : 'relation');
  };

  // 전체 초기화
  const handleReset = () => {
    setMyData(null);
    setTargetData(null);
    setResult(null);
    setStep('my-info');
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    trackEvent('reset');
  };

  // 내 사주 유지하고 상대만 다시 입력
  const handleResetTarget = () => {
    setTargetData(null);
    setResult(null);
    setStep('target-info');
    trackEvent('reset_target_only');
  };

  const handleLogoClick = () => {
    if (step !== 'my-info' && step !== 'result') {
      if (!window.confirm('입력한 정보가 사라집니다. 메인으로 이동할까요?')) return;
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border pl-0 pr-4 flex items-center justify-between max-w-lg mx-auto overflow-hidden" style={{ height: '100px' }}>
        <button onClick={handleLogoClick} className="hover:opacity-80 transition-opacity flex-shrink-0">
          <img src="/hero-title.svg" alt="TOXIC" className="h-[92px] w-auto block flex-shrink-0" style={{ marginLeft: '-12px' }} />
        </button>
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-[#444] text-[10px] tracking-[0.12em]">사주로 보는 관계의 본질</span>
          {(step === 'relation' || step === 'target-info') && (
            <button
              onClick={handleBack}
              className="text-[#777] text-xs hover:text-white transition-colors"
            >
              ← 이전
            </button>
          )}
        </div>
      </header>

      <main>
        {step === 'my-info' && (
          <StepInput
            title="먼저 내 사주를 분석할게요"
            stepNumber={1}
            onNext={handleMyInfo}
            initialData={myData ?? undefined}
          />
        )}
        {step === 'relation' && (
          <StepRelation onNext={handleRelation} />
        )}
        {step === 'target-info' && (
          <StepInput
            title="상대방 정보를 입력해주세요"
            subtitle="아는 만큼만 입력해도 분석 가능해요"
            stepNumber={3}
            onNext={handleTargetInfo}
            onSkip={handleSkipTarget}
            isTarget
            relationType={relationType}
            initialData={targetData ?? undefined}
          />
        )}
        {step === 'result' && result && myData && targetData && (
          <StepResult
            myData={myData}
            targetData={targetData}
            relationType={relationType}
            result={result}
            onReset={handleReset}
            onResetTarget={handleResetTarget}
          />
        )}
      </main>
    </div>
  );
}
