// Simple JavaScript version for Figma compatibility
figma.showUI(__html__, { width: 900, height: 600, title: "Variable Binder for Text Styles" });

// Auto-initialize when UI loads
setTimeout(function() {
  handleInit().catch(function(error) {
    console.error('Auto-init failed:', error);
    figma.ui.postMessage({
      type: 'TOAST',
      message: 'Failed to load data: ' + error.message,
      variant: 'error'
    });
  });
}, 100);

// Simple message handling
figma.ui.onmessage = function(msg) {
  if (msg.type === 'INIT_REQUEST') {
    handleInit().catch(function(error) {
      console.error('Init failed:', error);
      figma.ui.postMessage({
        type: 'TOAST',
        message: 'Failed to load data: ' + error.message,
        variant: 'error'
      });
    });
  } else if (msg.type === 'REQUEST_RESCAN') {
    handleRescan().catch(function(error) {
      console.error('Rescan failed:', error);
      figma.ui.postMessage({
        type: 'TOAST',
        message: 'Failed to rescan data: ' + error.message,
        variant: 'error'
      });
    });
  } else if (msg.type === 'REQUEST_BULK_UPDATE') {
    handleBulkUpdate(msg).catch(function(error) {
      console.error('Bulk update failed:', error);
      figma.ui.postMessage({
        type: 'TOAST',
        message: 'Bulk update failed: ' + error.message,
        variant: 'error'
      });
    });
  } else if (msg.type === 'REQUEST_EXPORT_CSV') {
    handleExportCSV();
  } else if (msg.type === 'RESIZE') {
    var w = Math.max(400, Math.min(1400, Math.round(msg.width)));
    var h = Math.max(300, Math.min(1200, Math.round(msg.height)));
    figma.ui.resize(w, h);
    figma.clientStorage.setAsync("uiSize", { w: w, h: h });
  } else if (msg.type === 'READY') {
    figma.clientStorage.getAsync("uiSize").then(function(size) {
      if (size) {
        figma.ui.resize(size.w, size.h);
      }
    });
  }
};

async function handleInit() {
  try {
    // Load variable collections first, then text styles
    var collections = await figma.variables.getLocalVariableCollectionsAsync();
    
    // Process variable collections
    var variableCollections = [];
    for (const collection of collections) {
      var variables = [];
      for (const variableId of collection.variableIds) {
        var variable = await figma.variables.getVariableByIdAsync(variableId);
        variables.push({
          id: variable.id,
          name: variable.name,
          collectionId: collection.id,
          value: getVariableValue(variable),
          valueType: variable.resolvedType
        });
      }
      variableCollections.push({
        id: collection.id,
        name: collection.name,
        variables: variables
      });
    }

    // Extract group paths from variables
    var groupPaths = extractGroupPaths(variableCollections);

    // Now load text styles
    var textStyles = await figma.getLocalTextStylesAsync();

    for (const style of textStyles) {
      if (style.boundVariables) {
        for (const field in style.boundVariables) {
          const alias = (style.boundVariables)[field];
        }
      }
    }

    // Process text styles
    var styles = textStyles.map(function(style) {
      return {
        styleId: style.id,
        styleName: style.name,
        current: {
          fontFamily: {
            value: style.fontName ? style.fontName.family : undefined,
            variableId: (style.boundVariables && style.boundVariables.fontFamily && style.boundVariables.fontFamily.id) || null
          },
          fontSize: {
            value: style.fontSize !== figma.mixed ? style.fontSize : undefined,
            variableId: (style.boundVariables && style.boundVariables.fontSize && style.boundVariables.fontSize.id) || null
          },
          fontWeight: {
            value: style.fontName ? style.fontName.style : undefined,
            variableId: (style.boundVariables && style.boundVariables.fontWeight && style.boundVariables.fontWeight.id) || null
          },
          lineHeight: {
            value: style.lineHeight !== figma.mixed ? style.lineHeight : undefined,
            variableId: (style.boundVariables && style.boundVariables.lineHeight && style.boundVariables.lineHeight.id) || null
          },
          letterSpacing: {
            value: style.letterSpacing !== figma.mixed ? style.letterSpacing : undefined,
            variableId: (style.boundVariables && style.boundVariables.letterSpacing && style.boundVariables.letterSpacing.id) || null
          }
        }
      };
    });

    // Send data to UI
    figma.ui.postMessage({
      type: 'INIT_DATA',
      data: {
        styles: styles,
        collections: variableCollections,
        groupPaths: groupPaths,
        propertyCollections: {}
      }
    });
  } catch (error) {
    figma.ui.postMessage({
      type: 'TOAST',
      message: 'Failed to load data: ' + error.message,
      variant: 'error'
    });
  }
}

async function handleRescan() {
  await handleInit();
}

