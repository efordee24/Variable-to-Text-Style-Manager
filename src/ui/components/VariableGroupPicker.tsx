import React from 'react';
import { PropertyKey, VariableCollection } from '../../types';

interface VariableGroupPickerProps {
  label: string;
  property: PropertyKey;
  collections: VariableCollection[];
  selectedCollectionId?: string;
  onCollectionChange: (property: PropertyKey, collectionId: string) => void;
}

export function VariableGroupPicker({
  label,
  property,
  collections,
  selectedCollectionId,
  onCollectionChange,
}: VariableGroupPickerProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const collectionId = event.target.value;
    if (collectionId) {
      onCollectionChange(property, collectionId);
    }
  };

  return (
    <div className="variable-group-picker">
      <label className="picker-label">{label}</label>
      <select
        value={selectedCollectionId || ''}
        onChange={handleChange}
        className="picker-select"
      >
        <option value="">Select collection...</option>
        {collections.map(collection => (
          <option key={collection.id} value={collection.id}>
            {collection.name} ({collection.variables.length} variables)
          </option>
        ))}
      </select>
    </div>
  );
}
