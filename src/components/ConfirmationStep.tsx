import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Check,
  Calendar,
  Layers,
  Truck,
  Tag,
  Users,
  FileText,
  Mail,
  ArrowLeft,
  Wrench,
  ExternalLink,
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

interface ConfirmationStepProps {
  customer: CustomerDetails;
  lift: LiftOverview;
  location: JobSiteLocation;
  schedule: ScheduleDetails;
  parameters?: LiftParameters;
  selectedCrane: CraneModel;
  inquiryRef?: string;
  onReturnToStart: () => void;
  onViewCustomerQuotation?: () => void;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  customer,
  lift,
  location,
  schedule,
  parameters,
  selectedCrane,
  inquiryRef = 'ANQ-2026-9042-X',
  onReturnToStart,
  onViewCustomerQuotation,
}) => {
  useEffect(() => {
    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.3 },
        colors: ['#c01823', '#10b981', '#3b82f6', '#f59e0b'],
      });
    } catch {
      // ignore
    }
  }, []);

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Centered Success Checkmark & Headline */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-200/50 mb-2 animate-scale">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
          Your inquiry has been submitted
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Thank you. Your request has been received and is now queued for immediate technical review by our team.
        </p>
      </div>

      {/* Card 1: Inquiry Reference Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-4">
            <div className="overflow-hidden hidden sm:flex items-center border-r border-slate-200 pr-5">
              <img
                src={MARKEWITSCH_LOGO}
                alt="Gebr. Markewitsch"
                className="h-16 w-auto object-contain scale-125 origin-left"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Inquiry reference
              </span>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight mt-0.5">
                {inquiryRef}
              </div>
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Under review</span>
            </span>
          </div>
        </div>

        {/* 4 Metadata Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-[#c01823]" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">
                Submitted date
              </div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">
                {formattedDate}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 text-[#c01823]" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">
                Lifting object
              </div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">
                {lift.whatNeedsLifting || 'Industrial Gas Turbine Compressor Block'}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 text-[#c01823]" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">
                Recommended crane
              </div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">
                {selectedCrane.name}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4 text-[#c01823]" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">
                Indicative price
              </div>
              <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                €{selectedCrane.priceMin.toLocaleString()} – €{selectedCrane.priceMax.toLocaleString()}
                <span className="text-[10px] text-slate-500 font-normal font-sans ml-1.5">
                  (VAT not included)
                </span>
              </div>
              {parameters?.setupLocation === 'public_road' && (
                <div className="text-[11px] text-slate-700 font-medium mt-1">
                  Public road charge: <strong className="font-bold font-mono text-slate-900">[ + Upto 1500 EUR ]</strong>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 sm:col-span-2 pt-2 border-t border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">
                Planned schedule & working duration
              </div>
              <div className="text-xs font-bold text-slate-900 mt-0.5 flex flex-wrap items-center gap-2">
                <span>
                  {schedule.durationType === 'single-day'
                    ? `Single Day (${schedule.liftDate}): ${schedule.workingDurationHours || schedule.totalPlannedHours} hrs duration${
                        schedule.preferredStartTime ? ` (Start: ${schedule.preferredStartTime})` : ''
                      }`
                    : schedule.multiDayType === 'consecutive'
                    ? `Consecutive (${schedule.startDate} → ${schedule.endDate}): ${schedule.consecutiveDays.length} days (${schedule.commonDurationHours || 8} hrs/day)`
                    : `Selected Dates: ${schedule.selectedDates.length} days`}
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold font-mono">
                  {schedule.totalPlannedHours} hrs planned
                </span>
                {schedule.isFlexible && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-medium">
                    Date flexible
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Setup Location & Supporting Equipment metadata */}
          <div className="flex items-start gap-3 sm:col-span-2 pt-2 border-t border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4 text-[#c01823]" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">
                Setup location & supporting equipment
              </div>
              <div className="text-xs font-bold text-slate-900 mt-0.5 flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-md text-[11px] font-semibold">
                  {parameters?.setupLocation === 'public_road'
                    ? 'Public road / street'
                    : 'Private property'}
                </span>
                {parameters?.supportingEquipment && parameters.supportingEquipment.length > 0 ? (
                  parameters.supportingEquipment.map((eqId) => {
                    const labelMap: Record<string, string> = {
                      beam_lights: 'Beam lights',
                      spreader_beam: 'Spreader beam / lifting bar',
                      ground_mats: 'Ground protection mats / pads',
                      rigging_slings: 'Rigging gear & slings',
                      rigging_gear: 'Rigging gear & slings',
                    };
                    const qty = parameters.supportingEquipmentQuantities?.[eqId] ?? 1;
                    return (
                      <span
                        key={eqId}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-50 text-[#c01823] border border-red-100 rounded-md text-[11px] font-medium"
                      >
                        <span>{labelMap[eqId] || eqId}</span>
                        <span className="bg-white/90 text-red-700 text-[10px] font-bold px-1.5 py-0.2 rounded border border-red-200">
                          Qty: {qty}
                        </span>
                      </span>
                    );
                  })
                ) : (
                  <span className="text-[11px] text-slate-500 font-normal">
                    Standard crane configuration only
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: What happens next? */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <h2 className="text-lg font-bold text-slate-900">
          What happens next?
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-50/80 border border-red-100 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-[#c01823]" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
              <strong className="text-slate-900">Technical validation:</strong> Crane suggestions and pricing are indicative (excl. VAT) and will be validated by our internal staff. Someone will get in touch with you shortly.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-50/80 border border-red-100 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-[#c01823]" />
            </div>
            <div className="space-y-2.5 pt-1.5 flex-1">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-900">Confirmation email sent:</strong> A confirmation and summary of your inquiry have been sent to{' '}
                <strong className="text-slate-900 font-medium font-mono">
                  {customer.email || 'd.schmidt@siemens-energy.com'}
                </strong>.
              </p>
              {onViewCustomerQuotation && (
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={onViewCustomerQuotation}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-[#c01823] border border-red-200 hover:border-red-300 rounded-lg text-xs font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
                    id="view-customer-quotation-email-link-btn"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#c01823]" />
                    <span>View customer quotation email</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#c01823] transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Return to Start Page & View Customer Quotation Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onReturnToStart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
          id="return-to-start-page-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to start page</span>
        </button>

        {onViewCustomerQuotation && (
          <button
            onClick={onViewCustomerQuotation}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#c01823] hover:bg-[#a5131c] text-white text-xs font-semibold rounded-lg shadow-sm transition-all transform active:scale-98 cursor-pointer"
            id="view-customer-quotation-primary-btn"
          >
            <FileText className="w-4 h-4" />
            <span>View customer quotation email</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
