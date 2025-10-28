import React, { useState } from 'react';
import { StyleRow, VariableCollection, PropertyKey } from '../../types';
import { CellSelector } from './CellSelector';

interface StyleTableProps {
  styles: StyleRow[];
  collections: VariableCollection[];
  onBulkUpdate: (updates: Array<{ styleId: string; property: PropertyKey; variableId: string }>) => void;
}

export function StyleTable({ styles, collections, onBulkUpdate }: StyleTableProps) {
  const [selections, setSelections] = useState<Record<string, Partial<Record<PropertyKey, string>>>>(
    styles.reduce((acc, style) => {
      acc[style.styleId] = { ...style.selection };
      return acc;
    }, {} as Record<string, Partial<Record<PropertyKey, string>>>)
  );

  const handleCellChange = (styleId: string, property: PropertyKey, variableId: string) => {
    setSelections(prev => ({
      ...prev,
      [styleId]: {
        ...prev[styleId],
        [property]: variableId,
      },
    }));
  };

  const handleBulkUpdate = () => {
    const updates: Array<{ styleId: string; property: PropertyKey; variableId: string }> = [];
    
    Object.entries(selections).forEach(([styleId, selections]) => {
      Object.entries(selections).forEach(([property, variableId]) => {
        if (variableId) {
          updates.push({
            styleId,
            property: property as PropertyKey,
            variableId,
          });
        }
      });
    });

    if (updates.length > 0) {
      onBulkUpdate(updates);
    }
  };

  const getVariablesForProperty = (property: PropertyKey) => {
    // This would need to be implemented based on the selected collection for each property
    // For now, return all variables from all collections
    return collections.flatMap(collection => collection.variables);
  };

  const hasSelections = Object.values(selections).some(styleSelections => 
    Object.values(styleSelections).some(Boolean)
  );

  return (
    <div className="style-table-container">
      <div className="table-header">
        <h3>Text Styles ({styles.length})</h3>
        <button
          onClick={handleBulkUpdate}
          disabled={!hasSelections}
          className="btn btn-primary"
        >
          Update Styles
        </button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Style Name</th>
              <th>Font Family</th>
              <th>Font Size</th>
              <th>Font Weight</th>
              <th>Line Height</th>
              <th>Letter Spacing</th>
            </tr>
          </thead>
          <tbody>
            {styles.map(style => (
              <tr key={style.styleId}>
                <td className="style-name">
                  <div className="style-name-content">
                    <strong>{style.styleName}</strong>
                    {Object.keys(style.autoMatch).length > 0 && (
                      <span className="auto-match-badge">Auto-matched</span>
                    )}
                  </div>
                </td>
                <td>
                  <CellSelector
                    styleId={style.styleId}
                    property="fontFamily"
                    currentValue={style.current.fontFamily}
                    variables={getVariablesForProperty('fontFamily')}
                    selectedVariableId={selections[style.styleId]?.fontFamily}
                    autoMatchId={style.autoMatch.fontFamily}
                    onSelectionChange={handleCellChange}
                  />
                </td>
                <td>
                  <CellSelector
                    styleId={style.styleId}
                    property="fontSize"
                    currentValue={style.current.fontSize}
                    variables={getVariablesForProperty('fontSize')}
                    selectedVariableId={selections[style.styleId]?.fontSize}
                    autoMatchId={style.autoMatch.fontSize}
                    onSelectionChange={handleCellChange}
                  />
                </td>
                <td>
                  <CellSelector
                    styleId={style.styleId}
                    property="fontWeight"
                    currentValue={style.current.fontWeight}
                    variables={getVariablesForProperty('fontWeight')}
                    selectedVariableId={selections[style.styleId]?.fontWeight}
                    autoMatchId={style.autoMatch.fontWeight}
                    onSelectionChange={handleCellChange}
                  />
                </td>
                <td>
                  <CellSelector
                    styleId={style.styleId}
                    property="lineHeight"
                    currentValue={style.current.lineHeight}
                    variables={getVariablesForProperty('lineHeight')}
                    selectedVariableId={selections[style.styleId]?.lineHeight}
                    autoMatchId={style.autoMatch.lineHeight}
                    onSelectionChange={handleCellChange}
                  />
                </td>
                <td>
                  <CellSelector
                    styleId={style.styleId}
                    property="letterSpacing"
                    currentValue={style.current.letterSpacing}
                    variables={getVariablesForProperty('letterSpacing')}
                    selectedVariableId={selections[style.styleId]?.letterSpacing}
                    autoMatchId={style.autoMatch.letterSpacing}
                    onSelectionChange={handleCellChange}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
