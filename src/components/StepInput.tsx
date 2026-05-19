import { useState } from 'react';
import type { PersonData } from '../utils/saju';

interface StepInputProps {
  title: string;
  subtitle?: string;
  stepNumber?: number;
  onNext: (data: PersonData) => void;
  onSkip?: () => void;
  isTarget?: boolean;
}

export default function StepInput({ title, subtitle, stepNumber, onNext, onSkip, isTarget = false }: StepInputProps) {
  const [data, setData] = useState<PersonData>({ name: '', birthdate: '', birthtime: '', gender: '여' });
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [unknownTime, setUnknownTime] = useState(false);

  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getDays = (year: string, month: string) => {
    if (!year || !month) return Array.from({ length: 31 }, (_, i) => i + 1);
    return Array.from({ length: new Date(+year, +month, 0).getDate() }, (_, i) => i + 1);
  };

  // 상대방은 이름 또는 연도 중 하나만 있어도 진행 가능 (둘 다 없어도 OK)
  const isReady = isTarget ? true : (!!selectedYear && !!selectedMonth && !!selectedDay);

  // 정확도 레벨 계산
  const accuracyLevel = !selectedYear ? null
    : !selectedMonth ? 'year'
    : !selectedDay ? 'month'
    : 'day';

  const accuracyInfo: Record<string, { label: string; color: string; desc: string }> = {
    year: { label: '기본 분석', color: '#9E9E9E', desc: '년주 기반 · 연도만 입력됨' },
    month: { label: '심화 분석', color: '#FF9800', desc: '년·월주 기반' },
    day: { label: '정밀 분석', color: '#2196F3', desc: '년·월·일주 기반' },
  };

  const handleSubmit = () => {
    let fullDate = '';
    if (selectedYear) {
      let dateStr = selectedYear;
      if (selectedMonth) dateStr += `-${String(selectedMonth).padStart(2, '0')}`;
      fullDate = selectedDay
        ? dateStr + `-${String(selectedDay).padStart(2, '0')}`
        : selectedMonth
          ? `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
          : `${selectedYear}-06-01`;
    }
    onNext({ ...data, birthdate: fullDate, birthtime: unknownTime ? '' : (data.birthtime || '') });
  };

  return (
    <div className="animate-fade-in max-w-lg mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-text-secondary text-sm mb-2 font-sans">STEP {stepNumber ?? (isTarget ? 3 : 1)}</p>
        <h2 className="font-serif-kr text-2xl font-bold text-white leading-tight">{title}</h2>
        {subtitle && <p className="text-text-secondary mt-2 text-sm">{subtitle}</p>}
      </div>

      <div className="space-y-5">
        {/* 이름 */}
        <div>
          <label className="block text-text-secondary text-xs mb-2 uppercase tracking-wider">이름 (선택)</label>
          <input
            type="text"
            placeholder={isTarget ? "상대방 이름을 입력하세요" : "이름을 입력하세요"}
            value={data.name}
            onChange={e => setData({ ...data, name: e.target.value })}
            className="w-full bg-card-bg border border-border rounded-sm px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-accent-red transition-colors"
          />
        </div>

        {/* 생년월일 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-text-secondary text-xs uppercase tracking-wider">
              생년월일{isTarget && <span className="text-[#FF2D55] ml-1">— 아는 만큼만 입력</span>}
            </label>
            {isTarget && accuracyLevel && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                style={{
                  color: accuracyInfo[accuracyLevel].color,
                  borderColor: accuracyInfo[accuracyLevel].color + '40',
                  backgroundColor: accuracyInfo[accuracyLevel].color + '15',
                }}
              >
                {accuracyInfo[accuracyLevel].label}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              placeholder="출생 연도"
              min={1924}
              max={currentYear}
              value={selectedYear}
              onChange={e => { setSelectedYear(e.target.value); setSelectedDay(''); }}
              className="bg-card-bg border border-border rounded-sm px-3 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-accent-red transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <select
              value={selectedMonth}
              onChange={e => { setSelectedMonth(e.target.value); setSelectedDay(''); }}
              className="bg-card-bg border border-border rounded-sm px-3 py-3 text-white focus:outline-none focus:border-accent-red transition-colors appearance-none cursor-pointer"
            >
              <option value="">{isTarget ? '월 (선택)' : '월'}</option>
              {months.map(m => <option key={m} value={m}>{m}월</option>)}
            </select>
            <select
              value={selectedDay}
              onChange={e => setSelectedDay(e.target.value)}
              disabled={!selectedMonth}
              className="bg-card-bg border border-border rounded-sm px-3 py-3 text-white focus:outline-none focus:border-accent-red transition-colors appearance-none cursor-pointer disabled:opacity-40"
            >
              <option value="">{isTarget ? '일 (선택)' : '일'}</option>
              {getDays(selectedYear, selectedMonth).map(d => <option key={d} value={d}>{d}일</option>)}
            </select>
          </div>

          {/* 정확도 안내 (상대방만) */}
          {isTarget && (
            <p className="text-[#555] text-[11px] mt-2 font-sans-kr">
              {!selectedYear
                ? '연도만 알아도 분석 가능해요'
                : !selectedMonth
                  ? '월까지 입력하면 더 정밀한 분석이 가능해요'
                  : !selectedDay
                    ? '일까지 입력하면 일주(日柱) 분석이 추가돼요'
                    : '생년월일 기반 정밀 분석이 가능해요'}
            </p>
          )}
        </div>

        {/* 태어난 시간 (내 정보만) */}
        {!isTarget && (
          <div>
            <label className="block text-text-secondary text-xs mb-2 uppercase tracking-wider">태어난 시간</label>
            <div className="flex gap-2 items-center">
              <input
                type="time"
                value={data.birthtime}
                onChange={e => setData({ ...data, birthtime: e.target.value })}
                disabled={unknownTime}
                className="flex-1 bg-card-bg border border-border rounded-sm px-4 py-3 text-white focus:outline-none focus:border-accent-red transition-colors disabled:opacity-40"
              />
              <button
                onClick={() => setUnknownTime(!unknownTime)}
                className={`px-4 py-3 rounded-sm text-sm border transition-all ${unknownTime ? 'border-accent-red text-accent-red bg-accent-red/10' : 'border-border text-text-secondary hover:border-accent-red/50'}`}
              >
                몰라요
              </button>
            </div>
          </div>
        )}

        {/* 성별 */}
        <div>
          <label className="block text-text-secondary text-xs mb-2 uppercase tracking-wider">성별</label>
          <div className="grid grid-cols-2 gap-2">
            {(['남', '여'] as const).map(g => (
              <button
                key={g}
                onClick={() => setData({ ...data, gender: g })}
                className={`py-3 rounded-sm border text-sm font-medium transition-all ${data.gender === g
                  ? 'border-accent-red bg-accent-red/10 text-accent-red'
                  : 'border-border text-text-secondary hover:border-accent-red/40'}`}
              >
                {g === '남' ? '남자' : '여자'}
              </button>
            ))}
          </div>
        </div>

        {/* 다음 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!isReady}
          className="w-full py-4 mt-2 gradient-red rounded-sm text-white font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {isTarget
            ? (accuracyLevel === 'year' ? '연도로 분석하기 →' : !selectedYear && !data.name ? '이름 없이 분석하기 →' : '다음 →')
            : '다음 →'}
        </button>

        {/* 상대방 생일 아예 모를 때 */}
        {isTarget && onSkip && (
          <button
            onClick={onSkip}
            className="w-full py-3 border border-[#333] rounded-sm text-[#666] text-sm hover:border-[#555] hover:text-[#888] transition-all font-sans-kr"
          >
            상대 생일을 전혀 몰라요 → 내 위험 유형만 분석
          </button>
        )}
      </div>
    </div>
  );
}
