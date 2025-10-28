import { StyleRow, VariableRef, PropertyKey, VariableCollection } from './types';

export class MatchingEngine {
  private collections: VariableCollection[] = [];
  private propertyCollections: Partial<Record<PropertyKey, string>> = {};

  setCollections(collections: VariableCollection[]) {
    this.collections = collections;
  }

  setPropertyCollection(property: PropertyKey, collectionId: string) {
    this.propertyCollections[property] = collectionId;
  }

  getPropertyCollection(property: PropertyKey): string | undefined {
    return this.propertyCollections[property];
  }

  getVariablesForProperty(property: PropertyKey): VariableRef[] {
    const collectionId = this.propertyCollections[property];
    if (!collectionId) return [];

    const collection = this.collections.find(c => c.id === collectionId);
    if (!collection) return [];

    // Filter variables by value type compatibility
    return collection.variables.filter(variable => {
      switch (property) {
        case 'fontFamily':
          return variable.valueType === 'string';
        case 'fontSize':
        case 'fontWeight':
        case 'lineHeight':
        case 'letterSpacing':
          return variable.valueType === 'number';
        default:
          return false;
      }
    });
  }

  autoMatchStyles(styles: StyleRow[]): StyleRow[] {
    return styles.map(style => {
      const autoMatch: Partial<Record<PropertyKey, string>> = {};

      // Auto-match each property
      (Object.keys(style.current) as PropertyKey[]).forEach(property => {
        const currentValue = style.current[property];
        if (currentValue === undefined) return;

        const variables = this.getVariablesForProperty(property);
        const match = this.findBestMatch(currentValue, variables);
        
        if (match) {
          autoMatch[property] = match.id;
        }
      });

      return {
        ...style,
        autoMatch,
        selection: { ...autoMatch }, // Initialize selection with auto-matches
      };
    });
  }

  private findBestMatch(currentValue: any, variables: VariableRef[]): VariableRef | null {
    // Normalize values for comparison
    const normalizedCurrent = this.normalizeValue(currentValue);
    
    for (const variable of variables) {
      const normalizedVariable = this.normalizeValue(variable.value);
      if (normalizedCurrent === normalizedVariable) {
        return variable;
      }
    }

    return null;
  }

  private normalizeValue(value: any): string | number {
    if (typeof value === 'string') {
      return value.toLowerCase().trim();
    }
    if (typeof value === 'number') {
      return Math.round(value * 1000) / 1000; // Round to 3 decimal places
    }
    if (value === 'AUTO') {
      return 'auto';
    }
    return value;
  }

  getCompatibleVariables(property: PropertyKey, currentValue: any): VariableRef[] {
    const variables = this.getVariablesForProperty(property);
    const normalizedCurrent = this.normalizeValue(currentValue);
    
    return variables.filter(variable => {
      const normalizedVariable = this.normalizeValue(variable.value);
      return normalizedCurrent === normalizedVariable;
    });
  }

  getAllVariablesForProperty(property: PropertyKey): VariableRef[] {
    return this.getVariablesForProperty(property);
  }
}
