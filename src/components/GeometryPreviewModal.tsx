import React from 'react';
import { X, Maximize2, RotateCcw, Info } from 'lucide-react';
import { EngineeringCanvas } from './EngineeringCanvas';
import { CraneModel, LiftParameters } from '../types';

interface GeometryPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  parameters: LiftParameters;
  selectedCrane: CraneModel;
  configuredBoomLength: number;
}

export const GeometryPreviewModal: React.FC<GeometryPreviewModalProps> = ({
  isOpen,
  onClose,
  parameters,
  selectedCrane,
  configuredBoomLength,
}) => {
  if (!isOpen) return null;

  // Clone parameters with current configured boom length for complete 2D geometric visualization
  const activeParams: LiftParameters = {
    ...parameters,
    boomLength: configuredBoomLength,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
              <Maximize2 className="w-4 h-4 text-[#c01823]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Expanded 2D Lift Geometry – {selectedCrane.name} ({configuredBoomLength}m Boom)
              </h2>
              <p className="text-xs text-slate-500">
                Complete engineering elevation, obstacle line-of-sight clearance, and working radius
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Canvas Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <EngineeringCanvas
            parameters={activeParams}
            highlightedElement={null}
          />

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 text-xs text-slate-600 flex items-center gap-2.5">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              The 2D representation is an indicative planning view, not an exact technical lift plan. You can click and drag with the hand tool to pan around the canvas.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#c01823] hover:bg-[#a5131c] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            Close expanded view
          </button>
        </div>
      </div>
    </div>
  );
};
