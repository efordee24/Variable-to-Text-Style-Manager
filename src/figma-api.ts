import { VariableRef, VariableCollection, StyleRow, PropertyKey } from './types';

export class FigmaAPI {
  async getTextStyles(): Promise<StyleRow[]> {
    try {
      const textStyles = await figma.getLocalTextStylesAsync();
      
      return textStyles.map(style => {
        const current: StyleRow['current'] = {};
        
        // Extract current property values
        if (style.fontName) {
          current.fontFamily = style.fontName.family;
          current.fontWeight = style.fontName.style;
        }
        
        if (style.fontSize !== figma.mixed) {
          current.fontSize = style.fontSize;
        }
        
        if (style.lineHeight !== figma.mixed) {
          if (typeof style.lineHeight === 'number') {
            current.lineHeight = style.lineHeight;
          } else if (style.lineHeight.unit === 'AUTO') {
            current.lineHeight = 'AUTO';
          } else {
            current.lineHeight = style.lineHeight.value;
          }
        }
        
        if (style.letterSpacing !== figma.mixed) {
          if (typeof style.letterSpacing === 'number') {
            current.letterSpacing = style.letterSpacing;
          } else {
            current.letterSpacing = style.letterSpacing.value;
          }
        }

        return {
          styleId: style.id,
          styleName: style.name,
          current,
          autoMatch: {},
          selection: {},
          bindability: {
            fontFamily: true,
            fontSize: true,
            fontWeight: true,
            lineHeight: true,
            letterSpacing: true,
          },
        };
      });
    } catch (error) {
      console.error('Error fetching text styles:', error);
      return [];
    }
  }

  async getVariableCollections(): Promise<VariableCollection[]> {
    try {
      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      
      return collections.map(collection => ({
        id: collection.id,
        name: collection.name,
        variables: collection.variables.map(variable => ({
          id: variable.id,
          name: variable.name,
          collectionId: collection.id,
          value: this.getVariableValue(variable),
          valueType: variable.resolvedType === 'VARIABLE_ALIAS' ? 'string' : variable.resolvedType,
        })),
      }));
    } catch (error) {
      console.error('Error fetching variable collections:', error);
      return [];
    }
  }

  private getVariableValue(variable: Variable): number | string {
    try {
      const mode = variable.valuesByMode;
      const activeMode = Object.keys(mode)[0]; // Get first mode as active
      const value = mode[activeMode];
      
      if (typeof value === 'object' && 'type' in value) {
        if (value.type === 'VARIABLE_ALIAS') {
          return value.id; // Return the referenced variable ID
        }
        return value.value;
      }
      
      return value as number | string;
    } catch (error) {
      console.error('Error getting variable value:', error);
      return '';
    }
  }

  async bindVariableToStyle(styleId: string, property: PropertyKey, variableId: string): Promise<boolean> {
    try {
      const style = await figma.getStyleByIdAsync(styleId);
      if (!style) return false;

      const variable = await figma.variables.getVariableByIdAsync(variableId);
      if (!variable) return false;

      // Apply the variable binding based on the property
      switch (property) {
        case 'fontSize':
          if (style.type === 'TEXT') {
            style.fontSize = variable;
          }
          break;
        case 'lineHeight':
          if (style.type === 'TEXT') {
            style.lineHeight = variable;
          }
          break;
        case 'letterSpacing':
          if (style.type === 'TEXT') {
            style.letterSpacing = variable;
          }
          break;
        // Note: Font family and weight binding may not be supported by Figma API
        case 'fontFamily':
        case 'fontWeight':
          console.warn(`Variable binding not supported for ${property}`);
          return false;
      }

      return true;
    } catch (error) {
      console.error('Error binding variable to style:', error);
      return false;
    }
  }

  async exportCSV(styles: StyleRow[]): Promise<string> {
    const headers = ['Style Name', 'Font Family', 'Font Size', 'Font Weight', 'Line Height', 'Letter Spacing'];
    const rows = styles.map(style => [
      style.styleName,
      style.current.fontFamily || '',
      style.current.fontSize?.toString() || '',
      style.current.fontWeight?.toString() || '',
      style.current.lineHeight?.toString() || '',
      style.current.letterSpacing?.toString() || '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }
}
