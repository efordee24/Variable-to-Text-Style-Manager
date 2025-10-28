import React, { useState, useEffect } from 'react';
import { TableData, PropertyKey, StyleRow, VariableCollection } from '../types';
import { VariableGroupPicker } from './components/VariableGroupPicker';
import { StyleTable } from './components/StyleTable';
import { Toast } from './components/Toast';
import { EmptyState } from './components/EmptyState';

interface ToastState {
  message: string;
  variant: 'success' | 'error' | 'info';
  visible: boolean;
}

export default function App() {
  const [data, setData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({
    message: '',
    variant: 'info',
    visible: false,
  });

  useEffect(() => {
    // Initialize the plugin
    sendMessage({ type: 'INIT_REQUEST' });
  }, []);

  useEffect(() => {
    // Listen for messages from the worker
    const handleMessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;
      
      switch (message.type) {
        case 'INIT_DATA':
        case 'TABLE_DATA':
          setData(message.data);
          setLoading(false);
          break;
        case 'TOAST':
          setToast({
            message: message.message,
            variant: message.variant,
            visible: true,
          });
          setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
          break;
        case 'CSV_READY':
          downloadCSV(message.csv);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sendMessage = (message: any) => {
    parent.postMessage({ pluginMessage: message }, '*');
  };

  const handlePropertyCollectionChange = (property: PropertyKey, collectionId: string) => {
    sendMessage({
      type: 'SET_COLLECTION_FOR_PROPERTY',
      property,
      collectionId,
    });
  };

  const handleReload = () => {
    setLoading(true);
    sendMessage({ type: 'REQUEST_RESCAN' });
  };

  const handleExportCSV = () => {
    sendMessage({ type: 'REQUEST_EXPORT_CSV' });
  };

  const handleBulkUpdate = (updates: Array<{ styleId: string; property: PropertyKey; variableId: string }>) => {
    sendMessage({
      type: 'REQUEST_BULK_UPDATE',
      updates,
    });
  };

  const downloadCSV = (csv: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-styles-export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading text styles and variables...</p>
        </div>
      </div>
    );
  }

  if (!data || data.styles.length === 0) {
    return (
      <div className="app">
        <EmptyState />
        <Toast {...toast} />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Variable Binder for Text Styles</h1>
        <div className="header-actions">
          <button onClick={handleReload} className="btn btn-secondary">
            Reload
          </button>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            Export CSV
          </button>
        </div>
      </div>

      <div className="property-selectors">
        <h2>Variable Collections</h2>
        <div className="selector-grid">
          <VariableGroupPicker
            label="Font Family"
            property="fontFamily"
            collections={data.collections}
            selectedCollectionId={data.propertyCollections.fontFamily}
            onCollectionChange={handlePropertyCollectionChange}
          />
          <VariableGroupPicker
            label="Font Size"
            property="fontSize"
            collections={data.collections}
            selectedCollectionId={data.propertyCollections.fontSize}
            onCollectionChange={handlePropertyCollectionChange}
          />
          <VariableGroupPicker
            label="Font Weight"
            property="fontWeight"
            collections={data.collections}
            selectedCollectionId={data.propertyCollections.fontWeight}
            onCollectionChange={handlePropertyCollectionChange}
          />
          <VariableGroupPicker
            label="Line Height"
            property="lineHeight"
            collections={data.collections}
            selectedCollectionId={data.propertyCollections.lineHeight}
            onCollectionChange={handlePropertyCollectionChange}
          />
          <VariableGroupPicker
            label="Letter Spacing"
            property="letterSpacing"
            collections={data.collections}
            selectedCollectionId={data.propertyCollections.letterSpacing}
            onCollectionChange={handlePropertyCollectionChange}
          />
        </div>
      </div>

      <div className="table-container">
        <StyleTable
          styles={data.styles}
          collections={data.collections}
          onBulkUpdate={handleBulkUpdate}
        />
      </div>

      <Toast {...toast} />
    </div>
  );
}
