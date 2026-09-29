import React, { useState, useRef, useEffect } from 'react';
import { MARKEWITSCH_LOGO } from '../assets/logo';
import {
  X,
  ShieldCheck,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
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

interface SiteVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SiteVisitModal: React.FC<SiteVisitModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    dialCode: '+49',
    phoneNumber: '',
    address: 'Am Industriehafen 12, 47119 Duisburg, Germany',
    addressLine1: 'Am Industriehafen 12',
    postalCode: '47119',
    city: 'Duisburg',
    state: 'North Rhine-Westphalia (Nordrhein-Westfalen)',
    country: 'Germany',
    notes: '',
  });

  const [isManualAddress, setIsManualAddress] = useState(false);
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const modalAddressContainerRef = useRef<HTMLDivElement>(null);

  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        modalAddressContainerRef.current &&
        !modalAddressContainerRef.current.contains(e.target as Node)
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
    const q = form.address.toLowerCase().trim();
    if (!q) return true;
    return (
      item.fullDisplay.toLowerCase().includes(q) ||
      item.locationTag.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q) ||
      item.postalCode.includes(q)
    );
  });

  const selectSearchAddress = (item: (typeof PRESET_SITE_ADDRESSES)[0]) => {
    setForm((prev) => ({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      alert('Please fill out at least your first name, last name, and email address.');
      return;
    }
    if (!isManualAddress && !form.address) {
      alert('Please search or enter the site address.');
      return;
    }
    if (isManualAddress && (!form.addressLine1 || !form.postalCode)) {
      alert('Please enter Address Line 1 and Postal Code.');
      return;
    }
    setIsDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <img
              src={MARKEWITSCH_LOGO}
              alt="Gebr. Markewitsch"
              className="h-11 sm:h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[#c01823]" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">
                Request On-Site Lift Inspection
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isDone ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Site Visit Requested!
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Thank you, {`${form.firstName} ${form.lastName}`.trim() || 'valued client'}. Our heavy lift engineering team will review your site location and contact you within 24 hours to coordinate the on-site visit.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-5 py-2 bg-[#c01823] text-white text-xs font-semibold rounded-lg hover:bg-[#a5131c]"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <p className="text-xs text-slate-500">
                Our certified crane engineers inspect the access roads, grounding terrain, obstacle heights, and clearances in person.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    First name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Thomas"
                      value={form.firstName}
                      onChange={(e) =>
                        setForm({ ...form, firstName: e.target.value })
                      }
                      className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Last name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Weber"
                      value={form.lastName}
                      onChange={(e) =>
                        setForm({ ...form, lastName: e.target.value })
                      }
                      className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Company *
                  </label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Siemens Energy"
                      value={form.company}
                      onChange={(e) =>
                        setForm({ ...form, company: e.target.value })
                      }
                      className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email address *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Phone Number Field with country code dropdown + free text input */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Phone number
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-20 shrink-0">
                      <CustomSelect
                        value={form.dialCode}
                        onChange={(val) => setForm({ ...form, dialCode: val })}
                        options={COUNTRY_DIAL_CODES}
                        buttonClassName="bg-slate-50 font-mono text-xs py-1.5"
                        id="modal-phone-dial-code-select"
                      />
                    </div>
                    <div className="relative flex-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="tel"
                        value={form.phoneNumber}
                        onChange={(e) =>
                          setForm({ ...form, phoneNumber: e.target.value })
                        }
                        placeholder="171 1234567"
                        className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Site Address / Location Section (Searchable vs Manual) */}
              {!isManualAddress ? (
                <div className="space-y-1" ref={modalAddressContainerRef}>
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Site Address / Location *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddressDropdownOpen(false);
                        setIsManualAddress(true);
                      }}
                      className="text-[11px] text-[#c01823] hover:underline font-medium cursor-pointer"
                    >
                      Enter address manually
                    </button>
                  </div>

                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-red-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search street, port, or city..."
                      value={form.address}
                      onFocus={() => setIsAddressDropdownOpen(true)}
                      onChange={(e) => {
                        setForm({ ...form, address: e.target.value });
                        setIsAddressDropdownOpen(true);
                      }}
                      className="w-full pl-8 pr-12 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                    />
                    <div className="absolute right-2 top-1.5 flex items-center gap-1">
                      {form.address && (
                        <button
                          type="button"
                          onClick={() => {
                            setForm({
                              ...form,
                              address: '',
                              addressLine1: '',
                              postalCode: '',
                            });
                            setIsAddressDropdownOpen(true);
                          }}
                          className="p-0.5 text-slate-400 hover:text-slate-600 rounded"
                          title="Clear search"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsAddressDropdownOpen(!isAddressDropdownOpen)}
                        className="p-0.5 text-slate-400 hover:text-slate-600"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Autocomplete Dropdown */}
                    {isAddressDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-30 overflow-hidden">
                        <div className="p-1 max-h-48 overflow-y-auto">
                          {filteredPresetAddresses.length > 0 ? (
                            filteredPresetAddresses.map((item, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => selectSearchAddress(item)}
                                className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-red-50 hover:text-[#c01823] flex items-center justify-between transition-colors rounded-md group"
                              >
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3 h-3 text-slate-400 group-hover:text-red-500 shrink-0" />
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
                            <div className="p-2.5 text-center text-xs text-slate-500">
                              <p>No matching preset address found.</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddressDropdownOpen(false);
                                  setIsManualAddress(true);
                                }}
                                className="mt-1 text-xs text-[#c01823] font-semibold hover:underline"
                              >
                                Enter address manually
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Manual Address Entry Mode */
                <div className="space-y-2.5 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#c01823]" />
                      Manual Address Details
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsManualAddress(false)}
                      className="text-[11px] text-[#c01823] hover:underline font-medium cursor-pointer"
                    >
                      ← Search address instead
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Kranstrasse 4"
                        value={form.addressLine1}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            addressLine1: e.target.value,
                            address: `${e.target.value}, ${form.postalCode} ${form.city}, ${form.country}`.trim(),
                          })
                        }
                        required={isManualAddress}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 60314"
                        value={form.postalCode}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            postalCode: e.target.value,
                            address: `${form.addressLine1}, ${e.target.value} ${form.city}, ${form.country}`.trim(),
                          })
                        }
                        required={isManualAddress}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                        City *
                      </label>
                      <CustomSelect
                        value={form.city}
                        onChange={(val) =>
                          setForm({
                            ...form,
                            city: val,
                            address: `${form.addressLine1}, ${form.postalCode} ${val}, ${form.country}`.trim(),
                          })
                        }
                        options={CITIES}
                        searchable={true}
                        searchPlaceholder="Search city..."
                        buttonClassName="py-1.5 text-xs bg-white border border-slate-200"
                        id="modal-manual-city-select"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                        State / Region
                      </label>
                      <CustomSelect
                        value={form.state}
                        onChange={(val) =>
                          setForm({
                            ...form,
                            state: val,
                          })
                        }
                        options={STATES}
                        searchable={true}
                        searchPlaceholder="Search state / region..."
                        buttonClassName="py-1.5 text-xs bg-white border border-slate-200"
                        id="modal-manual-state-select"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                        Country *
                      </label>
                      <CustomSelect
                        value={form.country}
                        onChange={(val) =>
                          setForm({
                            ...form,
                            country: val,
                            address: `${form.addressLine1}, ${form.postalCode} ${form.city}, ${val}`.trim(),
                          })
                        }
                        options={COUNTRIES}
                        searchable={true}
                        searchPlaceholder="Search country..."
                        buttonClassName="py-1.5 text-xs bg-white border border-slate-200"
                        id="modal-manual-country-select"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Project / Site Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Load weight, height, special ground requirements..."
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  className="w-full p-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#c01823] hover:bg-[#a5131c] text-white text-xs font-semibold rounded-lg shadow-sm"
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
