import React, { useState } from 'react';
import {
  Check,
  ExternalLink,
  Info,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Table2,
  Loader2,
} from 'lucide-react';
import { CraneModel, LiftParameters } from '../types';
import { CRANE_MODELS } from '../data/cranes';
import { CraneIllustration } from './CraneIllustration';
import { LoadChartModal } from './LoadChartModal';
import { GeometryPreviewModal } from './GeometryPreviewModal';
import { EngineeringCanvas } from './EngineeringCanvas';
import { CraneDetailsModal } from './CraneDetailsModal';

const PUBLIC_ROAD_CHARGE_TEXT = '[ + Upto 1500 EUR ]';

interface CraneRecommendationsStepProps {
  parameters: LiftParameters;
  selectedCrane: CraneModel;
  setSelectedCrane: (crane: CraneModel) => void;
  configuredBoomLength: number;
  setConfiguredBoomLength: (len: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export const CraneRecommendationsStep: React.FC<CraneRecommendationsStepProps> = ({
  parameters,
  selectedCrane,
  setSelectedCrane,
  configuredBoomLength,
  setConfiguredBoomLength,
  onBack,
  onNext,
}) => {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [activeLoadChartCrane, setActiveLoadChartCrane] = useState<CraneModel | null>(null);
  const [activeDetailsCrane, setActiveDetailsCrane] = useState<CraneModel | null>(null);
  const [isGeometryModalOpen, setIsGeometryModalOpen] = useState(false);

  // Generate selectable boom length options (step of 5m from 15m to boomLengthMax)
  const rawBoomValues: number[] = [];
  for (let val = 15; val <= selectedCrane.boomLengthMax; val += 5) {
    rawBoomValues.push(val);
  }
  if (!rawBoomValues.includes(selectedCrane.boomLengthMax)) {
    rawBoomValues.push(selectedCrane.boomLengthMax);
  }

  // Required weight for lift
  const requiredGrossWeight = parameters.loadWeight > 0 ? parameters.loadWeight : 12.0;

  // Valid selectable boom values for scale and range clamping
  const allowedBoomValues = rawBoomValues.filter(
    (_, idx) => idx < Math.max(1, rawBoomValues.length - 2)
  );

  // Handle boom length change with 1.2s recommendation recalculation loader
  const handleBoomLengthChange = (newLength: number) => {
    // Clamp to allowed boom values if user attempts disabled length
    const maxAllowed = allowedBoomValues[allowedBoomValues.length - 1] || 15;
    const clampedLength = Math.min(newLength, maxAllowed);

    setConfiguredBoomLength(clampedLength);
    setIsRecalculating(true);
    setTimeout(() => {
      setIsRecalculating(false);
    }, 1200);
  };

  // Mini geometry calculation based on active boom length and angle
  const boomAngleDeg = parameters.boomAngle && parameters.boomAngle > 0 ? parameters.boomAngle : 48;
  const boomAngleRad = (boomAngleDeg * Math.PI) / 180;

  // Pivot pin in SVG coordinates
  const pivotX = 55;
  const pivotY = 108;

  // Calculate dynamic boom length in SVG pixels
  const minBoomM = 15;
  const maxBoomM = Math.max(60, selectedCrane.boomLengthMax);
  const boomLengthPx = 80 + ((configuredBoomLength - minBoomM) / (maxBoomM - minBoomM)) * 135;

  // Boom tip coordinates
  const tipX = pivotX + boomLengthPx * Math.cos(boomAngleRad);
  const tipY = pivotY - boomLengthPx * Math.sin(boomAngleRad);

  // Telescopic collar positions
  const stage1T = 0.45;
  const stage1X = pivotX + (tipX - pivotX) * stage1T;
  const stage1Y = pivotY + (tipY - pivotY) * stage1T;

  const stage2T = 0.78;
  const stage2X = pivotX + (tipX - pivotX) * stage2T;
  const stage2Y = pivotY + (tipY - pivotY) * stage2T;

  // Suspended load coordinates
  const cableDropPx = 20;
  const hookY = tipY + cableDropPx;
  const loadBoxY = hookY + 12;
  const loadBoxW = 28;
  const loadBoxH = 18;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Subtitle in clean sentence case */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
          Recommended cranes & indicative price
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Based on your lift requirements, site conditions and obstacle clearance.
        </p>
      </div>

      {/* 2-Column Layout: Left List of Cranes + Right Selected Crane Config & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Crane Model Cards */}
        <div className="lg:col-span-7 space-y-4 relative">
          {/* Recalculating Loader Overlay when Boom Length is Adjusted */}
          {isRecalculating && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-2xs z-30 rounded-2xl flex flex-col items-center justify-center p-6 space-y-3 animate-in fade-in duration-200">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[#c01823]">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-900">
                  Re-evaluating crane suitability...
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculating load charts and geometry for {configuredBoomLength} m boom length
                </p>
              </div>
            </div>
          )}

          {CRANE_MODELS.map((crane) => {
            const isSelected = selectedCrane.id === crane.id;

            return (
              <div
                key={crane.id}
                onClick={() => {
                  setSelectedCrane(crane);
                  if (configuredBoomLength > crane.boomLengthMax) {
                    handleBoomLengthChange(crane.boomLengthMax);
                  }
                }}
                className={`relative bg-white rounded-3xl border-2 transition-all cursor-pointer overflow-hidden p-6 sm:p-7 ${
                  isSelected
                    ? 'border-[#c01823] shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Top Header: Badge, Crane Name, and Radio Selector */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                        crane.badge === 'Recommended'
                          ? 'bg-[#c01823] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {crane.badge}
                    </span>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight">
                      {crane.name}
                    </h3>
                  </div>

                  {/* Radio indicator matching screenshot exactly */}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#c01823] p-[2px]'
                        : 'border-2 border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-[2px]">
                        <div className="w-full h-full rounded-full bg-[#c01823]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body: Left Illustration Box + Right Details & Specs */}
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {/* Crane Visual Render Box with subtle rounded background */}
                  <div className="w-full sm:w-48 h-40 sm:h-44 bg-[#f8fafc] rounded-2xl border border-slate-100/80 flex items-center justify-center p-3 shrink-0">
                    <CraneIllustration
                      craneId={crane.id}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Crane Details & Specs */}
                  <div className="flex-1 min-w-0 space-y-3.5 w-full">
                    {/* Badges in 2 clean inline rows exactly as shown in screenshot */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2.5">
                        <span className="px-3.5 py-1.5 bg-[#f1f5f9]/80 border border-slate-200/70 rounded-lg text-xs text-slate-600">
                          Boom: <strong className="font-bold text-slate-900 font-mono ml-0.5">{crane.boomLengthMax} m</strong>
                        </span>
                        <span className="px-3.5 py-1.5 bg-[#f1f5f9]/80 border border-slate-200/70 rounded-lg text-xs text-slate-600">
                          Required gross weight: <strong className="font-bold text-slate-900 font-mono ml-0.5">{requiredGrossWeight.toFixed(1)} t</strong>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        <span className="px-3.5 py-1.5 bg-[#f1f5f9]/80 border border-slate-200/70 rounded-lg text-xs text-slate-600">
                          Crane Capacity: <strong className="font-bold text-slate-900 font-mono ml-0.5">{crane.maxWeight} t</strong>
                        </span>
                        <span className="px-3.5 py-1.5 bg-[#f1f5f9]/80 border border-slate-200/70 rounded-lg text-xs text-slate-600">
                          Max. radius: <strong className="font-bold text-slate-900 font-mono ml-0.5">{crane.maxRadius} m</strong>
                        </span>
                      </div>
                    </div>

                    {/* Feature Checkmarks list stacked vertically as shown in screenshot */}
                    <div className="space-y-1.5 text-xs text-slate-700">
                      {crane.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#c01823] shrink-0 stroke-[2.5]" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Action Links & Indicative Price strictly right-aligned */}
                    <div className="w-full flex flex-wrap items-end justify-between gap-y-3 gap-x-4 pt-2">
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLoadChartCrane(crane);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c01823] hover:text-[#991b1b] bg-[#fef2f2] hover:bg-[#fee2e2] px-3.5 py-1.5 rounded-lg border border-red-200 transition-colors shadow-2xs cursor-pointer shrink-0"
                        >
                          <Table2 className="w-3.5 h-3.5" />
                          <span>View load chart</span>
                        </button>

                        {/* View crane details - Shows clickable but does not open any popup */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Clickable visual feedback without opening any modal
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer shrink-0"
                        >
                          <span>View crane details</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>

                      {/* Indicative Price strictly right-aligned on the row */}
                      <div className="ml-auto text-right flex flex-col items-end shrink-0">
                        <div className="text-[11px] text-slate-400 font-medium flex items-center justify-end gap-1">
                          <span>Indicative price</span>
                          <Info className="w-3 h-3 text-slate-400" />
                        </div>
                        <div className="text-base sm:text-lg font-bold text-slate-900 font-mono leading-tight text-right">
                          €{crane.priceMin.toLocaleString()} – €{crane.priceMax.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium text-right">
                          VAT not included
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Crane Configuration & Price Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5 sticky top-24">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Selected crane
            </span>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mt-0.5">
              {selectedCrane.name}
            </h2>
          </div>

          {/* Adjust Boom Length Slider (only slider with red filled progress track) */}
          <div className="space-y-2.5 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Adjust boom length
              </label>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-xs font-semibold rounded-md font-mono border border-slate-200">
                {configuredBoomLength} m
              </span>
            </div>

            {/* Slider with discrete steps matching boom length values */}
            {(() => {
              const activeIndex = Math.max(0, rawBoomValues.indexOf(configuredBoomLength));
              const sliderPercentage =
                rawBoomValues.length > 1 ? (activeIndex / (rawBoomValues.length - 1)) * 100 : 0;

              return (
                <div className="space-y-1.5">
                  <input
                    type="range"
                    min={0}
                    max={rawBoomValues.length - 1}
                    step={1}
                    value={activeIndex}
                    onChange={(e) => {
                      const targetIdx = Number(e.target.value);
                      const targetVal = rawBoomValues[targetIdx];
                      if (targetVal) {
                        handleBoomLengthChange(targetVal);
                      }
                    }}
                    style={{
                      background: `linear-gradient(to right, #c01823 ${sliderPercentage}%, #e2e8f0 ${sliderPercentage}%)`,
                    }}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#c01823]"
                  />

                  {/* Synchronized Scale Ticks */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                    {rawBoomValues.map((val, idx) => {
                      const isSelected = val === configuredBoomLength;
                      const isOptionDisabled = idx >= Math.max(1, rawBoomValues.length - 2);

                      return (
                        <span
                          key={val}
                          onClick={() => !isOptionDisabled && handleBoomLengthChange(val)}
                          className={`transition-colors select-none ${
                            isSelected
                              ? 'font-bold text-[#c01823] text-[11px]'
                              : isOptionDisabled
                              ? 'text-slate-300 line-through cursor-not-allowed'
                              : 'text-slate-500 hover:text-slate-900 cursor-pointer'
                          }`}
                          title={isOptionDisabled ? 'Capacity insufficient' : `Set boom length to ${val}m`}
                        >
                          {val}m
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Geometry Preview with interactive Expand Pop-up View */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Geometry preview
              </span>
              <button
                type="button"
                onClick={() => setIsGeometryModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#c01823] hover:text-[#991b1b] bg-red-50 hover:bg-red-100 rounded-lg border border-red-100 transition-colors"
                title="Expand to full diagram"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Expand</span>
              </button>
            </div>

            <div className="w-full h-56 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 relative">
              <EngineeringCanvas
                parameters={{
                  ...parameters,
                  boomLength: configuredBoomLength,
                }}
                hideTopBar={true}
                hideFloatingToolbar={true}
                highlightedElement={null}
              />
            </div>
          </div>

          {/* Estimated Total (Without pricing bifurcation) */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-sm font-extrabold text-slate-900 block">
                Estimated total
              </span>
              <span className="text-[11px] text-slate-500">
                Indicative budget range for recommended crane
              </span>
            </div>
            <div className="text-right">
              <span className="text-base sm:text-lg font-black text-[#c01823] font-mono block">
                €{selectedCrane.priceMin.toLocaleString()} – €{selectedCrane.priceMax.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                VAT not included
              </span>
            </div>
          </div>

          {/* Public Road Charge (Next line item, not presented in a card) */}
          {parameters.setupLocation === 'public_road' && (
            <div
              id="public-road-charge-line"
              className="pt-2.5 border-t border-slate-100 flex items-center justify-between"
            >
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 block">
                  Public road charge
                </span>
                <span className="text-[11px] text-slate-500">
                  Permits & street closure fee
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                  {PUBLIC_ROAD_CHARGE_TEXT}
                </span>
              </div>
            </div>
          )}

          {/* Indicative Pricing Disclaimer / Info Text */}
          <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Info className="w-3.5 h-3.5 text-[#c01823] shrink-0" />
              <span>Indicative quotation notice</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Crane suggestions and pricing are indicative (excl. VAT) and will be validated by our internal staff. Someone will get in touch with you shortly.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          id="back-to-lift-planner-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to lift planner</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#c01823] hover:bg-[#a5131c] text-white text-xs font-semibold rounded-lg shadow-sm transition-all transform active:scale-98"
          id="continue-to-confirmation-btn"
        >
          <span>Continue to confirmation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Load Chart Matrix Modal */}
      {activeLoadChartCrane && (
        <LoadChartModal
          isOpen={Boolean(activeLoadChartCrane)}
          onClose={() => setActiveLoadChartCrane(null)}
          crane={activeLoadChartCrane}
          parameters={parameters}
          configuredBoomLength={configuredBoomLength}
        />
      )}

      {/* Crane Details Specifications Modal - Disabled per user request (no popup on clicking View crane details) */}

      {/* Expanded 2D Geometry Preview Modal */}
      <GeometryPreviewModal
        isOpen={isGeometryModalOpen}
        onClose={() => setIsGeometryModalOpen(false)}
        parameters={parameters}
        selectedCrane={selectedCrane}
        configuredBoomLength={configuredBoomLength}
      />
    </div>
  );
};

