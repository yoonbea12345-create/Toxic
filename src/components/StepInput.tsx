import { useState } from 'react';
import type { PersonData } from '../utils/saju';

const RELATION_COLORS: Record<string, string> = {
  '연인': '#FF2D55',
  '친구': '#30D158',
  '직장': '#BF5AF2',
  '가족': '#FF9500',
};

const TWELVE_SI = [
  { label: '자시', hanja: '子', hour: 0,  range: '밤 11~새벽 1시' },
  { label: '축시', hanja: '丑', hour: 2,  range: '새벽 1~3시' },
  { label: '인시', hanja: '寅', hour: 4,  range: '새벽 3~5시' },
  { label: '묘시', hanja: '卯', hour: 6,  range: '새벽 5~7시' },
  { label: '진시', hanja: '辰', hour: 8,  range: '아침 7~9시' },
  { label: '사시', hanja: '巳', hour: 10, range: '아침 9~11시' },
  { label: '오시', hanja: '午', hour: 12, range: '낮 11~오후 1시' },
  { label: '미시', hanja: '未', hour: 14, range: '오후 1~3시' },
  { label: '신시', hanja: '申', hour: 16, range: '오후 3~5시' },
  { label: '유시', hanja: '酉', hour: 18, range: '오후 5~7시' },
  { label: '술시', hanja: '戌', hour: 20, range: '저녁 7~9시' },
  { label: '해시', hanja: '亥', hour: 22, range: '밤 9~11시' },
];

function hourToSiIndex(h: number): number {
  if (h === 0 || h === 23) return 0;
  return Math.ceil(h / 2);
}

interface StepInputProps {
  title: string;
  subtitle?: string;
  stepNumber?: number;
  onNext: (data: PersonData) => void;
  onSkip?: () => void;
  isTarget?: boolean;
  relationType?: string;
  initialData?: PersonData;
}

