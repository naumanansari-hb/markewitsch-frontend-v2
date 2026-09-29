import React, { useState, useRef, useEffect } from 'react';
import {
  Truck,
  MapPin,
  ClipboardList,
  Compass,
  FileCheck2,
  ShieldCheck,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  User,
  Building,
  ChevronDown,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';
import { CustomSelect } from './CustomSelect';

const COUNTRY_DIAL_CODES = [
  '+49',
  '+43',
  '+41',
  '+31',
  '+32',
  '+33',
  '+44',
  '+1',
  '+48',
  '+420',
];

const PRESET_SITE_ADDRESSES = [
  {
    address: 'Am Industriehafen 12',
    postalCode: '47119',
    city: 'Duisburg',
    state: 'North Rhine-Westphalia (Nordrhein-Westfalen)',
    country: 'Germany',
    fullDisplay: 'Am Industriehafen 12, 47119 Duisburg, Germany',
    locationTag: 'Duisburg-Hafen',
  },
  {
    address: 'Kranstrasse 4',
    postalCode: '60314',
    city: 'Frankfurt am Main',
    state: 'Hesse (Hessen)',
    country: 'Germany',
    fullDisplay: 'Kranstrasse 4, 60314 Frankfurt am Main, Germany',
    locationTag: 'Osthafen Frankfurt',
  },
  {
    address: 'Hafenbecken II / Pier 7',
    postalCode: '20457',
    city: 'Hamburg',
    state: 'Hamburg',
    country: 'Germany',
    fullDisplay: 'Hafenbecken II / Pier 7, 20457 Hamburg, Germany',
    locationTag: 'Hamburger Hafen',
  },
  {
    address: 'Industriepark Höchst, Tor Süd',
    postalCode: '65926',
    city: 'Frankfurt am Main',
    state: 'Hesse (Hessen)',
    country: 'Germany',
    fullDisplay: 'Industriepark Höchst, Tor Süd, 65926 Frankfurt, Germany',
    locationTag: 'Chemical Park Höchst',
  },
  {
    address: 'Willy-Brandt-Allee 300',
    postalCode: '45891',
    city: 'Gelsenkirchen',
    state: 'North Rhine-Westphalia (Nordrhein-Westfalen)',
    country: 'Germany',
    fullDisplay: 'Willy-Brandt-Allee 300, 45891 Gelsenkirchen, Germany',
    locationTag: 'Industriehafen Gelsenkirchen',
  },
  {
    address: 'Siemensdamm 50',
    postalCode: '13629',
    city: 'Berlin',
    state: 'Berlin',
    country: 'Germany',
    fullDisplay: 'Siemensdamm 50, 13629 Berlin, Germany',
    locationTag: 'Siemensstadt Berlin',
  },
  {
    address: 'Bajuwarenstraße 4',
    postalCode: '93053',
    city: 'Regensburg',
    state: 'Bavaria (Bayern)',
    country: 'Germany',
    fullDisplay: 'Bajuwarenstraße 4, 93053 Regensburg, Germany',
    locationTag: 'Gewerbepark Regensburg',
  },
  {
    address: 'Rheinuferstraße 10',
    postalCode: '50678',
    city: 'Cologne (Köln)',
    state: 'North Rhine-Westphalia (Nordrhein-Westfalen)',
    country: 'Germany',
    fullDisplay: 'Rheinuferstraße 10, 50678 Köln, Germany',
    locationTag: 'Rheinauhafen Köln',
  },
];

const COUNTRIES = [
  'Germany',
  'Austria',
  'Switzerland',
  'Netherlands',
  'Belgium',
  'France',
  'United Kingdom',
  'United States',
  'Poland',
  'Czech Republic',
  'Italy',
  'Denmark',
  'Sweden',
];

const STATES = [
  'North Rhine-Westphalia (Nordrhein-Westfalen)',
  'Hesse (Hessen)',
  'Bavaria (Bayern)',
  'Baden-Württemberg',
  'Berlin',
  'Hamburg',
  'Brandenburg',
  'Bremen',
  'Lower Saxony (Niedersachsen)',
  'Mecklenburg-Western Pomerania',
  'Rhineland-Palatinate (Rheinland-Pfalz)',
  'Saarland',
  'Saxony (Sachsen)',
  'Saxony-Anhalt (Sachsen-Anhalt)',
  'Schleswig-Holstein',
  'Thuringia (Thüringen)',
  'Vienna (Wien)',
  'Salzburg',
  'Tyrol (Tirol)',
  'Zurich (Zürich)',
  'South Holland',
  'North Holland',
  'Antwerp (Flanders)',
  'Île-de-France',
  'Other Region',
];

const CITIES = [
  'Duisburg',
  'Frankfurt am Main',
  'Hamburg',
  'Munich (München)',
  'Berlin',
  'Cologne (Köln)',
  'Stuttgart',
  'Düsseldorf',
  'Nuremberg (Nürnberg)',
  'Leipzig',
  'Dortmund',
  'Essen',
  'Bremen',
  'Hanover (Hannover)',
  'Dresden',
  'Mannheim',
  'Karlsruhe',
  'Augsburg',
  'Wiesbaden',
  'Münster',
  'Gelsenkirchen',
  'Aachen',
  'Kiel',
  'Magdeburg',
  'Freiburg im Breisgau',
  'Krefeld',
  'Mainz',
  'Erfurt',
  'Oberhausen',
  'Rostock',
  'Kassel',
  'Hagen',
  'Saarbrücken',
  'Potsdam',
  'Ludwigshafen',
  'Mülheim an der Ruhr',
  'Osnabrück',
  'Leverkusen',
  'Heidelberg',
  'Darmstadt',
  'Regensburg',
  'Ingolstadt',
  'Würzburg',
  'Ulm',
  'Vienna (Wien)',
  'Zurich (Zürich)',
  'Rotterdam',
  'Amsterdam',
  'Antwerp (Antwerpen)',
  'Other City',
];

interface LandingViewProps {
  onStartGuided: () => void;
  onOpenMapPlanner: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStartGuided,
  onOpenMapPlanner,
}) => {
  const [siteVisitForm, setSiteVisitForm] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    dialCode: '+49',
    phoneNumber: '',
    address: '',
    addressLine1: '',
    postalCode: '',
    city: 'Duisburg',
    state: 'North Rhine-Westphalia (Nordrhein-Westfalen)',
    country: 'Germany',
    notes: '',
  });

  const [isManualAddress, setIsManualAddress] = useState(false);
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const addressContainerRef = useRef<HTMLDivElement>(null);

  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        addressContainerRef.current &&
        !addressContainerRef.current.contains(e.target as Node)
      ) {
        setIsAddressDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const filteredPresetAddresses = PRESET_SITE_ADDRESSES.filter((item) => {
    const q = siteVisitForm.address.toLowerCase().trim();
    if (!q) return true;
    return (
      item.fullDisplay.toLowerCase().includes(q) ||
      item.locationTag.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q) ||
      item.postalCode.includes(q)
    );
  });

  const selectSearchAddress = (item: (typeof PRESET_SITE_ADDRESSES)[0]) => {
    setSiteVisitForm((prev) => ({
      ...prev,
      address: item.fullDisplay,
      addressLine1: item.address,
      postalCode: item.postalCode,
      city: item.city,
      state: item.state,
      country: item.country,
    }));
    setIsAddressDropdownOpen(false);
  };

  const handleSiteVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteVisitForm.firstName || !siteVisitForm.lastName || !siteVisitForm.email) {
      alert('Please fill out at least your first name, last name, and email address.');
      return;
    }

    if (!isManualAddress && !siteVisitForm.address) {
      alert('Please search or enter the site address.');
      return;
    }

    if (isManualAddress && (!siteVisitForm.addressLine1 || !siteVisitForm.postalCode)) {
      alert('Please enter Address Line 1 and Postal Code.');
      return;
    }

    setIsSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
          Start your crane inquiry
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-3xl">
          Tell us what you need to lift. Enter the job details directly or plan the lift on a map to receive suitable crane suggestions and indicative pricing.
        </p>
      </div>

      {/* Two Route Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Quick crane suggestion */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <Truck className="w-7 h-7 text-[#c01823]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                Quick crane suggestion
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Already know your lift details? Follow a guided form to enter the key job requirements and receive suitable crane suggestions.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onStartGuided}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#c01823] hover:bg-[#a5131c] text-white text-sm font-semibold rounded-lg shadow-sm transition-all transform active:scale-98"
              id="start-guided-inquiry-btn"
            >
              <span>Start guided inquiry</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 2: Plan the lift on a map */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <MapPin className="w-7 h-7 text-[#c01823]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                Plan the lift on a map
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Not sure which crane you need? Use the map to define the job location and site conditions, then receive suitable crane suggestions based on your plan.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onOpenMapPlanner}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-sm font-semibold rounded-lg shadow-2xs transition-all transform active:scale-98"
              id="open-map-planner-btn"
            >
              <span>Open map planner</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* What happens next Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
            What happens next
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
            Whichever route you choose, your request follows the same clear process.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {/* Step 1 */}
          <div className="border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center bg-white hover:border-red-200 transition-colors">
            <span className="px-2.5 py-0.5 rounded-full bg-[#c01823] text-white text-[10px] font-bold tracking-wider uppercase mb-4">
              STEP 1
            </span>
            <div className="w-12 h-12 rounded-xl bg-red-50/70 border border-red-100 flex items-center justify-center mb-4">
              <ClipboardList className="w-6 h-6 text-[#c01823]" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900">
              Submit your job details
            </h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Enter your lift requirements through the guided form or map planner.
            </p>
          </div>

          {/* Step 2 */}
          <div className="border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center bg-white hover:border-red-200 transition-colors">
            <span className="px-2.5 py-0.5 rounded-full bg-[#c01823] text-white text-[10px] font-bold tracking-wider uppercase mb-4">
              STEP 2
            </span>
            <div className="w-12 h-12 rounded-xl bg-red-50/70 border border-red-100 flex items-center justify-center mb-4">
              <Compass className="w-6 h-6 text-[#c01823]" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900">
              Receive crane suggestions
            </h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              We identify suitable crane options based on your job details.
            </p>
          </div>

          {/* Step 3 */}
          <div className="border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center bg-white hover:border-red-200 transition-colors">
            <span className="px-2.5 py-0.5 rounded-full bg-[#c01823] text-white text-[10px] font-bold tracking-wider uppercase mb-4">
              STEP 3
            </span>
            <div className="w-12 h-12 rounded-xl bg-red-50/70 border border-red-100 flex items-center justify-center mb-4">
              <FileCheck2 className="w-6 h-6 text-[#c01823]" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900">
              View indicative pricing
            </h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              See a non-binding price indication to help you plan the job.
            </p>
          </div>

          {/* Step 4 */}
          <div className="border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center bg-white hover:border-red-200 transition-colors">
            <span className="px-2.5 py-0.5 rounded-full bg-[#c01823] text-white text-[10px] font-bold tracking-wider uppercase mb-4">
              STEP 4
            </span>
            <div className="w-12 h-12 rounded-xl bg-red-50/70 border border-red-100 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-[#c01823]" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900">
              Reviewed by our team
            </h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Our specialists review your request and prepare the next response or quotation.
            </p>
          </div>
        </div>
      </div>

      {/* Schedule a Site Assessment Card (Left Dark Photo + Right Form) */}
      <div
        id="site-visit-section"
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 scroll-mt-28"
      >
        {/* Left Side: Dark Hero Panel */}
        <div className="lg:col-span-5 relative bg-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between min-h-[440px]">
          {/* Subtle Crane Silhouette Overlay Background */}
          <div className="absolute inset-0 bg-radial from-slate-800 to-slate-950 opacity-90"></div>
          <div
            className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80")',
            }}
          ></div>

          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight leading-snug font-heading">
              Need expert advice?<br />We're here to help.
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md font-body">
              For complex lifts, heavy industrial installations, or tight access locations, our certified engineering specialists visit your job site in person.
            </p>
          </div>

          <div className="relative z-10 pt-8 mt-6 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#c01823]" />
              <span className="font-semibold text-white">+49 2324 9876-0</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#c01823]" />
              <span>info@markewitsch.de</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#c01823]" />
              <span>Mon–Fri: 07:00 – 17:00 CET</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-white flex flex-col justify-between">
          {isSubmitted ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Site Assessment Request Received!
              </h3>
              <p className="text-sm text-slate-600 max-w-md">
                Thank you, {`${siteVisitForm.firstName} ${siteVisitForm.lastName}`.trim() || 'valued client'}. One of our Markewitsch certified lift engineers will contact you within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-xs text-[#c01823] font-semibold underline pt-2"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSiteVisitSubmit} className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Schedule a Site Assessment
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Fill out your job location and contact info, and an engineer will contact you within 24 hours.
                </p>
              </div>

              {/* Contact Info: First Name, Last Name, Company, Email, Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First name <span className="text-[#c01823]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Thomas"
                      value={siteVisitForm.firstName}
                      onChange={(e) =>
                        setSiteVisitForm({ ...siteVisitForm, firstName: e.target.value })
                      }
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last name <span className="text-[#c01823]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Weber"
                      value={siteVisitForm.lastName}
                      onChange={(e) =>
                        setSiteVisitForm({ ...siteVisitForm, lastName: e.target.value })
                      }
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company <span className="text-[#c01823]">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Siemens Energy AG"
                      value={siteVisitForm.company}
                      onChange={(e) =>
                        setSiteVisitForm({ ...siteVisitForm, company: e.target.value })
                      }
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email address <span className="text-[#c01823]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={siteVisitForm.email}
                      onChange={(e) =>
                        setSiteVisitForm({ ...siteVisitForm, email: e.target.value })
                      }
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                    />
                  </div>
                </div>

                {/* Phone Number Field with country code dropdown + free text input (matches Step 1) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone number
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-24 shrink-0">
                      <CustomSelect
                        value={siteVisitForm.dialCode}
                        onChange={(val) =>
                          setSiteVisitForm({ ...siteVisitForm, dialCode: val })
                        }
                        options={COUNTRY_DIAL_CODES}
                        buttonClassName="bg-slate-50 font-mono text-xs py-2"
                        id="site-visit-phone-dial-code-select"
                      />
                    </div>
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        value={siteVisitForm.phoneNumber}
                        onChange={(e) =>
                          setSiteVisitForm({
                            ...siteVisitForm,
                            phoneNumber: e.target.value,
                          })
                        }
                        placeholder="171 9876543"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Site Address / Location Section (Searchable vs Manual Entry) */}
              {!isManualAddress ? (
                <div className="space-y-1.5" ref={addressContainerRef}>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Site Address / Location <span className="text-[#c01823]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddressDropdownOpen(false);
                        setIsManualAddress(true);
                      }}
                      className="text-xs text-[#c01823] hover:underline font-medium cursor-pointer transition-colors"
                    >
                      Enter address manually
                    </button>
                  </div>

                  <div className="relative">
                    <MapPin className="w-4 h-4 text-red-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search street, port, industrial park, or city..."
                      value={siteVisitForm.address}
                      onFocus={() => setIsAddressDropdownOpen(true)}
                      onChange={(e) => {
                        setSiteVisitForm({ ...siteVisitForm, address: e.target.value });
                        setIsAddressDropdownOpen(true);
                      }}
                      className="w-full pl-9 pr-14 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                    />
                    <div className="absolute right-2.5 top-2 flex items-center gap-1">
                      {siteVisitForm.address && (
                        <button
                          type="button"
                          onClick={() => {
                            setSiteVisitForm({
                              ...siteVisitForm,
                              address: '',
                              addressLine1: '',
                              postalCode: '',
                            });
                            setIsAddressDropdownOpen(true);
                          }}
                          className="p-0.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
                          title="Clear search"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsAddressDropdownOpen(!isAddressDropdownOpen)}
                        className="p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Autocomplete Suggestion Dropdown */}
                    {isAddressDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-30 overflow-hidden">
                        <div className="p-1 max-h-52 overflow-y-auto">
                          {filteredPresetAddresses.length > 0 ? (
                            filteredPresetAddresses.map((item, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => selectSearchAddress(item)}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 hover:text-[#c01823] flex items-center justify-between transition-colors rounded-md group"
                              >
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 shrink-0" />
                                  <span className="font-medium text-slate-800 group-hover:text-[#c01823]">
                                    {item.fullDisplay}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                                  {item.locationTag}
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="p-3 text-center text-xs text-slate-500">
                              <p>No matching preset address found.</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddressDropdownOpen(false);
                                  setIsManualAddress(true);
                                }}
                                className="mt-1 text-xs text-[#c01823] font-semibold hover:underline"
                              >
                                Click here to enter address manually
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Manual Address Entry View */
                <div className="space-y-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#c01823]" />
                      Manual Address Details
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsManualAddress(false)}
                      className="text-xs text-[#c01823] hover:underline font-medium cursor-pointer"
                    >
                      ← Search address instead
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Address Line 1 */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Address Line 1 <span className="text-[#c01823]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Kranstrasse 4 or Hafenbecken II"
                        value={siteVisitForm.addressLine1}
                        onChange={(e) =>
                          setSiteVisitForm({
                            ...siteVisitForm,
                            addressLine1: e.target.value,
                            address: `${e.target.value}, ${siteVisitForm.postalCode} ${siteVisitForm.city}, ${siteVisitForm.country}`.trim(),
                          })
                        }
                        required={isManualAddress}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                      />
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Postal Code <span className="text-[#c01823]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 60314"
                        value={siteVisitForm.postalCode}
                        onChange={(e) =>
                          setSiteVisitForm({
                            ...siteVisitForm,
                            postalCode: e.target.value,
                            address: `${siteVisitForm.addressLine1}, ${e.target.value} ${siteVisitForm.city}, ${siteVisitForm.country}`.trim(),
                          })
                        }
                        required={isManualAddress}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                      />
                    </div>

                    {/* City Dropdown */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        City <span className="text-[#c01823]">*</span>
                      </label>
                      <CustomSelect
                        value={siteVisitForm.city}
                        onChange={(val) =>
                          setSiteVisitForm({
                            ...siteVisitForm,
                            city: val,
                            address: `${siteVisitForm.addressLine1}, ${siteVisitForm.postalCode} ${val}, ${siteVisitForm.country}`.trim(),
                          })
                        }
                        options={CITIES}
                        searchable={true}
                        searchPlaceholder="Search city..."
                        buttonClassName="py-2 text-xs bg-white border border-slate-200"
                        id="site-visit-manual-city-select"
                      />
                    </div>

                    {/* State Dropdown */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        State / Region
                      </label>
                      <CustomSelect
                        value={siteVisitForm.state}
                        onChange={(val) =>
                          setSiteVisitForm({
                            ...siteVisitForm,
                            state: val,
                          })
                        }
                        options={STATES}
                        searchable={true}
                        searchPlaceholder="Search state / region..."
                        buttonClassName="py-2 text-xs bg-white border border-slate-200"
                        id="site-visit-manual-state-select"
                      />
                    </div>

                    {/* Country Dropdown */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Country <span className="text-[#c01823]">*</span>
                      </label>
                      <CustomSelect
                        value={siteVisitForm.country}
                        onChange={(val) =>
                          setSiteVisitForm({
                            ...siteVisitForm,
                            country: val,
                            address: `${siteVisitForm.addressLine1}, ${siteVisitForm.postalCode} ${siteVisitForm.city}, ${val}`.trim(),
                          })
                        }
                        options={COUNTRIES}
                        searchable={true}
                        searchPlaceholder="Search country..."
                        buttonClassName="py-2 text-xs bg-white border border-slate-200"
                        id="site-visit-manual-country-select"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Project / Site Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project / site notes <span className="text-[#c01823]">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell us about the object to be lifted, load weight, obstacles, timeline, or site restrictions..."
                  value={siteVisitForm.notes}
                  onChange={(e) =>
                    setSiteVisitForm({ ...siteVisitForm, notes: e.target.value })
                  }
                  required
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#c01823] hover:bg-[#a5131c] text-white text-xs font-semibold rounded-lg shadow-sm transition-all transform active:scale-98"
                  id="request-site-visit-submit-btn"
                >
                  <span>Request site visit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
