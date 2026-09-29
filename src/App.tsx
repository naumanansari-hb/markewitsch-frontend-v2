/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AppStep,
  CustomerDetails,
  JobSiteLocation,
  LiftOverview,
  LiftParameters,
  ScheduleDetails,
  CraneModel,
} from './types';
import {
  CRANE_MODELS,
  DEFAULT_CUSTOMER,
  DEFAULT_LIFT_OVERVIEW,
  DEFAULT_LOCATION,
  DEFAULT_PARAMETERS,
  DEFAULT_SCHEDULE,
} from './data/cranes';
import { Header } from './components/Header';
import { LandingView } from './components/LandingView';
import { JobDetailsStep } from './components/JobDetailsStep';
import { LiftPlannerStep } from './components/LiftPlannerStep';
import { CraneRecommendationsStep } from './components/CraneRecommendationsStep';
import { ConfirmationStep } from './components/ConfirmationStep';
import { CustomerQuotationView } from './components/CustomerQuotationView';
import { MapPlannerModal } from './components/MapPlannerModal';
import { InquiryStepper } from './components/InquiryStepper';
import { SiteVisitModal } from './components/SiteVisitModal';

export default function App() {
  // Navigation State
  const [currentStep, setCurrentStep] = useState<AppStep>('landing');
  const [activeNavSection, setActiveNavSection] = useState<'crane-finder' | 'site-visit'>('crane-finder');

  // Form & Configuration State
  const [customer, setCustomer] = useState<CustomerDetails>(DEFAULT_CUSTOMER);
  const [lift, setLift] = useState<LiftOverview>(DEFAULT_LIFT_OVERVIEW);
  const [location, setLocation] = useState<JobSiteLocation>(DEFAULT_LOCATION);
  const [schedule, setSchedule] = useState<ScheduleDetails>(DEFAULT_SCHEDULE);
  const [parameters, setParameters] = useState<LiftParameters>(DEFAULT_PARAMETERS);
  const [selectedCrane, setSelectedCrane] = useState<CraneModel>(CRANE_MODELS[0]);
  const [configuredBoomLength, setConfiguredBoomLength] = useState<number>(35);

  // Modal Dialogs
  const [isMapPlannerOpen, setIsMapPlannerOpen] = useState(false);
  const [isSiteVisitModalOpen, setIsSiteVisitModalOpen] = useState(false);

  // Unique inquiry reference generator or fixed mockup reference
  const inquiryRef = 'ANQ-2026-9042-X';

  // Scroll listener to update active header navigation menu
  useEffect(() => {
    if (currentStep !== 'landing') return;

    const handleScroll = () => {
      const siteVisitSection = document.getElementById('site-visit-section');
      if (siteVisitSection) {
        const rect = siteVisitSection.getBoundingClientRect();
        // If site visit section is near or in upper half of viewport
        if (rect.top <= 250) {
          setActiveNavSection('site-visit');
        } else {
          setActiveNavSection('crane-finder');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentStep]);

  const handleScrollToSection = (section: 'crane-finder' | 'site-visit') => {
    setActiveNavSection(section);
    if (currentStep !== 'landing') {
      setCurrentStep('landing');
      setTimeout(() => {
        if (section === 'site-visit') {
          document.getElementById('site-visit-section')?.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    } else {
      if (section === 'site-visit') {
        document.getElementById('site-visit-section')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleStartGuided = () => {
    setCurrentStep('job-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenMapPlanner = () => {
    setIsMapPlannerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col selection:bg-red-500 selection:text-white font-body">
      {/* Gebr. Markewitsch Navigation Header */}
      {currentStep !== 'customer-quotation' && (
        <Header
          currentStep={currentStep}
          activeNavSection={activeNavSection}
          onNavigate={(step) => {
            setCurrentStep(step);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onScrollToSection={handleScrollToSection}
        />
      )}

      {/* Main Content Area based on current step */}
      <main className="flex-1 pb-16">
        {/* Modern Graphic Stepper Bar (Steps 1, 2, 3) */}
        <InquiryStepper
          currentStep={currentStep}
          onNavigateToStep={(step) => {
            setCurrentStep(step);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {currentStep === 'landing' && (
          <LandingView
            onStartGuided={handleStartGuided}
            onOpenMapPlanner={handleOpenMapPlanner}
          />
        )}

        {currentStep === 'job-details' && (
          <JobDetailsStep
            customer={customer}
            setCustomer={setCustomer}
            lift={lift}
            setLift={setLift}
            location={location}
            setLocation={setLocation}
            schedule={schedule}
            setSchedule={setSchedule}
            setupLocation={parameters.setupLocation || location.setupLocation || 'private_property'}
            onSetupLocationChange={(val) => {
              setLocation((prev) => ({ ...prev, setupLocation: val }));
              setParameters((prev) => ({ ...prev, setupLocation: val }));
            }}
            onBack={() => {
              setCurrentStep('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNext={() => {
              setCurrentStep('lift-planner');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentStep === 'lift-planner' && (
          <LiftPlannerStep
            parameters={parameters}
            setParameters={setParameters}
            customer={customer}
            onBack={() => {
              setCurrentStep('job-details');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNext={() => {
              setCurrentStep('crane-recommendations');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentStep === 'crane-recommendations' && (
          <CraneRecommendationsStep
            parameters={parameters}
            selectedCrane={selectedCrane}
            setSelectedCrane={setSelectedCrane}
            configuredBoomLength={configuredBoomLength}
            setConfiguredBoomLength={setConfiguredBoomLength}
            onBack={() => {
              setCurrentStep('lift-planner');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNext={() => {
              setCurrentStep('confirmation');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentStep === 'confirmation' && (
          <ConfirmationStep
            customer={customer}
            lift={lift}
            location={location}
            schedule={schedule}
            parameters={parameters}
            selectedCrane={selectedCrane}
            inquiryRef={inquiryRef}
            onReturnToStart={() => {
              setCurrentStep('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewCustomerQuotation={() => {
              setCurrentStep('customer-quotation');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentStep === 'customer-quotation' && (
          <CustomerQuotationView
            customer={customer}
            lift={lift}
            location={location}
            schedule={schedule}
            parameters={parameters}
            selectedCrane={selectedCrane}
            inquiryRef={inquiryRef}
            onBackToSummary={() => {
              setCurrentStep('confirmation');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onReturnToStart={() => {
              setCurrentStep('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Map Planner Interactive Modal */}
      <MapPlannerModal
        isOpen={isMapPlannerOpen}
        onClose={() => setIsMapPlannerOpen(false)}
        location={location}
        setLocation={setLocation}
        parameters={parameters}
        setParameters={setParameters}
        onProceedToCraneSuggestions={() => {
          setCurrentStep('lift-planner');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* On-Site Assessment Modal */}
      <SiteVisitModal
        isOpen={isSiteVisitModalOpen}
        onClose={() => setIsSiteVisitModalOpen(false)}
      />
    </div>
  );
}
