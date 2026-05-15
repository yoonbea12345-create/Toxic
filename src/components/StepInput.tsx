import { useState } from 'react';
import type { PersonData } from '../utils/saju';

interface StepInputProps {
  title: string;
  subtitle?: string;
  onNext: (data: PersonData) => void;
  isTarget?: boolean;
}

export default function StepInput({ title, subtitle, onNext, isTarget = false }: StepInputProps) {
  const [data, setData] = useState<PersonData>({
    name: '',
    birthdate: '',
    birthtime: '',
    gender: '여',
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [unknownTime, setUnknownTime] = useState(false);

  const getDays = (year: string, month: string) => {
    if (!year || !month) return Array.from({ length: 31 }, (_, i) => i + 1);
    const d = new Date(parseInt(year), parseInt(month), 0).getDate();
    return Array.from({ length: d }, (_, i) => i + 1);
  };

  const handleSubmit = () => {
    if (!selectedYear || !selectedMonth || !selectedDay) return;
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    onNext({ ...data, birthdate: dateStr, birthtime: unknownTime ? '모름' : (data.birthtime || '00:00') });
  };

  const isReady = selectedYear && selectedMonth && selectedDay;

  return (
    <div className="animate-fade-in max-w-lg mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-text-secondary text-sm mb-2 font-sans">{isTarget ? 'STEP 3' : 'STEP 1'}</p>
        <h2 className="font-serif-kr text-2xl font-bold text-white leading-tight">{title}</h2>
        {subtitle && <p className="text-text-secondary mt-2 text-sm">{subtitle}</p>}
      </div>

      <div className="space-y-5">
        {!isTarget && (
          <div>
            <label className="block text-text-secondary text-xs mb-2 uppercase tracking-wider">이름 (선택)</label>
            <input
              type="text"
              placeholder="이름을 입력하세요"
              value={data.name}
              onChange={e => setData({ ...data, name: e.target.value })}
              className="w-full bg-card-bg border border-border rounded-sm px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-accent-red transition-colors"
            />
          </div>
        )}

        <div>
          <label className="block text-text-secondary text-xs mb-2 uppercase tracking-wider">생년월일</label>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={selectedYear}
              onChange={e => { setSelectedYear(e.target.value); setSelectedDay(''); }}
              className="bg-card-bg border border-border rounded-sm px-3 py-3 text-white focus:outline-none focus:border-accent-red transition-colors appearance-none cursor-pointer"
            >
              <option value="">년도</option>
              {years.map(y => <option key={y} value={y}>{y}년</option>)}
            </select>
            <select
              value={selectedMonth}
              onChange={e => { setSelectedMonth(e.target.value); setSelectedDay(''); }}
              className="bg-card-bg border border-border rounded-sm px-3 py-3 text-white focus:outline-none focus:border-accent-red transition-colors appearance-none cursor-pointer"
            >
              <option value="">월</option>
              {months.map(m => <option key={m} value={m}>{m}월</option>)}
            </select>
            <select
              value={selectedDay}
              onChange={e => setSelectedDay(e.target.value)}
              className="bg-card-bg border border-border rounded-sm px-3 py-3 text-white focus:outline-none focus:border-accent-red transition-colors appearance-none cursor-pointer"
            >
              <option value="">일</option>
              {getDays(selectedYear, selectedMonth).map(d => <option key={d} value={d}>{d}일</option>)}
            </select>
          </div>
        </div>

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

        <button
          onClick={handleSubmit}
          disabled={!isReady}
          className="w-full py-4 mt-4 gradient-red rounded-sm text-white font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          다음 →
        </button>
      </div>
    </div>
  );
}
