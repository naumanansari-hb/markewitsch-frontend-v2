import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  CalendarDays,
  CalendarRange,
  SunMedium,
  Info,
  X,
  AlertTriangle,
} from 'lucide-react';
import { DailyScheduleItem, ScheduleDetails } from '../types';

interface ScheduleSectionProps {
  schedule: ScheduleDetails;
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleDetails>>;
}

const STANDARD_DURATIONS = [4, 8, 10, 24];

// Utility to calculate hour difference between "HH:MM" and "HH:MM"
export const computeTimeDiffHours = (startStr: string, endStr: string): number => {
  if (!startStr || !endStr) return 8;
  try {
    const [startH, startM = 0] = startStr.split(':').map(Number);
    const [endH, endM = 0] = endStr.split(':').map(Number);
    if (isNaN(startH) || isNaN(endH)) return 8;
    const startTotalMin = startH * 60 + startM;
    const endTotalMin = endH * 60 + endM;
    let diff = endTotalMin - startTotalMin;
    if (diff <= 0) diff += 24 * 60; // overnight fallback
    return Number((diff / 60).toFixed(1));
  } catch {
    return 8;
  }
};

// Calculate estimated end time given start time and duration hours directly
export const calculateEndTime = (startStr: string, durationHours: number): string => {
  if (!startStr) return '15:00';
  try {
    const [startH, startM = 0] = startStr.split(':').map(Number);
    if (isNaN(startH)) return '15:00';
    
    const totalMinutes = Math.round(startH * 60 + startM + durationHours * 60);
    const endH = Math.floor((totalMinutes / 60) % 24);
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  } catch {
    return '15:00';
  }
};

// Formatter for weekday name
export const getWeekdayName = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { weekday: 'long' });
};

