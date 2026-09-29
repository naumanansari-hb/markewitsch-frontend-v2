import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  FileText,
  Phone,
  Mail,
  Check,
  X,
  ChevronRight,
  Info,
  Download,
  Printer,
  Menu,
  RotateCw,
  Maximize2,
  Minus,
  Plus,
  MoreVertical,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import {
  CraneModel,
  CustomerDetails,
  JobSiteLocation,
  LiftOverview,
  LiftParameters,
  ScheduleDetails,
} from '../types';
import { MARKEWITSCH_LOGO } from '../assets/logo';

interface CustomerQuotationViewProps {
  customer: CustomerDetails;
  lift: LiftOverview;
  location: JobSiteLocation;
  schedule: ScheduleDetails;
  parameters?: LiftParameters;
  selectedCrane: CraneModel;
  inquiryRef?: string;
  onBackToSummary: () => void;
  onReturnToStart: () => void;
}

export const CustomerQuotationView: React.FC<CustomerQuotationViewProps> = ({
  customer,
  lift,
  location,
  schedule,
  parameters,
  selectedCrane,
  inquiryRef = 'INQ-2026-00113',
  onBackToSummary,
  onReturnToStart,
}) => {
  // Quotation Response State
  const [responseStatus, setResponseStatus] = useState<'awaiting' | 'approved' | 'rejected'>('awaiting');
  const [comment, setComment] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);

  // Price calculations
  const cranePrice = selectedCrane.priceMin || 2300;
  const crewPrice = 850;
  const riggingPrice = 450;
  const publicRoadSurcharge = parameters?.setupLocation === 'public_road' ? 1500 : 0;
  
  const subtotal = cranePrice + crewPrice + riggingPrice + publicRoadSurcharge;
  const vatAmount = subtotal * 0.19;
  const totalAmount = subtotal + vatAmount;

  // Format currency
  const formatEuro = (amount: number) => {
    return `€ ${amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleApprove = () => {
    setResponseStatus('approved');
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.4 },
        colors: ['#10b981', '#059669', '#34d399', '#c01823'],
      });
    } catch {
      // ignore
    }
  };

  const handleReject = () => {
    setResponseStatus('rejected');
  };

  const handlePrintOrDownload = () => {
    window.print();
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 15, 140));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 15, 75));
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 font-sans pb-16">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* Gebr. Markewitsch Logo - Sized same as landing page screen */}
          <div className="flex items-center justify-start py-1 h-18 sm:h-20 overflow-visible">
            <div className="relative overflow-visible flex items-center">
              <img
                src={MARKEWITSCH_LOGO}
                alt="Gebr. Markewitsch"
                className="h-22 sm:h-[96px] md:h-[105px] w-auto max-w-[310px] sm:max-w-[380px] md:max-w-[440px] object-contain object-left scale-[1.60] sm:scale-[1.72] md:scale-[1.80] origin-left"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-xs text-slate-600">
            <a
              href="tel:+497874691027"
              className="hidden sm:flex items-center gap-1.5 hover:text-[#c01823] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">+49 7874691027</span>
            </a>
            <a
              href="mailto:support@markewitsch.com"
              className="flex items-center gap-1.5 hover:text-[#c01823] transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">support@markewitsch.com</span>
            </a>
          </div>
        </div>
      </header>

      {/* Conditional: Response Recorded Screen vs Quotation Review View */}
      {responseStatus !== 'awaiting' ? (
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center space-y-6 animate-fadeIn">
          {responseStatus === 'approved' ? (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-200/50 animate-scale">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600 text-white shadow-lg shadow-red-200/50 animate-scale">
              <X className="w-8 h-8 stroke-[3]" />
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Your response has been recorded.
          </h1>

          <div className="pt-2">
            <button
              onClick={onReturnToStart}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#c01823] hover:bg-[#a5131c] text-white text-xs font-semibold rounded-lg shadow-sm transition-all transform active:scale-98 cursor-pointer"
              id="quotation-response-return-home-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to landing screen</span>
            </button>
          </div>
        </div>
      ) : (
        /* Main Container: Review your quotation */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Page Title & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Review your quotation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Please review the quotation for your inquiry and let us know how you would like to proceed.
            </p>
          </div>
        </div>

        {/* 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (Inquiry Summary + Quotation PDF Viewer) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card 1: Inquiry Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <FileText className="w-5 h-5 text-[#c01823]" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Inquiry Summary
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
                <div className="flex items-start justify-between sm:justify-start gap-4">
                  <span className="text-slate-400 font-medium w-28 shrink-0">Company</span>
                  <span className="text-slate-800 font-semibold truncate">
                    {customer.companyName || 'Seidel Industriemontage GmbH'}
                  </span>
                </div>

                <div className="flex items-start justify-between sm:justify-start gap-4">
                  <span className="text-slate-400 font-medium w-28 shrink-0">Service Date</span>
                  <span className="text-slate-800 font-semibold">
                    {schedule.liftDate || schedule.startDate || '15 Sep 2026'}
                  </span>
                </div>

                <div className="flex items-start justify-between sm:justify-start gap-4">
                  <span className="text-slate-400 font-medium w-28 shrink-0">Contact Person</span>
                  <span className="text-slate-800 font-semibold truncate">
                    {customer.contactName || 'Marc Wilhelm'}
                  </span>
                </div>

                <div className="flex items-start justify-between sm:justify-start gap-4">
                  <span className="text-slate-400 font-medium w-28 shrink-0">Crane Preference</span>
                  <span className="text-slate-800 font-semibold">
                    {selectedCrane.name || 'TK2505'}
                  </span>
                </div>

                <div className="flex items-start justify-between sm:justify-start gap-4">
                  <span className="text-slate-400 font-medium w-28 shrink-0">Job Site</span>
                  <span className="text-slate-800 font-semibold truncate">
                    {location.address
                      ? `${location.address}, ${location.city}`
                      : 'Südwestpark 65, Nürnberg'}
                  </span>
                </div>

                <div className="flex items-start justify-between sm:justify-start gap-4">
                  <span className="text-slate-400 font-medium w-28 shrink-0">Job Description</span>
                  <span className="text-slate-800 font-semibold truncate">
                    {lift.whatNeedsLifting || 'Heat exchanger installation on rooftop platform'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Quotation Viewer */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2">
                <FileText className="w-5 h-5 text-[#c01823]" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Quotation
                </h2>
              </div>

              {/* PDF Container */}
              <div className="rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-[#525659]">
                {/* PDF Dark Toolbar */}
                <div className="bg-[#323639] text-white px-3 sm:px-4 py-2 flex items-center justify-between text-xs select-none">
                  {/* Left Controls */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10"
                      title="Menu"
                    >
                      <Menu className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1 text-[11px] text-slate-300 font-medium">
                      <button
                        onClick={() => setCurrentPage(1)}
                        className={`px-1.5 py-0.5 rounded ${currentPage === 1 ? 'bg-white/20 text-white font-bold' : 'hover:bg-white/10'}`}
                      >
                        1
                      </button>
                      <span>/</span>
                      <button
                        onClick={() => setCurrentPage(2)}
                        className={`px-1.5 py-0.5 rounded ${currentPage === 2 ? 'bg-white/20 text-white font-bold' : 'hover:bg-white/10'}`}
                      >
                        2
                      </button>
                    </div>
                  </div>

                  {/* Center Zoom Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10"
                      title="Zoom Out"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono text-slate-200 w-12 text-center">
                      {zoomLevel}%
                    </span>
                    <button
                      type="button"
                      onClick={handleZoomIn}
                      className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10"
                      title="Zoom In"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(100)}
                      className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10 hidden sm:block"
                      title="Fit to page"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10 hidden sm:block"
                      title="Rotate"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Right Action Icons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrintOrDownload}
                      className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10 cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintOrDownload}
                      className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10 cursor-pointer"
                      title="Print"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10 hidden sm:block"
                      title="More Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* PDF Paper Document Preview */}
                <div className="p-3 sm:p-6 overflow-x-auto flex justify-center">
                  <div
                    style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                    className="bg-white shadow-2xl rounded-xs w-full max-w-2xl p-6 sm:p-10 text-slate-900 transition-transform duration-150"
                  >
                    {currentPage === 1 ? (
                      /* PAGE 1: Quotation Offer */
                      <div className="space-y-6 text-[11px] leading-relaxed">
                        {/* Letterhead Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
                          <div>
                            <img
                              src={MARKEWITSCH_LOGO}
                              alt="Gebr. Markewitsch"
                              className="h-12 w-auto object-contain"
                              referrerPolicy="no-referrer"
                            />
                            <div className="text-[9px] text-[#c01823] font-bold tracking-widest uppercase mt-1">
                              Bauanwalt • Schwertransport • Industriemontagen
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-500 sm:text-right space-y-0.5">
                            <div className="font-bold text-slate-800">Gebr. Markewitsch GmbH</div>
                            <div>Am Sportplatz 5</div>
                            <div>77656 Offenburg</div>
                            <div>Deutschland</div>
                            <div className="pt-1">Tel. +49 7874691027</div>
                            <div>E-Mail: info@markewitsch.com</div>
                            <div className="text-[#c01823]">www.markewitsch.com</div>
                          </div>
                        </div>

                        {/* Customer Address & Document Title */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
                          <div className="text-[11px] space-y-0.5">
                            <div className="font-bold text-slate-900">
                              {customer.companyName || 'Seidel Industriemontage GmbH'}
                            </div>
                            <div>Herr {customer.contactName || 'Marc Wilhelm'}</div>
                            <div>{location.address || 'Südwestpark 65'}</div>
                            <div>
                              {location.postalCode || '90469'} {location.city || 'Nürnberg'}
                            </div>
                          </div>

                          {/* Meta Table Box */}
                          <div className="border border-slate-300 rounded-md overflow-hidden text-[10px] sm:w-60">
                            <div className="grid grid-cols-2 border-b border-slate-200 p-1.5 bg-slate-50">
                              <span className="text-slate-500 font-medium">Quotation No.</span>
                              <span className="font-bold text-slate-900 font-mono">Q-2026-00113</span>
                            </div>
                            <div className="grid grid-cols-2 border-b border-slate-200 p-1.5">
                              <span className="text-slate-500 font-medium">Inquiry Reference</span>
                              <span className="font-bold text-slate-900 font-mono">{inquiryRef}</span>
                            </div>
                            <div className="grid grid-cols-2 border-b border-slate-200 p-1.5 bg-slate-50">
                              <span className="text-slate-500 font-medium">Date</span>
                              <span className="text-slate-800 font-medium">14 Sep 2026</span>
                            </div>
                            <div className="grid grid-cols-2 p-1.5">
                              <span className="text-slate-500 font-medium">Valid Until</span>
                              <span className="text-slate-800 font-medium">30 Sep 2026</span>
                            </div>
                          </div>
                        </div>

                        {/* Headline */}
                        <div className="pt-2">
                          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                            QUOTATION
                          </h3>
                          <p className="text-xs font-semibold text-[#c01823] mt-0.5">
                            Our offer for your inquiry
                          </p>
                        </div>

                        {/* Positions Table */}
                        <div className="border border-slate-300 rounded-md overflow-hidden">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-100/80 border-b border-slate-300 text-[10px] font-bold text-slate-700">
                                <th className="p-2 w-10 text-center">Pos.</th>
                                <th className="p-2">Description</th>
                                <th className="p-2 w-12 text-center">Qty.</th>
                                <th className="p-2 w-16 text-center">Unit</th>
                                <th className="p-2 w-24 text-right">Unit Price</th>
                                <th className="p-2 w-24 text-right">Total Price</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-[10.5px]">
                              <tr>
                                <td className="p-2 text-center text-slate-500 font-mono">1</td>
                                <td className="p-2">
                                  <div className="font-bold text-slate-900">
                                    Mobile crane {selectedCrane.name} ({selectedCrane.maxWeight} t)
                                  </div>
                                  <div className="text-[9.5px] text-slate-500">
                                    incl. certified operator, standard mobilization, and hook block
                                  </div>
                                </td>
                                <td className="p-2 text-center font-mono">1</td>
                                <td className="p-2 text-center text-slate-600">day</td>
                                <td className="p-2 text-right font-mono">{formatEuro(cranePrice)}</td>
                                <td className="p-2 text-right font-bold font-mono text-slate-900">
                                  {formatEuro(cranePrice)}
                                </td>
                              </tr>

                              <tr>
                                <td className="p-2 text-center text-slate-500 font-mono">2</td>
                                <td className="p-2">
                                  <div className="font-bold text-slate-900">Rigging crew (2 persons)</div>
                                  <div className="text-[9.5px] text-slate-500">
                                    Trained slingers / banksmen with personal protective equipment
                                  </div>
                                </td>
                                <td className="p-2 text-center font-mono">1</td>
                                <td className="p-2 text-center text-slate-600">day</td>
                                <td className="p-2 text-right font-mono">{formatEuro(crewPrice)}</td>
                                <td className="p-2 text-right font-bold font-mono text-slate-900">
                                  {formatEuro(crewPrice)}
                                </td>
                              </tr>

                              <tr>
                                <td className="p-2 text-center text-slate-500 font-mono">3</td>
                                <td className="p-2">
                                  <div className="font-bold text-slate-900">
                                    {parameters?.supportingEquipment && parameters.supportingEquipment.length > 0
                                      ? `Supporting equipment (${parameters.supportingEquipment.length} accessories)`
                                      : 'Additional rigging material'}
                                  </div>
                                  <div className="text-[9.5px] text-slate-500">
                                    {parameters?.supportingEquipment && parameters.supportingEquipment.length > 0
                                      ? parameters.supportingEquipment
                                          .map((item) =>
                                            item === 'beam_lights'
                                              ? 'Beam lights'
                                              : item === 'spreader_beam'
                                              ? 'Spreader beam'
                                              : item === 'ground_mats'
                                              ? 'Ground protection pads'
                                              : 'Rigging slings'
                                          )
                                          .join(', ')
                                      : 'Lifting slings, shackles, and safety ground pads'}
                                  </div>
                                </td>
                                <td className="p-2 text-center font-mono">1</td>
                                <td className="p-2 text-center text-slate-600">lump sum</td>
                                <td className="p-2 text-right font-mono">{formatEuro(riggingPrice)}</td>
                                <td className="p-2 text-right font-bold font-mono text-slate-900">
                                  {formatEuro(riggingPrice)}
                                </td>
                              </tr>

                              {publicRoadSurcharge > 0 && (
                                <tr>
                                  <td className="p-2 text-center text-slate-500 font-mono">4</td>
                                  <td className="p-2">
                                    <div className="font-bold text-slate-900">
                                      Public road setup surcharge & street permit handling
                                    </div>
                                    <div className="text-[9.5px] text-slate-500">
                                      Traffic management coordination, municipal road closure approval
                                    </div>
                                  </td>
                                  <td className="p-2 text-center font-mono">1</td>
                                  <td className="p-2 text-center text-slate-600">fee</td>
                                  <td className="p-2 text-right font-mono">{formatEuro(publicRoadSurcharge)}</td>
                                  <td className="p-2 text-right font-bold font-mono text-slate-900">
                                    {formatEuro(publicRoadSurcharge)}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Totals Section */}
                        <div className="flex justify-end pt-1">
                          <div className="w-64 space-y-1 text-right text-[11px]">
                            <div className="flex justify-between py-0.5 border-b border-slate-100">
                              <span className="font-semibold text-slate-600">Subtotal</span>
                              <span className="font-mono font-bold text-slate-900">{formatEuro(subtotal)}</span>
                            </div>
                            <div className="flex justify-between py-0.5 border-b border-slate-100">
                              <span className="text-slate-500">VAT (19%)</span>
                              <span className="font-mono text-slate-700">{formatEuro(vatAmount)}</span>
                            </div>
                            <div className="flex justify-between py-1 text-sm font-bold border-t-2 border-slate-900">
                              <span className="text-slate-900">Total</span>
                              <span className="font-mono text-[#c01823]">{formatEuro(totalAmount)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Notes Section */}
                        <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-600 space-y-1">
                          <div className="font-bold text-slate-900 uppercase tracking-wide">Notes</div>
                          <div>1. Prices are based on the information provided in your inquiry.</div>
                          <div>2. This quotation is valid for 30 days from date of issuance.</div>
                          <div>3. Our general terms and conditions of business apply (see page 2).</div>
                        </div>
                      </div>
                    ) : (
                      /* PAGE 2: General Terms & Technical Conditions */
                      <div className="space-y-5 text-[10.5px] text-slate-600 leading-relaxed">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                          <h4 className="text-sm font-bold text-slate-900 uppercase">
                            General Terms & Technical Lifting Conditions
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">Page 2 / 2</span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <strong className="text-slate-900 block font-semibold mb-0.5">
                              1. Scope of Services & Machine Provision
                            </strong>
                            <p>
                              Gebr. Markewitsch GmbH provides the specified mobile telescopic crane with a certified operator according to German safety guidelines DGUV Vorschrift 52. The operator retains sole authority over lifting safety and operational clearance based on wind and ground stability.
                            </p>
                          </div>

                          <div>
                            <strong className="text-slate-900 block font-semibold mb-0.5">
                              2. Ground Bearing & Site Access
                            </strong>
                            <p>
                              The client must ensure that all access roads and crane setup surfaces can withstand the maximum outrigger point loads. Gebr. Markewitsch supplies standard ground protection pads. Additional steel plates can be provided upon request.
                            </p>
                          </div>

                          <div>
                            <strong className="text-slate-900 block font-semibold mb-0.5">
                              3. Weather & Environmental Limits
                            </strong>
                            <p>
                              Crane operations are permitted up to the maximum permissible wind speed specified in the manufacturer load charts (typically 9.0–12.8 m/s depending on boom length). In the event of force majeure, operations will resume immediately once conditions normalize.
                            </p>
                          </div>

                          <div>
                            <strong className="text-slate-900 block font-semibold mb-0.5">
                              4. Payment & Validity
                            </strong>
                            <p>
                              Payment terms are 14 days net from invoice date. This quotation remains valid for 30 calendar days.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Download quotation button */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handlePrintOrDownload}
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                  id="download-quotation-btn"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Download quotation</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (Reference Card + Your Response Card) */}
          <div className="lg:col-span-4 space-y-4 sticky top-20">
            {/* Card: Inquiry Reference & Status */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Inquiry Reference
                </span>
                <span className="text-lg sm:text-xl font-bold text-slate-900 font-mono tracking-tight mt-0.5 block">
                  {inquiryRef}
                </span>
              </div>

              <div>
                {responseStatus === 'awaiting' && (
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Awaiting Response</span>
                  </span>
                )}
                {responseStatus === 'approved' && (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span>Approved</span>
                  </span>
                )}
                {responseStatus === 'rejected' && (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-200 flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5 text-red-600 stroke-[3]" />
                    <span>Rejected</span>
                  </span>
                )}
              </div>
            </div>

            {/* Card: Your Response */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Your Response
                </h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Please review the quotation and choose how you would like to proceed.
              </p>

              {/* Status Alert if already acted */}
              {responseStatus === 'approved' && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Quotation Approved</strong>
                    Thank you! Our operations dispatch team has received your confirmation and will follow up shortly.
                  </div>
                </div>
              )}

              {responseStatus === 'rejected' && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5 animate-fadeIn">
                  <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Quotation Rejected</strong>
                    You have declined this quotation. Our sales engineers have noted your feedback.
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleApprove}
                  className={`w-full py-3.5 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer shadow-sm ${
                    responseStatus === 'approved'
                      ? 'bg-emerald-800 text-white ring-2 ring-emerald-500 ring-offset-2'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-98'
                  }`}
                  id="approve-quotation-btn"
                >
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Approve quotation</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleReject}
                  className={`w-full py-3.5 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer ${
                    responseStatus === 'rejected'
                      ? 'bg-red-50 text-red-700 border-2 border-red-600 ring-2 ring-red-400 ring-offset-2'
                      : 'bg-white hover:bg-red-50 text-red-600 border-2 border-red-500 active:scale-98'
                  }`}
                  id="reject-quotation-btn"
                >
                  <div className="flex items-center gap-2.5">
                    <X className="w-4 h-4 stroke-[2.5]" />
                    <span>Reject quotation</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-500" />
                </button>
              </div>

              {/* Comment Textarea */}
              <div className="space-y-1.5 pt-1">
                <label
                  htmlFor="quotation-comment"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Your comment (optional)
                </label>
                <textarea
                  id="quotation-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  placeholder="Add your message here (optional)..."
                  rows={4}
                  className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#c01823] focus:border-[#c01823] bg-white resize-none"
                />
                <div className="text-right text-[10px] text-slate-400 font-mono">
                  {comment.length} / 500
                </div>
              </div>

              {/* Please Note Guidance Box */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 text-xs text-blue-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Please note</span>
                </div>
                <p className="text-[11px] leading-relaxed text-blue-900/90">
                  Approving this quotation does not yet confirm the job. It means that Markewitsch can proceed with the further review of required details such as availability and final coordination. Our team will then contact you to discuss the next steps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
