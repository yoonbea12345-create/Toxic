import type { RelationType } from '../utils/saju';

interface StepRelationProps {
  onNext: (relation: RelationType) => void;
}

const relations: { type: RelationType; hanja: string; label: string; desc: string }[] = [
  { type: '연인', hanja: '縁', label: '연인 / 전 연인', desc: '왜 그렇게 터졌는지' },
  { type: '친구', hanja: '友', label: '친구', desc: '왜 멀어졌는지 모르겠는' },
  { type: '직장', hanja: '業', label: '직장 상사 / 동료', desc: '왜 저 사람이랑만 안맞는지' },
  { type: '가족', hanja: '家', label: '가족', desc: '사랑하는데 왜 항상 상처받는지' },
  { type: '기타', hanja: '怨', label: '그냥 싫은 사람', desc: '이유도 모르게 불편한 그 사람' },
];

export default function StepRelation({ onNext }: StepRelationProps) {
  return (
    <div className="animate-fade-in max-w-lg mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-text-secondary text-sm mb-2 font-sans">STEP 2</p>
        <h2 className="font-display text-2xl text-white leading-tight">어떤 관계인가요?</h2>
        <p className="text-text-secondary mt-2 text-sm">분석 결과가 관계 유형에 맞게 해석됩니다</p>
      </div>

      <div className="space-y-3">
        {relations.map(({ type, hanja, label, desc }) => (
          <button
            key={type}
            onClick={() => onNext(type)}
            className="w-full bg-card-bg border border-border rounded-sm p-4 text-left flex items-center gap-4 hover:border-accent-red hover:bg-accent-red/5 transition-all group"
          >
            <span className="font-display text-xl text-[#FF2D55]/50 group-hover:text-[#FF2D55] transition-colors w-8 text-center flex-shrink-0">{hanja}</span>
            <div className="flex-1">
              <div className="font-medium text-white group-hover:text-accent-red transition-colors">{label}</div>
              <div className="text-text-secondary text-sm mt-0.5">{desc}</div>
            </div>
            <span className="text-text-secondary group-hover:text-accent-red transition-colors">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