export const formatShortDateWithDay = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// Generate list of dates between start and end inclusive
const generateDateRangeList = (
  startStr: string,
  endStr: string,
  commonDuration: number,
  commonStart: string,
  commonEnd: string,
  existingDays: DailyScheduleItem[]
): DailyScheduleItem[] => {
  if (!startStr || !endStr) return [];
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return [
      {
        id: 'cd-0',
        date: startStr || '2026-08-24',
        durationHours: commonDuration || 8,
        preferredStartTime: commonStart,
        startTime: commonStart,
        endTime: commonEnd,
        hours: commonDuration || 8,
      },
    ];
  }

  const existingMap = new Map(existingDays.map((d) => [d.date, d]));
  const result: DailyScheduleItem[] = [];
  const curr = new Date(start);
  let idx = 0;

  while (curr <= end && idx < 30) {
    const dateFormatted = curr.toISOString().split('T')[0];
    const existing = existingMap.get(dateFormatted);
    const durationHours = existing ? existing.durationHours : (commonDuration || 8);
    const startTime = existing ? existing.startTime : commonStart;
    const endTime = existing ? existing.endTime : commonEnd;
    const preferredStartTime = existing ? existing.preferredStartTime : commonStart;

    result.push({
      id: `cd-${idx}-${dateFormatted}`,
      date: dateFormatted,
      durationHours,
      preferredStartTime,
      startTime,
      endTime,
      hours: durationHours,
    });

    curr.setDate(curr.getDate() + 1);
    idx++;
  }

  return result;
};

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  schedule,
  setSchedule,
}) => {
  // State to control visibility of the break compliance information modal/drawer/callout
  const [showBreakInfo, setShowBreakInfo] = useState<boolean>(false);

  // Modal state for confirming schedule type or day structure changes
  const [pendingChange, setPendingChange] = useState<{
    type: 'durationType' | 'multiDayType';
    targetValue: string;
  } | null>(null);

  // Sync overall calculation on any parameter change
  useEffect(() => {
    let total = 0;
    if (schedule.durationType === 'single-day') {
      total = schedule.workingDurationHours || 8;
    } else if (schedule.multiDayType === 'consecutive') {
      if (schedule.customizeIndividualConsecutive && schedule.consecutiveDays.length > 0) {
        total = schedule.consecutiveDays.reduce((acc, d) => acc + (d.durationHours || d.hours || 8), 0);
      } else {
        const hoursPerDay = schedule.commonDurationHours || schedule.workingDurationHours || 8;
        total = (schedule.consecutiveDays.length || 1) * hoursPerDay;
      }
    } else {
      total = schedule.selectedDates.reduce((acc, d) => acc + (d.durationHours || d.hours || 8), 0);
    }

    if (total !== schedule.totalPlannedHours) {
      setSchedule((prev) => ({ ...prev, totalPlannedHours: Number(total.toFixed(1)) }));
    }
  }, [
    schedule.durationType,
    schedule.multiDayType,
    schedule.workingDurationHours,
    schedule.commonDurationHours,
    schedule.customizeIndividualConsecutive,
    schedule.consecutiveDays,
    schedule.selectedDates,
  ]);

  // Request to switch duration type (Single day <-> Multiple days)
  const handleRequestDurationTypeChange = (newType: 'single-day' | 'multi-day') => {
    if (schedule.durationType === newType) return;
    setPendingChange({
      type: 'durationType',
      targetValue: newType,
    });
  };

  // Request to switch day structure (Consecutive <-> Selected dates)
  const handleRequestMultiDayTypeChange = (newType: 'consecutive' | 'custom-dates') => {
    if (schedule.multiDayType === newType) return;
    setPendingChange({
      type: 'multiDayType',
      targetValue: newType,
    });
  };

  // Confirm schedule type change and reset relevant details
  const confirmScheduleTypeChange = () => {
    if (!pendingChange) return;

    if (pendingChange.type === 'durationType') {
      const isSingle = pendingChange.targetValue === 'single-day';
      const defaultStart = schedule.preferredStartTime || schedule.startTime || '07:00';
      const defaultDuration = 8;
      const defaultEnd = calculateEndTime(defaultStart, defaultDuration);

      if (isSingle) {
        setSchedule((prev) => ({
          ...prev,
          durationType: 'single-day',
          duration: 'Single day job',
          workingDurationHours: defaultDuration,
          preferredStartTime: defaultStart,
          startTime: defaultStart,
          endTime: defaultEnd,
          totalPlannedHours: defaultDuration,
          showDetailedShiftPlanning: false,
        }));
      } else {
        const startDate = prevDateOrToday(schedule.liftDate || '2026-08-24');
        const endDateObj = new Date(startDate);
        endDateObj.setDate(endDateObj.getDate() + 3);
        const endDate = endDateObj.toISOString().split('T')[0];
        const newConsecutive = generateDateRangeList(
          startDate,
          endDate,
          defaultDuration,
          defaultStart,
          defaultEnd,
          []
        );

        setSchedule((prev) => ({
          ...prev,
          durationType: 'multi-day',
          duration: 'Multiple days',
          multiDayType: 'consecutive',
          startDate,
          endDate,
          commonDurationHours: defaultDuration,
          commonPreferredStartTime: defaultStart,
          commonStartTime: defaultStart,
          commonEndTime: defaultEnd,
          consecutiveDays: newConsecutive,
          customizeIndividualConsecutive: false,
          totalPlannedHours: Number((newConsecutive.length * defaultDuration).toFixed(1)),
        }));
      }
    } else if (pendingChange.type === 'multiDayType') {
      const defaultStart = schedule.commonPreferredStartTime || schedule.preferredStartTime || '07:00';
      const defaultDuration = schedule.commonDurationHours || 8;
      const defaultEnd = calculateEndTime(defaultStart, defaultDuration);

      if (pendingChange.targetValue === 'consecutive') {
        const startDate = schedule.startDate || '2026-08-24';
        const endDate = schedule.endDate || '2026-08-27';
        const newConsecutive = generateDateRangeList(
          startDate,
          endDate,
          defaultDuration,
          defaultStart,
          defaultEnd,
          []
        );
        setSchedule((prev) => ({
          ...prev,
          multiDayType: 'consecutive',
          commonDurationHours: defaultDuration,
          commonPreferredStartTime: defaultStart,
          commonStartTime: defaultStart,
          commonEndTime: defaultEnd,
          consecutiveDays: newConsecutive,
          customizeIndividualConsecutive: false,
          totalPlannedHours: Number((newConsecutive.length * defaultDuration).toFixed(1)),
        }));
      } else {
        // Switch to custom-dates
        const baseDate = schedule.startDate || '2026-08-24';
        const initialDates: DailyScheduleItem[] = [
          {
            id: `sd-1-${Date.now()}`,
            date: baseDate,
            durationHours: defaultDuration,
            preferredStartTime: defaultStart,
            startTime: defaultStart,
            endTime: defaultEnd,
            hours: defaultDuration,
          },
          {
            id: `sd-2-${Date.now()}`,
            date: getOffsetDate(baseDate, 2),
            durationHours: defaultDuration,
            preferredStartTime: defaultStart,
            startTime: defaultStart,
            endTime: defaultEnd,
            hours: defaultDuration,
          },
        ];
        setSchedule((prev) => ({
          ...prev,
          multiDayType: 'custom-dates',
          selectedDates: initialDates,
          totalPlannedHours: Number((initialDates.length * defaultDuration).toFixed(1)),
        }));
      }
    }

    setPendingChange(null);
  };

  const cancelScheduleTypeChange = () => {
    setPendingChange(null);
  };

  // Helper for dates
  function prevDateOrToday(dStr: string) {
    if (!dStr) return '2026-08-24';
    return dStr;
  }

  function getOffsetDate(dStr: string, days: number) {
    const d = new Date(dStr || '2026-08-24');
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  // Handle single-day duration chip selection
  // When user selects work duration: autofill start time & end time in exact operating window
  const handleSingleDurationSelect = (duration: number) => {
    const safeDuration = Math.max(1, Math.min(24, duration));
    const startTime = schedule.preferredStartTime || schedule.startTime || '07:00';
    const computedEnd = calculateEndTime(startTime, safeDuration);

    setSchedule((prev) => ({
      ...prev,
      workingDurationHours: safeDuration,
      preferredStartTime: startTime,
      startTime,
      endTime: computedEnd,
      totalPlannedHours: safeDuration,
    }));
  };

  // Handle preferred start time change:
  // Autofill start time and end time in exact operating window with duration calc
  const handlePreferredStartTimeChange = (val: string) => {
    const duration = schedule.workingDurationHours || schedule.totalPlannedHours || 8;
    const computedEnd = calculateEndTime(val || '07:00', duration);
    setSchedule((prev) => ({
      ...prev,
      preferredStartTime: val,
      startTime: val || '07:00',
      endTime: computedEnd,
    }));
  };

  // Detailed shift planning: Start / End time inputs
  // If user modifies in detail planning any time -> overrides total planned hours & workingDurationHours.
  // The chip gets deselected if not in [4, 8, 10, 24], and shows selected if it matches.
  const handleDetailedStartTimeChange = (val: string) => {
    const computedHours = computeTimeDiffHours(val, schedule.endTime || '15:00');
    setSchedule((prev) => ({
      ...prev,
      startTime: val,
      preferredStartTime: val,
      workingDurationHours: computedHours,
      totalPlannedHours: computedHours,
    }));
  };

  const handleDetailedEndTimeChange = (val: string) => {
    const computedHours = computeTimeDiffHours(schedule.startTime || '07:00', val);
    setSchedule((prev) => ({
      ...prev,
      endTime: val,
      workingDurationHours: computedHours,
      totalPlannedHours: computedHours,
    }));
  };

  // Handle consecutive date range changes
  const handleRangeStartDateChange = (startDate: string) => {
    const updatedDays = generateDateRangeList(
      startDate,
      schedule.endDate,
      schedule.commonDurationHours || 8,
      schedule.commonStartTime || '07:00',
      schedule.commonEndTime || '15:00',
      schedule.consecutiveDays
    );
    setSchedule((prev) => ({
      ...prev,
      startDate,
      consecutiveDays: updatedDays,
    }));
  };

  const handleRangeEndDateChange = (endDate: string) => {
    const updatedDays = generateDateRangeList(
      schedule.startDate,
      endDate,
      schedule.commonDurationHours || 8,
      schedule.commonStartTime || '07:00',
      schedule.commonEndTime || '15:00',
      schedule.consecutiveDays
    );
    setSchedule((prev) => ({
      ...prev,
      endDate,
      consecutiveDays: updatedDays,
    }));
  };

  // Consecutive: common duration chip selection
  const handleCommonDurationSelect = (duration: number) => {
    const safeDuration = Math.max(1, Math.min(24, duration));
    const startTime = schedule.commonPreferredStartTime || schedule.commonStartTime || '07:00';
    const computedEnd = calculateEndTime(startTime, safeDuration);

    const updatedDays = schedule.consecutiveDays.map((d) => ({
      ...d,
      durationHours: safeDuration,
      hours: safeDuration,
      preferredStartTime: startTime,
      startTime: d.startTime || startTime,
      endTime: calculateEndTime(d.startTime || startTime, safeDuration),
    }));

    setSchedule((prev) => ({
      ...prev,
      commonDurationHours: safeDuration,
      commonStartTime: startTime,
      commonEndTime: computedEnd,
      consecutiveDays: updatedDays,
      totalPlannedHours: Number((updatedDays.length * safeDuration).toFixed(1)),
    }));
  };

  // Consecutive: common preferred start time
  const handleCommonPreferredStartChange = (val: string) => {
    const duration = schedule.commonDurationHours || 8;
    const computedEnd = calculateEndTime(val || '07:00', duration);
    const updatedDays = schedule.consecutiveDays.map((d) => ({
      ...d,
      preferredStartTime: val,
      startTime: val || d.startTime || '07:00',
      endTime: calculateEndTime(val || d.startTime || '07:00', d.durationHours || duration),
    }));

    setSchedule((prev) => ({
      ...prev,
      commonPreferredStartTime: val,
      commonStartTime: val || prev.commonStartTime || '07:00',
      commonEndTime: computedEnd,
      consecutiveDays: updatedDays,
    }));
  };

  // Handle individual day time edit for consecutive days:
  // Duration is auto-calculated based on start & end time
  const handleConsecutiveDayTimeChange = (
    index: number,
    field: 'startTime' | 'endTime',
    val: string
  ) => {
    const updated = [...schedule.consecutiveDays];
    if (updated[index]) {
      const start = field === 'startTime' ? val : updated[index].startTime;
      const end = field === 'endTime' ? val : updated[index].endTime;
      const hours = computeTimeDiffHours(start, end);
      updated[index] = {
        ...updated[index],
        [field]: val,
        durationHours: hours,
        hours,
      };

      // Calculate new total planned hours
      const newTotal = updated.reduce((acc, d) => acc + (d.durationHours || 8), 0);

      // Check if all days still have identical duration matching a standard chip
      const allSame = updated.every((d) => d.durationHours === hours);
      // If not all same, reset commonDurationHours to 0 / undefined so no chip is selected
      const newCommonDuration = allSame ? hours : 0;

      setSchedule((prev) => ({
        ...prev,
        consecutiveDays: updated,
        customizeIndividualConsecutive: true,
        commonDurationHours: newCommonDuration,
        totalPlannedHours: Number(newTotal.toFixed(1)),
      }));
    }
  };

  // Selected dates: common duration chip selection
  const handleSelectedDatesCommonDurationSelect = (duration: number) => {
    const safeDuration = Math.max(1, Math.min(24, duration));
    const startTime = schedule.commonPreferredStartTime || schedule.preferredStartTime || '07:00';

    const updatedDates = schedule.selectedDates.map((d) => {
      const dayStart = d.startTime || d.preferredStartTime || startTime;
      return {
        ...d,
        durationHours: safeDuration,
        hours: safeDuration,
        startTime: dayStart,
        endTime: calculateEndTime(dayStart, safeDuration),
      };
    });

    setSchedule((prev) => ({
      ...prev,
      commonDurationHours: safeDuration,
      workingDurationHours: safeDuration,
      selectedDates: updatedDates,
      totalPlannedHours: Number((updatedDates.length * safeDuration).toFixed(1)),
    }));
  };

  // Selected dates: common preferred start time change
  const handleSelectedDatesPreferredStartChange = (val: string) => {
    const duration = schedule.commonDurationHours || schedule.workingDurationHours || 8;
    const updatedDates = schedule.selectedDates.map((d) => ({
      ...d,
      preferredStartTime: val,
      startTime: val || '07:00',
      endTime: calculateEndTime(val || '07:00', d.durationHours || duration),
    }));

    setSchedule((prev) => ({
      ...prev,
      commonPreferredStartTime: val,
      preferredStartTime: val,
      selectedDates: updatedDates,
    }));
  };

  // Selected-dates list handling
  const handleAddSelectedDate = () => {
    const lastDateStr =
      schedule.selectedDates[schedule.selectedDates.length - 1]?.date || '2026-08-24';
    const nextDate = new Date(lastDateStr);
    nextDate.setDate(nextDate.getDate() + 2);
    const newDateFormatted = nextDate.toISOString().split('T')[0];
    const defaultStart =
      schedule.commonPreferredStartTime || schedule.preferredStartTime || '07:00';
    const defaultDuration =
      schedule.commonDurationHours || schedule.workingDurationHours || 8;
    const defaultEnd = calculateEndTime(defaultStart, defaultDuration);

    const newItem: DailyScheduleItem = {
      id: `sd-${Date.now()}`,
      date: newDateFormatted,
      durationHours: defaultDuration,
      preferredStartTime: defaultStart,
      startTime: defaultStart,
      endTime: defaultEnd,
      hours: defaultDuration,
    };

    setSchedule((prev) => {
      const nextList = [...prev.selectedDates, newItem];
      const newTotal = nextList.reduce((acc, d) => acc + (d.durationHours || 8), 0);
      return {
        ...prev,
        selectedDates: nextList,
        totalPlannedHours: Number(newTotal.toFixed(1)),
      };
    });
  };

  const handleRemoveSelectedDate = (index: number) => {
    if (schedule.selectedDates.length <= 2) return;
    const updated = schedule.selectedDates.filter((_, i) => i !== index);
    const newTotal = updated.reduce((acc, d) => acc + (d.durationHours || 8), 0);
    setSchedule((prev) => ({
      ...prev,
      selectedDates: updated,
      totalPlannedHours: Number(newTotal.toFixed(1)),
    }));
  };

  const handleSelectedDateChange = (index: number, dateStr: string) => {
    const updated = [...schedule.selectedDates];
    if (updated[index]) {
      updated[index] = { ...updated[index], date: dateStr };
      setSchedule((prev) => ({ ...prev, selectedDates: updated }));
    }
  };

  const handleSelectedDateTimeChange = (
    index: number,
    field: 'startTime' | 'endTime',
    val: string
  ) => {
    const updated = [...schedule.selectedDates];
    if (updated[index]) {
      const start = field === 'startTime' ? val : updated[index].startTime;
      const end = field === 'endTime' ? val : updated[index].endTime;
      const hours = computeTimeDiffHours(start, end);
      updated[index] = {
        ...updated[index],
        [field]: val,
        durationHours: hours,
        hours,
      };

      const newTotal = updated.reduce((acc, d) => acc + (d.durationHours || 8), 0);
      const allSame = updated.every((d) => d.durationHours === hours);
      const newCommonDuration = allSame ? hours : 0;

      setSchedule((prev) => ({
        ...prev,
        selectedDates: updated,
        commonDurationHours: newCommonDuration,
        workingDurationHours: newCommonDuration,
        totalPlannedHours: Number(newTotal.toFixed(1)),
      }));
    }
  };

  const currentDuration = schedule.workingDurationHours;
  const currentConsecutiveDuration = schedule.commonDurationHours;
  const currentSelectedDatesDuration = schedule.commonDurationHours || schedule.workingDurationHours;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6 relative">
      {/* Header with Title, Planned Duration Badge and Break Info Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-[#c01823]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 font-heading">
                Schedule & Working Duration
              </h2>
              {/* Subtle info icon trigger for break compliance */}
              <button
                type="button"
                onClick={() => setShowBreakInfo((prev) => !prev)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Break time compliance information"
                aria-label="Break time compliance information"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 font-body">
              Define lift dates, operational duration, and preferred timings
            </p>
          </div>
        </div>

        {/* Dynamic Planned Duration Telemetry Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-full font-body shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Total duration: <strong className="text-emerald-700 font-bold">{schedule.totalPlannedHours} hrs</strong>
            </span>
            {schedule.durationType === 'multi-day' && (
              <span className="text-emerald-600 font-medium text-[11px] border-l border-emerald-300 pl-2">
                {schedule.multiDayType === 'consecutive'
                  ? `${schedule.consecutiveDays.length} days`
                  : `${schedule.selectedDates.length} days`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Break Time Compliance Modal / Non-highlighted Collapsible Info Card */}
      {showBreakInfo && (
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-slate-900 block">
                Break-Time Consideration
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                The break time shall be included in the planned hours as per the defined statutory compliance regulations. You do not need to specify separate break intervals.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowBreakInfo(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirmation Modal for changing Schedule Type or Day Structure */}
      {pendingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Change Schedule Type?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Changing the schedule type will reset the current schedule details. Continue?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={cancelScheduleTypeChange}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmScheduleTypeChange}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#c01823] hover:bg-[#a5131c] rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Duration Requirement (One day vs Multiple days) */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700">
          Duration requirement <span className="text-[#c01823]">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2.5 max-w-sm">
          <button
            type="button"
            onClick={() => handleRequestDurationTypeChange('single-day')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              schedule.durationType === 'single-day'
                ? 'bg-red-50/70 border-[#c01823] text-[#c01823] font-semibold shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SunMedium className={`w-3.5 h-3.5 ${schedule.durationType === 'single-day' ? 'text-[#c01823]' : 'text-slate-400'}`} />
            <span>One day</span>
          </button>

          <button
            type="button"
            onClick={() => handleRequestDurationTypeChange('multi-day')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              schedule.durationType === 'multi-day'
                ? 'bg-red-50/70 border-[#c01823] text-[#c01823] font-semibold shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CalendarDays className={`w-3.5 h-3.5 ${schedule.durationType === 'multi-day' ? 'text-[#c01823]' : 'text-slate-400'}`} />
            <span>Multiple days</span>
          </button>
        </div>
      </div>

      {/* Case A: One Day */}
      {schedule.durationType === 'single-day' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Field 1: Lift Date */}
              <div className="md:col-span-4 space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Lift date <span className="text-[#c01823]">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                    <input
                      type="date"
                      value={schedule.liftDate}
                      onChange={(e) =>
                        setSchedule((prev) => ({ ...prev, liftDate: e.target.value }))
                      }
                      className="w-full pl-8 pr-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                    />
                  </div>
                  {schedule.liftDate && (
                    <span className="px-2 py-2 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-medium text-slate-600 shrink-0">
                      {getWeekdayName(schedule.liftDate).slice(0, 3)}
                    </span>
                  )}
                </div>
              </div>

              {/* Field 2: Working Duration Chips */}
              <div className="md:col-span-5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Working duration <span className="text-[#c01823]">*</span>
                  </label>
                  <span className="text-[11px] font-bold text-emerald-700">
                    {currentDuration && currentDuration > 0 ? `${currentDuration} hrs total` : `${schedule.totalPlannedHours || 8} hrs total`}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {STANDARD_DURATIONS.map((hrs) => {
                    const isSelected = currentDuration === hrs;
                    return (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => handleSingleDurationSelect(hrs)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#c01823] text-white font-semibold shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {hrs} hrs
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 3: Preferred Start Time */}
              <div className="md:col-span-3 space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Preferred start time
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  <input
                    type="time"
                    value={schedule.startTime || schedule.preferredStartTime || '07:00'}
                    onChange={(e) => handlePreferredStartTimeChange(e.target.value)}
                    placeholder="07:00"
                    className="w-full pl-8 pr-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Expandable Section for Detailed Shift Planning (Exact Start / End times) */}
            <div className="pt-3 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() =>
                  setSchedule((prev) => ({
                    ...prev,
                    showDetailedShiftPlanning: !prev.showDetailedShiftPlanning,
                  }))
                }
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer select-none"
              >
                {schedule.showDetailedShiftPlanning ? (
                  <ChevronUp className="w-4 h-4 text-[#c01823]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
                <span>
                  {schedule.showDetailedShiftPlanning
                    ? 'Hide detailed shift planning'
                    : 'Detail planning: specify exact start & end times (optional)'}
                </span>
              </button>

              {schedule.showDetailedShiftPlanning && (
                <div className="mt-3 p-3.5 bg-white rounded-lg border border-slate-200 space-y-2 animate-in fade-in-50 duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">
                        Exact operating window
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Setting exact start and end times automatically synchronizes the total working duration.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="time"
                          value={schedule.startTime || '07:00'}
                          onChange={(e) => handleDetailedStartTimeChange(e.target.value)}
                          className="pl-2 pr-2 py-1.5 border border-slate-200 rounded-md text-xs font-mono bg-white"
                        />
                      </div>
                      <span className="text-slate-400 font-semibold">→</span>
                      <div className="relative">
                        <input
                          type="time"
                          value={schedule.endTime || '15:00'}
                          onChange={(e) => handleDetailedEndTimeChange(e.target.value)}
                          className="pl-2 pr-2 py-1.5 border border-slate-200 rounded-md text-xs font-mono bg-white"
                        />
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        {currentDuration && currentDuration > 0 ? `${currentDuration}h` : `${schedule.totalPlannedHours || 8}h`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Case B: Multiple Days */}
      {schedule.durationType === 'multi-day' && (
        <div className="space-y-4">
          {/* Day Structure - Segmented control */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Day structure <span className="text-[#c01823]">*</span>
            </label>
            <div className="inline-flex p-1 bg-slate-100/90 rounded-lg border border-slate-200/80 gap-1">
              <button
                type="button"
                onClick={() => handleRequestMultiDayTypeChange('consecutive')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  schedule.multiDayType === 'consecutive'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5 text-[#c01823]" />
                <span>Consecutive dates</span>
              </button>

              <button
                type="button"
                onClick={() => handleRequestMultiDayTypeChange('custom-dates')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  schedule.multiDayType === 'custom-dates'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5 text-[#c01823]" />
                <span>Selected dates</span>
              </button>
            </div>
          </div>

          {/* Sub-branch B1: Consecutive Dates */}
          {schedule.multiDayType === 'consecutive' && (
            <div className="space-y-3">
              <div className="p-4 sm:p-5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Date range picker with day count */}
                  <div className="md:col-span-5 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700">
                        Date range (Start → End) <span className="text-[#c01823]">*</span>
                      </label>
                      <span className="text-[11px] font-medium text-slate-500">
                        {schedule.consecutiveDays.length} days
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-1 flex items-center gap-1">
                        <div className="relative flex-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                          <input
                            type="date"
                            value={schedule.startDate}
                            onChange={(e) => handleRangeStartDateChange(e.target.value)}
                            className="w-full pl-8 pr-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                          />
                        </div>
                        {schedule.startDate && (
                          <span className="px-1.5 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-medium text-slate-600 shrink-0">
                            {getWeekdayName(schedule.startDate).slice(0, 3)}
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 text-xs shrink-0">→</span>
                      <div className="relative flex-1 flex items-center gap-1">
                        <div className="relative flex-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                          <input
                            type="date"
                            value={schedule.endDate}
                            onChange={(e) => handleRangeEndDateChange(e.target.value)}
                            className="w-full pl-8 pr-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                          />
                        </div>
                        {schedule.endDate && (
                          <span className="px-1.5 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-medium text-slate-600 shrink-0">
                            {getWeekdayName(schedule.endDate).slice(0, 3)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Daily Working Duration */}
                  <div className="md:col-span-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700">
                        Working duration per day <span className="text-[#c01823]">*</span>
                      </label>
                      <span className="text-[11px] font-bold text-emerald-700">
                        {currentConsecutiveDuration && currentConsecutiveDuration > 0
                          ? `${currentConsecutiveDuration} hrs/day`
                          : 'Custom / Variable'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {STANDARD_DURATIONS.map((hrs) => {
                        const isSelected = currentConsecutiveDuration === hrs;
                        return (
                          <button
                            key={hrs}
                            type="button"
                            onClick={() => handleCommonDurationSelect(hrs)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#c01823] text-white font-semibold shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {hrs} hrs
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred Start Time */}
                  <div className="md:col-span-3 space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Preferred start time
                    </label>
                    <div className="relative">
                      <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                      <input
                        type="time"
                        value={schedule.commonPreferredStartTime || '07:00'}
                        onChange={(e) => handleCommonPreferredStartChange(e.target.value)}
                        placeholder="07:00"
                        className="w-full pl-8 pr-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Collapsible toggle to modify duration & exact times for specific dates */}
                <div className="pt-3 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() =>
                      setSchedule((prev) => ({
                        ...prev,
                        customizeIndividualConsecutive: !prev.customizeIndividualConsecutive,
                      }))
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                  >
                    {schedule.customizeIndividualConsecutive ? (
                      <ChevronUp className="w-4 h-4 text-[#c01823]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                    <span>
                      {schedule.customizeIndividualConsecutive
                        ? 'Hide detailed daily schedule'
                        : 'Detail planning: customize duration & exact times for specific dates'}
                    </span>
                  </button>

                  {schedule.customizeIndividualConsecutive && (
                    <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                      {schedule.consecutiveDays.map((day, idx) => (
                        <div
                          key={day.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-mono font-semibold">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-slate-800">
                              {formatShortDateWithDay(day.date)}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-500">Operating window:</span>
                              <input
                                type="time"
                                value={day.startTime || '07:00'}
                                onChange={(e) =>
                                  handleConsecutiveDayTimeChange(idx, 'startTime', e.target.value)
                                }
                                className="p-1 px-1.5 border border-slate-200 rounded text-xs font-mono bg-white"
                              />
                              <span className="text-slate-400 font-semibold">→</span>
                              <input
                                type="time"
                                value={day.endTime || '15:00'}
                                onChange={(e) =>
                                  handleConsecutiveDayTimeChange(idx, 'endTime', e.target.value)
                                }
                                className="p-1 px-1.5 border border-slate-200 rounded text-xs font-mono bg-white"
                              />
                            </div>

                            {/* Auto-calculated duration badge */}
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] text-slate-500">Duration:</span>
                              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold rounded text-xs">
                                {day.durationHours || 8}h
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sub-branch B2: Selected Dates */}
          {schedule.multiDayType === 'custom-dates' && (
            <div className="space-y-3">
              <div className="p-4 sm:p-5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-4">
                {/* Global Working Duration & Preferred Start for Selected Dates */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pb-3 border-b border-slate-200/80">
                  {/* Daily Working Duration */}
                  <div className="md:col-span-7 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700">
                        Working duration per day <span className="text-[#c01823]">*</span>
                      </label>
                      <span className="text-[11px] font-bold text-emerald-700">
                        {currentSelectedDatesDuration && currentSelectedDatesDuration > 0
                          ? `${currentSelectedDatesDuration} hrs/day`
                          : 'Custom / Variable'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {STANDARD_DURATIONS.map((hrs) => {
                        const isSelected = currentSelectedDatesDuration === hrs;
                        return (
                          <button
                            key={hrs}
                            type="button"
                            onClick={() => handleSelectedDatesCommonDurationSelect(hrs)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#c01823] text-white font-semibold shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {hrs} hrs
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred Start Time */}
                  <div className="md:col-span-5 space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Preferred start time
                    </label>
                    <div className="relative">
                      <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                      <input
                        type="time"
                        value={schedule.commonPreferredStartTime || schedule.preferredStartTime || '07:00'}
                        onChange={(e) => handleSelectedDatesPreferredStartChange(e.target.value)}
                        placeholder="07:00"
                        className="w-full pl-8 pr-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Selected Dates List & Add Date action */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Individual dates & operating windows ({schedule.selectedDates.length})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddSelectedDate}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#c01823] hover:text-[#991b1b] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add another date</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {schedule.selectedDates.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-xl border border-slate-200 gap-2.5 text-xs"
                      >
                        {/* Date input with weekday name badge */}
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-mono font-semibold shrink-0">
                            {idx + 1}
                          </span>
                          <div className="relative flex-1 max-w-[170px]">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                            <input
                              type="date"
                              value={item.date}
                              onChange={(e) => handleSelectedDateChange(idx, e.target.value)}
                              className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                            />
                          </div>
                          <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            {getWeekdayName(item.date).slice(0, 3)}
                          </span>
                        </div>

                        {/* Start & End Times with Auto-calculated Duration */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-slate-500">Operating window:</span>
                            <input
                              type="time"
                              value={item.startTime || item.preferredStartTime || '07:00'}
                              onChange={(e) =>
                                handleSelectedDateTimeChange(idx, 'startTime', e.target.value)
                              }
                              className="p-1 px-1.5 border border-slate-200 rounded text-xs font-mono bg-white"
                            />
                            <span className="text-slate-400 font-semibold">→</span>
                            <input
                              type="time"
                              value={item.endTime || '15:00'}
                              onChange={(e) =>
                                handleSelectedDateTimeChange(idx, 'endTime', e.target.value)
                              }
                              className="p-1 px-1.5 border border-slate-200 rounded text-xs font-mono bg-white"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-slate-500">Duration:</span>
                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold rounded text-xs">
                              {item.durationHours || item.hours || 8}h
                            </span>
                          </div>

                          {/* Delete button (kept for selected dates because dates are individual) */}
                          <button
                            type="button"
                            onClick={() => handleRemoveSelectedDate(idx)}
                            disabled={schedule.selectedDates.length <= 2}
                            className={`p-1.5 rounded-lg transition-colors ${
                              schedule.selectedDates.length <= 2
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                            }`}
                            title={
                              schedule.selectedDates.length <= 2
                                ? 'Multiple days schedule requires at least 2 selected dates'
                                : 'Remove date'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Flexibility Checkbox */}
      <div className="pt-2 border-t border-slate-100">
        <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 select-none group">
          <input
            type="checkbox"
            checked={schedule.isFlexible}
            onChange={(e) =>
              setSchedule((prev) => ({ ...prev, isFlexible: e.target.checked }))
            }
            className="w-4 h-4 text-[#c01823] rounded border-slate-300 focus:ring-red-500 accent-[#c01823]"
          />
          <span className="font-medium group-hover:text-slate-900">
            My requested date is flexible / negotiable
          </span>
        </label>
      </div>
    </div>
  );
};


