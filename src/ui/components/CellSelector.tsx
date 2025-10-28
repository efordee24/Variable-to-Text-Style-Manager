import React, { useState, useRef, useEffect } from 'react';
import { PropertyKey, VariableRef } from '../../types';

interface CellSelectorProps {
  styleId: string;
  property: PropertyKey;
  currentValue?: any;
  variables: VariableRef[];
  selectedVariableId?: string;
  autoMatchId?: string;
  onSelectionChange: (styleId: string, property: PropertyKey, variableId: string) => void;
}

export function CellSelector({
  styleId,
  property,
  currentValue,
  variables,
  selectedVariableId,
  autoMatchId,
  onSelectionChange,
}: CellSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVariables, setFilteredVariables] = useState(variables);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const filtered = variables.filter(variable =>
      variable.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVariables(filtered);
  }, [variables, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleSelect = (variableId: string) => {
    onSelectionChange(styleId, property, variableId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onSelectionChange(styleId, property, '');
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedVariable = variables.find(v => v.id === selectedVariableId);
  const autoMatchVariable = variables.find(v => v.id === autoMatchId);
  const isAutoMatched = selectedVariableId === autoMatchId;

  const formatValue = (value: any) => {
    if (typeof value === 'number') {
      return value.toString();
    }
    if (value === 'AUTO') {
      return 'Auto';
    }
    return value?.toString() || '';
  };

  return (
    <div className="cell-selector" ref={dropdownRef}>
      <div
        className={`cell-trigger ${isAutoMatched ? 'auto-match' : ''}`}
        onClick={handleToggle}
      >
        {selectedVariable ? (
          <div className="selected-variable">
            <span className="variable-name">{selectedVariable.name}</span>
            <span className="variable-value">({formatValue(selectedVariable.value)})</span>
          </div>
        ) : (
          <div className="placeholder">
            {currentValue ? formatValue(currentValue) : 'Select variable...'}
          </div>
        )}
        <span className="dropdown-arrow">▼</span>
      </div>

      {isOpen && (
        <div className="cell-dropdown">
          <div className="dropdown-header">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search variables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button onClick={handleClear} className="clear-btn">
              Clear
            </button>
          </div>
          
          <div className="dropdown-list">
            {filteredVariables.length === 0 ? (
              <div className="no-results">No variables found</div>
            ) : (
              filteredVariables.map(variable => (
                <div
                  key={variable.id}
                  className={`dropdown-item ${selectedVariableId === variable.id ? 'selected' : ''}`}
                  onClick={() => handleSelect(variable.id)}
                >
                  <span className="variable-name">{variable.name}</span>
                  <span className="variable-value">({formatValue(variable.value)})</span>
                  {autoMatchId === variable.id && (
                    <span className="auto-match-indicator">Auto</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
