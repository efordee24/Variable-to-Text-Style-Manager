export type PropertyKey = "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "letterSpacing";

export interface VariableRef {
  id: string;
  name: string;
  collectionId: string;
  value: number | string;
  valueType: "number" | "string";
}

export interface StyleRow {
  styleId: string;
  styleName: string;
  current: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number | string;
    lineHeight?: number | "AUTO";
    letterSpacing?: number;
  };
  autoMatch: Partial<Record<PropertyKey, string>>;
  selection: Partial<Record<PropertyKey, string>>;
  bindability: Partial<Record<PropertyKey, boolean>>;
}

export interface VariableCollection {
  id: string;
  name: string;
  variables: VariableRef[];
}

export interface TableData {
  styles: StyleRow[];
  collections: VariableCollection[];
  propertyCollections: Partial<Record<PropertyKey, string>>;
}

// IPC Message Types
export interface InitRequest {
  type: 'INIT_REQUEST';
}

export interface SetCollectionForProperty {
  type: 'SET_COLLECTION_FOR_PROPERTY';
  property: PropertyKey;
  collectionId: string;
}

export interface RequestRescan {
  type: 'REQUEST_RESCAN';
}

export interface RequestBulkUpdate {
  type: 'REQUEST_BULK_UPDATE';
  updates: Array<{
    styleId: string;
    property: PropertyKey;
    variableId: string;
  }>;
}

export interface RequestExportCSV {
  type: 'REQUEST_EXPORT_CSV';
}

export interface InitData {
  type: 'INIT_DATA';
  data: TableData;
}

export interface TableDataMessage {
  type: 'TABLE_DATA';
  data: TableData;
}

export interface ToastMessage {
  type: 'TOAST';
  message: string;
  variant: 'success' | 'error' | 'info';
}

export interface CSVReadyMessage {
  type: 'CSV_READY';
  csv: string;
}

export type UIMessage = InitRequest | SetCollectionForProperty | RequestRescan | RequestBulkUpdate | RequestExportCSV;
export type WorkerMessage = InitData | TableDataMessage | ToastMessage | CSVReadyMessage;
