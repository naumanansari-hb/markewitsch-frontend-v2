import React from 'react';
import { X, Truck, ShieldCheck, Ruler, Weight, Compass, ArrowUpRight } from 'lucide-react';
import { CraneModel } from '../types';
import { CraneIllustration } from './CraneIllustration';

interface CraneDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  crane: CraneModel | null;
  onOpenLoadChart: (crane: CraneModel) => void;
}

export const CraneDetailsModal: React.FC<CraneDetailsModalProps> = ({
  isOpen,
  onClose,
  crane,
  onOpenLoadChart,
}) => {
  if (!isOpen || !crane) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-[#c01823]">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Crane Specifications – {crane.name}
              </h2>
              <p className="text-xs text-slate-500">
                {crane.type} technical specifications & carrier profile
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

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Visual Header */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-full sm:w-1/2 flex items-center justify-center">
              <CraneIllustration
                craneId={crane.id}
                className="w-full h-32 object-contain"
              />
            </div>
            <div className="w-full sm:w-1/2 space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#c01823] text-white inline-block">
                {crane.badge}
              </span>
              <h3 className="text-xl font-black text-slate-900">{crane.name}</h3>
              <p className="text-xs text-slate-600">
                Heavy-duty mobile crane engineered for precision urban and industrial assembly.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLoadChart(crane);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c01823] hover:text-[#991b1b] bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-100 transition-colors"
                >
                  <span>Open load chart table</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-1">
                <Weight className="w-3.5 h-3.5 text-[#c01823]" />
                <span>Max. Capacity</span>
              </div>
              <span className="text-base font-bold text-slate-900">{crane.maxWeight} tonnes</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-1">
                <Ruler className="w-3.5 h-3.5 text-[#c01823]" />
                <span>Max. Boom Length</span>
              </div>
              <span className="text-base font-bold text-slate-900">{crane.boomLengthMax} m</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-1">
                <Compass className="w-3.5 h-3.5 text-[#c01823]" />
                <span>Max. Working Radius</span>
              </div>
              <span className="text-base font-bold text-slate-900">{crane.maxRadius} m</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block mb-1">Vehicle Length</span>
              <span className="text-sm font-bold text-slate-900">
                {crane.id === 'mk-30' ? '8.9 m' : crane.id === 'tk-60' ? '11.8 m' : '10.5 m'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block mb-1">Vehicle Width</span>
              <span className="text-sm font-bold text-slate-900">2.55 m</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block mb-1">Axle Configuration</span>
              <span className="text-sm font-bold text-slate-900">
                {crane.id === 'mk-30' ? '2-Axle (4x4x4)' : crane.id === 'tk-60' ? '4-Axle (8x6x8)' : '3-Axle (6x6x6)'}
              </span>
            </div>
          </div>

          {/* Key Features */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Standard equipment & key capabilities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {crane.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>DIN / EN 13000 safety standard compliance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#c01823] hover:bg-[#a5131c] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
