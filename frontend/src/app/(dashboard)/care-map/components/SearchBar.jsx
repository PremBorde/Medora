'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, Building2, Pill, Microscope, Mic, Compass, History, Sparkles } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Search },
  { id: 'hospital', label: 'Hospitals', icon: Building2 },
  { id: 'doctor', label: 'Clinics', icon: MapPin },
  { id: 'diagnostic', label: 'Diagnostics', icon: Microscope },
  { id: 'pharmacy', label: 'Pharmacies', icon: Pill },
];

const SUGGESTIONS = [
  'Apollo Hospital',
  'City General Hospital',
  'Fortis Memorial Hospital',
  'Max Super Speciality Hospital',
  'MedPlus Clinic',
  'LifeCare Diagnostics',
  'MedWorld Pharmacy',
  'Government District Hospital',
];

const INITIAL_RECENTS = ['Cardiology Clinic', 'Emergency Near Me', '24x7 Open Pharmacy'];

/**
 * SearchBar — Premium healthcare search bar with autocompletion and recent queries.
 */
export default function SearchBar({ onSearch, onCategoryChange, onLocateSelf }) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isFocused, setIsFocused] = useState(false);
  const [recents, setRecents] = useState(INITIAL_RECENTS);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const debouncedSearch = useDebouncedCallback((value) => {
    onSearch?.(value);
  }, 300);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch?.('');
    inputRef.current?.focus();
  };

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    onCategoryChange?.(catId);
  };

  const handleSuggestionClick = (val) => {
    setQuery(val);
    onSearch?.(val);
    setIsFocused(false);
    
    // Add to recents if not exists
    if (!recents.includes(val)) {
      setRecents((prev) => [val, ...prev.slice(0, 2)]);
    }
  };

  const handleVoiceSearch = () => {
    setIsListening(true);
    // Simulate voice listening
    setTimeout(() => {
      setIsListening(false);
      handleSuggestionClick('City General Hospital');
    }, 1500);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredSuggestions = SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-3 relative" ref={dropdownRef}>
      {/* Search Input Box */}
      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 0 0 3px rgba(8, 145, 178, 0.12), 0 4px 20px -2px rgba(8, 145, 178, 0.08)'
            : '0 1px 3px rgba(0,0,0,0.06)',
        }}
        className="relative rounded-xl bg-white border border-border overflow-hidden transition-all flex items-center pr-2"
      >
        <Search className="w-4.5 h-4.5 text-muted-foreground ml-4 shrink-0" />
        
        <input
          ref={inputRef}
          type="text"
          placeholder="Search specialists, hospitals, or clinics..."
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          className="flex-1 px-3 py-3.5 text-sm text-foreground placeholder:text-muted-foreground bg-transparent border-none outline-none font-medium"
        />

        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors mr-1"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Voice Search */}
        <button
          onClick={handleVoiceSearch}
          className={`p-2 rounded-lg hover:bg-primary-50 transition-colors mr-1 ${
            isListening ? 'text-primary bg-primary-50 animate-pulse' : 'text-muted-foreground'
          }`}
          title="Voice Search"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Locate Self */}
        <button
          onClick={onLocateSelf}
          className="p-2 rounded-lg hover:bg-primary-50 text-muted-foreground hover:text-primary transition-colors"
          title="Use Current Location"
        >
          <Compass className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Autocomplete & Recents Dropdown */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-border shadow-lg rounded-xl z-50 overflow-hidden divide-y divide-border/50"
          >
            {/* Suggestions list */}
            {query && filteredSuggestions.length > 0 && (
              <div className="p-2 max-h-48 overflow-y-auto">
                <p className="text-[10px] font-extrabold text-muted-foreground px-3 py-1 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-primary" />
                  Suggestions
                </p>
                {filteredSuggestions.map((s) => (
                  <button
                    key={s}
                    onMouseDown={() => handleSuggestionClick(s)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-foreground hover:bg-primary-50 hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {recents.length > 0 && (
              <div className="p-2">
                <p className="text-[10px] font-extrabold text-muted-foreground px-3 py-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3 h-3 text-muted-foreground" />
                  Recent Searches
                </p>
                <div className="flex flex-wrap gap-1.5 px-3 py-1">
                  {recents.map((r) => (
                    <button
                      key={r}
                      onMouseDown={() => handleSuggestionClick(r)}
                      className="px-2.5 py-1 rounded-lg bg-muted text-[10px] font-bold text-muted-foreground hover:bg-primary-50 hover:text-primary hover:border-primary/20 transition-all border border-transparent"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryClick(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                isActive
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-muted-foreground border-border hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
