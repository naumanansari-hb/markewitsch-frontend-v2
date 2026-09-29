import React from 'react';

interface CraneIllustrationProps {
  craneId: string;
  className?: string;
}

export const CraneIllustration: React.FC<CraneIllustrationProps> = ({ craneId, className = 'w-full h-32' }) => {
  if (craneId === 'tk-40') {
    return (
      <svg
        viewBox="0 0 400 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect width="400" height="200" rx="8" fill="#f8fafc" />
        {/* Ground shadow */}
        <ellipse cx="200" cy="180" rx="160" ry="8" fill="#cbd5e1" opacity="0.6" />
        
        {/* 4-Axle Crane Chassis */}
        <g transform="translate(40, 50)">
          {/* Main Truck Body in Markewitsch Red */}
          <path
            d="M20 90 L270 90 L260 50 L140 50 L110 50 L90 70 L20 70 Z"
            fill="#c01823"
            stroke="#991b1b"
            strokeWidth="2"
          />
          {/* White Accent Stripe & Branding */}
          <path d="M20 78 L266 78 L264 86 L20 86 Z" fill="#ffffff" />
          <text
            x="145"
            y="84"
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontSize="7"
            fontWeight="bold"
            fill="#c01823"
            letterSpacing="0.5"
          >
            GEBR. MARKEWITSCH
          </text>
          
          {/* Driver Cabin */}
          <path
            d="M20 70 L70 70 L70 90 L20 90 Z"
            fill="#b91c1c"
            stroke="#7f1d1d"
            strokeWidth="1.5"
          />
          {/* Cabin Windshield */}
          <path
            d="M25 73 L65 73 L65 80 L35 80 Z"
            fill="#93c5fd"
            stroke="#1e3a8a"
            strokeWidth="1"
            opacity="0.85"
          />

          {/* Outrigger Pads */}
          <rect x="35" y="90" width="12" height="15" fill="#475569" rx="1" />
          <rect x="30" y="103" width="22" height="4" fill="#334155" rx="1" />
          <rect x="235" y="90" width="12" height="15" fill="#475569" rx="1" />
          <rect x="230" y="103" width="22" height="4" fill="#334155" rx="1" />

          {/* Wheels (4 Axles) */}
          {[60, 110, 195, 240].map((cx, i) => (
            <g key={i}>
              <circle cx={cx} cy="104" r="16" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
              <circle cx={cx} cy="104" r="9" fill="#94a3b8" />
              <circle cx={cx} cy="104" r="4" fill="#475569" />
              <circle cx={cx} cy="104" r="1" fill="#f8fafc" />
            </g>
          ))}

          {/* Superstructure / Turntable */}
          <rect x="120" y="42" width="130" height="18" rx="3" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
          {/* Operator Cabin on Turntable */}
          <path d="M125 22 L155 22 L160 45 L125 45 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="130" y="26" width="22" height="14" rx="1" fill="#93c5fd" opacity="0.9" stroke="#1d4ed8" strokeWidth="1" />

          {/* Telescopic Boom Sections (Red/White) */}
          <g transform="rotate(-12, 190, 42)">
            {/* Base Boom */}
            <rect x="70" y="24" width="180" height="20" rx="3" fill="#c01823" stroke="#7f1d1d" strokeWidth="2" />
            {/* White stripe on boom */}
            <rect x="80" y="30" width="160" height="8" fill="#ffffff" opacity="0.9" />
            <text x="110" y="36" fontFamily="sans-serif" fontSize="6" fontWeight="bold" fill="#c01823">
              TK 40 · MARKEWITSCH
            </text>
            {/* Telescopic section 1 */}
            <rect x="40" y="27" width="40" height="14" rx="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
            {/* Boom Head / Sheaves */}
            <polygon points="35,34 40,26 40,42" fill="#b91c1c" />
            <circle cx="35" cy="34" r="3" fill="#475569" />
            {/* Hook Block */}
            <line x1="35" y1="34" x2="35" y2="60" stroke="#0f172a" strokeWidth="1.5" />
            <rect x="30" y="60" width="10" height="10" rx="1" fill="#dc2626" />
            <path d="M35 70 C 35 76, 42 76, 40 72" stroke="#0f172a" strokeWidth="2" fill="none" />
          </g>

          {/* Hydraulic Lift Cylinder */}
          <line x1="160" y1="46" x2="135" y2="34" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
          <line x1="148" y1="40" x2="135" y2="34" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  if (craneId === 'tk-60') {
    return (
      <svg
        viewBox="0 0 400 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect width="400" height="200" rx="8" fill="#f8fafc" />
        <ellipse cx="200" cy="180" rx="170" ry="8" fill="#cbd5e1" opacity="0.6" />
        
        {/* 5-Axle Heavy Crane Chassis */}
        <g transform="translate(30, 48)">
          <path
            d="M15 90 L290 90 L280 48 L130 48 L95 48 L75 70 L15 70 Z"
            fill="#c01823"
            stroke="#991b1b"
            strokeWidth="2"
          />
          <path d="M15 78 L286 78 L284 86 L15 86 Z" fill="#ffffff" />
          <text
            x="140"
            y="84"
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontSize="7"
            fontWeight="bold"
            fill="#c01823"
            letterSpacing="0.5"
          >
            GEBR. MARKEWITSCH · HEAVY
          </text>
          
          <path d="M15 70 L65 70 L65 90 L15 90 Z" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="1.5" />
          <path d="M20 73 L60 73 L60 80 L30 80 Z" fill="#93c5fd" opacity="0.85" />

          {/* Outriggers */}
          <rect x="25" y="90" width="12" height="15" fill="#475569" rx="1" />
          <rect x="20" y="103" width="22" height="4" fill="#334155" rx="1" />
          <rect x="260" y="90" width="12" height="15" fill="#475569" rx="1" />
          <rect x="255" y="103" width="22" height="4" fill="#334155" rx="1" />

          {/* 5 Axles Wheels */}
          {[48, 90, 170, 215, 260].map((cx, i) => (
            <g key={i}>
              <circle cx={cx} cy="104" r="16" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
              <circle cx={cx} cy="104" r="9" fill="#94a3b8" />
              <circle cx={cx} cy="104" r="4" fill="#475569" />
              <circle cx={cx} cy="104" r="1" fill="#f8fafc" />
            </g>
          ))}

          {/* Heavy Turntable & Counterweights */}
          <rect x="130" y="38" width="150" height="22" rx="3" fill="#991b1b" />
          <rect x="245" y="24" width="35" height="24" rx="2" fill="#334155" />
          <text x="248" y="38" fontSize="6" fill="#ffffff" fontWeight="bold">12 t CW</text>

          {/* Heavy Boom */}
          <g transform="rotate(-15, 210, 40)">
            <rect x="50" y="20" width="210" height="24" rx="3" fill="#c01823" stroke="#7f1d1d" strokeWidth="2" />
            <rect x="65" y="27" width="180" height="9" fill="#ffffff" />
            <text x="100" y="34" fontFamily="sans-serif" fontSize="7" fontWeight="bold" fill="#c01823">
              MARKEWITSCH TK 60 (50m)
            </text>
            <rect x="20" y="24" width="40" height="16" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
            <circle cx="16" cy="32" r="4" fill="#475569" />
            <line x1="16" y1="32" x2="16" y2="60" stroke="#0f172a" strokeWidth="1.5" />
            <rect x="10" y="60" width="12" height="12" rx="1" fill="#dc2626" />
          </g>
        </g>
      </svg>
    );
  }

  // City Crane MK 30
  return (
    <svg
      viewBox="0 0 400 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="400" height="200" rx="8" fill="#f8fafc" />
      <ellipse cx="200" cy="180" rx="140" ry="8" fill="#cbd5e1" opacity="0.6" />
      
      {/* 2-3 Axle Compact City Crane */}
      <g transform="translate(60, 52)">
        <path
          d="M20 90 L220 90 L210 55 L90 55 L70 70 L20 70 Z"
          fill="#c01823"
          stroke="#991b1b"
          strokeWidth="2"
        />
        <path d="M20 78 L216 78 L214 86 L20 86 Z" fill="#ffffff" />
        <text
          x="100"
          y="84"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fontSize="7"
          fontWeight="bold"
          fill="#c01823"
          letterSpacing="0.5"
        >
          MARKEWITSCH · CITY MK 30
        </text>

        {/* Compact Single All-Terrain Cab */}
        <path d="M20 68 L60 68 L60 90 L20 90 Z" fill="#b91c1c" />
        <rect x="24" y="71" width="30" height="10" rx="1" fill="#93c5fd" opacity="0.9" />

        {/* Outriggers */}
        <rect x="30" y="90" width="12" height="15" fill="#475569" />
        <rect x="25" y="103" width="22" height="4" fill="#334155" />
        <rect x="180" y="90" width="12" height="15" fill="#475569" />
        <rect x="175" y="103" width="22" height="4" fill="#334155" />

        {/* 3 Axles Wheels */}
        {[55, 120, 185].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy="104" r="16" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
            <circle cx={cx} cy="104" r="9" fill="#94a3b8" />
            <circle cx={cx} cy="104" r="4" fill="#475569" />
          </g>
        ))}

        {/* Compact Boom */}
        <g transform="rotate(-10, 160, 48)">
          <rect x="60" y="30" width="140" height="18" rx="2" fill="#c01823" stroke="#991b1b" strokeWidth="1.5" />
          <rect x="70" y="34" width="120" height="7" fill="#ffffff" />
          <rect x="35" y="32" width="30" height="12" fill="#cbd5e1" />
          <circle cx="30" cy="38" r="3" fill="#475569" />
          <line x1="30" y1="38" x2="30" y2="58" stroke="#0f172a" strokeWidth="1.5" />
          <rect x="26" y="58" width="8" height="8" rx="1" fill="#dc2626" />
        </g>
      </g>
    </svg>
  );
};
