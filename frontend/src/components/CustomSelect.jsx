import React, { useState, useRef, useEffect } from 'react';

const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          border: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)'
        }}
        className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex items-center justify-between"
      >
        <span style={{ color: selectedOption ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg 
          style={{ color: 'var(--text-secondary)' }}
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-primary)'
          }}
          className="absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                color: option.value === value ? 'white' : 'var(--text-primary)',
                backgroundColor: option.value === value ? 'var(--primary-500)' : 'transparent'
              }}
              className="w-full px-3 py-2 text-left transition-colors hover:bg-bg-secondary"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect; 