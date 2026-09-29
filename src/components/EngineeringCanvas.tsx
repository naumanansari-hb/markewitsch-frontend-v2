import React, { useRef, useState } from 'react';
import { MARKEWITSCH_LOGO } from '../assets/logo';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Hand,
  Compass,
  Building2,
  MoveHorizontal,
  MoveVertical,
  Ruler,
} from 'lucide-react';
import { LiftParameters } from '../types';

interface EngineeringCanvasProps {
  parameters: LiftParameters;
  highlightedElement?: string | null;
  onResetView?: () => void;
  onFillDemo?: () => void;
  hideTopBar?: boolean;
  hideFloatingToolbar?: boolean;
}

export const EngineeringCanvas: React.FC<EngineeringCanvasProps> = ({
  parameters,
  highlightedElement,
  onResetView,
  onFillDemo,
  hideTopBar = false,
  hideFloatingToolbar = false,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    loadWeight,
    dimensions,
    hasObstacles,
    distanceA,
    distanceB,
    liftingHeight: manualLiftingHeight,
    boomAngle: manualBoomAngle,
    boomLength: manualBoomLength,
    obstacles,
    groundAccess,
  } = parameters;

  // Obstacle 1 (Primary obstacle, in front of crane)
  const obs1 = obstacles[0] || {
    id: 'obs-1',
    name: 'Obstacle 1',
    active: hasObstacles === 'yes',
    type: 'Building',
    height: 0,
    width: 0,
    distanceA: 0,
    distToDestinationB: 0,
    placement: 'front',
    isWorkingSide: true,
  };

  // Obstacle 2 (Optional secondary obstacle)
  const obs2 = obstacles[1] || {
    id: 'obs-2',
    name: 'Obstacle 2',
    active: false,
    type: 'Roof edge',
    height: 0,
    width: 0,
    distanceA: 0,
    distToDestinationB: 0,
    placement: 'stacked_on_1',
    distFromObstacle1: 0,
    isWorkingSide: false,
  };

  // User input distances
  const inputA = obs1.distanceA || distanceA || 0;
  const inputB = obs1.distToDestinationB || distanceB || 0;
  const obs1H = hasObstacles === 'yes' && obs1.active !== false ? obs1.height || 0 : 0;
  const obs2H = hasObstacles === 'yes' && obs2.active ? obs2.height || 0 : 0;

  // 1. Precise check: Is Outreach calculated/provided from valid inputs?
  const isOutreachCalculated =
    hasObstacles === 'yes'
      ? inputA > 0 && inputB > 0
      : (parameters.distanceA !== undefined && parameters.distanceA > 0) ||
        (parameters.requiredOutreach !== undefined && parameters.requiredOutreach > 0) ||
        inputA > 0;

  // ================= SYSTEM GEOMETRY CALCULATIONS =================
  // Effective Obstacle Height
  let effectiveObstacleHeight = 0;
  if (hasObstacles === 'yes') {
    if (obs2.active && obs2.placement === 'stacked_on_1') {
      effectiveObstacleHeight = obs1H + obs2H;
    } else if (obs2.active && obs2H > 0) {
      effectiveObstacleHeight = Math.max(obs1H, obs2H);
    } else {
      effectiveObstacleHeight = obs1H;
    }
  }

  // Total Outreach = A + B
  const calculatedOutreach =
    hasObstacles === 'yes'
      ? inputA > 0 && inputB > 0
        ? Number((inputA + inputB).toFixed(1))
        : 0
      : parameters.distanceA || parameters.requiredOutreach || inputA || 0;

  // Obstacle clearance margin (Load height + Rigging bridle/hook + safety buffer)
  const loadHeightM = dimensions.height > 0 ? dimensions.height : 2.5;
  const obstacleClearanceMargin = Math.max(5.0, loadHeightM + 3.0);

  // Calculated required lifting height using Markewitsch line-of-sight formula with clearance:
  // Lifting height = ((Effective obstacle height + clearance) / A) * (A + B)
  let calculatedLiftingHeight = 0;
  if (hasObstacles === 'yes' && inputA > 0 && effectiveObstacleHeight > 0 && calculatedOutreach > 0) {
    calculatedLiftingHeight = Number(
      (((effectiveObstacleHeight + obstacleClearanceMargin) / inputA) * calculatedOutreach).toFixed(1)
    );
  } else if (manualLiftingHeight && manualLiftingHeight > 0) {
    calculatedLiftingHeight = manualLiftingHeight;
  }

  // Minimum required Boom Length = sqrt(Outreach² + Lifting height²)
  let calculatedBoomLength = 0;
  if (calculatedOutreach > 0 && calculatedLiftingHeight > 0) {
    calculatedBoomLength = Number(
      Math.sqrt(
        calculatedOutreach * calculatedOutreach +
          calculatedLiftingHeight * calculatedLiftingHeight
      ).toFixed(1)
    );
  }

  // Geometry driven by Boom Length override or calculated baseline
  let nominalBoomLengthM = 18.0;
  let activeBoomAngle = 45;
  let activeLiftingHeight = 18.0;

  if (manualBoomLength && manualBoomLength > 0) {
    nominalBoomLengthM = manualBoomLength;
    if (calculatedOutreach > 0 && manualBoomLength >= calculatedOutreach) {
      activeBoomAngle = Math.min(
        85,
        Math.max(
          15,
          Math.round((Math.acos(calculatedOutreach / manualBoomLength) * 180) / Math.PI)
        )
      );
      activeLiftingHeight = Number(
        Math.sqrt(manualBoomLength * manualBoomLength - calculatedOutreach * calculatedOutreach).toFixed(1)
      );
    } else if (manualBoomAngle && manualBoomAngle > 0) {
      activeBoomAngle = manualBoomAngle;
      activeLiftingHeight = Number((manualBoomLength * Math.sin((activeBoomAngle * Math.PI) / 180)).toFixed(1));
    } else {
      activeBoomAngle = 45;
      activeLiftingHeight = Number((manualBoomLength * Math.sin((45 * Math.PI) / 180)).toFixed(1));
    }
  } else if (calculatedBoomLength > 0) {
    nominalBoomLengthM = calculatedBoomLength;
    activeLiftingHeight = calculatedLiftingHeight;
    activeBoomAngle = Math.min(
      85,
      Math.max(
        15,
        Number(((Math.atan(calculatedLiftingHeight / calculatedOutreach) * 180) / Math.PI).toFixed(0))
      )
    );
  } else {
    activeLiftingHeight = manualLiftingHeight && manualLiftingHeight > 0 ? manualLiftingHeight : 18.0;
    activeBoomAngle = manualBoomAngle && manualBoomAngle > 0 ? manualBoomAngle : 45;
    nominalBoomLengthM = Math.sqrt(
      (calculatedOutreach > 0 ? calculatedOutreach : 18.0) * (calculatedOutreach > 0 ? calculatedOutreach : 18.0) +
        activeLiftingHeight * activeLiftingHeight
    );
  }

  // 2. Precise check: Is Lifting Height calculated/provided?
  const isLiftingHeightCalculated =
    (hasObstacles === 'yes' && effectiveObstacleHeight > 0 && inputA > 0 && inputB > 0) ||
    (manualBoomLength !== undefined && manualBoomLength > 0) ||
    (manualLiftingHeight !== undefined && manualLiftingHeight > 0);

  // ================= STABLE DYNAMIC VIEWPORT (ZOOMED IN, ACCURATELY SCALED & CENTERED) =================
  const displayOutreach = calculatedOutreach > 0 ? calculatedOutreach : 18.0;
  const displayDistA = inputA > 0 ? inputA : 10.0;
  const displayDistB = inputB > 0 ? inputB : 8.0;

  // Obstacle 2 geometry placement
  const obs2Placement = obs2.placement || 'stacked_on_1';
  const isObs2Behind = hasObstacles === 'yes' && obs2.active && obs2H > 0 && obs2Placement === 'behind';
  const obs2BehindDist = isObs2Behind ? obs2.distanceA || 5 : 0;
  const obs2WidthM = hasObstacles === 'yes' && obs2.active && obs2H > 0 ? obs2.width || 2.5 : 0;
  const obs1WidthM = hasObstacles === 'yes' && obs1.active !== false && obs1H > 0 ? obs1.width || 3.0 : 0;

  // Active boom angle and trigonometry
  const radAngle = (activeBoomAngle * Math.PI) / 180;
  const tipHeightAbovePivotM = nominalBoomLengthM * Math.sin(radAngle);
  const tipReachM = nominalBoomLengthM * Math.cos(radAngle);

  // World bounds in meters (crane rear footprint is ~4.5m behind slewing center)
  const minMetersX = -Math.max(4.5, isObs2Behind ? obs2BehindDist + obs2WidthM + 1.0 : 4.5);
  const maxObs1M = hasObstacles === 'yes' && obs1.active !== false && obs1H > 0 ? inputA + obs1WidthM : 0;
  const maxObs2M =
    hasObstacles === 'yes' && obs2.active && obs2H > 0 && !isObs2Behind
      ? obs2Placement === 'beside_1'
        ? inputA + obs1WidthM + (obs2.distFromObstacle1 || 0) + obs2WidthM
        : (obs2.distanceA || inputA + 3) + obs2WidthM
      : 0;

  // Horizontal reach span with generous breathing space based on site parameters
  const totalSpanMetersX = Math.max(displayOutreach + 6.0, maxObs1M + 6.0, maxObs2M + 6.0, 24.0) - minMetersX;

  // Maximum vertical height in meters: stably framed by job site obstacles and required lifting height
  // (Ensures adjusting the boom length ONLY extends the boom arm object without shifting the entire crane or rescaling the canvas)
  const stableSitePeakHeightM = Math.max(
    effectiveObstacleHeight + obstacleClearanceMargin + 2.0,
    calculatedLiftingHeight > 0 ? calculatedLiftingHeight + 2.0 : 20.0,
    22.0
  );
  const maxMetersY = stableSitePeakHeightM + 3.0;

  // Canvas ViewBox
  const vbWidth = 920;
  const vbHeight = 525;
  const groundY = vbHeight - 110; // 110px below ground for multi-tier setup footprint, A/B and Total outreach dimensions

  // Scale meter factor: stable, centering the crane & lift scene comfortably
  const usableWidth = vbWidth - 110;
  const usableHeight = groundY - 35;
  const meterScale = Math.min(22.0, Math.min(usableWidth / totalSpanMetersX, usableHeight / maxMetersY));

  // Center the entire crane & lift scene horizontally within the canvas
  const totalSceneWidthPx = totalSpanMetersX * meterScale;
  const sceneStartX = Math.max(40, (vbWidth - totalSceneWidthPx) / 2);
  const cranePivotX = sceneStartX + -minMetersX * meterScale;
  const cranePivotY = groundY - 26;

  // Boom Length in Pixels
  const boomLengthPx = nominalBoomLengthM * meterScale;

  // Boom Tip Position based strictly on boom length and active boom angle
  const tipX = cranePivotX + boomLengthPx * Math.cos(radAngle);
  const tipY = cranePivotY - boomLengthPx * Math.sin(radAngle);

  // Suspended Load Target Coordinates (hung straight down from boom tip sheave)
  const loadX = tipX;
  const loadW = 38;
  const loadH = 26;

  // Calculate clear vertical hoist drop: ensures load box never collides with the boom at any angle
  const minClearanceDrop = Math.ceil((loadW / 2 + 5) * Math.tan(radAngle) - 8);
  const hookDropPx = Math.max(26, minClearanceDrop);
  const hookY = tipY + hookDropPx;
  const bridleHeightPx = 8;
  const loadY = hookY + bridleHeightPx;

  // Highlight check helpers
  const isObs1Highlighted =
    highlightedElement === 'obs1_height' ||
    highlightedElement === 'obs1' ||
    highlightedElement === 'obs1_type' ||
    highlightedElement === 'obs1_width';
  const isObs2Highlighted =
    highlightedElement === 'obs2_height' ||
    highlightedElement === 'obs2' ||
    highlightedElement === 'obs2_width' ||
    highlightedElement === 'obs2_placement';
  const isAHighlighted =
    highlightedElement === 'distanceA' || highlightedElement === 'obs1_distanceA';
  const isBHighlighted =
    highlightedElement === 'distanceB' || highlightedElement === 'obs1_distToDestinationB';
  const isLoadHighlighted =
    highlightedElement === 'loadWeight' ||
    highlightedElement === 'dimensions' ||
    highlightedElement === 'load';
  const isLiftingHeightHighlighted = highlightedElement === 'liftingHeight';
  const isBoomLengthHighlighted =
    highlightedElement === 'boomLength' || highlightedElement === 'minBoomLength';
  const isBoomAngleHighlighted = highlightedElement === 'boomAngle';
  const isAccessWidthHighlighted =
    highlightedElement === 'access_width' || highlightedElement === 'minWidth';
  const isSetupAreaHighlighted =
    highlightedElement === 'setup_area' ||
    highlightedElement === 'setupLength' ||
    highlightedElement === 'setupWidth' ||
    highlightedElement === 'setupAreaLength' ||
    highlightedElement === 'setupAreaWidth';

  // Obstacle 1 Coordinates
  const obs1WidthPx = Math.max(28, (obs1.width || 3.0) * meterScale);
  const obs1HeightPx = (obs1H > 0 ? obs1H : 6) * meterScale;
  const obs1XPx = cranePivotX + (inputA > 0 ? inputA : displayDistA) * meterScale;
  const obs1YPx = groundY - obs1HeightPx;

  // Obstacle 2 Coordinates
  const obs2HeightPx = (obs2H > 0 ? obs2H : 2.5) * meterScale;
  const obs2WidthPx = Math.max(22, (obs2.width || 2.5) * meterScale);
  let obs2XPx = obs1XPx;
  let obs2YPx = obs1YPx - obs2HeightPx;

  if (obs2Placement === 'stacked_on_1') {
    obs2XPx = obs1XPx + (obs1WidthPx - obs2WidthPx) / 2;
    obs2YPx = obs1YPx - obs2HeightPx;
  } else if (obs2Placement === 'beside_1') {
    const spacingPx = (obs2.distFromObstacle1 || 0) * meterScale;
    obs2XPx = obs1XPx + obs1WidthPx + spacingPx;
    obs2YPx = groundY - obs2HeightPx;
  } else if (obs2Placement === 'behind') {
    const dPx = (obs2.distanceA || 6) * meterScale;
    obs2XPx = cranePivotX - dPx - obs2WidthPx;
    obs2YPx = groundY - obs2HeightPx;
  } else {
    const dPx = (obs2.distanceA || displayDistA + 4) * meterScale;
    obs2XPx = cranePivotX + dPx;
    obs2YPx = groundY - obs2HeightPx;
  }

  // Telescopic collar positions along the boom (at 35% and 70%)
  const collar1T = 0.35;
  const collar1X = cranePivotX + (tipX - cranePivotX) * collar1T;
  const collar1Y = cranePivotY + (tipY - cranePivotY) * collar1T;

  const collar2T = 0.7;
  const collar2X = cranePivotX + (tipX - cranePivotX) * collar2T;
  const collar2Y = cranePivotY + (tipY - cranePivotY) * collar2T;

  // ================= PAN & DRAG HANDLERS =================
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(0.5, prev + delta), 2.5));
  };

  const handleResetPanZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    if (onResetView) onResetView();
  };

  // Check which cards should be displayed based strictly on calculated inputs from the left
  const showOutreachCard = isOutreachCalculated && calculatedOutreach > 0;
  const showObstacleHeightCard = hasObstacles === 'yes' && effectiveObstacleHeight > 0;
  const showLiftingHeightCard = isLiftingHeightCalculated && activeLiftingHeight > 0 && calculatedLiftingHeight > 0;
  const showBoomLengthCard = calculatedBoomLength > 0 || (manualBoomLength !== undefined && manualBoomLength > 0);
  const showBoomAngleCard =
    (calculatedOutreach > 0 && calculatedLiftingHeight > 0) ||
    (manualBoomAngle !== undefined && manualBoomAngle > 0 && manualBoomLength !== undefined && manualBoomLength > 0);

  const activeStatCards = [
    showOutreachCard && {
      id: 'outreach',
      label: 'Required outreach',
      value: `${calculatedOutreach.toFixed(1)} m`,
      icon: <MoveHorizontal className="w-3.5 h-3.5" />,
      tooltip: `Required outreach: ${calculatedOutreach.toFixed(1)} m (Distance A + Distance B)`,
      highlighted: isAHighlighted || isBHighlighted,
    },
    showObstacleHeightCard && {
      id: 'obstacle-height',
      label: 'Effective obstacle height',
      value: `${effectiveObstacleHeight.toFixed(1)} m`,
      icon: <Building2 className="w-3.5 h-3.5" />,
      tooltip: `Effective obstacle height: ${effectiveObstacleHeight.toFixed(1)} m (Height of site obstacles)`,
      highlighted: isObs1Highlighted || isObs2Highlighted,
    },
    showLiftingHeightCard && {
      id: 'lifting-height',
      label: 'Resulting lifting height',
      value: `${activeLiftingHeight.toFixed(1)} m`,
      icon: <MoveVertical className="w-3.5 h-3.5" />,
      tooltip: `Resulting lifting height: ${activeLiftingHeight.toFixed(1)} m (Calculated line-of-sight elevation)`,
      highlighted: isLiftingHeightHighlighted,
    },
    showBoomLengthCard && {
      id: 'boom-length',
      label: 'Minimum boom length',
      value: `${nominalBoomLengthM.toFixed(1)} m`,
      icon: <Ruler className="w-3.5 h-3.5" />,
      tooltip: `Minimum boom length: ${nominalBoomLengthM.toFixed(1)} m (Calculated boom radius)`,
      highlighted: isBoomLengthHighlighted,
    },
    showBoomAngleCard && {
      id: 'boom-angle',
      label: 'Minimum boom angle',
      value: `${activeBoomAngle}°`,
      icon: <Compass className="w-3.5 h-3.5" />,
      tooltip: `Minimum boom angle: ${activeBoomAngle}° (Required crane boom elevation)`,
      highlighted: isBoomAngleHighlighted,
    },
  ].filter(Boolean) as {
    id: string;
    label: string;
    value: string;
    icon: React.ReactNode;
    tooltip: string;
    highlighted?: boolean;
  }[];

  return (
    <div className="flex flex-col h-full bg-slate-50/80 rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
      {/* Top Stat Summary Header Badges: Only displayed when active calculated parameters exist */}
      {!hideTopBar && activeStatCards.length > 0 && (
        <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-white border-b border-slate-200 overflow-x-auto custom-scrollbar">
          {activeStatCards.map((card) => (
            <div
              key={card.id}
              title={card.tooltip}
              className={`flex-1 min-w-max flex items-center gap-2 px-2.5 py-1.5 rounded-xl border shadow-2xs transition-all cursor-default select-none ${
                card.highlighted
                  ? 'bg-red-50/90 border-red-300 text-[#c01823] ring-1 ring-red-200'
                  : 'bg-slate-50/80 border-slate-200/90 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  card.highlighted
                    ? 'bg-red-100 text-[#c01823]'
                    : 'bg-red-50 border border-red-100 text-[#c01823]'
                }`}
              >
                {card.icon}
              </div>
              <div className="min-w-0">
                <div
                  className="text-[10px] sm:text-[11px] text-slate-500 font-medium whitespace-nowrap leading-none"
                  title={card.label}
                >
                  {card.label}
                </div>
                <div className="text-xs font-bold text-slate-900 font-mono mt-0.5 whitespace-nowrap leading-tight">
                  {card.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Main 2D Interactive Vector CAD Area with Pan Support */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative flex-1 ${
          hideTopBar ? 'min-h-[220px]' : 'min-h-[440px] sm:min-h-[520px]'
        } flex items-center justify-center overflow-hidden p-2 select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          backgroundColor: '#f8fafc',
          backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
          backgroundSize: '20px 20px',
        }}
      >
        <svg
          viewBox={`0 0 ${vbWidth} ${vbHeight}`}
          className="w-full h-full select-none"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          <defs>
            {/* Architectural Hatch Pattern 1 */}
            <pattern
              id="hatch-pattern"
              width="10"
              height="10"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="10" stroke="#94a3b8" strokeWidth="1.2" />
            </pattern>

            {/* Architectural Hatch Pattern 2 (Red Accent) */}
            <pattern
              id="red-hatch"
              width="8"
              height="8"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="8"
                stroke="#c01823"
                strokeWidth="1.2"
                opacity="0.65"
              />
            </pattern>

            {/* Ground Hatching Pattern */}
            <pattern
              id="ground-hatch"
              width="8"
              height="8"
              patternTransform="rotate(-45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="8" stroke="#94a3b8" strokeWidth="1" />
            </pattern>

            {/* Dimension Line Arrow Markers */}
            <marker
              id="arrow-head-red"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#c01823" />
            </marker>
            <marker
              id="arrow-head-dark"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#0f172a" />
            </marker>
          </defs>

          {/* ================= GROUND TERRAIN ================= */}
          <line
            x1="10"
            y1={groundY}
            x2={vbWidth - 10}
            y2={groundY}
            stroke="#0f172a"
            strokeWidth="1.5"
          />
          <rect
            x="10"
            y={groundY}
            width={vbWidth - 20}
            height="18"
            fill="url(#ground-hatch)"
          />

          {/* ================= CRANE SETUP AREA & GROUND ACCESS ANNOTATIONS (ONLY WHEN INPUTTED > 0) ================= */}
          {/* 1. Minimum Access Width Dimension (Tilted Perspective with Fixed Length & Value on Top) */}
          {groundAccess?.minWidth !== undefined && groundAccess.minWidth > 0 && (() => {
            const accW = groundAccess.minWidth;
            // Fixed compact line length tilted at 28-degree perspective to indicate road/passage entrance width
            const centerX = Math.max(48, cranePivotX - 105);
            const centerY = groundY - 14;
            const dx = 18;
            const dy = 9;
            const p1 = { x: centerX - dx, y: centerY + dy };
            const p2 = { x: centerX + dx, y: centerY - dy };
            // Perpendicular end-tick vector (normalized 3px)
            const tickDx = 3;
            const tickDy = 6;
            const strokeCol = isAccessWidthHighlighted ? '#c01823' : '#0f172a';

            return (
              <g>
                {/* Subtle perspective road entrance guide lines */}
                <line
                  x1={centerX - 24}
                  y1={groundY}
                  x2={cranePivotX - 82}
                  y2={groundY}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  strokeDasharray="2,3"
                />

                {/* Tilted fixed-length dimension line */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={strokeCol}
                  strokeWidth={isAccessWidthHighlighted ? '2' : '1.5'}
                />

                {/* Perpendicular End Ticks */}
                <line
                  x1={p1.x - tickDx}
                  y1={p1.y - tickDy}
                  x2={p1.x + tickDx}
                  y2={p1.y + tickDy}
                  stroke={strokeCol}
                  strokeWidth={isAccessWidthHighlighted ? '2' : '1.4'}
                />
                <line
                  x1={p2.x - tickDx}
                  y1={p2.y - tickDy}
                  x2={p2.x + tickDx}
                  y2={p2.y + tickDy}
                  stroke={strokeCol}
                  strokeWidth={isAccessWidthHighlighted ? '2' : '1.4'}
                />

                {/* Circular End Caps */}
                <circle cx={p1.x} cy={p1.y} r="2" fill={strokeCol} />
                <circle cx={p2.x} cy={p2.y} r="2" fill={strokeCol} />

                {/* Value Text Specified on Top of the line (No Box / Pill) */}
                <text
                  x={centerX}
                  y={centerY - 8}
                  textAnchor="middle"
                  fontSize={isAccessWidthHighlighted ? '10.5' : '9.5'}
                  fontWeight="bold"
                  fill={strokeCol}
                  fontFamily="sans-serif"
                >
                  {accW.toFixed(1)} m
                </text>
                <text
                  x={centerX}
                  y={centerY + 18}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="600"
                  fill={isAccessWidthHighlighted ? '#c01823' : '#64748b'}
                  fontFamily="sans-serif"
                >
                  Access width
                </text>
              </g>
            );
          })()}

          {/* 2. Crane Setup Area / Footprint Dimension (Strictly Tier 1 directly under Outriggers) */}
          {((groundAccess?.setupAreaLength !== undefined && groundAccess.setupAreaLength > 0) ||
            (groundAccess?.setupAreaWidth !== undefined && groundAccess.setupAreaWidth > 0)) && (() => {
            const setupL = groundAccess?.setupAreaLength || groundAccess?.setupAreaWidth || 0;
            const setupW = groundAccess?.setupAreaWidth || groundAccess?.setupAreaLength || 0;
            // Outrigger bounds under the chassis
            const xLeft = cranePivotX - 78;
            const xRight = cranePivotX + 34;
            const midX = (xLeft + xRight) / 2;
            const dimY = groundY + 12;
            const strokeCol = isSetupAreaHighlighted ? '#c01823' : '#0f172a';

            return (
              <g>
                {/* Horizontal Dimension Line */}
                <line
                  x1={xLeft}
                  y1={dimY}
                  x2={xRight}
                  y2={dimY}
                  stroke={strokeCol}
                  strokeWidth={isSetupAreaHighlighted ? '2' : '1.4'}
                />

                {/* Vertical Bound Ticks */}
                <line
                  x1={xLeft}
                  y1={dimY - 4}
                  x2={xLeft}
                  y2={dimY + 4}
                  stroke={strokeCol}
                  strokeWidth={isSetupAreaHighlighted ? '2' : '1.2'}
                />
                <line
                  x1={xRight}
                  y1={dimY - 4}
                  x2={xRight}
                  y2={dimY + 4}
                  stroke={strokeCol}
                  strokeWidth={isSetupAreaHighlighted ? '2' : '1.2'}
                />

                {/* Dot End Caps */}
                <circle cx={xLeft} cy={dimY} r="2" fill={strokeCol} />
                <circle cx={xRight} cy={dimY} r="2" fill={strokeCol} />

                {/* Dimension Text Below Line (No Box / Pill) */}
                <text
                  x={midX}
                  y={dimY + 14}
                  textAnchor="middle"
                  fontSize={isSetupAreaHighlighted ? '10' : '9'}
                  fontWeight="bold"
                  fill={strokeCol}
                  fontFamily="sans-serif"
                >
                  Setup footprint: {setupL.toFixed(1)}m × {setupW.toFixed(1)}m
                </text>
              </g>
            );
          })()}

          {/* ================= OBSTACLE 1 (WORLD COORDINATES) ================= */}
          {hasObstacles === 'yes' && obs1.active !== false && obs1H > 0 && (
            <g>
              {isObs1Highlighted && (
                <rect
                  x={obs1XPx - 4}
                  y={obs1YPx - 4}
                  width={obs1WidthPx + 8}
                  height={obs1HeightPx + 8}
                  fill="#fee2e2"
                  fillOpacity="0.4"
                  stroke="#c01823"
                  strokeWidth="2"
                  strokeDasharray="4,2"
                  rx="3"
                />
              )}
              <rect
                x={obs1XPx}
                y={obs1YPx}
                width={obs1WidthPx}
                height={obs1HeightPx}
                fill="url(#hatch-pattern)"
                stroke={isObs1Highlighted ? '#c01823' : '#0f172a'}
                strokeWidth={isObs1Highlighted ? '2' : '1.6'}
                rx="1"
              />
              <text
                x={obs1XPx + obs1WidthPx / 2}
                y={obs1YPx - 8}
                textAnchor="middle"
                fontSize={isObs1Highlighted ? '10' : '9'}
                fontWeight="bold"
                fill={isObs1Highlighted ? '#c01823' : '#0f172a'}
                fontFamily="sans-serif"
              >
                {obs1.type || 'Obstacle 1'}
              </text>

              {/* Obstacle 1 Height Arrow Dimension Line */}
              <line
                x1={obs1XPx + obs1WidthPx + 10}
                y1={groundY}
                x2={obs1XPx + obs1WidthPx + 10}
                y2={obs1YPx}
                stroke={isObs1Highlighted ? '#c01823' : '#0f172a'}
                strokeWidth={isObs1Highlighted ? '2' : '1.2'}
                markerStart={isObs1Highlighted ? 'url(#arrow-head-red)' : 'url(#arrow-head-dark)'}
                markerEnd={isObs1Highlighted ? 'url(#arrow-head-red)' : 'url(#arrow-head-dark)'}
              />
              <text
                x={obs1XPx + obs1WidthPx + 16}
                y={(groundY + obs1YPx) / 2 + 3}
                textAnchor="start"
                fontSize={isObs1Highlighted ? '10' : '8.5'}
                fontWeight="bold"
                fill={isObs1Highlighted ? '#c01823' : '#0f172a'}
                fontFamily="sans-serif"
              >
                {obs1H.toFixed(1)} m
              </text>
            </g>
          )}

          {/* ================= OBSTACLE 2 (WORLD COORDINATES) ================= */}
          {hasObstacles === 'yes' && obs2.active && obs2H > 0 && (
            <g>
              {isObs2Highlighted && (
                <rect
                  x={obs2XPx - 4}
                  y={obs2YPx - 4}
                  width={obs2WidthPx + 8}
                  height={obs2HeightPx + 8}
                  fill="#fee2e2"
                  fillOpacity="0.4"
                  stroke="#c01823"
                  strokeWidth="2"
                  strokeDasharray="4,2"
                  rx="3"
                />
              )}
              <rect
                x={obs2XPx}
                y={obs2YPx}
                width={obs2WidthPx}
                height={obs2HeightPx}
                fill="url(#red-hatch)"
                stroke="#c01823"
                strokeWidth={isObs2Highlighted ? '2.5' : '1.5'}
                rx="1"
              />
              <text
                x={obs2XPx + obs2WidthPx / 2}
                y={obs2YPx - 6}
                textAnchor="middle"
                fontSize={isObs2Highlighted ? '10' : '8.5'}
                fontWeight="bold"
                fill="#c01823"
                fontFamily="sans-serif"
              >
                {obs2.type || 'Obstacle 2'} ({obs2H.toFixed(1)}m)
              </text>
            </g>
          )}

          {/* ================= CRANE TRUCK, SUPERSTRUCTURE & CHASSIS (CAD STYLED MARKEWITSCH ALL-TERRAIN) ================= */}
          <g>
            {/* Outrigger Stumps / Vertical Jack Legs with Solid Ground Footing Pads (Matching Client Reference) */}
            {/* Front Stump: Positioned between Wheel 1 and Wheel 2 */}
            <g transform={`translate(${cranePivotX - 56.5}, ${groundY - 14})`}>
              <rect x="0" y="0" width="5" height="11" fill="#c01823" stroke="#0f172a" strokeWidth="0.9" />
              <line x1="0" y1="3" x2="5" y2="5.5" stroke="#ffffff" strokeWidth="1" />
              <line x1="0" y1="6.5" x2="5" y2="9" stroke="#ffffff" strokeWidth="1" />
              <rect x="1" y="11" width="3" height="2" fill="#64748b" />
              <rect x="-2.5" y="11.5" width="10" height="2.5" rx="0.5" fill="#0f172a" stroke="#334155" strokeWidth="0.6" />
            </g>

            {/* Back Stump: Positioned in between the last two wheels (Wheel 3 and Wheel 4) */}
            <g transform={`translate(${cranePivotX - 8.5}, ${groundY - 14})`}>
              <rect x="0" y="0" width="5" height="11" fill="#c01823" stroke="#0f172a" strokeWidth="0.9" />
              <line x1="0" y1="3" x2="5" y2="5.5" stroke="#ffffff" strokeWidth="1" />
              <line x1="0" y1="6.5" x2="5" y2="9" stroke="#ffffff" strokeWidth="1" />
              <rect x="1" y="11" width="3" height="2" fill="#64748b" />
              <rect x="-2.5" y="11.5" width="10" height="2.5" rx="0.5" fill="#0f172a" stroke="#334155" strokeWidth="0.6" />
            </g>

            {/* Rear End Outrigger Box at the back bumper */}
            <g transform={`translate(${cranePivotX + 28}, ${groundY - 14})`}>
              <rect x="0" y="0" width="5.5" height="11" fill="#c01823" stroke="#0f172a" strokeWidth="0.9" />
              <line x1="0" y1="3" x2="5.5" y2="6" stroke="#ffffff" strokeWidth="1" />
              <line x1="0" y1="7" x2="5.5" y2="10" stroke="#ffffff" strokeWidth="1" />
              <rect x="1" y="11" width="3.5" height="2" fill="#64748b" />
              <rect x="-2.5" y="11.5" width="10.5" height="2.5" rx="0.5" fill="#0f172a" stroke="#334155" strokeWidth="0.6" />
            </g>

            {/* Carrier Chassis Main Frame (Traffic Red #c01823) */}
            <rect
              x={cranePivotX - 74}
              y={groundY - 24}
              width="108"
              height="13"
              rx="1.5"
              fill="#c01823"
              stroke="#0f172a"
              strokeWidth="1.2"
            />
            {/* Top Deck Walkway / Catwalk */}
            <rect
              x={cranePivotX - 72}
              y={groundY - 25}
              width="104"
              height="2"
              fill="#cbd5e1"
              stroke="#64748b"
              strokeWidth="0.6"
            />

            {/* Driver Cab (Front Left) */}
            <path
              d={`M ${cranePivotX - 74} ${groundY - 11} L ${cranePivotX - 74} ${groundY - 24} L ${cranePivotX - 70} ${groundY - 32} L ${cranePivotX - 48} ${groundY - 32} L ${cranePivotX - 44} ${groundY - 24} L ${cranePivotX - 44} ${groundY - 11} Z`}
              fill="#c01823"
              stroke="#0f172a"
              strokeWidth="1.2"
            />
            {/* Driver Windshield & Side Window */}
            <path
              d={`M ${cranePivotX - 72} ${groundY - 24} L ${cranePivotX - 69} ${groundY - 30.5} L ${cranePivotX - 50} ${groundY - 30.5} L ${cranePivotX - 48} ${groundY - 24} Z`}
              fill="#bae6fd"
              stroke="#0284c7"
              strokeWidth="0.8"
            />
            {/* Driver Cab Official Logo directly on cab */}
            <image
              href={MARKEWITSCH_LOGO}
              xlinkHref={MARKEWITSCH_LOGO}
              x={cranePivotX - 70}
              y={groundY - 21}
              width="22"
              height="8"
              preserveAspectRatio="xMidYMid meet"
            />

            {/* 4 Heavy-Duty All-Terrain Wheels with Red Hubs */}
            {[
              cranePivotX - 64,
              cranePivotX - 44,
              cranePivotX - 16,
              cranePivotX + 4,
            ].map((wx, i) => (
              <g key={i}>
                <circle cx={wx} cy={groundY - 6.5} r="6.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />
                <circle cx={wx} cy={groundY - 6.5} r="4" fill="#c01823" stroke="#991b1b" strokeWidth="0.8" />
                <circle cx={wx} cy={groundY - 6.5} r="2" fill="#e2e8f0" stroke="#475569" strokeWidth="0.6" />
                <circle cx={wx} cy={groundY - 6.5} r="0.8" fill="#0f172a" />
              </g>
            ))}

            {/* Slewing Turntable Platform */}
            <rect
              x={cranePivotX - 40}
              y={groundY - 26.5}
              width="68"
              height="3"
              rx="0.8"
              fill="#334155"
              stroke="#0f172a"
              strokeWidth="0.8"
            />

            {/* Superstructure Housing & Stepped Counterweights (CAD Reference Style) */}
            {/* Front Operator Cab / Superstructure base (Left of pivot) */}
            <path
              d={`M ${cranePivotX - 38} ${groundY - 26.5} L ${cranePivotX - 38} ${groundY - 37} L ${cranePivotX - 12} ${groundY - 37} L ${cranePivotX - 8} ${groundY - 26.5} Z`}
              fill="#c01823"
              stroke="#0f172a"
              strokeWidth="1.1"
            />
            {/* Operator Cab Glazing */}
            <path
              d={`M ${cranePivotX - 35} ${groundY - 28} L ${cranePivotX - 35} ${groundY - 35.5} L ${cranePivotX - 14} ${groundY - 35.5} L ${cranePivotX - 11} ${groundY - 28} Z`}
              fill="#bae6fd"
              stroke="#0284c7"
              strokeWidth="0.8"
            />

            {/* Rear Stepped Counterweight Block with Official Logo (No white box) */}
            <g transform={`translate(${cranePivotX + 6}, ${groundY - 38})`}>
              <path
                d="M 0 11.5 L 0 3 L 20 3 L 25 11.5 Z"
                fill="#c01823"
                stroke="#0f172a"
                strokeWidth="1.1"
              />
              <line x1="0" y1="7" x2="22" y2="7" stroke="#7f1d1d" strokeWidth="0.8" />
              {/* Ballast Official Logo directly on red ballast */}
              <image
                href={MARKEWITSCH_LOGO}
                xlinkHref={MARKEWITSCH_LOGO}
                x="1"
                y="3"
                width="20"
                height="7"
                preserveAspectRatio="xMidYMid meet"
              />
            </g>

            {/* Boom Heel Pivot Bracket Housing */}
            <path
              d={`M ${cranePivotX - 7} ${cranePivotY + 7} L ${cranePivotX - 5} ${cranePivotY - 4} L ${cranePivotX + 5} ${cranePivotY - 4} L ${cranePivotX + 7} ${cranePivotY + 7} Z`}
              fill="#991b1b"
              stroke="#0f172a"
              strokeWidth="1.1"
            />
          </g>

          {/* ================= TELESCOPIC BOOM ASSEMBLY (SOLID CAD MARKEWITSCH BOOM) ================= */}
          {/* Hydraulic Luffing Cylinder (raising the boom) */}
          <g>
            <line
              x1={cranePivotX - 8}
              y1={cranePivotY + 6}
              x2={cranePivotX - 8 + ((cranePivotX + boomLengthPx * 0.28 * Math.cos(radAngle)) - (cranePivotX - 8)) * 0.6}
              y2={cranePivotY + 6 + ((cranePivotY - boomLengthPx * 0.28 * Math.sin(radAngle)) - (cranePivotY + 6)) * 0.6}
              stroke="#c01823"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <line
              x1={cranePivotX - 8 + ((cranePivotX + boomLengthPx * 0.28 * Math.cos(radAngle)) - (cranePivotX - 8)) * 0.45}
              y1={cranePivotY + 6 + ((cranePivotY - boomLengthPx * 0.28 * Math.sin(radAngle)) - (cranePivotY + 6)) * 0.45}
              x2={cranePivotX + boomLengthPx * 0.28 * Math.cos(radAngle)}
              y2={cranePivotY - boomLengthPx * 0.28 * Math.sin(radAngle)}
              stroke="#e2e8f0"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* Solid Telescopic Boom Arm Rotated Cleanly from the Pivot Pin */}
          <g transform={`translate(${cranePivotX}, ${cranePivotY}) rotate(${-activeBoomAngle})`}>
            {/* Stage 1: Base Boom Section (Thick Solid CAD Red Section) */}
            <rect
              x="-4"
              y="-4.5"
              width={Math.max(20, boomLengthPx * 0.44 + 4)}
              height="9"
              rx="1.2"
              fill="#c01823"
              stroke="#0f172a"
              strokeWidth="1.2"
            />

            {/* Official Markewitsch Logo directly on the Base Boom Section (No white box) */}
            {boomLengthPx > 40 && (
              <image
                href={MARKEWITSCH_LOGO}
                xlinkHref={MARKEWITSCH_LOGO}
                x={Math.max(4, boomLengthPx * 0.05)}
                y="-4"
                width={Math.min(34, boomLengthPx * 0.36)}
                height="8"
                preserveAspectRatio="xMidYMid meet"
              />
            )}

            {/* Telescopic Collar 1 */}
            <rect
              x={boomLengthPx * 0.4}
              y="-5.2"
              width="4.5"
              height="10.4"
              rx="0.8"
              fill="#991b1b"
              stroke="#0f172a"
              strokeWidth="1"
            />

            {/* Stage 2: Intermediate Telescopic Section */}
            <rect
              x={boomLengthPx * 0.42}
              y="-3.8"
              width={Math.max(15, boomLengthPx * 0.35)}
              height="7.6"
              rx="1"
              fill="#c01823"
              stroke="#0f172a"
              strokeWidth="1.1"
            />

            {/* Telescopic Collar 2 */}
            <rect
              x={boomLengthPx * 0.73}
              y="-4.4"
              width="4"
              height="8.8"
              rx="0.8"
              fill="#991b1b"
              stroke="#0f172a"
              strokeWidth="1"
            />

            {/* Stage 3: Upper Telescopic Fly Section */}
            <rect
              x={boomLengthPx * 0.75}
              y="-3.1"
              width={Math.max(12, boomLengthPx * 0.25)}
              height="6.2"
              rx="0.8"
              fill="#c01823"
              stroke="#0f172a"
              strokeWidth="1.1"
            />

            {/* Boom Tip Sheave Wheel */}
            <g transform={`translate(${boomLengthPx}, 0)`}>
              <path
                d="M -3 -3.1 L 4 -2 L 5.5 2 L -3 3.1 Z"
                fill="#991b1b"
                stroke="#0f172a"
                strokeWidth="1"
              />
              <circle cx="4" cy="0" r="3.2" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1" />
              <circle cx="4" cy="0" r="1.2" fill="#0f172a" />
            </g>
          </g>

          {/* Boom Foot Hinge Pin Circle */}
          <circle cx={cranePivotX} cy={cranePivotY} r="3.8" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
          <circle cx={cranePivotX} cy={cranePivotY} r="1.8" fill="#e2e8f0" />

          {/* Vertical Hoist Wire Rope Cable (dropping straight down from sheave to hook) */}
          <line
            x1={tipX}
            y1={tipY + 3.5}
            x2={tipX}
            y2={hookY}
            stroke="#0f172a"
            strokeWidth="1.6"
            strokeDasharray="3,2"
          />

          {/* Crane Hook Block (Tadano / Markewitsch Style with Red Body & Safety Stripes) */}
          <g transform={`translate(${tipX}, ${hookY})`}>
            {/* Hook Block Sheave */}
            <circle cx="0" cy="0" r="3.5" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="1.2" fill="#0f172a" />

            {/* Hook Block Body (Red with Warning Chevron) */}
            <path
              d="M -3.5 3 L 3.5 3 L 2.5 7 L -2.5 7 Z"
              fill="#c01823"
              stroke="#0f172a"
              strokeWidth="1"
            />
            <line x1="-3" y1="4.5" x2="3" y2="5.5" stroke="#ffffff" strokeWidth="0.8" />

            {/* Heavy Forged Lifting Hook */}
            <path
              d="M 0 7 Q 3.5 9.5, 0 12.5 Q -3 11, -2 8.5"
              stroke="#0f172a"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Rigging Bridle Wires spreading down to load corners */}
          <line
            x1={tipX}
            y1={hookY + 12}
            x2={loadX - loadW / 2 + 3}
            y2={loadY}
            stroke="#0f172a"
            strokeWidth="1.2"
          />
          <line
            x1={tipX}
            y1={hookY + 12}
            x2={loadX + loadW / 2 - 3}
            y2={loadY}
            stroke="#0f172a"
            strokeWidth="1.2"
          />

          {/* ================= SUSPENDED LOAD BOX (CLEANLY ELEVATED, ZERO COLLISION) ================= */}
          <g>
            {isLoadHighlighted && (
              <rect
                x={loadX - loadW / 2 - 3}
                y={loadY - 3}
                width={loadW + 6}
                height={loadH + 6}
                fill="#fee2e2"
                fillOpacity="0.4"
                stroke="#c01823"
                strokeWidth="1.8"
                strokeDasharray="4,2"
                rx="5"
              />
            )}
            <rect
              x={loadX - loadW / 2}
              y={loadY}
              width={loadW}
              height={loadH}
              rx="3"
              fill="#ffffff"
              stroke="#c01823"
              strokeWidth={isLoadHighlighted ? '2.2' : '1.6'}
              className="drop-shadow-2xs"
            />
            {/* Load Weight Text */}
            <text
              x={loadX}
              y={
                dimensions.length > 0 || dimensions.width > 0 || dimensions.height > 0
                  ? loadY + 11
                  : loadY + 17
              }
              textAnchor="middle"
              fontSize={loadWeight > 99 ? '9' : '10'}
              fontWeight="bold"
              fill="#c01823"
              fontFamily="sans-serif"
            >
              {loadWeight > 0 ? `${loadWeight} t` : 'Load'}
            </text>

            {/* Load Dimensions Text */}
            {(dimensions.length > 0 || dimensions.width > 0 || dimensions.height > 0) && (
              <text
                x={loadX}
                y={loadY + 21}
                textAnchor="middle"
                fontSize="6.5"
                fontWeight="bold"
                fill="#64748b"
                fontFamily="sans-serif"
              >
                {dimensions.length || 0}×{dimensions.width || 0}×{dimensions.height || 0}m
              </text>
            )}
          </g>

          {/* ================= BOOM LENGTH DIRECT GEOMETRY ANNOTATION (CLEAN TEXT ALONG BOOM) ================= */}
          {nominalBoomLengthM > 0 && (
            <text
              x={(cranePivotX + tipX) / 2 - 16 * Math.sin(radAngle)}
              y={(cranePivotY + tipY) / 2 - 16 * Math.cos(radAngle)}
              textAnchor="middle"
              fontSize={isBoomLengthHighlighted ? '11' : '9.5'}
              fontWeight="bold"
              fill={isBoomLengthHighlighted ? '#c01823' : '#0f172a'}
              fontFamily="sans-serif"
            >
              {nominalBoomLengthM.toFixed(1)} m
            </text>
          )}

          {/* ================= BOOM ANGLE ARC & DEGREE LABEL ================= */}
          {isOutreachCalculated && isLiftingHeightCalculated && (
            <g>
              <path
                d={`M ${cranePivotX + 44} ${cranePivotY} A 44 44 0 0 0 ${
                  cranePivotX + 44 * Math.cos(radAngle)
                } ${cranePivotY - 44 * Math.sin(radAngle)}`}
                fill="none"
                stroke="#c01823"
                strokeWidth={isBoomAngleHighlighted ? '2.4' : '1.4'}
                strokeDasharray={isBoomAngleHighlighted ? undefined : '3,3'}
              />
              <text
                x={cranePivotX + 50}
                y={cranePivotY - 14}
                textAnchor="start"
                fontSize={isBoomAngleHighlighted ? '13' : '11'}
                fontWeight="bold"
                fill="#c01823"
                fontFamily="sans-serif"
              >
                {activeBoomAngle}°
              </text>
            </g>
          )}

          {/* ================= LIFTING HEIGHT H DIMENSION (FAR RIGHT) ================= */}
          {isLiftingHeightCalculated && activeLiftingHeight > 0 && (
            <g>
              <line
                x1={Math.max(loadX + loadW / 2 + 28, obs1XPx + obs1WidthPx + 36)}
                y1={groundY}
                x2={Math.max(loadX + loadW / 2 + 28, obs1XPx + obs1WidthPx + 36)}
                y2={tipY}
                stroke={isLiftingHeightHighlighted ? '#c01823' : '#0f172a'}
                strokeWidth={isLiftingHeightHighlighted ? '2.2' : '1.4'}
                strokeDasharray="4,4"
                markerStart={isLiftingHeightHighlighted ? 'url(#arrow-head-red)' : 'url(#arrow-head-dark)'}
                markerEnd={isLiftingHeightHighlighted ? 'url(#arrow-head-red)' : 'url(#arrow-head-dark)'}
              />
              <text
                x={Math.max(loadX + loadW / 2 + 36, obs1XPx + obs1WidthPx + 44)}
                y={(groundY + tipY) / 2 + 4}
                textAnchor="start"
                fontSize={isLiftingHeightHighlighted ? '12.5' : '11'}
                fontWeight="bold"
                fill={isLiftingHeightHighlighted ? '#c01823' : '#0f172a'}
                fontFamily="sans-serif"
              >
                {activeLiftingHeight.toFixed(1)} m
              </text>
            </g>
          )}

          {/* ================= HORIZONTAL OUTREACH DIMENSIONS (BELOW GROUND) ================= */}
          {isOutreachCalculated && (
            <>
              {hasObstacles === 'yes' && inputA > 0 && inputB > 0 ? (
                <g>
                  {/* Dim A: Crane Pivot to Obstacle 1 (Tier 2, groundY + 44) */}
                  <line
                    x1={cranePivotX}
                    y1={groundY + 44}
                    x2={obs1XPx}
                    y2={groundY + 44}
                    stroke={isAHighlighted ? '#c01823' : '#0f172a'}
                    strokeWidth={isAHighlighted ? '2' : '1.2'}
                    markerStart={isAHighlighted ? 'url(#arrow-head-red)' : 'url(#arrow-head-dark)'}
                    markerEnd={isAHighlighted ? 'url(#arrow-head-red)' : 'url(#arrow-head-dark)'}
                  />
                  <line
                    x1={cranePivotX}
                    y1={groundY + 36}
                    x2={cranePivotX}
                    y2={groundY + 52}
                    stroke={isAHighlighted ? '#c01823' : '#0f172a'}
                    strokeWidth={isAHighlighted ? '2' : '1.2'}
                  />
                  <line
                    x1={obs1XPx}
                    y1={groundY + 36}
                    x2={obs1XPx}
                    y2={groundY + 52}
                    stroke={isAHighlighted ? '#c01823' : '#0f172a'}
                    strokeWidth={isAHighlighted ? '2' : '1.2'}
                  />
                  {/* Label A (Clean text, no box/pill) */}
                  <text
                    x={(cranePivotX + obs1XPx) / 2}
                    y={groundY + 38}
                    textAnchor="middle"
                    fontSize={isAHighlighted ? '11' : '9.5'}
                    fontWeight="bold"
                    fill={isAHighlighted ? '#c01823' : '#0f172a'}
                    fontFamily="sans-serif"
                  >
                    A
                  </text>
                  <text
                    x={(cranePivotX + obs1XPx) / 2}
                    y={groundY + 58}
                    textAnchor="middle"
                    fontSize={isAHighlighted ? '10' : '9'}
                    fontWeight="bold"
                    fill={isAHighlighted ? '#c01823' : '#0f172a'}
                    fontFamily="sans-serif"
                  >
                    {inputA.toFixed(1)} m
                  </text>

                  {/* Dim B: Obstacle 1 to Lifting Point (Tier 2, groundY + 44) */}
                  <line
                    x1={obs1XPx}
                    y1={groundY + 44}
                    x2={cranePivotX + calculatedOutreach * meterScale}
                    y2={groundY + 44}
                    stroke={isBHighlighted ? '#c01823' : '#0f172a'}
                    strokeWidth={isBHighlighted ? '2' : '1.2'}
                    markerStart={isBHighlighted ? 'url(#arrow-head-red)' : 'url(#arrow-head-dark)'}
                    markerEnd={isBHighlighted ? 'url(#arrow-head-red)' : 'url(#arrow-head-dark)'}
                  />
                  <line
                    x1={cranePivotX + calculatedOutreach * meterScale}
                    y1={groundY + 36}
                    x2={cranePivotX + calculatedOutreach * meterScale}
                    y2={groundY + 52}
                    stroke={isBHighlighted ? '#c01823' : '#0f172a'}
                    strokeWidth={isBHighlighted ? '2' : '1.2'}
                  />
                  {/* Label B (Clean text, no box/pill) */}
                  <text
                    x={(obs1XPx + cranePivotX + calculatedOutreach * meterScale) / 2}
                    y={groundY + 38}
                    textAnchor="middle"
                    fontSize={isBHighlighted ? '11' : '9.5'}
                    fontWeight="bold"
                    fill={isBHighlighted ? '#c01823' : '#0f172a'}
                    fontFamily="sans-serif"
                  >
                    B
                  </text>
                  <text
                    x={(obs1XPx + cranePivotX + calculatedOutreach * meterScale) / 2}
                    y={groundY + 58}
                    textAnchor="middle"
                    fontSize={isBHighlighted ? '10' : '9'}
                    fontWeight="bold"
                    fill={isBHighlighted ? '#c01823' : '#0f172a'}
                    fontFamily="sans-serif"
                  >
                    {inputB.toFixed(1)} m
                  </text>

                  {/* Total Outreach Dimension (Tier 3 underneath A & B, groundY + 78) */}
                  <line
                    x1={cranePivotX}
                    y1={groundY + 78}
                    x2={cranePivotX + calculatedOutreach * meterScale}
                    y2={groundY + 78}
                    stroke="#0f172a"
                    strokeWidth="1.2"
                    markerStart="url(#arrow-head-dark)"
                    markerEnd="url(#arrow-head-dark)"
                  />
                  <line
                    x1={cranePivotX}
                    y1={groundY + 70}
                    x2={cranePivotX}
                    y2={groundY + 86}
                    stroke="#0f172a"
                    strokeWidth="1.2"
                  />
                  <line
                    x1={cranePivotX + calculatedOutreach * meterScale}
                    y1={groundY + 70}
                    x2={cranePivotX + calculatedOutreach * meterScale}
                    y2={groundY + 86}
                    stroke="#0f172a"
                    strokeWidth="1.2"
                  />
                  <text
                    x={(cranePivotX + cranePivotX + calculatedOutreach * meterScale) / 2}
                    y={groundY + 94}
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="bold"
                    fill="#0f172a"
                    fontFamily="sans-serif"
                  >
                    Total outreach = {calculatedOutreach.toFixed(1)} m
                  </text>
                </g>
              ) : (
                /* Total Outreach Single Line when no obstacle */
                calculatedOutreach > 0 && (
                  <g>
                    <line
                      x1={cranePivotX}
                      y1={groundY + 44}
                      x2={cranePivotX + calculatedOutreach * meterScale}
                      y2={groundY + 44}
                      stroke={isAHighlighted ? '#c01823' : '#0f172a'}
                      strokeWidth={isAHighlighted ? '2' : '1.2'}
                      markerStart={isAHighlighted ? 'url(#arrow-head-red)' : 'url(#arrow-head-dark)'}
                      markerEnd={isAHighlighted ? 'url(#arrow-head-red)' : 'url(#arrow-head-dark)'}
                    />
                    <line
                      x1={cranePivotX}
                      y1={groundY + 36}
                      x2={cranePivotX}
                      y2={groundY + 52}
                      stroke={isAHighlighted ? '#c01823' : '#0f172a'}
                      strokeWidth={isAHighlighted ? '2' : '1.2'}
                    />
                    <line
                      x1={cranePivotX + calculatedOutreach * meterScale}
                      y1={groundY + 36}
                      x2={cranePivotX + calculatedOutreach * meterScale}
                      y2={groundY + 52}
                      stroke={isAHighlighted ? '#c01823' : '#0f172a'}
                      strokeWidth={isAHighlighted ? '2' : '1.2'}
                    />
                    <text
                      x={(cranePivotX + cranePivotX + calculatedOutreach * meterScale) / 2}
                      y={groundY + 38}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="600"
                      fill={isAHighlighted ? '#c01823' : '#64748b'}
                      fontFamily="sans-serif"
                    >
                      Distance to lift point
                    </text>
                    <text
                      x={(cranePivotX + cranePivotX + calculatedOutreach * meterScale) / 2}
                      y={groundY + 58}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="bold"
                      fill={isAHighlighted ? '#c01823' : '#0f172a'}
                      fontFamily="sans-serif"
                    >
                      {calculatedOutreach.toFixed(1)} m
                    </text>
                  </g>
                )
              )}
            </>
          )}
        </svg>

        {/* Floating Bottom Control Bar with Pan / Hand Tool & Demo Button */}
        {!hideFloatingToolbar && (
          <div className="absolute right-4 bottom-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl p-1.5 shadow-md">
            {onFillDemo && (
              <button
                type="button"
                onClick={onFillDemo}
                title="Fill sample site values"
                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-[#c01823] border border-red-200/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fill demo values</span>
              </button>
            )}

            <div className="h-4 w-px bg-slate-200" />

            {/* Pan / Move Indicator */}
            <div
              title="Drag with mouse or touch to pan"
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
            >
              <Hand className="w-4 h-4" />
            </div>

            <button
              type="button"
              onClick={() => handleZoom(0.15)}
              title="Zoom In"
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-slate-900 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(-0.15)}
              title="Zoom Out"
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-slate-900 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetPanZoom}
              title="Reset View and Pan"
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-slate-900 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
