import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
}

interface CustomSelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: Array<SelectOption | string | number>;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  id?: string;
  disabled?: boolean;
  searchable?: boolean;
  showSearchIcon?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  id,
  disabled = false,
  searchable = false,
  showSearchIcon = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options into { value: string, label: string, disabled?: boolean, disabledReason?: string }
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null && 'value' in opt) {
      return {
        value: String(opt.value),
        label: opt.label || String(opt.value),
        disabled: opt.disabled,
        disabledReason: opt.disabledReason,
      };
    }
    return {
      value: String(opt),
      label: String(opt),
    };
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!searchQuery.trim()) return true;
    return (
      opt.label.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      String(opt.value).toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  });

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      if (searchable) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }
    } else {
      setSearchQuery('');
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen, searchable]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  const displaySearchIcon = showSearchIcon || searchable;

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full text-left ${className}`}
      id={id ? `${id}-container` : undefined}
    >
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full px-3 py-2 text-xs border rounded-lg bg-white font-medium text-slate-800 flex items-center justify-between transition-colors text-left select-none ${
          isOpen
            ? 'border-[#c01823] ring-1 ring-[#c01823] shadow-xs'
            : 'border-slate-200 hover:border-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer'} ${buttonClassName}`}
      >
        <div className="flex items-center min-w-0 flex-1 mr-2">
          {displaySearchIcon && (
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-2" />
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#c01823]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 top-full mt-1 w-full min-w-[140px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 max-h-64 flex flex-col space-y-1 animate-in fade-in-50 zoom-in-95 duration-100 ${dropdownClassName}`}
        >
          {/* Search box if searchable */}
          {searchable && (
            <div className="relative mb-1 pb-1 border-b border-slate-100 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:bg-white text-slate-800 placeholder:text-slate-400"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredOptions.length > 0) {
                      e.preventDefault();
                      const firstActive = filteredOptions.find((o) => !o.disabled);
                      if (firstActive) {
                        handleSelect(String(firstActive.value));
                      }
                    }
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options list */}
          <div className="overflow-y-auto space-y-0.5 max-h-48 pr-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                const isDisabled = Boolean(opt.disabled);

                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={isDisabled}
                    title={
                      opt.disabledReason ||
                      (isDisabled
                        ? 'Option unavailable for current load configuration'
                        : undefined)
                    }
                    onClick={() => {
                      if (!isDisabled) {
                        handleSelect(String(opt.value));
                      }
                    }}
                    className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between select-none ${
                      isDisabled
                        ? 'opacity-45 bg-slate-50 text-slate-400 cursor-not-allowed border border-dashed border-slate-200'
                        : isSelected
                        ? 'bg-red-50 text-[#c01823] font-semibold cursor-pointer'
                        : 'text-slate-700 hover:bg-red-50 hover:text-[#c01823] cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center min-w-0 pr-1">
                      <span
                        className={`truncate ${
                          isDisabled ? 'line-through text-slate-400 font-normal' : ''
                        }`}
                      >
                        {opt.label}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#c01823] shrink-0 ml-2" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-3 px-2 text-center text-xs text-slate-400">
                No matching options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

