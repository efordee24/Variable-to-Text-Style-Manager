# Figma Plugin Prompt: Bulk Apply Variables to Text Styles

You are building a **Figma Design plugin with a custom UI**. The plugin’s goal is to **bulk apply selected Variables to existing Text Styles** in the current file. It should auto-match variables by value, allow manual overrides in a table UI, and then **bulk update** all styles.

---

## TL;DR – What to build
- Figma **Design** plugin (not Dev Mode), with custom React UI.
- Reads **Text Styles** and **Variables** (by Variable Collections / Groups).
- Auto-matches variables to style properties by comparing **variable value == style property value** (in the active mode).
- UI shows a **table** of text styles (rows) vs properties (columns), indicating auto matches + allowing manual selection.
- A **Bulk Update** button binds the chosen variables to the respective text style properties.

---

## Requirements & Details

### Properties to support
Try to support these text style properties (bind to variables where the API allows; if not bindable, mark as “not bindable” and skip in the update):
- **Font Family** (string)
- **Font Size** (number)
- **Font Weight** (number or string)
- **Line Height** (number or “AUTO” / unit variants)
- **Letter Spacing** (number)

### Variable sources
- Read all **VariableCollections** and their **Variables** in the file.
- Respect **modes** (use the currently active mode for value reads and equality checks).
- Filter variables by **value type** compatible with the target property (e.g., numeric variables for size/line-height/letter-spacing; string for font family).

### Auto-match logic
1. Compute the style’s current property value.
2. From the selected **Variable Group** for property, find variables whose **resolved value in the active mode** equals the style’s property value.
3. Auto-select matches; flag conflicts or missing matches.

### Manual override
- Each cell provides a **combobox** listing compatible variables.
- Typing filters by variable name.
- Show variable **name** and resolved **value**.

### Variable Group selection per property
- One dropdown per property (Font, Size, Weight, Line Height, Letter Spacing).

### Bulk Update
- “Update Styles” applies selected variable bindings.
- Skips unselected or unbindable properties.
- Shows toast summary (e.g., “Updated 12 styles · 31 bindings”).

---

## UX Notes
- Table columns: **Style name**, **Font**, **Size**, **Weight**, **Line Height**, **Letter Spacing**.
- Buttons: **Reload**, **Export CSV**, **Update Styles**.
- Include toasts, hints, and empty states.

---

## Technical Setup

### Stack
- **TypeScript + React + Vite**
- IPC: `window.postMessage` between `ui.html` and `code.ts`
- **ESLint + Prettier**

### Suggested File Structure
```
figma-variable-style-binder/
├─ manifest.json
├─ package.json
├─ tsconfig.json
├─ src/
│  ├─ code.ts
│  ├─ bridge.ts
│  ├─ figma-api.ts
│  ├─ matching.ts
│  ├─ types.ts
│  ├─ ui/
│  │  ├─ index.html
│  │  ├─ main.tsx
│  │  ├─ App.tsx
│  │  ├─ components/
│  │  │  ├─ VariableGroupPicker.tsx
│  │  │  ├─ StyleTable.tsx
│  │  │  ├─ CellSelector.tsx
│  │  │  ├─ Toast.tsx
│  │  │  └─ EmptyState.tsx
│  │  └─ styles.css
└─ vite.config.ts
```

### manifest.json (v2)
```json
{
  "api": "1.0.0",
  "editorType": ["figma"],
  "ui": "dist/ui/index.html",
  "main": "dist/code.js",
  "name": "Variable Binder for Text Styles",
  "id": "your.plugin.id",
  "documentAccess": "dynamic",
  "networkAccess": { "allowedDomains": [] }
}
```

---

## Data Model (Shared Types)
```ts
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
```

---

## IPC Contract
**UI → Worker:**
- `INIT_REQUEST`
- `SET_COLLECTION_FOR_PROPERTY`
- `REQUEST_RESCAN`
- `REQUEST_BULK_UPDATE`
- `REQUEST_EXPORT_CSV`

**Worker → UI:**
- `INIT_DATA`
- `TABLE_DATA`
- `TOAST`
- `CSV_READY`

---

## Implementation Hints
- Use `figma.getLocalTextStylesAsync()` and `figma.variables.getLocalVariablesAsync()`.
- Compare normalized property values and variable values for matching.
- Use the latest Figma Variables API methods for binding variables.
- Export mapping as CSV for audit.

---

## Acceptance Criteria
1. Lists text styles and variables.
2. Allows variable group selection per property.
3. Auto-matches correctly; manual override possible.
4. Applies bindings in bulk with summary toast.
5. Supports reload and CSV export.
6. Graceful handling of no styles or no variables.

---

## Developer Notes
- Use **TypeScript** and strong typing for IPC.
- Modularize logic (API, matching, UI).
- Handle API permission errors gracefully.
- Include a minimal **README.md** for setup instructions.

---

**End of Prompt**
