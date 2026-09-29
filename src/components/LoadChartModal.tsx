import React from 'react';
import { X, FileText } from 'lucide-react';
import { LOAD_CHARTS, LoadChartData } from '../data/loadCharts';
import { CraneModel, LiftParameters } from '../types';

interface LoadChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  crane: CraneModel;
  parameters: LiftParameters;
  configuredBoomLength: number;
}

export const LoadChartModal: React.FC<LoadChartModalProps> = ({
  isOpen,
  onClose,
  crane,
  parameters,
  configuredBoomLength,
}) => {
  if (!isOpen) return null;

  const chartData: LoadChartData =
    LOAD_CHARTS[crane.id] || LOAD_CHARTS['tk-40'];

  // User lift geometry points
  const workingRadius =
    parameters.hasObstacles === 'yes'
      ? (parameters.distanceA || 12) + (parameters.distanceB || 8)
      : parameters.distanceA || parameters.requiredOutreach || 18;

  // Find closest radius row and boom length col
  const closestRadiusIdx = chartData.radii.reduce(
    (prevIdx, currVal, idx) =>
      Math.abs(currVal - workingRadius) <
      Math.abs(chartData.radii[prevIdx] - workingRadius)
        ? idx
        : prevIdx,
    0
  );

  const closestBoomIdx = chartData.boomLengths.reduce(
    (prevIdx, currVal, idx) =>
      Math.abs(currVal - configuredBoomLength) <
      Math.abs(chartData.boomLengths[prevIdx] - configuredBoomLength)
        ? idx
        : prevIdx,
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#c01823]" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Load Capacity Chart (Traglasttabelle) – {crane.name}
              </h2>
              <p className="text-xs text-slate-500">
                Telescopic boom load capacity matrix
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

        {/* Load Chart Header (Exact format from user image: Model | Mastlänge | Abstützung) */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center text-slate-900">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Crane Model</span>
                <span className="text-2xl font-black tracking-tight">{chartData.craneName}</span>
              </div>
              <div className="sm:text-center">
                <span className="text-xs text-slate-500 font-medium block">Telescopic Mast Range</span>
                <span className="text-base font-bold">{chartData.maxBoomText}</span>
              </div>
              <div className="sm:text-right">
                <span className="text-xs text-slate-500 font-medium block">Outrigger Footprint</span>
                <span className="text-base font-bold">{chartData.outriggerBaseText}</span>
              </div>
            </div>
          </div>

          {/* Matrix Table (Matching user's attached load chart image design) */}
          <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                {/* Column Headers (Boom Lengths) */}
                <thead>
                  <tr className="bg-slate-300 text-slate-900 font-bold border-b border-slate-400">
                    <th className="py-2.5 px-3 border-r border-slate-300 bg-slate-400 text-slate-900 font-black sticky left-0 z-10 w-14">
                      m
                    </th>
                    {chartData.boomLengths.map((len) => {
                      const is35Header = len === 35.0;
                      return (
                        <th
                          key={len}
                          className={`py-2.5 px-2 border-r border-slate-300 last:border-r-0 font-extrabold whitespace-nowrap ${
                            is35Header
                              ? 'bg-[#c01823] text-white font-black'
                              : 'text-slate-900'
                          }`}
                        >
                          {len.toFixed(2).replace('.', ',')}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                {/* Table Body (Radii and capacities) */}
                <tbody>
                  {chartData.radii.map((radius, rIdx) => {
                    const isEven = rIdx % 2 === 0;
                    const isRadius20_Row14 = radius === 20.0;

                    return (
                      <tr
                        key={radius}
                        className={isEven ? 'bg-slate-200/90' : 'bg-white'}
                      >
                        {/* Radius Column (Column 1) */}
                        <td
                          className={`py-1.5 px-3 border-r border-slate-300 font-mono text-[11px] sticky left-0 z-10 ${
                            isRadius20_Row14
                              ? 'bg-[#c01823] text-white font-black shadow-inner'
                              : isEven
                              ? 'bg-slate-300 text-slate-900 font-black'
                              : 'bg-slate-100 text-slate-900 font-black'
                          }`}
                        >
                          {radius.toFixed(1).replace('.', ',')}
                        </td>

                        {/* Capacity Cells */}
                        {chartData.boomLengths.map((len, bIdx) => {
                          const cap = chartData.matrix[rIdx]?.[bIdx];

                          // Highlight target working capacity cell with 3,2 (at boom 35.0m, radius 20.0m)
                          const isHighlighted = cap === 3.2 && (len === 35.0 || bIdx === closestBoomIdx);

                          return (
                            <td
                              key={len}
                              className={`py-1.5 px-2 border-r border-slate-300 last:border-r-0 font-mono text-[11px] ${
                                isHighlighted
                                  ? 'bg-[#c01823] text-white font-black shadow-inner'
                                  : cap !== null && cap !== undefined
                                  ? 'text-slate-900 font-semibold'
                                  : 'text-slate-300 font-light'
                              }`}
                            >
                              {cap !== null && cap !== undefined
                                ? cap.toFixed(1).replace('.', ',')
                                : '–'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
            Close chart
          </button>
        </div>
      </div>
    </div>
  );
};
