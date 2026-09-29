import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Mail, ArrowRight, X, RefreshCw, CheckCircle2 } from 'lucide-react';
import { CustomerDetails } from '../types';

interface CustomerVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  customer: CustomerDetails;
}

export const CustomerVerificationModal: React.FC<CustomerVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  customer,
}) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setIsSuccess(false);
      setErrorMsg(null);
      setResendCooldown(30);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Resend cooldown timer
  useEffect(() => {
    if (!isOpen || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, resendCooldown]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    // Only accept numeric input
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal && value !== '') return;

    const char = cleanVal.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);
    setErrorMsg(null);

    // Auto advance focus to next input if filled
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || '';
      }
      setOtp(newOtp);
      const nextEmptyIndex = Math.min(5, pastedData.length);
      inputRefs.current[nextEmptyIndex]?.focus();
    }
  };

  const handleFillDemoCode = () => {
    setOtp(['1', '2', '3', '4', '5', '6']);
    setErrorMsg(null);
    inputRefs.current[5]?.focus();
  };

  const handleVerify = () => {
    const enteredCode = otp.join('');
    if (enteredCode.length < 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);

      setTimeout(() => {
        onVerified();
      }, 500);
    }, 600);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    setOtp(['', '', '', '', '', '']);
    setErrorMsg(null);
    inputRefs.current[0]?.focus();
  };

  const maskedEmail = customer.email || 'customer@company.com';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#c01823]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Customer Verification
              </h3>
              <p className="text-xs text-slate-500">
                Verify your identity to unlock recommendations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
            aria-label="Close verification modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600 font-medium">
              <Mail className="w-3.5 h-3.5 text-[#c01823]" />
              <span className="font-mono text-slate-800">{maskedEmail}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              We have sent a 6-digit authentication code to your email to confirm your project inquiry.
            </p>
          </div>

          {/* 6-Digit OTP Input Fields */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={isVerifying || isSuccess}
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border transition-all ${
                  digit
                    ? 'border-[#c01823] ring-1 ring-red-300 bg-red-50/20 text-slate-900'
                    : 'border-slate-300 bg-white text-slate-800 focus:border-[#c01823] focus:ring-1 focus:ring-red-400 focus:outline-none'
                }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <p className="text-center text-xs font-semibold text-[#c01823] animate-in fade-in">
              {errorMsg}
            </p>
          )}

          {/* Success Check Banner */}
          {isSuccess && (
            <div className="flex items-center justify-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Identity verified! Loading recommendations...</span>
            </div>
          )}

          {/* Quick Demo Code Action */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleFillDemoCode}
              className="text-slate-500 hover:text-slate-800 underline decoration-slate-300 hover:decoration-slate-500 font-medium"
            >
              Fill demo code (123456)
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isVerifying || isSuccess}
              className={`flex items-center gap-1.5 font-medium transition-colors ${
                resendCooldown > 0
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-[#c01823] hover:underline cursor-pointer'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${resendCooldown > 0 ? '' : 'text-[#c01823]'}`} />
              <span>
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
              </span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || isSuccess}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#c01823] hover:bg-[#a5131c] disabled:opacity-75 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying code...</span>
                </>
              ) : (
                <>
                  <span>Verify & view recommendations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
