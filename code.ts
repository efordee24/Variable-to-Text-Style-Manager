import { MessageBridge } from './src/bridge';
import { FigmaAPI } from './src/figma-api';
import { MatchingEngine } from './src/matching';
import { UIMessage, TableData, PropertyKey } from './src/types';

// Initialize the plugin
const bridge = new MessageBridge();
const figmaAPI = new FigmaAPI();
const matchingEngine = new MatchingEngine();

// Show the UI
figma.showUI(__html__, { width: 800, height: 600 });

// Handle initialization
bridge.onMessage('INIT_REQUEST', async () => {
  try {
    const [styles, collections] = await Promise.all([
      figmaAPI.getTextStyles(),
      figmaAPI.getVariableCollections(),
    ]);

    matchingEngine.setCollections(collections);

    const data: TableData = {
      styles,
      collections,
      propertyCollections: {},
    };

    bridge.sendToUI({
      type: 'INIT_DATA',
      data,
    });
  } catch (error) {
    bridge.showToast('Failed to load data: ' + (error as Error).message, 'error');
  }
});

// Handle property collection selection
bridge.onMessage('SET_COLLECTION_FOR_PROPERTY', (message) => {
  matchingEngine.setPropertyCollection(message.property, message.collectionId);
});

// Handle rescan request
bridge.onMessage('REQUEST_RESCAN', async () => {
  try {
    const [styles, collections] = await Promise.all([
      figmaAPI.getTextStyles(),
      figmaAPI.getVariableCollections(),
    ]);

    matchingEngine.setCollections(collections);
    const autoMatchedStyles = matchingEngine.autoMatchStyles(styles);

    const data: TableData = {
      styles: autoMatchedStyles,
      collections,
      propertyCollections: {
        fontFamily: matchingEngine.getPropertyCollection('fontFamily'),
        fontSize: matchingEngine.getPropertyCollection('fontSize'),
        fontWeight: matchingEngine.getPropertyCollection('fontWeight'),
        lineHeight: matchingEngine.getPropertyCollection('lineHeight'),
        letterSpacing: matchingEngine.getPropertyCollection('letterSpacing'),
      },
    };

    bridge.sendToUI({
      type: 'TABLE_DATA',
      data,
    });

    bridge.showToast('Data refreshed successfully', 'success');
  } catch (error) {
    bridge.showToast('Failed to refresh data: ' + (error as Error).message, 'error');
  }
});

// Handle bulk update
bridge.onMessage('REQUEST_BULK_UPDATE', async (message) => {
  try {
    let successCount = 0;
    let totalBindings = 0;

    for (const update of message.updates) {
      const success = await figmaAPI.bindVariableToStyle(
        update.styleId,
        update.property,
        update.variableId
      );
      
      if (success) {
        successCount++;
      }
      totalBindings++;
    }

    bridge.showToast(
      `Updated ${successCount} styles · ${totalBindings} bindings`,
      successCount > 0 ? 'success' : 'error'
    );
  } catch (error) {
    bridge.showToast('Failed to update styles: ' + (error as Error).message, 'error');
  }
});

// Handle CSV export
bridge.onMessage('REQUEST_EXPORT_CSV', async (message) => {
  try {
    const styles = await figmaAPI.getTextStyles();
    const csv = await figmaAPI.exportCSV(styles);
    
    bridge.sendToUI({
      type: 'CSV_READY',
      csv,
    });
  } catch (error) {
    bridge.showToast('Failed to export CSV: ' + (error as Error).message, 'error');
  }
});