async function handleBulkUpdate(msg) {
  try {
    if (!msg.changes || Object.keys(msg.changes).length === 0) {
      figma.ui.postMessage({
        type: 'TOAST',
        message: 'No changes to apply',
        variant: 'info'
      });
      return;
    }
    
    var updatedCount = 0;
    var errorCount = 0;
    
    // Process each style change
    for (const styleId of Object.keys(msg.changes)) {
      try {
        var styleChanges = msg.changes[styleId];
        var textStyle = await figma.getStyleByIdAsync(styleId);
        
        if (!textStyle) {
          console.error('Text style not found:', styleId);
          errorCount++;
          continue;
        }
        
        // Process each property change
        for (const propertyType of Object.keys(styleChanges)) {
          var variableId = styleChanges[propertyType];
          var variable = await figma.variables.getVariableByIdAsync(variableId);
          
          if (!variable) {
            console.error('Variable not found:', variableId);
            errorCount++;
            continue;
          }
          
          // Apply variable to the appropriate property
          if (propertyType === 'fontFamily') {
            textStyle.setBoundVariable('fontFamily', variable);
          } else if (propertyType === 'fontSize') {
            textStyle.setBoundVariable('fontSize', variable);
          } else if (propertyType === 'fontWeight') {
            textStyle.setBoundVariable('fontWeight', variable);
          } else if (propertyType === 'lineHeight') {
            textStyle.setBoundVariable('lineHeight', variable);
          } else if (propertyType === 'letterSpacing') {
            textStyle.setBoundVariable('letterSpacing', variable);
          }
        }
        
        updatedCount++;
      } catch (error) {
        console.error('Error updating style:', styleId, error);
        errorCount++;
      }
    }
    
    // Send success message
    var message = 'Updated ' + updatedCount + ' text style(s)';
    if (errorCount > 0) {
      message += ' (' + errorCount + ' errors)';
    }
    
    figma.ui.postMessage({
      type: 'TOAST',
      message: message,
      variant: errorCount > 0 ? 'warning' : 'success'
    });
    
    // Refresh the data to show updated styles
    handleInit();
    
  } catch (error) {
    console.error('Bulk update error:', error);
    figma.ui.postMessage({
      type: 'TOAST',
      message: 'Bulk update failed: ' + error.message,
      variant: 'error'
    });
  }
}


function handleExportCSV() {
  figma.getLocalTextStylesAsync().then(function(styles) {
    var csv = 'Style Name,Font Family,Font Size,Font Weight,Line Height,Letter Spacing\n';
    
    styles.forEach(function(style) {
      var row = [
        style.name,
        style.fontName ? style.fontName.family : '',
        style.fontSize !== figma.mixed ? style.fontSize.toString() : '',
        style.fontName ? style.fontName.style : '',
        style.lineHeight !== figma.mixed ? style.lineHeight.toString() : '',
        style.letterSpacing !== figma.mixed ? style.letterSpacing.toString() : ''
      ];
      csv += row.map(function(cell) { return '"' + cell + '"'; }).join(',') + '\n';
    });

    figma.ui.postMessage({
      type: 'CSV_READY',
      csv: csv
    });
  });
}

function getVariableValue(variable) {
  try {
    var mode = variable.valuesByMode;
    var activeMode = Object.keys(mode)[0];
    var value = mode[activeMode];
    
    if (typeof value === 'object' && value.type === 'VARIABLE_ALIAS') {
      return value.id;
    }
    return value;
  } catch (error) {
    return '';
  }
}

function extractGroupPaths(collections) {
  var groupPaths = {};
  
  collections.forEach(function(collection) {
    collection.variables.forEach(function(variable) {
      // Get the variable's group path from Figma API
      var groupPath = getVariableGroupPath(variable);
      if (groupPath) {
        // Flatten to maximum 2 levels
        var flattenedPath = flattenToTwoLevels(groupPath);
        
        if (!groupPaths[flattenedPath]) {
          groupPaths[flattenedPath] = {
            path: flattenedPath,
            variables: [],
            collectionName: collection.name
          };
        }
        groupPaths[flattenedPath].variables.push(variable);
      }
    });
  });
  
  return groupPaths;
}

// New function to flatten paths to maximum 2 levels
function flattenToTwoLevels(path) {
  var parts = path.split('/');
  
  if (parts.length <= 2) {
    // Already 2 levels or less, return as is
    return path;
  } else {
    // More than 2 levels, combine everything after level 2
    var level1 = parts[0];
    var level2 = parts[1];
    
    // Return as "Level1/Level2" (sub-levels are included in variables)
    return level1 + '/' + level2;
  }
}

function getVariableGroupPath(variable) {
  try {
    // Extract group path from variable name
    // Variables like "Utilities/Font Size/xs" should become "Utilities/Font Size"
    if (variable.name && variable.name.includes('/')) {
      var nameParts = variable.name.split('/');
      if (nameParts.length > 2) {
        // Remove the last part (variable name) to get the group path
        return nameParts.slice(0, -1).join('/');
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting variable group path:', error);
    return null;
  }
}