export default function StepInput({ title, subtitle, stepNumber, onNext, onSkip, isTarget = false, relationType, initialData }: StepInputProps) {
  const parseYear  = (bd: string) => bd?.split('-')[0] ?? '';
  const parseMonth = (bd: string) => bd?.split('-')[1]?.replace(/^0/, '') ?? '';
  const parseDay   = (bd: string) => bd?.split('-')[2]?.replace(/^0/, '') ?? '';
  const parseHour  = (bt: string) => bt ? Number(bt.split(':')[0]) : 0;

  const [data, setData] = useState<PersonData>(initialData ?? { name: '', birthdate: '', birthtime: '', gender: '여' });
  const [selectedYear,  setSelectedYear]  = useState(initialData ? parseYear(initialData.birthdate) : '');
  const [selectedMonth, setSelectedMonth] = useState(initialData ? parseMonth(initialData.birthdate) : '');
  const [selectedDay,   setSelectedDay]   = useState(initialData ? parseDay(initialData.birthdate) : '');
  const [unknownTime,   setUnknownTime]   = useState(initialData ? !initialData.birthtime : true);
  const [selectedSiIndex, setSelectedSiIndex] = useState<number | null>(
    initialData?.birthtime ? hourToSiIndex(parseHour(initialData.birthtime)) : null
  );
  const [isLunar, setIsLunar] = useState(false);
  const [yearError, setYearError] = useState('');

  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getDays = (year: string, month: string) => {
    if (!year || !month) return Array.from({ length: 31 }, (_, i) => i + 1);
    return Array.from({ length: new Date(+year, +month, 0).getDate() }, (_, i) => i + 1);
  };

  const isReady = !yearError && (isTarget ? true : (!!selectedYear && !!selectedMonth && !!selectedDay));

  const accuracyLevel = !selectedYear ? null
    : !selectedMonth ? 'year'
    : !selectedDay   ? 'month'
    : 'day';

  const accuracyInfo: Record<string, { label: string; color: string }> = {
    year:  { label: '기본 분석', color: '#9E9E9E' },
    month: { label: '심화 분석', color: '#FF9800' },
    day:   { label: '정밀 분석', color: '#2196F3' },
  };

  const handleSubmit = () => {
    let fullDate = '';
    if (selectedYear) {
      if (selectedDay && selectedMonth) {
        fullDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
      } else if (selectedMonth) {
        fullDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      } else {
        fullDate = selectedYear;
      }
    }
    const birthtimeStr = (!unknownTime && selectedSiIndex !== null)
      ? `${String(TWELVE_SI[selectedSiIndex].hour).padStart(2, '0')}:00`
      : '';
    onNext({ ...data, birthdate: fullDate, birthtime: birthtimeStr });
  };

  return (
    <div className="animate-fade-in max-w-lg mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-text-secondary text-sm font-sans">STEP {stepNumber ?? (isTarget ? 3 : 1)}</p>
          {isTarget && relationType && (() => {
            const color = RELATION_COLORS[relationType] ?? '#888888';
            return (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full border font-sans-kr font-bold"
                style={{ color, borderColor: color + '50', backgroundColor: color + '18' }}
              >
                {relationType}
              </span>
            );
          })()}
        </div>
        <h2 className="font-display text-2xl text-white leading-tight">{title}</h2>
        {subtitle && <p className="text-text-secondary mt-2 text-sm">{subtitle}</p>}
      </div>

      <div className="space-y-5">
        {/* 이름 */}
        <div>
          <label className="block text-text-secondary text-xs mb-2 uppercase tracking-wider">이름 (선택)</label>
          <input
            type="text"
            placeholder={isTarget ? '상대방 이름을 입력하세요' : '이름을 입력하세요'}
            value={data.name}
            onChange={e => setData({ ...data, name: e.target.value })}
            className="w-full bg-card-bg border border-border rounded-sm px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-accent-red transition-colors"
          />
        </div>

        {/* 생년월일 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-text-secondary text-xs uppercase tracking-wider">
                생년월일{isTarget && <span className="text-[#FF2D55] ml-1">— 아는 만큼만 입력</span>}
              </label>
              {/* 양력 / 음력 토글 */}
              <div className="flex border border-border rounded-sm overflow-hidden text-[10px]">
                <button
                  onClick={() => setIsLunar(false)}
                  className={`px-2 py-1 transition-colors ${!isLunar ? 'bg-[#1e1e1e] text-white' : 'text-[#555] hover:text-[#888]'}`}
                >
                  양력
                </button>
                <button
                  onClick={() => setIsLunar(true)}
                  className={`px-2 py-1 border-l border-border transition-colors ${isLunar ? 'bg-[#1e1e1e] text-white' : 'text-[#555] hover:text-[#888]'}`}
                >
                  음력
                </button>
              </div>
            </div>
            {isTarget && accuracyLevel && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0"
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
              type="tel"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              placeholder="출생 연도"
              value={selectedYear}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setSelectedYear(val);
                setSelectedDay('');
                if (val.length === 4 && (Number(val) < 1924 || Number(val) > currentYear)) {
                  setYearError(`1924 ~ ${currentYear} 사이로 입력해주세요`);
                } else {
                  setYearError('');
                }
              }}
              className={`bg-card-bg border rounded-sm px-3 py-3 text-white placeholder-text-secondary focus:outline-none transition-colors ${yearError ? 'border-[#FF9500]' : 'border-border focus:border-accent-red'}`}
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
              title={!selectedMonth ? '월을 먼저 선택해주세요' : undefined}
            >
              <option value="">{!selectedMonth ? '월 선택 후' : isTarget ? '일 (선택)' : '일'}</option>
              {getDays(selectedYear, selectedMonth).map(d => <option key={d} value={d}>{d}일</option>)}
            </select>
          </div>

          {yearError && (
            <p className="text-[#FF9500] text-[11px] mt-1.5 font-sans-kr">{yearError}</p>
          )}

          {/* 음력 안내 */}
          {isLunar && (
            <div className="mt-2 px-3 py-2 border border-[#FF9500]/30 bg-[#FF9500]/5 animate-fade-in">
              <p className="text-[#FF9500] text-[11px] font-sans-kr leading-relaxed">
                음력 날짜는 양력으로 변환 후 입력해주세요.{' '}
                <a
                  href="https://www.sltool.net/lunar_solar.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  양력 변환기 →
                </a>
              </p>
            </div>
          )}

          {/* 정확도 안내 (상대방만) */}
          {isTarget && !isLunar && !yearError && (
            <p className="text-[#555] text-[11px] mt-2 font-sans-kr">
              {!selectedYear
                ? '이름만 알아도 분석 가능해요'
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
            <div className="flex items-center justify-between mb-3">
              <label className="text-text-secondary text-xs uppercase tracking-wider">태어난 시간</label>
              <div className="flex border border-border rounded-sm overflow-hidden text-xs">
                <button
                  onClick={() => setUnknownTime(true)}
                  className={`px-3 py-1.5 transition-colors ${unknownTime ? 'bg-[#1e1e1e] text-white' : 'text-text-secondary hover:text-[#aaa]'}`}
                >
                  모름
                </button>
                <button
                  onClick={() => setUnknownTime(false)}
                  className={`px-3 py-1.5 border-l border-border transition-colors ${!unknownTime ? 'bg-accent-red text-white' : 'text-text-secondary hover:text-[#aaa]'}`}
                >
                  직접 입력
                </button>
              </div>
            </div>

            {!unknownTime && (
              <div className="animate-fade-in">
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {TWELVE_SI.map((si, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSiIndex(idx)}
                      className={`py-2.5 px-1 border text-center transition-all ${
                        selectedSiIndex === idx
                          ? 'border-accent-red bg-accent-red/10 text-white'
                          : 'border-border text-text-secondary hover:border-accent-red/40 hover:text-white'
                      }`}
                    >
                      <p className="font-sans-kr text-xs font-medium">{si.label}</p>
                      <p className="text-[#555] text-[9px] mt-0.5 leading-tight">{si.range}</p>
                    </button>
                  ))}
                </div>
                {selectedSiIndex !== null ? (
                  <p className="text-center text-[#555] text-[11px] font-sans-kr">
                    {TWELVE_SI[selectedSiIndex].label} — {TWELVE_SI[selectedSiIndex].range}
                  </p>
                ) : (
                  <p className="text-center text-[#333] text-[11px] font-sans-kr">위에서 출생 시간대를 선택해주세요</p>
                )}
              </div>
            )}

            {unknownTime && (
              <p className="text-[#333] text-[11px] font-sans-kr">시간 모르면 년·월·일주 기반으로 분석합니다</p>
            )}
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
          {isTarget ? '상대방과의 사주관계 분석하기 →' : '다음 →'}
        </button>

        {/* 상대방 생일 아예 모를 때 */}
        {isTarget && onSkip && (
          <button
            onClick={onSkip}
            className="w-full py-3 border border-[#333] rounded-sm text-[#666] text-sm hover:border-[#555] hover:text-[#888] transition-all font-sans-kr"
          >
            상대와의 관계 말고 내 위험 유형만 분석하기
          </button>
        )}
      </div>
    </div>
  );
}
