import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const cleanPaywallEvents = (count = 4) => {
        try {
          const events = JSON.parse(localStorage.getItem('toxic_events') || '[]');
          let removed = 0;
          for (let i = events.length - 1; i >= 0 && removed < count; i--) {
            if (events[i].event === 'paywall_click') {
              events.splice(i, 1);
              removed++;
            }
          }
          localStorage.setItem('toxic_events', JSON.stringify(events));
          console.log(`✓ paywall_click 삭제 완료: ${removed}개`);
          return removed;
        } catch (e) {
          console.error('정리 실패:', e);
          return 0;
        }
      };
      (window as any).cleanPaywallEvents = cleanPaywallEvents;
      cleanPaywallEvents(4);
    }
  }, []);

  const saved = loadSession();
  const [step, setStep] = useState<Step>(saved?.step ?? 'my-info');
  const [myData, setMyData] = useState<PersonData | null>(saved?.myData ?? null);
  const [relationType, setRelationType] = useState<RelationType>(saved?.relationType ?? '연인');
  const [targetData, setTargetData] = useState<PersonData | null>(saved?.targetData ?? null);
  const [result, setResult] = useState<SajuResult | null>(saved?.result ?? null);

  const handleMyInfo = (data: PersonData) => {
    setMyData(data);
    setStep('relation');
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
    else if (step === 'target-info') setStep('relation');
  };

  const handleReset = () => {
    setMyData(null);
    setTargetData(null);
    setResult(null);
    setStep('my-info');
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    trackEvent('reset');
  };


  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border pl-0 pr-4 flex items-center justify-between max-w-lg mx-auto overflow-hidden" style={{ height: '100px' }}>
        <button onClick={() => navigate('/')} className="hover:opacity-80 transition-opacity flex-shrink-0">
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
          />
        )}
        {step === 'result' && result && myData && targetData && (
          <StepResult
            myData={myData}
            targetData={targetData}
            relationType={relationType}
            result={result}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}
