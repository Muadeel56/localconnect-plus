import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const CustomSelect = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = "Select an option",
  className = "",
  size = "md"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Only add event listener if dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const selectedOption = options.find(option => option.value === value);

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`relative ${className}`} ref={dropdownRef} style={{ zIndex: isOpen ? 9999 : 'auto' }} data-custom-select>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full ${sizeClass} rounded-lg border border-border-primary bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex items-center justify-between transition-all duration-200 hover:bg-bg-secondary hover:border-border-secondary`}
      >
        <span className={selectedOption ? 'text-text-primary' : 'text-text-tertiary'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg 
          className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && createPortal(
        <div 
          className="fixed z-[9999] rounded-lg border-2 border-primary bg-bg-card shadow-2xl max-h-60 overflow-auto transform transition-all duration-200 ease-out opacity-100 scale-100"
          style={{ 
            top: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().bottom + 8 : 0,
            left: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().left : 0,
            width: dropdownRef.current ? dropdownRef.current.offsetWidth : 'auto',
            minWidth: dropdownRef.current ? dropdownRef.current.offsetWidth : 'auto'
          }}
        >
          {options && options.length > 0 ? options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg ${
                option.value === value 
                  ? 'bg-primary text-white font-medium' 
                  : 'text-text-primary hover:bg-bg-secondary hover:text-text-primary'
              }`}
            >
              {option.label}
            </button>
          )) : (
            <div className="px-4 py-3 text-text-secondary text-sm">No options available</div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomSelect; 