import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { AppStep } from '../types';

interface InquiryStepperProps {
  currentStep: AppStep;
  onNavigateToStep?: (step: AppStep) => void;
}

export const InquiryStepper: React.FC<InquiryStepperProps> = ({
  currentStep,
  onNavigateToStep,
}) => {
  // Only show on inquiry wizard steps (1, 2, 3)
  if (
    currentStep !== 'job-details' &&
    currentStep !== 'lift-planner' &&
    currentStep !== 'crane-recommendations'
  ) {
    return null;
  }

  const getStepNumber = (): number => {
    switch (currentStep) {
      case 'job-details':
        return 1;
      case 'lift-planner':
        return 2;
      case 'crane-recommendations':
        return 3;
      default:
        return 1;
    }
  };

  const activeIndex = getStepNumber();

  const steps = [
    {
      stepNum: 1,
      id: 'job-details' as AppStep,
      title: 'Basic Details',
      subtitle: 'Location & lifting',
      renderGraphic: (isActive: boolean, isCompleted: boolean) => (
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="circleClip1">
              <circle cx="120" cy="120" r="114" />
            </clipPath>
            <linearGradient id="skyGrad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>

          <g clipPath="url(#circleClip1)">
            {/* Background Sky / Map */}
            <rect width="240" height="240" fill="url(#skyGrad1)" />

            {/* Road Network Grid */}
            <path
              d="M 10 40 Q 60 80 110 50 T 230 70 M 30 110 Q 90 100 140 130 T 240 100 M 70 10 Q 80 80 90 150 M 170 20 Q 150 90 180 150 M 40 190 Q 120 160 200 190"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="4 4"
              fill="none"
              opacity="0.6"
            />

            {/* Dashed Red Route Connection Line */}
            <path
              d="M 46 60 C 70 58, 85 102, 120 92 C 150 82, 165 92, 185 82"
              stroke="#c01823"
              strokeWidth="4"
              strokeDasharray="6 4"
              fill="none"
              strokeLinecap="round"
            />

            {/* Map Pin 1 (Origin) */}
            <g transform="translate(32, 38)">
              <path
                d="M 14 0 C 6.3 0 0 6.3 0 14 C 0 22 14 34 14 34 C 14 34 28 22 28 14 C 28 6.3 21.7 0 14 0 Z"
                fill="#c01823"
              />
              <circle cx="14" cy="13" r="5.5" fill="#ffffff" />
            </g>

            {/* Map Pin 2 (Destination) */}
            <g transform="translate(172, 60)">
              <path
                d="M 14 0 C 6.3 0 0 6.3 0 14 C 0 22 14 34 14 34 C 14 34 28 22 28 14 C 28 6.3 21.7 0 14 0 Z"
                fill="#c01823"
              />
              <circle cx="14" cy="13" r="5.5" fill="#ffffff" />
            </g>

            {/* Road */}
            <path d="M 0 155 Q 120 145 240 152 L 240 240 L 0 240 Z" fill="#475569" />
            <path d="M 0 152 Q 120 142 240 149" stroke="#94a3b8" strokeWidth="4" fill="none" />
            <path
              d="M 0 195 Q 120 185 240 192"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeDasharray="16 12"
              fill="none"
              opacity="0.9"
            />

            {/* Motion Lines */}
            <line x1="12" y1="116" x2="36" y2="116" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
            <line x1="8" y1="126" x2="32" y2="126" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />

            {/* Mobile Crane in Transit */}
            <g transform="translate(38, 96)">
              <path d="M 12 10 L 132 18 L 132 38 L 12 28 Z" fill="#c01823" stroke="#7f1d1d" strokeWidth="2" />
              <rect x="130" y="16" width="18" height="24" rx="2" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1.5" />
              <text x="76" y="30" fill="#ffffff" fontSize="15" fontWeight="900" fontStyle="italic" fontFamily="sans-serif">M</text>

              <path d="M 12 40 L 140 42 L 140 66 L 8 66 L 8 46 Z" fill="#c01823" stroke="#7f1d1d" strokeWidth="2" />
              <path d="M 88 34 L 136 36 L 138 66 L 88 66 Z" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1.5" />
              <path d="M 94 38 L 132 40 L 132 52 L 94 50 Z" fill="#e0f2fe" stroke="#334155" strokeWidth="1.5" />

              {[24, 48, 72, 98].map((wheelX, i) => (
                <g key={i} transform={`translate(${wheelX}, 66)`}>
                  <circle cx="0" cy="0" r="11" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                  <circle cx="0" cy="0" r="6" fill="#64748b" />
                  <circle cx="0" cy="0" r="2.5" fill="#e2e8f0" />
                </g>
              ))}
            </g>
          </g>

          {/* Outer Border Ring */}
          <circle
            cx="120"
            cy="120"
            r="114"
            stroke={isActive ? '#c01823' : isCompleted ? '#16a34a' : '#cbd5e1'}
            strokeWidth={isActive ? '8' : '5'}
            fill="none"
          />
        </svg>
      ),
    },
    {
      stepNum: 2,
      id: 'lift-planner' as AppStep,
      title: 'Technical Measurements',
      subtitle: 'Lift radius & dimensions',
      renderGraphic: (isActive: boolean, isCompleted: boolean) => (
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="circleClip2">
              <circle cx="120" cy="120" r="114" />
            </clipPath>
            <linearGradient id="skyGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>

          <g clipPath="url(#circleClip2)">
            <rect width="240" height="240" fill="url(#skyGrad2)" />

            {/* Outrigger Blueprint Diagram */}
            <g transform="translate(72, 16)">
              <rect x="0" y="8" width="96" height="56" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" rx="2" />
              <text x="48" y="5" fill="#475569" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">8,0 m</text>
              <text x="-10" y="38" fill="#475569" fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">7,5 m</text>

              <rect x="38" y="26" width="20" height="20" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
              <circle cx="48" cy="36" r="6" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
              <line x1="38" y1="26" x2="10" y2="12" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="58" y1="26" x2="86" y2="12" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="38" y1="46" x2="10" y2="60" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="58" y1="46" x2="86" y2="60" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
            </g>

            {/* Area & Checklist */}
            <g transform="translate(178, 22)">
              <text x="0" y="8" fill="#334155" fontSize="9" fontWeight="bold" fontFamily="monospace">A = 160 m²</text>
              <rect x="0" y="14" width="8" height="8" stroke="#c01823" strokeWidth="1.2" fill="#fee2e2" />
              <path d="M 1.5 18 L 3.5 20.5 L 6.5 15.5" stroke="#c01823" strokeWidth="1.5" fill="none" />
              <line x1="12" y1="18" x2="32" y2="18" stroke="#94a3b8" strokeWidth="1.5" />
              <rect x="0" y="26" width="8" height="8" stroke="#c01823" strokeWidth="1.2" fill="#fee2e2" />
              <path d="M 1.5 30 L 3.5 32.5 L 6.5 27.5" stroke="#c01823" strokeWidth="1.5" fill="none" />
              <line x1="12" y1="30" x2="32" y2="30" stroke="#94a3b8" strokeWidth="1.5" />
            </g>

            {/* Ground */}
            <line x1="0" y1="185" x2="240" y2="185" stroke="#94a3b8" strokeWidth="2.5" />
            <rect x="0" y="186" width="240" height="54" fill="#e2e8f0" />

            {/* Timber Pads */}
            <rect x="18" y="180" width="36" height="7" fill="#b45309" stroke="#78350f" strokeWidth="1" rx="1" />
            <rect x="88" y="188" width="36" height="7" fill="#b45309" stroke="#78350f" strokeWidth="1" rx="1" />
            <rect x="168" y="180" width="36" height="7" fill="#b45309" stroke="#78350f" strokeWidth="1" rx="1" />

            {/* Crane Parked on Outriggers */}
            <g transform="translate(24, 86)">
              {/* Counterweights */}
              <g transform="translate(2, 22)">
                {[0, 6, 12, 18, 24, 30].map((y, i) => (
                  <rect key={i} x="0" y={y} width="30" height="5.5" fill="#dc2626" stroke="#991b1b" strokeWidth="1" rx="0.5" />
                ))}
              </g>

              {/* Telescopic Boom */}
              <path d="M 32 36 L 164 42 L 164 62 L 32 54 Z" fill="#c01823" stroke="#7f1d1d" strokeWidth="2" />
              <text x="96" y="55" fill="#ffffff" fontSize="15" fontWeight="900" fontStyle="italic" fontFamily="sans-serif">M</text>

              {/* Lower Carrier */}
              <path d="M 32 64 L 158 64 L 158 86 L 28 86 Z" fill="#c01823" stroke="#7f1d1d" strokeWidth="2" />
              <path d="M 112 54 L 158 56 L 158 86 L 112 86 Z" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1.5" />
              <path d="M 118 58 L 152 60 L 152 72 L 118 70 Z" fill="#e0f2fe" stroke="#334155" strokeWidth="1.5" />

              {/* Wheels */}
              {[46, 68, 92, 116].map((wx, i) => (
                <circle key={i} cx={wx} cy="86" r="10" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
              ))}

              {/* Deployed Outrigger Jacks with Warning Stripes */}
              <g transform="translate(152, 70)">
                <rect x="0" y="0" width="9" height="26" fill="#ffffff" stroke="#334155" strokeWidth="1.2" />
                <path d="M 0 5 L 9 10 M 0 12 L 9 17 M 0 19 L 9 24" stroke="#dc2626" strokeWidth="3" />
                <rect x="-4" y="25" width="17" height="5" fill="#1e293b" rx="1" />
              </g>
              <g transform="translate(74, 74)">
                <rect x="0" y="0" width="11" height="30" fill="#ffffff" stroke="#334155" strokeWidth="1.5" />
                <path d="M 0 6 L 6 11 L 0 16 M 0 18 L 6 23 L 0 28" stroke="#dc2626" strokeWidth="3.5" fill="none" />
                <rect x="-6" y="30" width="23" height="5" fill="#1e293b" rx="1" />
              </g>
              <g transform="translate(6, 68)">
                <rect x="0" y="0" width="9" height="26" fill="#ffffff" stroke="#334155" strokeWidth="1.2" />
                <path d="M 0 5 L 9 10 M 0 12 L 9 17 M 0 19 L 9 24" stroke="#dc2626" strokeWidth="3" />
                <rect x="-4" y="25" width="17" height="5" fill="#1e293b" rx="1" />
              </g>
            </g>
          </g>

          <circle
            cx="120"
            cy="120"
            r="114"
            stroke={isActive ? '#c01823' : isCompleted ? '#16a34a' : '#cbd5e1'}
            strokeWidth={isActive ? '8' : '5'}
            fill="none"
          />
        </svg>
      ),
    },
    {
      stepNum: 3,
      id: 'crane-recommendations' as AppStep,
      title: 'Crane Recommendation & Pricing',
      subtitle: 'Capacity & pricing',
      renderGraphic: (isActive: boolean, isCompleted: boolean) => (
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="circleClip3">
              <circle cx="120" cy="120" r="114" />
            </clipPath>
            <linearGradient id="skyGrad3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>

          <g clipPath="url(#circleClip3)">
            <rect width="240" height="240" fill="url(#skyGrad3)" />

            {/* Construction Framework */}
            <g transform="translate(130, 75)" stroke="#94a3b8" strokeWidth="1.5" opacity="0.6">
              <line x1="0" y1="0" x2="0" y2="120" />
              <line x1="45" y1="0" x2="45" y2="120" />
              <line x1="90" y1="0" x2="90" y2="120" />
              <line x1="-10" y1="20" x2="100" y2="20" strokeWidth="2" />
              <line x1="-10" y1="60" x2="100" y2="60" strokeWidth="2" />
              <line x1="-10" y1="100" x2="100" y2="100" strokeWidth="2" />
            </g>

            {/* Checkmark Circle in Sky */}
            <g transform="translate(64, 26)">
              <circle cx="22" cy="22" r="20" fill="#ffffff" stroke="#475569" strokeWidth="3.5" />
              <path d="M 13 22 L 20 29 L 31 15" stroke="#334155" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <line x1="22" y1="-3" x2="22" y2="-7" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
              <line x1="40" y1="3" x2="44" y2="-1" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            </g>

            <line x1="0" y1="195" x2="240" y2="195" stroke="#94a3b8" strokeWidth="2.5" />
            <rect x="0" y="196" width="240" height="44" fill="#e2e8f0" />

            {/* Crane Lifting Load */}
            <g transform="translate(18, 92)">
              <path d="M 18 68 L 128 68 L 128 88 L 12 88 Z" fill="#c01823" stroke="#7f1d1d" strokeWidth="2" />
              <path d="M 88 58 L 128 60 L 128 88 L 88 88 Z" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1.5" />
              <path d="M 94 62 L 122 64 L 122 74 L 94 72 Z" fill="#e0f2fe" stroke="#334155" strokeWidth="1.5" />

              {[30, 52, 74, 96].map((wx, i) => (
                <circle key={i} cx={wx} cy="88" r="9" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
              ))}

              {/* Elevated Boom */}
              <g transform="translate(32, 58) rotate(-52)">
                <rect x="0" y="-9" width="154" height="18" fill="#c01823" stroke="#7f1d1d" strokeWidth="1.5" rx="2" />
                <text x="65" y="5" fill="#ffffff" fontSize="14" fontWeight="900" fontStyle="italic" fontFamily="sans-serif">M</text>
                <rect x="150" y="-7" width="14" height="14" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1.2" rx="1" />
                <circle cx="157" cy="0" r="4" fill="#334155" />
              </g>

              {/* Cable & Load */}
              <line x1="126" y1="-56" x2="126" y2="2" stroke="#0f172a" strokeWidth="2" />
              <g transform="translate(119, 2)">
                <rect x="0" y="0" width="14" height="16" fill="#c01823" stroke="#7f1d1d" strokeWidth="1.2" rx="2" />
                <circle cx="7" cy="7" r="3.5" fill="#ffffff" />
                <path d="M 7 16 C 7 22 0 22 0 27 C 0 30 6 30 6 27" stroke="#0f172a" strokeWidth="2.5" fill="none" />
              </g>

              <line x1="126" y1="26" x2="96" y2="42" stroke="#334155" strokeWidth="1.5" />
              <line x1="126" y1="26" x2="156" y2="42" stroke="#334155" strokeWidth="1.5" />

              {/* Suspended Cargo */}
              <g transform="translate(92, 42)">
                <rect x="0" y="0" width="68" height="32" fill="#cbd5e1" stroke="#475569" strokeWidth="2" rx="2" />
                <rect x="8" y="6" width="20" height="20" fill="#94a3b8" rx="1" />
                <rect x="34" y="8" width="26" height="6" fill="#64748b" rx="0.5" />
                <rect x="34" y="18" width="26" height="6" fill="#64748b" rx="0.5" />
              </g>
            </g>
          </g>

          <circle
            cx="120"
            cy="120"
            r="114"
            stroke={isActive ? '#c01823' : isCompleted ? '#16a34a' : '#cbd5e1'}
            strokeWidth={isActive ? '8' : '5'}
            fill="none"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-3 pb-1">
      {/* Compact, Subtle Stepper Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 py-2.5 px-3 sm:px-5 shadow-2xs">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {steps.map((step, idx) => {
            const isActive = step.stepNum === activeIndex;
            const isCompleted = step.stepNum < activeIndex;
            const isClickable = isCompleted && !!onNavigateToStep;

            return (
              <React.Fragment key={step.stepNum}>
                {/* Step Item */}
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => {
                    if (isClickable && onNavigateToStep) {
                      onNavigateToStep(step.id);
                    }
                  }}
                  className={`flex items-center gap-2 sm:gap-3 group focus:outline-none transition-all ${
                    isClickable ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  {/* Miniature Illustrated Circle with Badge */}
                  <div className="relative shrink-0 w-9 h-9 sm:w-11 sm:h-11">
                    <div
                      className={`w-full h-full rounded-full transition-transform duration-200 ${
                        isActive
                          ? 'ring-2 ring-red-400 ring-offset-1 scale-105 shadow-xs'
                          : isCompleted
                          ? 'opacity-90 group-hover:scale-105'
                          : 'opacity-50 grayscale-[0.4]'
                      }`}
                    >
                      {step.renderGraphic(isActive, isCompleted)}
                    </div>

                    {/* Miniature Red Number Pill */}
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center font-black text-[9px] sm:text-[10px] shadow-xs border border-white transition-all ${
                        isActive
                          ? 'bg-[#c01823] text-white scale-110'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-400 text-white'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      ) : (
                        step.stepNum
                      )}
                    </div>
                  </div>

                  {/* Step Title & Subtitle */}
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs sm:text-xs font-bold leading-tight transition-colors ${
                          isActive
                            ? 'text-[#c01823]'
                            : isCompleted
                            ? 'text-slate-800 group-hover:text-slate-900'
                            : 'text-slate-500'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 hidden md:block leading-tight">
                      {step.subtitle}
                    </span>
                  </div>
                </button>

                {/* Subtle Divider / Chevron between steps */}
                {idx < steps.length - 1 && (
                  <div className="flex items-center px-1 text-slate-300">
                    <ChevronRight className="w-4 h-4 stroke-[2]" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
