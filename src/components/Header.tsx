import React from 'react';
import { Phone, Mail, ArrowRight } from 'lucide-react';
import { AppStep } from '../types';
import { MARKEWITSCH_LOGO } from '../assets/logo';

interface HeaderProps {
  currentStep: AppStep;
  activeNavSection: 'crane-finder' | 'site-visit';
  onNavigate: (step: AppStep) => void;
  onScrollToSection: (section: 'crane-finder' | 'site-visit') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  activeNavSection,
  onNavigate,
  onScrollToSection,
}) => {
  const isLanding = currentStep === 'landing';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Gebr. Markewitsch Logo - Sized prominently with left alignment and zoom */}
          <button
            onClick={() => {
              onNavigate('landing');
              onScrollToSection('crane-finder');
            }}
            className="flex items-center justify-start text-left group focus:outline-none cursor-pointer py-1 h-18 sm:h-20 overflow-visible"
            id="header-logo-btn"
          >
            <div className="relative overflow-visible flex items-center">
              <img
                src={MARKEWITSCH_LOGO}
                alt="Gebr. Markewitsch"
                className="h-22 sm:h-[96px] md:h-[105px] w-auto max-w-[310px] sm:max-w-[380px] md:max-w-[440px] object-contain object-left scale-[1.60] sm:scale-[1.72] md:scale-[1.80] origin-left transition-transform group-hover:scale-[1.85]"
                referrerPolicy="no-referrer"
              />
            </div>
          </button>

          {/* Right Header Controls */}
          {isLanding ? (
            <div className="flex items-center gap-6">
              <button
                onClick={() => onScrollToSection('crane-finder')}
                className={`text-sm font-bold transition-colors pb-1 cursor-pointer font-body ${
                  activeNavSection === 'crane-finder'
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-500 hover:text-slate-900 border-b-2 border-transparent'
                }`}
                id="nav-crane-finder"
              >
                Crane Finder
              </button>
              <button
                onClick={() => onScrollToSection('site-visit')}
                className={`text-sm font-bold transition-colors pb-1 cursor-pointer font-body ${
                  activeNavSection === 'site-visit'
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-500 hover:text-slate-900 border-b-2 border-transparent'
                }`}
                id="nav-site-visit"
              >
                Site Visit
              </button>
              <button
                onClick={() => onNavigate('job-details')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c01823] hover:bg-[#a5131c] text-white text-sm font-semibold rounded-lg shadow-sm transition-all transform active:scale-98 font-body cursor-pointer shrink-0"
                id="header-start-inquiry-btn"
              >
                <span>Start crane inquiry</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <a
                href="tel:+49232498760"
                className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors font-body"
              >
                <Phone className="w-3.5 h-3.5 text-[#c01823]" />
                <span>+49 2324 9876-0</span>
              </a>
              <a
                href="mailto:info@markewitsch.de"
                className="hidden md:inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors font-body"
              >
                <Mail className="w-3.5 h-3.5 text-[#c01823]" />
                <span>info@markewitsch.de</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
