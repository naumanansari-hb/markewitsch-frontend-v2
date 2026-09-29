import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Layers,
  MapPin,
  ArrowRight,
  ArrowLeft,
  X,
  ChevronDown,
  Building,
  Mail,
  Phone,
} from 'lucide-react';
import { ScheduleSection } from './ScheduleSection';
import { CustomSelect } from './CustomSelect';
import {
  CustomerDetails,
  JobSiteLocation,
  LiftOverview,
  ScheduleDetails,
} from '../types';

interface JobDetailsStepProps {
  customer: CustomerDetails;
  setCustomer: React.Dispatch<React.SetStateAction<CustomerDetails>>;
  lift: LiftOverview;
  setLift: React.Dispatch<React.SetStateAction<LiftOverview>>;
  location: JobSiteLocation;
  setLocation: React.Dispatch<React.SetStateAction<JobSiteLocation>>;
  schedule: ScheduleDetails;
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleDetails>>;
  setupLocation?: 'private_property' | 'public_road';
  onSetupLocationChange?: (val: 'private_property' | 'public_road') => void;
  onBack: () => void;
  onNext: () => void;
}

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

const PRESET_ADDRESSES = [
  {
    address: 'Am Industriehafen 12',
    postalCode: '47119',
    city: 'Duisburg',
    state: 'North Rhine-Westphalia (Nordrhein-Westfalen)',
    country: 'Germany',
    portName: 'Duisburg-Hafen',
    coordinates: { lat: 51.4556, lng: 6.7589 },
  },
  {
    address: 'Kranstrasse 4',
    postalCode: '60314',
    city: 'Frankfurt am Main',
    state: 'Hesse (Hessen)',
    country: 'Germany',
    portName: 'Osthafen Frankfurt',
    coordinates: { lat: 50.1109, lng: 8.7032 },
  },
  {
    address: 'Hafenbecken II / Pier 7',
    postalCode: '20457',
    city: 'Hamburg',
    state: 'Hamburg',
    country: 'Germany',
    portName: 'Hamburger Hafen',
    coordinates: { lat: 53.5353, lng: 9.9723 },
  },
  {
    address: 'Industriepark Höchst, Tor Süd',
    postalCode: '65926',
    city: 'Frankfurt am Main',
    state: 'Hesse (Hessen)',
    country: 'Germany',
    portName: 'Chemical Park Höchst',
    coordinates: { lat: 50.0964, lng: 8.5358 },
  },
  {
    address: 'Willy-Brandt-Allee 300',
    postalCode: '45891',
    city: 'Gelsenkirchen',
    state: 'North Rhine-Westphalia (Nordrhein-Westfalen)',
    country: 'Germany',
    portName: 'Industriehafen Gelsenkirchen',
    coordinates: { lat: 51.5312, lng: 7.0982 },
  },
  {
    address: 'Siemensdamm 50',
    postalCode: '13629',
    city: 'Berlin',
    state: 'Berlin',
    country: 'Germany',
    portName: 'Siemensstadt Berlin',
    coordinates: { lat: 52.5386, lng: 13.2755 },
  },
  {
    address: 'Bajuwarenstraße 4',
    postalCode: '93053',
    city: 'Regensburg',
    state: 'Bavaria (Bayern)',
    country: 'Germany',
    portName: 'Gewerbepark Regensburg',
    coordinates: { lat: 49.0069, lng: 12.1284 },
  },
  {
    address: 'Rheinuferstraße 10',
    postalCode: '50678',
    city: 'Cologne (Köln)',
    state: 'North Rhine-Westphalia (Nordrhein-Westfalen)',
    country: 'Germany',
    portName: 'Rheinauhafen Köln',
    coordinates: { lat: 50.9258, lng: 6.9644 },
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

const LIFT_OBJECT_PRESETS = [
  'Lifting a pool',
  'Pallet',
  'Steel beams',
  'Vehicle scale',
  'Others...',
];

export const JobDetailsStep: React.FC<JobDetailsStepProps> = ({
  customer,
  setCustomer,
  lift,
  setLift,
  location,
  setLocation,
  schedule,
  setSchedule,
  setupLocation,
  onSetupLocationChange,
  onBack,
  onNext,
}) => {
  const [addressSearch, setAddressSearch] = useState(
    `${location.address}, ${location.postalCode} ${location.city}`
  );
  const [isManualAddress, setIsManualAddress] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const addressContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        addressContainerRef.current &&
        !addressContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const filteredPresetAddresses = PRESET_ADDRESSES.filter((item) => {
    const q = addressSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      item.address.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q) ||
      item.postalCode.includes(q) ||
      (item.portName && item.portName.toLowerCase().includes(q))
    );
  });

  // Determine current lift category selection
  const currentLiftCategory = (() => {
    if (lift.category) return lift.category;
    if (LIFT_OBJECT_PRESETS.includes(lift.whatNeedsLifting)) {
      return lift.whatNeedsLifting;
    }
    if (lift.whatNeedsLifting) {
      return 'Others...';
    }
    return 'Pallet';
  })();

  const handleLiftCategoryChange = (val: string) => {
    if (val === 'Others...') {
      setLift((prev) => ({
        ...prev,
        category: 'Others...',
        whatNeedsLifting: prev.customDescription || '',
      }));
    } else {
      setLift((prev) => ({
        ...prev,
        category: val,
        whatNeedsLifting: val,
      }));
    }
  };

  const handleCustomLiftDescriptionChange = (val: string) => {
    setLift((prev) => ({
      ...prev,
      category: 'Others...',
      customDescription: val,
      whatNeedsLifting: val,
    }));
  };

  // First & Last Name state management
  const firstName = customer.firstName ?? (customer.contactName ? customer.contactName.split(' ')[0] : '');
  const lastName = customer.lastName ?? (customer.contactName ? customer.contactName.split(' ').slice(1).join(' ') : '');

  const handleFirstNameChange = (val: string) => {
    setCustomer((prev) => ({
      ...prev,
      firstName: val,
      contactName: `${val} ${lastName}`.trim(),
    }));
  };

  const handleLastNameChange = (val: string) => {
    setCustomer((prev) => ({
      ...prev,
      lastName: val,
      contactName: `${firstName} ${val}`.trim(),
    }));
  };

  // Phone dial code extraction & management
  const [selectedDialCode, setSelectedDialCode] = useState(() => {
    if (customer.phone.startsWith('+')) {
      const match = COUNTRY_DIAL_CODES.find((c) => customer.phone.startsWith(c));
      return match || '+49';
    }
    return '+49';
  });

  const [phoneBody, setPhoneBody] = useState(() => {
    if (customer.phone.startsWith('+')) {
      const match = COUNTRY_DIAL_CODES.find((c) => customer.phone.startsWith(c));
      if (match) {
        return customer.phone.slice(match.length).trim();
      }
    }
    return customer.phone;
  });

  const handleDialCodeChange = (code: string) => {
    setSelectedDialCode(code);
    setCustomer((prev) => ({
      ...prev,
      phone: `${code} ${phoneBody}`.trim(),
    }));
  };

  const handlePhoneBodyChange = (body: string) => {
    setPhoneBody(body);
    setCustomer((prev) => ({
      ...prev,
      phone: `${selectedDialCode} ${body}`.trim(),
    }));
  };

  const selectAddress = (preset: (typeof PRESET_ADDRESSES)[0]) => {
    setLocation(preset);
    setAddressSearch(`${preset.address}, ${preset.postalCode} ${preset.city}`);
    setIsDropdownOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Step Title & Subtitle with clean weight */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
          Tell us about the job
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Provide your project and site details to receive tailored crane recommendations.
        </p>
      </div>

      {/* Top 2 Cards: Customer details & Lift overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: Customer Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-[#c01823]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  Customer details
                </h2>
                <p className="text-xs text-slate-500">
                  Your direct contact details for project coordination
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First name <span className="text-[#c01823]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => handleFirstNameChange(e.target.value)}
                    placeholder="e.g. Dieter"
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
                    value={lastName}
                    onChange={(e) => handleLastNameChange(e.target.value)}
                    placeholder="e.g. Schmidt"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company name <span className="text-[#c01823]">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customer.companyName}
                    onChange={(e) =>
                      setCustomer({ ...customer, companyName: e.target.value })
                    }
                    placeholder="e.g. Siemens Energy"
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
                    value={customer.email}
                    onChange={(e) =>
                      setCustomer({ ...customer, email: e.target.value })
                    }
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                  />
                </div>
              </div>

              {/* Phone Number Field with country code dropdown + free text input */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone number
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-24 shrink-0">
                    <CustomSelect
                      value={selectedDialCode}
                      onChange={(val) => handleDialCodeChange(val)}
                      options={COUNTRY_DIAL_CODES}
                      buttonClassName="bg-slate-50 font-mono text-xs py-2"
                      id="phone-dial-code-select"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={phoneBody}
                      onChange={(e) => handlePhoneBodyChange(e.target.value)}
                      placeholder="171 9876543"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Lift Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5 text-[#c01823]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  Lift overview
                </h2>
                <p className="text-xs text-slate-500">
                  Select or describe the object or cargo to be lifted
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  What needs to be lifted? <span className="text-[#c01823]">*</span>
                </label>
                <CustomSelect
                  value={currentLiftCategory}
                  onChange={(val) => handleLiftCategoryChange(val)}
                  options={LIFT_OBJECT_PRESETS}
                  searchable={true}
                  searchPlaceholder="Search cargo/object type..."
                  buttonClassName="py-2 text-xs bg-white border border-slate-200"
                  id="what-needs-lifting-select"
                />
              </div>

              {/* Free text input if 'Others...' is selected */}
              {currentLiftCategory === 'Others...' && (
                <div className="animate-in fade-in duration-150 space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Specify object description <span className="text-[#c01823]">*</span>
                  </label>
                  <input
                    type="text"
                    value={lift.customDescription || lift.whatNeedsLifting || ''}
                    onChange={(e) => handleCustomLiftDescriptionChange(e.target.value)}
                    placeholder="e.g. Industrial Gas Turbine Compressor Block, HVAC chiller unit..."
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                  />
                </div>
              )}

              {/* Additional Information Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional information
                </label>
                <textarea
                  rows={currentLiftCategory === 'Others...' ? 2 : 4}
                  value={customer.additionalInformation || ''}
                  onChange={(e) =>
                    setCustomer({ ...customer, additionalInformation: e.target.value })
                  }
                  placeholder="Provide any specific cargo details, site instructions, constraints, or notes..."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Job site location */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-[#c01823]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              Job site location
            </h2>
            <p className="text-xs text-slate-500">
              Address where the crane will be deployed and rigged
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 items-start">
          {/* Left search & address tags OR Manual Address Entry */}
          <div className="lg:col-span-7 space-y-3">
            {!isManualAddress ? (
              <div className="space-y-2" ref={addressContainerRef}>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Search job site address <span className="text-[#c01823]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
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
                    value={addressSearch}
                    onFocus={() => setIsDropdownOpen(true)}
                    onChange={(e) => {
                      setAddressSearch(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    placeholder="Search street, port, industrial park, or city..."
                    className="w-full pl-9 pr-14 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                  />
                  <div className="absolute right-2.5 top-2 flex items-center gap-1">
                    {addressSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setAddressSearch('');
                          setIsDropdownOpen(true);
                        }}
                        className="p-0.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Autocomplete Dropdown */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-30 overflow-hidden">
                      <div className="p-1 max-h-52 overflow-y-auto">
                        {filteredPresetAddresses.length > 0 ? (
                          filteredPresetAddresses.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => selectAddress(item)}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 hover:text-[#c01823] flex items-center justify-between transition-colors rounded-md group"
                            >
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 shrink-0" />
                                <span className="font-medium text-slate-800 group-hover:text-[#c01823]">
                                  {item.address}, {item.postalCode} {item.city}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                                {item.portName}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-center text-xs text-slate-500">
                            <p>No matching preset address found.</p>
                            <button
                              type="button"
                              onClick={() => {
                                setIsDropdownOpen(false);
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

                {/* Read-only Address Tag / Pill */}
                {location.address && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50/70 border border-red-200 text-xs text-[#c01823] font-medium rounded-md">
                    <span>
                      {location.address}, {location.postalCode} {location.city}, {location.country}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAddressSearch('');
                        setIsDropdownOpen(true);
                      }}
                      className="hover:bg-red-200/50 p-0.5 rounded transition-colors ml-1"
                      title="Clear and search another address"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
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
                    onClick={() => {
                      setIsManualAddress(false);
                      setAddressSearch(`${location.address}, ${location.postalCode} ${location.city}`);
                    }}
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
                      value={location.address}
                      onChange={(e) => {
                        const newAddr = e.target.value;
                        setLocation((prev) => ({ ...prev, address: newAddr }));
                        setAddressSearch(`${newAddr}, ${location.postalCode} ${location.city}`);
                      }}
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
                      value={location.postalCode}
                      onChange={(e) => {
                        const newPostal = e.target.value;
                        setLocation((prev) => ({ ...prev, postalCode: newPostal }));
                        setAddressSearch(`${location.address}, ${newPostal} ${location.city}`);
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                    />
                  </div>

                  {/* City Dropdown */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      City <span className="text-[#c01823]">*</span>
                    </label>
                    <CustomSelect
                      value={location.city || 'Duisburg'}
                      onChange={(val) => {
                        setLocation((prev) => ({ ...prev, city: val }));
                        setAddressSearch(`${location.address}, ${location.postalCode} ${val}`);
                      }}
                      options={CITIES}
                      searchable={true}
                      searchPlaceholder="Search city..."
                      buttonClassName="py-2 text-xs bg-white border border-slate-200"
                      id="job-site-manual-city-select"
                    />
                  </div>

                  {/* State Dropdown */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      State / Region
                    </label>
                    <CustomSelect
                      value={location.state || 'North Rhine-Westphalia (Nordrhein-Westfalen)'}
                      onChange={(val) => setLocation((prev) => ({ ...prev, state: val }))}
                      options={STATES}
                      searchable={true}
                      searchPlaceholder="Search state / region..."
                      buttonClassName="py-2 text-xs bg-white border border-slate-200"
                      id="job-site-manual-state-select"
                    />
                  </div>

                  {/* Country Dropdown */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Country <span className="text-[#c01823]">*</span>
                    </label>
                    <CustomSelect
                      value={location.country || 'Germany'}
                      onChange={(val) => setLocation((prev) => ({ ...prev, country: val }))}
                      options={COUNTRIES}
                      searchable={true}
                      searchPlaceholder="Search country..."
                      buttonClassName="py-2 text-xs bg-white border border-slate-200"
                      id="job-site-manual-country-select"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Where is the crane expected to be set up? (Below address search, same width & style) */}
            <div className="space-y-1.5 pt-1">
              <label htmlFor="crane-setup-location-select" className="block text-xs font-semibold text-slate-700">
                Where is the crane expected to be set up? <span className="text-[#c01823]">*</span>
              </label>
              <CustomSelect
                value={location.setupLocation || setupLocation || 'private_property'}
                onChange={(val) => {
                  const newSetup = val as 'private_property' | 'public_road';
                  setLocation((prev) => ({ ...prev, setupLocation: newSetup }));
                  if (onSetupLocationChange) {
                    onSetupLocationChange(newSetup);
                  }
                }}
                options={[
                  { value: 'private_property', label: 'Private property' },
                  { value: 'public_road', label: 'Public road / street' },
                ]}
                buttonClassName="w-full py-2 text-xs bg-white border border-slate-200"
                id="crane-setup-location-select"
              />
            </div>
          </div>

          {/* Right Vector Google Map Preview with Point Location */}
          <div className="lg:col-span-5">
            <div className="relative w-full h-[126px] rounded-xl overflow-hidden border border-slate-200 shadow-2xs bg-[#f2f4f7]">
              {/* Google Map Vector Simulation */}
              <svg className="w-full h-full" viewBox="0 0 320 126" preserveAspectRatio="none">
                {/* Land background */}
                <rect width="320" height="160" fill="#f4f3f0" />

                {/* Park / Green Zone */}
                <path d="M 0,0 L 90,0 L 70,55 L 0,40 Z" fill="#d8edd5" opacity="0.8" />
                <path d="M 230,120 L 320,105 L 320,160 L 210,160 Z" fill="#d8edd5" opacity="0.8" />

                {/* Water Body (River / Canal) */}
                <path
                  d="M 280,0 Q 250,50 270,100 T 310,160 L 320,160 L 320,0 Z"
                  fill="#c8def4"
                  opacity="0.9"
                />

                {/* Urban Blocks / Parcels */}
                <rect x="30" y="65" width="45" height="35" rx="3" fill="#e5e7eb" opacity="0.7" />
                <rect x="85" y="70" width="55" height="30" rx="3" fill="#e5e7eb" opacity="0.7" />
                <rect x="180" y="20" width="50" height="40" rx="3" fill="#e5e7eb" opacity="0.7" />
                <rect x="180" y="75" width="60" height="35" rx="3" fill="#e5e7eb" opacity="0.7" />

                {/* Minor Secondary Roads */}
                <line x1="0" y1="60" x2="260" y2="60" stroke="#ffffff" strokeWidth="6" />
                <line x1="80" y1="0" x2="80" y2="160" stroke="#ffffff" strokeWidth="6" />
                <line x1="175" y1="0" x2="175" y2="160" stroke="#ffffff" strokeWidth="5" />
                <line x1="0" y1="110" x2="250" y2="110" stroke="#ffffff" strokeWidth="5" />

                {/* Major Primary Highway (Yellow with orange outline) */}
                <path
                  d="M 0,25 Q 150,30 320,85"
                  stroke="#fbbf24"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 150,0 Q 155,70 160,160"
                  stroke="#ffffff"
                  strokeWidth="8"
                  fill="none"
                />

                {/* Street Labels */}
                <text x="90" y="55" fontSize="6.5" fill="#64748b" fontWeight="600" fontFamily="sans-serif">
                  Kranstraße
                </text>
                <text x="185" y="105" fontSize="6.5" fill="#64748b" fontWeight="600" fontFamily="sans-serif">
                  Industrieweg
                </text>
                <text x="15" y="21" fontSize="6.5" fill="#d97706" fontWeight="700" fontFamily="sans-serif">
                  B8 / A40
                </text>
              </svg>

              {/* Exact Google Maps Pinpoint Marker */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none">
                {/* Red Google Pin SVG */}
                <svg width="28" height="36" viewBox="0 0 28 36" fill="none" className="drop-shadow-md">
                  <path
                    d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.268 21.732 0 14 0Z"
                    fill="#ea4335"
                  />
                  <circle cx="14" cy="13" r="5.5" fill="#ffffff" />
                  <circle cx="14" cy="13" r="3" fill="#b91c1c" />
                </svg>
                {/* Location Tooltip Pill */}
                <div className="mt-0.5 px-2 py-0.5 bg-white/95 rounded-md shadow-sm border border-slate-200 text-[10px] font-semibold text-slate-800 whitespace-nowrap">
                  {location.address || location.city}
                </div>
              </div>

              {/* Minimal Google Map UI Badges */}
              <div className="absolute top-2 left-2 flex gap-1 bg-white/90 rounded border border-slate-200 p-0.5 text-[9px] font-medium text-slate-600">
                <span className="px-1.5 py-0.5 bg-slate-100 rounded font-semibold text-slate-900">Map</span>
              </div>
              <div className="absolute bottom-1 right-1 text-[8px] font-bold text-slate-400 font-sans tracking-wide">
                Google
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Schedule & Working Hours (Progressive Disclosure) */}
      <ScheduleSection schedule={schedule} setSchedule={setSchedule} />

      {/* Bottom Navigation Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          id="back-to-landing-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#c01823] hover:bg-[#a5131c] text-white text-xs font-semibold rounded-lg shadow-sm transition-all transform active:scale-98"
          id="continue-to-lift-details-btn"
        >
          <span>Continue to lift details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
