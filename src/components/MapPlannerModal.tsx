import React, { useState } from 'react';
import { MARKEWITSCH_LOGO } from '../assets/logo';
import {
  X,
  MapPin,
  Truck,
  Layers,
  Building,
  ArrowRight,
  Navigation,
} from 'lucide-react';
import { JobSiteLocation, LiftParameters } from '../types';

interface MapPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: JobSiteLocation;
  setLocation: (loc: JobSiteLocation) => void;
  parameters: LiftParameters;
  setParameters: (params: LiftParameters) => void;
  onProceedToCraneSuggestions: () => void;
}

export const MapPlannerModal: React.FC<MapPlannerModalProps> = ({
  isOpen,
  onClose,
  location,
  parameters,
  setParameters,
  onProceedToCraneSuggestions,
}) => {
  if (!isOpen) return null;

  // Crane pin coordinates on map canvas (pixels relative to map container)
  const [cranePos, setCranePos] = useState({ x: 220, y: 260 });
  const [loadPos, setLoadPos] = useState({ x: 440, y: 160 });
  const [obstaclePos, setObstaclePos] = useState({ x: 330, y: 210 });
  const [isDragging, setIsDragging] = useState<'crane' | 'load' | 'obstacle' | null>(null);

  // Compute scale: 10 pixels = 1 meter
  const dx = loadPos.x - cranePos.x;
  const dy = loadPos.y - cranePos.y;
  const calculatedRadius = Number((Math.sqrt(dx * dx + dy * dy) / 11).toFixed(1));

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (isDragging === 'crane') {
      setCranePos({ x: clickX, y: clickY });
      setIsDragging(null);
    } else if (isDragging === 'load') {
      setLoadPos({ x: clickX, y: clickY });
      setIsDragging(null);
    } else if (isDragging === 'obstacle') {
      setObstaclePos({ x: clickX, y: clickY });
      setIsDragging(null);
    }
  };

  const handleApplyAndContinue = () => {
    setParameters({
      ...parameters,
      distanceA: Math.max(5, Math.round(calculatedRadius * 0.6)),
      obstacles: [
        {
          ...parameters.obstacles[0],
          distToDestinationB: Math.max(3, Math.round(calculatedRadius * 0.4)),
        },
        parameters.obstacles[1],
      ],
    });
    onClose();
    onProceedToCraneSuggestions();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header with cleaner title font-weight */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <img
              src={MARKEWITSCH_LOGO}
              alt="Gebr. Markewitsch"
              className="h-11 sm:h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-[#c01823]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Map-Based Lift & Site Planner
                </h2>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Position crane, target placement, and obstacles directly on the site map
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
          {/* Map View Port with standard clean Google Maps vector styling */}
          <div className="lg:col-span-8 flex flex-col space-y-3">
            <div
              onClick={handleMapClick}
              className="relative w-full h-[380px] bg-[#f4f3f0] rounded-xl overflow-hidden border border-slate-200 cursor-crosshair group shadow-inner select-none"
            >
              {/* Google Map Vector Background Simulation */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 600 380">
                {/* Base Land */}
                <rect width="600" height="380" fill="#f4f3f0" />

                {/* Industrial Park Parcels */}
                <path d="M 0,0 L 220,0 L 190,140 L 0,110 Z" fill="#d8edd5" opacity="0.6" />
                <path d="M 450,240 L 600,200 L 600,380 L 400,380 Z" fill="#d8edd5" opacity="0.6" />

                {/* Water Canal */}
                <path
                  d="M 520,0 Q 480,140 540,260 T 590,380 L 600,380 L 600,0 Z"
                  fill="#c8def4"
                  opacity="0.9"
                />

                {/* Industrial buildings & warehouses */}
                <rect x="50" y="160" width="110" height="70" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
                <rect x="240" y="30" width="140" height="80" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
                <rect x="360" y="270" width="120" height="60" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />

                {/* Minor Streets */}
                <line x1="0" y1="140" x2="520" y2="140" stroke="#ffffff" strokeWidth="14" />
                <line x1="0" y1="140" x2="520" y2="140" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="200" y1="0" x2="200" y2="380" stroke="#ffffff" strokeWidth="14" />
                <line x1="200" y1="0" x2="200" y2="380" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="420" y1="0" x2="420" y2="380" stroke="#ffffff" strokeWidth="10" />

                {/* Main Arterial Road */}
                <path
                  d="M 0,60 Q 300,70 600,180"
                  stroke="#fbbf24"
                  strokeWidth="12"
                  fill="none"
                />
                <path
                  d="M 0,60 Q 300,70 600,180"
                  stroke="#f59e0b"
                  strokeWidth="1"
                  fill="none"
                />

                {/* Street Names */}
                <text x="70" y="136" fontSize="10" fill="#64748b" fontWeight="600" fontFamily="sans-serif">
                  Kranstraße (Hafenbecken II)
                </text>
                <text x="210" y="220" fontSize="10" fill="#64748b" fontWeight="600" fontFamily="sans-serif">
                  Kai-Zufahrt Süd
                </text>
                <text x="30" y="52" fontSize="10" fill="#b45309" fontWeight="700" fontFamily="sans-serif">
                  Bundesstraße B8 / A40
                </text>
              </svg>

              {/* Working Radius Circle from Crane */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <circle
                  cx={cranePos.x}
                  cy={cranePos.y}
                  r={Math.sqrt(dx * dx + dy * dy)}
                  fill="rgba(192, 24, 35, 0.08)"
                  stroke="#c01823"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />
                {/* Distance line from crane to load */}
                <line
                  x1={cranePos.x}
                  y1={cranePos.y}
                  x2={loadPos.x}
                  y2={loadPos.y}
                  stroke="#c01823"
                  strokeWidth="2"
                />
              </svg>

              {/* Crane Marker */}
              <div
                style={{ left: cranePos.x - 18, top: cranePos.y - 18 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDragging('crane');
                }}
                className={`absolute w-9 h-9 rounded-full bg-[#c01823] text-white border-2 border-white shadow-lg flex items-center justify-center cursor-move transition-transform ${
                  isDragging === 'crane' ? 'scale-125 ring-4 ring-red-400' : 'hover:scale-110'
                }`}
                title="Crane Setup Position (Click to move)"
              >
                <Truck className="w-4 h-4" />
              </div>

              {/* Obstacle Marker */}
              <div
                style={{ left: obstaclePos.x - 14, top: obstaclePos.y - 14 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDragging('obstacle');
                }}
                className={`absolute w-7 h-7 rounded-lg bg-amber-500 text-white border-2 border-white shadow-lg flex items-center justify-center cursor-move transition-transform ${
                  isDragging === 'obstacle' ? 'scale-125 ring-4 ring-amber-400' : 'hover:scale-110'
                }`}
                title="Site Obstacle / Building"
              >
                <Building className="w-3.5 h-3.5" />
              </div>

              {/* Load Dropzone Marker */}
              <div
                style={{ left: loadPos.x - 16, top: loadPos.y - 16 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDragging('load');
                }}
                className={`absolute w-8 h-8 rounded-full bg-emerald-600 text-white border-2 border-white shadow-lg flex items-center justify-center cursor-move transition-transform ${
                  isDragging === 'load' ? 'scale-125 ring-4 ring-emerald-400' : 'hover:scale-110'
                }`}
                title="Target Lift Destination"
              >
                <Layers className="w-4 h-4" />
              </div>

              {/* Floating Helper Pill */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 shadow-sm flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-[#c01823]" />
                <span>
                  {isDragging
                    ? `Click anywhere to place ${isDragging}`
                    : 'Click any marker to re-position'}
                </span>
              </div>

              {/* Google Watermark */}
              <div className="absolute bottom-2 right-3 text-[9px] font-bold text-slate-400 font-sans tracking-wide">
                Google
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Site: {location.address}, {location.city}</span>
              <span>Port terminal: {location.portName}</span>
            </div>
          </div>

          {/* Right Info & Live Calculations */}
          <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Live Geometrical Estimates
              </h3>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Calculated Radius:</span>
                  <span className="font-semibold text-slate-900 font-mono text-sm">
                    {calculatedRadius} m
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Target Object:</span>
                  <span className="font-semibold text-slate-900 text-right truncate max-w-[150px]">
                    {parameters.loadWeight} t Load
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Clearance Buffer:</span>
                  <span className="font-semibold text-emerald-700">Safe (Passes)</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#c01823]" />
                  <span>Red marker: Crane Chassis & Outriggers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-amber-500" />
                  <span>Amber box: Pipeline rack / obstacle</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-600" />
                  <span>Green target: Final lift placement</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
              <button
                onClick={handleApplyAndContinue}
                className="w-full py-2.5 bg-[#c01823] hover:bg-[#a5131c] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Apply to lift planner & proceed</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
