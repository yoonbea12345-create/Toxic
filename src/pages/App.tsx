import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PersonData, RelationType, SajuResult } from '../utils/saju';
import { analyzeSaju } from '../utils/saju';
import StepInput from '../components/StepInput';
import StepRelation from '../components/StepRelation';
import StepLoading from '../components/StepLoading';
import StepResult from '../components/StepResult';

type Step = 'my-info' | 'relation' | 'target-info' | 'loading' | 'result';

export default function AppPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('my-info');
  const [myData, setMyData] = useState<PersonData | null>(null);
  const [relationType, setRelationType] = useState<RelationType>('연인');
  const [targetData, setTargetData] = useState<PersonData | null>(null);
  const [result, setResult] = useState<SajuResult | null>(null);

  const handleMyInfo = (data: PersonData) => {
    setMyData(data);
    setStep('relation');
  };

  const handleRelation = (rel: RelationType) => {
    setRelationType(rel);
    setStep('target-info');
  };

  const handleTargetInfo = (data: PersonData) => {
    setTargetData(data);
    setStep('loading');
    setTimeout(() => {
      if (myData) {
        const res = analyzeSaju(myData, data, relationType);
        setResult(res);
        setStep('result');
      }
    }, 2800);
  };

  const handleReset = () => {
    setMyData(null);
    setTargetData(null);
    setResult(null);
    setStep('my-info');
  };

  const stepNumber = { 'my-info': 1, 'relation': 2, 'target-info': 3, 'loading': 4, 'result': 5 };
  const showProgress = step !== 'loading' && step !== 'result';

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border px-4 py-4 flex items-center justify-between max-w-lg mx-auto">
        <button onClick={() => navigate('/')} className="hover:opacity-80 transition-opacity">
          <img src="/logo.svg" alt="TOXIC" className="h-14 object-contain" />
        </button>
        {showProgress && (
          <div className="flex gap-1.5">
            {[1, 2, 3].map(n => (
              <div
                key={n}
                className={`h-1 rounded-full transition-all duration-300 ${n <= stepNumber[step] ? 'bg-accent-red w-6' : 'bg-border w-3'}`}
              />
            ))}
          </div>
        )}
      </header>

      <main>
        {step === 'my-info' && (
          <StepInput
            title="먼저 내 사주를 분석할게요"
            onNext={handleMyInfo}
          />
        )}
        {step === 'relation' && (
          <StepRelation onNext={handleRelation} />
        )}
        {step === 'target-info' && (
          <StepInput
            title="상대방 정보를 입력해주세요"
            subtitle="상대방 시간을 모르면 '몰라요'를 선택하세요"
            onNext={handleTargetInfo}
            isTarget
          />
        )}
        {step === 'loading' && <StepLoading />}
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
