import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

export default function AddressAutocomplete({ value, onChange, placeholder, iconColor, testId }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Sync external value changes
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (text) => {
    if (!text || text.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5&types=place,locality,address,poi`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Geocoding failed');
      const data = await res.json();
      const results = (data.features || []).map((f) => ({
        id: f.id,
        name: f.place_name,
        shortName: f.text,
        coords: f.center,
        context: f.context?.map(c => c.text).join(', ') || '',
      }));
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    onChange(text);

    // Debounce API calls - 300ms
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(text), 300);
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion.name);
    onChange(suggestion.name);
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative" data-testid={`${testId}-wrapper`}>
      <MapPin size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 z-10`} style={{ color: iconColor }} />
      {loading && (
        <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 animate-spin" style={{ color: 'var(--text-secondary)' }} />
      )}
      <input
        data-testid={testId}
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
        autoComplete="off"
        className="w-full pl-10 pr-9 py-3 text-sm font-medium rounded-md border focus:ring-2 focus:ring-primary focus:outline-none transition-all"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
      />

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full mt-1 z-50 rounded-md border overflow-hidden animate-fade-in"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
          data-testid={`${testId}-suggestions`}
        >
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              type="button"
              data-testid={`${testId}-suggestion-${i}`}
              onClick={() => handleSelect(s)}
              onMouseEnter={() => setActiveIndex(i)}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors duration-100"
              style={{
                background: i === activeIndex ? 'var(--bg)' : 'transparent',
              }}
            >
              <MapPin size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--text-secondary)' }} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {s.shortName}
                </p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {s.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
